import { NextResponse } from "next/server";

import { createInsforgeServer, getCurrentUser, hasInsforgeConfig } from "@/lib/insforge-server";

type ProfileResumeRow = {
  resume_pdf_url?: unknown;
};

export async function GET(): Promise<NextResponse> {
  try {
    if (!hasInsforgeConfig()) {
      return textResponse("Resume access is not configured yet.", 503);
    }

    const user = await getCurrentUser();
    if (!user) {
      return textResponse("Please sign in again before opening your resume.", 401);
    }

    const insforge = await createInsforgeServer();
    const { data, error } = await insforge.database
      .from("profiles")
      .select("resume_pdf_url")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[api/resume/current] Failed to load profile", error.message);
      return textResponse("Could not load your resume. Please try again.", 500);
    }

    const resumeUrl = readResumeUrl(data);
    if (!resumeUrl) {
      return textResponse("No resume has been saved yet.", 404);
    }

    const downloadResult = await downloadResume(insforge, getResumeKeyCandidates(resumeUrl, user.id));

    if (!downloadResult.success) {
      return textResponse("Could not open your resume. Please try uploading it again.", 404);
    }

    return new NextResponse(await downloadResult.blob.arrayBuffer(), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": 'inline; filename="resume.pdf"',
        "Content-Type": downloadResult.blob.type || "application/pdf",
      },
    });
  } catch (error) {
    console.error("[api/resume/current]", error);
    return textResponse("Something went wrong while opening your resume.", 500);
  }
}

async function downloadResume(
  insforge: Awaited<ReturnType<typeof createInsforgeServer>>,
  keys: string[],
): Promise<{ success: true; blob: Blob } | { success: false }> {
  for (const key of keys) {
    const { data, error } = await insforge.storage.from("resumes").download(key);

    if (!error && data) {
      return { success: true, blob: data };
    }
  }

  return { success: false };
}

function getResumeKeyCandidates(resumeUrl: string, userId: string): string[] {
  const parsedKey = parseResumeKeyFromUrl(resumeUrl);
  const defaultKey = `${userId}/resume.pdf`;
  return [parsedKey, defaultKey].filter((key, index, keys): key is string => Boolean(key) && keys.indexOf(key) === index);
}

function parseResumeKeyFromUrl(resumeUrl: string): string {
  try {
    const url = new URL(resumeUrl);
    const marker = "/objects/";
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) return "";

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return "";
  }
}

function readResumeUrl(value: unknown): string {
  if (!isRecord(value)) return "";
  return typeof value.resume_pdf_url === "string" ? value.resume_pdf_url : "";
}

function isRecord(value: unknown): value is ProfileResumeRow {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function textResponse(message: string, status: number): NextResponse {
  return new NextResponse(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
