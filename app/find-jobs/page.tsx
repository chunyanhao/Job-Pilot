import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { FindJobsPageContent } from "@/components/find-jobs/FindJobsPageContent";
import { createInsforgeServer, getCurrentUser, hasInsforgeConfig } from "@/lib/insforge-server";
import { listSavedJobs, parseJobsListFilters } from "@/lib/savedJobs";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FindJobsPage({ searchParams }: Props): Promise<ReactElement> {
  const resolvedSearchParams = await searchParams;
  const filters = parseJobsListFilters(resolvedSearchParams);
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=%2Ffind-jobs");
  }

  const insforge = hasInsforgeConfig() ? await createInsforgeServer() : null;
  const jobsResult = insforge
    ? await listSavedJobs(insforge, user.id, filters)
    : {
        success: false as const,
        error: "Saved jobs are not configured yet.",
        jobs: [],
        totalItems: 0,
        totalPages: 1,
        filters,
      };
  const initialLocation = insforge ? await getInitialSearchLocation(insforge, user.id) : "";

  return (
    <main className="min-h-screen bg-background">
      <AppNavbar />
      <FindJobsPageContent
        initialFilters={jobsResult.filters}
        initialLocation={initialLocation}
        jobs={jobsResult.jobs}
        jobsError={jobsResult.success ? "" : jobsResult.error}
        totalItems={jobsResult.totalItems}
        totalPages={jobsResult.totalPages}
      />
    </main>
  );
}

async function getInitialSearchLocation(
  insforge: Awaited<ReturnType<typeof createInsforgeServer>>,
  userId: string,
): Promise<string> {
  const { data, error } = await insforge.database
    .from("profiles")
    .select("location, preferred_locations")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[find-jobs/page] Failed to load search defaults", error.message);
    return "";
  }

  if (!isRecord(data)) return "";

  const preferredLocations = parseStringArray(data.preferred_locations);
  return getSearchableLocation(preferredLocations, parseString(data.location));
}

function parseString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getSearchableLocation(preferredLocations: string[], profileLocation: string): string {
  const candidates = [...preferredLocations, profileLocation];

  for (const candidate of candidates) {
    const normalized = normalizeSearchLocation(candidate);
    if (normalized) return normalized;
  }

  return "";
}

function normalizeSearchLocation(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const parts = trimmed
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && !isRemoteOnlyLocation(part));

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return isRemoteOnlyLocation(trimmed) ? "" : trimmed;
}

function isRemoteOnlyLocation(value: string): boolean {
  return /^(remote|anywhere|work from home|wfh)$/i.test(value.trim());
}
