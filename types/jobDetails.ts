import type { JobSource } from "@/types/findJobs";
import type { CompanyResearchDossier } from "@/types/companyResearch";

export type JobDetail = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  jobType: string;
  source: JobSource;
  sourceUrl: string;
  externalApplyUrl: string;
  aboutRole: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
  aboutCompany: string;
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
  foundAtLabel: string;
  companyResearch: CompanyResearchDossier | null;
};

export type JobDetailsResult =
  | {
      success: true;
      job: JobDetail;
    }
  | {
      success: false;
      error: string;
    };
