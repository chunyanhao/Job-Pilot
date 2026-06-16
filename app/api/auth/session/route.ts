import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies, setAuthCookies } from "@insforge/sdk/ssr";

type SessionRequestBody = {
  accessToken: string;
  refreshToken?: string;
};

function parseSessionRequestBody(body: unknown): SessionRequestBody | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const candidate = body as Record<string, unknown>;
  const accessToken = candidate.accessToken;
  const refreshToken = candidate.refreshToken;

  if (typeof accessToken !== "string" || !accessToken) {
    return null;
  }

  if (refreshToken !== undefined && typeof refreshToken !== "string") {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = parseSessionRequestBody(await req.json());

    if (!body) {
      return NextResponse.json({ success: false, error: "Invalid session payload" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    setAuthCookies(response.cookies, {
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
    });

    return response;
  } catch (error) {
    console.error("[auth/session]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  clearAuthCookies(response.cookies);

  return response;
}
