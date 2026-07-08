import Link from "next/link";
import { getClosetSpectrumEntries } from "@/lib/wardrobe/spectrum-data";
import { ChromaSpine } from "@/components/chroma-spine";
import type { SpectrumEntry } from "@/lib/wardrobe/spectrum";
import type { WardrobeItem } from "@/types/wardrobe";

export const dynamic = "force-dynamic";

// ─── Server-side, honest helpers ───────────────────────────────────────────

/** Hour-based greeting. No name, no fake personalization — just the clock. */
function getGreeting(): string {
  const now = new Date();
  const hourStr = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: "America/Puerto_Rico",
  }).format(now);
  const hour = parseInt(hourStr, 10);
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Real server date, formatted for a Puerto Rico reader. */
function getTodayLabel(): string {
  const now = new Date();
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Puerto_Rico",
  }).format(now);
}

interface ClosetSummary {
  totalPieces: number;
  activeFamilies: number;
  dominant: { label: string; count: number } | null;
  emptyFamilies: { family: string; label: string }[];
}

/** Derives every summary number from the entries themselves — nothing hardcoded. */
function buildClosetSummary(
  entries: SpectrumEntry<WardrobeItem>[],
): ClosetSummary {
  const totalPieces = entries.reduce((sum, e) => sum + e.count, 0);
  const activeEntries = entries.filter((e) => e.count > 0);
  const emptyFamilies = entries
    .filter((e) => e.count === 0)
    .map((e) => ({ family: String(e.family), label: e.meta.label }));

  const dominantEntry = activeEntries.reduce<SpectrumEntry<WardrobeItem> | null>(
    (max, e) => (!max || e.count > max.count ? e : max),
    null,
  );

  return {
    totalPieces,
    activeFamilies: activeEntries.length,
    dominant: dominantEntry
      ? { label: dominantEntry.meta.label, count: dominantEntry.count }
      : null,
    emptyFamilies,
  };
}

/** One honest, data-derived insight. Returns null when there is nothing true to say yet. */
function buildInsight(summary: ClosetSummary): string | null {
  if (summary.totalPieces === 0) return null;

  if (summary.emptyFamilies.length > 0) {
    const [first] = summary.emptyFamilies;
    return `Your spectrum has no pieces in ${first.label} yet.`;
  }

  if (summary.dominant) {
    const share = summary.dominant.count / summary.totalPieces;
    if (share >= 0.15) {
      return `${summary.dominant.label} dominates your closet right now, with ${summary.dominant.count} pieces.`;
    }
  }

  if (summary.activeFamilies >= 12) {
    return `Your closet already spans ${summary.activeFamilies} active color families.`;
  }

  return `Your closet holds ${summary.totalPieces} pieces across ${summary.activeFamilies} color families.`;
}

// ─── Small presentational helpers ──────────────────────────────────────────

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--r-card)] bg-[var(--papel)] px-5 py-4 shadow-[inset_0_0_0_1px_var(--line)]">
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--tinta-tenue)]">
        {label}
      </p>
      <p className="mt-2 font-display text-[1.9rem] leading-none text-[var(--tinta)]">
        {value}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "group block rounded-[var(--r-card)] bg-[var(--papel)] p-5 no-underline",
        "shadow-[inset_0_0_0_1px_var(--line)] transition duration-150",
        "hover:shadow-[inset_0_0_0_1px_var(--line-strong)] hover:-translate-y-0.5",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-[var(--tinta)]",
      ].join(" ")}
    >
      <p className="font-display text-[1.5rem] leading-none text-[var(--tinta)]">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--tinta-suave)]">
        {description}
      </p>
      <span className="mt-4 inline-flex text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[var(--tinta-suave)] transition-colors group-hover:text-[var(--tinta)]">
        Open →
      </span>
    </Link>
  );
}

// ─── Home ───────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const entries = await getClosetSpectrumEntries({ includeEmpty: true });
  const summary = buildClosetSummary(entries);
  const insight = buildInsight(summary);

  const greeting = getGreeting();
  const today = getTodayLabel();

  return (
    <section className="min-h-screen bg-[var(--gal)] px-4 py-10 md:px-6 md:py-14">
      <section className="mx-auto flex max-w-[1120px] flex-col gap-12">
        {/* ── A. Hero editorial ─────────────────────────────────────── */}
        <header className="max-w-2xl">
          <p className="text-[0.66rem] font-bold uppercase tracking-[0.32em] text-[var(--tinta-tenue)]">
            The Edit
          </p>
          <h1 className="mt-4 font-display text-[2.6rem] leading-[0.95] text-[var(--tinta)] sm:text-[3.6rem]">
            Your closet, read by color.
          </h1>
          <p className="mt-5 text-[1rem] leading-7 text-[var(--tinta-suave)]">
            Every piece you own, organized by the color it actually is —
            not by category, not by guesswork. This is the honest starting
            point for everything else Cromática will build.
          </p>
          <p className="mt-6 text-[0.78rem] font-medium text-[var(--tinta-tenue)]">
            {greeting} · {today}
          </p>
        </header>

        {/* ── B. ChromaSpine live ───────────────────────────────────── */}
        <section aria-labelledby="spine-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--tinta-tenue)]">
                Live spectrum
              </p>
              <h2
                id="spine-heading"
                className="mt-2 font-display text-[1.8rem] leading-none text-[var(--tinta)]"
              >
                Your closet, in color
              </h2>
            </div>
            <Link
              href="/closet/gallery"
              className="shrink-0 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[var(--tinta-tenue)] underline-offset-4 transition-colors hover:text-[var(--tinta)] hover:underline"
            >
              View gallery
            </Link>
          </div>

          {entries.length > 0 ? (
            <div className="rounded-[var(--r-panel)] bg-[var(--papel)] p-5 shadow-[inset_0_0_0_1px_var(--line)] md:p-7">
              <ChromaSpine
                entries={entries}
                hrefBase="/closet/gallery"
                showCounts
                size="lg"
                ariaLabel="Your closet, organized by color family"
              />
            </div>
          ) : (
            <div className="rounded-[var(--r-panel)] bg-[var(--papel)] p-8 text-center shadow-[inset_0_0_0_1px_var(--line)]">
              <p className="font-display text-xl text-[var(--tinta)]">
                No closet data yet.
              </p>
              <p className="mt-2 text-sm text-[var(--tinta-suave)]">
                Add your first piece to start seeing your color spectrum.
              </p>
            </div>
          )}
        </section>

        {/* ── C + D. Real summary + honest insight ──────────────────── */}
        {summary.totalPieces > 0 && (
          <section>
            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryStat
                label="Total pieces"
                value={String(summary.totalPieces)}
              />
              <SummaryStat
                label="Active families"
                value={String(summary.activeFamilies)}
              />
              <SummaryStat
                label="Dominant family"
                value={summary.dominant?.label ?? "—"}
              />
            </div>

            {insight && (
              <p className="mt-5 text-[0.95rem] leading-7 text-[var(--tinta-suave)]">
                {insight}
              </p>
            )}
          </section>
        )}

        {/* ── E. Quick actions ───────────────────────────────────────── */}
        <section>
          <p className="mb-5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--tinta-tenue)]">
            Quick actions
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction
              href="/closet"
              title="Closet"
              description="Browse every piece you own."
            />
            <QuickAction
              href="/closet/gallery"
              title="Gallery"
              description="See your closet filtered by color."
            />
            <QuickAction
              href="/wishlist"
              title="Wishlist"
              description="Review what's under consideration."
            />
            <QuickAction
              href="/outfits"
              title="Outfits"
              description="Look back at saved combinations."
            />
          </div>

          <div className="mt-6">
            <Link
              href="/closet/add"
              className={[
                "inline-flex h-10 items-center justify-center rounded-[var(--r-chip)] px-6",
                "border border-[var(--tinta)] text-[0.76rem] font-semibold uppercase tracking-[0.10em]",
                "text-[var(--tinta)] no-underline transition-colors hover:bg-[var(--gal)]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                "focus-visible:outline-[var(--tinta)]",
              ].join(" ")}
            >
              Add a closet piece
            </Link>
          </div>
        </section>
      </section>
    </section>
  );
}
