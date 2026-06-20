import type { ReactElement } from "react";
import type { JobDetail } from "@/types/jobDetails";

type Props = {
  job: JobDetail;
};

export function JobDetailsHeaderCard({ job }: Props): ReactElement {
  return (
    <header className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-secondary text-text-secondary">
          <svg className="size-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 21V5.8c0-.5.3-.9.8-1.1l6-2.1c.7-.2 1.4.3 1.4 1.1V21" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
            <path d="M14.2 9H18c.6 0 1 .4 1 1v11" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
            <path d="M9 9h2.2M9 13h2.2M9 17h2.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            <path d="M4 21h17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          </svg>
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold leading-8 text-text-primary">{job.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold leading-5 text-text-secondary">
            <span className="truncate">{job.company}</span>
            <span aria-hidden="true">&middot;</span>
            <span className="rounded-full bg-success-lightest px-3 py-1 text-xs font-semibold leading-4 text-success-foreground">{job.matchScore}% Match Score</span>
          </div>
        </div>
      </div>

      {job.externalApplyUrl ? (
        <a
          href={job.externalApplyUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold leading-5 text-text-primary shadow-card transition-colors hover:bg-surface-secondary"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M14 5h5v5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="M10 14 19 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          View Job Post
        </a>
      ) : (
        <span className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-secondary px-4 text-sm font-semibold leading-5 text-text-muted">
          No job post URL
        </span>
      )}
    </header>
  );
}
