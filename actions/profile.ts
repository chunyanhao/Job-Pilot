"use server";

import { revalidatePath } from "next/cache";
import { capturePostHogServerEvent } from "@/lib/posthog-server";
import { calculateProfileCompletion, splitCommaList } from "@/lib/profile";
import { createInsforgeServer, getCurrentUser, hasInsforgeConfig } from "@/lib/insforge-server";
import type {
  CoverLetterTone,
  Education,
  ExperienceLevel,
  ProfileFormValues,
  RemotePreference,
  SaveProfileActionState,
  WorkAuthorization,
  WorkExperienceItem,
} from "@/types/profile";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

type ProfileRecord = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  experience_level: ExperienceLevel | null;
  years_experience: number | null;
  skills: string[];
  industries: string[];
  work_experience: WorkExperienceItem[];
  education: Education;
  job_titles_seeking: string[];
  remote_preference: RemotePreference | null;
  preferred_locations: string[];
  salary_expectation: string | null;
  cover_letter_tone: CoverLetterTone | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: WorkAuthorization | null;
  resume_pdf_url: string | null;
  is_complete: boolean;
};

type ExistingProfileRow = {
  isComplete: boolean;
  resumePdfUrl: string;
};

export async function saveProfile(
  _previousState: SaveProfileActionState,
  formData: FormData,
): Promise<SaveProfileActionState> {
  try {
    if (!hasInsforgeConfig()) {
      return errorState("Profile saving is not configured yet.");
    }

    const user = await getCurrentUser();
    if (!user) {
      return errorState("Please sign in again before saving your profile.");
    }

    const email = typeof user.email === "string" ? user.email : "";
    const values = parseProfileFormData(formData, email);
    const completion = calculateProfileCompletion(values);
    const insforge = await createInsforgeServer();

    const existingResult = await insforge.database
      .from("profiles")
      .select("is_complete, resume_pdf_url")
      .eq("id", user.id)
      .maybeSingle();

    if (existingResult.error) {
      console.error("[actions/profile] Failed to load existing profile", existingResult.error.message);
      return errorState("Could not load your current profile. Please try again.");
    }

    const existingProfile = parseExistingProfile(existingResult.data);
    const uploadedResumeUrl = await uploadResumeIfPresent(formData, user.id, existingProfile.resumePdfUrl);

    if (uploadedResumeUrl.status === "error") {
      return errorState(uploadedResumeUrl.message);
    }

    const profileRecord = toProfileRecord(user.id, values, completion.isComplete, uploadedResumeUrl.url);
    const writeResult = existingResult.data
      ? await insforge.database.from("profiles").update(profileRecord).eq("id", user.id).select().single()
      : await insforge.database.from("profiles").insert([profileRecord]).select().single();

    if (writeResult.error) {
      console.error("[actions/profile] Failed to save profile", writeResult.error.message);
      return errorState("Could not save your profile. Please check the fields and try again.");
    }

    if (!existingProfile.isComplete && completion.isComplete) {
      await captureProfileCompleted(user.id);
    }

    revalidatePath("/profile");

    return {
      status: "success",
      message: createSuccessMessage(completion.isComplete, uploadedResumeUrl.didUpload),
      completion,
      resumeSaved: uploadedResumeUrl.didUpload || Boolean(existingProfile.resumePdfUrl),
      resumePdfUrl: uploadedResumeUrl.url,
    };
  } catch (error) {
    console.error("[actions/profile]", error);
    return errorState("Something went wrong while saving your profile.");
  }
}

function parseProfileFormData(formData: FormData, email: string): ProfileFormValues {
  const workExperience = parseWorkExperience(formData);

  return {
    fullName: getText(formData, "fullName"),
    email,
    phone: getText(formData, "phone"),
    location: getText(formData, "location"),
    linkedinUrl: getText(formData, "linkedinUrl"),
    portfolioUrl: getText(formData, "portfolioUrl"),
    workAuthorization: parseWorkAuthorization(getText(formData, "workAuthorization")),
    currentTitle: getText(formData, "currentTitle"),
    experienceLevel: parseExperienceLevel(getText(formData, "experienceLevel")),
    yearsExperience: getText(formData, "yearsExperience"),
    skills: getTextList(formData, "skills"),
    industries: getTextList(formData, "industries"),
    workExperience,
    education: {
      highestDegree: getText(formData, "highestDegree"),
      fieldOfStudy: getText(formData, "fieldOfStudy"),
      institutionName: getText(formData, "institutionName"),
      graduationYear: getText(formData, "graduationYear"),
    },
    jobTitlesSeeking: getText(formData, "jobTitlesSeeking"),
    remotePreference: parseRemotePreference(getText(formData, "remotePreference")),
    salaryExpectation: getText(formData, "salaryExpectation"),
    preferredLocations: getText(formData, "preferredLocations"),
    coverLetterTone: parseCoverLetterTone(getText(formData, "coverLetterTone")),
    resumePdfUrl: "",
    isComplete: false,
  };
}

function parseWorkExperience(formData: FormData): WorkExperienceItem[] {
  return [0, 1, 2]
    .map((index) => ({
      companyName: getText(formData, `workExperience.${index}.companyName`),
      jobTitle: getText(formData, `workExperience.${index}.jobTitle`),
      startDate: getText(formData, `workExperience.${index}.startDate`),
      endDate: getText(formData, `workExperience.${index}.endDate`),
      currentlyWorking: formData.get(`workExperience.${index}.currentlyWorking`) === "on",
      responsibilities: getText(formData, `workExperience.${index}.responsibilities`),
    }))
    .filter((item) =>
      [
        item.companyName,
        item.jobTitle,
        item.startDate,
        item.endDate,
        item.responsibilities,
      ].some((value) => value.length > 0),
    );
}

async function uploadResumeIfPresent(
  formData: FormData,
  userId: string,
  existingResumeUrl: string,
): Promise<{ status: "success"; url: string; didUpload: boolean } | { status: "error"; message: string }> {
  const file = formData.get("resumePdf");

  if (!(file instanceof File) || file.size === 0) {
    return { status: "success", url: existingResumeUrl, didUpload: false };
  }

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return { status: "error", message: "Please upload a PDF resume." };
  }

  if (file.size > MAX_RESUME_BYTES) {
    return { status: "error", message: "Resume must be 5MB or smaller." };
  }

  const insforge = await createInsforgeServer();
  const path = `${userId}/resume.pdf`;
  const { data, error } = await insforge.storage.from("resumes").upload(path, file);

  if (error || !data) {
    console.error("[actions/profile] Failed to upload resume", error?.message);
    return { status: "error", message: "Could not upload your resume. Please try again." };
  }

  return { status: "success", url: data.url, didUpload: true };
}

function toProfileRecord(
  userId: string,
  values: ProfileFormValues,
  isComplete: boolean,
  resumePdfUrl: string,
): ProfileRecord {
  return {
    id: userId,
    full_name: values.fullName,
    email: values.email,
    phone: nullable(values.phone),
    location: nullable(values.location),
    current_title: nullable(values.currentTitle),
    experience_level: values.experienceLevel || null,
    years_experience: parseYearsExperience(values.yearsExperience),
    skills: values.skills,
    industries: values.industries,
    work_experience: values.workExperience,
    education: values.education,
    job_titles_seeking: splitCommaList(values.jobTitlesSeeking),
    remote_preference: values.remotePreference || null,
    preferred_locations: splitCommaList(values.preferredLocations),
    salary_expectation: nullable(values.salaryExpectation),
    cover_letter_tone: values.coverLetterTone || null,
    linkedin_url: nullable(values.linkedinUrl),
    portfolio_url: nullable(values.portfolioUrl),
    work_authorization: values.workAuthorization || null,
    resume_pdf_url: nullable(resumePdfUrl),
    is_complete: isComplete,
  };
}

function parseExistingProfile(value: unknown): ExistingProfileRow {
  if (!isRecord(value)) {
    return {
      isComplete: false,
      resumePdfUrl: "",
    };
  }

  return {
    isComplete: value.is_complete === true,
    resumePdfUrl: typeof value.resume_pdf_url === "string" ? value.resume_pdf_url : "",
  };
}

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getTextList(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseYearsExperience(value: string): number | null {
  if (!value) return null;

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function nullable(value: string): string | null {
  return value.length > 0 ? value : null;
}

function parseExperienceLevel(value: string): ExperienceLevel | "" {
  return value === "junior" || value === "mid" || value === "senior" || value === "lead" ? value : "";
}

function parseRemotePreference(value: string): RemotePreference | "" {
  return value === "remote" || value === "onsite" || value === "hybrid" || value === "any" ? value : "";
}

function parseCoverLetterTone(value: string): CoverLetterTone | "" {
  return value === "formal" || value === "casual" || value === "enthusiastic" ? value : "";
}

function parseWorkAuthorization(value: string): WorkAuthorization | "" {
  return value === "citizen" || value === "permanent_resident" || value === "visa_required" ? value : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function captureProfileCompleted(userId: string): Promise<void> {
  try {
    await capturePostHogServerEvent("profile_completed", userId, { userId });
  } catch (error) {
    console.error("[actions/profile] Failed to capture profile_completed", error);
  }
}

function errorState(message: string): SaveProfileActionState {
  return {
    status: "error",
    message,
  };
}

function createSuccessMessage(isComplete: boolean, didUploadResume: boolean): string {
  if (isComplete && didUploadResume) {
    return "Profile and resume saved. You're ready to find jobs.";
  }

  if (didUploadResume) {
    return "Resume uploaded and profile saved. Complete the remaining fields when you're ready.";
  }

  return isComplete
    ? "Profile saved. You're ready to find jobs."
    : "Profile saved. Complete the remaining fields when you're ready.";
}
