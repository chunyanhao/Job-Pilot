"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { capturePostHogPageview, initPostHog } from "@/lib/posthog-client";

type Props = {
  children: ReactNode;
};

export function PostHogProvider({ children }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    capturePostHogPageview(pathname);
  }, [pathname]);

  return children;
}
