"use client";

import { useState } from "react";
import { resetPostHog } from "@/lib/posthog-client";

export function LogoutButton() {
  const [isPending, setIsPending] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLogout = async (): Promise<void> => {
    setIsPending(true);
    setHasError(false);

    try {
      const response = await fetch("/api/auth/session", {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        setHasError(true);
        setIsPending(false);
        return;
      }

      resetPostHog();
      window.location.replace("/login");
    } catch (error) {
      console.error("[LogoutButton]", error);
      setHasError(true);
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => {
        void handleLogout();
      }}
      disabled={isPending}
      className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:text-text-muted"
    >
      {isPending ? "Signing out..." : hasError ? "Try again" : "Logout"}
    </button>
  );
}
