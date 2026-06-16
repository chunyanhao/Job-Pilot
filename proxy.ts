import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@insforge/sdk/ssr/middleware";
import type { CookieOptions, CookieStore } from "@insforge/sdk/ssr/middleware";
import { getInsforgePublicConfig, hasInsforgeConfig } from "@/lib/insforge-config";

const protectedRoutePrefixes = ["/dashboard", "/profile", "/find-jobs"];
type CookieWriteInput = { name: string; value: string } & CookieOptions;

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutePrefixes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function withSessionCookies(source: NextResponse, target: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });

  return target;
}

function createRequestCookieStore(cookies: NextRequest["cookies"]): CookieStore {
  return {
    get: (name: string) => cookies.get(name),
    set: (nameOrOptions: string | CookieWriteInput, value?: string) => {
      if (typeof nameOrOptions === "string") {
        cookies.set(nameOrOptions, value ?? "");
        return;
      }

      cookies.set({
        name: nameOrOptions.name,
        value: nameOrOptions.value,
      });
    },
    delete: (nameOrOptions: string | { name: string }) => {
      cookies.delete(typeof nameOrOptions === "string" ? nameOrOptions : nameOrOptions.name);
    },
  };
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const isProtected = isProtectedRoute(pathname);

  if (!hasInsforgeConfig()) {
    if (isProtected) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  }

  const session = await updateSession({
    ...getInsforgePublicConfig(),
    requestCookies: createRequestCookieStore(request.cookies),
    responseCookies: response.cookies,
  }).catch((error: unknown) => {
    console.error("[proxy] Failed to update auth session", error);
    return { accessToken: null };
  });

  if (isProtected && !session.accessToken) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return withSessionCookies(response, NextResponse.redirect(redirectUrl));
  }

  if (pathname === "/login" && session.accessToken) {
    return withSessionCookies(response, NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  return response;
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/profile/:path*", "/find-jobs/:path*"],
};
