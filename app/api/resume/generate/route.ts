import { NextResponse } from "next/server";

import { generateResumePdf } from "@/lib/resume-pdf";
import { createInsforgeServer, getCurrentUser, hasInsforgeConfig } from "@/lib/insforge-server";
import { parseProfileRecord } from "@/lib/profile";

type ProfileRow = Record<string, unknown>;

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    if (!hasInsforgeConfig()) {
      return textResponse("Resume generation is not configured yet.", 503);
    }

    const user = await getCurrentUser();
    if (!user) {
      return textResponse("Please sign in again before generating your resume.", 401);
    }

    const insforge = await createInsforgeServer();
    const { data, error } = await insforge.database.from("profiles").select("*").eq("id", user.id).maybeSingle();

    if (error) {
      console.error("[api/resume/generate] Failed to load profile", error.message);
      return textResponse("Could not load your saved profile. Please try again.", 500);
    }

    if (!isProfileRow(data)) {
      return textResponse("Save your profile before generating a resume.", 404);
    }

    const email = typeof user.email === "string" ? user.email : "";
    const profile = parseProfileRecord(data, email);
    const pdf = await generateResumePdf(profile);
    const filename = createResumeFilename(profile.fullName);

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    console.error("[api/resume/generate]", error);
    return textResponse("Something went wrong while generating your resume.", 500);
  }
}

function createResumeFilename(fullName: string): string {
  const name = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${name || "profile"}-resume.pdf`;
}

function isProfileRow(value: unknown): value is ProfileRow {
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
