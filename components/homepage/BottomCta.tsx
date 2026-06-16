import { TrackedLink } from "@/components/analytics/TrackedLink";

type BottomCtaProps = {
  primaryHref?: string;
  secondaryHref?: string;
};

export function BottomCta({ primaryHref = "/login", secondaryHref = "/find-jobs" }: BottomCtaProps) {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-[1280px] border-x border-t border-border px-6 md:px-10">
        <div className="hero-wash px-6 py-20 text-center md:px-10 md:py-24">
          <h2 className="mx-auto max-w-[820px] text-[42px] font-semibold leading-[1.06] text-text-slate md:text-[56px]">
            Your next job search can feel a lot less overwhelming
          </h2>
          <p className="mx-auto mt-6 max-w-[640px] text-base font-medium leading-6 text-text-secondary">
            Set up your profile, upload your resume, and start finding matches in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <TrackedLink
              href={primaryHref}
              className="rounded-md bg-text-slate px-6 py-3 text-sm font-medium text-surface shadow-card transition-colors hover:bg-overlay"
              eventName="cta_clicked"
              eventProperties={{ href: primaryHref, label: "Get Started", surface: "home_bottom_cta" }}
            >
              Get Started
            </TrackedLink>
            <TrackedLink
              href={secondaryHref}
              className="rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium text-text-primary shadow-card transition-colors hover:bg-surface-secondary"
              eventName="cta_clicked"
              eventProperties={{ href: secondaryHref, label: "Find Your First Match", surface: "home_bottom_cta" }}
            >
              Find Your First Match
            </TrackedLink>
          </div>
        </div>
        <div className="diagonal-band h-20 border-t border-border" />
      </div>
    </section>
  );
}
