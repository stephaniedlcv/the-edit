import Link from "next/link";
import { getClosetSpectrumEntries } from "@/lib/wardrobe/spectrum-data";
import { ChromaSpine } from "@/components/chroma-spine";
import type { SpectrumEntry } from "@/lib/wardrobe/spectrum";
import type { WardrobeItem } from "@/types/wardrobe";

export const dynamic = "force-dynamic";

// ─── Server-side, honest helpers ───────────────────────────────────────────

/** Real server date pieces, Puerto Rico time. No fake location, no weather. */
function getEditionDate() {
  const now = new Date();
  const day = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    timeZone: "America/Puerto_Rico",
  }).format(now);
  const month = new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: "America/Puerto_Rico",
  }).format(now);
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "America/Puerto_Rico",
  }).format(now);
  return { day, month, weekday };
}

interface FamilySummary {
  family: string;
  label: string;
  count: number;
  hex: string;
}

interface ClosetSummary {
  totalPieces: number;
  activeFamilies: number;
  emptyFamilies: { family: string; label: string }[];
  dominant: FamilySummary | null;
  topFamilies: FamilySummary[];
}

/** Derives every summary number from the entries themselves — nothing hardcoded. */
function buildClosetSummary(
  entries: SpectrumEntry<WardrobeItem>[],
): ClosetSummary {
  const totalPieces = entries.reduce((sum, e) => sum + e.count, 0);

  const activeFamilies = entries
    .filter((e) => e.count > 0)
    .map<FamilySummary>((e) => ({
      family: String(e.family),
      label: e.meta.label,
      count: e.count,
      hex: e.meta.hex,
    }))
    .sort((a, b) => b.count - a.count);

  const emptyFamilies = entries
    .filter((e) => e.count === 0)
    .map((e) => ({ family: String(e.family), label: e.meta.label }));

  return {
    totalPieces,
    activeFamilies: activeFamilies.length,
    emptyFamilies,
    dominant: activeFamilies[0] ?? null,
    topFamilies: activeFamilies.slice(0, 3),
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

/** Perceived luminance [0–1]. > 0.45 = light background → use dark text. */
function hexLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 0.5;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// ─── Small presentational helpers ──────────────────────────────────────────

function QuickChip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex h-8 items-center justify-center rounded-[var(--r-chip)] px-4",
        "border border-[var(--line-strong)] bg-[var(--papel)] text-[0.64rem] font-semibold",
        "uppercase tracking-[0.10em] text-[var(--tinta-suave)] no-underline transition-colors",
        "hover:border-[var(--tinta)] hover:text-[var(--tinta)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-[var(--tinta)]",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

// ─── Home ───────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const entries = await getClosetSpectrumEntries({ includeEmpty: true });
  const summary = buildClosetSummary(entries);
  const insight = buildInsight(summary);
  const { day, month, weekday } = getEditionDate();

  const coverTextColor =
    summary.dominant && hexLuminance(summary.dominant.hex) > 0.45
      ? "var(--tinta)"
      : "var(--papel)";

  return (
    <section className="min-h-screen bg-[var(--gal)] px-4 pb-28 pt-6 md:px-6 md:pt-10">
      <section className="mx-auto flex max-w-[760px] flex-col gap-7">
        {/* ── 1+2. Compact masthead / daily edition row ─────────────── */}
        <header className="flex items-center justify-between">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.34em] text-[var(--tinta)]">
            The Edit
          </p>
          {summary.totalPieces > 0 && (
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[var(--tinta-tenue)]">
              Daily edit · Nº {summary.totalPieces}
            </p>
          )}
        </header>

        {/* ── 3. Compact ChromaSpine — visual signature ──────────────── */}
        {entries.length > 0 ? (
          <ChromaSpine
            entries={entries}
            hrefBase="/closet/gallery"
            size="sm"
            ariaLabel="Your closet, organized by color family"
            className="rounded-[var(--r-card)]"
          />
        ) : (
          <p className="text-sm text-[var(--tinta-suave)]">
            No closet data yet — add your first piece to see your spectrum.
          </p>
        )}

        {/* ── 4. Editorial date block ─────────────────────────────────── */}
        <div className="flex items-end gap-4">
          <p className="font-display text-[4.2rem] leading-[0.8] text-[var(--tinta)]">
            {day}
          </p>
          <div className="pb-1">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[var(--tinta)]">
              {month}
            </p>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[var(--tinta-tenue)]">
              {weekday}
            </p>
          </div>
        </div>

        {/* ── 5. Dominant-family cover card ───────────────────────────── */}
        {summary.dominant && (
          <div
            className="relative overflow-hidden rounded-[var(--r-panel)] p-7 md:p-9"
            style={{ backgroundColor: summary.dominant.hex }}
          >
            <p
              className="text-[0.62rem] font-bold uppercase tracking-[0.2em] opacity-70"
              style={{ color: coverTextColor }}
            >
              Today&apos;s cover · {summary.dominant.label}
            </p>
            <p
              role="heading"
              aria-level={1}
              className="mt-4 max-w-md text-[2.1rem] leading-[1] font-medium sm:text-[2.6rem]"
              style={{ color: coverTextColor, fontFamily: "var(--font-serif)" }}
            >
              {summary.dominant.label} leads your closet.
            </p>
            <p
              className="mt-4 text-[0.9rem] opacity-80"
              style={{ color: coverTextColor }}
            >
              {summary.dominant.count} pieces in this family.
            </p>

            {summary.topFamilies.length > 1 && (
              <div className="mt-6 flex gap-2">
                {summary.topFamilies.map((f) => (
                  <span
                    key={f.family}
                    className="h-3 w-3 rounded-full ring-1 ring-inset ring-white/40"
                    style={{ backgroundColor: f.hex }}
                    title={`${f.label} — ${f.count} pieces`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 6+7. Micro stats + honest insight ───────────────────────── */}
        {summary.totalPieces > 0 && (
          <div>
            <p className="text-[0.72rem] text-[var(--tinta-suave)]">
              {summary.totalPieces} pieces · {summary.activeFamilies} active
              families · {summary.emptyFamilies.length} empty
            </p>
            {insight && (
              <p className="mt-2 text-[0.85rem] leading-6 text-[var(--tinta-tenue)]">
                {insight}
              </p>
            )}
          </div>
        )}

        {/* ── 8. Quick actions as a chip row ──────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          <QuickChip href="/closet" label="Closet" />
          <QuickChip href="/closet/gallery" label="Gallery" />
          <QuickChip href="/wishlist" label="Wishlist" />
          <QuickChip href="/outfits" label="Outfits" />
          <QuickChip href="/closet/add" label="Add piece" />
        </div>
      </section>
    </section>
  );
}
