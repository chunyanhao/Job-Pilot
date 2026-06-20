import type { ReactElement } from "react";

type Props = {
  company: string;
  applyUrl: string;
};

export function JobApplyCta({ company, applyUrl }: Props): ReactElement {
  if (!applyUrl) {
    return (
      <span className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-surface-secondary px-6 text-sm font-semibold leading-5 text-text-muted">
        Apply link unavailable
      </span>
    );
  }

  return (
    <a
      href={applyUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-12 items-center justify-center rounded-lg bg-accent px-6 text-sm font-semibold leading-5 text-accent-foreground shadow-card transition-colors hover:bg-accent-dark"
    >
      Apply Now at {company}
    </a>
  );
}
