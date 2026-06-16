import { PostHog } from "posthog-node";
import type { PostHogEventName, PostHogEventPayloads } from "@/lib/posthog-events";

export function createPostHogServer(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) {
    return null;
  }

  return new PostHog(key, {
    host,
    flushAt: 1,
    flushInterval: 0,
  });
}

export async function capturePostHogServerEvent<EventName extends PostHogEventName>(
  event: EventName,
  userId: string,
  properties: PostHogEventPayloads[EventName],
): Promise<void> {
  const posthog = createPostHogServer();

  if (!posthog) {
    return;
  }

  try {
    posthog.capture({
      distinctId: userId,
      event,
      properties: {
        ...properties,
        userId,
      },
    });
  } finally {
    await posthog.shutdown();
  }
}
