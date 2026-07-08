import Link from "next/link";
import { getClosetSpectrumEntries } from "@/lib/wardrobe/spectrum-data";
import { ChromaSpineBlock } from "@/components/chroma-spine";
import type { SpectrumEntry } from "@/lib/wardrobe/spectrum";
import type { WardrobeItem } from "@/types/wardrobe";

export const dynamic = "force-dynamic";

// ─── Edition number ─────────────────────────────────────────────────────────
// Anchored to the first commit of the cromatica-v1 branch (2026-06-29).
// Nº = floor((today − epoch) / 1 day) + 1 — never uses piece count.

const EDITION_EPOCH = new Date("2026-06-29T14:28:06Z");

function getEditionNumber(): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.floor((Date.now() - EDITION_EPOCH.getTime()) / msPerDay) + 1);
}

// ─── Server-side helpers ────────────────────────────────────────────────────

/** Real server date in Puerto Rico time, labels in Spanish. */
function getEditionDate() {
  const now = new Date();
  const pr = "America/Puerto_Rico";
  const day = new Intl.DateTimeFormat("es-PR", { day: "2-digit", timeZone: pr }).format(now);
  const month = new Intl.DateTimeFormat("es-PR", { month: "long", timeZone: pr }).format(now);
  const weekday = new Intl.DateTimeFormat("es-PR", { weekday: "long", timeZone: pr }).format(now);
  return {
    day,
    month: month.toUpperCase(),
    weekday: weekday.toUpperCase(),
  };
}

interface FamilySummary {
  family: string;
  label: string;
  labelEs: string;
  count: number;
  hex: string;
}

interface ClosetSummary {
  totalPieces: number;
  activeFamilies: number;
  emptyFamilies: { family: string; labelEs: string }[];
  dominant: FamilySummary | null;
  topFamilies: FamilySummary[];
}

function buildClosetSummary(
  entries: SpectrumEntry<WardrobeItem>[],
): ClosetSummary {
  const totalPieces = entries.reduce((sum, e) => sum + e.count, 0);

  const activeFamilies = entries
    .filter((e) => e.count > 0)
    .map<FamilySummary>((e) => ({
      family: String(e.family),
      label: e.meta.label,
      labelEs: e.meta.labelEs,
      count: e.count,
      hex: e.meta.hex,
    }))
    .sort((a, b) => b.count - a.count);

  const emptyFamilies = entries
    .filter((e) => e.count === 0)
    .map((e) => ({ family: String(e.family), labelEs: e.meta.labelEs }));

  return {
    totalPieces,
    activeFamilies: activeFamilies.length,
    emptyFamilies,
    dominant: activeFamilies[0] ?? null,
    topFamilies: activeFamilies.slice(0, 3),
  };
}

/** Ticker items — derived strictly from real closet data. */
function buildTickerItems(summary: ClosetSummary): string[] {
  if (summary.totalPieces === 0) return [];
  const items: string[] = [];

  if (summary.dominant) {
    items.push(
      `${summary.dominant.labelEs.toUpperCase()} DOMINA TU ESPECTRO · ${summary.dominant.count} PIEZAS`,
    );
  }
  if (summary.topFamilies.length > 1) {
    items.push(
      `${summary.topFamilies[1].labelEs.toUpperCase()} EN SEGUNDO LUGAR · ${summary.topFamilies[1].count} PIEZAS`,
    );
  }
  if (summary.emptyFamilies.length > 0) {
    items.push(`TE FALTA ${summary.emptyFamilies[0].labelEs.toUpperCase()} EN TU PALETA`);
  }
  if (summary.emptyFamilies.length > 1) {
    items.push(`Y TAMBIÉN ${summary.emptyFamilies[1].labelEs.toUpperCase()}`);
  }
  items.push(
    `${summary.totalPieces} PIEZAS · ${summary.activeFamilies} FAMILIAS ACTIVAS`,
  );
  return items;
}

/** Perceived luminance [0–1]. > 0.45 = light background → dark text. */
function hexLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 0.5;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Darkens a hex by reducing each channel by `ratio` (0–1). */
function darkenHex(hex: string, ratio: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const factor = 1 - ratio;
  const r = Math.round(parseInt(clean.slice(0, 2), 16) * factor);
  const g = Math.round(parseInt(clean.slice(2, 4), 16) * factor);
  const b = Math.round(parseInt(clean.slice(4, 6), 16) * factor);
  const h = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
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
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {label}
    </Link>
  );
}

// ─── Home ───────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const entries = await getClosetSpectrumEntries({ includeEmpty: true });
  const summary = buildClosetSummary(entries);
  const tickerItems = buildTickerItems(summary);
  const { day, month, weekday } = getEditionDate();
  const editionNumber = getEditionNumber();

  const isLightBg =
    summary.dominant ? hexLuminance(summary.dominant.hex) > 0.45 : false;
  const coverTextColor = isLightBg ? "var(--tinta)" : "var(--papel)";
  const coverBtnBg    = isLightBg ? "var(--tinta)" : "var(--papel)";
  const coverBtnText  = isLightBg ? "var(--papel)" : "var(--tinta)";

  // Gradient: linear 150° hex → darken 12% + soft radial light top-right
  const coverBg = summary.dominant
    ? [
        `radial-gradient(ellipse at 85% 12%, rgba(255,253,245,0.15) 0%, transparent 55%)`,
        `linear-gradient(150deg, ${summary.dominant.hex} 0%, ${darkenHex(summary.dominant.hex, 0.12)} 100%)`,
      ].join(", ")
    : "var(--tinta)";

  return (
    /* overflow-x:clip — clips overflow without creating a scroll container (unlike hidden) */
    <section className="min-h-screen bg-[var(--gal)] px-4 pb-28 pt-6 md:px-6 md:pt-10 [overflow-x:clip]">
      {/* CSS para marquee — display:block evita que inline-block contribuya al scrollWidth */}
      <style>{`
        @keyframes te-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .te-ticker-track {
          display: block;
          width: max-content;
          white-space: nowrap;
          animation: te-ticker 34s linear infinite;
          will-change: transform;
        }
        .te-ticker-track:hover { animation-play-state: paused; }
      `}</style>

      <section className="mx-auto flex max-w-[760px] flex-col gap-7">

        {/* ── 1. Editorial masthead + histogram + caption (ChromaSpineBlock) */}
        <ChromaSpineBlock
          entries={entries}
          editionNumber={editionNumber}
        />

        {/* ── 3. Bloque de fecha editorial ──────────────────────────────── */}
        <div className="flex items-end gap-4">
          <p
            className="text-[4.2rem] leading-[0.8] text-[var(--tinta)]"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
          >
            {day}
          </p>
          <div className="pb-1">
            <p
              className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[var(--tinta)]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {month}
            </p>
            <p
              className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[var(--tinta-tenue)]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {weekday}
            </p>
          </div>
        </div>

        {/* ── 4. Cover card — portada del día ────────────────────────────── */}
        {summary.dominant && (
          <>
            <div
              className="relative overflow-hidden rounded-[var(--r-panel)] p-7 md:p-9"
              style={{ background: coverBg }}
            >
              {/* Swatches apilados en la esquina superior derecha */}
              {summary.topFamilies.length > 1 && (
                <div className="absolute right-7 top-7 flex flex-col gap-[0.35rem]">
                  {summary.topFamilies.map((f) => (
                    <span
                      key={f.family}
                      className="h-[1.15rem] w-[1.15rem] rounded-full ring-1 ring-inset ring-white/25"
                      style={{ backgroundColor: f.hex }}
                      title={`${f.labelEs} — ${f.count} piezas`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              )}

              {/* Eyebrow */}
              <p
                className="text-[0.58rem] font-bold uppercase tracking-[0.22em] opacity-70 pr-12"
                style={{ color: coverTextColor, fontFamily: "var(--font-sans)" }}
              >
                La portada de hoy · {summary.dominant.labelEs}
              </p>

              {/* Título editorial: "El {familia} trabaja hoy." con itálico */}
              <p
                role="heading"
                aria-level={1}
                className="mt-5 max-w-[14rem] text-[2.2rem] leading-[1.05] font-light sm:text-[2.7rem] sm:max-w-[17rem] pr-8"
                style={{ color: coverTextColor, fontFamily: "var(--font-serif)" }}
              >
                El {summary.dominant.labelEs.toLowerCase()} trabaja{" "}
                <em>hoy.</em>
              </p>

              {/* Subtext — dato real */}
              <p
                className="mt-4 text-[0.82rem] leading-[1.5] opacity-75 pr-12"
                style={{ color: coverTextColor, fontFamily: "var(--font-sans)" }}
              >
                {summary.dominant.count} piezas · tu familia dominante
              </p>

              {/* CTA único — lógica real */}
              <div className="mt-7">
                <Link
                  href={`/closet/gallery?colorFamily=${summary.dominant.family}`}
                  className="inline-flex h-10 items-center justify-center rounded-[var(--r-chip)] px-5 text-[0.65rem] font-bold uppercase tracking-[0.14em] no-underline transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    backgroundColor: coverBtnBg,
                    color: coverBtnText,
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Ver esta familia
                </Link>
              </div>
            </div>

            {/* ── 5. Ticker de datos reales ─────────────────────────────── */}
            {tickerItems.length > 0 && (
              <div className="relative w-full overflow-hidden border-y border-[var(--line)] py-[0.45rem]">
                <div className="te-ticker-track">
                  {[...tickerItems, ...tickerItems].map((item, i) => (
                    <span
                      key={i}
                      className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[var(--tinta-tenue)]"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {item}
                      <span className="mx-5 opacity-30" aria-hidden="true">·</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── 6. Acciones rápidas ──────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          <QuickChip href="/closet" label="Clóset" />
          <QuickChip href="/closet/gallery" label="Galería" />
          <QuickChip href="/wishlist" label="Wishlist" />
          <QuickChip href="/outfits" label="Outfits" />
          <QuickChip href="/closet/add" label="Añadir" />
        </div>

      </section>
    </section>
  );
}
