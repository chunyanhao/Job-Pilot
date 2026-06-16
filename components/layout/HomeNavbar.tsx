import Image from "next/image";
import { TrackedLink } from "@/components/analytics/TrackedLink";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/find-jobs" },
  { label: "Profile", href: "/profile" },
];

type HomeNavbarProps = {
  ctaHref?: string;
};

export function HomeNavbar({ ctaHref = "/login" }: HomeNavbarProps) {
  return (
    <header className="h-16 border-b border-border bg-surface">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6">
        <TrackedLink
          href="/"
          className="flex items-center gap-2"
          aria-label="JobPilot home"
          eventName="navigation_clicked"
          eventProperties={{ href: "/", label: "JobPilot home", surface: "home_nav" }}
        >
          <Image src="/logo.png" alt="JobPilot" width={106} height={36} priority />
        </TrackedLink>

        <nav className="hidden items-center gap-10 text-sm font-medium text-text-dark md:flex">
          {navItems.map((item) => (
            <TrackedLink
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-accent"
              eventName="navigation_clicked"
              eventProperties={{ href: item.href, label: item.label, surface: "home_nav" }}
            >
              {item.label}
            </TrackedLink>
          ))}
        </nav>

        <TrackedLink
          href={ctaHref}
          className="rounded-md bg-text-slate px-4 py-2 text-sm font-medium text-surface shadow-card transition-colors hover:bg-overlay"
          eventName="cta_clicked"
          eventProperties={{ href: ctaHref, label: "Start for free", surface: "home_nav" }}
        >
          Start for free
        </TrackedLink>
      </div>
    </header>
  );
}
