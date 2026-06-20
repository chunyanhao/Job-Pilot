import type { InsForgeClient } from "@insforge/sdk";
import type { JobListItem, JobsListFilters, MatchFilter, SortMode } from "@/types/findJobs";

export const JOBS_PER_PAGE = 20;

const JOB_LIST_COLUMNS = "id, title, company, match_score, salary, source, found_at";

type JobRow = {
  id: string;
  title: string;
  company: string;
  match_score: number;
  salary: string | null;
  source: "search" | "url";
  found_at: string;
};

export type SavedJobsResult =
  | {
      success: true;
      jobs: JobListItem[];
      totalItems: number;
      totalPages: number;
      filters: JobsListFilters;
    }
  | {
      success: false;
      error: string;
      jobs: JobListItem[];
      totalItems: number;
      totalPages: number;
      filters: JobsListFilters;
    };

export function parseJobsListFilters(searchParams: Record<string, string | string[] | undefined>): JobsListFilters {
  return {
    query: parseParam(searchParams.q).slice(0, 120),
    matchFilter: parseMatchFilter(parseParam(searchParams.match)),
    sortMode: parseSortMode(parseParam(searchParams.sort)),
    page: parsePage(parseParam(searchParams.page)),
    runId: parseUuidParam(parseParam(searchParams.run)),
  };
}

export async function listSavedJobs(
  insforge: InsForgeClient,
  userId: string,
  filters: JobsListFilters,
): Promise<SavedJobsResult> {
  const from = (filters.page - 1) * JOBS_PER_PAGE;
  const to = from + JOBS_PER_PAGE - 1;

  let query = insforge.database
    .from("jobs")
    .select(JOB_LIST_COLUMNS, { count: "exact" })
    .eq("user_id", userId);

  if (filters.runId) {
    query = query.eq("run_id", filters.runId);
  }

  if (filters.matchFilter === "high") {
    query = query.gte("match_score", 70);
  }

  if (filters.matchFilter === "low") {
    query = query.lt("match_score", 70);
  }

  const searchPattern = createSearchPattern(filters.query);
  if (searchPattern) {
    query = query.or(`company.ilike.${searchPattern},title.ilike.${searchPattern}`);
  }

  if (filters.sortMode === "newest") {
    query = query.order("found_at", { ascending: false });
  } else if (filters.sortMode === "oldest") {
    query = query.order("found_at", { ascending: true });
  } else {
    query = query.order("match_score", { ascending: false }).order("found_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("[lib/savedJobs] Failed to list jobs", error.message);
    return createFailedResult(filters);
  }

  const jobs = Array.isArray(data) ? data.filter(isJobRow).map(toJobListItem) : [];
  const totalItems = typeof count === "number" ? count : jobs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / JOBS_PER_PAGE));

  return {
    success: true,
    jobs,
    totalItems,
    totalPages,
    filters,
  };
}

function createFailedResult(filters: JobsListFilters): SavedJobsResult {
  return {
    success: false,
    error: "Could not load saved jobs. Please try again.",
    jobs: [],
    totalItems: 0,
    totalPages: 1,
    filters,
  };
}

function toJobListItem(row: JobRow): JobListItem {
  return {
    id: row.id,
    company: row.company,
    role: row.title,
    matchScore: clampScore(row.match_score),
    salaryEstimate: row.salary || "Not listed",
    source: row.source === "url" ? "URL" : "Search",
    dateFound: formatDateFound(row.found_at),
  };
}

function formatDateFound(value: string): string {
  const foundAt = new Date(value);
  if (Number.isNaN(foundAt.getTime())) {
    return "Recently";
  }

  const now = new Date();
  const elapsedMs = now.getTime() - foundAt.getTime();
  const days = Math.max(0, Math.floor(elapsedMs / 86_400_000));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function createSearchPattern(query: string): string {
  const cleaned = query.trim().replace(/[%,()]/g, " ").replace(/\s+/g, " ");
  return cleaned ? `%${cleaned}%` : "";
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function parseParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function parseMatchFilter(value: string): MatchFilter {
  if (value === "high" || value === "low") return value;
  return "all";
}

function parseSortMode(value: string): SortMode {
  if (value === "newest" || value === "oldest") return value;
  return "score";
}

function parsePage(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

function parseUuidParam(value: string): string {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : "";
}

function isJobRow(value: unknown): value is JobRow {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.company === "string" &&
    typeof value.match_score === "number" &&
    (typeof value.salary === "string" || value.salary === null) &&
    (value.source === "search" || value.source === "url") &&
    typeof value.found_at === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
