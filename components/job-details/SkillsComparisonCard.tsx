import type { ReactElement } from "react";

type Props = {
  matchedSkills: string[];
  missingSkills: string[];
};

export function SkillsComparisonCard({ matchedSkills, missingSkills }: Props): ReactElement {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-xs font-semibold uppercase leading-4 text-text-secondary">Required Skills vs Your Profile</h2>

      <div className="mt-5">
        <p className="text-sm font-medium leading-5 text-text-muted">You have</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {matchedSkills.length > 0 ? (
            matchedSkills.map((skill) => (
              <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-success-lightest px-3 py-1 text-xs font-semibold leading-4 text-success-foreground">
                <svg className="size-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="m2.5 6 2 2 5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                </svg>
                {skill}
              </span>
            ))
          ) : (
            <span className="text-sm font-medium leading-5 text-text-muted">No matched skills were identified.</span>
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium leading-5 text-text-muted">Gap skills</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {missingSkills.length > 0 ? (
            missingSkills.map((skill) => (
              <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-accent-muted px-3 py-1 text-xs font-semibold leading-4 text-accent">
                <svg className="size-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="m3 3 6 6M9 3 3 9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
                </svg>
                {skill}
              </span>
            ))
          ) : (
            <span className="text-sm font-medium leading-5 text-text-muted">No gap skills were identified.</span>
          )}
        </div>
      </div>
    </section>
  );
}
