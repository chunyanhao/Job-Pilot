"use client";

import { useState } from "react";
import { createInsforgeBrowser, getInsforgeBrowserConfig } from "@/lib/insforge-client";
import { capturePostHogEvent } from "@/lib/posthog-client";
import type { AuthProvider } from "@/lib/posthog-events";

const pkceProviderKey = "jobpilot_oauth_provider";

type OAuthProvider = AuthProvider;

const providers: Array<{ id: OAuthProvider; label: string }> = [
  { id: "google", label: "Continue with Google" },
  { id: "github", label: "Continue with GitHub" },
];

export function LoginPanel() {
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: OAuthProvider): Promise<void> => {
    setPendingProvider(provider);
    setErrorMessage(null);
    window.sessionStorage.setItem(pkceProviderKey, provider);
    capturePostHogEvent("auth_sign_in_started", { provider });

    try {
      const config = await getInsforgeBrowserConfig();
      const insforge = createInsforgeBrowser(config);
      const redirectTo = new URL("/callback", window.location.origin).toString();
      const { error } = await insforge.auth.signInWithOAuth(provider, {
        redirectTo,
        additionalParams: provider === "google" ? { prompt: "select_account" } : undefined,
      });

      if (error) {
        console.error("[LoginPanel]", error.message);
        capturePostHogEvent("auth_sign_in_failed", {
          provider,
          reason: "provider_rejected",
          stage: "start",
        });
        setErrorMessage("We could not start sign in. Please try again.");
        setPendingProvider(null);
      }
    } catch (error) {
      console.error("[LoginPanel]", error);
      capturePostHogEvent("auth_sign_in_failed", {
        provider,
        reason: "config_error",
        stage: "start",
      });
      setErrorMessage("Auth is not configured yet. Check the InsForge environment settings.");
      setPendingProvider(null);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1440px] items-center justify-center px-6 py-16">
      <section className="w-full max-w-[448px] rounded-xl border border-border bg-surface p-6 shadow-card">
        <div>
          <p className="text-xs font-medium uppercase leading-4 text-accent">JobPilot</p>
          <h1 className="mt-3 text-3xl font-semibold leading-9 text-text-slate">Sign in to continue</h1>
          <p className="mt-3 text-sm font-medium leading-5 text-text-secondary">
            Use your Google or GitHub account to open your job search workspace.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {providers.map((provider) => (
            <button
              key={provider.id}
              type="button"
              onClick={() => {
                void handleOAuthSignIn(provider.id);
              }}
              disabled={pendingProvider !== null}
              className="flex h-11 w-full items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-text-primary shadow-card transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:text-text-muted"
            >
              {pendingProvider === provider.id ? "Redirecting..." : provider.label}
            </button>
          ))}
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm font-medium leading-5 text-error">
            {errorMessage}
          </p>
        ) : null}
      </section>
    </div>
  );
}
