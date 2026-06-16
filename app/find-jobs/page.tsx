import { AppNavbar } from "@/components/layout/AppNavbar";

export default function FindJobsPage() {
  return (
    <main className="min-h-screen bg-background">
      <AppNavbar />
      <section className="mx-auto max-w-[1440px] px-6 py-8">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
          <p className="text-xs font-medium uppercase leading-4 text-accent">Find Jobs</p>
          <h1 className="mt-3 text-2xl font-semibold leading-8 text-text-slate">Search for your next match</h1>
          <p className="mt-3 text-sm font-medium leading-5 text-text-secondary">
            Job search UI begins in Phase 3. Auth protection is active for this route.
          </p>
        </div>
      </section>
    </main>
  );
}
