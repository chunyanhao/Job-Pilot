"use client";

import type { ChangeEvent, ReactElement } from "react";
import { useState } from "react";

const initialSkills = ["React", "TypeScript", "Next.js", "Tailwind CSS"];

export function ProfilePageContent(): ReactElement {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [skillInput, setSkillInput] = useState<string>("");
  const [industries, setIndustries] = useState<string[]>([]);
  const [industryInput, setIndustryInput] = useState<string>("");
  const [currentlyWorking, setCurrentlyWorking] = useState<boolean>(true);

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

  const handleCurrentlyWorking = (event: ChangeEvent<HTMLInputElement>): void => {
    setCurrentlyWorking(event.target.checked);
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex w-full max-w-[872px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-0">
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
                Complete the missing fields to improve your chance of getting tailored matches and generating quality
                resumes.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["PHONE", "LOCATION", "EDUCATION"].map((field) => (
                  <span
                    key={field}
                    className="rounded-sm bg-error/10 px-2 py-1 text-xs font-semibold leading-4 text-error"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>

            <div className="profile-completion-ring mx-auto flex size-32 shrink-0 items-center justify-center rounded-full sm:mx-0">
              <div className="flex size-24 items-center justify-center rounded-full bg-surface text-3xl font-semibold leading-9 text-text-primary">
                70%
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
          <h2 className="text-lg font-semibold leading-7 text-text-primary">Resume</h2>
          <p className="mt-1 text-sm font-medium leading-5 text-text-muted">
            Upload an existing resume to auto-fill the profile, or generate a new tailored one from your details below.
          </p>

          <label className="profile-upload-zone mt-6 flex min-h-[224px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-secondary px-6 text-center transition-colors hover:bg-surface-muted">
            <input type="file" accept="application/pdf" className="sr-only" />
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
          </label>

          <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium leading-5 text-text-muted">Need a fresh document based on the fields below?</p>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-3 text-sm font-semibold leading-5 text-accent-foreground shadow-card transition-colors hover:bg-accent-dark"
            >
              Generate Resume from Profile
            </button>
          </div>
        </section>

        <form className="rounded-xl border border-border bg-surface p-6 shadow-card">
          <header className="border-b border-border pb-5">
            <h2 className="text-xl font-semibold leading-7 text-text-primary">Profile Information</h2>
            <p className="mt-1 text-sm font-medium leading-5 text-text-muted">
              This context is used to accurately represent you in agent interactions.
            </p>
          </header>

          <section className="border-b border-border py-8">
            <h3 className="text-base font-semibold leading-6 text-text-primary">Personal Info</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Full Name</span>
                <input className="profile-input" defaultValue="Faizan Ali" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Email</span>
                <input className="profile-input bg-surface-secondary text-text-secondary" defaultValue="faizan@jsmastery.pro" readOnly />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Phone Number</span>
                <input className="profile-input" placeholder="+1 (555) 000-0000" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Location</span>
                <input className="profile-input" placeholder="City, Country" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">LinkedIn URL</span>
                <input className="profile-input" defaultValue="https://linkedin.com/in/faizan" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Portfolio / Github</span>
                <input className="profile-input" defaultValue="https://github.com/jsmastery" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Work Authorization</span>
                <select className="profile-input">
                  <option>Citizen</option>
                  <option>Permanent resident</option>
                  <option>Visa required</option>
                </select>
              </label>
            </div>
          </section>

          <section className="border-b border-border py-8">
            <h3 className="text-base font-semibold leading-6 text-text-primary">Professional Info</h3>
            <div className="mt-6 grid gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Current/Recent Job Title</span>
                <input className="profile-input" defaultValue="Frontend Engineer" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Experience Level</span>
                  <select className="profile-input">
                    <option>Junior</option>
                    <option>Mid</option>
                    <option>Senior</option>
                    <option>Lead</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Years of Experience</span>
                  <input className="profile-input" defaultValue="4" inputMode="numeric" />
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
              <button type="button" className="text-sm font-semibold leading-5 text-accent transition-colors hover:text-accent-dark">
                + Add role
              </button>
            </div>
            <div className="mt-6 rounded-lg border border-border bg-surface-secondary p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Company Name</span>
                  <input className="profile-input bg-surface" defaultValue="Vercel" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Job Title</span>
                  <input className="profile-input bg-surface" defaultValue="Frontend Engineer" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Start Date</span>
                  <input className="profile-input bg-surface" defaultValue="January 2022" />
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">End Date</span>
                    <label className="flex items-center gap-2 text-xs font-medium leading-4 text-text-primary">
                      <input
                        type="checkbox"
                        checked={currentlyWorking}
                        onChange={handleCurrentlyWorking}
                        className="size-4 rounded-sm border-border accent-accent"
                      />
                      Currently working here
                    </label>
                  </div>
                  <input className="profile-input bg-surface disabled:bg-surface-secondary" disabled={currentlyWorking} placeholder="---------- ----" />
                </div>
              </div>
              <label className="mt-4 flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Key Responsibilities</span>
                <textarea
                  className="profile-input min-h-[76px] resize-y bg-surface"
                  defaultValue="Built Next.js features and optimized web vitals. Led a team of 3 developers."
                />
              </label>
            </div>
          </section>

          <section className="border-b border-border py-8">
            <h3 className="text-base font-semibold leading-6 text-text-primary">Education</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Highest Degree</span>
                <select className="profile-input">
                  <option>High School</option>
                  <option>Associate</option>
                  <option>Bachelor&apos;s</option>
                  <option>Master&apos;s</option>
                  <option>Doctorate</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Field of Study</span>
                <input className="profile-input" defaultValue="Computer Science" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Institution Name</span>
                <input className="profile-input" placeholder="E.g. State University" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Graduation Year</span>
                <input className="profile-input" placeholder="YYYY" inputMode="numeric" />
              </label>
            </div>
          </section>

          <section className="py-8">
            <h3 className="text-base font-semibold leading-6 text-text-primary">Job Preferences</h3>
            <div className="mt-6 grid gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Job Titles Seeking</span>
                <input className="profile-input" defaultValue="Frontend Engineer, React Developer" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Remote Preference</span>
                  <select className="profile-input">
                    <option>Any</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                    <option>Onsite</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Salary Expectation (Optional)</span>
                  <input className="profile-input" placeholder="E.g. $120k+" />
                </label>
              </div>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Preferred Locations (Optional)</span>
                <input className="profile-input" placeholder="E.g. New York, London" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase leading-4 text-text-secondary">Cover Letter Tone</span>
                <select className="profile-input">
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Enthusiastic</option>
                </select>
              </label>
            </div>
          </section>

          <div className="border-t border-border pt-6">
            <button
              type="button"
              className="flex h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold leading-5 text-accent-foreground shadow-card transition-colors hover:bg-accent-dark"
            >
              Save Profile
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
