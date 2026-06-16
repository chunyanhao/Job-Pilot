type InsForgePublicConfig = {
  baseUrl: string;
  anonKey: string;
};

export function getInsforgePublicConfig(): InsForgePublicConfig {
  const publicProjectUrl = process.env.NEXT_PUBLIC_INSFORGE_PROJECT_URL;
  const baseUrl =
    process.env.NEXT_PUBLIC_INSFORGE_URL ??
    (publicProjectUrl?.startsWith("http") ? publicProjectUrl : undefined) ??
    process.env.INSFORGE_PROJECT_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ?? process.env.NEXT_PUBLIC_INSFORGE_PROJECT_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error("Missing InsForge public environment variables.");
  }

  return { baseUrl, anonKey };
}

export function hasInsforgeConfig(): boolean {
  const publicProjectUrl = process.env.NEXT_PUBLIC_INSFORGE_PROJECT_URL;
  const hasUrl = Boolean(
    process.env.NEXT_PUBLIC_INSFORGE_URL ??
      (publicProjectUrl?.startsWith("http") ? publicProjectUrl : undefined) ??
      process.env.INSFORGE_PROJECT_URL,
  );
  const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ?? process.env.NEXT_PUBLIC_INSFORGE_PROJECT_KEY);

  return hasUrl && hasAnonKey;
}
