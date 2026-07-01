"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AppShellProps = {
  children: React.ReactNode;
};

const navItems = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Closet", href: "/closet", icon: ClosetIcon },
  { label: "Calendar", href: "/planner", icon: PlannerIcon },
  { label: "Style", href: "/outfits", icon: OutfitsIcon },
  { label: "Wishlist", href: "/wishlist", icon: WishlistIcon },
];

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 10.25 12 3.75l8.5 6.5V20a1.25 1.25 0 0 1-1.25 1.25H4.75A1.25 1.25 0 0 1 3.5 20v-9.75Z" />
      <path d="M9.25 21.25v-7.5h5.5v7.5" />
    </svg>
  );
}

function ClosetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4.25c0-1.15.9-2 2.05-2 1.05 0 1.95.75 1.95 1.8 0 1.25-1.1 1.85-2.05 2.32L12 7.35" />
      <path d="M12 7.35 5.25 11.2a1.6 1.6 0 0 0-.8 1.38v.22h15.1v-.22a1.6 1.6 0 0 0-.8-1.38L12 7.35Z" />
      <path d="M5.1 12.8v6.45c0 .83.67 1.5 1.5 1.5h10.8c.83 0 1.5-.67 1.5-1.5V12.8" />
    </svg>
  );
}

function OutfitsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="7.25" height="9.25" rx="2" />
      <rect x="13.25" y="3.5" width="7.25" height="5.75" rx="2" />
      <rect x="13.25" y="11.25" width="7.25" height="9.25" rx="2" />
      <rect x="3.5" y="14.75" width="7.25" height="5.75" rx="2" />
    </svg>
  );
}

function PlannerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.75" y="4.75" width="16.5" height="15.5" rx="2.25" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3.75 9.25h16.5" />
      <path d="M8 13.25h.01" />
      <path d="M12 13.25h.01" />
      <path d="M16 13.25h.01" />
      <path d="M8 17h.01" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function WishlistIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.15 5.35a5.05 5.05 0 0 0-7.15 0L12 6.35l-1-1a5.05 5.05 0 1 0-7.15 7.15l1 1L12 20.65l7.15-7.15 1-1a5.05 5.05 0 0 0 0-7.15Z" />
    </svg>
  );
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--page)]">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-center border-b border-white/50 bg-[rgba(255,253,252,0.68)] backdrop-blur-2xl">
        <Link
          href="/"
          className="font-display text-[2rem] font-bold uppercase leading-none tracking-[0.18em] text-[var(--espresso)] no-underline transition-colors hover:text-[var(--burgundy)] md:text-[2.25rem]"
          aria-label="THE EDIT home"
        >
          THE EDIT
        </Link>
      </header>

      <main className="mx-auto min-h-screen w-full max-w-[1180px] px-0 pb-[calc(6.25rem+env(safe-area-inset-bottom,0px))]">
        {children}
      </main>

      <nav className="bottom-nav fixed z-50" aria-label="Main navigation">
        <div className="flex items-stretch">
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
                className={["bottom-nav-item flex flex-1 flex-col items-center justify-center gap-1 no-underline", isActive ? "active" : ""].join(" ")}
              >
                <span className="h-5 w-5">
                  <Icon />
                </span>
                <span className="bottom-nav-label font-bold uppercase">{item.label}</span>
                <span className="bottom-nav-dot h-1 w-1 rounded-full bg-transparent" />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
