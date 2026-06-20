import { revalidatePath } from "next/cache";
import type { InsForgeClient } from "@insforge/sdk";
import { matchJobToProfile } from "@/agent/matcher";
import { searchJobs, type AdzunaJob } from "@/lib/adzuna";
import { capturePostHogServerEvent } from "@/lib/posthog-server";
import type { JobType, ProfileForMatching, SavedJobSummary } from "@/types/jobs";

const STRONG_MATCH_THRESHOLD = 70;

type DiscoverJobsResult =
  | {
      success: true;
      runId: string;
      jobsFound: number;
      jobsSaved: number;
      strongMatches: number;
      savedJobs: SavedJobSummary[];
    }
  | {
      success: false;
      error: string;
    };

type AgentRunRecord = {
  id: string;
};

type SavedJobRecord = {
  id: string;
  title: string;
  company: string;
  match_score: number;
};

type JobInsertRecord = {
  run_id: string;
  user_id: string;
  source: "search";
  source_url: string;
  external_apply_url: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  job_type: JobType;
  about_role: string | null;
  responsibilities: string[];
  requirements: string[];
  nice_to_have: string[];
  benefits: string[];
  about_company: string | null;
  match_score: number;
  match_reason: string;
  matched_skills: string[];
  missing_skills: string[];
  found_at: string;
};

export async function discoverJobsForProfile(
  insforge: InsForgeClient,
  userId: string,
  profile: ProfileForMatching,
  jobTitle: string,
  location: string,
): Promise<DiscoverJobsResult> {
  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
    return {
      success: false,
      error: "Job search is not configured yet.",
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: "Job matching is not configured yet.",
    };
  }

  const runResult = await createAgentRun(insforge, userId, jobTitle, location);

  if (!runResult.success) {
    return {
      success: false,
      error: "Could not start job search. Please try again.",
    };
  }

  const runId = runResult.runId;

  try {
    await captureJobSearchStarted(userId, jobTitle, location);

    const searchResult = await searchJobs(jobTitle, location);
    if (!searchResult.success) {
      await failRun(insforge, runId, userId, searchResult.error);
      return {
        success: false,
        error: searchResult.error,
      };
    }

    const savedJobs: SavedJobSummary[] = [];

    for (const job of searchResult.jobs) {
      const saved = await scoreAndSaveJob(insforge, runId, userId, profile, job);
      if (saved) {
        savedJobs.push(saved);
      }
    }

    await completeRun(insforge, runId, searchResult.jobs.length);
    revalidatePath("/find-jobs");

    return {
      success: true,
      runId,
      jobsFound: searchResult.jobs.length,
      jobsSaved: savedJobs.length,
      strongMatches: savedJobs.filter((job) => job.matchScore >= STRONG_MATCH_THRESHOLD).length,
      savedJobs,
    };
  } catch (error) {
    console.error("[agent/adzuna]", error);
    await failRun(insforge, runId, userId, "Job search failed unexpectedly.");
    return {
      success: false,
      error: "Something went wrong while finding jobs.",
    };
  }
}

async function scoreAndSaveJob(
  insforge: InsForgeClient,
  runId: string,
  userId: string,
  profile: ProfileForMatching,
  job: AdzunaJob,
): Promise<SavedJobSummary | null> {
  const matchResult = await matchJobToProfile(job, profile);

  if (!matchResult.success) {
    await logAgentError(insforge, runId, userId, `Could not score ${job.title} at ${job.company.display_name}.`);
    return null;
  }

  const record = toJobInsertRecord(runId, userId, job, matchResult.match);
  const { data, error } = await insforge.database.from("jobs").insert([record]).select("id, title, company, match_score").single();

  if (error || !isSavedJobRecord(data)) {
    console.error("[agent/adzuna] Failed to save job", error?.message);
    await logAgentError(insforge, runId, userId, `Could not save ${job.title} at ${job.company.display_name}.`);
    return null;
  }

  await captureJobFound(userId, data.match_score);

  return {
    id: data.id,
    title: data.title,
    company: data.company,
    matchScore: data.match_score,
  };
}

function toJobInsertRecord(
  runId: string,
  userId: string,
  job: AdzunaJob,
  match: {
    matchScore: number;
    matchReason: string;
    matchedSkills: string[];
    missingSkills: string[];
  },
): JobInsertRecord {
  return {
    run_id: runId,
    user_id: userId,
    source: "search",
    source_url: job.redirect_url,
    external_apply_url: job.redirect_url,
    title: job.title,
    company: job.company.display_name,
    location: nullable(job.location.display_name),
    salary: formatSalary(job.salary_min, job.salary_max),
    job_type: normalizeJobType(job.contract_type, job.contract_time),
    about_role: nullable(job.description),
    responsibilities: [],
    requirements: [],
    nice_to_have: [],
    benefits: [],
    about_company: null,
    match_score: match.matchScore,
    match_reason: match.matchReason || "This job was scored against your saved profile.",
    matched_skills: match.matchedSkills,
    missing_skills: match.missingSkills,
    found_at: parseDateOrNow(job.created),
  };
}

async function createAgentRun(
  insforge: InsForgeClient,
  userId: string,
  jobTitle: string,
  location: string,
): Promise<{ success: true; runId: string } | { success: false }> {
  const { data, error } = await insforge.database
    .from("agent_runs")
    .insert([
      {
        user_id: userId,
        status: "running",
        job_title_searched: jobTitle,
        location_searched: nullable(location),
        jobs_found: 0,
      },
    ])
    .select("id")
    .single();

  if (error || !isAgentRunRecord(data)) {
    console.error("[agent/adzuna] Failed to create agent run", error?.message);
    return { success: false };
  }

  return {
    success: true,
    runId: data.id,
  };
}

async function completeRun(insforge: InsForgeClient, runId: string, jobsFound: number): Promise<void> {
  const { error } = await insforge.database
    .from("agent_runs")
    .update({
      status: "completed",
      jobs_found: jobsFound,
      completed_at: new Date().toISOString(),
    })
    .eq("id", runId);

  if (error) {
    console.error("[agent/adzuna] Failed to complete run", error.message);
  }
}

async function failRun(insforge: InsForgeClient, runId: string, userId: string, message: string): Promise<void> {
  const { error } = await insforge.database
    .from("agent_runs")
    .update({
      status: "failed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", runId);

  if (error) {
    console.error("[agent/adzuna] Failed to mark run failed", error.message);
  }

  await logAgentError(insforge, runId, userId, message);
}

async function logAgentError(insforge: InsForgeClient, runId: string, userId: string, message: string): Promise<void> {
  const { error } = await insforge.database.from("agent_logs").insert([
    {
      run_id: runId,
      user_id: userId,
      level: "error",
      message,
    },
  ]);

  if (error) {
    console.error("[agent/adzuna] Failed to log agent error", error.message);
  }
}

async function captureJobSearchStarted(userId: string, jobTitle: string, location: string): Promise<void> {
  try {
    await capturePostHogServerEvent("job_search_started", userId, { userId, jobTitle, location });
  } catch (error) {
    console.error("[agent/adzuna] Failed to capture job_search_started", error);
  }
}

async function captureJobFound(userId: string, matchScore: number): Promise<void> {
  try {
    await capturePostHogServerEvent("job_found", userId, { userId, source: "search", matchScore });
  } catch (error) {
    console.error("[agent/adzuna] Failed to capture job_found", error);
  }
}

function normalizeJobType(contractType: string | undefined, contractTime: string | undefined): JobType {
  const value = `${contractType ?? ""} ${contractTime ?? ""}`.toLowerCase();

  if (value.includes("part")) return "parttime";
  if (value.includes("contract")) return "contract";
  return "fulltime";
}

function formatSalary(min: number | undefined, max: number | undefined): string | null {
  if (typeof min === "number" && typeof max === "number") {
    return `$${Math.round(min / 1000)}k - $${Math.round(max / 1000)}k`;
  }

  if (typeof min === "number") {
    return `$${Math.round(min / 1000)}k+`;
  }

  if (typeof max === "number") {
    return `Up to $${Math.round(max / 1000)}k`;
  }

  return null;
}

function parseDateOrNow(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

function nullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function isAgentRunRecord(value: unknown): value is AgentRunRecord {
  return isRecord(value) && typeof value.id === "string";
}

function isSavedJobRecord(value: unknown): value is SavedJobRecord {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.company === "string" &&
    typeof value.match_score === "number"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
