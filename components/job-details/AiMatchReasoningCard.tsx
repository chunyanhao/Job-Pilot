import type { ReactElement } from "react";

type Props = {
  matchReason: string;
};

export function AiMatchReasoningCard({ matchReason }: Props): ReactElement {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-success-lightest text-success">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 17.5 9 13l3 3 5-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="M7 8h.01M12 6h.01M17 5h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
          </svg>
        </span>
        <h2 className="text-xs font-semibold uppercase leading-4 text-text-secondary">AI Match Reasoning</h2>
      </div>
      <p className="mt-6 text-base font-medium leading-7 text-text-primary">{matchReason}</p>
    </section>
  );
}
