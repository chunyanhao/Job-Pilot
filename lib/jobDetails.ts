import type { InsForgeClient } from "@insforge/sdk";
import { parseCompanyResearchDossier } from "@/types/companyResearch";
import type { JobDetail, JobDetailsResult } from "@/types/jobDetails";

const JOB_DETAIL_COLUMNS = [
  "id",
  "title",
  "company",
  "location",
  "salary",
  "job_type",
  "source",
  "source_url",
  "external_apply_url",
  "about_role",
  "responsibilities",
  "requirements",
  "nice_to_have",
  "benefits",
  "about_company",
  "match_score",
  "match_reason",
  "matched_skills",
  "missing_skills",
  "company_research",
  "found_at",
].join(", ");

type JobDetailRow = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  job_type: string | null;
  source: "search" | "url";
  source_url: string | null;
  external_apply_url: string | null;
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
  company_research: unknown;
  found_at: string;
};

export async function getJobDetails(insforge: InsForgeClient, userId: string, jobId: string): Promise<JobDetailsResult> {
  const { data, error } = await insforge.database
    .from("jobs")
    .select(JOB_DETAIL_COLUMNS)
    .eq("id", jobId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[lib/jobDetails] Failed to load job details", error.message);
    return {
      success: false,
      error: "Could not load this job. Please try again.",
    };
  }

  if (!isJobDetailRow(data)) {
    return {
      success: false,
      error: "Job not found.",
    };
  }

  return {
    success: true,
    job: toJobDetail(data),
  };
}

function toJobDetail(row: JobDetailRow): JobDetail {
  const applyUrl = row.external_apply_url || row.source_url || "";

  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location || "Not listed",
    salary: row.salary || "Not listed",
    jobType: formatJobType(row.job_type),
    source: row.source === "url" ? "URL" : "Search",
    sourceUrl: row.source_url || applyUrl,
    externalApplyUrl: applyUrl,
    aboutRole: row.about_role || "No job description is available yet.",
    responsibilities: row.responsibilities,
    requirements: row.requirements,
    niceToHave: row.nice_to_have,
    benefits: row.benefits,
    aboutCompany: row.about_company || "",
    matchScore: clampScore(row.match_score),
    matchReason: row.match_reason || "No match reasoning is available yet.",
    matchedSkills: row.matched_skills,
    missingSkills: row.missing_skills,
    foundAtLabel: formatDateFound(row.found_at),
    companyResearch: parseCompanyResearchDossier(row.company_research),
  };
}

function formatJobType(value: string | null): string {
  if (value === "fulltime") return "Full-time";
  if (value === "parttime") return "Part-time";
  if (value === "contract") return "Contract";
  return "-";
}

function formatDateFound(value: string): string {
  const foundAt = new Date(value);
  if (Number.isNaN(foundAt.getTime())) {
    return "Recently";
  }

  const elapsedMs = Math.max(0, Date.now() - foundAt.getTime());
  const elapsedMinutes = Math.floor(elapsedMs / 60_000);
  const elapsedHours = Math.floor(elapsedMs / 3_600_000);
  const elapsedDays = Math.floor(elapsedMs / 86_400_000);

  if (elapsedMinutes < 1) return "Just now";
  if (elapsedMinutes < 60) return `${elapsedMinutes} ${elapsedMinutes === 1 ? "minute" : "minutes"} ago`;
  if (elapsedHours < 24) return `${elapsedHours} ${elapsedHours === 1 ? "hour" : "hours"} ago`;
  if (elapsedDays === 1) return "Yesterday";
  return `${elapsedDays} days ago`;
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function isJobDetailRow(value: unknown): value is JobDetailRow {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.company === "string" &&
    (typeof value.location === "string" || value.location === null) &&
    (typeof value.salary === "string" || value.salary === null) &&
    (typeof value.job_type === "string" || value.job_type === null) &&
    (value.source === "search" || value.source === "url") &&
    (typeof value.source_url === "string" || value.source_url === null) &&
    (typeof value.external_apply_url === "string" || value.external_apply_url === null) &&
    (typeof value.about_role === "string" || value.about_role === null) &&
    isStringArray(value.responsibilities) &&
    isStringArray(value.requirements) &&
    isStringArray(value.nice_to_have) &&
    isStringArray(value.benefits) &&
    (typeof value.about_company === "string" || value.about_company === null) &&
    typeof value.match_score === "number" &&
    typeof value.match_reason === "string" &&
    isStringArray(value.matched_skills) &&
    isStringArray(value.missing_skills) &&
    typeof value.found_at === "string"
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
