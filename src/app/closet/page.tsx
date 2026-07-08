export const dynamic = "force-dynamic";

import Link from "next/link";
import type { CSSProperties } from "react";
import { getWardrobeItems } from "@/lib/wardrobe/data";
import { buildSpectrumEntriesFromItems } from "@/lib/wardrobe/spectrum-data";
import { SPECTRUM_META } from "@/lib/wardrobe/spectrum";
import { ChromaSpineBlock } from "@/components/chroma-spine";
import type { WardrobeCategory, WardrobeItem } from "@/types/wardrobe";
import type { ColorFamily } from "@/types/wardrobe";
import type { SpectrumEntry } from "@/lib/wardrobe/spectrum";

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_LABELS_ES: Record<WardrobeCategory, string> = {
  top:       "Tops",
  bottom:    "Pantalones",
  dress:     "Vestidos",
  outerwear: "Outerwear",
  shoes:     "Zapatos",
  bag:       "Bolsos",
  accessory: "Accesorios",
  jewelry:   "Joyería",
};

const CATEGORY_ORDER: WardrobeCategory[] = [
  "top", "bottom", "shoes", "dress", "bag", "accessory", "jewelry", "outerwear",
];

const TARGETS: Partial<Record<WardrobeCategory, number>> = {
  bag: 6, dress: 10, accessory: 15, jewelry: 12, outerwear: 2,
};

const MAX_VISIBLE = 4;

// ─── Pure helpers ────────────────────────────────────────────────────────────

function darkenHex(hex: string, ratio: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const f = 1 - ratio;
  const r = Math.round(parseInt(clean.slice(0, 2), 16) * f);
  const g = Math.round(parseInt(clean.slice(2, 4), 16) * f);
  const b = Math.round(parseInt(clean.slice(4, 6), 16) * f);
  const h = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function hexLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 0.5;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function categoryGap(category: WardrobeCategory, count: number): string {
  const target = TARGETS[category];
  if (!target) return "";
  const remaining = target - count;
  if (remaining <= 0) return "";
  return `Faltan ${remaining}`;
}

/** Round-robin across categories, highest-scored first, up to `limit` pieces. */
function buildReadyToStyle(items: WardrobeItem[], limit = 6): WardrobeItem[] {
  const sorted = [...items].sort((a, b) => {
    const scoreA = (a.loveScore ?? 0) + (a.fitConfidenceScore ?? 0);
    const scoreB = (b.loveScore ?? 0) + (b.fitConfidenceScore ?? 0);
    return scoreB - scoreA;
  });

  const buckets = new Map<WardrobeCategory, WardrobeItem[]>();
  for (const item of sorted) {
    const bucket = buckets.get(item.category) ?? [];
    bucket.push(item);
    buckets.set(item.category, bucket);
  }

  const result: WardrobeItem[] = [];
  let added = true;
  while (result.length < limit && added) {
    added = false;
    for (const cat of CATEGORY_ORDER) {
      const bucket = buckets.get(cat);
      if (bucket && bucket.length > 0) {
        result.push(bucket.shift()!);
        added = true;
        if (result.length >= limit) break;
      }
    }
  }
  return result;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PieceCard({ item, familyHex }: { item: WardrobeItem; familyHex?: string }) {
  const hex = familyHex ?? SPECTRUM_META[item.colorFamily as ColorFamily]?.hex ?? "#8C7B6E";
  const imgStyle: CSSProperties = item.imageUrl
    ? { backgroundImage: `url(${item.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center top" }
    : { background: `linear-gradient(150deg, ${hex} 0%, ${darkenHex(hex, 0.14)} 100%)` };

  const tagBg = hexLuminance(hex) > 0.5 ? "rgba(29,24,20,0.72)" : "rgba(255,253,252,0.88)";
  const tagColor = hexLuminance(hex) > 0.5 ? "#FFFDFC" : "#1D1814";

  return (
    <Link href={`/closet/item/${item.id}`} className="cl-card" aria-label={item.name}>
      <div className="cl-card-img" style={imgStyle}>
        <span className="cl-card-tag" style={{ background: tagBg, color: tagColor }}>
          {CATEGORY_LABELS_ES[item.category]}
        </span>
      </div>
      <div className="cl-card-copy">
        <p className="cl-card-name">{item.name}</p>
        {item.colorName && (
          <p className="cl-card-meta">{item.colorName}</p>
        )}
      </div>
    </Link>
  );
}

function MoreCard({ href, count }: { href: string; count: number }) {
  return (
    <Link href={href} className="cl-card-more" aria-label={`Ver ${count} piezas más`}>
      <span className="cl-card-more-n">+{count}</span>
      <span className="cl-card-more-label">Ver todas</span>
    </Link>
  );
}

// ─── CL_STYLES — scoped to cl-* ──────────────────────────────────────────────

const CL_STYLES = `
.cl-wrap{min-height:100vh;background:var(--gal);padding:1.5rem 1rem 7rem;overflow-x:clip;}
.cl-inner{margin:0 auto;max-width:760px;display:flex;flex-direction:column;gap:1.75rem;}

/* eyebrow */
.cl-eyebrow{font-family:var(--font-sans);font-size:0.58rem;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:var(--tinta-tenue);margin-bottom:0.5rem;}
.cl-h1{font-family:var(--font-serif);font-size:clamp(2rem,8vw,2.8rem);font-weight:300;line-height:1.0;color:var(--tinta);}

/* river */
.cl-river{display:flex;flex-direction:column;gap:0.65rem;}
.cl-river-head{display:flex;align-items:center;gap:0.5rem;padding:0 2px;}
.cl-river-dot{display:inline-block;width:0.5rem;height:0.5rem;border-radius:50%;flex-shrink:0;}
.cl-river-label{font-family:var(--font-serif);font-size:1.0rem;font-weight:400;color:var(--tinta);flex:1;}
.cl-river-count{font-family:var(--font-sans);font-size:0.6rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--tinta-tenue);}

/* scroll row */
.cl-scroll{display:flex;gap:0.55rem;overflow-x:auto;padding-bottom:0.5rem;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;}
.cl-scroll::-webkit-scrollbar{display:none;}
.cl-scroll{scrollbar-width:none;}

/* PieceCard */
.cl-card{flex-shrink:0;width:112px;border-radius:10px;overflow:hidden;text-decoration:none;background:var(--line);scroll-snap-align:start;display:flex;flex-direction:column;transition:opacity 0.18s;}
.cl-card:hover{opacity:0.84;}
.cl-card-img{height:138px;position:relative;overflow:hidden;}
.cl-card-tag{position:absolute;top:5px;left:5px;font-family:var(--font-sans);font-size:0.47rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:2px 5px;border-radius:3px;}
.cl-card-copy{padding:0.4rem 0.5rem 0.5rem;}
.cl-card-name{font-family:var(--font-serif);font-size:0.7rem;color:var(--tinta);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cl-card-meta{font-family:var(--font-sans);font-size:0.55rem;color:var(--tinta-tenue);margin-top:0.12rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

/* +N more card */
.cl-card-more{flex-shrink:0;width:112px;height:162px;border-radius:10px;border:1.5px solid var(--line);display:flex;flex-direction:column;align-items:center;justify-content:center;text-decoration:none;scroll-snap-align:start;gap:0.2rem;transition:border-color 0.18s;}
.cl-card-more:hover{border-color:var(--tinta-tenue);}
.cl-card-more-n{font-family:var(--font-serif);font-size:1.55rem;font-weight:300;color:var(--tinta);}
.cl-card-more-label{font-family:var(--font-sans);font-size:0.52rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--tinta-tenue);}

/* section headers */
.cl-section{display:flex;flex-direction:column;gap:0.65rem;}
.cl-section-label{font-family:var(--font-sans);font-size:0.58rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--tinta-tenue);}
.cl-section-title{font-family:var(--font-serif);font-size:1.5rem;font-weight:300;color:var(--tinta);line-height:1.05;}

/* needs attention rows */
.cl-attn-list{display:flex;flex-direction:column;}
.cl-attn-row{display:flex;align-items:center;gap:0.65rem;padding:0.6rem 0;border-bottom:1px solid var(--line);text-decoration:none;}
.cl-attn-row:last-child{border-bottom:none;}
.cl-attn-name{font-family:var(--font-sans);font-size:0.8rem;font-weight:500;color:var(--tinta);flex:1;}
.cl-attn-gap{font-family:var(--font-sans);font-size:0.68rem;color:var(--tinta-tenue);}
.cl-attn-ratio{font-family:var(--font-sans);font-size:0.68rem;font-variant-numeric:tabular-nums;color:var(--tinta-tenue);min-width:2.2rem;text-align:right;}

/* ready to style */
.cl-ready-scroll{display:flex;gap:0.55rem;overflow-x:auto;padding-bottom:0.5rem;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;}
.cl-ready-scroll::-webkit-scrollbar{display:none;}
.cl-ready-scroll{scrollbar-width:none;}

/* add CTA */
.cl-add{display:inline-flex;align-items:center;height:2.6rem;padding:0 1.4rem;border-radius:100px;background:var(--tinta);color:var(--papel);font-family:var(--font-sans);font-size:0.65rem;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;text-decoration:none;transition:opacity 0.18s;align-self:flex-start;}
.cl-add:hover{opacity:0.8;}

/* divider */
.cl-divider{height:1px;background:var(--line);border:none;margin:0;}
`;

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ClosetPage() {
  const items = await getWardrobeItems();

  // One DB call, two pure derivations
  const entriesForSpine = buildSpectrumEntriesFromItems(items, { includeEmpty: true });
  const entriesWithPieces = buildSpectrumEntriesFromItems<WardrobeItem>(items, {
    includeEmpty: false,
    includePieces: true,
  });

  // Rivers: families with pieces, sorted by count desc
  const rivers = [...entriesWithPieces]
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count) as SpectrumEntry<WardrobeItem>[];

  // Category counts for "Needs attention"
  const categoryCounts = items.reduce<Partial<Record<WardrobeCategory, number>>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});

  const needsAttention = CATEGORY_ORDER
    .filter((cat) => {
      const target = TARGETS[cat];
      return target && (categoryCounts[cat] ?? 0) < target;
    })
    .slice(0, 4)
    .map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS_ES[cat],
      count: categoryCounts[cat] ?? 0,
      target: TARGETS[cat]!,
    }));

  // Ready to style
  const readyItems = buildReadyToStyle(items, 6);

  const burgundyHex = SPECTRUM_META.burgundy?.hex ?? "#6B2D3E";

  return (
    <section className="cl-wrap">
      <style href="closet-cromatic" precedence="component">{CL_STYLES}</style>

      <div className="cl-inner">

        {/* ── 1. Header */}
        <div>
          <p className="cl-eyebrow">Clóset · Vista cromática</p>
          <p className="cl-h1">
            Tu clóset, por{" "}
            <em style={{ fontStyle: "italic", color: burgundyHex }}>color.</em>
          </p>
        </div>

        {/* ── 2. Espina cromática (sin masthead) */}
        <ChromaSpineBlock entries={entriesForSpine} showMasthead={false} />

        {/* ── 3. Ríos por familia */}
        {rivers.length === 0 ? (
          <div>
            <p className="cl-section-label">Tu espectro</p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--tinta-tenue)" }}>
              Aún no tienes piezas registradas.{" "}
              <Link href="/closet/add" style={{ color: "var(--tinta)", textDecoration: "underline" }}>
                Añade la primera.
              </Link>
            </p>
          </div>
        ) : (
          rivers.map((entry) => {
            const pieces = (entry.pieces ?? []) as WardrobeItem[];
            const visible = pieces.slice(0, MAX_VISIBLE);
            const remaining = pieces.length - visible.length;
            const galleryHref = `/closet/gallery?colorFamily=${String(entry.family)}`;

            return (
              <div key={String(entry.family)} className="cl-river">
                {/* River header */}
                <div className="cl-river-head">
                  <span
                    className="cl-river-dot"
                    style={{ backgroundColor: entry.meta.hex }}
                    aria-hidden="true"
                  />
                  <span className="cl-river-label">{entry.meta.labelEs}</span>
                  <span className="cl-river-count">{entry.count} {entry.count === 1 ? "pieza" : "piezas"}</span>
                </div>

                {/* Scroll row */}
                <div className="cl-scroll">
                  {visible.map((item) => (
                    <PieceCard key={item.id} item={item} familyHex={entry.meta.hex} />
                  ))}
                  {remaining > 0 && (
                    <MoreCard href={galleryHref} count={remaining} />
                  )}
                </div>
              </div>
            );
          })
        )}

        <hr className="cl-divider" />

        {/* ── 4. Necesita atención */}
        {needsAttention.length > 0 && (
          <div className="cl-section">
            <p className="cl-section-label">Clóset focus</p>
            <p className="cl-section-title">Necesita atención</p>
            <div className="cl-attn-list">
              {needsAttention.map((item) => (
                <Link
                  key={item.category}
                  href="/wishlist"
                  className="cl-attn-row"
                  aria-label={`${item.label}: ${item.count} de ${item.target}`}
                >
                  <span className="cl-attn-name">{item.label}</span>
                  <span className="cl-attn-gap">{categoryGap(item.category, item.count)}</span>
                  <span className="cl-attn-ratio">{item.count}/{item.target}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── 5. Listas para vestir */}
        {readyItems.length > 0 && (
          <div className="cl-section">
            <p className="cl-section-label">Destacadas</p>
            <p className="cl-section-title">Listas para vestir</p>
            <div className="cl-ready-scroll">
              {readyItems.map((item) => (
                <PieceCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* ── 6. Add CTA */}
        <Link href="/closet/add" className="cl-add">
          + Añadir pieza
        </Link>

      </div>
    </section>
  );
}
