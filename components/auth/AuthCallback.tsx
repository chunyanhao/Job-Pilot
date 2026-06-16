"use client";

import { useEffect, useState } from "react";
import { getInsforgeBrowserConfig } from "@/lib/insforge-client";

const pkceVerifierKey = "insforge_pkce_verifier";

type OAuthExchangeResponse = {
  accessToken?: string;
  refreshToken?: string;
  user?: unknown;
};

function parseOAuthExchangeResponse(body: unknown): OAuthExchangeResponse | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const candidate = body as Record<string, unknown>;

  return {
    accessToken: typeof candidate.accessToken === "string" ? candidate.accessToken : undefined,
    refreshToken: typeof candidate.refreshToken === "string" ? candidate.refreshToken : undefined,
    user: candidate.user,
  };
}

export function AuthCallback() {
  const [statusMessage, setStatusMessage] = useState("Finishing sign in...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const finishOAuthSignIn = async (): Promise<void> => {
      try {
        const params = new URLSearchParams(window.location.search);
        const providerError = params.get("error") || params.get("insforge_error");
        const code = params.get("insforge_code");

        if (providerError) {
          setErrorMessage("Sign in was cancelled or could not be completed.");
          return;
        }

        if (!code) {
          setErrorMessage("The sign in callback was missing its verification code.");
          return;
        }

        const codeVerifier = window.sessionStorage.getItem(pkceVerifierKey);

        if (!codeVerifier) {
          setErrorMessage("The sign in session expired. Please start again.");
          return;
        }

        const { baseUrl, anonKey } = await getInsforgeBrowserConfig();
        const exchangeUrl = new URL("/api/auth/oauth/exchange", baseUrl).toString();
        const exchangeResponse = await fetch(exchangeUrl, {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${anonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            code_verifier: codeVerifier,
          }),
        });

        const exchangeBody: unknown = await exchangeResponse.json();

        if (!exchangeResponse.ok) {
          console.error("[AuthCallback] OAuth exchange failed", exchangeBody);
          setErrorMessage("We could not verify your sign in. Please try again.");
          return;
        }

        const session = parseOAuthExchangeResponse(exchangeBody);

        if (!session?.accessToken) {
          console.error("[AuthCallback] OAuth exchange returned no access token", exchangeBody);
          setErrorMessage("Sign in did not return a valid session. Please try again.");
          return;
        }

        window.sessionStorage.removeItem(pkceVerifierKey);
        window.history.replaceState(null, "", "/callback");
        setStatusMessage("Opening your dashboard...");

        const sessionResponse = await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
          }),
        });

        if (!sessionResponse.ok) {
          console.error("[AuthCallback] Failed to persist session", await sessionResponse.text());
          setErrorMessage("We signed you in, but could not save the browser session.");
          return;
        }

        window.location.replace("/dashboard");
      } catch (error) {
        console.error("[AuthCallback]", error);
        setErrorMessage("We could not finish sign in. Please try again.");
      }
    };

    void finishOAuthSignIn();
  }, []);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1440px] items-center justify-center px-6 py-16">
      <section className="w-full max-w-[448px] rounded-xl border border-border bg-surface p-6 text-center shadow-card">
        <p className="text-xs font-medium uppercase leading-4 text-accent">JobPilot</p>
        <h1 className="mt-3 text-2xl font-semibold leading-8 text-text-slate">
          {errorMessage ? "Sign in needs another try" : statusMessage}
        </h1>
        <p className="mt-3 text-sm font-medium leading-5 text-text-secondary">
          {errorMessage ?? "Keep this tab open while we connect your account."}
        </p>
        {errorMessage ? (
          <a
            href="/login"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-text-slate px-4 text-sm font-medium text-surface shadow-card transition-colors hover:bg-overlay"
          >
            Back to sign in
          </a>
        ) : null}
      </section>
    </div>
  );
}
