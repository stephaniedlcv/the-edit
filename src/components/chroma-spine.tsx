"use client";

/**
 * ChromaSpine — Cromática spectral histogram  (Fase 5A.4)
 *
 * Renders color-family bars as a histogram:
 *   - Bar HEIGHT is proportional to piece count (normalised to max, min 18%)
 *   - Bar WIDTH is equal (flex: 1) — all families share the horizontal space
 *   - Container has a fixed height per size (sm: 40px, md: 52px, lg: 64px)
 *   - Bars are bottom-aligned (align-items: flex-end)
 *   - A 1 px tinta baseline runs below the strip at full width
 *   - Corners: border-radius 4px 4px 0 0 (top only)
 *   - Gap: 2px (sm/md), 3px (lg)
 *   - White / cream families keep a hairline border (borderHex from meta)
 *
 * 17 active families + specials comfortably fit at 375 px with gap 2 px.
 * (18 × 8 min-width + 17 × 2 gap = 178 px — no overflow risk.)
 *
 * Visual treatments (unchanged):
 *   kind "hue"      → solid backgroundColor from meta.hex
 *   kind "special"  → gradient treatments (multicolor / metallic / statement)
 *   kind "unknown"  → greige (#C8C0B0)
 *
 * Interaction modes (priority: hrefBase > onSelect > static) — unchanged.
 *
 * Accessibility:
 *   - role="group" + aria-label on container
 *   - aria-label and title on every bar
 *   - focus-visible ring on interactive bars
 *   - count is always in aria-label
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
  /** Retained for API compatibility. Currently only "horizontal" is rendered as histogram. */
  orientation?: ChromaSpineOrientation;
  ariaLabel?: string;
  className?: string;
}

// ─── Size configuration ───────────────────────────────────────────────────────

type SizeCfg = {
  /** Fixed container height in px. Bars fill a proportion of this. */
  containerH: number;
  /** Gap between bars in px. */
  gap: number;
  fontSize: string;
};

const SIZE_CFG: Record<ChromaSpineSize, SizeCfg> = {
  sm: { containerH: 40, gap: 2, fontSize: "0.44rem" },
  md: { containerH: 52, gap: 2, fontSize: "0.52rem" },
  lg: { containerH: 64, gap: 3, fontSize: "0.60rem" },
};

const BAR_RADIUS = "4px 4px 0 0";
const MIN_H_RATIO = 0.18;

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * Computes bar height in px.
 *   count = 0     → 18% of containerH (visible sliver, dimmed)
 *   count = max   → 100% of containerH
 *   Minimum enforced at 18% so zero-count families remain visible as stubs.
 */
function barHeightPx(count: number, maxCount: number, containerH: number): number {
  if (maxCount <= 0) return Math.round(MIN_H_RATIO * containerH);
  const ratio = count === 0 ? MIN_H_RATIO : Math.max(MIN_H_RATIO, count / maxCount);
  return Math.round(ratio * containerH);
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

/** CSS background string for "special" families. */
function specialBackground(family: SpectrumFamily): string {
  if (family === "multicolor") {
    return (
      "linear-gradient(180deg," +
      "#211C18 0%," +
      "#77303A 20%," +
      "#C3902F 38%," +
      "#C6532F 52%," +
      "#6B6D4C 66%," +
      "#3A4B5F 80%," +
      "#C98E8A 92%," +
      "#EBDFC9 100%)"
    );
  }
  if (family === "metallic") {
    return (
      "linear-gradient(180deg," +
      "#7A5A1E 0%," +
      "#C9A84C 30%," +
      "#E8C86A 55%," +
      "#B8902A 78%," +
      "#8C6A2F 100%)"
    );
  }
  return "transparent";
}

/**
 * Computes the full inline style for a single histogram bar.
 */
function buildStyle(
  meta: SpectrumMeta,
  isActive: boolean,
  count: number,
  heightPx: number,
): CSSProperties {
  let visual: CSSProperties;

  if (meta.kind === "special") {
    if (meta.id === "statement") {
      visual = { background: "transparent", border: `2px solid ${meta.hex}` };
    } else {
      visual = { background: specialBackground(meta.id) };
    }
  } else {
    visual = { backgroundColor: meta.hex };
    if (meta.borderHex) {
      visual.border = `1px solid ${meta.borderHex}`;
    }
  }

  const boxShadow = isActive
    ? `inset 0 0 0 2px rgba(255,255,255,0.55), 0 0 0 2px ${meta.hex}`
    : undefined;

  return {
    // Equal-width columns — fills the container row proportionally
    flex: "1 1 0",
    width: 0,
    minWidth: 8,
    height: heightPx,
    borderRadius: BAR_RADIUS,
    opacity: count === 0 ? 0.28 : 1,
    boxShadow,
    ...visual,
  };
}

// ─── Segment component ────────────────────────────────────────────────────────

type SegmentMode = "link" | "button" | "static";

interface SegmentProps {
  entry: SpectrumEntry;
  maxCount: number;
  containerH: number;
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
  containerH,
  isActive,
  showCounts,
  size,
  mode,
  href,
  onClickFn,
}: SegmentProps) {
  const { meta, count } = entry;
  const cfg = SIZE_CFG[size];
  const barH = barHeightPx(count, maxCount, containerH);
  const style = buildStyle(meta, isActive, count, barH);

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
      className="flex h-full w-full items-end justify-center overflow-hidden select-none pb-[3px]"
      aria-hidden="true"
    >
      {showCounts && size !== "sm" && count > 0 && barH >= 20 ? (
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
    <div style={style} title={label} aria-label={label} role="img">
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

  // Histogram container: fixed height, bars align to the bottom
  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: orientation === "vertical" ? "column" : "row",
    alignItems: orientation === "vertical" ? "flex-start" : "flex-end",
    height: orientation === "vertical" ? undefined : cfg.containerH,
    width: orientation === "vertical" ? cfg.containerH : undefined,
    gap: cfg.gap,
    overflowX: orientation === "horizontal" ? "auto" : undefined,
    overflowY: orientation === "vertical" ? "auto" : undefined,
  };

  return (
    <div className={className}>
      <div
        role="group"
        aria-label={ariaLabel}
        style={containerStyle}
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
              containerH={cfg.containerH}
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
      <div
        aria-hidden="true"
        style={{
          height: 1,
          background: "var(--tinta)",
          opacity: 0.18,
          marginTop: 0,
        }}
      />
    </div>
  );
}
