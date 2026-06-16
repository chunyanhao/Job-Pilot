import { NextResponse } from "next/server";
import { getInsforgePublicConfig } from "@/lib/insforge-config";

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json({ success: true, data: getInsforgePublicConfig() });
  } catch (error) {
    console.error("[auth/config]", error);
    return NextResponse.json({ success: false, error: "Auth is not configured" }, { status: 500 });
  }
}
