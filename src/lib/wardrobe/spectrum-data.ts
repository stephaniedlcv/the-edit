/**
 * spectrum-data.ts — Live data layer for ChromaSpine  (Fase 4B)
 *
 * Bridges real closet data (Supabase / mock fallback) to the SpectrumEntry[]
 * shape consumed by ChromaSpine and any future spectrum-aware consumers.
 *
 * Two exports:
 *
 * 1. `buildSpectrumEntriesFromItems<T>()` — pure function, no Supabase.
 *    Converts any item array with colorFamily into sorted SpectrumEntry[].
 *    Testable without network or DB.
 *
 * 2. `getClosetSpectrumEntries()` — async server function.
 *    Fetches live wardrobe items and delegates to the pure helper above.
 *    Returns [] on error (never throws). Fallback behavior mirrors getWardrobeItems:
 *      - Supabase configured   → real database rows
 *      - Supabase unavailable  → mockOwnedItems (app-wide demo fallback)
 *      - Supabase query error  → [] + console.error
 *
 * ChromaSpine itself remains a pure presentational component — it never imports
 * this file. Only pages and server layouts should call getClosetSpectrumEntries.
 *
 * Does NOT:
 *   - modify Supabase schema
 *   - add new dependencies
 *   - use `any`
 *   - touch Home / Closet / Wishlist / Outfits routes
 */

import { getWardrobeItems } from "@/lib/wardrobe/data";
import {
  getColorFamilyHistogram,
  groupPiecesByFamily,
  sortFamiliesBySpectralOrder,
} from "@/lib/wardrobe/spectrum";
import type {
  SpectrumEntry,
  SpectrumFamily,
  WithColorFamily,
} from "@/lib/wardrobe/spectrum";
import type { WardrobeItem } from "@/types/wardrobe";

// ─── Options ──────────────────────────────────────────────────────────────────

export interface SpectrumDataOptions {
  /**
   * If true, all 18 canonical families appear in the output — including those
   * with count=0. Useful for a "full palette" view (shows gaps honestly).
   * Default: false (only families present in the closet are returned).
   */
  includeEmpty?: boolean;

  /**
   * If true, each SpectrumEntry includes a `pieces` array containing the
   * actual WardrobeItem objects belonging to that family.
   * Default: false. Only enable when per-item access is needed — avoids
   * loading large item arrays into entries used only for count/display.
   */
  includePieces?: boolean;
}

// ─── Pure helper ─────────────────────────────────────────────────────────────

/**
 * Builds `SpectrumEntry<T>[]` from any array of items that have a colorFamily.
 *
 * Pure function — no network calls, no Supabase, no side effects.
 * Safe to call in tests, server components, and client utilities alike.
 *
 * Ordering: spectral order (dark neutrals → warm accents → cool/deep → specials).
 * The "unknown" bucket (spectralOrder 99) always sorts last if present.
 *
 * @param items    Any objects satisfying WithColorFamily ({ colorFamily?: string | null }).
 * @param options  includeEmpty / includePieces — see SpectrumDataOptions.
 * @returns        SpectrumEntry<T>[] in spectral order.
 *                 Empty array if items is empty.
 */
export function buildSpectrumEntriesFromItems<T extends WithColorFamily>(
  items: T[],
  options?: SpectrumDataOptions,
): SpectrumEntry<T>[] {
  if (items.length === 0) return [];

  // Build count histogram. includeEmpty adds zero-count canonical families.
  const histogram = getColorFamilyHistogram(items, {
    includeEmpty: options?.includeEmpty,
  });

  // Sort histogram entries into spectral order.
  // sortFamiliesBySpectralOrder calls getColorFamilyMeta internally — no duplication.
  const sorted = sortFamiliesBySpectralOrder(histogram);

  // Optionally group pieces by family (one pass over items).
  const groupedPieces: Record<string, T[]> | null = options?.includePieces
    ? (groupPiecesByFamily(items) as Record<string, T[]>)
    : null;

  return sorted.map((sortedEntry) => {
    const entry: SpectrumEntry<T> = {
      family: sortedEntry.family as SpectrumFamily,
      meta: sortedEntry.meta,
      count: sortedEntry.count,
    };

    if (groupedPieces !== null) {
      // Families absent from groupedPieces (zero-count from includeEmpty) → []
      entry.pieces = groupedPieces[sortedEntry.family] ?? [];
    }

    return entry;
  });
}

// ─── Server data function ─────────────────────────────────────────────────────

/**
 * Fetches live closet items and converts them to `SpectrumEntry<WardrobeItem>[]`.
 * Server-safe (uses Next.js server context via getWardrobeItems).
 *
 * Fallback contract (mirrors getWardrobeItems — no surprises):
 *   - Supabase configured + query OK  → real data, sorted by spectralOrder.
 *   - Supabase not configured         → mockOwnedItems (app-wide demo fallback).
 *   - Supabase query error            → [] + console.error (never throws).
 *   - Unexpected exception            → [] + console.error (never throws).
 *
 * @param options  See SpectrumDataOptions.
 * @returns        Promise<SpectrumEntry<WardrobeItem>[]> — never rejects.
 */
export async function getClosetSpectrumEntries(
  options?: SpectrumDataOptions,
): Promise<SpectrumEntry<WardrobeItem>[]> {
  let items: WardrobeItem[];

  try {
    items = await getWardrobeItems();
  } catch (err) {
    console.error("[spectrum-data] getWardrobeItems() threw unexpectedly:", err);
    return [];
  }

  // getWardrobeItems returns [] on Supabase query error (already logged in data.ts).
  // We pass an empty array through; buildSpectrumEntriesFromItems returns [] immediately.
  return buildSpectrumEntriesFromItems<WardrobeItem>(items, options);
}
