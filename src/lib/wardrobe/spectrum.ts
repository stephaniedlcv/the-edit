/**
 * spectrum.ts — Cromática Spectrum Library  (Fase 3B final)
 *
 * Source of truth for translating `colorFamily` values into visual metadata,
 * grouping pieces by family, and generating histograms ready for ChromaSpine.
 *
 * Sources (in priority order):
 *   1. Cromática CSS tokens  — --c-* custom properties in globals.css :root
 *   2. Dark Autumn Palette   — approved shades from dark-autumn-palette.ts
 *   3. Design spec           — hex values defined in Fase 3B spec
 *   4. Warm approximation    — documented fallback for families not in DA palette
 *
 * Canonical families verified against src/lib/taxonomy.ts → colorFamilyOptions.
 * 18 families. 0 discrepancies. Audit result: 17/18 present in live closet
 * (plum is absent in current data but valid in taxonomy).
 *
 * Dependency-free: does NOT import dark-autumn-palette.ts (roles are inlined).
 * Safe for server and client contexts. No Supabase, no side effects, no `any`.
 */

import type { ColorFamily } from "@/types/wardrobe";

// ─── Core types ───────────────────────────────────────────────────────────────

/**
 * Chromatic kind of a color family.
 * - "hue"     : families that represent a real, renderable hue (all standard colors)
 * - "special" : multicolor, metallic, statement — need non-flat treatment in ChromaSpine
 * - "unknown" : used only for the UNKNOWN_SPECTRUM_META fallback constant
 */
export type SpectrumKind = "hue" | "special" | "unknown";

/** Canonical family name plus the sentinel for unrecognized values. */
export type SpectrumFamily = ColorFamily | "unknown";

/**
 * Role of a color family within the Dark Autumn palette system.
 * Inlined from dark-autumn-palette.ts to keep this module dependency-free.
 *
 * - base_neutral : closet anchors (black, brown, gray, camel, beige, cream, white, denim, olive)
 * - accent       : DA signature accent colors (burgundy, mustard, orange, pink, plum)
 * - statement    : bold deep colors (blue)
 * - pattern      : multi-value or catch-all (multicolor, metallic, statement)
 */
export type ColorFamilyRole = "base_neutral" | "accent" | "statement" | "pattern";

/**
 * Full metadata for a color family — canonical or the unknown fallback.
 *
 * `kind` is the primary discriminator:
 *   - kind "hue"     → ChromaSpine renders a solid swatch
 *   - kind "special" → ChromaSpine applies treatment (gradient / shimmer / outline)
 *   - kind "unknown" → ChromaSpine shows a fallback indicator
 *
 * `borderHex` is only set for cream and white, whose swatches need a hairline
 * to remain visible against the gallery background (--gal: #EFEBE3).
 * The value is a CSS color string (may be rgba).
 */
export interface SpectrumMeta {
  /** Canonical family key (ColorFamily) or "unknown". */
  id: SpectrumFamily;
  /** English display label. */
  label: string;
  /** Spanish display label for UI elements. */
  labelEs: string;
  /**
   * Representative hex for swatches and charts.
   * See inline comments in SPECTRUM_META for hex provenance.
   * For kind "special", this is a simplified fallback — ChromaSpine
   * will render multicolor, metallic, and statement with special treatments.
   */
  hex: string;
  /**
   * Optional hairline border color.
   * Only set for cream and white so swatches remain visible on --gal (#EFEBE3).
   * Value is a CSS color string (hex or rgba).
   */
  borderHex?: string;
  kind: SpectrumKind;
  /**
   * Fixed spectral order for ChromaSpine layout.
   * Neutrals dark→light → warm accents → cool/deep → specials.
   * Do NOT derive ChromaSpine ordering from count — use sortFamiliesBySpectralOrder().
   */
  spectralOrder: number;
  /** DA palette role (inlined). Optional on unknown and some specials. */
  role?: ColorFamilyRole;
  /** CSS custom property name if a Cromática --c-* token is the direct hex source. */
  cromaticaToken?: string;
}

/** Minimum shape an item must have for spectrum grouping/histogram functions. */
export type WithColorFamily = { colorFamily?: string | null };

/** Histogram: count per colorFamily key (canonical or "unknown"). */
export type ColorFamilyHistogram = Record<string, number>;

/**
 * Rich entry for ChromaSpine and list consumers.
 * `pieces` is optional — populate when you need per-family item access.
 */
export interface SpectrumEntry<T extends WithColorFamily = WithColorFamily> {
  family: SpectrumFamily;
  meta: SpectrumMeta;
  count: number;
  pieces?: T[];
}

/** Sorted entry returned by sortFamiliesByCount. */
export interface SortedFamilyEntry {
  family: string;
  count: number;
  meta: SpectrumMeta;
}

// ─── Canonical family list ────────────────────────────────────────────────────

/**
 * The 18 canonical color families, in taxonomy.ts / colorFamilyOptions order.
 * Verified against src/lib/taxonomy.ts — 0 discrepancies.
 * For spectral ordering (ChromaSpine layout), use SPECTRUM_META[f].spectralOrder
 * or call sortFamiliesBySpectralOrder().
 */
export const CANONICAL_FAMILIES: ColorFamily[] = [
  "black",
  "brown",
  "cream",
  "beige",
  "white",
  "burgundy",
  "olive",
  "camel",
  "plum",
  "mustard",
  "denim",
  "blue",
  "pink",
  "gray",
  "orange",
  "metallic",
  "multicolor",
  "statement",
];

// ─── Metadata map ─────────────────────────────────────────────────────────────

/**
 * Per-family metadata.
 *
 * Hex provenance tags (inline comments):
 *   [Cromática]   = value of a --c-* CSS custom property (globals.css :root)
 *   [DA palette]  = approved shade from dark-autumn-palette.ts
 *   [3B spec]     = hex defined in Fase 3B design spec
 *   [Warm approx] = warm-neutral approximation; DA restricts or omits this family
 *
 * spectralOrder:
 *   1–7   neutrals dark→light  (black, brown, gray, camel, beige, cream, white)
 *   8–12  warm accents         (mustard, orange, burgundy, pink, plum)
 *   13–15 cool / deep          (olive, blue, denim)
 *   16–18 specials             (multicolor, metallic, statement)
 *
 * ChromaSpine special treatments (kind: "special"):
 *   multicolor → mini-gradient across canonical hues
 *   metallic   → shimmer / metallic surface treatment
 *   statement  → outline / emphasis treatment
 */
export const SPECTRUM_META: Record<ColorFamily, SpectrumMeta> = {
  // ── Neutrals dark → light ──────────────────────────────────────────────────
  black: {
    id: "black",
    label: "Black",
    labelEs: "Negro",
    hex: "#211C18",         // [3B spec] warm-black; nearest Cromática: --tinta #1D1814
    kind: "hue",
    spectralOrder: 1,
    role: "base_neutral",
  },
  brown: {
    id: "brown",
    label: "Brown",
    labelEs: "Café",
    hex: "#5B4232",         // [3B spec] medium espresso-brown; --c-espresso (#3E2C22) is darker
    kind: "hue",
    spectralOrder: 2,
    role: "base_neutral",
  },
  gray: {
    id: "gray",
    label: "Gray",
    labelEs: "Gris",
    hex: "#8D8A84",         // [3B spec] warm gray; DA restricts cool gray — this reads warm-neutral
    kind: "hue",
    spectralOrder: 3,
    role: "base_neutral",
  },
  camel: {
    id: "camel",
    label: "Camel",
    labelEs: "Camel",
    hex: "#B98A55",         // [Cromática] --c-camel
    kind: "hue",
    spectralOrder: 4,
    role: "base_neutral",
    cromaticaToken: "--c-camel",
  },
  beige: {
    id: "beige",
    label: "Beige",
    labelEs: "Beige",
    hex: "#D9C6A5",         // [3B spec] warm parchment; between --c-crema and --c-camel
    kind: "hue",
    spectralOrder: 5,
    role: "base_neutral",
  },
  cream: {
    id: "cream",
    label: "Cream",
    labelEs: "Crema",
    hex: "#EBDFC9",         // [Cromática] --c-crema
    borderHex: "rgba(29, 24, 20, 0.18)", // hairline on --gal (#EFEBE3); computed ≈ #C9C5BE
    kind: "hue",
    spectralOrder: 6,
    role: "base_neutral",
    cromaticaToken: "--c-crema",
  },
  white: {
    id: "white",
    label: "White",
    labelEs: "Blanco",
    hex: "#F5F1E8",         // [3B spec] warm white; nearest Cromática: --papel #FAF7F0
    borderHex: "rgba(29, 24, 20, 0.22)", // hairline on --gal (#EFEBE3); computed ≈ #C1BCB5
    kind: "hue",
    spectralOrder: 7,
    role: "base_neutral",
  },

  // ── Warm accents ───────────────────────────────────────────────────────────
  mustard: {
    id: "mustard",
    label: "Mustard",
    labelEs: "Mostaza",
    hex: "#C3902F",         // [Cromática] --c-mostaza
    kind: "hue",
    spectralOrder: 8,
    role: "accent",
    cromaticaToken: "--c-mostaza",
  },
  orange: {
    id: "orange",
    label: "Orange",
    labelEs: "Naranja",
    hex: "#C6532F",         // [Cromática] --c-flama
    kind: "hue",
    spectralOrder: 9,
    role: "accent",
    cromaticaToken: "--c-flama",
  },
  burgundy: {
    id: "burgundy",
    label: "Burgundy",
    labelEs: "Borgoña",
    hex: "#77303A",         // [Cromática] --c-burdeos
    kind: "hue",
    spectralOrder: 10,
    role: "accent",
    cromaticaToken: "--c-burdeos",
  },
  pink: {
    id: "pink",
    label: "Pink",
    labelEs: "Rosa",
    hex: "#C98E8A",         // [3B spec] warm dusty pink; DA pink_coral_salmon family
    kind: "hue",
    spectralOrder: 11,
    role: "accent",
  },
  plum: {
    id: "plum",
    label: "Plum",
    labelEs: "Ciruela",
    hex: "#5A3A50",         // [Cromática] --c-ciruela
    kind: "hue",
    spectralOrder: 12,
    role: "accent",
    cromaticaToken: "--c-ciruela",
  },

  // ── Cool / deep ────────────────────────────────────────────────────────────
  olive: {
    id: "olive",
    label: "Olive",
    labelEs: "Oliva",
    hex: "#6B6D4C",         // [Cromática] --c-oliva
    kind: "hue",
    spectralOrder: 13,
    role: "base_neutral",   // DA: roleOverride "base_neutral" for olive in the green family
    cromaticaToken: "--c-oliva",
  },
  blue: {
    id: "blue",
    label: "Blue",
    labelEs: "Azul",
    hex: "#3A4B5F",         // [3B spec] deep denim-blue; note: same value as --c-denim token,
    kind: "hue",            //           but semantically this is the blue family display swatch
    spectralOrder: 14,
    role: "statement",
  },
  denim: {
    id: "denim",
    label: "Denim",
    labelEs: "Denim",
    hex: "#4E637A",         // [3B spec] medium indigo-denim; --c-denim (#3A4B5F) is darker
    kind: "hue",
    spectralOrder: 15,
    role: "base_neutral",
  },

  // ── Specials ───────────────────────────────────────────────────────────────
  multicolor: {
    id: "multicolor",
    label: "Multicolor",
    labelEs: "Multicolor",
    hex: "#A08060",         // [Warm approx] placeholder; ChromaSpine renders mini-gradient
    kind: "special",
    spectralOrder: 16,
    role: "pattern",
  },
  metallic: {
    id: "metallic",
    label: "Metallic",
    labelEs: "Metálico",
    hex: "#CD7F32",         // [DA palette] metal_antique_gold; ChromaSpine renders shimmer
    kind: "special",
    spectralOrder: 17,
    role: "pattern",
  },
  statement: {
    id: "statement",
    label: "Statement",
    labelEs: "Statement",
    hex: "#8B1A1A",         // [DA palette] brick_red; ChromaSpine renders outline/emphasis
    kind: "special",
    spectralOrder: 18,
    role: "pattern",
  },
};

/**
 * Fallback metadata for null / empty / unrecognized colorFamily values.
 * Always returned as-is — never silently coerced to a canonical family.
 * The "unknown" bucket must be visible to consumers; never hide it.
 */
export const UNKNOWN_SPECTRUM_META: SpectrumMeta = {
  id: "unknown",
  label: "Unknown",
  labelEs: "Desconocido",
  hex: "#C8C0B0",   // Warm greige — visually distinct from all 18 canonical swatches
  kind: "unknown",
  spectralOrder: 99,
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

function isCanonicalFamily(value: string): value is ColorFamily {
  return Object.prototype.hasOwnProperty.call(SPECTRUM_META, value);
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
 * Returns full SpectrumMeta for a colorFamily value.
 *
 * - Returns UNKNOWN_SPECTRUM_META for null / empty / unrecognized values.
 * - Never throws.
 */
export function getColorFamilyMeta(colorFamily: string | null | undefined): SpectrumMeta {
  const key = normalizeColorFamily(colorFamily);
  if (key === "unknown") return UNKNOWN_SPECTRUM_META;
  return SPECTRUM_META[key];
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
 * - Items with null / empty / unrecognized colorFamily go into the "unknown" bucket.
 * - The "unknown" bucket is NOT hidden — callers must handle it.
 * - Accepts any object with an optional `colorFamily` field.
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
 * By default, excludes families with count 0 (only present families are included).
 * The "unknown" key is included if any items have unrecognized families — never hidden.
 *
 * @param items        Any array of objects with an optional `colorFamily` field.
 * @param options
 *   - `includeEmpty`  If true, all 18 canonical families appear in the result,
 *                     with count 0 for families with no items. Useful for full
 *                     spectrum display (e.g., ChromaSpine complete palette view).
 *
 * @returns ColorFamilyHistogram keyed by family name or "unknown".
 */
export function getColorFamilyHistogram<T extends WithColorFamily>(
  items: T[],
  options?: { includeEmpty?: boolean },
): ColorFamilyHistogram {
  const histogram: ColorFamilyHistogram = {};

  for (const item of items) {
    const key = normalizeColorFamily(item.colorFamily);
    histogram[key] = (histogram[key] ?? 0) + 1;
  }

  if (options?.includeEmpty) {
    for (const family of CANONICAL_FAMILIES) {
      if (!(family in histogram)) {
        histogram[family] = 0;
      }
    }
  }

  return histogram;
}

/**
 * Sorts histogram entries by count (descending).
 * Intended for closet lists, frequency charts, and "top colors" displays.
 * For ChromaSpine layout use sortFamiliesBySpectralOrder() instead.
 *
 * Tie-breaking: spectralOrder ascending (neutrals surface before accents on equal count).
 *
 * @param histogram  Output of getColorFamilyHistogram.
 * @returns          Sorted SortedFamilyEntry[] with full metadata.
 */
export function sortFamiliesByCount(
  histogram: ColorFamilyHistogram,
): SortedFamilyEntry[] {
  return Object.entries(histogram)
    .map(([family, count]) => ({
      family,
      count,
      meta: getColorFamilyMeta(family),
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.meta.spectralOrder - b.meta.spectralOrder;
    });
}

/**
 * Sorts histogram entries by spectralOrder (ascending).
 * This is the canonical order for ChromaSpine layout:
 *   neutrals dark→light → warm accents → cool/deep → specials → unknown last.
 *
 * Families with count 0 (if present) are sorted by spectralOrder too.
 * The "unknown" bucket (spectralOrder 99) always sorts last.
 *
 * @param histogram  Output of getColorFamilyHistogram.
 * @returns          SortedFamilyEntry[] in spectral order, with full metadata.
 */
export function sortFamiliesBySpectralOrder(
  histogram: ColorFamilyHistogram,
): SortedFamilyEntry[] {
  return Object.entries(histogram)
    .map(([family, count]) => ({
      family,
      count,
      meta: getColorFamilyMeta(family),
    }))
    .sort((a, b) => a.meta.spectralOrder - b.meta.spectralOrder);
}
