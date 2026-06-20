import { NextRequest, NextResponse } from "next/server";

import { extractProfileFromResume } from "@/agent/profile-extractor";
import { getCurrentUser, hasInsforgeConfig } from "@/lib/insforge-server";
import type { ResumeExtractionResponse } from "@/types/profile";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest): Promise<NextResponse<ResumeExtractionResponse>> {
  try {
    if (!hasInsforgeConfig()) {
      return errorResponse("Resume extraction is not configured yet.", 503);
    }

    const user = await getCurrentUser();
    if (!user) {
      return errorResponse("Please sign in again before extracting your profile.", 401);
    }

    const formData = await req.formData();
    const file = formData.get("resumePdf");

    if (!(file instanceof File) || file.size === 0) {
      return errorResponse("Please select a PDF resume first.", 400);
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return errorResponse("Please upload a PDF resume.", 400);
    }

    if (file.size > MAX_RESUME_BYTES) {
      return errorResponse("Resume must be 5MB or smaller.", 400);
    }

    const email = typeof user.email === "string" ? user.email : "";
    const result = await extractProfileFromResume(await file.arrayBuffer(), email);

    if (!result.success) {
      return errorResponse(result.error, 400);
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("[api/resume/extract]", error);
    return errorResponse("Something went wrong while extracting your profile.", 500);
  }
}

function errorResponse(message: string, status: number): NextResponse<ResumeExtractionResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}
