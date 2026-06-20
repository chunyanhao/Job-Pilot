"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JOBS_PER_PAGE } from "@/lib/savedJobs";
import type { JobListItem, JobsListFilters, MatchFilter, SortMode } from "@/types/findJobs";
import type { FindJobsResponse } from "@/types/jobs";
import { JobFilters } from "./JobFilters";
import { JobsPagination } from "./JobsPagination";
import { JobsTable } from "./JobsTable";
import { SearchControls } from "./SearchControls";

type Props = {
  initialFilters: JobsListFilters;
  initialLocation: string;
  jobs: JobListItem[];
  jobsError: string;
  totalItems: number;
  totalPages: number;
};

export function FindJobsPageContent({
  initialFilters,
  initialLocation,
  jobs,
  jobsError,
  totalItems,
  totalPages,
}: Props): ReactElement {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState<string>("Frontend Engineer");
  const [location, setLocation] = useState<string>(initialLocation);
  const [filterQuery, setFilterQuery] = useState<string>(initialFilters.query);
  const [matchFilter, setMatchFilter] = useState<MatchFilter>(initialFilters.matchFilter);
  const [sortMode, setSortMode] = useState<SortMode>(initialFilters.sortMode);
  const [currentPage, setCurrentPage] = useState<number>(initialFilters.page);
  const [searchState, setSearchState] = useState<{ status: "idle" | "loading" | "success" | "error"; message: string }>({
    status: "idle",
    message: "",
  });

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const handleSearch = async (): Promise<void> => {
    setCurrentPage(1);
    setSearchState({ status: "loading", message: "Finding jobs and scoring matches..." });

    try {
      const response = await fetch("/api/agent/find", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle,
          location,
        }),
      });
      const payload: unknown = await response.json();
      const parsed = parseFindJobsResponse(payload);

      if (!parsed.success) {
        setSearchState({
          status: "error",
          message: parsed.error,
        });
        return;
      }

      if (!response.ok) {
        setSearchState({
          status: "error",
          message: "Could not find jobs right now. Please try again.",
        });
        return;
      }

      setSearchState({
        status: "success",
        message: parsed.data.message,
      });
      applyFilters({
        query: "",
        matchFilter: "all",
        sortMode: "score",
        page: 1,
        runId: parsed.data.runId,
      });
      router.refresh();
    } catch (error) {
      console.error("[FindJobsPageContent] Job search failed", error);
      setSearchState({
        status: "error",
        message: "Could not find jobs right now. Please try again.",
      });
    }
  };

  const handleFilterQueryChange = (value: string): void => {
    setFilterQuery(value);
    applyFilters({
      query: value,
      matchFilter,
      sortMode,
      page: 1,
      runId: initialFilters.runId,
    });
  };

  const handleMatchFilterChange = (value: MatchFilter): void => {
    setMatchFilter(value);
    applyFilters({
      query: filterQuery,
      matchFilter: value,
      sortMode,
      page: 1,
      runId: initialFilters.runId,
    });
  };

  const handleSortModeChange = (value: SortMode): void => {
    setSortMode(value);
    applyFilters({
      query: filterQuery,
      matchFilter,
      sortMode: value,
      page: 1,
      runId: initialFilters.runId,
    });
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    applyFilters({
      query: filterQuery,
      matchFilter,
      sortMode,
      page,
      runId: initialFilters.runId,
    });
  };

  const applyFilters = (nextFilters: JobsListFilters): void => {
    const params = new URLSearchParams();

    if (nextFilters.query.trim()) params.set("q", nextFilters.query.trim());
    if (nextFilters.matchFilter !== "all") params.set("match", nextFilters.matchFilter);
    if (nextFilters.sortMode !== "score") params.set("sort", nextFilters.sortMode);
    if (nextFilters.page > 1) params.set("page", String(nextFilters.page));
    if (nextFilters.runId) params.set("run", nextFilters.runId);

    const queryString = params.toString();
    router.replace(queryString ? `/find-jobs?${queryString}` : "/find-jobs");
  };

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-8">
      <SearchControls
        jobTitle={jobTitle}
        location={location}
        searchState={searchState}
        onJobTitleChange={setJobTitle}
        onLocationChange={setLocation}
        onSearch={handleSearch}
      />

      <JobFilters
        filterQuery={filterQuery}
        matchFilter={matchFilter}
        sortMode={sortMode}
        onFilterQueryChange={handleFilterQueryChange}
        onMatchFilterChange={handleMatchFilterChange}
        onSortModeChange={handleSortModeChange}
      />

      {initialFilters.runId ? (
        <section className="flex flex-col gap-3 rounded-xl border border-accent-light bg-surface px-5 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium leading-5 text-text-secondary">
            Showing jobs from the latest search.
          </p>
          <Link
            href="/find-jobs"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-semibold leading-5 text-text-primary shadow-card transition-colors hover:bg-surface-secondary"
          >
            View all saved jobs
          </Link>
        </section>
      ) : null}

      {jobsError ? (
        <div className="rounded-lg border border-error/20 bg-surface-secondary px-4 py-4 text-sm font-semibold leading-5 text-error">
          {jobsError}
        </div>
      ) : null}

      <JobsTable jobs={jobs} />

      <JobsPagination
        currentPage={safeCurrentPage}
        pageSize={JOBS_PER_PAGE}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </section>
  );
}

function parseFindJobsResponse(value: unknown): FindJobsResponse {
  if (!isRecord(value) || typeof value.success !== "boolean") {
    return {
      success: false,
      error: "Could not read the job search response.",
    };
  }

  if (!value.success) {
    return {
      success: false,
      error: typeof value.error === "string" ? value.error : "Could not find jobs right now. Please try again.",
    };
  }

  if (!isRecord(value.data)) {
    return {
      success: false,
      error: "Could not read the job search response.",
    };
  }

  return {
    success: true,
    data: {
      runId: parseString(value.data.runId),
      jobsFound: parseNumber(value.data.jobsFound),
      jobsSaved: parseNumber(value.data.jobsSaved),
      strongMatches: parseNumber(value.data.strongMatches),
      message: parseString(value.data.message) || "Job search completed.",
    },
  };
}

function parseString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
