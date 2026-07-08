"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type AppShellProps = { children: React.ReactNode };

// ── Icons ──────────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 10.25 12 3.75l8.5 6.5V20a1.25 1.25 0 0 1-1.25 1.25H4.75A1.25 1.25 0 0 1 3.5 20v-9.75Z" />
      <path d="M9.25 21.25v-7.5h5.5v7.5" />
    </svg>
  );
}

function ClosetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4.25c0-1.15.9-2 2.05-2 1.05 0 1.95.75 1.95 1.8 0 1.25-1.1 1.85-2.05 2.32L12 7.35" />
      <path d="M12 7.35 5.25 11.2a1.6 1.6 0 0 0-.8 1.38v.22h15.1v-.22a1.6 1.6 0 0 0-.8-1.38L12 7.35Z" />
      <path d="M5.1 12.8v6.45c0 .83.67 1.5 1.5 1.5h10.8c.83 0 1.5-.67 1.5-1.5V12.8" />
    </svg>
  );
}

function AddIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "transform 0.22s cubic-bezier(.4,0,.2,1)",
        transform: open ? "rotate(45deg)" : "rotate(0deg)",
      }}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function StyleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="7.25" height="9.25" rx="2" />
      <rect x="13.25" y="3.5" width="7.25" height="5.75" rx="2" />
      <rect x="13.25" y="11.25" width="7.25" height="9.25" rx="2" />
      <rect x="3.5" y="14.75" width="7.25" height="5.75" rx="2" />
    </svg>
  );
}

function WishlistIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.15 5.35a5.05 5.05 0 0 0-7.15 0L12 6.35l-1-1a5.05 5.05 0 1 0-7.15 7.15l1 1L12 20.65l7.15-7.15 1-1a5.05 5.05 0 0 0 0-7.15Z" />
    </svg>
  );
}

function HangerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4.25c0-1.15.9-2 2.05-2 1.05 0 1.95.75 1.95 1.8 0 1.25-1.1 1.85-2.05 2.32L12 7.35" />
      <path d="M12 7.35 5.25 11.2a1.6 1.6 0 0 0-.8 1.38v.22h15.1v-.22a1.6 1.6 0 0 0-.8-1.38L12 7.35Z" />
      <path d="M5.1 12.8v6.45c0 .83.67 1.5 1.5 1.5h10.8c.83 0 1.5-.67 1.5-1.5V12.8" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.15 5.35a5.05 5.05 0 0 0-7.15 0L12 6.35l-1-1a5.05 5.05 0 1 0-7.15 7.15l1 1L12 20.65l7.15-7.15 1-1a5.05 5.05 0 0 0 0-7.15Z" />
    </svg>
  );
}

// ── Reusable slot pieces ───────────────────────────────────────────────────

function InactiveContent({ icon: Icon, label }: { icon: () => React.ReactElement; label: string }) {
  return (
    <>
      <span className="nav-slot-icon"><Icon /></span>
      <span className="nav-slot-label">{label}</span>
    </>
  );
}

function ActiveContent({ icon: Icon, label }: { icon: () => React.ReactElement; label: string }) {
  return (
    <>
      <span className="nav-slot-bubble" aria-hidden="true">
        <span className="nav-slot-bubble-icon"><Icon /></span>
      </span>
      <span className="nav-slot-label">{label}</span>
    </>
  );
}

// ── App shell ──────────────────────────────────────────────────────────────

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [addOpen, setAddOpen] = useState(false);
  const addSlotRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!addOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAddOpen(false);
    }
    function onPointer(e: MouseEvent) {
      if (addSlotRef.current && !addSlotRef.current.contains(e.target as Node)) {
        setAddOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [addOpen]);

  const isHome     = pathname === "/";
  const isCloset   = pathname.startsWith("/closet");
  const isStyle    = pathname.startsWith("/outfits");
  const isWishlist = pathname.startsWith("/wishlist");

  return (
    <div className="min-h-screen bg-[var(--page)]">
      {/* Compact sticky header — hidden on "/" (editorial masthead owns that page) */}
      {!isHome && (
        <header className="nav-header sticky top-0 z-40 flex items-center justify-center border-b border-white/40 bg-[rgba(255,253,252,0.72)] backdrop-blur-2xl">
          <Link
            href="/"
            className="nav-wordmark font-display font-bold uppercase leading-none tracking-[0.18em] text-[var(--espresso)] no-underline transition-colors hover:text-[var(--burgundy)]"
            aria-label="THE EDIT home"
          >
            THE EDIT
          </Link>
        </header>
      )}

      {/* Page content */}
      <main className="main-content mx-auto min-h-screen w-full max-w-[1180px] px-0">
        {children}
      </main>

      {/* ── Floating nav bar ────────────────────────────────────────────── */}
      <nav className="nav-bar" aria-label="Main navigation">
        <div className="nav-track">

          {/* Home */}
          <Link href="/" className={`nav-slot${isHome ? " active" : ""}`}>
            {isHome
              ? <ActiveContent icon={HomeIcon} label="Home" />
              : <InactiveContent icon={HomeIcon} label="Home" />}
          </Link>

          {/* Closet */}
          <Link href="/closet" className={`nav-slot${isCloset ? " active" : ""}`}>
            {isCloset
              ? <ActiveContent icon={ClosetIcon} label="Closet" />
              : <InactiveContent icon={ClosetIcon} label="Closet" />}
          </Link>

          {/* Add — button, opens action sheet */}
          <button
            ref={addSlotRef}
            onClick={() => setAddOpen((v) => !v)}
            className={`nav-slot nav-slot-add${addOpen ? " active" : ""}`}
            aria-label={addOpen ? "Close add menu" : "Add item"}
            aria-expanded={addOpen}
            aria-haspopup="menu"
          >
            {addOpen
              ? <ActiveContent icon={() => <AddIcon open={true} />} label="Add" />
              : <InactiveContent icon={() => <AddIcon open={false} />} label="Add" />}

            {/* Action sheet */}
            {addOpen && (
              <div className="nav-sheet" role="menu" aria-label="Add options">
                <Link
                  href="/closet/add"
                  onClick={() => setAddOpen(false)}
                  className="nav-sheet-option"
                  role="menuitem"
                >
                  <span className="nav-sheet-option-icon"><HangerIcon /></span>
                  <span className="nav-sheet-option-label">Add closet piece</span>
                </Link>
                <div className="nav-sheet-divider" />
                <Link
                  href="/wishlist/add"
                  onClick={() => setAddOpen(false)}
                  className="nav-sheet-option"
                  role="menuitem"
                >
                  <span className="nav-sheet-option-icon"><HeartIcon /></span>
                  <span className="nav-sheet-option-label">Add wishlist item</span>
                </Link>
              </div>
            )}
          </button>

          {/* Style */}
          <Link href="/outfits" className={`nav-slot${isStyle ? " active" : ""}`}>
            {isStyle
              ? <ActiveContent icon={StyleIcon} label="Style" />
              : <InactiveContent icon={StyleIcon} label="Style" />}
          </Link>

          {/* Wishlist */}
          <Link href="/wishlist" className={`nav-slot${isWishlist ? " active" : ""}`}>
            {isWishlist
              ? <ActiveContent icon={WishlistIcon} label="Wishlist" />
              : <InactiveContent icon={WishlistIcon} label="Wishlist" />}
          </Link>

        </div>
      </nav>
    </div>
  );
}
