import type { ReactElement } from "react";
import Link from "next/link";

export function BackToJobsLink(): ReactElement {
  return (
    <Link href="/find-jobs" className="inline-flex items-center gap-2 text-sm font-semibold leading-5 text-text-secondary hover:text-accent">
      <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M10 12 6 8l4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
      Back to Jobs
    </Link>
  );
}
