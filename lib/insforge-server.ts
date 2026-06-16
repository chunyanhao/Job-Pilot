import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import type { InsForgeClient, UserSchema } from "@insforge/sdk";
import { getInsforgePublicConfig, hasInsforgeConfig } from "@/lib/insforge-config";
export { hasInsforgeConfig } from "@/lib/insforge-config";

export async function createInsforgeServer(): Promise<InsForgeClient> {
  const cookieStore = await cookies();
  const { baseUrl, anonKey } = getInsforgePublicConfig();

  return createServerClient({
    baseUrl,
    anonKey,
    cookies: cookieStore,
  });
}

export async function getCurrentUser(): Promise<UserSchema | null> {
  if (!hasInsforgeConfig()) {
    return null;
  }

  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error) {
    console.error("[lib/insforge-server] Failed to get current user", error.message);
    return null;
  }

  return data.user;
}
