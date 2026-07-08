"use client";

/**
 * ChromaSpine — Cromática spectral histogram  (Fase 5A.5)
 *
 * All structural CSS lives in the cs-* namespace (cs-root, cs-bar,
 * cs-bar-inner, cs-baseline) injected via a deduped <style> tag.
 * These class names do NOT exist in globals.css, so the 262 !important
 * rules there cannot target them.
 *
 * Dynamic per-bar values (height, background, opacity, shadow, border)
 * are passed via CSS custom properties set on each element's style
 * attribute and consumed by .cs-bar via var() references — also protected
 * by !important so no external rule can override the resolved value.
 *
 * Bar heights use the CSS max() function: max(18%, N%) where N is the
 * bar's share of the maximum family count. Parent has a definite height
 * (via --cs-container-h), so percentage heights resolve correctly.
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

// ─── Size configuration ───────────────────────────────────────────────────────

type SizeCfg = {
  containerH: number; // px
  gap: number;        // px
  fontSize: string;
};

const SIZE_CFG: Record<ChromaSpineSize, SizeCfg> = {
  sm: { containerH: 40, gap: 2, fontSize: "0.44rem" },
  md: { containerH: 52, gap: 2, fontSize: "0.52rem" },
  lg: { containerH: 64, gap: 3, fontSize: "0.60rem" },
};

// ─── cs-* component styles (injected once, deduplicated by React) ─────────────

const CS_STYLES = `
  /* ChromaSpine histogram — cs-* namespace, safe from globals.css !important */
  .cs-root {
    display:         flex !important;
    flex-direction:  row  !important;
    align-items:     flex-end !important;
    height:          var(--cs-container-h, 40px) !important;
    gap:             var(--cs-gap, 2px) !important;
    overflow-x:      auto !important;
    overflow-y:      visible !important;
  }
  .cs-bar {
    flex:            1 1 0 !important;
    width:           0 !important;
    min-width:       8px !important;
    height:          var(--cs-h, 18%) !important;
    border-radius:   4px 4px 0 0 !important;
    background:      var(--cs-bg, #888) !important;
    opacity:         var(--cs-op, 1) !important;
    box-shadow:      var(--cs-shadow, none) !important;
    border:          var(--cs-border, none) !important;
    box-sizing:      border-box !important;
    overflow:        hidden !important;
  }
  .cs-bar-inner {
    display:         flex !important;
    height:          100% !important;
    width:           100% !important;
    align-items:     flex-end !important;
    justify-content: center !important;
    overflow:        hidden !important;
    padding-bottom:  3px !important;
    user-select:     none !important;
  }
  .cs-baseline {
    display:    block !important;
    height:     1px !important;
    background: var(--tinta, #1D1814) !important;
    opacity:    0.18 !important;
    margin-top: 0 !important;
  }
`;

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * Returns a CSS height value using max() so min-height 18% is always enforced.
 * Percentage resolves against the container's definite height (--cs-container-h).
 */
function barHeightStyle(count: number, maxCount: number): string {
  if (maxCount <= 0 || count === 0) return "18%";
  const pct = Math.round((count / maxCount) * 100);
  if (pct >= 18) return `${pct}%`;
  return `max(18%, ${pct}%)`;
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

/** CSS background value for special families. */
function specialBackground(family: SpectrumFamily): string {
  if (family === "multicolor") {
    return (
      "linear-gradient(180deg," +
      "#211C18 0%,#77303A 20%,#C3902F 38%," +
      "#C6532F 52%,#6B6D4C 66%,#3A4B5F 80%," +
      "#C98E8A 92%,#EBDFC9 100%)"
    );
  }
  if (family === "metallic") {
    return (
      "linear-gradient(180deg," +
      "#7A5A1E 0%,#C9A84C 30%,#E8C86A 55%," +
      "#B8902A 78%,#8C6A2F 100%)"
    );
  }
  return "transparent"; // statement: handled via --cs-border
}

// ─── Per-bar CSS custom property computation ──────────────────────────────────

interface BarVars {
  "--cs-h":      string;
  "--cs-bg":     string;
  "--cs-op":     number;
  "--cs-shadow": string;
  "--cs-border": string;
}

function buildBarVars(
  meta: SpectrumMeta,
  isActive: boolean,
  count: number,
  maxCount: number,
): BarVars {
  const h = barHeightStyle(count, maxCount);

  let bg: string;
  let border = "none";

  if (meta.kind === "special") {
    if (meta.id === "statement") {
      bg = "transparent";
      border = `2px solid ${meta.hex}`;
    } else {
      bg = specialBackground(meta.id);
    }
  } else {
    bg = meta.hex;
    if (meta.borderHex) {
      border = `1px solid ${meta.borderHex}`;
    }
  }

  const shadow = isActive
    ? `inset 0 0 0 2px rgba(255,255,255,0.55), 0 0 0 2px ${meta.hex}`
    : "none";

  return {
    "--cs-h":      h,
    "--cs-bg":     bg,
    "--cs-op":     count === 0 ? 0.28 : 1,
    "--cs-shadow": shadow,
    "--cs-border": border,
  };
}

// ─── Segment component ────────────────────────────────────────────────────────

type SegmentMode = "link" | "button" | "static";

interface SegmentProps {
  entry:     SpectrumEntry;
  maxCount:  number;
  isActive:  boolean;
  showCounts: boolean;
  size:      ChromaSpineSize;
  mode:      SegmentMode;
  href?:     string;
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
    : hexLuminance(meta.hex) > 0.40
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

// ─── ChromaSpine ──────────────────────────────────────────────────────────────

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

  // Container CSS custom properties for size-dependent values
  const containerVars = {
    "--cs-container-h": `${cfg.containerH}px`,
    "--cs-gap": `${cfg.gap}px`,
  } as CSSProperties;

  return (
    <>
      {/* Deduplicated by React via href — renders only once per page */}
      <style href="chroma-spine" precedence="component">
        {CS_STYLES}
      </style>

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

        {/* 1 px tinta baseline */}
        <div aria-hidden="true" className="cs-baseline" />
      </div>
    </>
  );
}
