import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { JobDetailsErrorState } from "@/components/job-details/JobDetailsErrorState";
import { JobDetailsPageContent } from "@/components/job-details/JobDetailsPageContent";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { getJobDetails } from "@/lib/jobDetails";
import { createInsforgeServer, getCurrentUser, hasInsforgeConfig } from "@/lib/insforge-server";

type JobDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JobDetailsPage({ params }: JobDetailsPageProps): Promise<ReactElement> {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/find-jobs/${id}`)}`);
  }

  const insforge = hasInsforgeConfig() ? await createInsforgeServer() : null;
  const result = insforge
    ? await getJobDetails(insforge, user.id, id)
    : {
        success: false as const,
        error: "Saved jobs are not configured yet.",
      };

  return (
    <main className="min-h-screen bg-background">
      <AppNavbar />
      {result.success ? <JobDetailsPageContent job={result.job} /> : <JobDetailsErrorState message={result.error} />}
    </main>
  );
}
