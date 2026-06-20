import type { ReactElement } from "react";
import type { JobDetail } from "@/types/jobDetails";

type Props = {
  job: JobDetail;
};

type InfoCard = {
  label: string;
  value: string;
  tone: "success" | "info" | "accent" | "neutral";
  icon: ReactElement;
};

export function JobInfoCards({ job }: Props): ReactElement {
  const cards: InfoCard[] = [
    {
      label: "Salary Est.",
      value: job.salary,
      tone: "success",
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3v18M17 7.5c-.9-.9-2.4-1.5-4.1-1.5-2.4 0-4.4 1.1-4.4 2.8 0 4.3 8.8 1.7 8.8 6 0 1.7-2 2.8-4.5 2.8-2 0-3.7-.7-4.7-1.8" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        </svg>
      ),
    },
    {
      label: "Location",
      value: job.location,
      tone: "info",
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 10.5c0 5.2-7 10-7 10s-7-4.8-7-10a7 7 0 0 1 14 0Z" stroke="currentColor" strokeWidth="2" />
          <path d="M12 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      label: "Job Type",
      value: job.jobType,
      tone: "accent",
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" stroke="currentColor" strokeWidth="2" />
          <path d="M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
          <path d="M9 13h6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        </svg>
      ),
    },
    {
      label: "Date Found",
      value: job.foundAtLabel,
      tone: "neutral",
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 3v4M17 3v4M5 9h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
          <path d="M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="flex min-h-[78px] items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-card">
          <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${getIconClass(card.tone)}`}>{card.icon}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-5 text-text-primary">{card.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase leading-4 text-text-muted">{card.label}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

function getIconClass(tone: InfoCard["tone"]): string {
  if (tone === "success") return "bg-success-lightest text-success";
  if (tone === "info") return "bg-info-lightest text-info-medium";
  if (tone === "accent") return "bg-accent-muted text-accent";
  return "bg-surface-secondary text-text-secondary";
}
