import Image from "next/image";

const searchFeatures = [
  {
    title: "Find jobs that actually fit",
    description: "Search by title and location or paste a job link. Get matched roles you can quickly scan.",
  },
  {
    title: "Know the Company Before You Apply",
    description: "Stop guessing what a company is about. JobPilot browses their site and gives you everything you need to apply with confidence.",
  },
  {
    title: "Keep track of every application",
    description: "Keep a clear view of every job you've found, tailored. Your activity and progress all stay in one simple place.",
  },
];

const confidenceFeatures = [
  {
    title: "Understand your match score",
    description: "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what's missing.",
  },
  {
    title: "AI-Powered Job Matching",
    description: "Stop guessing which jobs are worth applying to. JobPilot scores every role against your actual skills so you focus on the ones that matter.",
  },
  {
    title: "Focus on the right roles",
    description: "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.",
  },
];

export function FeatureSections() {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <div className="section-grid grid border-x border-border md:grid-cols-[1fr_1.05fr]">
          <div className="flex flex-col justify-center border-b border-border px-8 py-14 md:border-b-0 md:border-r md:px-16 md:py-20">
            <h2 className="max-w-[420px] text-[40px] font-semibold leading-[1.08] text-text-slate md:text-[48px]">
              Manage Your Job Search With Ease
            </h2>
            <div className="mt-12 border-l-2 border-accent-light">
              {searchFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`border-border py-7 pl-6 ${index < searchFeatures.length - 1 ? "border-b" : ""}`}
                >
                  <h3 className="text-base font-semibold leading-6 text-text-dark">{feature.title}</h3>
                  <p className="mt-3 max-w-[520px] text-sm font-medium leading-6 text-text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center bg-surface-muted px-8 py-14 md:px-10 md:py-20">
            <Image
              src="/images/jobs-lists.png"
              alt="JobPilot jobs list with match scores"
              width={2364}
              height={1778}
              className="w-full max-w-[560px] rounded-xl shadow-card"
            />
          </div>
        </div>

        <div className="diagonal-band h-20 border-x border-y border-border" />

        <div className="section-grid grid border-x border-border md:grid-cols-[1.05fr_1fr]">
          <div className="flex items-center justify-center bg-surface-muted px-8 py-14 md:px-12 md:py-20">
            <Image
              src="/images/agnet-log.png"
              alt="JobPilot agent log preview"
              width={2144}
              height={1656}
              className="w-full max-w-[520px] rounded-xl shadow-card"
            />
          </div>

          <div className="flex flex-col justify-center border-t border-border px-8 py-14 md:border-l md:border-t-0 md:px-16 md:py-20">
            <h2 className="max-w-[500px] text-[40px] font-semibold leading-[1.08] text-text-slate md:text-[48px]">
              Apply With More Confidence, Every Time
            </h2>
            <div className="mt-12 border-l-2 border-success-light">
              {confidenceFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`border-border py-7 pl-6 ${index < confidenceFeatures.length - 1 ? "border-b" : ""}`}
                >
                  <h3 className="text-base font-semibold leading-6 text-text-dark">{feature.title}</h3>
                  <p className="mt-3 max-w-[560px] text-sm font-medium leading-6 text-text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="diagonal-band h-20 border-x border-y border-border" />
      </div>
    </section>
  );
}
