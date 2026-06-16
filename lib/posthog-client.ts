"use client";

import posthog from "posthog-js";
import type { PostHogEventName, PostHogEventPayloads } from "@/lib/posthog-events";

let isInitialized = false;

function getPostHogConfig(): { key: string; host: string } | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) {
    return null;
  }

  return { key, host };
}

export function initPostHog(): void {
  const config = getPostHogConfig();

  if (typeof window === "undefined" || isInitialized || !config) {
    return;
  }

  posthog.init(config.key, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2026-01-30",
    capture_pageview: false,
    capture_exceptions: true,
  });
  isInitialized = true;
}

export function capturePostHogPageview(path: string): void {
  if (!isInitialized) {
    return;
  }

  posthog.capture("$pageview", {
    $current_url: window.location.href,
    path,
  });
}

export function capturePostHogEvent<EventName extends PostHogEventName>(
  event: EventName,
  properties: PostHogEventPayloads[EventName],
): void {
  if (!isInitialized) {
    initPostHog();
  }

  if (!isInitialized) {
    return;
  }

  posthog.capture(event, properties);
}

export function identifyPostHogUser(userId: string): void {
  if (!isInitialized) {
    initPostHog();
  }

  if (!isInitialized) {
    return;
  }

  posthog.identify(userId);
}

export function resetPostHog(): void {
  if (!isInitialized) {
    return;
  }

  posthog.reset();
}
