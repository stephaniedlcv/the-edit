"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  leftNavigationItems,
  rightNavigationItems,
} from "@/lib/navigation";

type AppShellProps = {
  children: React.ReactNode;
};

const mobileNavigationItems = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Closet", href: "/closet", icon: ClosetIcon },
  { label: "Outfits", href: "/outfits", icon: OutfitsIcon },
  { label: "Planner", href: "/planner", icon: PlannerIcon },
  { label: "Wishlist", href: "/wishlist", icon: WishlistIcon },
];

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

function ClosetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <path d="M12 7c0-1.5 1.5-2.5 3-2.5" />
      <path d="M12 7c0-1.5-1.5-2.5-3-2.5" />
    </svg>
  );
}

function OutfitsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="11" rx="1" />
      <rect x="13" y="3" width="8" height="5" rx="1" />
      <rect x="13" y="10" width="8" height="11" rx="1" />
      <rect x="3" y="16" width="8" height="5" rx="1" />
    </svg>
  );
}

function PlannerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="17" rx="1" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="14" x2="8" y2="14" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="14" x2="12" y2="14" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="14" x2="16" y2="14" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WishlistIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const allNavItems = [...leftNavigationItems, ...rightNavigationItems];

  return (
    <>
      <main className="min-h-screen bg-[var(--page)] px-3 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] text-[var(--ink)] md:px-6 md:py-8 md:pb-8">
        <div className="editorial-shell mx-auto min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[1.2rem] md:min-h-[calc(100vh-4rem)] md:rounded-[1.5rem]">
          <header className="border-b border-[var(--line)]">
            {/* Desktop Navigation */}
            <nav className="hidden min-h-[4.25rem] grid-cols-3 items-center px-10 md:grid">
              <div className="flex items-center gap-9">
                {leftNavigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={["nav-link", pathname === item.href ? "active" : ""].join(" ")}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <Link
                href="/"
                className="font-display justify-self-center text-[3rem] uppercase leading-none tracking-[0.18em] text-[var(--espresso)] no-underline md:text-[3.6rem]"
              >
                The Edit
              </Link>

              <div className="flex items-center justify-end gap-9">
                {rightNavigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={["nav-link", pathname === item.href ? "active" : ""].join(" ")}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Mobile Header — wordmark only */}
            <div className="flex min-h-[3.75rem] items-center justify-center md:hidden">
              <Link
                href="/"
                className="font-display text-[2.2rem] uppercase leading-none tracking-[0.16em] text-[var(--espresso)] no-underline"
              >
                The Edit
              </Link>
            </div>
          </header>

          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav md:hidden" aria-label="Main navigation">
        <div className="flex items-stretch">
          {mobileNavigationItems.map((item) => {
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
    </>
  );
}
