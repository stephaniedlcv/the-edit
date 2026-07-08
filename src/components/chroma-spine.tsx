"use client";

/**
 * chroma-spine.tsx — Cromática spectral components  (Fase 5A.6)
 *
 * Exports:
 *   ChromaSpineBlock  — full editorial block (masthead + histogram + caption)
 *                        used on the home page
 *   ChromaSpine       — bare histogram row for dev/ui and other consumers
 *
 * All structural CSS lives in the cs-* namespace injected once via a deduped
 * <style href="chroma-spine"> tag. These class names don't exist in globals.css
 * so the 262 !important rules there cannot reach them.
 */

import Link from "next/link";
import type { CSSProperties } from "react";
import type {
  SpectrumEntry,
  SpectrumFamily,
  SpectrumMeta,
} from "@/lib/wardrobe/spectrum";

// ─── Public types ─────────────────────────────────────────────────────────────

export type ChromaSpineSize = "sm" | "md" | "lg";
export type ChromaSpineOrientation = "horizontal" | "vertical";

export interface ChromaSpineBlockProps {
  entries: SpectrumEntry[];
  editionNumber: number;
  className?: string;
}

export interface ChromaSpineProps {
  entries: SpectrumEntry[];
  activeFamily?: string;
  onSelect?: (family: SpectrumFamily) => void;
  hrefBase?: string;
  showCounts?: boolean;
  size?: ChromaSpineSize;
  orientation?: ChromaSpineOrientation;
  ariaLabel?: string;
  className?: string;
}

// ─── cs-* component styles (injected once, deduplicated by React) ─────────────

const CS_STYLES = `
/* ── ChromaSpineBlock (Fase 5A.6) ── */
.cs-masthead{display:flex;justify-content:space-between;align-items:baseline;padding:0 4px;}
.cs-masthead b{font-family:var(--font-serif);font-weight:600;font-size:14px;letter-spacing:0.24em;color:var(--tinta);}
.cs-masthead span{font-size:9.5px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:var(--tinta-tenue);}
.cs-spine{display:flex;align-items:flex-end;gap:3px;height:56px;margin-top:22px;padding:0 4px;}
.cs-bar{flex:1;min-width:8px;border-radius:4px 4px 0 0;position:relative;display:block;text-decoration:none;}
.cs-count{position:absolute;top:-15px;left:50%;transform:translateX(-50%);font-style:normal;font-size:8px;font-weight:600;color:var(--tinta-tenue);font-variant-numeric:tabular-nums;white-space:nowrap;pointer-events:none;}
.cs-baseline{height:1px;background:var(--tinta);opacity:0.85;margin:0 4px;}
.cs-caption{display:flex;justify-content:space-between;padding:8px 8px 0;font-size:8.5px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:var(--tinta-tenue);}
@media(max-width:639px){.cs-count--minor{display:none;}}

/* ── ChromaSpine bare histogram (legacy / dev) ── */
.cs-root{display:flex!important;flex-direction:row!important;align-items:flex-end!important;height:var(--cs-container-h,40px)!important;gap:var(--cs-gap,2px)!important;overflow-x:auto!important;overflow-y:visible!important;}
.cs-root .cs-bar{flex:1 1 0!important;width:0!important;min-width:8px!important;height:var(--cs-h,18%)!important;border-radius:4px 4px 0 0!important;background:var(--cs-bg,#888)!important;opacity:var(--cs-op,1)!important;box-shadow:var(--cs-shadow,none)!important;border:var(--cs-border,none)!important;box-sizing:border-box!important;overflow:hidden!important;}
.cs-bar-inner{display:flex!important;height:100%!important;width:100%!important;align-items:flex-end!important;justify-content:center!important;overflow:hidden!important;padding-bottom:3px!important;user-select:none!important;}
.cs-root .cs-baseline{display:block!important;height:1px!important;background:var(--tinta,#1D1814)!important;opacity:0.18!important;margin-top:0!important;}
`;

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/** Background value for a spectrum bar — handles special families. */
function barBackground(entry: SpectrumEntry): string {
  const { meta } = entry;
  if (meta.id === "metallic") {
    return (
      "linear-gradient(180deg," +
      "#7A5A1E 0%,#C9A84C 30%,#E8C86A 55%,#B8902A 78%,#8C6A2F 100%)"
    );
  }
  if (meta.id === "multicolor") {
    return (
      "linear-gradient(180deg," +
      "#211C18 0%,#77303A 20%,#C3902F 38%," +
      "#C6532F 52%,#6B6D4C 66%,#3A4B5F 80%," +
      "#C98E8A 92%,#EBDFC9 100%)"
    );
  }
  if (meta.id === "statement") return "transparent";
  return meta.hex;
}

/** Border value for a spectrum bar. */
function barBorder(meta: SpectrumMeta): string {
  if (meta.id === "statement") return `2px solid ${meta.hex}`;
  if (meta.borderHex) return `1px solid ${meta.borderHex}`;
  return "none";
}

/** Percentage height clamped to min 18%. */
function barHeightPct(count: number, maxCount: number): number {
  if (maxCount <= 0) return 18;
  return Math.max(18, (count / maxCount) * 100);
}

/** Perceived luminance [0–1]. > 0.40 = light background → dark label. */
function hexLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 0.5;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// ─── Shared style tag ─────────────────────────────────────────────────────────

function ChromaStyles() {
  return (
    <style href="chroma-spine" precedence="component">
      {CS_STYLES}
    </style>
  );
}

// ─── ChromaSpineBlock ─────────────────────────────────────────────────────────

/**
 * Full editorial block: masthead → histogram bars → baseline → caption.
 * This is the primary home-page component (Fase 5A.6 spec).
 */
export function ChromaSpineBlock({
  entries,
  editionNumber,
  className = "",
}: ChromaSpineBlockProps) {
  const sorted = [...entries].sort(
    (a, b) => a.meta.spectralOrder - b.meta.spectralOrder,
  );
  const maxCount = sorted.reduce((m, e) => Math.max(m, e.count), 0);
  const totalPieces = entries.reduce((s, e) => s + e.count, 0);

  return (
    <div className={className}>
      <ChromaStyles />

      <header className="cs-masthead">
        <b>THE EDIT</b>
        <span>EDICIÓN DIARIA · Nº {editionNumber}</span>
      </header>

      <div
        className="cs-spine"
        role="navigation"
        aria-label="Espectro del clóset"
      >
        {sorted.map((e) => {
          const hPct = barHeightPct(e.count, maxCount);
          const isMinor = e.count < 6;
          return (
            <Link
              key={String(e.family)}
              href={`/closet/gallery?colorFamily=${e.family}`}
              className="cs-bar"
              aria-label={`${e.meta.labelEs}, ${e.count} piezas`}
              style={{
                height: `${hPct}%`,
                background: barBackground(e),
                border: barBorder(e.meta),
                borderBottom: "none",
                opacity: e.count === 0 ? 0.28 : 1,
              }}
            >
              {e.count > 0 && (
                <i className={`cs-count${isMinor ? " cs-count--minor" : ""}`}>
                  {e.count}
                </i>
              )}
            </Link>
          );
        })}
      </div>

      <div className="cs-baseline" aria-hidden="true" />
      <div className="cs-caption">
        <span>TU ESPECTRO</span>
        <span>{totalPieces} PIEZAS</span>
      </div>
    </div>
  );
}

// ─── ChromaSpine (bare histogram, legacy / dev) ───────────────────────────────

type SizeCfg = { containerH: number; gap: number; fontSize: string };

const SIZE_CFG: Record<ChromaSpineSize, SizeCfg> = {
  sm: { containerH: 40, gap: 2, fontSize: "0.44rem" },
  md: { containerH: 52, gap: 2, fontSize: "0.52rem" },
  lg: { containerH: 64, gap: 3, fontSize: "0.60rem" },
};

interface BarVars {
  "--cs-h": string;
  "--cs-bg": string;
  "--cs-op": number;
  "--cs-shadow": string;
  "--cs-border": string;
}

function buildBarVars(
  meta: SpectrumMeta,
  isActive: boolean,
  count: number,
  maxCount: number,
): BarVars {
  const pct = barHeightPct(count, maxCount);
  const h = pct >= 18 ? `${pct}%` : `max(18%, ${pct}%)`;

  let bg: string;
  let border = "none";

  if (meta.kind === "special") {
    if (meta.id === "statement") {
      bg = "transparent";
      border = `2px solid ${meta.hex}`;
    } else {
      bg = barBackground({ meta } as SpectrumEntry);
    }
  } else {
    bg = meta.hex;
    if (meta.borderHex) border = `1px solid ${meta.borderHex}`;
  }

  return {
    "--cs-h": h,
    "--cs-bg": bg,
    "--cs-op": count === 0 ? 0.28 : 1,
    "--cs-shadow": isActive
      ? `inset 0 0 0 2px rgba(255,255,255,0.55), 0 0 0 2px ${meta.hex}`
      : "none",
    "--cs-border": border,
  };
}

type SegmentMode = "link" | "button" | "static";

interface SegmentProps {
  entry: SpectrumEntry;
  maxCount: number;
  isActive: boolean;
  showCounts: boolean;
  size: ChromaSpineSize;
  mode: SegmentMode;
  href?: string;
  onClickFn?: () => void;
}

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 " +
  "focus-visible:outline-[var(--tinta)]";

function Segment({
  entry,
  maxCount,
  isActive,
  showCounts,
  size,
  mode,
  href,
  onClickFn,
}: SegmentProps) {
  const { meta, count } = entry;
  const cfg = SIZE_CFG[size];
  const vars = buildBarVars(meta, isActive, count, maxCount);

  const isOutlineOnly = meta.kind === "special" && meta.id === "statement";
  const countColor = isOutlineOnly
    ? meta.hex
    : hexLuminance(meta.hex) > 0.4
      ? "rgba(29,24,20,0.72)"
      : "rgba(255,253,252,0.88)";

  const label =
    count > 0
      ? `${meta.label} — ${count} piece${count === 1 ? "" : "s"}`
      : `${meta.label} — not in closet`;

  const inner = (
    <span className="cs-bar-inner" aria-hidden="true">
      {showCounts && size !== "sm" && count > 0 ? (
        <span
          style={{ fontSize: cfg.fontSize, color: countColor }}
          className="font-semibold tabular-nums leading-none whitespace-nowrap"
        >
          {count}
        </span>
      ) : null}
    </span>
  );

  const commonProps = {
    className: `cs-bar ${FOCUS_RING}`,
    style: vars as CSSProperties,
    title: label,
    "aria-label": label,
  };

  if (mode === "link" && href) {
    return (
      <Link
        {...commonProps}
        href={href}
        aria-current={isActive ? ("true" as const) : undefined}
      >
        {inner}
      </Link>
    );
  }

  if (mode === "button" && onClickFn) {
    return (
      <button
        {...commonProps}
        type="button"
        onClick={onClickFn}
        aria-pressed={isActive}
      >
        {inner}
      </button>
    );
  }

  return (
    <div {...commonProps} role="img">
      {inner}
    </div>
  );
}

export function ChromaSpine({
  entries,
  activeFamily,
  onSelect,
  hrefBase,
  showCounts = false,
  size = "md",
  ariaLabel = "Color spectrum",
  className = "",
}: ChromaSpineProps) {
  const sorted = [...entries].sort(
    (a, b) => a.meta.spectralOrder - b.meta.spectralOrder,
  );
  const maxCount = sorted.reduce((m, e) => Math.max(m, e.count), 0);

  const globalMode: SegmentMode = hrefBase
    ? "link"
    : onSelect
      ? "button"
      : "static";

  const cfg = SIZE_CFG[size];
  const containerVars = {
    "--cs-container-h": `${cfg.containerH}px`,
    "--cs-gap": `${cfg.gap}px`,
  } as CSSProperties;

  return (
    <>
      <ChromaStyles />
      <div className={className}>
        <div
          role="group"
          aria-label={ariaLabel}
          className="cs-root"
          style={containerVars}
        >
          {sorted.map((entry) => {
            const { family } = entry;
            const isUnknown = family === "unknown";
            const segMode: SegmentMode = isUnknown ? "static" : globalMode;
            const href =
              segMode === "link" && hrefBase
                ? `${hrefBase}?colorFamily=${family}`
                : undefined;
            const onClickFn =
              segMode === "button" && onSelect
                ? () => onSelect(family)
                : undefined;

            return (
              <Segment
                key={String(family)}
                entry={entry}
                maxCount={maxCount}
                isActive={activeFamily === family}
                showCounts={showCounts}
                size={size}
                mode={segMode}
                href={href}
                onClickFn={onClickFn}
              />
            );
          })}
        </div>
        <div aria-hidden="true" className="cs-baseline" />
      </div>
    </>
  );
}
