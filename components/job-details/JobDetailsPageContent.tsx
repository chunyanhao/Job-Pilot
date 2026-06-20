import type { ReactElement } from "react";
import type { JobDetail } from "@/types/jobDetails";
import { AiMatchReasoningCard } from "@/components/job-details/AiMatchReasoningCard";
import { BackToJobsLink } from "@/components/job-details/BackToJobsLink";
import { CompanyResearchCard } from "@/components/job-details/CompanyResearchCard";
import { JobApplyCta } from "@/components/job-details/JobApplyCta";
import { JobDescriptionCard } from "@/components/job-details/JobDescriptionCard";
import { JobDetailsHeaderCard } from "@/components/job-details/JobDetailsHeaderCard";
import { JobInfoCards } from "@/components/job-details/JobInfoCards";
import { SkillsComparisonCard } from "@/components/job-details/SkillsComparisonCard";

type Props = {
  job: JobDetail;
};

export function JobDetailsPageContent({ job }: Props): ReactElement {
  return (
    <section className="mx-auto flex w-full max-w-[872px] flex-col gap-6 px-6 py-8">
      <BackToJobsLink />

      <JobDetailsHeaderCard job={job} />
      <JobInfoCards job={job} />
      <AiMatchReasoningCard matchReason={job.matchReason} />
      <SkillsComparisonCard matchedSkills={job.matchedSkills} missingSkills={job.missingSkills} />
      <JobDescriptionCard job={job} />
      <CompanyResearchCard jobId={job.id} company={job.company} companyResearch={job.companyResearch} />
      <JobApplyCta company={job.company} applyUrl={job.externalApplyUrl} />
    </section>
  );
}
