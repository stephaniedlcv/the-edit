/**
 * PieceCard — UI primitive (Cromática, Fase 3C)
 *
 * Reusable card for wardrobe pieces (owned or wishlist).
 * Three layout variants: gallery | compact | river
 *
 * Color swatch uses spectrum.ts → getColorFamilyMeta().
 * Image placeholder is Cromática-native (no AtelierPlaceholder dependency).
 * Renders as <Link> when href is provided, <div> otherwise.
 * No Supabase dependency. SSR-safe.
 *
 * Image rendering: uses <div backgroundImage> to match existing app pattern.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { getColorFamilyMeta } from "@/lib/wardrobe/spectrum";

export type PieceCardVariant = "gallery" | "compact" | "river";

export interface PieceCardProps {
  variant?: PieceCardVariant;
  name: string;
  category?: string;
  imageUrl?: string;
  colorFamily?: string | null;
  href?: string;
  /** Optional metadata content rendered below the main info row. */
  meta?: ReactNode;
  children?: ReactNode;
  /** Priority number badge — used for wishlist purchase order. */
  priority?: number;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 0.5;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Cromática-native image placeholder. No legacy color system dependency. */
function PiecePlaceholder({
  colorFamily,
  name,
  className = "",
}: {
  colorFamily?: string | null;
  name: string;
  className?: string;
}) {
  const meta = getColorFamilyMeta(colorFamily);
  const initial = name.trim().charAt(0).toUpperCase();
  const lum = hexLuminance(meta.hex);
  const inkColor = lum > 0.35 ? "var(--tinta)" : "var(--papel)";

  return (
    <div
      className={["flex items-center justify-center", className]
        .filter(Boolean)
        .join(" ")}
      style={{ backgroundColor: meta.hex }}
      aria-hidden="true"
    >
      <span
        className="font-display select-none text-5xl opacity-30"
        style={{ color: inkColor }}
      >
        {initial}
      </span>
    </div>
  );
}

/** Tiny color swatch dot + label. */
function ColorSwatch({ colorFamily }: { colorFamily?: string | null }) {
  const meta = getColorFamilyMeta(colorFamily);
  const isSpecial = meta.kind === "special";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
        style={{
          backgroundColor: isSpecial ? "transparent" : meta.hex,
          border: isSpecial
            ? `1.5px solid ${meta.hex}`
            : meta.borderHex
              ? `1px solid ${meta.borderHex}`
              : "1px solid rgba(29,24,20,0.12)",
        }}
        aria-hidden="true"
      />
      <span className="text-[0.56rem] font-semibold uppercase tracking-[0.16em] text-[var(--tinta-tenue)]">
        {meta.label}
      </span>
    </span>
  );
}

// ─── Variant layouts ──────────────────────────────────────────────────────────

function GalleryLayout({
  name,
  category,
  imageUrl,
  colorFamily,
  priority,
  meta,
  children,
}: PieceCardProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Image area */}
      <div className="relative overflow-hidden rounded-[var(--r-card)]">
        {imageUrl ? (
          <div
            className="h-[18rem] bg-contain bg-center bg-no-repeat transition duration-300 group-hover:scale-[1.02]"
            style={{ backgroundImage: `url(${imageUrl})` }}
            aria-label={name}
          />
        ) : (
          <PiecePlaceholder
            colorFamily={colorFamily}
            name={name}
            className="h-[18rem] transition duration-300 group-hover:scale-[1.02]"
          />
        )}

        {/* Category badge */}
        {category ? (
          <div className="absolute left-3 top-3 rounded-[var(--r-chip)] bg-[var(--papel)]/80 px-3 py-1.5 text-[0.52rem] font-semibold uppercase tracking-[0.18em] text-[var(--tinta)] backdrop-blur-sm">
            {capitalize(category)}
          </div>
        ) : null}

        {/* Priority badge */}
        {typeof priority === "number" ? (
          <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--tinta)] text-[var(--papel)]">
            <span className="font-display text-base leading-none">{priority}</span>
          </div>
        ) : null}
      </div>

      {/* Info */}
      <div className="px-1 pb-2 pt-3">
        <h3 className="font-display text-[1.45rem] leading-[1] text-[var(--tinta)] line-clamp-2">
          {name}
        </h3>

        {colorFamily ? (
          <div className="mt-2">
            <ColorSwatch colorFamily={colorFamily} />
          </div>
        ) : null}

        {meta ? <div className="mt-2">{meta}</div> : null}
        {children}
      </div>
    </div>
  );
}

function CompactLayout({
  name,
  imageUrl,
  colorFamily,
  priority,
}: PieceCardProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Square image */}
      <div className="relative overflow-hidden rounded-[var(--r-card)]">
        {imageUrl ? (
          <div
            className="aspect-square bg-contain bg-center bg-no-repeat transition duration-300 group-hover:scale-[1.02]"
            style={{ backgroundImage: `url(${imageUrl})` }}
            aria-label={name}
          />
        ) : (
          <PiecePlaceholder
            colorFamily={colorFamily}
            name={name}
            className="aspect-square"
          />
        )}

        {typeof priority === "number" ? (
          <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tinta)] text-[var(--papel)]">
            <span className="text-[0.6rem] font-bold">{priority}</span>
          </div>
        ) : null}
      </div>

      {/* Name + swatch */}
      <div className="px-0.5">
        <p className="truncate text-[0.78rem] font-semibold leading-snug text-[var(--tinta)]">
          {name}
        </p>
        {colorFamily ? (
          <div className="mt-1">
            <ColorSwatch colorFamily={colorFamily} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RiverLayout({
  name,
  category,
  imageUrl,
  colorFamily,
  priority,
  meta,
  children,
}: PieceCardProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Thumbnail */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--r-card)]">
        {imageUrl ? (
          <div
            className="h-full w-full bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${imageUrl})` }}
            aria-label={name}
          />
        ) : (
          <PiecePlaceholder colorFamily={colorFamily} name={name} className="h-full w-full" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-[0.92rem] font-semibold leading-snug text-[var(--tinta)]">
            {name}
          </h3>
          {typeof priority === "number" ? (
            <span className="shrink-0 rounded-full bg-[var(--gal)] px-2.5 py-0.5 text-[0.52rem] font-bold uppercase tracking-[0.14em] text-[var(--tinta-suave)]">
              #{priority}
            </span>
          ) : null}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          {category ? (
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--tinta-tenue)]">
              {capitalize(category)}
            </span>
          ) : null}
          {colorFamily ? <ColorSwatch colorFamily={colorFamily} /> : null}
        </div>

        {meta ? <div className="mt-1">{meta}</div> : null}
        {children}
      </div>
    </div>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────────

const SHELL =
  "group block w-full rounded-[var(--r-card)] bg-[var(--papel)] " +
  "shadow-[0_2px_12px_rgba(29,24,20,0.05),inset_0_1px_0_rgba(255,255,255,0.80)] " +
  "transition duration-200 " +
  "hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(29,24,20,0.09),inset_0_1px_0_rgba(255,255,255,0.90)] " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tinta)]";

function LayoutSwitch(props: PieceCardProps) {
  switch (props.variant) {
    case "compact":
      return <CompactLayout {...props} />;
    case "river":
      return <RiverLayout {...props} />;
    default:
      return <GalleryLayout {...props} />;
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function PieceCard({
  href,
  variant = "gallery",
  className = "",
  ...props
}: PieceCardProps) {
  const padding = variant === "river" ? "p-3" : variant === "compact" ? "p-2" : "p-3";
  const shellClass = [SHELL, padding, className].filter(Boolean).join(" ");

  if (href) {
    return (
      <Link href={href} className={shellClass}>
        <LayoutSwitch variant={variant} href={href} {...props} />
      </Link>
    );
  }

  return (
    <div className={shellClass}>
      <LayoutSwitch variant={variant} {...props} />
    </div>
  );
}
