import Link from "next/link";
import { getClosetSpectrumEntries } from "@/lib/wardrobe/spectrum-data";
import { getWardrobeItems } from "@/lib/wardrobe/data";
import { composeOutfits } from "@/lib/style-profile/outfit-composer";
import { SPECTRUM_META } from "@/lib/wardrobe/spectrum";
import { getCalendarEvents } from "@/lib/calendar";
import { getWishlistCount } from "@/lib/wishlist/data";
import { getSavedOutfitsCount } from "@/lib/outfits/data";
import { EditorialMasthead } from "@/components/editorial-masthead";
import { getEditionNumber, getPRDateString } from "@/lib/edition";
import { DailyLookCover } from "@/components/daily-look-cover";
import type { LookCandidate } from "@/components/daily-look-cover";
import type { SpectrumEntry } from "@/lib/wardrobe/spectrum";
import type { CalendarCategory, CalendarEvent } from "@/lib/calendar";
import type { ColorFamily, WardrobeCategory, WardrobeItem } from "@/types/wardrobe";

export const dynamic = "force-dynamic";

// ─── PR time helpers ────────────────────────────────────────────────────────
// getPRDateString and getEditionNumber imported from @/lib/edition above.

/** Current hour in PR time (0–23). PR is UTC-4, no DST. */
function getPRHour(): number {
  const prMs = Date.now() - 4 * 60 * 60 * 1000;
  return new Date(prMs).getUTCHours();
}

function getGreeting(): string {
  const h = getPRHour();
  if (h >= 5 && h < 12) return "Buenos días.";
  if (h >= 12 && h < 20) return "Buenas tardes.";
  return "Buenas noches.";
}

function getEditionDate() {
  const now = new Date();
  const pr = "America/Puerto_Rico";
  const day = new Intl.DateTimeFormat("es-PR", { day: "2-digit", timeZone: pr }).format(now);
  const month = new Intl.DateTimeFormat("es-PR", { month: "long", timeZone: pr }).format(now);
  const weekday = new Intl.DateTimeFormat("es-PR", { weekday: "long", timeZone: pr }).format(now);
  return { day, month: month.toUpperCase(), weekday: weekday.toUpperCase() };
}

// ─── Calendar helpers ────────────────────────────────────────────────────────

/** Format an event's start time in PR local time (e.g. "9:30 a. m."). */
function formatEventTime(isoStart: string): string {
  return new Intl.DateTimeFormat("es-PR", {
    timeZone: "America/Puerto_Rico",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(isoStart));
}

/** Dot color hex per calendar category, using Dark Autumn palette. */
const CATEGORY_DOT: Record<CalendarCategory, string> = {
  personal: SPECTRUM_META.burgundy.hex,
  holiday:  SPECTRUM_META.mustard.hex,
  workout:  SPECTRUM_META.olive.hex,
};

/**
 * Fetch today's calendar events in PR time.
 * Returns [] if calendar is unconfigured or all sources fail.
 * Uses UTC midnight boundaries for rrule.between compatibility.
 */
async function getTodayCalendarEvents(): Promise<CalendarEvent[]> {
  const prDate = getPRDateString(); // "2026-07-08"
  // UTC midnight as rangeStart — required for rrule.between (see memory)
  const rangeStart = new Date(prDate + "T00:00:00.000Z");
  // 28h window covers full PR day (UTC-4) including late-night events
  const rangeEnd = new Date(rangeStart.getTime() + 28 * 60 * 60 * 1000);

  try {
    const result = await getCalendarEvents(rangeStart, rangeEnd);
    if (!result.configured || result.events.length === 0) return [];

    // Filter to events that land on today in PR time
    return result.events.filter((ev) => {
      const evPRDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Puerto_Rico",
        year: "numeric", month: "2-digit", day: "2-digit",
      }).format(new Date(ev.start));
      return evPRDate === prDate;
    });
  } catch {
    return [];
  }
}

// ─── Closet summary ──────────────────────────────────────────────────────────

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

function buildTickerItems(
  summary: ClosetSummary,
  wishlistCount: number,
  savedLooksCount: number,
): string[] {
  if (summary.totalPieces === 0) return [];
  const items: string[] = [];

  if (summary.dominant) {
    items.push(`${summary.dominant.labelEs.toUpperCase()} DOMINA TU ESPECTRO · ${summary.dominant.count} PIEZAS`);
  }
  if (summary.topFamilies.length > 1) {
    items.push(`${summary.topFamilies[1].labelEs.toUpperCase()} EN SEGUNDO LUGAR · ${summary.topFamilies[1].count} PIEZAS`);
  }
  if (wishlistCount > 0) {
    items.push(`${wishlistCount} ${wishlistCount === 1 ? "PIEZA EN WISHLIST" : "PIEZAS EN WISHLIST"}`);
  }
  if (savedLooksCount > 0) {
    items.push(`${savedLooksCount} ${savedLooksCount === 1 ? "LOOK GUARDADO" : "LOOKS GUARDADOS"}`);
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

// ─── Color helpers ───────────────────────────────────────────────────────────

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

function buildEditorialTitle(anchor: WardrobeItem, bottom: WardrobeItem | undefined): string {
  const sub = anchor.subcategory?.trim();
  const categoryEs = sub && sub.length <= 12 ? sub : (CATEGORY_LABELS_ES[anchor.category] ?? "Pieza");
  const anchorMeta = SPECTRUM_META[anchor.colorFamily as ColorFamily];
  const anchorColor = anchorMeta?.labelEs?.toLowerCase() ?? "";

  if (bottom) {
    const bottomMeta = SPECTRUM_META[bottom.colorFamily as ColorFamily];
    const baseColor = bottomMeta?.labelEs?.toLowerCase() ?? "";
    if (anchorColor && anchorColor === baseColor) {
      const mono = `Look monocromo en ${anchorColor}.`;
      if (mono.length <= 45) return mono;
    }
    const full = `${categoryEs} ${anchorColor}, base ${baseColor}.`;
    if (full.length <= 45) return full;
  }

  const short = `${categoryEs} ${anchorColor}, hoy.`;
  return short.length <= 45 ? short : `${categoryEs.slice(0, 18)}, hoy.`;
}

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

    const anchor =
      pieces.find((p) => p.category === "outerwear") ??
      pieces.find((p) => p.category === "dress") ??
      pieces.find((p) => p.category === "top") ??
      pieces[0];
    const bottom = pieces.find((p) => p.category === "bottom");

    const editorialTitle = anchor ? buildEditorialTitle(anchor, bottom) : look.title;

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
      outfitId:        look.id,
      editorialTitle,
      anchorPieceName: anchor?.name ?? "",
      pieceCount:      pieces.length,
      colorScore:      look.colorScore,
      pieceIds:        look.pieceIds,
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
  const [entries, wardrobeItems, wishlistCount, savedLooksCount, todayEvents] = await Promise.all([
    getClosetSpectrumEntries({ includeEmpty: true }),
    getWardrobeItems(),
    getWishlistCount().catch(() => 0),
    getSavedOutfitsCount().catch(() => 0),
    getTodayCalendarEvents(),
  ]);

  const summary   = buildClosetSummary(entries);
  const tickerItems = buildTickerItems(summary, wishlistCount, savedLooksCount);
  const { day, month, weekday } = getEditionDate();
  const editionNumber = getEditionNumber();
  const greeting  = getGreeting();

  // ── Daily look ───────────────────────────────────────────────────────────
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

  // ── Agenda: max 4 shown ──────────────────────────────────────────────────
  const visibleEvents = todayEvents.slice(0, 4);
  const extraEvents   = todayEvents.length - visibleEvents.length;

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
        <EditorialMasthead
          entries={entries}
          editionNumber={editionNumber}
          captionLeft="TU ESPECTRO"
          captionRight={`${summary.totalPieces} PIEZAS`}
        />

        {/* ── 2. Fecha + saludo */}
        <div>
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
          {/* Saludo contextual — solo texto, sin card */}
          <p
            className="mt-2 text-[0.8rem] text-[var(--tinta-tenue)] italic"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {greeting}
          </p>
        </div>

        {/* ── 3. Cover: look del día → fallback familia dominante */}
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

        {/* ── 4. Hoy — agenda del día (solo si hay eventos) */}
        {visibleEvents.length > 0 && (
          <div>
            <p
              className="mb-3 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[var(--tinta-tenue)]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Hoy
            </p>
            <div className="flex flex-col">
              {visibleEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center gap-3 border-b border-[var(--line)] py-[0.6rem] last:border-b-0"
                >
                  {/* Hora */}
                  <span
                    className="w-[3.6rem] shrink-0 text-[0.68rem] tabular-nums text-[var(--tinta-tenue)]"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {ev.allDay ? "todo el día" : formatEventTime(ev.start)}
                  </span>
                  {/* Dot de categoría */}
                  <span
                    className="h-[0.45rem] w-[0.45rem] shrink-0 rounded-full"
                    style={{ backgroundColor: CATEGORY_DOT[ev.category] }}
                    aria-hidden="true"
                  />
                  {/* Título */}
                  <span
                    className="truncate text-[0.82rem] font-medium text-[var(--tinta)]"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {ev.title}
                  </span>
                </div>
              ))}
            </div>
            {extraEvents > 0 && (
              <p
                className="mt-2 text-[0.65rem] text-[var(--tinta-tenue)]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                y {extraEvents} {extraEvents === 1 ? "evento más" : "eventos más"}
              </p>
            )}
          </div>
        )}

        {/* ── 5. Ticker */}
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

        {/* ── 6. Quick actions */}
        <div>
          <p
            className="mb-[0.6rem] text-[0.52rem] font-bold uppercase tracking-[0.2em] text-[var(--tinta-tenue)]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Accesos
          </p>
          <div className="flex flex-wrap gap-[0.4rem]">
            {(
              [
                { label: "Clóset",        href: "/closet" },
                { label: "Galería",       href: "/closet/gallery" },
                { label: "Outfits",       href: "/outfits" },
                { label: "La Lista",      href: "/wishlist" },
                { label: "+ Añadir pieza", href: "/closet/add" },
              ] as const
            ).map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex h-[1.85rem] items-center rounded-full border border-[var(--line)] px-[0.7rem] text-[0.58rem] font-bold uppercase tracking-[0.1em] text-[var(--tinta-tenue)] no-underline transition-colors duration-150 hover:border-[var(--tinta-tenue)] hover:text-[var(--tinta)]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

      </section>
    </section>
  );
}
