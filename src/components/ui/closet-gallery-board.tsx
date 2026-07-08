"use client";

import { useMemo, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type {
  ColorFamily,
  StyleVibe,
  WardrobeCategory,
  WardrobeItem,
  WardrobeItemStatus,
} from "@/types/wardrobe";
import { vibeOptions } from "@/lib/taxonomy";
import {
  SPECTRUM_META,
  CANONICAL_FAMILIES,
  normalizeColorFamily,
} from "@/lib/wardrobe/spectrum";

// ─── Labels ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS_ES: Record<WardrobeCategory, string> = {
  outerwear: "Outerwear",
  top:       "Tops",
  bottom:    "Pantalones",
  dress:     "Vestidos",
  shoes:     "Zapatos",
  bag:       "Bolsos",
  accessory: "Accesorios",
  jewelry:   "Joyería",
};

const CATEGORY_ORDER: WardrobeCategory[] = [
  "top", "bottom", "shoes", "dress", "bag", "accessory", "jewelry", "outerwear",
];

const STATUS_LABELS: Record<WardrobeItemStatus, string> = {
  active:   "Activa",
  archived: "Archivada",
  donated:  "Donada",
  sold:     "Vendida",
  damaged:  "Dañada",
};

const STATUS_ORDER: WardrobeItemStatus[] = [
  "active", "archived", "donated", "sold", "damaged",
];

const VIBE_LABELS: Record<StyleVibe, string> = {
  classic:   "Clásico",
  minimal:   "Minimal",
  elevated:  "Elevado",
  work:      "Trabajo",
  tropical:  "Tropical",
  statement: "Statement",
  casual:    "Casual",
};

type ScoreFilter = "high" | "low" | "needs-review";

const SCORE_OPTIONS: { value: ScoreFilter; label: string }[] = [
  { value: "high",         label: "Alta ≥7" },
  { value: "low",          label: "Baja ≤4" },
  { value: "needs-review", label: "Sin puntuar" },
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

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

function getAverageScore(item: WardrobeItem): number | null {
  const scores = [
    item.loveScore,
    item.versatilityScore,
    item.fitConfidenceScore,
    item.capsuleValueScore,
  ].filter((s): s is number => typeof s === "number");
  if (!scores.length) return null;
  return Number((scores.reduce((t, s) => t + s, 0) / scores.length).toFixed(1));
}

// ─── GL_STYLES — scoped to gl-* ───────────────────────────────────────────────

const GL_STYLES = `
/* ── Gallery Cromática (Fase 6B) — gl-* namespace ── */

/* Controls */
.gl-controls{display:flex;gap:0.55rem;align-items:center;margin-bottom:0.9rem;}
.gl-search{flex:1;height:2.4rem;border-radius:100px;border:1px solid var(--line);background:var(--papel);font-family:var(--font-sans);font-size:0.78rem;color:var(--tinta);padding:0 1rem;outline:none;-webkit-appearance:none;}
.gl-search:focus{border-color:var(--tinta-tenue);}
.gl-search::placeholder{color:var(--tinta-tenue);}
.gl-add-btn{flex-shrink:0;height:2.4rem;padding:0 1rem;border-radius:100px;background:var(--tinta);color:var(--papel);font-family:var(--font-sans);font-size:0.58rem;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;text-decoration:none;display:flex;align-items:center;white-space:nowrap;transition:opacity 0.18s;}
.gl-add-btn:hover{opacity:0.8;}

/* Color family chips — horizontal scroll */
.gl-family-row{display:flex;gap:0.4rem;overflow-x:auto;padding-bottom:0.4rem;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;margin-bottom:0.5rem;}
.gl-family-row::-webkit-scrollbar{display:none;}
.gl-family-row{scrollbar-width:none;}
.gl-family-chip{flex-shrink:0;display:inline-flex;align-items:center;gap:0.35rem;height:2rem;padding:0 0.7rem;border-radius:100px;border:1px solid var(--line);background:transparent;font-family:var(--font-sans);font-size:0.6rem;font-weight:600;letter-spacing:0.04em;color:var(--tinta);cursor:pointer;white-space:nowrap;transition:border-color 0.15s,background 0.15s,color 0.15s;scroll-snap-align:start;}
.gl-family-chip:hover{border-color:var(--tinta-tenue);}
.gl-family-chip.gl-active{background:var(--tinta);color:var(--papel);border-color:var(--tinta);}
.gl-family-dot{width:0.42rem;height:0.42rem;border-radius:50%;flex-shrink:0;}

/* Category chips */
.gl-cat-row{display:flex;gap:0.4rem;overflow-x:auto;padding-bottom:0.4rem;scrollbar-width:none;margin-bottom:0.5rem;}
.gl-cat-row::-webkit-scrollbar{display:none;}
.gl-cat-chip{flex-shrink:0;height:2rem;padding:0 0.7rem;border-radius:100px;border:1px solid var(--line);background:transparent;font-family:var(--font-sans);font-size:0.6rem;font-weight:600;letter-spacing:0.04em;color:var(--tinta);cursor:pointer;white-space:nowrap;transition:border-color 0.15s,background 0.15s,color 0.15s;}
.gl-cat-chip strong{font-weight:700;margin-left:0.2rem;opacity:0.65;}
.gl-cat-chip:hover{border-color:var(--tinta-tenue);}
.gl-cat-chip.gl-active{background:var(--tinta);color:var(--papel);border-color:var(--tinta);}
.gl-cat-chip.gl-active strong{opacity:0.75;}

/* Secondary filters toggle */
.gl-secondary-bar{margin-bottom:0.5rem;}
.gl-filters-toggle{display:inline-flex;align-items:center;gap:0.3rem;height:1.8rem;padding:0 0.75rem;border-radius:100px;border:1px solid var(--line);background:transparent;font-family:var(--font-sans);font-size:0.56rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--tinta-tenue);cursor:pointer;transition:border-color 0.15s,color 0.15s;}
.gl-filters-toggle:hover{border-color:var(--tinta-tenue);color:var(--tinta);}
.gl-filters-toggle.gl-active{color:var(--tinta);border-color:var(--tinta);}

/* Secondary filter section */
.gl-filter-section{display:flex;flex-direction:column;gap:0.55rem;padding:0.75rem;background:var(--papel);border-radius:10px;border:1px solid var(--line);margin-bottom:0.65rem;}
.gl-filter-row{display:flex;gap:0.35rem;align-items:center;flex-wrap:wrap;}
.gl-filter-label{font-family:var(--font-sans);font-size:0.5rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--tinta-tenue);min-width:3.5rem;flex-shrink:0;}
.gl-chip{height:1.7rem;padding:0 0.6rem;border-radius:100px;border:1px solid var(--line);background:transparent;font-family:var(--font-sans);font-size:0.56rem;font-weight:600;color:var(--tinta);cursor:pointer;transition:border-color 0.15s,background 0.15s,color 0.15s;}
.gl-chip:hover{border-color:var(--tinta-tenue);}
.gl-chip.gl-active{background:var(--tinta);color:var(--papel);border-color:var(--tinta);}

/* Family filter banner */
.gl-banner{display:flex;align-items:center;gap:0.55rem;padding:0.6rem 0.75rem;border-radius:8px;background:var(--papel);border:1px solid var(--line);margin-bottom:0.65rem;}
.gl-banner-dot{width:0.48rem;height:0.48rem;border-radius:50%;flex-shrink:0;}
.gl-banner-text{font-family:var(--font-sans);font-size:0.68rem;font-weight:500;color:var(--tinta);flex:1;}
.gl-banner-clear{font-family:var(--font-sans);font-size:0.56rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--tinta-tenue);background:none;border:none;cursor:pointer;padding:0;transition:color 0.15s;}
.gl-banner-clear:hover{color:var(--tinta);}

/* Status bar */
.gl-status{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;}
.gl-count{font-family:var(--font-sans);font-size:0.65rem;color:var(--tinta-tenue);}
.gl-count strong{color:var(--tinta);font-weight:700;}
.gl-clear{font-family:var(--font-sans);font-size:0.56rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--tinta-tenue);background:none;border:none;cursor:pointer;padding:0;transition:color 0.15s;}
.gl-clear:hover{color:var(--tinta);}

/* Grid */
.gl-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:0.6rem;}
@media(min-width:480px){.gl-grid{grid-template-columns:repeat(3,1fr);}}
@media(min-width:760px){.gl-grid{grid-template-columns:repeat(4,1fr);}}

/* Gallery card */
.gl-card{display:flex;flex-direction:column;border-radius:10px;overflow:hidden;text-decoration:none;background:var(--line);transition:opacity 0.18s;}
.gl-card:hover{opacity:0.84;}
.gl-card-img{position:relative;width:100%;aspect-ratio:3/4;overflow:hidden;}
.gl-card-gradient{position:absolute;inset:0;}
.gl-card-tag{position:absolute;top:5px;left:5px;font-family:var(--font-sans);font-size:0.47rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:2px 5px;border-radius:3px;z-index:1;}
.gl-card-score{position:absolute;top:5px;right:5px;font-family:var(--font-sans);font-size:0.5rem;font-weight:700;background:rgba(255,253,252,0.92);color:var(--tinta);padding:2px 5px;border-radius:3px;z-index:1;}
.gl-card-copy{padding:0.4rem 0.5rem 0.55rem;}
.gl-card-name{font-family:var(--font-serif);font-size:0.7rem;color:var(--tinta);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.gl-card-meta{font-family:var(--font-sans);font-size:0.55rem;color:var(--tinta-tenue);margin-top:0.1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

/* Empty state */
.gl-empty{text-align:center;padding:3.5rem 1rem;}
.gl-empty-title{font-family:var(--font-serif);font-size:1.6rem;font-weight:300;color:var(--tinta);margin-bottom:0.5rem;}
.gl-empty-note{font-family:var(--font-sans);font-size:0.75rem;color:var(--tinta-tenue);}
.gl-empty-btn{margin-top:1.2rem;display:inline-flex;height:2.4rem;align-items:center;padding:0 1.2rem;border-radius:100px;background:var(--tinta);color:var(--papel);font-family:var(--font-sans);font-size:0.58rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;border:none;cursor:pointer;transition:opacity 0.18s;}
.gl-empty-btn:hover{opacity:0.8;}
`;

// ─── GalleryCard ──────────────────────────────────────────────────────────────

function GalleryCard({ item }: { item: WardrobeItem }) {
  const familyMeta = SPECTRUM_META[item.colorFamily as ColorFamily];
  const hex = familyMeta?.hex ?? "#8C7B6E";
  const score = getAverageScore(item);
  const tagBg = hexLuminance(hex) > 0.5 ? "rgba(29,24,20,0.78)" : "rgba(255,253,252,0.92)";
  const tagColor = hexLuminance(hex) > 0.5 ? "#FFFDFC" : "#1D1814";

  return (
    <Link href={`/closet/item/${item.id}`} className="gl-card" aria-label={item.name}>
      <div className="gl-card-img">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width:480px) 46vw, (max-width:760px) 30vw, 200px"
            style={{ objectFit: "cover", objectPosition: "center top" }}
            loading="lazy"
          />
        ) : (
          <div
            className="gl-card-gradient"
            style={{
              background: `linear-gradient(150deg, ${hex} 0%, ${darkenHex(hex, 0.14)} 100%)`,
            }}
          />
        )}
        <span
          className="gl-card-tag"
          style={{ background: tagBg, color: tagColor }}
        >
          {CATEGORY_LABELS_ES[item.category]}
        </span>
        {score !== null && (
          <span className="gl-card-score" aria-label={`Puntuación: ${score}`}>
            {score}
          </span>
        )}
      </div>
      <div className="gl-card-copy">
        <p className="gl-card-name">{item.name}</p>
        {item.colorName && (
          <p className="gl-card-meta">
            {item.colorName}
            {item.size ? ` · ${item.size}` : ""}
          </p>
        )}
      </div>
    </Link>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────

type Props = {
  items: WardrobeItem[];
  counts: Partial<Record<WardrobeCategory, number>>;
};

export function ClosetGalleryBoard({ items, counts }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ── URL-derived filter state ────────────────────────────────────────────
  const rawColor = searchParams.get("colorFamily") ?? "";
  const normColor = normalizeColorFamily(rawColor);
  const selectedColor: ColorFamily | "all" = normColor === "unknown" ? "all" : normColor;

  const rawCategory = searchParams.get("category") ?? "";
  const selectedCategory: WardrobeCategory | "all" = (
    CATEGORY_ORDER as string[]
  ).includes(rawCategory)
    ? (rawCategory as WardrobeCategory)
    : "all";

  const searchQuery = searchParams.get("q") ?? "";

  const rawStatus = searchParams.get("status") ?? "";
  const selectedStatus: WardrobeItemStatus | "all" = STATUS_ORDER.includes(
    rawStatus as WardrobeItemStatus,
  )
    ? (rawStatus as WardrobeItemStatus)
    : "all";

  // ── Local state (secondary filters — not URL-synced) ─────────────────────
  const [selectedVibe, setSelectedVibe] = useState<StyleVibe | "all">("all");
  const [selectedScore, setSelectedScore] = useState<ScoreFilter | "all">("all");
  const [showSecondary, setShowSecondary] = useState(false);

  // ── URL update helper ───────────────────────────────────────────────────
  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  function setColor(v: ColorFamily | "all") {
    updateFilter("colorFamily", selectedColor === v ? "all" : v);
  }
  function setCategory(v: WardrobeCategory | "all") {
    updateFilter("category", selectedCategory === v ? "all" : v);
  }
  function setStatus(v: WardrobeItemStatus | "all") {
    updateFilter("status", selectedStatus === v ? "all" : v);
  }
  function setSearchQuery(q: string) {
    updateFilter("q", q);
  }

  function clearAllFilters() {
    router.replace(pathname, { scroll: false });
    setSelectedVibe("all");
    setSelectedScore("all");
  }

  // ── Available options (memoized) ────────────────────────────────────────
  const availableColors = useMemo(() => {
    const seen = new Set<ColorFamily>();
    items.forEach((item) => seen.add(item.colorFamily));
    // Spectral order — matches ChromaSpine bars
    return CANONICAL_FAMILIES.filter((f) => seen.has(f));
  }, [items]);

  const availableVibes = useMemo(() => {
    const seen = new Set<StyleVibe>();
    items.forEach((item) => item.vibes.forEach((v) => seen.add(v)));
    return vibeOptions.filter((v) => seen.has(v));
  }, [items]);

  const availableStatuses = useMemo(() => {
    const seen = new Set<WardrobeItemStatus>();
    items.forEach((item) => seen.add(item.itemStatus ?? "active"));
    return STATUS_ORDER.filter((s) => seen.has(s));
  }, [items]);

  // ── Filtered items — SAME logic as before, connected to URL state ───────
  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchesCategory =
          selectedCategory === "all" || item.category === selectedCategory;

        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.colorName.toLowerCase().includes(q) ||
          (item.brand ?? "").toLowerCase().includes(q);

        const matchesColor =
          selectedColor === "all" || item.colorFamily === selectedColor;

        const matchesStatus =
          selectedStatus === "all" ||
          (item.itemStatus ?? "active") === selectedStatus;

        const matchesVibe =
          selectedVibe === "all" || item.vibes.includes(selectedVibe);

        const avg = getAverageScore(item);
        const matchesScore =
          selectedScore === "all" ||
          (selectedScore === "high" && avg !== null && avg >= 7) ||
          (selectedScore === "low" && avg !== null && avg <= 4) ||
          (selectedScore === "needs-review" && avg === null);

        return (
          matchesCategory &&
          matchesSearch &&
          matchesColor &&
          matchesStatus &&
          matchesVibe &&
          matchesScore
        );
      }),
    [
      items,
      selectedCategory,
      searchQuery,
      selectedColor,
      selectedStatus,
      selectedVibe,
      selectedScore,
    ],
  );

  const hasActiveFilters =
    selectedColor !== "all" ||
    selectedCategory !== "all" ||
    searchQuery !== "" ||
    selectedStatus !== "all" ||
    selectedVibe !== "all" ||
    selectedScore !== "all";

  const secondaryActive =
    selectedStatus !== "all" || selectedVibe !== "all" || selectedScore !== "all";

  const activeColorMeta =
    selectedColor !== "all" ? SPECTRUM_META[selectedColor] : null;

  return (
    <>
      <style href="gallery-cromatic" precedence="component">
        {GL_STYLES}
      </style>

      {/* ── Search + Add ─────────────────────────────────────────────────── */}
      <div className="gl-controls">
        <input
          type="search"
          placeholder="Buscar por nombre, color o marca…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="gl-search"
          aria-label="Buscar en el clóset"
        />
        <Link href="/closet/add" className="gl-add-btn">
          + Añadir
        </Link>
      </div>

      {/* ── Color family chips — spectral order ──────────────────────────── */}
      <div className="gl-family-row" role="group" aria-label="Filtrar por familia de color">
        <button
          type="button"
          className={`gl-family-chip${selectedColor === "all" ? " gl-active" : ""}`}
          onClick={() => setColor("all")}
        >
          Todas
        </button>
        {availableColors.map((color) => {
          const meta = SPECTRUM_META[color];
          const isActive = selectedColor === color;
          return (
            <button
              key={color}
              type="button"
              className={`gl-family-chip${isActive ? " gl-active" : ""}`}
              onClick={() => setColor(color)}
              aria-pressed={isActive}
            >
              <span
                className="gl-family-dot"
                style={{ backgroundColor: isActive ? "#FFFDFC" : meta.hex }}
                aria-hidden="true"
              />
              {meta.labelEs}
            </button>
          );
        })}
      </div>

      {/* ── Category chips ───────────────────────────────────────────────── */}
      <div className="gl-cat-row" role="group" aria-label="Filtrar por categoría">
        <button
          type="button"
          className={`gl-cat-chip${selectedCategory === "all" ? " gl-active" : ""}`}
          onClick={() => setCategory("all")}
        >
          Todas <strong>{items.length}</strong>
        </button>
        {CATEGORY_ORDER.map((category) => (
          <button
            key={category}
            type="button"
            className={`gl-cat-chip${selectedCategory === category ? " gl-active" : ""}`}
            onClick={() => setCategory(category)}
          >
            {CATEGORY_LABELS_ES[category]}{" "}
            <strong>{counts[category] ?? 0}</strong>
          </button>
        ))}
      </div>

      {/* ── Secondary filters toggle ──────────────────────────────────────── */}
      <div className="gl-secondary-bar">
        <button
          type="button"
          className={`gl-filters-toggle${secondaryActive ? " gl-active" : ""}`}
          onClick={() => setShowSecondary((v) => !v)}
          aria-expanded={showSecondary}
        >
          {secondaryActive ? "Filtros ·" : "Filtros +"}
        </button>
      </div>

      {/* ── Secondary filters panel ───────────────────────────────────────── */}
      {showSecondary && (
        <div className="gl-filter-section">
          {availableStatuses.length > 1 && (
            <div className="gl-filter-row">
              <span className="gl-filter-label">Estado</span>
              <button
                type="button"
                className={`gl-chip${selectedStatus === "all" ? " gl-active" : ""}`}
                onClick={() => setStatus("all")}
              >
                Todas
              </button>
              {availableStatuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`gl-chip${selectedStatus === s ? " gl-active" : ""}`}
                  onClick={() => setStatus(s)}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          )}

          {availableVibes.length > 0 && (
            <div className="gl-filter-row">
              <span className="gl-filter-label">Vibe</span>
              <button
                type="button"
                className={`gl-chip${selectedVibe === "all" ? " gl-active" : ""}`}
                onClick={() => setSelectedVibe("all")}
              >
                Todas
              </button>
              {availableVibes.map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`gl-chip${selectedVibe === v ? " gl-active" : ""}`}
                  onClick={() => setSelectedVibe(selectedVibe === v ? "all" : v)}
                >
                  {VIBE_LABELS[v]}
                </button>
              ))}
            </div>
          )}

          <div className="gl-filter-row">
            <span className="gl-filter-label">Score</span>
            <button
              type="button"
              className={`gl-chip${selectedScore === "all" ? " gl-active" : ""}`}
              onClick={() => setSelectedScore("all")}
            >
              Todas
            </button>
            {SCORE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`gl-chip${selectedScore === opt.value ? " gl-active" : ""}`}
                onClick={() =>
                  setSelectedScore(selectedScore === opt.value ? "all" : opt.value)
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Family filter banner ──────────────────────────────────────────── */}
      {activeColorMeta && (
        <div className="gl-banner" role="status">
          <span
            className="gl-banner-dot"
            style={{ backgroundColor: activeColorMeta.hex }}
            aria-hidden="true"
          />
          <span className="gl-banner-text">
            Familia: {activeColorMeta.labelEs} ·{" "}
            {filtered.length} {filtered.length === 1 ? "pieza" : "piezas"}
          </span>
          <button
            type="button"
            className="gl-banner-clear"
            onClick={() => updateFilter("colorFamily", "all")}
            aria-label="Quitar filtro de familia"
          >
            Ver todo
          </button>
        </div>
      )}

      {/* ── Count + clear ─────────────────────────────────────────────────── */}
      <div className="gl-status">
        <p className="gl-count">
          <strong>{filtered.length}</strong> de {items.length} piezas
        </p>
        {hasActiveFilters && (
          <button type="button" className="gl-clear" onClick={clearAllFilters}>
            × Limpiar
          </button>
        )}
      </div>

      {/* ── Grid / Empty ─────────────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="gl-grid">
          {filtered.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="gl-empty">
          <p className="gl-empty-title">Sin resultados.</p>
          <p className="gl-empty-note">Ajusta los filtros para ver más piezas.</p>
          {hasActiveFilters && (
            <button type="button" className="gl-empty-btn" onClick={clearAllFilters}>
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </>
  );
}
