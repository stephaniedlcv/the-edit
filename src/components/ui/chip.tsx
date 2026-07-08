/**
 * Chip — UI primitive (Cromática, Fase 3C)
 *
 * Variants: default | active | outline | color
 * Sizes:    sm | md
 *
 * When variant="color" and colorFamily is provided, the chip becomes a color
 * swatch using metadata from spectrum.ts:
 *   - hex background, border from borderHex (or a soft tinta line)
 *   - text color computed from luminance (dark text on light bg, light on dark)
 *   - kind="special" families get outline treatment — no fake gradient
 *
 * Renders as <button> when onClick is provided, <span> otherwise.
 * No external deps — spectrum.ts + Tailwind + CSS custom properties.
 */

import type { ReactNode } from "react";
import { getColorFamilyMeta } from "@/lib/wardrobe/spectrum";

export type ChipVariant = "default" | "active" | "outline" | "color";
export type ChipSize = "sm" | "md";

export interface ChipProps {
  variant?: ChipVariant;
  size?: ChipSize;
  /** If provided alongside variant="color", drives swatch appearance. */
  colorFamily?: string | null;
  children?: ReactNode;
  /** Providing onClick renders a <button>; omitting it renders a <span>. */
  onClick?: () => void;
  className?: string;
  id?: string;
  title?: string;
  tabIndex?: number;
  role?: string;
  "aria-label"?: string;
  "aria-pressed"?: boolean | "true" | "false" | "mixed";
  "aria-selected"?: boolean | "true" | "false";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Perceived luminance (0–1). Values > 0.35 are considered "light". */
function hexLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 0.5;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// ─── Style maps ──────────────────────────────────────────────────────────────

const SIZE: Record<ChipSize, string> = {
  sm: "h-6 px-2.5 text-[0.56rem] tracking-[0.14em]",
  md: "h-7 px-3.5 text-[0.62rem] tracking-[0.12em]",
};

const VARIANT_STATIC: Record<Exclude<ChipVariant, "color">, string> = {
  default: "border border-[rgba(29,24,20,0.12)] bg-[var(--gal)] text-[var(--tinta-suave)]",
  active:  "border border-transparent bg-[var(--tinta)] text-[var(--papel)]",
  outline: "border border-[var(--tinta)] bg-transparent text-[var(--tinta)]",
};

const BASE =
  "inline-flex items-center justify-center font-semibold uppercase " +
  "rounded-[var(--r-chip)] transition-colors duration-100 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-[var(--tinta)]";

// ─── Component ───────────────────────────────────────────────────────────────

export function Chip({
  variant = "default",
  size = "md",
  colorFamily,
  children,
  onClick,
  className = "",
  ...aria
}: ChipProps) {
  const isInteractive = typeof onClick === "function";

  // ── Color variant ──────────────────────────────────────────────────────────
  if (variant === "color") {
    const meta = getColorFamilyMeta(colorFamily);
    const isSpecial = meta.kind === "special";

    const inlineStyle: Record<string, string> = isSpecial
      ? { borderColor: meta.hex, color: meta.hex }
      : {
          backgroundColor: meta.hex,
          borderColor: meta.borderHex ?? "rgba(29, 24, 20, 0.14)",
          color: hexLuminance(meta.hex) > 0.35 ? "var(--tinta)" : "var(--papel)",
        };

    const cls = [BASE, "border", SIZE[size], className].filter(Boolean).join(" ");
    const style = isSpecial ? { ...inlineStyle, background: "transparent" } : inlineStyle;

    if (isInteractive) {
      return (
        <button type="button" onClick={onClick} className={cls} style={style} {...aria}>
          {children ?? meta.label}
        </button>
      );
    }
    return (
      <span className={cls} style={style} {...aria}>
        {children ?? meta.label}
      </span>
    );
  }

  // ── Static variants (default / active / outline) ───────────────────────────
  const cls = [BASE, VARIANT_STATIC[variant], SIZE[size], className]
    .filter(Boolean)
    .join(" ");

  if (isInteractive) {
    return (
      <button type="button" onClick={onClick} className={cls} {...aria}>
        {children}
      </button>
    );
  }

  return (
    <span className={cls} {...aria}>
      {children}
    </span>
  );
}
