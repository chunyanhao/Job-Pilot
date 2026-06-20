export type AdzunaCountry = "us" | "gb" | "ca" | "au";

export type AdzunaJob = {
  id: string;
  title: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
  };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: "0" | "1" | 0 | 1;
  contract_type?: string;
  contract_time?: string;
  created: string;
  category?: {
    tag: string;
    label: string;
  };
};

type SearchJobsResult =
  | {
      success: true;
      jobs: AdzunaJob[];
      country: AdzunaCountry;
    }
  | {
      success: false;
      error: string;
    };

type AdzunaApiResponse = {
  results: AdzunaJob[];
};

export async function searchJobs(jobTitle: string, location: string): Promise<SearchJobsResult> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    return {
      success: false,
      error: "Job search is not configured yet.",
    };
  }

  const country = detectAdzunaCountry(location);
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: jobTitle,
    category: "it-jobs",
    results_per_page: "10",
    "content-type": "application/json",
  });

  const trimmedLocation = location.trim();
  if (trimmedLocation) {
    params.set("where", trimmedLocation);
  }

  try {
    const response = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("[lib/adzuna] Adzuna request failed", response.status);
      return {
        success: false,
        error: "Could not search jobs right now. Please try again.",
      };
    }

    const payload: unknown = await response.json();
    const parsed = parseAdzunaResponse(payload);

    if (!parsed.success) {
      console.error("[lib/adzuna] Unexpected Adzuna response shape");
      return {
        success: false,
        error: "Could not read jobs from Adzuna. Please try again.",
      };
    }

    return {
      success: true,
      jobs: parsed.data.results,
      country,
    };
  } catch (error) {
    console.error("[lib/adzuna]", error);
    return {
      success: false,
      error: "Could not search jobs right now. Please try again.",
    };
  }
}

export function detectAdzunaCountry(location: string): AdzunaCountry {
  const value = location.toLowerCase();

  if (/\b(london|manchester|birmingham|bristol|edinburgh|glasgow|uk|united kingdom|england|scotland|wales)\b/.test(value)) {
    return "gb";
  }

  if (/\b(toronto|vancouver|montreal|ottawa|canada|canadian)\b/.test(value)) {
    return "ca";
  }

  if (/\b(sydney|melbourne|brisbane|perth|adelaide|australia|australian)\b/.test(value)) {
    return "au";
  }

  return "us";
}

function parseAdzunaResponse(value: unknown): { success: true; data: AdzunaApiResponse } | { success: false } {
  if (!isRecord(value) || !Array.isArray(value.results)) {
    return { success: false };
  }

  const jobs = value.results.filter(isAdzunaJob);
  return {
    success: true,
    data: {
      results: jobs,
    },
  };
}

function isAdzunaJob(value: unknown): value is AdzunaJob {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string") return false;
  if (typeof value.title !== "string") return false;
  if (typeof value.description !== "string") return false;
  if (typeof value.redirect_url !== "string") return false;
  if (typeof value.created !== "string") return false;
  if (!isRecord(value.company) || typeof value.company.display_name !== "string") return false;
  if (!isRecord(value.location) || typeof value.location.display_name !== "string") return false;

  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
