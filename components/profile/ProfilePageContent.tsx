"use client";

import type { ChangeEvent, ReactElement } from "react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveProfile } from "@/actions/profile";
import { calculateProfileCompletion, parseExtractedProfile } from "@/lib/profile";
import type { ProfileCompletion, ProfileFormValues, SaveProfileActionState, WorkExperienceItem } from "@/types/profile";

type Props = {
  initialValues: ProfileFormValues;
  initialCompletion: ProfileCompletion;
};

const initialActionState: SaveProfileActionState = {
  status: "idle",
  message: "",
};

type ExtractionState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

type ProfileTextField =
  | "fullName"
  | "phone"
  | "location"
  | "linkedinUrl"
  | "portfolioUrl"
  | "workAuthorization"
  | "currentTitle"
  | "experienceLevel"
  | "yearsExperience"
  | "jobTitlesSeeking"
  | "remotePreference"
  | "salaryExpectation"
  | "preferredLocations"
  | "coverLetterTone";

type WorkExperienceTextField = "companyName" | "jobTitle" | "startDate" | "endDate" | "responsibilities";

type ParsedExtractionPayload =
  | {
      success: true;
      data: unknown;
    }
  | {
      success: false;
      error: string;
    };

export function ProfilePageContent({ initialValues, initialCompletion }: Props): ReactElement {
  const [actionState, formAction] = useActionState(saveProfile, initialActionState);
  const [formValues, setFormValues] = useState<ProfileFormValues>(initialValues);
  const [skills, setSkills] = useState<string[]>(initialValues.skills);
  const [skillInput, setSkillInput] = useState<string>("");
  const [industries, setIndustries] = useState<string[]>(initialValues.industries);
  const [industryInput, setIndustryInput] = useState<string>("");
  const [workExperience, setWorkExperience] = useState<WorkExperienceItem[]>(initialValues.workExperience);
  const [selectedResumeName, setSelectedResumeName] = useState<string>("");
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);
  const [extractionState, setExtractionState] = useState<ExtractionState>({ status: "idle", message: "" });
  const [clientCompletion, setClientCompletion] = useState<ProfileCompletion>(initialCompletion);
  const completion = extractionState.status === "success" ? clientCompletion : actionState.completion ?? clientCompletion;
  const hasSavedResume = actionState.resumeSaved ?? Boolean(initialValues.resumePdfUrl);

  const addSkill = (): void => {
    const value = skillInput.trim();
    if (!value || skills.includes(value)) return;
    setSkills([...skills, value]);
    setSkillInput("");
  };

  const addIndustry = (): void => {
    const value = industryInput.trim();
    if (!value || industries.includes(value)) return;
    setIndustries([...industries, value]);
    setIndustryInput("");
  };

  const handleSkillInput = (event: ChangeEvent<HTMLInputElement>): void => {
    setSkillInput(event.target.value);
  };

  const handleIndustryInput = (event: ChangeEvent<HTMLInputElement>): void => {
    setIndustryInput(event.target.value);
  };

  const handleCurrentlyWorking = (index: number, checked: boolean): void => {
    setWorkExperience((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              currentlyWorking: checked,
            }
          : item,
      ),
    );
  };

  const updateProfileField = (field: ProfileTextField, value: string): void => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateEducationField = (field: keyof ProfileFormValues["education"], value: string): void => {
    setFormValues((current) => ({
      ...current,
      education: {
        ...current.education,
        [field]: value,
      },
    }));
  };

  const updateWorkExperienceField = (index: number, field: WorkExperienceTextField, value: string): void => {
    setWorkExperience((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const addWorkExperience = (): void => {
    if (workExperience.length >= 3) return;
    setWorkExperience([
      ...workExperience,
      {
        companyName: "",
        jobTitle: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
        responsibilities: "",
      },
    ]);
  };

  const handleResumeChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0] ?? null;
    setSelectedResumeFile(file);
    setSelectedResumeName(file?.name ?? "");
    setExtractionState({ status: "idle", message: "" });
  };

  const handleExtractResume = async (): Promise<void> => {
    if (!selectedResumeFile) {
      setExtractionState({ status: "error", message: "Please select a PDF resume first." });
      return;
    }

    setExtractionState({ status: "loading", message: "Generating profile from resume..." });

    try {
      const formData = new FormData();
      formData.append("resumePdf", selectedResumeFile);

      const response = await fetch("/api/resume/extract", {
        method: "POST",
        body: formData,
      });
      const payload: unknown = await response.json();
      const parsed = parseExtractionPayload(payload);

      if (!parsed.success) {
        setExtractionState({
          status: "error",
          message: parsed.error,
        });
        return;
      }

      if (!response.ok) {
        setExtractionState({
          status: "error",
          message: "Could not generate profile from this resume.",
        });
        return;
      }

      const extractedValues = parseExtractedProfile(parsed.data, formValues.email);
      const nextValues = {
        ...extractedValues,
        email: formValues.email,
        resumePdfUrl: formValues.resumePdfUrl,
      };

      setFormValues(nextValues);
      setSkills(nextValues.skills);
      setIndustries(nextValues.industries);
      setWorkExperience(nextValues.workExperience);
      setClientCompletion(calculateProfileCompletion(nextValues));
      setExtractionState({
        status: "success",
        message: "Profile generated from resume. Review the fields below, then save.",
      });
    } catch (error) {
      console.error("[ProfilePageContent] Resume extraction failed", error);
      setExtractionState({
        status: "error",
        message: "Could not generate profile from this resume.",
      });
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <form action={formAction} className="mx-auto flex w-full max-w-[872px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-0">
        <section className="rounded-xl border border-error/20 bg-surface p-6 shadow-card">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-4 items-center justify-center rounded-full border border-error text-xs font-semibold leading-none text-error">
                  !
                </span>
                <h1 className="text-xl font-semibold leading-7 text-text-primary">Profile needs attention</h1>
              </div>
              <p className="mt-3 max-w-[420px] text-sm font-medium leading-5 text-text-secondary">
                {completion.isComplete
                  ? "Your profile has the details needed for tailored matches and quality resumes."
                  : "Complete the missing fields to improve your chance of getting tailored matches and generating quality resumes."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(completion.missingFields.length > 0 ? completion.missingFields : ["READY"]).map((field) => (
                  <span
                    key={field}
                    className={
                      completion.isComplete
                        ? "rounded-sm bg-success-lightest px-2 py-1 text-xs font-semibold leading-4 text-success-foreground"
                        : "rounded-sm bg-error/10 px-2 py-1 text-xs font-semibold leading-4 text-error"
                    }
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto flex size-32 shrink-0 items-center justify-center rounded-full sm:mx-0">
              <svg viewBox="0 0 120 120" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
                <circle cx="60" cy="60" r="48" fill="none" strokeWidth="12" className="stroke-accent-light" />
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  strokeWidth="12"
                  pathLength="100"
                  strokeDasharray={`${completion.percentage} 100`}
                  strokeLinecap="round"
                  className={completion.isComplete ? "stroke-success" : "stroke-error"}
                />
              </svg>
              <div className="relative flex size-24 items-center justify-center rounded-full bg-surface text-3xl font-semibold leading-9 text-text-primary">
                {completion.percentage}%
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
          <h2 className="text-lg font-semibold leading-7 text-text-primary">Resume</h2>
          <p className="mt-1 text-sm font-medium leading-5 text-text-muted">
            Upload an existing resume to auto-fill the profile.
          </p>

          <label className="profile-upload-zone mt-6 flex min-h-[224px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-secondary px-6 text-center transition-colors hover:bg-surface-muted">
            <input type="file" name="resumePdf" accept="application/pdf" className="sr-only" onChange={handleResumeChange} />
            <span className="flex size-12 items-center justify-center rounded-full border border-border bg-surface text-2xl leading-none text-accent shadow-card">
              ^
            </span>
            <span className="mt-5 text-base font-semibold leading-6 text-text-primary">Click to upload or drag and drop</span>
            <span className="mt-1 text-sm font-medium leading-5 text-text-secondary">
              PDF formatting only. Maximum file size 5MB.
            </span>
            <span className="mt-6 rounded-md border border-border bg-surface px-5 py-2 text-sm font-semibold leading-5 text-text-primary shadow-card">
              Select Resume
            </span>
            {selectedResumeName ? (
              <span className="mt-4 text-sm font-medium leading-5 text-text-primary">Selected: {selectedResumeName}</span>
            ) : null}
          </label>

          {hasSavedResume ? (
            <a
              href="/api/resume/current"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-sm font-medium leading-5 text-success-foreground transition-colors hover:text-success-dark"
            >
              Current resume is saved.
            </a>
          ) : null}

          {selectedResumeName ? (
            <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-surface-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium leading-5 text-text-secondary">Use the selected PDF to populate the profile form.</p>
              <button
                type="button"
                onClick={handleExtractResume}
                disabled={extractionState.status === "loading"}
                className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-3 text-sm font-semibold leading-5 text-accent-foreground shadow-card transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-accent-dark disabled:text-accent-foreground"
              >
                {extractionState.status === "loading" ? "Generating..." : "Generate Profile from Resume"}
              </button>
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-surface-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium leading-5 text-text-secondary">Save your profile, then export a PDF resume from the saved fields.</p>
            <a
              href="/api/resume/generate"
              className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold leading-5 text-text-primary shadow-card transition-colors hover:bg-surface-muted"
            >
              Download Generated Resume
            </a>
          </div>

          {extractionState.status !== "idle" ? (
            <p
              className={
                extractionState.status === "success"
                  ? "mt-4 rounded-md bg-success-lightest px-4 py-3 text-sm font-medium leading-5 text-success-foreground"
                  : extractionState.status === "error"
                    ? "mt-4 rounded-md bg-error/10 px-4 py-3 text-sm font-medium leading-5 text-error"
                    : "mt-4 rounded-md bg-accent-muted px-4 py-3 text-sm font-medium leading-5 text-accent"
              }
            >
              {extractionState.message}
            </p>
          ) : null}

        </section>

        <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
          <header className="border-b border-border pb-5">
            <h2 className="text-xl font-semibold leading-7 text-text-primary">Profile Information</h2>
            <p className="mt-1 text-sm font-medium leading-5 text-text-muted">
              This context is used to accurately represent you in agent interactions.
            </p>
            {actionState.status !== "idle" ? (
              <p
                className={
                  actionState.status === "success"
                    ? "mt-4 rounded-md bg-success-lightest px-4 py-3 text-sm font-medium leading-5 text-success-foreground"
                    : "mt-4 rounded-md bg-error/10 px-4 py-3 text-sm font-medium leading-5 text-error"
                }
              >
                {actionState.message}
              </p>
            ) : null}
          </header>

          <section className="border-b border-border py-8">
            <h3 className="text-base font-semibold leading-6 text-text-primary">Personal Info</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Full Name</span>
                <input
                  name="fullName"
                  className="profile-input"
                  placeholder="Your full name"
                  value={formValues.fullName}
                  onChange={(event) => updateProfileField("fullName", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Email</span>
                <input
                  name="email"
                  className="profile-input bg-surface-secondary text-text-secondary"
                  placeholder="Your account email"
                  value={formValues.email}
                  readOnly
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Phone Number</span>
                <input
                  name="phone"
                  className="profile-input"
                  placeholder="+1 (555) 000-0000"
                  value={formValues.phone}
                  onChange={(event) => updateProfileField("phone", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Location</span>
                <input
                  name="location"
                  className="profile-input"
                  placeholder="City, Country"
                  value={formValues.location}
                  onChange={(event) => updateProfileField("location", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">LinkedIn URL</span>
                <input
                  name="linkedinUrl"
                  className="profile-input"
                  placeholder="https://linkedin.com/in/your-profile"
                  value={formValues.linkedinUrl}
                  onChange={(event) => updateProfileField("linkedinUrl", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Portfolio / Github</span>
                <input
                  name="portfolioUrl"
                  className="profile-input"
                  placeholder="https://github.com/your-handle"
                  value={formValues.portfolioUrl}
                  onChange={(event) => updateProfileField("portfolioUrl", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Work Authorization</span>
                <select
                  name="workAuthorization"
                  className="profile-input"
                  value={formValues.workAuthorization}
                  onChange={(event) => updateProfileField("workAuthorization", event.target.value)}
                >
                  <option value="">Select authorization</option>
                  <option value="citizen">Citizen</option>
                  <option value="permanent_resident">Permanent resident</option>
                  <option value="visa_required">Visa required</option>
                </select>
              </label>
            </div>
          </section>

          <section className="border-b border-border py-8">
            <h3 className="text-base font-semibold leading-6 text-text-primary">Professional Info</h3>
            <div className="mt-6 grid gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Current/Recent Job Title</span>
                <input
                  name="currentTitle"
                  className="profile-input"
                  placeholder="E.g. Frontend Engineer"
                  value={formValues.currentTitle}
                  onChange={(event) => updateProfileField("currentTitle", event.target.value)}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Experience Level</span>
                  <select
                    name="experienceLevel"
                    className="profile-input"
                    value={formValues.experienceLevel}
                    onChange={(event) => updateProfileField("experienceLevel", event.target.value)}
                  >
                    <option value="">Select level</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Years of Experience</span>
                  <input
                    name="yearsExperience"
                    className="profile-input"
                    placeholder="E.g. 4"
                    inputMode="numeric"
                    value={formValues.yearsExperience}
                    onChange={(event) => updateProfileField("yearsExperience", event.target.value)}
                  />
                </label>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Skills</span>
                <div className="flex gap-2">
                  <input className="profile-input flex-1" placeholder="Add a skill" value={skillInput} onChange={handleSkillInput} />
                  <button type="button" className="profile-add-button" onClick={addSkill}>
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <input key={`skill-${skill}`} type="hidden" name="skills" value={skill} />
                  ))}
                  {skills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      className="rounded-md bg-surface-secondary px-3 py-2 text-sm font-semibold leading-5 text-text-primary transition-colors hover:bg-surface-muted"
                      onClick={() => setSkills(skills.filter((item) => item !== skill))}
                    >
                      {skill} <span className="text-text-muted">x</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">
                  Industries Worked In (Optional)
                </span>
                <div className="flex gap-2">
                  <input
                    className="profile-input flex-1"
                    placeholder="E.g. FinTech, Healthcare"
                    value={industryInput}
                    onChange={handleIndustryInput}
                  />
                  <button type="button" className="profile-add-button" onClick={addIndustry}>
                    Add
                  </button>
                </div>
                {industries.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {industries.map((industry) => (
                      <input key={`industry-${industry}`} type="hidden" name="industries" value={industry} />
                    ))}
                    {industries.map((industry) => (
                      <button
                        key={industry}
                        type="button"
                        className="rounded-md bg-surface-secondary px-3 py-2 text-sm font-semibold leading-5 text-text-primary transition-colors hover:bg-surface-muted"
                        onClick={() => setIndustries(industries.filter((item) => item !== industry))}
                      >
                        {industry} <span className="text-text-muted">x</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="border-b border-border py-8">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold leading-6 text-text-primary">Work Experience</h3>
              <button
                type="button"
                className="text-sm font-semibold leading-5 text-accent transition-colors hover:text-accent-dark disabled:text-text-muted"
                onClick={addWorkExperience}
                disabled={workExperience.length >= 3}
              >
                + Add role
              </button>
            </div>
            <div className="mt-6 grid gap-4">
              {workExperience.map((role, index) => (
                <div key={index} className="rounded-lg border border-border bg-surface-secondary p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Company Name</span>
                      <input
                        name={`workExperience.${index}.companyName`}
                        className="profile-input bg-surface"
                        placeholder="Company name"
                        value={role.companyName}
                        onChange={(event) => updateWorkExperienceField(index, "companyName", event.target.value)}
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Job Title</span>
                      <input
                        name={`workExperience.${index}.jobTitle`}
                        className="profile-input bg-surface"
                        placeholder="Job title"
                        value={role.jobTitle}
                        onChange={(event) => updateWorkExperienceField(index, "jobTitle", event.target.value)}
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Start Date</span>
                      <input
                        name={`workExperience.${index}.startDate`}
                        className="profile-input bg-surface"
                        placeholder="E.g. January 2022"
                        value={role.startDate}
                        onChange={(event) => updateWorkExperienceField(index, "startDate", event.target.value)}
                      />
                    </label>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">End Date</span>
                        <label className="flex items-center gap-2 text-xs font-medium leading-4 text-text-primary">
                          <input
                            name={`workExperience.${index}.currentlyWorking`}
                            type="checkbox"
                            checked={role.currentlyWorking}
                            onChange={(event) => handleCurrentlyWorking(index, event.target.checked)}
                            className="size-4 rounded-sm border-border accent-accent"
                          />
                          Currently working here
                        </label>
                      </div>
                      <input
                        name={`workExperience.${index}.endDate`}
                        className="profile-input bg-surface disabled:bg-surface-secondary"
                        disabled={role.currentlyWorking}
                        placeholder="E.g. December 2024"
                        value={role.endDate}
                        onChange={(event) => updateWorkExperienceField(index, "endDate", event.target.value)}
                      />
                    </div>
                  </div>
                  <label className="mt-4 flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Key Responsibilities</span>
                    <textarea
                      name={`workExperience.${index}.responsibilities`}
                      className="profile-input min-h-[76px] resize-y bg-surface"
                      placeholder="Summarize your main responsibilities and impact."
                      value={role.responsibilities}
                      onChange={(event) => updateWorkExperienceField(index, "responsibilities", event.target.value)}
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>

          <section className="border-b border-border py-8">
            <h3 className="text-base font-semibold leading-6 text-text-primary">Education</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Highest Degree</span>
                <select
                  name="highestDegree"
                  className="profile-input"
                  value={formValues.education.highestDegree}
                  onChange={(event) => updateEducationField("highestDegree", event.target.value)}
                >
                  <option value="">Select degree</option>
                  <option>High School</option>
                  <option>Associate</option>
                  <option>Bachelor&apos;s</option>
                  <option>Master&apos;s</option>
                  <option>Doctorate</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Field of Study</span>
                <input
                  name="fieldOfStudy"
                  className="profile-input"
                  placeholder="E.g. Computer Science"
                  value={formValues.education.fieldOfStudy}
                  onChange={(event) => updateEducationField("fieldOfStudy", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Institution Name</span>
                <input
                  name="institutionName"
                  className="profile-input"
                  placeholder="E.g. State University"
                  value={formValues.education.institutionName}
                  onChange={(event) => updateEducationField("institutionName", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Graduation Year</span>
                <input
                  name="graduationYear"
                  className="profile-input"
                  placeholder="YYYY"
                  inputMode="numeric"
                  value={formValues.education.graduationYear}
                  onChange={(event) => updateEducationField("graduationYear", event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="py-8">
            <h3 className="text-base font-semibold leading-6 text-text-primary">Job Preferences</h3>
            <div className="mt-6 grid gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Job Titles Seeking</span>
                <input
                  name="jobTitlesSeeking"
                  className="profile-input"
                  placeholder="E.g. Frontend Engineer, React Developer"
                  value={formValues.jobTitlesSeeking}
                  onChange={(event) => updateProfileField("jobTitlesSeeking", event.target.value)}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Remote Preference</span>
                  <select
                    name="remotePreference"
                    className="profile-input"
                    value={formValues.remotePreference}
                    onChange={(event) => updateProfileField("remotePreference", event.target.value)}
                  >
                    <option value="">Select preference</option>
                    <option value="any">Any</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Salary Expectation (Optional)</span>
                  <input
                    name="salaryExpectation"
                    className="profile-input"
                    placeholder="E.g. $120k+"
                    value={formValues.salaryExpectation}
                    onChange={(event) => updateProfileField("salaryExpectation", event.target.value)}
                  />
                </label>
              </div>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Preferred Locations (Optional)</span>
                <input
                  name="preferredLocations"
                  className="profile-input"
                  placeholder="E.g. New York, London"
                  value={formValues.preferredLocations}
                  onChange={(event) => updateProfileField("preferredLocations", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Cover Letter Tone</span>
                <select
                  name="coverLetterTone"
                  className="profile-input"
                  value={formValues.coverLetterTone}
                  onChange={(event) => updateProfileField("coverLetterTone", event.target.value)}
                >
                  <option value="formal">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="enthusiastic">Enthusiastic</option>
                </select>
              </label>
            </div>
          </section>

          <div className="border-t border-border pt-6">
            <SaveProfileButton />
          </div>
        </section>
      </form>
    </main>
  );
}

function SaveProfileButton(): ReactElement {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold leading-5 text-accent-foreground shadow-card transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-accent-dark disabled:text-accent-foreground"
    >
      {pending ? "Saving..." : "Save Profile"}
    </button>
  );
}

function parseExtractionPayload(value: unknown): ParsedExtractionPayload {
  if (!isRecord(value)) {
    return { success: false, error: "Could not generate profile from this resume." };
  }

  if (value.success === true) {
    return { success: true, data: value.data };
  }

  return {
    success: false,
    error: typeof value.error === "string" ? value.error : "Could not generate profile from this resume.",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
