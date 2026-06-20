import { NextRequest, NextResponse } from "next/server";
import { researchCompanyForJob, type JobForResearch } from "@/agent/research";
import { createInsforgeServer, getCurrentUser, hasInsforgeConfig } from "@/lib/insforge-server";
import type { ResearchCompanyResponse } from "@/types/companyResearch";
import type { ProfileForMatching } from "@/types/jobs";

type ResearchCompanyRequestBody = {
  jobId: string;
};

type JobResearchRow = {
  id: string;
  title: string;
  company: string;
  source_url: string | null;
  external_apply_url: string | null;
  about_role: string | null;
  match_reason: string;
  matched_skills: string[];
  missing_skills: string[];
};

export async function POST(req: NextRequest): Promise<NextResponse<ResearchCompanyResponse>> {
  try {
    if (!hasInsforgeConfig()) {
      return errorResponse("Company research is not configured yet.", 503);
    }

    const body: unknown = await req.json();
    const parsedBody = parseResearchCompanyBody(body);

    if (!parsedBody.success) {
      return errorResponse(parsedBody.error, 400);
    }

    const user = await getCurrentUser();
    if (!user) {
      return errorResponse("Please sign in again before researching this company.", 401);
    }

    const insforge = await createInsforgeServer();
    const jobResult = await insforge.database
      .from("jobs")
      .select("id, title, company, source_url, external_apply_url, about_role, match_reason, matched_skills, missing_skills")
      .eq("id", parsedBody.data.jobId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (jobResult.error) {
      console.error("[api/agent/research] Failed to load job", jobResult.error.message);
      return errorResponse("Could not load this job. Please try again.", 500);
    }

    if (!isJobResearchRow(jobResult.data)) {
      return errorResponse("Job not found.", 404);
    }

    const profileResult = await insforge.database.from("profiles").select("*").eq("id", user.id).maybeSingle();

    if (profileResult.error) {
      console.error("[api/agent/research] Failed to load profile", profileResult.error.message);
      return errorResponse("Could not load your profile. Please try again.", 500);
    }

    const profile = parseProfileForResearch(profileResult.data);
    if (!profile) {
      return errorResponse("Please save your profile before researching companies.", 400);
    }

    const result = await researchCompanyForJob(insforge, user.id, toJobForResearch(jobResult.data), profile);

    if (!result.success) {
      return errorResponse(result.error, 500);
    }

    return NextResponse.json({
      success: true,
      data: {
        dossier: result.dossier,
      },
    });
  } catch (error) {
    console.error("[api/agent/research]", error);
    return errorResponse("Something went wrong while researching this company.", 500);
  }
}

function parseResearchCompanyBody(
  value: unknown,
): { success: true; data: ResearchCompanyRequestBody } | { success: false; error: string } {
  if (!isRecord(value)) {
    return {
      success: false,
      error: "Please choose a job before researching the company.",
    };
  }

  const jobId = typeof value.jobId === "string" ? value.jobId.trim() : "";
  if (!isUuid(jobId)) {
    return {
      success: false,
      error: "Please choose a valid job before researching the company.",
    };
  }

  return {
    success: true,
    data: {
      jobId,
    },
  };
}

function toJobForResearch(row: JobResearchRow): JobForResearch {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    sourceUrl: row.source_url || "",
    externalApplyUrl: row.external_apply_url || "",
    aboutRole: row.about_role || "No job description is available.",
    matchReason: row.match_reason,
    matchedSkills: row.matched_skills,
    missingSkills: row.missing_skills,
  };
}

function parseProfileForResearch(value: unknown): ProfileForMatching | null {
  if (!isRecord(value) || typeof value.id !== "string") {
    return null;
  }

  return {
    id: value.id,
    fullName: parseString(value.full_name),
    email: parseString(value.email),
    location: parseString(value.location),
    currentTitle: parseString(value.current_title),
    experienceLevel: parseExperienceLevel(value.experience_level),
    yearsExperience: typeof value.years_experience === "number" ? value.years_experience : null,
    skills: parseStringArray(value.skills),
    industries: parseStringArray(value.industries),
    workExperience: parseWorkExperience(value.work_experience),
    education: parseEducation(value.education),
    jobTitlesSeeking: parseStringArray(value.job_titles_seeking),
    remotePreference: parseRemotePreference(value.remote_preference),
    preferredLocations: parseStringArray(value.preferred_locations),
    salaryExpectation: parseString(value.salary_expectation),
    workAuthorization: parseString(value.work_authorization),
    isComplete: value.is_complete === true,
  };
}

function errorResponse(message: string, status: number): NextResponse<ResearchCompanyResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}

function parseString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

function parseExperienceLevel(value: unknown): ProfileForMatching["experienceLevel"] {
  return value === "junior" || value === "mid" || value === "senior" || value === "lead" ? value : "";
}

function parseRemotePreference(value: unknown): ProfileForMatching["remotePreference"] {
  return value === "remote" || value === "onsite" || value === "hybrid" || value === "any" ? value : "";
}

function parseWorkExperience(value: unknown): ProfileForMatching["workExperience"] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item) => ({
      companyName: parseString(item.companyName),
      jobTitle: parseString(item.jobTitle),
      startDate: parseString(item.startDate),
      endDate: parseString(item.endDate),
      currentlyWorking: item.currentlyWorking === true,
      responsibilities: parseString(item.responsibilities),
    }))
    .slice(0, 3);
}

function parseEducation(value: unknown): ProfileForMatching["education"] {
  if (!isRecord(value)) {
    return {
      highestDegree: "",
      fieldOfStudy: "",
      institutionName: "",
      graduationYear: "",
    };
  }

  return {
    highestDegree: parseString(value.highestDegree),
    fieldOfStudy: parseString(value.fieldOfStudy),
    institutionName: parseString(value.institutionName),
    graduationYear: parseString(value.graduationYear),
  };
}

function isJobResearchRow(value: unknown): value is JobResearchRow {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.company === "string" &&
    (typeof value.source_url === "string" || value.source_url === null) &&
    (typeof value.external_apply_url === "string" || value.external_apply_url === null) &&
    (typeof value.about_role === "string" || value.about_role === null) &&
    typeof value.match_reason === "string" &&
    isStringArray(value.matched_skills) &&
    isStringArray(value.missing_skills)
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
