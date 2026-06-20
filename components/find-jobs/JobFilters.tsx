import type { ReactElement } from "react";
import type { MatchFilter, SortMode } from "@/types/findJobs";

type Props = {
  filterQuery: string;
  matchFilter: MatchFilter;
  sortMode: SortMode;
  onFilterQueryChange: (value: string) => void;
  onMatchFilterChange: (value: MatchFilter) => void;
  onSortModeChange: (value: SortMode) => void;
};

export function JobFilters({
  filterQuery,
  matchFilter,
  sortMode,
  onFilterQueryChange,
  onMatchFilterChange,
  onSortModeChange,
}: Props): ReactElement {
  return (
    <section className="rounded-xl border border-border bg-surface px-5 py-3 shadow-card">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="flex min-h-[44px] flex-1 items-center gap-3 rounded-md bg-surface">
          <SearchIcon className="size-5 shrink-0 text-text-muted" />
          <input
            type="text"
            value={filterQuery}
            onChange={(event) => onFilterQueryChange(event.target.value)}
            placeholder="Filter by company or role..."
            className="h-full min-w-0 flex-1 bg-transparent text-base font-medium leading-6 text-text-primary outline-none placeholder:text-text-muted"
          />
        </label>

        <div className="hidden h-11 w-px bg-border lg:block" />

        <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:items-center">
          <label className="relative">
            <span className="sr-only">Match filter</span>
            <select
              value={matchFilter}
              onChange={(event) => onMatchFilterChange(parseMatchFilter(event.target.value))}
              className="min-h-[44px] w-full appearance-none rounded-lg border border-border bg-surface px-4 pr-10 text-sm font-medium leading-5 text-text-primary shadow-card outline-none focus:border-accent focus:ring-1 focus:ring-accent lg:w-[158px]"
            >
              <option value="all">All Matches</option>
              <option value="high">High Match</option>
              <option value="low">Low Match</option>
            </select>
            <ChevronIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
          </label>

          <label className="relative">
            <span className="sr-only">Sort jobs</span>
            <select
              value={sortMode}
              onChange={(event) => onSortModeChange(parseSortMode(event.target.value))}
              className="min-h-[44px] w-full appearance-none rounded-lg border border-border bg-surface px-4 pr-10 text-sm font-medium leading-5 text-text-primary shadow-card outline-none focus:border-accent focus:ring-1 focus:ring-accent lg:w-[172px]"
            >
              <option value="score">Match Score</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
            <ChevronIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
          </label>
        </div>
      </div>
    </section>
  );
}

function parseMatchFilter(value: string): MatchFilter {
  if (value === "high" || value === "low") return value;
  return "all";
}

function parseSortMode(value: string): SortMode {
  if (value === "newest" || value === "oldest") return value;
  return "score";
}

function SearchIcon({ className }: { className: string }): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m16.5 16.5 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function ChevronIcon({ className }: { className: string }): ReactElement {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}
