export type JobSource = "Search" | "URL";

export type JobMatchBand = "high" | "medium" | "low";

export type JobListItem = {
  id: string;
  company: string;
  role: string;
  matchScore: number;
  salaryEstimate: string;
  source: JobSource;
  dateFound: string;
};

export type MockJob = JobListItem & {
  foundAtDaysAgo: number;
};

export type MatchFilter = "all" | "high" | "low";

export type SortMode = "score" | "newest" | "oldest";

export type JobsListFilters = {
  query: string;
  matchFilter: MatchFilter;
  sortMode: SortMode;
  page: number;
  runId: string;
};
