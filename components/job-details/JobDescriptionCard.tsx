import type { ReactElement } from "react";
import { JobDetailList } from "@/components/job-details/JobDetailList";
import type { JobDetail } from "@/types/jobDetails";

type Props = {
  job: JobDetail;
};

export function JobDescriptionCard({ job }: Props): ReactElement {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-surface-secondary text-text-secondary">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
            <path d="M14 3v5h5M9 13h6M9 17h6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </span>
        <h2 className="text-lg font-semibold leading-7 text-text-primary">Job Description</h2>
      </div>

      <div className="mt-6 space-y-5 text-base font-medium leading-7 text-text-primary">
        <p>{job.aboutRole}</p>
        {job.aboutCompany ? <p>{job.aboutCompany}</p> : null}
        <JobDetailList title="Responsibilities" items={job.responsibilities} />
        <JobDetailList title="Requirements" items={job.requirements} />
        <JobDetailList title="Nice to Have" items={job.niceToHave} />
        <JobDetailList title="Benefits" items={job.benefits} />
      </div>
    </section>
  );
}
