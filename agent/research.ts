import { revalidatePath } from "next/cache";
import OpenAI from "openai";
import { z } from "zod";
import type { InsForgeClient } from "@insforge/sdk";
import { createBrowserbaseResearchSession, hasBrowserbaseConfig } from "@/lib/browserbase";
import { capturePostHogServerEvent } from "@/lib/posthog-server";
import { createResearchStagehand } from "@/lib/stagehand";
import type { CompanyResearchDossier } from "@/types/companyResearch";
import { parseCompanyResearchDossier } from "@/types/companyResearch";
import type { ProfileForMatching } from "@/types/jobs";

type ResearchCompanyResult =
  | {
      success: true;
      dossier: CompanyResearchDossier;
    }
  | {
      success: false;
      error: string;
    };

export type JobForResearch = {
  id: string;
  title: string;
  company: string;
  sourceUrl: string;
  externalApplyUrl: string;
  aboutRole: string;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
};

type HomepageResearch = {
  url: string;
  oneLiner: string;
  productSummary: string;
  signals: string[];
  pageLinks: ResearchPageLink[];
};

type ResearchPageLink = {
  url: string;
  kind: "about" | "careers" | "blog" | "engineering" | "product" | "team" | "other";
};

type SubPageResearch = {
  url: string;
  kind: ResearchPageLink["kind"];
  keyPoints: string[];
  technologies: string[];
  valuesOrCulture: string[];
  notable: string[];
};

type CompanyWebsiteResearch = {
  homepageUrl: string;
  homepage: HomepageResearch | null;
  pages: SubPageResearch[];
};

const homepageSchema = z.object({
  oneLiner: z.string(),
  productSummary: z.string(),
  signals: z.array(z.string()),
  pageLinks: z.array(
    z.object({
      url: z.string(),
      kind: z.enum(["about", "careers", "blog", "engineering", "product", "team", "other"]),
    }),
  ),
});

const subPageSchema = z.object({
  keyPoints: z.array(z.string()),
  technologies: z.array(z.string()),
  valuesOrCulture: z.array(z.string()),
  notable: z.array(z.string()),
});

export async function researchCompanyForJob(
  insforge: InsForgeClient,
  userId: string,
  job: JobForResearch,
  profile: ProfileForMatching,
): Promise<ResearchCompanyResult> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: "Company research is not configured yet.",
    };
  }

  let websiteResearch: CompanyWebsiteResearch = {
    homepageUrl: "",
    homepage: null,
    pages: [],
  };

  if (hasBrowserbaseConfig()) {
    const browserResult = await researchCompanyWebsite(insforge, userId, job);
    if (browserResult.success) {
      websiteResearch = browserResult.research;
    } else {
      await logResearchError(insforge, userId, job.id, browserResult.error);
    }
  } else {
    await logResearchError(insforge, userId, job.id, "Browserbase is not configured. Using job and profile fallback.");
  }

  const synthesisResult = await synthesizeDossier(job, profile, websiteResearch);
  if (!synthesisResult.success) {
    await logResearchError(insforge, userId, job.id, synthesisResult.error);
    return {
      success: false,
      error: "Could not research this company right now. Please try again.",
    };
  }

  const { error } = await insforge.database
    .from("jobs")
    .update({ company_research: synthesisResult.dossier })
    .eq("id", job.id)
    .eq("user_id", userId);

  if (error) {
    console.error("[agent/research] Failed to save company research", error.message);
    await logResearchError(insforge, userId, job.id, "Could not save company research.");
    return {
      success: false,
      error: "Could not save company research. Please try again.",
    };
  }

  await captureCompanyResearched(userId, job.id, job.company);
  revalidatePath(`/find-jobs/${job.id}`);

  return {
    success: true,
    dossier: synthesisResult.dossier,
  };
}

async function researchCompanyWebsite(
  insforge: InsForgeClient,
  userId: string,
  job: JobForResearch,
): Promise<{ success: true; research: CompanyWebsiteResearch } | { success: false; error: string }> {
  let stagehand: ReturnType<typeof createResearchStagehand> | null = null;

  try {
    const homepageUrl = await deriveHomepageUrl(job);
    const session = await createBrowserbaseResearchSession(job.id);
    stagehand = createResearchStagehand(session.id);
    await stagehand.init();

    const page = stagehand.context.activePage() ?? (await stagehand.context.newPage());
    await page.goto(homepageUrl, { waitUntil: "domcontentloaded", timeoutMs: 30_000 });

    const homepage = await extractHomepageResearch(stagehand, homepageUrl);
    if (!homepage.oneLiner && !homepage.productSummary) {
      return {
        success: true,
        research: {
          homepageUrl,
          homepage: null,
          pages: [],
        },
      };
    }

    const pages: SubPageResearch[] = [];
    for (const link of selectResearchLinks(homepage.pageLinks, homepageUrl)) {
      try {
        await page.goto(link.url, { waitUntil: "domcontentloaded", timeoutMs: 30_000 });
        pages.push(await extractSubPageResearch(stagehand, link));
      } catch (error) {
        console.error("[agent/research] Failed to extract sub-page", error);
        await logResearchError(insforge, userId, job.id, `Could not research ${link.kind} page.`);
      }
    }

    return {
      success: true,
      research: {
        homepageUrl,
        homepage,
        pages,
      },
    };
  } catch (error) {
    console.error("[agent/research] Browser research failed", error);
    return {
      success: false,
      error: "Browser research failed. Using job and profile fallback.",
    };
  } finally {
    if (stagehand) {
      try {
        await stagehand.close();
      } catch (error) {
        console.error("[agent/research] Failed to close Stagehand session", error);
      }
    }
  }
}

async function deriveHomepageUrl(job: JobForResearch): Promise<string> {
  const fallback = createCompanyFallbackUrl(job.company);
  const redirectUrl = job.externalApplyUrl || job.sourceUrl;

  if (!redirectUrl) return fallback;

  try {
    const response = await fetch(redirectUrl, { method: "GET", redirect: "follow" });
    const finalUrl = response.url;
    const parsed = new URL(finalUrl);

    if (parsed.hostname.includes("adzuna.com")) {
      return fallback;
    }

    return `https://${getRootDomain(parsed.hostname)}`;
  } catch (error) {
    console.error("[agent/research] Failed to derive homepage URL", error);
    return fallback;
  }
}

async function extractHomepageResearch(stagehand: ReturnType<typeof createResearchStagehand>, url: string): Promise<HomepageResearch> {
  const result = await stagehand.extract(
    "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
    homepageSchema,
  );

  return {
    url,
    oneLiner: result.oneLiner.trim(),
    productSummary: result.productSummary.trim(),
    signals: cleanStringArray(result.signals),
    pageLinks: result.pageLinks.map((link) => ({
      url: link.url.trim(),
      kind: link.kind,
    })),
  };
}

async function extractSubPageResearch(
  stagehand: ReturnType<typeof createResearchStagehand>,
  link: ResearchPageLink,
): Promise<SubPageResearch> {
  const result = await stagehand.extract(
    "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
    subPageSchema,
  );

  return {
    url: link.url,
    kind: link.kind,
    keyPoints: cleanStringArray(result.keyPoints),
    technologies: cleanStringArray(result.technologies),
    valuesOrCulture: cleanStringArray(result.valuesOrCulture),
    notable: cleanStringArray(result.notable),
  };
}

async function synthesizeDossier(
  job: JobForResearch,
  profile: ProfileForMatching,
  websiteResearch: CompanyWebsiteResearch,
): Promise<{ success: true; dossier: CompanyResearchDossier } | { success: false; error: string }> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 900,
      messages: [
        {
          role: "system",
          content: createSynthesisSystemPrompt(),
        },
        {
          role: "user",
          content: createSynthesisUserPrompt(job, profile, websiteResearch),
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      return {
        success: false,
        error: "Company research synthesis returned no content.",
      };
    }

    const dossier = parseSynthesisJson(content);
    if (!dossier) {
      return {
        success: false,
        error: "Company research synthesis returned invalid JSON.",
      };
    }

    return {
      success: true,
      dossier,
    };
  } catch (error) {
    console.error("[agent/research] Synthesis failed", error);
    return {
      success: false,
      error: "Company research synthesis failed.",
    };
  }
}

function createSynthesisSystemPrompt(): string {
  return `You are a sharp career strategist preparing a candidate to apply for a specific role. You are given (a) research collected from the company's own website, (b) the job posting, and (c) the candidate's profile. Produce a concise, concrete briefing that gives this specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent funding, customers, headcount, or facts. If research was thin, infer carefully from the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid JSON matching this shape:
{
  "companyOverview": string,
  "techStack": string[],
  "culture": string[],
  "whyThisRole": string,
  "yourEdge": string[],
  "gapsToAddress": string[],
  "smartQuestions": string[],
  "interviewPrep": string[],
  "sources": string[]
}`;
}

function createSynthesisUserPrompt(
  job: JobForResearch,
  profile: ProfileForMatching,
  websiteResearch: CompanyWebsiteResearch,
): string {
  return `COMPANY RESEARCH (from their website):
${JSON.stringify(websiteResearch, null, 2)}

JOB POSTING:
${JSON.stringify(
  {
    title: job.title,
    company: job.company,
    description: job.aboutRole,
    matchReason: job.matchReason,
    matchedSkills: job.matchedSkills,
    missingSkills: job.missingSkills,
  },
  null,
  2,
)}

CANDIDATE PROFILE:
${JSON.stringify(
  {
    currentTitle: profile.currentTitle,
    experienceLevel: profile.experienceLevel,
    yearsExperience: profile.yearsExperience,
    skills: profile.skills,
    industries: profile.industries,
    workExperience: profile.workExperience,
    education: profile.education,
    jobTitlesSeeking: profile.jobTitlesSeeking,
  },
  null,
  2,
)}`;
}

function parseSynthesisJson(content: string): CompanyResearchDossier | null {
  try {
    const value: unknown = JSON.parse(content);
    return parseCompanyResearchDossier(value);
  } catch {
    return null;
  }
}

function selectResearchLinks(pageLinks: ResearchPageLink[], homepageUrl: string): ResearchPageLink[] {
  const priority: ResearchPageLink["kind"][] = ["about", "blog", "engineering", "product", "team", "careers", "other"];
  const normalized = pageLinks
    .map((link) => ({
      url: resolveResearchUrl(link.url, homepageUrl),
      kind: link.kind,
    }))
    .filter((link) => link.url && isSameRoot(link.url, homepageUrl));

  const selected: ResearchPageLink[] = [];
  for (const kind of priority) {
    for (const link of normalized) {
      if (selected.length >= 3) return selected;
      if (link.kind === kind && !selected.some((item) => item.url === link.url)) {
        selected.push(link);
      }
    }
  }

  return selected;
}

function resolveResearchUrl(value: string, homepageUrl: string): string {
  try {
    return new URL(value, homepageUrl).toString();
  } catch {
    return "";
  }
}

function isSameRoot(value: string, homepageUrl: string): boolean {
  try {
    return getRootDomain(new URL(value).hostname) === getRootDomain(new URL(homepageUrl).hostname);
  } catch {
    return false;
  }
}

function createCompanyFallbackUrl(company: string): string {
  const slug = company
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .trim();

  return slug ? `https://www.${slug}.com` : "https://www.google.com";
}

function getRootDomain(hostname: string): string {
  const parts = hostname.toLowerCase().replace(/^www\./, "").split(".").filter(Boolean);
  if (parts.length <= 2) return parts.join(".");

  const secondLevelDomains = new Set(["co", "com", "net", "org"]);
  const lastTwo = parts.slice(-2);
  if (lastTwo[0] && secondLevelDomains.has(lastTwo[0]) && parts.length >= 3) {
    return parts.slice(-3).join(".");
  }

  return lastTwo.join(".");
}

function cleanStringArray(value: string[]): string[] {
  return value.map((item) => item.trim()).filter(Boolean).slice(0, 12);
}

async function logResearchError(insforge: InsForgeClient, userId: string, jobId: string, message: string): Promise<void> {
  const { error } = await insforge.database.from("agent_logs").insert([
    {
      user_id: userId,
      job_id: jobId,
      level: "error",
      message,
    },
  ]);

  if (error) {
    console.error("[agent/research] Failed to log agent error", error.message);
  }
}

async function captureCompanyResearched(userId: string, jobId: string, company: string): Promise<void> {
  try {
    await capturePostHogServerEvent("company_researched", userId, { userId, jobId, company });
  } catch (error) {
    console.error("[agent/research] Failed to capture company_researched", error);
  }
}
