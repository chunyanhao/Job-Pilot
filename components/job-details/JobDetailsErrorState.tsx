import type { ReactElement } from "react";
import { BackToJobsLink } from "@/components/job-details/BackToJobsLink";

type Props = {
  message: string;
};

export function JobDetailsErrorState({ message }: Props): ReactElement {
  return (
    <section className="mx-auto flex w-full max-w-[872px] flex-col gap-6 px-6 py-8">
      <BackToJobsLink />
      <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
        <p className="text-xs font-semibold uppercase leading-4 text-accent">Job Details</p>
        <h1 className="mt-3 text-2xl font-semibold leading-8 text-text-primary">Job unavailable</h1>
        <p className="mt-3 text-sm font-medium leading-5 text-text-secondary">{message}</p>
      </div>
    </section>
  );
}
