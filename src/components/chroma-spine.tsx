"use client";

/**
 * ChromaSpine — Cromática spectral strip  (Fase 4A)
 *
 * Renders a sequence of color-family segments ordered by spectralOrder,
 * with each segment's visual weight (width or height) proportional to
 * piece count via √-scaling (prevents a dominant family from overwhelming
 * the layout: √36/√1 = 6×, vs raw 36×).
 *
 * Visual treatments:
 *   kind "hue"      → solid backgroundColor from meta.hex
 *   kind "special"  → gradient treatments (never flat):
 *                        multicolor → CSS linear-gradient sampling Cromática hues
 *                        metallic   → warm antique-gold shimmer
 *                        statement  → outline-only (border + transparent bg)
 *   kind "unknown"  → greige (#C8C0B0) with visible border
 *
 * Interaction modes (priority: hrefBase > onSelect > static):
 *   hrefBase → <Link href={hrefBase}?colorFamily={family}>
 *   onSelect → <button onClick>
 *   neither  → static <div role="img">
 *
 * Accessibility:
 *   - role="group" + aria-label on container
 *   - aria-label and title on every segment
 *   - focus-visible ring on interactive segments
 *   - count is in aria-label even when showCounts=false
 *   - no movement animations (respects prefers-reduced-motion by default)
 *
 * Responsive:
 *   Horizontal: overflow-x auto for narrow viewports (scrollable strip).
 *   Vertical:   overflow-y auto.
 *   Never breaks layout — min segment size enforced.
 *
 * Does NOT import Supabase. No side effects. No `any`.
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
  /**
   * Entries to render. Each needs family, meta, and count.
   * Build via getColorFamilyHistogram → map with getColorFamilyMeta,
   * or supply SpectrumEntry[] directly from groupPiecesByFamily.
   * ChromaSpine sorts by meta.spectralOrder internally — input order ignored.
   */
  entries: SpectrumEntry[];
  /** Family key of the currently selected segment (highlights with ring). */
  activeFamily?: string;
  /**
   * If set, each segment becomes a <button> that calls onSelect(family).
   * Overridden by hrefBase.
   */
  onSelect?: (family: SpectrumFamily) => void;
  /**
   * If set, each segment becomes a <Link href={hrefBase}?colorFamily={family}>.
   * Takes priority over onSelect.
   */
  hrefBase?: string;
  /**
   * Display piece count inside each segment.
   * Hidden for size="sm" and for zero-count entries.
   */
  showCounts?: boolean;
  /** Visual scale of the strip. Default: "md". */
  size?: ChromaSpineSize;
  /** Strip direction. Default: "horizontal". */
  orientation?: ChromaSpineOrientation;
  /** Accessible label for the container group. Default: "Color spectrum". */
  ariaLabel?: string;
  className?: string;
}

// ─── Size configuration ───────────────────────────────────────────────────────

type SizeCfg = {
  /** Fixed dimension (height in horizontal, width in vertical). */
  thickness: number;
  /** Minimum length of each segment (min-width / min-height). */
  minLength: number;
  gap: number;
  fontSize: string;
  radius: number;
};

const SIZE_CFG: Record<ChromaSpineSize, SizeCfg> = {
  sm: { thickness: 20, minLength: 10, gap: 2, fontSize: "0.44rem", radius: 3 },
  md: { thickness: 32, minLength: 16, gap: 3, fontSize: "0.52rem", radius: 5 },
  lg: { thickness: 48, minLength: 22, gap: 4, fontSize: "0.60rem", radius: 7 },
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * √-scaled flex weight.
 * count=0 → 0.18 (visible but very thin)
 * count=max → 8.0
 * Ratio between min non-zero and max is √max instead of max.
 */
function scaledFlex(count: number, maxCount: number): number {
  if (count === 0) return 0.18;
  if (maxCount <= 0) return 1;
  return Math.max(0.4, (Math.sqrt(count) / Math.sqrt(maxCount)) * 8);
}

/** Perceived luminance [0–1]. > 0.40 = light background. */
function hexLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 0.5;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * CSS background string for "special" families.
 * Never returns a flat hue — each family gets a distinct treatment.
 */
function specialBackground(family: SpectrumFamily): string {
  if (family === "multicolor") {
    // Samples 8 Cromática hues across spectral order (dark→warm→cool)
    return (
      "linear-gradient(90deg," +
      "#211C18 0%," +    // black
      "#77303A 15%," +   // burgundy
      "#C3902F 30%," +   // mustard
      "#C6532F 44%," +   // orange
      "#6B6D4C 58%," +   // olive
      "#3A4B5F 73%," +   // blue
      "#C98E8A 87%," +   // pink
      "#EBDFC9 100%)"    // cream
    );
  }
  if (family === "metallic") {
    // Warm antique-gold shimmer
    return (
      "linear-gradient(110deg," +
      "#7A5A1E 0%," +
      "#C9A84C 25%," +
      "#E8C86A 50%," +
      "#B8902A 75%," +
      "#8C6A2F 100%)"
    );
  }
  // "statement" uses transparent bg + border (handled in buildStyle)
  return "transparent";
}

/**
 * Computes the complete inline style for a single segment.
 * Handles flex sizing, background, border, active ring, and zero opacity.
 */
function buildStyle(
  meta: SpectrumMeta,
  isActive: boolean,
  count: number,
  flex: number,
  cfg: SizeCfg,
  isHorizontal: boolean,
): CSSProperties {
  // Proportional dimension
  const grow: CSSProperties = isHorizontal
    ? { flexGrow: flex, flexShrink: 1, width: 0, minWidth: cfg.minLength, height: cfg.thickness }
    : { flexGrow: flex, flexShrink: 1, height: 0, minHeight: cfg.minLength, width: cfg.thickness };

  // Background + border by kind
  let visual: CSSProperties;
  if (meta.kind === "special") {
    if (meta.id === "statement") {
      visual = { background: "transparent", border: `2px solid ${meta.hex}` };
    } else {
      visual = { background: specialBackground(meta.id) };
    }
  } else {
    // hue or unknown
    visual = { backgroundColor: meta.hex };
    if (meta.borderHex) {
      visual.border = `1px solid ${meta.borderHex}`;
    }
  }

  // Active ring: inner white halo + outer family-colored ring
  const boxShadow = isActive
    ? `inset 0 0 0 2px rgba(255,255,255,0.55), 0 0 0 2px ${meta.hex}`
    : undefined;

  return {
    ...grow,
    ...visual,
    borderRadius: cfg.radius,
    opacity: count === 0 ? 0.28 : 1,
    boxShadow,
  };
}

// ─── Segment component ────────────────────────────────────────────────────────

type SegmentMode = "link" | "button" | "static";

interface SegmentProps {
  entry: SpectrumEntry;
  maxCount: number;
  isActive: boolean;
  showCounts: boolean;
  size: ChromaSpineSize;
  isHorizontal: boolean;
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
  isHorizontal,
  mode,
  href,
  onClickFn,
}: SegmentProps) {
  const { meta, count } = entry;
  const cfg = SIZE_CFG[size];
  const flex = scaledFlex(count, maxCount);
  const style = buildStyle(meta, isActive, count, flex, cfg, isHorizontal);

  // Count label text color: adapted to background brightness
  const isOutlineOnly = meta.kind === "special" && meta.id === "statement";
  const countColor = isOutlineOnly
    ? meta.hex
    : hexLuminance(meta.hex) > 0.40
      ? "rgba(29, 24, 20, 0.72)"
      : "rgba(255, 253, 252, 0.88)";

  const label =
    count > 0
      ? `${meta.label} — ${count} piece${count === 1 ? "" : "s"}`
      : `${meta.label} — not in closet`;

  const inner = (
    <span
      className="flex h-full w-full items-center justify-center overflow-hidden select-none"
      aria-hidden="true"
    >
      {showCounts && size !== "sm" && count > 0 ? (
        <span
          className="font-semibold tabular-nums leading-none whitespace-nowrap"
          style={{ fontSize: cfg.fontSize, color: countColor }}
        >
          {count}
        </span>
      ) : null}
    </span>
  );

  if (mode === "link" && href) {
    return (
      <Link
        href={href}
        style={style}
        title={label}
        aria-label={label}
        aria-current={isActive ? "true" : undefined}
        className={FOCUS_RING}
      >
        {inner}
      </Link>
    );
  }

  if (mode === "button" && onClickFn) {
    return (
      <button
        type="button"
        onClick={onClickFn}
        style={style}
        title={label}
        aria-label={label}
        aria-pressed={isActive}
        className={FOCUS_RING}
      >
        {inner}
      </button>
    );
  }

  return (
    <div
      style={style}
      title={label}
      aria-label={label}
      role="img"
    >
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
  orientation = "horizontal",
  ariaLabel = "Color spectrum",
  className = "",
}: ChromaSpineProps) {
  // Sort by spectralOrder — mirrors sortFamiliesBySpectralOrder() from spectrum.ts
  // but operates directly on SpectrumEntry[] to preserve the pieces field.
  const sorted = [...entries].sort(
    (a, b) => a.meta.spectralOrder - b.meta.spectralOrder,
  );

  const maxCount = sorted.reduce((m, e) => Math.max(m, e.count), 0);

  // Determine interaction mode (hrefBase takes priority over onSelect)
  const globalMode: SegmentMode = hrefBase
    ? "link"
    : onSelect
      ? "button"
      : "static";

  const isHorizontal = orientation === "horizontal";
  const cfg = SIZE_CFG[size];

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: isHorizontal ? "row" : "column",
    alignItems: "stretch",
    gap: cfg.gap,
    ...(isHorizontal ? { overflowX: "auto" } : { overflowY: "auto" }),
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={className}
      style={containerStyle}
    >
      {sorted.map((entry) => {
        const { family } = entry;
        const isUnknown = family === "unknown";

        // "unknown" is always static — no filter link for unrecognized families
        const segMode: SegmentMode =
          isUnknown ? "static" : globalMode;

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
            isHorizontal={isHorizontal}
            mode={segMode}
            href={href}
            onClickFn={onClickFn}
          />
        );
      })}
    </div>
  );
}
