import Image from "next/image";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { LogoutButton } from "@/components/auth/LogoutButton";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/find-jobs" },
  { label: "Profile", href: "/profile" },
];

export function AppNavbar() {
  return (
    <header className="h-16 border-b border-border bg-surface">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6">
        <TrackedLink
          href="/dashboard"
          className="flex items-center gap-2"
          aria-label="JobPilot dashboard"
          eventName="navigation_clicked"
          eventProperties={{ href: "/dashboard", label: "JobPilot dashboard", surface: "app_nav" }}
        >
          <Image src="/logo.png" alt="JobPilot" width={106} height={36} priority />
        </TrackedLink>

        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-10 text-sm font-medium text-text-dark md:flex">
            {navItems.map((item) => (
              <TrackedLink
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-accent"
                eventName="navigation_clicked"
                eventProperties={{ href: item.href, label: item.label, surface: "app_nav" }}
              >
                {item.label}
              </TrackedLink>
            ))}
          </nav>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
