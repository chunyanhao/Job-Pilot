import type { Education, ExperienceLevel, RemotePreference, WorkExperienceItem } from "@/types/profile";

export type JobType = "fulltime" | "parttime" | "contract";

export type ProfileForMatching = {
  id: string;
  fullName: string;
  email: string;
  location: string;
  currentTitle: string;
  experienceLevel: ExperienceLevel | "";
  yearsExperience: number | null;
  skills: string[];
  industries: string[];
  workExperience: WorkExperienceItem[];
  education: Education;
  jobTitlesSeeking: string[];
  remotePreference: RemotePreference | "";
  preferredLocations: string[];
  salaryExpectation: string;
  workAuthorization: string;
  isComplete: boolean;
};

export type MatchScore = {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
};

export type SavedJobSummary = {
  id: string;
  title: string;
  company: string;
  matchScore: number;
};

export type FindJobsResponse =
  | {
      success: true;
      data: {
        runId: string;
        jobsFound: number;
        jobsSaved: number;
        strongMatches: number;
        message: string;
      };
    }
  | {
      success: false;
      error: string;
    };
