import type { ReactElement } from "react";

type Props = {
  jobTitle: string;
  location: string;
  searchState: {
    status: "idle" | "loading" | "success" | "error";
    message: string;
  };
  onJobTitleChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch: () => Promise<void>;
};

export function SearchControls({
  jobTitle,
  location,
  searchState,
  onJobTitleChange,
  onLocationChange,
  onSearch,
}: Props): ReactElement {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Job Title</span>
          <span className="flex min-h-[54px] items-center gap-3 rounded-lg border border-border bg-surface px-4 shadow-card">
            <SearchIcon className="size-5 shrink-0 text-text-muted" />
            <input
              type="text"
              value={jobTitle}
              onChange={(event) => onJobTitleChange(event.target.value)}
              placeholder="Frontend Engineer"
              className="h-full min-w-0 flex-1 bg-transparent text-base font-medium leading-6 text-text-primary outline-none placeholder:text-text-muted"
            />
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Location</span>
          <input
            type="text"
            value={location}
            onChange={(event) => onLocationChange(event.target.value)}
            placeholder="Remote, New York..."
            className="min-h-[54px] rounded-lg border border-border bg-surface px-5 text-base font-medium leading-6 text-text-primary shadow-card outline-none placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>

        <button
          type="button"
          onClick={onSearch}
          disabled={searchState.status === "loading"}
          className="flex min-h-[54px] items-center justify-center gap-2 rounded-lg bg-accent px-7 text-base font-semibold leading-6 text-accent-foreground shadow-card transition-colors hover:bg-accent-dark disabled:bg-accent-dark disabled:text-accent-foreground"
        >
          <SearchIcon className="size-5" />
          <span>{searchState.status === "loading" ? "Finding..." : "Find Jobs"}</span>
        </button>
      </div>

      {searchState.status !== "idle" ? (
        <div className={getStatusBannerClass(searchState.status)}>
          {searchState.status === "error" ? <AlertIcon className="size-5 shrink-0" /> : <SparkleIcon className="size-5 shrink-0" />}
          <p>{searchState.message}</p>
        </div>
      ) : null}
    </section>
  );
}

function getStatusBannerClass(status: Props["searchState"]["status"]): string {
  if (status === "error") {
    return "mt-5 flex items-center gap-3 rounded-lg border border-error/20 bg-surface-secondary px-4 py-4 text-sm font-semibold leading-5 text-error";
  }

  return "mt-5 flex items-center gap-3 rounded-lg border border-success-light bg-success-lightest px-4 py-4 text-sm font-semibold leading-5 text-success-foreground";
}

function SearchIcon({ className }: { className: string }): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m16.5 16.5 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function SparkleIcon({ className }: { className: string }): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M5 15l.9 2.1L8 18l-2.1.9L5 21l-.9-2.1L2 18l2.1-.9L5 15Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function AlertIcon({ className }: { className: string }): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 8v5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M12 17h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6" />
      <path
        d="M10.3 4.2 2.8 17.4A2.3 2.3 0 0 0 4.8 21h14.4a2.3 2.3 0 0 0 2-3.6L13.7 4.2a2 2 0 0 0-3.4 0Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
