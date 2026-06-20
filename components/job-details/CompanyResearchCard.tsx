"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CompanyResearchDossier, ResearchCompanyResponse } from "@/types/companyResearch";

type Props = {
  jobId: string;
  company: string;
  companyResearch: CompanyResearchDossier | null;
};

export function CompanyResearchCard({ jobId, company, companyResearch }: Props): ReactElement {
  const router = useRouter();
  const [dossier, setDossier] = useState<CompanyResearchDossier | null>(companyResearch);
  const [researchState, setResearchState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({
    status: "idle",
    message: "",
  });

  const handleResearch = async (): Promise<void> => {
    setResearchState({ status: "loading", message: "Researching company..." });

    try {
      const response = await fetch("/api/agent/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      });
      const payload: unknown = await response.json();
      const parsed = parseResearchCompanyResponse(payload);

      if (!parsed.success) {
        setResearchState({ status: "error", message: parsed.error });
        return;
      }

      if (!response.ok) {
        setResearchState({
          status: "error",
          message: "Could not research this company right now. Please try again.",
        });
        return;
      }

      setDossier(parsed.data.dossier);
      setResearchState({ status: "success", message: "Company research is ready." });
      router.refresh();
    } catch (error) {
      console.error("[CompanyResearchCard] Research failed", error);
      setResearchState({
        status: "error",
        message: "Could not research this company right now. Please try again.",
      });
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-accent-muted text-accent">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 21V5.8c0-.5.3-.9.8-1.1l6-2.1c.7-.2 1.4.3 1.4 1.1V21" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
              <path d="M14.2 9H18c.6 0 1 .4 1 1v11" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
              <path d="M9 9h2.2M9 13h2.2M9 17h2.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              <path d="M4 21h17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            </svg>
          </span>
          <h2 className="text-lg font-semibold leading-7 text-text-primary">Company Research</h2>
        </div>
        <button
          type="button"
          disabled={researchState.status === "loading"}
          onClick={handleResearch}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold leading-5 text-accent-foreground shadow-card transition-colors hover:bg-accent-dark disabled:bg-accent-dark"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m21 21-4.4-4.4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" stroke="currentColor" strokeWidth="2" />
          </svg>
          {researchState.status === "loading" ? "Researching..." : dossier ? "Refresh Research" : "Research Company"}
        </button>
      </div>

      {researchState.message ? (
        <div
          className={
            researchState.status === "error"
              ? "border-b border-border bg-surface-secondary px-6 py-4 text-sm font-semibold leading-5 text-error"
              : "border-b border-border bg-success-lightest px-6 py-4 text-sm font-semibold leading-5 text-success-foreground"
          }
        >
          {researchState.message}
        </div>
      ) : null}

      {dossier ? <CompanyResearchDossierView dossier={dossier} /> : <CompanyResearchEmptyState company={company} />}
    </section>
  );
}

function CompanyResearchEmptyState({ company }: { company: string }): ReactElement {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-surface-secondary text-text-secondary">
        <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 21V5.8c0-.5.3-.9.8-1.1l6-2.1c.7-.2 1.4.3 1.4 1.1V21" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M14.2 9H18c.6 0 1 .4 1 1v11" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M9 9h2.2M9 13h2.2M9 17h2.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M4 21h17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      </span>
      <p className="mt-5 text-sm font-semibold leading-5 text-text-primary">No research yet</p>
      <p className="mt-2 max-w-[320px] text-sm font-medium leading-5 text-text-muted">
        Click &quot;Research Company&quot; to let the AI browse {company}&apos;s public pages and build a dossier.
      </p>
    </div>
  );
}

function CompanyResearchDossierView({ dossier }: { dossier: CompanyResearchDossier }): ReactElement {
  return (
    <div className="space-y-6 px-6 py-6">
      <DossierParagraph title="Company Overview" value={dossier.companyOverview} />
      <DossierTagList title="Tech Stack" items={dossier.techStack} />
      <DossierBulletList title="Culture" items={dossier.culture} />
      <DossierParagraph title="Why This Role" value={dossier.whyThisRole} />
      <DossierBulletList title="Your Edge" items={dossier.yourEdge} highlight />
      <DossierBulletList title="Gaps to Address" items={dossier.gapsToAddress} />
      <DossierBulletList title="Smart Questions" items={dossier.smartQuestions} />
      <DossierBulletList title="Interview Prep" items={dossier.interviewPrep} />
      <DossierSources sources={dossier.sources} />
    </div>
  );
}

function DossierParagraph({ title, value }: { title: string; value: string }): ReactElement | null {
  if (!value) return null;

  return (
    <section>
      <h3 className="text-xs font-semibold uppercase leading-4 text-text-secondary">{title}</h3>
      <p className="mt-3 text-sm font-medium leading-6 text-text-primary">{value}</p>
    </section>
  );
}

function DossierTagList({ title, items }: { title: string; items: string[] }): ReactElement | null {
  if (items.length === 0) return null;

  return (
    <section>
      <h3 className="text-xs font-semibold uppercase leading-4 text-text-secondary">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full bg-info-lightest px-3 py-1 text-xs font-semibold leading-4 text-info-foreground">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function DossierBulletList({ title, items, highlight = false }: { title: string; items: string[]; highlight?: boolean }): ReactElement | null {
  if (items.length === 0) return null;

  return (
    <section>
      <h3 className="text-xs font-semibold uppercase leading-4 text-text-secondary">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm font-medium leading-6 text-text-primary">
            <span className={`mt-2.5 size-1.5 shrink-0 rounded-full ${highlight ? "bg-success" : "bg-text-secondary"}`} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DossierSources({ sources }: { sources: string[] }): ReactElement | null {
  if (sources.length === 0) return null;

  return (
    <section>
      <h3 className="text-xs font-semibold uppercase leading-4 text-text-secondary">Sources</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {sources.map((source) =>
          isHttpUrl(source) ? (
            <a
              key={source}
              href={source}
              target="_blank"
              rel="noreferrer"
              className="break-all text-xs font-medium leading-5 text-accent hover:text-accent-dark"
            >
              {source}
            </a>
          ) : (
            <span key={source} className="text-xs font-medium leading-5 text-text-muted">
              {source}
            </span>
          ),
        )}
      </div>
    </section>
  );
}

function parseResearchCompanyResponse(value: unknown): ResearchCompanyResponse {
  if (!isRecord(value) || typeof value.success !== "boolean") {
    return {
      success: false,
      error: "Could not read the company research response.",
    };
  }

  if (!value.success) {
    return {
      success: false,
      error: typeof value.error === "string" ? value.error : "Could not research this company right now. Please try again.",
    };
  }

  if (!isRecord(value.data) || !isRecord(value.data.dossier)) {
    return {
      success: false,
      error: "Could not read the company research response.",
    };
  }

  return {
    success: true,
    data: {
      dossier: {
        companyOverview: parseString(value.data.dossier.companyOverview),
        techStack: parseStringArray(value.data.dossier.techStack),
        culture: parseStringArray(value.data.dossier.culture),
        whyThisRole: parseString(value.data.dossier.whyThisRole),
        yourEdge: parseStringArray(value.data.dossier.yourEdge),
        gapsToAddress: parseStringArray(value.data.dossier.gapsToAddress),
        smartQuestions: parseStringArray(value.data.dossier.smartQuestions),
        interviewPrep: parseStringArray(value.data.dossier.interviewPrep),
        sources: parseStringArray(value.data.dossier.sources),
      },
    },
  };
}

function parseString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
