import Image from "next/image";
import { TrackedLink } from "@/components/analytics/TrackedLink";

const footerLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Condition", href: "/terms" },
];

export function HomeFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-10 py-14 md:flex-row md:items-center md:justify-between">
        <TrackedLink
          href="/"
          aria-label="JobPilot home"
          eventName="navigation_clicked"
          eventProperties={{ href: "/", label: "JobPilot home", surface: "footer" }}
        >
          <Image src="/logo.png" alt="JobPilot" width={112} height={38} />
        </TrackedLink>

        <nav className="flex flex-wrap items-center gap-8 text-sm font-medium text-text-secondary">
          {footerLinks.map((link) => (
            <TrackedLink
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-accent"
              eventName="navigation_clicked"
              eventProperties={{ href: link.href, label: link.label, surface: "footer" }}
            >
              {link.label}
            </TrackedLink>
          ))}
        </nav>
      </div>
    </footer>
  );
}
