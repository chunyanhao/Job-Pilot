import { refreshAuth } from "@insforge/sdk/ssr";
import { getInsforgePublicConfig } from "@/lib/insforge-config";

export async function POST(request: Request): Promise<Response> {
  const result = await refreshAuth({
    ...getInsforgePublicConfig(),
    request,
  });

  return result.response;
}
