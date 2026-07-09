export const dynamic = "force-dynamic";

import Link from "next/link";
import type { CSSProperties } from "react";
import { getWardrobeItems } from "@/lib/wardrobe/data";
import { getWishlistItems } from "@/lib/wishlist/data";
import { buildSpectrumEntriesFromItems } from "@/lib/wardrobe/spectrum-data";
import { SPECTRUM_META, CANONICAL_FAMILIES } from "@/lib/wardrobe/spectrum";
import { ChromaSpineBlock } from "@/components/chroma-spine";
import type { ColorFamily, WardrobeCategory, WardrobeItem, WishlistItem } from "@/types/wardrobe";

// ─── Mode ─────────────────────────────────────────────────────────────────────

type Mode = "all" | "owned" | "wishlist";

// ─── Labels ───────────────────────────────────────────────────────────────────

const CATEGORY_LABELS_ES: Record<WardrobeCategory, string> = {
  top:       "Top",
  bottom:    "Pantalón",
  dress:     "Vestido",
  outerwear: "Outerwear",
  shoes:     "Zapatos",
  bag:       "Bolso",
  accessory: "Accesorio",
  jewelry:   "Joyería",
};

const DECISION_LABELS: Record<string, string> = {
  "wishlist":     "Deseo",
  "consider":     "A considerar",
  "buy-priority": "Prioridad",
};

// Feminine article in Spanish editorial context
const LA_FAMILIES = new Set<ColorFamily>(["cream", "mustard"]);

function chapterTitle(family: ColorFamily): string {
  const meta = SPECTRUM_META[family];
  const article = LA_FAMILIES.has(family) ? "La" : "El";
  return `${article} ${meta.labelEs.toLowerCase()}.`;
}

// ─── Color helpers ────────────────────────────────────────────────────────────

function hexLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 0.5;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Returns a CSS color token readable on the given background hex. */
function onHex(hex: string): string {
  return hexLuminance(hex) > 0.45 ? "var(--tinta)" : "var(--papel)";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const MAX_VISIBLE_OWNED = 4;

function OwnedCard({
  item,
  familyHex,
}: {
  item: WardrobeItem;
  familyHex: string;
}) {
  const tagBg =
    hexLuminance(familyHex) > 0.5
      ? "rgba(29,24,20,0.72)"
      : "rgba(255,253,252,0.88)";
  const tagColor =
    hexLuminance(familyHex) > 0.5 ? "#FFFDFC" : "#1D1814";

  const imgStyle: CSSProperties = item.imageUrl
    ? {
        backgroundImage: `url(${item.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }
    : { backgroundColor: familyHex };

  return (
    <Link href={`/closet/item/${item.id}`} className="cl-card" aria-label={item.name}>
      <div className="cl-card-img" style={imgStyle}>
        <span className="cl-card-tag" style={{ background: tagBg, color: tagColor }}>
          {CATEGORY_LABELS_ES[item.category]}
        </span>
      </div>
      <div className="cl-card-copy">
        <p className="cl-card-name">{item.name}</p>
        {item.colorName && <p className="cl-card-meta">{item.colorName}</p>}
      </div>
    </Link>
  );
}

function GhostCard({ item }: { item: WishlistItem }) {
  const hex =
    SPECTRUM_META[item.colorFamily as ColorFamily]?.hex ?? "#8C7B6E";
  const decisionLabel = DECISION_LABELS[item.decision] ?? "Deseo";

  return (
    <div
      className="cl-ghost"
      style={{ borderColor: hex }}
      role="article"
      aria-label={`Deseo: ${item.name}`}
    >
      <div className="cl-ghost-img" style={{ backgroundColor: `${hex}1A` }}>
        <span className="cl-ghost-badge" aria-hidden="true">DESEO</span>
        <span
          className="cl-ghost-swatch"
          style={{ backgroundColor: hex }}
          aria-hidden="true"
        />
      </div>
      <div className="cl-ghost-copy">
        <p className="cl-ghost-name">{item.name}</p>
        <p className="cl-ghost-decision">{decisionLabel}</p>
        {item.targetPrice != null && (
          <p className="cl-ghost-price">Obj. ${item.targetPrice}</p>
        )}
        {item.currentPrice != null && item.targetPrice == null && (
          <p className="cl-ghost-price">${item.currentPrice}</p>
        )}
      </div>
    </div>
  );
}

function OpenChapterCard({
  href,
  remaining,
}: {
  href: string;
  remaining: number;
}) {
  return (
    <Link
      href={href}
      className="cl-open-chapter"
      aria-label="Ver capítulo completo en galería"
    >
      {remaining > 0 && (
        <span className="cl-open-chapter-n">+{remaining}</span>
      )}
      <span className="cl-open-chapter-arrow" aria-hidden="true">→</span>
      <span className="cl-open-chapter-label">Abrir capítulo</span>
    </Link>
  );
}

// ─── Styles — cl-* namespace ──────────────────────────────────────────────────

const CL_STYLES = `
/* ── El Archivo (Fase 6D.2) — cl-* namespace ──
   No gradients. All family colors are flat meta.hex.
   Exception for chapter headers: borderHex hairline for cream/white only.
*/

.cl-wrap{min-height:100vh;background:var(--gal);padding:1.5rem 1rem 7rem;overflow-x:clip;}
.cl-inner{margin:0 auto;max-width:760px;display:flex;flex-direction:column;gap:1.75rem;}

/* masthead — mirrors cs-masthead exactly */
.cl-masthead{display:flex;justify-content:space-between;align-items:baseline;padding:0 4px;}
.cl-masthead b{font-family:var(--font-serif);font-weight:600;font-size:14px;letter-spacing:0.24em;color:var(--tinta);}
.cl-masthead span{font-size:9.5px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:var(--tinta-tenue);}

/* subcopy under spine */
.cl-subcopy{font-family:var(--font-sans);font-size:0.64rem;color:var(--tinta-tenue);margin-top:0.5rem;padding:0 4px;line-height:1.5;}

/* eyebrow + editorial title */
.cl-eyebrow{font-family:var(--font-sans);font-size:0.58rem;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:var(--tinta-tenue);margin-bottom:0.5rem;}
.cl-h1{font-family:var(--font-serif);font-size:clamp(2rem,8vw,2.8rem);font-weight:300;line-height:1.0;color:var(--tinta);}

/* mode toggle */
.cl-mode-row{display:flex;gap:0.4rem;flex-wrap:wrap;}
.cl-mode-chip{display:inline-flex;align-items:center;height:1.85rem;padding:0 0.7rem;border-radius:100px;border:1px solid var(--line);font-family:var(--font-sans);font-size:0.58rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--tinta-tenue);text-decoration:none;transition:border-color 0.15s,color 0.15s,background 0.15s;}
.cl-mode-chip:hover{border-color:var(--tinta-tenue);color:var(--tinta);}
.cl-mode-chip.cl-active{background:var(--tinta);color:var(--papel);border-color:var(--tinta);}

/* balance bar */
.cl-balance{display:flex;flex-direction:column;gap:0.35rem;}
.cl-balance-label{font-family:var(--font-sans);font-size:0.52rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--tinta-tenue);}
.cl-balance-bar{height:4px;border-radius:100px;background:var(--line);overflow:hidden;display:flex;}
.cl-balance-neutral{height:100%;background:var(--tinta);}
.cl-balance-color{height:100%;background:#77303A;}
.cl-balance-note{font-family:var(--font-sans);font-size:0.55rem;color:var(--tinta-tenue);}

/* chapter container */
.cl-chapter{display:flex;flex-direction:column;gap:0.6rem;}

/* chapter header — ALWAYS flat meta.hex, NO gradient */
.cl-chap-head{border-radius:10px;padding:0.85rem 1rem;display:flex;flex-direction:column;gap:0.22rem;}
.cl-chap-eyebrow{font-family:var(--font-sans);font-size:0.5rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;opacity:0.65;}
.cl-chap-title{font-family:var(--font-serif);font-size:1.45rem;font-weight:300;line-height:1.05;}
.cl-chap-count{font-family:var(--font-sans);font-size:0.57rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;opacity:0.7;margin-top:0.18rem;}
.cl-chap-insight{font-family:var(--font-sans);font-size:0.58rem;opacity:0.58;margin-top:0.06rem;line-height:1.4;}

/* ghost banner — owned=0 and wishlist>0 */
.cl-ghost-banner{padding:0.75rem 0.9rem;border-radius:8px;border:1px dashed var(--line);background:var(--papel);}
.cl-ghost-banner-title{font-family:var(--font-sans);font-size:0.68rem;font-weight:700;color:var(--tinta);margin-bottom:0.18rem;}
.cl-ghost-banner-note{font-family:var(--font-sans);font-size:0.6rem;color:var(--tinta-tenue);line-height:1.45;}

/* owned pieces scroll row */
.cl-scroll{display:flex;gap:0.55rem;overflow-x:auto;padding-bottom:0.5rem;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.cl-scroll::-webkit-scrollbar{display:none;}

/* owned PieceCard */
.cl-card{flex-shrink:0;width:112px;border-radius:10px;overflow:hidden;text-decoration:none;background:var(--line);scroll-snap-align:start;display:flex;flex-direction:column;transition:opacity 0.18s;}
.cl-card:hover{opacity:0.84;}
.cl-card-img{height:138px;position:relative;overflow:hidden;}
.cl-card-tag{position:absolute;top:5px;left:5px;font-family:var(--font-sans);font-size:0.47rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:2px 5px;border-radius:3px;}
.cl-card-copy{padding:0.4rem 0.5rem 0.5rem;}
.cl-card-name{font-family:var(--font-serif);font-size:0.7rem;color:var(--tinta);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cl-card-meta{font-family:var(--font-sans);font-size:0.55rem;color:var(--tinta-tenue);margin-top:0.12rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

/* open chapter CTA card */
.cl-open-chapter{flex-shrink:0;width:112px;height:162px;border-radius:10px;border:1.5px solid var(--line);display:flex;flex-direction:column;align-items:center;justify-content:center;text-decoration:none;scroll-snap-align:start;gap:0.12rem;transition:border-color 0.18s;padding:0 0.4rem;text-align:center;}
.cl-open-chapter:hover{border-color:var(--tinta-tenue);}
.cl-open-chapter-n{font-family:var(--font-serif);font-size:1.3rem;font-weight:300;color:var(--tinta);}
.cl-open-chapter-arrow{font-family:var(--font-serif);font-size:1.1rem;font-weight:300;color:var(--tinta);}
.cl-open-chapter-label{font-family:var(--font-sans);font-size:0.46rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--tinta-tenue);}

/* wishlist ghost scroll row */
.cl-ghost-scroll{display:flex;gap:0.5rem;overflow-x:auto;padding-bottom:0.5rem;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.cl-ghost-scroll::-webkit-scrollbar{display:none;}

/* ghost card — dashed border set per-instance via inline borderColor */
.cl-ghost{flex-shrink:0;width:100px;border-radius:10px;display:flex;flex-direction:column;overflow:hidden;border:1.5px dashed;opacity:0.8;scroll-snap-align:start;transition:opacity 0.18s;background:var(--papel);}
.cl-ghost:hover{opacity:1;}
.cl-ghost-img{height:84px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;}
.cl-ghost-badge{position:absolute;top:5px;left:5px;font-family:var(--font-sans);font-size:0.42rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:2px 5px;border-radius:3px;background:rgba(29,24,20,0.1);color:var(--tinta-tenue);}
.cl-ghost-swatch{display:block;width:1.6rem;height:1.6rem;border-radius:50%;opacity:0.45;}
.cl-ghost-copy{padding:0.35rem 0.45rem 0.5rem;}
.cl-ghost-name{font-family:var(--font-serif);font-size:0.65rem;color:var(--tinta);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cl-ghost-decision{font-family:var(--font-sans);font-size:0.48rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--tinta-tenue);margin-top:0.1rem;}
.cl-ghost-price{font-family:var(--font-sans);font-size:0.52rem;color:var(--tinta-tenue);margin-top:0.06rem;font-variant-numeric:tabular-nums;}

/* add piece CTA */
.cl-add{display:inline-flex;align-items:center;height:2.6rem;padding:0 1.4rem;border-radius:100px;background:var(--tinta);color:var(--papel);font-family:var(--font-sans);font-size:0.65rem;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;text-decoration:none;transition:opacity 0.18s;align-self:flex-start;}
.cl-add:hover{opacity:0.8;}
`;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ClosetPage(props: {
  searchParams?: Promise<{ mode?: string }>;
}) {
  // ── Mode (server-side, URL param) ──────────────────────────────────────────
  const sp = props.searchParams ? await props.searchParams : {};
  const rawMode = sp.mode ?? "";
  const mode: Mode =
    rawMode === "owned" ? "owned"
    : rawMode === "wishlist" ? "wishlist"
    : "all";

  // ── Data ───────────────────────────────────────────────────────────────────
  const [ownedItems, wishlistItems] = await Promise.all([
    getWardrobeItems(),
    getWishlistItems().catch((): WishlistItem[] => []),
  ]);

  const ownedCount = ownedItems.length;
  const wishlistCount = wishlistItems.length;
  const archiveTotal = ownedCount + wishlistCount;

  // Spine histogram: owned items, all 18 families for full spectrum view
  const spineEntries = buildSpectrumEntriesFromItems(ownedItems, {
    includeEmpty: true,
  });

  // ── Group by colorFamily ───────────────────────────────────────────────────
  const ownedByFamily: Partial<Record<ColorFamily, WardrobeItem[]>> = {};
  for (const item of ownedItems) {
    const f = item.colorFamily as ColorFamily;
    if (!ownedByFamily[f]) ownedByFamily[f] = [];
    ownedByFamily[f]!.push(item);
  }

  const wishlistByFamily: Partial<Record<ColorFamily, WishlistItem[]>> = {};
  for (const item of wishlistItems) {
    const f = item.colorFamily as ColorFamily;
    if (!wishlistByFamily[f]) wishlistByFamily[f] = [];
    wishlistByFamily[f]!.push(item);
  }

  // ── Build chapters ─────────────────────────────────────────────────────────
  // All canonical families present in owned OR wishlist, in spectral order
  const activeFamilies = CANONICAL_FAMILIES.filter(
    (f) => (ownedByFamily[f]?.length ?? 0) > 0 || (wishlistByFamily[f]?.length ?? 0) > 0,
  );

  // Sort by spectral order (already canonical, but CANONICAL_FAMILIES is taxonomy order;
  // re-sort by SPECTRUM_META.spectralOrder for correct visual order)
  const chaptersRaw = activeFamilies
    .slice()
    .sort((a, b) => SPECTRUM_META[a].spectralOrder - SPECTRUM_META[b].spectralOrder)
    .map((family) => ({
      family,
      meta: SPECTRUM_META[family],
      owned: ownedByFamily[family] ?? [],
      ghosts: wishlistByFamily[family] ?? [],
    }));

  // Dominant owned family (for insight)
  const dominantFamily = chaptersRaw.reduce<ColorFamily | null>(
    (best, ch) =>
      ch.owned.length > (best ? (ownedByFamily[best]?.length ?? 0) : 0)
        ? ch.family
        : best,
    null,
  );

  // ── Balance bar (owned pieces by DA role) ──────────────────────────────────
  const neutralCount = ownedItems.filter(
    (i) => SPECTRUM_META[i.colorFamily as ColorFamily]?.role === "base_neutral",
  ).length;
  const colorCount = ownedCount - neutralCount;
  const neutralPct = ownedCount >= 5 ? Math.round((neutralCount / ownedCount) * 100) : 0;
  const colorPct = ownedCount >= 5 ? 100 - neutralPct : 0;
  const showBalance = ownedCount >= 5;

  return (
    <section className="cl-wrap">
      <style href="closet-cromatica" precedence="component">{CL_STYLES}</style>

      <div className="cl-inner">

        {/* ── 1. Masthead — hermano del Home ────────────────────────────── */}
        <div>
          {/* Masthead row: THE EDIT | EL ARCHIVO · Nº N — mirrors cs-masthead */}
          <div className="cl-masthead" role="banner">
            <b>THE EDIT</b>
            <span>EL ARCHIVO · Nº {archiveTotal}</span>
          </div>
          {/* ChromaSpine — histogram of owned items, no masthead */}
          <ChromaSpineBlock entries={spineEntries} showMasthead={false} />
          <p className="cl-subcopy">
            Tus piezas y deseos organizados por familia cromática.
          </p>
        </div>

        {/* ── 2. Título editorial ───────────────────────────────────────── */}
        <div>
          <p className="cl-eyebrow">Clóset · El Archivo</p>
          <p className="cl-h1">
            El{" "}
            <em style={{ fontStyle: "italic", color: SPECTRUM_META.burgundy.hex }}>
              Archivo.
            </em>
          </p>
        </div>

        {/* ── 3. Mode toggle ────────────────────────────────────────────── */}
        <nav className="cl-mode-row" aria-label="Modo de vista">
          {(
            [
              { m: "all",      label: "Todo",      count: archiveTotal  },
              { m: "owned",    label: "Colección", count: ownedCount    },
              { m: "wishlist", label: "Deseos",    count: wishlistCount },
            ] as const
          ).map(({ m, label, count }) => (
            <Link
              key={m}
              href={`/closet?mode=${m}`}
              className={`cl-mode-chip${mode === m ? " cl-active" : ""}`}
              aria-current={mode === m ? "page" : undefined}
            >
              {label}&nbsp;{count}
            </Link>
          ))}
        </nav>

        {/* ── 4. Balance bar (owned, role-based, only if ≥5 piezas) ──── */}
        {showBalance && (
          <div className="cl-balance">
            <p className="cl-balance-label">Balance de paleta · colección</p>
            <div
              className="cl-balance-bar"
              role="img"
              aria-label={`${neutralPct}% neutrales, ${colorPct}% color y especiales`}
            >
              <div
                className="cl-balance-neutral"
                style={{ width: `${neutralPct}%` }}
              />
              <div
                className="cl-balance-color"
                style={{ width: `${colorPct}%` }}
              />
            </div>
            <p className="cl-balance-note">
              {neutralCount} neutrales ({neutralPct}%) · {colorCount} color y especiales ({colorPct}%)
            </p>
          </div>
        )}

        {/* ── 5. Capítulos ──────────────────────────────────────────────── */}
        {chaptersRaw.length === 0 ? (
          <div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                color: "var(--tinta-tenue)",
              }}
            >
              Aún no tienes piezas registradas.{" "}
              <Link
                href="/closet/add"
                style={{ color: "var(--tinta)", textDecoration: "underline" }}
              >
                Añade la primera.
              </Link>
            </p>
          </div>
        ) : (
          chaptersRaw
            .filter((ch) => {
              if (mode === "owned")    return ch.owned.length > 0;
              if (mode === "wishlist") return ch.ghosts.length > 0;
              return true;
            })
            .map((ch, renderIdx) => {
              const textCol = onHex(ch.meta.hex);
              const chapterNum = String(renderIdx + 1).padStart(2, "0");
              const familyTotal  = ch.owned.length + ch.ghosts.length;
              const pct = archiveTotal > 0
                ? Math.round((familyTotal / archiveTotal) * 100)
                : 0;

              // Count display
              const countDisplay =
                mode === "owned"
                  ? `${ch.owned.length} ${ch.owned.length === 1 ? "pieza" : "piezas"}`
                  : mode === "wishlist"
                  ? `${ch.ghosts.length} ${ch.ghosts.length === 1 ? "deseo" : "deseos"}`
                  : ch.owned.length > 0 && ch.ghosts.length > 0
                  ? `${ch.owned.length} propias · ${ch.ghosts.length} ${ch.ghosts.length === 1 ? "deseo" : "deseos"}`
                  : ch.owned.length > 0
                  ? `${ch.owned.length} ${ch.owned.length === 1 ? "pieza" : "piezas"}`
                  : `${ch.ghosts.length} ${ch.ghosts.length === 1 ? "deseo" : "deseos"}`;

              // Insight — only honest data
              let insight: string | null = null;
              if (ch.family === dominantFamily && ownedCount > 1) {
                insight = "Tu familia más presente.";
              } else if (ch.owned.length === 0 && ch.ghosts.length > 0) {
                insight = "Capítulo sin piezas propias todavía.";
              } else if (ch.ghosts.length > 0 && mode !== "wishlist") {
                insight = "Tienes deseos pendientes en esta familia.";
              }

              // Rendering flags
              const isEmptyOwned = ch.owned.length === 0 && ch.ghosts.length > 0;
              const showOwned    = mode !== "wishlist" && ch.owned.length > 0;
              const showGhosts   = mode !== "owned"    && ch.ghosts.length > 0;
              const showBanner   = isEmptyOwned && mode !== "owned";

              const visibleOwned  = ch.owned.slice(0, MAX_VISIBLE_OWNED);
              const remainingOwned = ch.owned.length - visibleOwned.length;

              const chapHeadStyle: CSSProperties = {
                backgroundColor: ch.meta.hex,
                color: textCol,
                ...(ch.meta.borderHex
                  ? { border: `1px solid ${ch.meta.borderHex}` }
                  : {}),
              };

              return (
                <section
                  key={ch.family}
                  className="cl-chapter"
                  id={`chapter-${ch.family}`}
                  aria-label={`Capítulo ${ch.meta.labelEs}`}
                >
                  {/* Chapter header — flat color, no gradient */}
                  <div className="cl-chap-head" style={chapHeadStyle}>
                    <p className="cl-chap-eyebrow">
                      Capítulo {chapterNum} · {pct}% de tu archivo
                    </p>
                    <p className="cl-chap-title">{chapterTitle(ch.family)}</p>
                    <p className="cl-chap-count">{countDisplay}</p>
                    {insight && (
                      <p className="cl-chap-insight">{insight}</p>
                    )}
                  </div>

                  {/* Ghost banner — empty chapter with wishlist */}
                  {showBanner && (
                    <div className="cl-ghost-banner" role="note">
                      <p className="cl-ghost-banner-title">
                        ✦ El capítulo sin escribir.
                      </p>
                      <p className="cl-ghost-banner-note">
                        Tienes {ch.ghosts.length}{" "}
                        {ch.ghosts.length === 1 ? "deseo" : "deseos"} en{" "}
                        {ch.meta.labelEs.toLowerCase()}, pero todavía ninguna
                        pieza propia.
                      </p>
                    </div>
                  )}

                  {/* Owned pieces — horizontal scroll */}
                  {showOwned && (
                    <div className="cl-scroll">
                      {visibleOwned.map((item) => (
                        <OwnedCard
                          key={item.id}
                          item={item}
                          familyHex={ch.meta.hex}
                        />
                      ))}
                      <OpenChapterCard
                        href={`/closet/gallery?colorFamily=${ch.family}`}
                        remaining={remainingOwned}
                      />
                    </div>
                  )}

                  {/* Wishlist ghosts — dashed cards */}
                  {showGhosts && (
                    <div className="cl-ghost-scroll" aria-label="Deseos en esta familia">
                      {ch.ghosts.map((item) => (
                        <GhostCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })
        )}

        {/* ── 6. Add piece CTA ──────────────────────────────────────────── */}
        <Link href="/closet/add" className="cl-add">
          + Añadir pieza
        </Link>

      </div>
    </section>
  );
}
