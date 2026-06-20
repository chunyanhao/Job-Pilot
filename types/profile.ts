export type ExperienceLevel = "junior" | "mid" | "senior" | "lead";
export type RemotePreference = "remote" | "onsite" | "hybrid" | "any";
export type CoverLetterTone = "formal" | "casual" | "enthusiastic";
export type WorkAuthorization = "citizen" | "permanent_resident" | "visa_required";

export type WorkExperienceItem = {
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  responsibilities: string;
};

export type Education = {
  highestDegree: string;
  fieldOfStudy: string;
  institutionName: string;
  graduationYear: string;
};

export type ProfileFormValues = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  workAuthorization: WorkAuthorization | "";
  currentTitle: string;
  experienceLevel: ExperienceLevel | "";
  yearsExperience: string;
  skills: string[];
  industries: string[];
  workExperience: WorkExperienceItem[];
  education: Education;
  jobTitlesSeeking: string;
  remotePreference: RemotePreference | "";
  salaryExpectation: string;
  preferredLocations: string;
  coverLetterTone: CoverLetterTone | "";
  resumePdfUrl: string;
  isComplete: boolean;
};

export type ProfileCompletion = {
  percentage: number;
  missingFields: string[];
  isComplete: boolean;
};

export type SaveProfileActionState = {
  status: "idle" | "success" | "error";
  message: string;
  completion?: ProfileCompletion;
  resumeSaved?: boolean;
  resumePdfUrl?: string;
};

export type ResumeExtractionResponse =
  | {
      success: true;
      data: ProfileFormValues;
    }
  | {
      success: false;
      error: string;
    };
