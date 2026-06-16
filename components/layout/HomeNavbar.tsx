import Image from "next/image";
import Link from "next/link";

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
        <Link href="/" className="flex items-center gap-2" aria-label="JobPilot home">
          <Image src="/logo.png" alt="JobPilot" width={106} height={36} priority />
        </Link>

        <nav className="hidden items-center gap-10 text-sm font-medium text-text-dark md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-accent">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href={ctaHref}
          className="rounded-md bg-text-slate px-4 py-2 text-sm font-medium text-surface shadow-card transition-colors hover:bg-overlay"
        >
          Start for free
        </Link>
      </div>
    </header>
  );
}
