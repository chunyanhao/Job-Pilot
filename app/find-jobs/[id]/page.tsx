import { AppNavbar } from "@/components/layout/AppNavbar";

type JobDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-background">
      <AppNavbar />
      <section className="mx-auto max-w-[1440px] px-6 py-8">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
          <p className="text-xs font-medium uppercase leading-4 text-accent">Job Details</p>
          <h1 className="mt-3 text-2xl font-semibold leading-8 text-text-slate">Job {id}</h1>
          <p className="mt-3 text-sm font-medium leading-5 text-text-secondary">
            The complete job details UI begins in Phase 4. Auth protection is active for this route.
          </p>
        </div>
      </section>
    </main>
  );
}
