import OpenAI from "openai";
import type { AdzunaJob } from "@/lib/adzuna";
import type { MatchScore, ProfileForMatching } from "@/types/jobs";

type MatchJobResult =
  | {
      success: true;
      match: MatchScore;
    }
  | {
      success: false;
      error: string;
    };

export async function matchJobToProfile(job: AdzunaJob, profile: ProfileForMatching): Promise<MatchJobResult> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: "Job matching is not configured yet.",
    };
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content: createSystemPrompt(),
        },
        {
          role: "user",
          content: createUserPrompt(job, profile),
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      return {
        success: false,
        error: "Could not score this job.",
      };
    }

    const parsed = parseMatchJson(content);
    if (!parsed.success) {
      return {
        success: false,
        error: "Could not score this job.",
      };
    }

    return {
      success: true,
      match: parsed.match,
    };
  } catch (error) {
    console.error("[agent/matcher]", error);
    return {
      success: false,
      error: "Could not score this job.",
    };
  }
}

function createSystemPrompt(): string {
  return `You score a job posting against a candidate profile.

Return ONLY valid JSON with this exact object shape:
{
  "matchScore": number,
  "matchReason": string,
  "matchedSkills": string[],
  "missingSkills": string[]
}

Rules:
- matchScore must be an integer from 0 to 100.
- Use Adzuna's description as a snippet, not a complete job description.
- Reward direct overlap between the candidate's skills, target roles, seniority, location preferences, and the job.
- Do not invent candidate skills or job requirements.
- matchedSkills must only include skills or experience present in the candidate profile.
- missingSkills should list important job requirements that are not clearly present in the candidate profile.
- matchReason must be one concise paragraph explaining the score.`;
}

function createUserPrompt(job: AdzunaJob, profile: ProfileForMatching): string {
  return `CANDIDATE PROFILE:
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
    remotePreference: profile.remotePreference,
    preferredLocations: profile.preferredLocations,
    salaryExpectation: profile.salaryExpectation,
    workAuthorization: profile.workAuthorization,
  },
  null,
  2,
)}

JOB POSTING:
${JSON.stringify(
  {
    title: job.title,
    company: job.company.display_name,
    location: job.location.display_name,
    descriptionSnippet: job.description,
    category: job.category,
    contractType: job.contract_type,
    contractTime: job.contract_time,
  },
  null,
  2,
)}`;
}

function parseMatchJson(content: string): { success: true; match: MatchScore } | { success: false } {
  try {
    const value: unknown = JSON.parse(content);
    if (!isRecord(value)) return { success: false };

    const score = typeof value.matchScore === "number" ? Math.round(value.matchScore) : Number.NaN;
    if (!Number.isFinite(score)) return { success: false };

    return {
      success: true,
      match: {
        matchScore: Math.min(100, Math.max(0, score)),
        matchReason: typeof value.matchReason === "string" ? value.matchReason.trim() : "",
        matchedSkills: parseStringArray(value.matchedSkills),
        missingSkills: parseStringArray(value.missingSkills),
      },
    };
  } catch {
    return { success: false };
  }
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 10);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
