/**
 * spectrum.ts — Cromática Spectrum Library
 *
 * Central source of truth for translating `colorFamily` values into visual
 * metadata, grouping pieces by family, and generating histograms.
 *
 * Built on:
 *   - ColorFamily type       → @/types/wardrobe
 *   - Canonical order        → @/lib/taxonomy (colorFamilyOptions)
 *   - Hex values (priority)  → Cromática CSS tokens (--c-* in globals.css :root)
 *   - Hex fallbacks          → Dark Autumn Palette approved shades
 *   - Roles                  → inlined from dark-autumn-palette.ts (FamilyRole)
 *                              to keep this module dependency-free
 *
 * Used by: ChromaSpine (Fase 3B+), closet analytics, outfit color logic.
 * Does NOT import dark-autumn-palette.ts — roles are inlined here.
 *
 * Safe for server and client contexts. No Supabase, no side effects.
 */

import type { ColorFamily } from "@/types/wardrobe";

// ─── Exported types ───────────────────────────────────────────────────────────

/**
 * Role of a color family within the Dark Autumn palette system.
 * - base_neutral : closet anchors (black, brown, cream, white, beige, camel, denim, olive, gray)
 * - accent       : DA signature colors (burgundy, mustard, orange, pink, metallic)
 * - statement    : bold statement pieces (blue/teal, plum)
 * - pattern      : multi-color or catch-all (multicolor, statement)
 */
export type ColorFamilyRole = "base_neutral" | "accent" | "statement" | "pattern";

/** Full metadata for a canonical color family. */
export interface ColorFamilyMeta {
  value: ColorFamily;
  /** Human-readable display label. */
  label: string;
  /**
   * Representative hex for swatches and charts.
   * Sourced from Cromática --c-* token when available, DA approved shade otherwise.
   * See `cromaticaToken` and inline comments for provenance.
   */
  hex: string;
  /** Role within the Dark Autumn palette (inlined from dark-autumn-palette.ts). */
  role: ColorFamilyRole;
  /** Stable sort order: neutrals first (1–9), accents (10–14), statements (15–16), patterns (17–18). */
  sortOrder: number;
  /** CSS custom property name if a Cromática --c-* token is the direct source of `hex`. */
  cromaticaToken?: string;
}

/** Metadata returned when colorFamily is null / empty / unrecognized. */
export interface UnknownFamilyMeta {
  value: "unknown";
  label: string;
  /** Warm greige — visually distinct from all canonical families to make unknown visible. */
  hex: string;
  role: "unknown";
  sortOrder: number;
}

/** Union of canonical and unknown metadata. Return type of getColorFamilyMeta. */
export type AnyFamilyMeta = ColorFamilyMeta | UnknownFamilyMeta;

/** Minimum shape an item must have for spectrum grouping/histogram functions. */
export type WithColorFamily = { colorFamily?: string | null };

/** Histogram: count per colorFamily key (canonical or "unknown"). */
export type ColorFamilyHistogram = Record<string, number>;

/** A sorted entry returned by sortFamiliesByCount. */
export interface SortedFamilyEntry {
  family: string;
  count: number;
  meta: AnyFamilyMeta;
}

// ─── Canonical ordered list ───────────────────────────────────────────────────

/**
 * Canonical color families in display-priority order.
 * Same values as ColorFamily / colorFamilyOptions in taxonomy.ts,
 * reordered visually: base neutrals → accents → statements → patterns.
 * Audit confirmed 17 of 18 present in the live closet ("plum" is absent but valid).
 */
export const CANONICAL_FAMILIES: ColorFamily[] = [
  // Base neutrals — closet anchors (audit leaders: black, brown, cream, white)
  "black",
  "brown",
  "cream",
  "white",
  "beige",
  "camel",
  "denim",
  "olive",
  "gray",
  // Accents — DA signature colors
  "burgundy",
  "mustard",
  "orange",
  "pink",
  "metallic",
  // Statements — bold pieces
  "blue",
  "plum",
  // Patterns / catch-all
  "multicolor",
  "statement",
];

// ─── Metadata map ─────────────────────────────────────────────────────────────

/**
 * Per-family metadata. Hex provenance documented inline:
 *   [Cromática]  = value of a --c-* CSS custom property (globals.css :root)
 *   [DA palette] = approved shade from dark-autumn-palette.ts
 *   [Warm approx] = reasonable warm-neutral hex not in DA palette
 */
export const COLOR_FAMILY_META: Record<ColorFamily, ColorFamilyMeta> = {
  black: {
    value: "black",
    label: "Black",
    hex: "#2B2416",         // [DA palette] warm_black — no --c-* token; nearest Cromática: --tinta #1D1814
    role: "base_neutral",
    sortOrder: 1,
  },
  brown: {
    value: "brown",
    label: "Brown",
    hex: "#3E2C22",         // [Cromática] --c-espresso
    role: "base_neutral",
    sortOrder: 2,
    cromaticaToken: "--c-espresso",
  },
  cream: {
    value: "cream",
    label: "Cream",
    hex: "#EBDFC9",         // [Cromática] --c-crema
    role: "base_neutral",
    sortOrder: 3,
    cromaticaToken: "--c-crema",
  },
  white: {
    value: "white",
    label: "White",
    hex: "#F5EFE0",         // [DA palette] warm_cream — no --c-* token; nearest Cromática: --papel #FAF7F0
    role: "base_neutral",
    sortOrder: 4,
  },
  beige: {
    value: "beige",
    label: "Beige",
    hex: "#D6BC9A",         // [DA palette] parchment (beige_tan_camel family) — between --c-crema and --c-camel
    role: "base_neutral",
    sortOrder: 5,
  },
  camel: {
    value: "camel",
    label: "Camel",
    hex: "#B98A55",         // [Cromática] --c-camel
    role: "base_neutral",
    sortOrder: 6,
    cromaticaToken: "--c-camel",
  },
  denim: {
    value: "denim",
    label: "Denim",
    hex: "#3A4B5F",         // [Cromática] --c-denim
    role: "base_neutral",
    sortOrder: 7,
    cromaticaToken: "--c-denim",
  },
  olive: {
    value: "olive",
    label: "Olive",
    hex: "#6B6D4C",         // [Cromática] --c-oliva
    role: "base_neutral",   // DA roleOverride: "base_neutral" for olive in the green family
    sortOrder: 8,
    cromaticaToken: "--c-oliva",
  },
  gray: {
    value: "gray",
    label: "Gray",
    hex: "#7A7060",         // [Warm approx] DA restricts cool gray; warm-neutral approximation for closet display
    role: "base_neutral",
    sortOrder: 9,
  },
  burgundy: {
    value: "burgundy",
    label: "Burgundy",
    hex: "#77303A",         // [Cromática] --c-burdeos
    role: "accent",
    sortOrder: 10,
    cromaticaToken: "--c-burdeos",
  },
  mustard: {
    value: "mustard",
    label: "Mustard",
    hex: "#C3902F",         // [Cromática] --c-mostaza
    role: "accent",
    sortOrder: 11,
    cromaticaToken: "--c-mostaza",
  },
  orange: {
    value: "orange",
    label: "Orange",
    hex: "#C6532F",         // [Cromática] --c-flama
    role: "accent",
    sortOrder: 12,
    cromaticaToken: "--c-flama",
  },
  pink: {
    value: "pink",
    label: "Pink",
    hex: "#C2623E",         // [DA palette] deep_coral (pink_coral_salmon family) — no --c-* token
    role: "accent",
    sortOrder: 13,
  },
  metallic: {
    value: "metallic",
    label: "Metallic",
    hex: "#CD7F32",         // [DA palette] metal_antique_gold (metallics family) — no --c-* token
    role: "accent",
    sortOrder: 14,
  },
  blue: {
    value: "blue",
    label: "Blue",
    hex: "#005F73",         // [DA palette] deep_teal (blue_teal_peacock family) — no --c-* token
    role: "statement",
    sortOrder: 15,
  },
  plum: {
    value: "plum",
    label: "Plum",
    hex: "#5A3A50",         // [Cromática] --c-ciruela
    role: "statement",
    sortOrder: 16,
    cromaticaToken: "--c-ciruela",
  },
  multicolor: {
    value: "multicolor",
    label: "Multicolor",
    hex: "#A08060",         // [Warm approx] no single representative hex; warm-neutral placeholder
    role: "pattern",
    sortOrder: 17,
  },
  statement: {
    value: "statement",
    label: "Statement",
    hex: "#8B1A1A",         // [DA palette] brick_red (red family) — statement catch-all; warm bold
    role: "pattern",
    sortOrder: 18,
  },
};

/**
 * Fallback metadata for null / empty / unrecognized colorFamily values.
 * Always returned as-is — never silently coerced to a canonical family.
 */
export const UNKNOWN_FAMILY_META: UnknownFamilyMeta = {
  value: "unknown",
  label: "Unknown",
  hex: "#C8C0B0",   // Warm greige — visually distinct from all 18 canonical swatches
  role: "unknown",
  sortOrder: 99,
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

function isCanonicalFamily(value: string): value is ColorFamily {
  return Object.prototype.hasOwnProperty.call(COLOR_FAMILY_META, value);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Normalizes a raw colorFamily string to a canonical ColorFamily or "unknown".
 *
 * - Trims whitespace and lowercases before matching.
 * - Returns "unknown" for null, empty, or unrecognized values.
 * - Never invents a canonical family name.
 */
export function normalizeColorFamily(value: string | null | undefined): ColorFamily | "unknown" {
  if (value == null) return "unknown";
  const trimmed = value.trim().toLowerCase();
  if (trimmed === "") return "unknown";
  return isCanonicalFamily(trimmed) ? trimmed : "unknown";
}

/**
 * Returns full metadata for a colorFamily value.
 *
 * - Returns UNKNOWN_FAMILY_META for null / empty / unrecognized values.
 * - Never throws.
 */
export function getColorFamilyMeta(colorFamily: string | null | undefined): AnyFamilyMeta {
  const key = normalizeColorFamily(colorFamily);
  if (key === "unknown") return UNKNOWN_FAMILY_META;
  return COLOR_FAMILY_META[key];
}

/**
 * Returns the representative hex for a colorFamily.
 * Falls back to the unknown hex (#C8C0B0) for unrecognized values.
 */
export function getColorFamilyHex(colorFamily: string | null | undefined): string {
  return getColorFamilyMeta(colorFamily).hex;
}

/**
 * Groups items by their normalized colorFamily.
 *
 * - Items with null / empty / unrecognized colorFamily are grouped under "unknown".
 * - The "unknown" bucket is NOT hidden: callers must handle it explicitly.
 * - Accepts any object that has an optional `colorFamily` field.
 *
 * @returns Record keyed by canonical family name or "unknown".
 */
export function groupPiecesByFamily<T extends WithColorFamily>(
  items: T[],
): Record<string, T[]> {
  const result: Record<string, T[]> = {};

  for (const item of items) {
    const key = normalizeColorFamily(item.colorFamily);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }

  return result;
}

/**
 * Returns a count histogram keyed by normalized colorFamily.
 *
 * - The "unknown" key is present if any items have unrecognized families — not hidden.
 * - Accepts any object with an optional `colorFamily` field.
 *
 * @returns Record<family, count>
 */
export function getColorFamilyHistogram<T extends WithColorFamily>(
  items: T[],
): ColorFamilyHistogram {
  const histogram: ColorFamilyHistogram = {};

  for (const item of items) {
    const key = normalizeColorFamily(item.colorFamily);
    histogram[key] = (histogram[key] ?? 0) + 1;
  }

  return histogram;
}

/**
 * Sorts a histogram by count (descending) and returns enriched entries.
 *
 * Each entry includes the family's full metadata for direct consumption
 * by ChromaSpine and chart components.
 *
 * Ties are broken by `sortOrder` ascending (neutrals surface before accents
 * when counts are equal).
 *
 * @param histogram  Output of getColorFamilyHistogram.
 * @param options    `includeZero`: if true, canonical families with count 0 are
 *                   appended at the end (useful for complete spectrum display).
 */
export function sortFamiliesByCount(
  histogram: ColorFamilyHistogram,
  options?: { includeZero?: boolean },
): SortedFamilyEntry[] {
  const entries: SortedFamilyEntry[] = Object.entries(histogram).map(
    ([family, count]) => ({
      family,
      count,
      meta: getColorFamilyMeta(family),
    }),
  );

  if (options?.includeZero) {
    const existing = new Set(Object.keys(histogram));
    for (const family of CANONICAL_FAMILIES) {
      if (!existing.has(family)) {
        entries.push({ family, count: 0, meta: COLOR_FAMILY_META[family] });
      }
    }
  }

  return entries.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.meta.sortOrder - b.meta.sortOrder;
  });
}
