import type {
  CoverLetterTone,
  Education,
  ExperienceLevel,
  ProfileCompletion,
  ProfileFormValues,
  RemotePreference,
  WorkAuthorization,
  WorkExperienceItem,
} from "@/types/profile";

export const emptyEducation: Education = {
  highestDegree: "",
  fieldOfStudy: "",
  institutionName: "",
  graduationYear: "",
};

export const emptyWorkExperienceItem: WorkExperienceItem = {
  companyName: "",
  jobTitle: "",
  startDate: "",
  endDate: "",
  currentlyWorking: true,
  responsibilities: "",
};

export const emptyProfileFormValues: ProfileFormValues = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedinUrl: "",
  portfolioUrl: "",
  workAuthorization: "",
  currentTitle: "",
  experienceLevel: "",
  yearsExperience: "",
  skills: [],
  industries: [],
  workExperience: [emptyWorkExperienceItem],
  education: emptyEducation,
  jobTitlesSeeking: "",
  remotePreference: "",
  salaryExpectation: "",
  preferredLocations: "",
  coverLetterTone: "formal",
  resumePdfUrl: "",
  isComplete: false,
};

export function calculateProfileCompletion(values: ProfileFormValues): ProfileCompletion {
  const checks = [
    { label: "NAME", complete: hasText(values.fullName) },
    { label: "EMAIL", complete: hasText(values.email) },
    { label: "PHONE", complete: hasText(values.phone) },
    { label: "LOCATION", complete: hasText(values.location) },
    { label: "TITLE", complete: hasText(values.currentTitle) },
    { label: "EXPERIENCE", complete: hasText(values.experienceLevel) && hasText(values.yearsExperience) },
    { label: "SKILLS", complete: values.skills.length > 0 },
    { label: "WORK", complete: values.workExperience.some(isWorkExperienceComplete) },
    { label: "EDUCATION", complete: isEducationComplete(values.education) },
    { label: "PREFERENCES", complete: hasText(values.jobTitlesSeeking) && hasText(values.remotePreference) },
    { label: "AUTHORIZATION", complete: hasText(values.workAuthorization) },
  ];

  const completed = checks.filter((check) => check.complete).length;
  const percentage = Math.round((completed / checks.length) * 100);
  const missingFields = checks.filter((check) => !check.complete).map((check) => check.label);

  return {
    percentage,
    missingFields,
    isComplete: missingFields.length === 0,
  };
}

export function parseProfileRecord(record: unknown, fallbackEmail: string): ProfileFormValues {
  if (!isRecord(record)) {
    return {
      ...emptyProfileFormValues,
      email: fallbackEmail,
    };
  }

  const education = parseEducation(record.education);

  return {
    fullName: readString(record.full_name),
    email: readString(record.email) || fallbackEmail,
    phone: readString(record.phone),
    location: readString(record.location),
    linkedinUrl: readString(record.linkedin_url),
    portfolioUrl: readString(record.portfolio_url),
    workAuthorization: parseWorkAuthorization(record.work_authorization),
    currentTitle: readString(record.current_title),
    experienceLevel: parseExperienceLevel(record.experience_level),
    yearsExperience: readOptionalNumber(record.years_experience),
    skills: readStringArray(record.skills),
    industries: readStringArray(record.industries),
    workExperience: parseWorkExperience(record.work_experience),
    education,
    jobTitlesSeeking: readStringArray(record.job_titles_seeking).join(", "),
    remotePreference: parseRemotePreference(record.remote_preference),
    salaryExpectation: readString(record.salary_expectation),
    preferredLocations: readStringArray(record.preferred_locations).join(", "),
    coverLetterTone: parseCoverLetterTone(record.cover_letter_tone) || "formal",
    resumePdfUrl: readString(record.resume_pdf_url),
    isComplete: record.is_complete === true,
  };
}

export function parseExtractedProfile(value: unknown, fallbackEmail: string): ProfileFormValues {
  if (!isRecord(value)) {
    return {
      ...emptyProfileFormValues,
      email: fallbackEmail,
    };
  }

  const coverLetterTone = parseCoverLetterTone(value.coverLetterTone);

  return {
    fullName: readString(value.fullName),
    email: fallbackEmail,
    phone: readString(value.phone),
    location: readString(value.location),
    linkedinUrl: readString(value.linkedinUrl),
    portfolioUrl: readString(value.portfolioUrl),
    workAuthorization: parseWorkAuthorization(value.workAuthorization),
    currentTitle: readString(value.currentTitle),
    experienceLevel: parseExperienceLevel(value.experienceLevel),
    yearsExperience: readStringOrNumber(value.yearsExperience),
    skills: readStringArray(value.skills),
    industries: readStringArray(value.industries),
    workExperience: parseWorkExperience(value.workExperience),
    education: parseEducation(value.education),
    jobTitlesSeeking: readString(value.jobTitlesSeeking),
    remotePreference: parseRemotePreference(value.remotePreference),
    salaryExpectation: readString(value.salaryExpectation),
    preferredLocations: readString(value.preferredLocations),
    coverLetterTone: coverLetterTone || "formal",
    resumePdfUrl: "",
    isComplete: false,
  };
}

export function splitCommaList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isWorkExperienceComplete(item: WorkExperienceItem): boolean {
  return hasText(item.companyName) && hasText(item.jobTitle) && hasText(item.startDate) && hasText(item.responsibilities);
}

function isEducationComplete(education: Education): boolean {
  return (
    hasText(education.highestDegree) &&
    hasText(education.fieldOfStudy) &&
    hasText(education.institutionName) &&
    hasText(education.graduationYear)
  );
}

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function parseEducation(value: unknown): Education {
  if (!isRecord(value)) return emptyEducation;

  return {
    highestDegree: readString(value.highestDegree),
    fieldOfStudy: readString(value.fieldOfStudy),
    institutionName: readString(value.institutionName),
    graduationYear: readString(value.graduationYear),
  };
}

function parseWorkExperience(value: unknown): WorkExperienceItem[] {
  if (!Array.isArray(value)) return [emptyWorkExperienceItem];

  const items = value.map(parseWorkExperienceItem).filter((item) => item !== null);
  return items.length > 0 ? items.slice(0, 3) : [emptyWorkExperienceItem];
}

function parseWorkExperienceItem(value: unknown): WorkExperienceItem | null {
  if (!isRecord(value)) return null;

  return {
    companyName: readString(value.companyName),
    jobTitle: readString(value.jobTitle),
    startDate: readString(value.startDate),
    endDate: readString(value.endDate),
    currentlyWorking: value.currentlyWorking === true,
    responsibilities: readString(value.responsibilities),
  };
}

function parseExperienceLevel(value: unknown): ExperienceLevel | "" {
  return value === "junior" || value === "mid" || value === "senior" || value === "lead" ? value : "";
}

function parseRemotePreference(value: unknown): RemotePreference | "" {
  return value === "remote" || value === "onsite" || value === "hybrid" || value === "any" ? value : "";
}

function parseCoverLetterTone(value: unknown): CoverLetterTone | "" {
  return value === "formal" || value === "casual" || value === "enthusiastic" ? value : "";
}

function parseWorkAuthorization(value: unknown): WorkAuthorization | "" {
  return value === "citizen" || value === "permanent_resident" || value === "visa_required" ? value : "";
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readStringOrNumber(value: unknown): string {
  if (typeof value === "string") return value;
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

function readOptionalNumber(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
