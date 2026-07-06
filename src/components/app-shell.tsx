"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type AppShellProps = { children: React.ReactNode };

const leftNav = [
  { label: "Home",   href: "/",       icon: HomeIcon },
  { label: "Closet", href: "/closet", icon: ClosetIcon },
];
const rightNav = [
  { label: "Style",    href: "/outfits",  icon: OutfitsIcon },
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

function WishlistIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.15 5.35a5.05 5.05 0 0 0-7.15 0L12 6.35l-1-1a5.05 5.05 0 1 0-7.15 7.15l1 1L12 20.65l7.15-7.15 1-1a5.05 5.05 0 0 0 0-7.15Z" />
    </svg>
  );
}

function PlusIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: "transform 0.22s cubic-bezier(.4,0,.2,1)", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ClosetAddIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4.25c0-1.15.9-2 2.05-2 1.05 0 1.95.75 1.95 1.8 0 1.25-1.1 1.85-2.05 2.32L12 7.35" />
      <path d="M12 7.35 5.25 11.2a1.6 1.6 0 0 0-.8 1.38v.22h15.1v-.22a1.6 1.6 0 0 0-.8-1.38L12 7.35Z" />
      <path d="M5.1 12.8v6.45c0 .83.67 1.5 1.5 1.5h10.8c.83 0 1.5-.67 1.5-1.5V12.8" />
    </svg>
  );
}

function WishlistAddIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.15 5.35a5.05 5.05 0 0 0-7.15 0L12 6.35l-1-1a5.05 5.05 0 1 0-7.15 7.15l1 1L12 20.65l7.15-7.15 1-1a5.05 5.05 0 0 0 0-7.15Z" />
    </svg>
  );
}

function NavItem({
  label,
  href,
  icon: Icon,
  pathname,
}: {
  label: string;
  href: string;
  icon: () => React.ReactElement;
  pathname: string;
}) {
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={[
        "bottom-nav-item flex flex-1 flex-col items-center justify-center gap-1 no-underline",
        isActive ? "active" : "",
      ].join(" ")}
    >
      <span className="h-5 w-5">
        <Icon />
      </span>
      <span className="bottom-nav-label font-bold uppercase">{label}</span>
      <span className="bottom-nav-dot h-1 w-1 rounded-full bg-transparent" />
    </Link>
  );
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [addOpen, setAddOpen] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!addOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAddOpen(false);
    }
    function onMouse(e: MouseEvent) {
      if (addRef.current && !addRef.current.contains(e.target as Node)) {
        setAddOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onMouse);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onMouse);
    };
  }, [addOpen]);

  return (
    <div className="min-h-screen bg-[var(--page)]">
      <header className="nav-header sticky top-0 z-40 flex items-center justify-center border-b border-white/50 bg-[rgba(255,253,252,0.68)] backdrop-blur-2xl">
        <Link
          href="/"
          className="font-display font-bold uppercase leading-none tracking-[0.18em] text-[var(--espresso)] no-underline transition-colors hover:text-[var(--burgundy)] nav-wordmark"
          aria-label="THE EDIT home"
        >
          THE EDIT
        </Link>
      </header>

      <main className="main-content mx-auto min-h-screen w-full max-w-[1180px] px-0">
        {children}
      </main>

      <nav className="bottom-nav fixed z-50" aria-label="Main navigation">
        <div className="bottom-nav-grid">
          {leftNav.map((item) => (
            <NavItem key={item.href} {...item} pathname={pathname} />
          ))}

          <div ref={addRef} className="bottom-nav-add relative">
            <button
              onClick={() => setAddOpen((v) => !v)}
              className={`bottom-nav-add-btn flex w-full flex-col items-center justify-center gap-1${addOpen ? " open" : ""}`}
              aria-label={addOpen ? "Close add menu" : "Add item"}
              aria-expanded={addOpen}
              aria-haspopup="menu"
            >
              <span className="bottom-nav-add-icon">
                <PlusIcon open={addOpen} />
              </span>
              <span className="bottom-nav-label font-bold uppercase">Add</span>
              <span className="bottom-nav-dot h-1 w-1 rounded-full" />
            </button>

            {addOpen && (
              <div className="bottom-nav-add-sheet" role="menu" aria-label="Add options">
                <Link
                  href="/closet/add"
                  onClick={() => setAddOpen(false)}
                  className="bottom-nav-add-option"
                  role="menuitem"
                >
                  <span className="bottom-nav-add-option-icon">
                    <ClosetAddIcon />
                  </span>
                  <span className="bottom-nav-add-option-label">Add closet piece</span>
                </Link>
                <div className="bottom-nav-add-divider" />
                <Link
                  href="/wishlist/add"
                  onClick={() => setAddOpen(false)}
                  className="bottom-nav-add-option"
                  role="menuitem"
                >
                  <span className="bottom-nav-add-option-icon">
                    <WishlistAddIcon />
                  </span>
                  <span className="bottom-nav-add-option-label">Add wishlist item</span>
                </Link>
              </div>
            )}
          </div>

          {rightNav.map((item) => (
            <NavItem key={item.href} {...item} pathname={pathname} />
          ))}
        </div>
      </nav>
    </div>
  );
}
