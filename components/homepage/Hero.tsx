import Image from "next/image";
import Link from "next/link";

type HeroProps = {
  primaryHref?: string;
  secondaryHref?: string;
};

export function Hero({ primaryHref = "/login", secondaryHref = "/find-jobs" }: HeroProps) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-[1280px] px-6 pt-16 md:px-10">
        <div className="hero-wash border border-border px-6 py-16 text-center md:px-10 md:py-20">
          <h1 className="mx-auto max-w-[760px] text-[44px] font-semibold leading-[1.04] text-text-slate md:text-[64px]">
            Job hunting is hard.
            <br />
            Your tools shouldn&apos;t be.
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-base font-medium leading-6 text-text-secondary">
            Stop applying blind. JobPilot finds the jobs, researches the companies, and gives you everything you need to stand out.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="rounded-md bg-text-slate px-6 py-3 text-sm font-medium text-surface shadow-card transition-colors hover:bg-overlay"
            >
              Get Started
            </Link>
            <Link
              href={secondaryHref}
              className="rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium text-text-primary shadow-card transition-colors hover:bg-surface-secondary"
            >
              Find Your First Match
            </Link>
          </div>
        </div>

        <div className="bg-surface-secondary px-6 py-12 md:px-16">
          <Image
            src="/images/dashboard-demo.png"
            alt="JobPilot dashboard preview"
            width={4788}
            height={2416}
            priority
            className="mx-auto w-full max-w-[1120px] rounded-xl shadow-preview"
          />
        </div>
      </div>
    </section>
  );
}
