"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AppShellProps = {
  children: React.ReactNode;
};

const navItems = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Closet", href: "/closet", icon: ClosetIcon },
  { label: "Outfits", href: "/outfits", icon: OutfitsIcon },
  { label: "Planner", href: "/planner", icon: PlannerIcon },
  { label: "Wishlist", href: "/wishlist", icon: WishlistIcon },
  { label: "Profile", href: "/settings", icon: ProfileIcon },
];

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

function ClosetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <path d="M12 7c0-1.5 1.5-2.5 3-2.5" />
      <path d="M12 7c0-1.5-1.5-2.5-3-2.5" />
    </svg>
  );
}

function OutfitsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="11" rx="1" />
      <rect x="13" y="3" width="8" height="5" rx="1" />
      <rect x="13" y="10" width="8" height="11" rx="1" />
      <rect x="3" y="16" width="8" height="5" rx="1" />
    </svg>
  );
}

function PlannerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="17" rx="1" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="8" cy="15" r="0.8" fill="currentColor" />
      <circle cx="12" cy="15" r="0.8" fill="currentColor" />
      <circle cx="16" cy="15" r="0.8" fill="currentColor" />
    </svg>
  );
}

function WishlistIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const mobileItems = navItems.slice(0, 5);

  return (
    <div className="flex min-h-screen bg-[var(--page)]">

      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar hidden md:flex">
        {/* Wordmark */}
        <Link href="/" className="sidebar-wordmark">
          <span>S</span>
        </Link>

        {/* Nav icons */}
        <nav className="flex flex-1 flex-col items-center gap-1 pt-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={["sidebar-item", isActive ? "active" : ""].join(" ")}
                title={item.label}
              >
                <Icon />
                <span className="sidebar-tooltip">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom dot */}
        <div className="pb-8 flex flex-col items-center">
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] opacity-40" />
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex flex-1 flex-col min-w-0 min-h-screen bg-[var(--paper)]">
        {/* Mobile wordmark bar */}
        <header className="md:hidden flex items-center justify-center h-14 border-b border-[var(--line)] bg-[var(--paper)]">
          <Link
            href="/"
            className="font-display text-[1.8rem] uppercase leading-none tracking-[0.18em] text-[var(--espresso)] no-underline"
          >
            The Edit
          </Link>
        </header>

        <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bottom-nav md:hidden" aria-label="Main navigation">
        <div className="flex items-stretch">
          {mobileItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={["bottom-nav-item", isActive ? "active" : ""].join(" ")}
              >
                <Icon />
                <span className="bottom-nav-label">{item.label}</span>
                <span className="bottom-nav-dot" />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
