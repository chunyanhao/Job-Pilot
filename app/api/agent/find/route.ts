import { NextRequest, NextResponse } from "next/server";
import { discoverJobsForProfile } from "@/agent/adzuna";
import { createInsforgeServer, getCurrentUser, hasInsforgeConfig } from "@/lib/insforge-server";
import type { FindJobsResponse, ProfileForMatching } from "@/types/jobs";

type FindJobsRequestBody = {
  jobTitle: string;
  location: string;
};

export async function POST(req: NextRequest): Promise<NextResponse<FindJobsResponse>> {
  try {
    if (!hasInsforgeConfig()) {
      return errorResponse("Job search is not configured yet.", 503);
    }

    const body: unknown = await req.json();
    const parsedBody = parseFindJobsBody(body);

    if (!parsedBody.success) {
      return errorResponse(parsedBody.error, 400);
    }

    const user = await getCurrentUser();
    if (!user) {
      return errorResponse("Please sign in again before finding jobs.", 401);
    }

    const insforge = await createInsforgeServer();
    const profileResult = await insforge.database.from("profiles").select("*").eq("id", user.id).maybeSingle();

    if (profileResult.error) {
      console.error("[api/agent/find] Failed to load profile", profileResult.error.message);
      return errorResponse("Could not load your profile. Please try again.", 500);
    }

    const profile = parseProfileForMatching(profileResult.data);
    if (!profile) {
      return errorResponse("Please save your profile before finding jobs.", 400);
    }

    const result = await discoverJobsForProfile(
      insforge,
      user.id,
      profile,
      parsedBody.data.jobTitle,
      parsedBody.data.location,
    );

    if (!result.success) {
      return errorResponse(result.error, 500);
    }

    return NextResponse.json({
      success: true,
      data: {
        runId: result.runId,
        jobsFound: result.jobsFound,
        jobsSaved: result.jobsSaved,
        strongMatches: result.strongMatches,
        message: createSuccessMessage(result.jobsFound, result.jobsSaved, result.strongMatches),
      },
    });
  } catch (error) {
    console.error("[api/agent/find]", error);
    return errorResponse("Something went wrong while finding jobs.", 500);
  }
}

function parseFindJobsBody(
  value: unknown,
): { success: true; data: FindJobsRequestBody } | { success: false; error: string } {
  if (!isRecord(value)) {
    return {
      success: false,
      error: "Please enter a job title before searching.",
    };
  }

  const jobTitle = typeof value.jobTitle === "string" ? value.jobTitle.trim() : "";
  const location = typeof value.location === "string" ? value.location.trim() : "";

  if (!jobTitle) {
    return {
      success: false,
      error: "Please enter a job title before searching.",
    };
  }

  if (jobTitle.length > 120 || location.length > 120) {
    return {
      success: false,
      error: "Please keep search terms under 120 characters.",
    };
  }

  return {
    success: true,
    data: {
      jobTitle,
      location,
    },
  };
}

function parseProfileForMatching(value: unknown): ProfileForMatching | null {
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

function createSuccessMessage(jobsFound: number, jobsSaved: number, strongMatches: number): string {
  if (jobsSaved === 0 && jobsFound > 0) {
    return `Found ${jobsFound} jobs, but none could be scored and saved.`;
  }

  return `Found ${jobsFound} jobs and saved ${strongMatches} strong matches.`;
}

function errorResponse(message: string, status: number): NextResponse<FindJobsResponse> {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
