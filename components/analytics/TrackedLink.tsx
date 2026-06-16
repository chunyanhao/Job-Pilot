"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { capturePostHogEvent } from "@/lib/posthog-client";
import type { PostHogEventPayloads } from "@/lib/posthog-events";

type BaseLinkProps = ComponentProps<typeof Link>;

type Props =
  | (BaseLinkProps & {
      eventName: "navigation_clicked";
      eventProperties: PostHogEventPayloads["navigation_clicked"];
    })
  | (BaseLinkProps & {
      eventName: "cta_clicked";
      eventProperties: PostHogEventPayloads["cta_clicked"];
    });

export function TrackedLink(props: Props) {
  const { children, eventName, eventProperties, onClick, ...linkProps } = props;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (eventName === "navigation_clicked") {
      capturePostHogEvent("navigation_clicked", eventProperties);
    } else {
      capturePostHogEvent("cta_clicked", eventProperties);
    }

    onClick?.(event);
  };

  return (
    <Link {...linkProps} onClick={handleClick}>
      {children}
    </Link>
  );
}
