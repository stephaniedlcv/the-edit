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
  ...leftNavigationItems,
  ...rightNavigationItems,
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[var(--page)] px-3 py-5 text-[var(--ink)] md:px-6 md:py-8">
      <div className="editorial-shell mx-auto min-h-[calc(100vh-2.5rem)] max-w-7xl overflow-hidden rounded-[1.3rem] md:min-h-[calc(100vh-4rem)] md:rounded-[1.45rem]">
        <header className="border-b border-[var(--line)]">
          {/* Desktop Navigation */}
          <nav className="hidden min-h-16 grid-cols-3 items-center px-10 md:grid">
            <div className="flex items-center gap-8">
              {leftNavigationItems.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </Link>
              ))}
            </div>

            <Link
              href="/"
              className="font-display justify-self-center text-[2.85rem] uppercase leading-none tracking-[0.16em] text-[var(--espresso)] no-underline md:text-[3.45rem]"
            >
              The Edit
            </Link>

            <div className="flex items-center justify-end gap-8">
              {rightNavigationItems.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile Navigation */}
          <details className="group md:hidden">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between px-5">
              <Link
                href="/"
                className="font-display text-[2.15rem] uppercase leading-none tracking-[0.14em] text-[var(--espresso)] no-underline"
              >
                The Edit
              </Link>

              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper-2)] text-[var(--espresso)]">
                <span className="relative block h-3.5 w-4">
                  <span className="absolute left-0 top-0 h-px w-4 bg-[var(--espresso)] transition group-open:top-1.5 group-open:rotate-45" />
                  <span className="absolute left-0 top-1.5 h-px w-4 bg-[var(--espresso)] transition group-open:opacity-0" />
                  <span className="absolute left-0 top-3 h-px w-4 bg-[var(--espresso)] transition group-open:top-1.5 group-open:-rotate-45" />
                </span>
              </span>
            </summary>

            <div className="border-t border-[var(--line)] bg-[var(--paper-2)] px-5 py-4">
              <div className="grid gap-2">
                {mobileNavigationItems.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "rounded-full px-4 py-3 text-sm font-medium uppercase tracking-[0.22em] transition",
                        isActive
                          ? "bg-[var(--espresso)] text-[var(--paper-2)]"
                          : "text-[var(--coffee)] hover:bg-[var(--cream)] hover:text-[var(--espresso)]",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </details>
        </header>

        {children}
      </div>
    </main>
  );
}
