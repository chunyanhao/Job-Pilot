import { createBrowserClient } from "@insforge/sdk/ssr";
import type { InsForgeClient } from "@insforge/sdk";
export { getInsforgePublicConfig } from "@/lib/insforge-config";

type BrowserConfigResponse = {
  success: boolean;
  data?: {
    baseUrl: string;
    anonKey: string;
  };
};

export async function getInsforgeBrowserConfig(): Promise<{ baseUrl: string; anonKey: string }> {
  const response = await fetch("/api/auth/config", {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const payload = (await response.json()) as BrowserConfigResponse;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error("Missing InsForge public environment variables.");
  }

  return payload.data;
}

export function createInsforgeBrowser(config: { baseUrl: string; anonKey: string }): InsForgeClient {
  return createBrowserClient(config);
}
