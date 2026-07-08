import Link from "next/link";
import { getClosetSpectrumEntries } from "@/lib/wardrobe/spectrum-data";
import { getWardrobeItems } from "@/lib/wardrobe/data";
import { composeOutfits } from "@/lib/style-profile/outfit-composer";
import { SPECTRUM_META } from "@/lib/wardrobe/spectrum";
import { ChromaSpineBlock } from "@/components/chroma-spine";
import { DailyLookCover } from "@/components/daily-look-cover";
import type { LookCandidate } from "@/components/daily-look-cover";
import type { SpectrumEntry } from "@/lib/wardrobe/spectrum";
import type { ColorFamily, WardrobeCategory, WardrobeItem } from "@/types/wardrobe";

export const dynamic = "force-dynamic";

// ─── Edition number ─────────────────────────────────────────────────────────
const EDITION_EPOCH = new Date("2026-06-29T14:28:06Z");

function getEditionNumber(): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.floor((Date.now() - EDITION_EPOCH.getTime()) / msPerDay) + 1);
}

// ─── Server-side helpers ────────────────────────────────────────────────────

function getEditionDate() {
  const now = new Date();
  const pr = "America/Puerto_Rico";
  const day = new Intl.DateTimeFormat("es-PR", { day: "2-digit", timeZone: pr }).format(now);
  const month = new Intl.DateTimeFormat("es-PR", { month: "long", timeZone: pr }).format(now);
  const weekday = new Intl.DateTimeFormat("es-PR", { weekday: "long", timeZone: pr }).format(now);
  return { day, month: month.toUpperCase(), weekday: weekday.toUpperCase() };
}

interface FamilySummary { family: string; label: string; labelEs: string; count: number; hex: string; }
interface ClosetSummary {
  totalPieces: number;
  activeFamilies: number;
  emptyFamilies: { family: string; labelEs: string }[];
  dominant: FamilySummary | null;
  topFamilies: FamilySummary[];
}

function buildClosetSummary(entries: SpectrumEntry<WardrobeItem>[]): ClosetSummary {
  const totalPieces = entries.reduce((sum, e) => sum + e.count, 0);
  const activeFamilies = entries
    .filter((e) => e.count > 0)
    .map<FamilySummary>((e) => ({
      family: String(e.family), label: e.meta.label, labelEs: e.meta.labelEs,
      count: e.count, hex: e.meta.hex,
    }))
    .sort((a, b) => b.count - a.count);
  const emptyFamilies = entries
    .filter((e) => e.count === 0)
    .map((e) => ({ family: String(e.family), labelEs: e.meta.labelEs }));
  return {
    totalPieces, activeFamilies: activeFamilies.length, emptyFamilies,
    dominant: activeFamilies[0] ?? null, topFamilies: activeFamilies.slice(0, 3),
  };
}

function buildTickerItems(summary: ClosetSummary): string[] {
  if (summary.totalPieces === 0) return [];
  const items: string[] = [];
  if (summary.dominant) {
    items.push(`${summary.dominant.labelEs.toUpperCase()} DOMINA TU ESPECTRO · ${summary.dominant.count} PIEZAS`);
  }
  if (summary.topFamilies.length > 1) {
    items.push(`${summary.topFamilies[1].labelEs.toUpperCase()} EN SEGUNDO LUGAR · ${summary.topFamilies[1].count} PIEZAS`);
  }
  if (summary.emptyFamilies.length > 0) {
    items.push(`TE FALTA ${summary.emptyFamilies[0].labelEs.toUpperCase()} EN TU PALETA`);
  }
  if (summary.emptyFamilies.length > 1) {
    items.push(`Y TAMBIÉN ${summary.emptyFamilies[1].labelEs.toUpperCase()}`);
  }
  items.push(`${summary.totalPieces} PIEZAS · ${summary.activeFamilies} FAMILIAS ACTIVAS`);
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

// ─── Daily look helpers ──────────────────────────────────────────────────────

/**
 * Spanish labels for each WardrobeCategory — used in the editorial title.
 * Prefer item.subcategory when it's short enough (≤12 chars) for more specificity.
 */
const CATEGORY_LABELS_ES: Record<WardrobeCategory, string> = {
  top:       "Top",
  bottom:    "Pantalón",
  dress:     "Vestido",
  outerwear: "Blazer",
  shoes:     "Zapatos",
  bag:       "Bolso",
  accessory: "Accesorio",
  jewelry:   "Joyería",
};

/**
 * Builds the editorial cover title from the two anchor pieces of a look.
 *
 * Format: "{categoryEs} {colorLabelEs}, base {baseColorLabelEs}."
 * Example: "Blazer negro, base crema."
 *
 * Falls back to "{categoryEs} {colorLabelEs}, hoy." when:
 *   — no bottom/base piece exists (dress look), or
 *   — the composed string exceeds ~45 characters.
 */
function buildEditorialTitle(
  anchor: WardrobeItem,
  bottom: WardrobeItem | undefined,
): string {
  // Category label: use subcategory if it's a short, specific word
  const sub = anchor.subcategory?.trim();
  const categoryEs =
    sub && sub.length <= 12
      ? sub
      : (CATEGORY_LABELS_ES[anchor.category] ?? "Pieza");

  const anchorMeta = SPECTRUM_META[anchor.colorFamily as ColorFamily];
  const anchorColor = anchorMeta?.labelEs?.toLowerCase() ?? "";

  if (bottom) {
    const bottomMeta = SPECTRUM_META[bottom.colorFamily as ColorFamily];
    const baseColor = bottomMeta?.labelEs?.toLowerCase() ?? "";
    const full = `${categoryEs} ${anchorColor}, base ${baseColor}.`;
    if (full.length <= 45) return full;
  }

  const short = `${categoryEs} ${anchorColor}, hoy.`;
  return short.length <= 45 ? short : `${categoryEs.slice(0, 18)}, hoy.`;
}

/**
 * Stable daily index from Puerto Rico date (YYYY-MM-DD → hash → modulo).
 * Same date → same index all day. Changes at PR midnight.
 */
function getDailyIndex(count: number): number {
  if (count === 0) return 0;
  const prDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Puerto_Rico",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  let hash = 0;
  for (const ch of prDate) hash = ((hash * 31) + ch.charCodeAt(0)) >>> 0;
  return hash % count;
}

function buildLookCandidates(wardrobeItems: WardrobeItem[]): LookCandidate[] {
  const composed = composeOutfits(wardrobeItems, { maxLooks: 12 });

  const top3 = composed
    .filter((l) => l.decision !== "rejected")
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 3);

  if (top3.length === 0) return [];

  const itemById = new Map(wardrobeItems.map((i) => [i.id, i]));

  return top3.map((look) => {
    const pieces = look.pieceIds
      .map((id) => itemById.get(id))
      .filter((p): p is WardrobeItem => p != null);

    // ── Anchor + base pieces for editorial title ─────────────────────────
    const anchor =
      pieces.find((p) => p.category === "outerwear") ??
      pieces.find((p) => p.category === "dress") ??
      pieces.find((p) => p.category === "top") ??
      pieces[0];

    const bottom = pieces.find((p) => p.category === "bottom");

    const editorialTitle = anchor
      ? buildEditorialTitle(anchor, bottom)
      : look.title;

    // ── Dominant colorFamily for gradient ────────────────────────────────
    const familyCounts: Record<string, number> = {};
    for (const p of pieces) {
      if (p.colorFamily) {
        const k = String(p.colorFamily);
        familyCounts[k] = (familyCounts[k] ?? 0) + 1;
      }
    }
    const dominantFamily = (
      Object.entries(familyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "black"
    ) as ColorFamily;

    const dominantMeta = SPECTRUM_META[dominantFamily] ?? SPECTRUM_META.black;
    const dominantHex = dominantMeta.hex;

    // ── Swatches: up to 4 unique hexes ordered by piece ─────────────────
    const seenHex = new Set<string>();
    const swatchHexes: string[] = [];
    for (const p of pieces) {
      if (swatchHexes.length >= 4) break;
      const meta = SPECTRUM_META[p.colorFamily as ColorFamily];
      if (meta?.hex && !seenHex.has(meta.hex)) {
        seenHex.add(meta.hex);
        swatchHexes.push(meta.hex);
      }
    }

    const coverBg = [
      `radial-gradient(ellipse at 85% 12%, rgba(255,253,245,0.15) 0%, transparent 55%)`,
      `linear-gradient(150deg, ${dominantHex} 0%, ${darkenHex(dominantHex, 0.12)} 100%)`,
    ].join(", ");

    const isLight = hexLuminance(dominantHex) > 0.45;

    return {
      outfitId:      look.id,
      editorialTitle,
      anchorPieceName: anchor?.name ?? "",
      pieceCount:    pieces.length,
      colorScore:    look.colorScore,   // raw from validator (0–100, already rounded)
      pieceIds:      look.pieceIds,
      swatchHexes,
      coverBg,
      textColor: isLight ? "var(--tinta)" : "var(--papel)",
      btnBg:     isLight ? "var(--tinta)" : "var(--papel)",
      btnText:   isLight ? "var(--papel)" : "var(--tinta)",
    };
  });
}

// ─── Home ───────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [entries, wardrobeItems] = await Promise.all([
    getClosetSpectrumEntries({ includeEmpty: true }),
    getWardrobeItems(),
  ]);

  const summary = buildClosetSummary(entries);
  const tickerItems = buildTickerItems(summary);
  const { day, month, weekday } = getEditionDate();
  const editionNumber = getEditionNumber();

  // ── Daily look candidates ────────────────────────────────────────────────
  let lookCandidates: LookCandidate[] = [];
  try {
    lookCandidates = buildLookCandidates(wardrobeItems);
  } catch (err) {
    console.error("[HomePage] composeOutfits failed, using fallback cover:", err);
  }

  const dailyStart = getDailyIndex(lookCandidates.length);
  const orderedCandidates =
    lookCandidates.length > 0
      ? [...lookCandidates.slice(dailyStart), ...lookCandidates.slice(0, dailyStart)]
      : [];

  // ── Fallback cover (family-dominant) ────────────────────────────────────
  const isLightBg    = summary.dominant ? hexLuminance(summary.dominant.hex) > 0.45 : false;
  const coverTextColor = isLightBg ? "var(--tinta)" : "var(--papel)";
  const coverBtnBg     = isLightBg ? "var(--tinta)" : "var(--papel)";
  const coverBtnText   = isLightBg ? "var(--papel)" : "var(--tinta)";
  const coverBg = summary.dominant
    ? [
        `radial-gradient(ellipse at 85% 12%, rgba(255,253,245,0.15) 0%, transparent 55%)`,
        `linear-gradient(150deg, ${summary.dominant.hex} 0%, ${darkenHex(summary.dominant.hex, 0.12)} 100%)`,
      ].join(", ")
    : "var(--tinta)";

  return (
    <section className="min-h-screen bg-[var(--gal)] px-4 pb-28 pt-6 md:px-6 md:pt-10 [overflow-x:clip]">
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

        {/* ── 1. Masthead + histogram + caption */}
        <ChromaSpineBlock entries={entries} editionNumber={editionNumber} />

        {/* ── 2. Fecha editorial */}
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

        {/* ── 3. Cover: daily look (Fase 5B) → family fallback */}
        {orderedCandidates.length > 0 ? (
          <DailyLookCover candidates={orderedCandidates} editionNumber={editionNumber} />
        ) : summary.dominant ? (
          <div
            className="relative overflow-hidden rounded-[var(--r-panel)] p-7 md:p-9"
            style={{ background: coverBg }}
          >
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
            <p
              className="text-[0.58rem] font-bold uppercase tracking-[0.22em] opacity-70 pr-12"
              style={{ color: coverTextColor, fontFamily: "var(--font-sans)" }}
            >
              La portada de hoy · {summary.dominant.labelEs}
            </p>
            <p
              role="heading"
              aria-level={1}
              className="mt-5 max-w-[14rem] text-[2.2rem] leading-[1.05] font-light sm:text-[2.7rem] sm:max-w-[17rem] pr-8"
              style={{ color: coverTextColor, fontFamily: "var(--font-serif)" }}
            >
              El {summary.dominant.labelEs.toLowerCase()} trabaja{" "}
              <em>hoy.</em>
            </p>
            <p
              className="mt-4 text-[0.82rem] leading-[1.5] opacity-75 pr-12"
              style={{ color: coverTextColor, fontFamily: "var(--font-sans)" }}
            >
              {summary.dominant.count} piezas · tu familia dominante
            </p>
            <div className="mt-7">
              <Link
                href={`/closet/gallery?colorFamily=${summary.dominant.family}`}
                className="inline-flex h-10 items-center justify-center rounded-[var(--r-chip)] px-5 text-[0.65rem] font-bold uppercase tracking-[0.14em] no-underline transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ backgroundColor: coverBtnBg, color: coverBtnText, fontFamily: "var(--font-sans)" }}
              >
                Ver esta familia
              </Link>
            </div>
          </div>
        ) : null}

        {/* ── 4. Ticker */}
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

        {/* Fase 5C: quick-actions go here */}

      </section>
    </section>
  );
}
