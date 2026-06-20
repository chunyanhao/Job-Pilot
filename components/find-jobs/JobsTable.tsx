import type { ReactElement } from "react";
import Link from "next/link";
import type { JobListItem, JobMatchBand } from "@/types/findJobs";

type Props = {
  jobs: JobListItem[];
};

export function JobsTable({ jobs }: Props): ReactElement {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] table-fixed">
          <thead className="bg-surface-secondary">
            <tr className="border-b border-border">
              <th className="w-[250px] px-11 py-5 text-left text-xs font-semibold uppercase leading-4 text-text-secondary">Company</th>
              <th className="w-[300px] px-4 py-5 text-left text-xs font-semibold uppercase leading-4 text-text-secondary">Role</th>
              <th className="w-[240px] px-4 py-5 text-left text-xs font-semibold uppercase leading-4 text-text-secondary">Match Score</th>
              <th className="w-[190px] px-4 py-5 text-left text-xs font-semibold uppercase leading-4 text-text-secondary">Salary Est.</th>
              <th className="w-[130px] px-4 py-5 text-left text-xs font-semibold uppercase leading-4 text-text-secondary">Source</th>
              <th className="w-[170px] px-4 py-5 text-left text-xs font-semibold uppercase leading-4 text-text-secondary">Date Found</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <tr key={job.id} className="border-b border-border last:border-b-0 hover:bg-surface-secondary">
                  <td className="px-11 py-5">
                    <Link href={`/find-jobs/${job.id}`} className="flex items-center gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border-light bg-surface-secondary text-text-secondary">
                        <BuildingIcon className="size-5" />
                      </span>
                      <span className="truncate text-sm font-semibold leading-5 text-text-primary">{job.company}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-5">
                    <Link href={`/find-jobs/${job.id}`} className="block truncate text-sm font-medium leading-5 text-text-dark">
                      {job.role}
                    </Link>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-[122px] rounded-full bg-border">
                        <div className={`${getScoreFillClass(job.matchScore)} ${getScoreWidthClass(job.matchScore)} h-full rounded-full`} />
                      </div>
                      <span className="text-sm font-semibold leading-5 text-text-dark">{job.matchScore}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-sm font-medium leading-5 text-text-secondary">{job.salaryEstimate}</td>
                  <td className="px-4 py-5">
                    <span
                      className={
                        job.source === "Search"
                          ? "rounded-full bg-success-lightest px-3 py-1 text-xs font-medium leading-4 text-success-foreground"
                          : "rounded-full bg-surface-secondary px-3 py-1 text-xs font-medium leading-4 text-text-secondary"
                      }
                    >
                      {job.source}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-sm font-medium leading-5 text-text-secondary">{job.dateFound}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm font-medium leading-5 text-text-muted">
                  No saved jobs match these filters. Run a search or adjust the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function getScoreFillClass(score: number): string {
  const band: JobMatchBand = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

  if (band === "high") return "bg-success";
  if (band === "medium") return "bg-info-medium";
  return "bg-warning";
}

function getScoreWidthClass(score: number): string {
  const normalized = Math.min(100, Math.max(0, Math.round(score / 5) * 5));
  const widths: Record<number, string> = {
    0: "w-0",
    5: "w-[5%]",
    10: "w-[10%]",
    15: "w-[15%]",
    20: "w-[20%]",
    25: "w-[25%]",
    30: "w-[30%]",
    35: "w-[35%]",
    40: "w-[40%]",
    45: "w-[45%]",
    50: "w-[50%]",
    55: "w-[55%]",
    60: "w-[60%]",
    65: "w-[65%]",
    70: "w-[70%]",
    75: "w-[75%]",
    80: "w-[80%]",
    85: "w-[85%]",
    90: "w-[90%]",
    95: "w-[95%]",
    100: "w-full",
  };

  return widths[normalized] ?? "w-0";
}

function BuildingIcon({ className }: { className: string }): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 21V5.8c0-.5.3-.9.8-1.1l6-2.1c.7-.2 1.4.3 1.4 1.1V21" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M14.2 9H18c.6 0 1 .4 1 1v11" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M9 9h2.2M9 13h2.2M9 17h2.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M4 21h17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}
