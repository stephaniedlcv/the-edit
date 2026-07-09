/**
 * edition.ts — Cromática edition number (Fase 6D.2C)
 *
 * Single source of truth for the edition number and PR date helpers.
 * Both Home (page.tsx) and El Archivo (closet/page.tsx) import from here;
 * no local copies of these functions should exist in any page.
 *
 * Epoch anchor: 2026-06-29T14:28:06Z = 10:28 PR → PR date "2026-06-29".
 * Edition number flips at PR midnight (UTC-4), not at UTC midnight.
 */

/** PR date of the epoch (edition Nº 1). Never change this value. */
const EPOCH_PR_DATE = "2026-06-29";

/**
 * Returns the current date in America/Puerto_Rico as "YYYY-MM-DD".
 * Uses en-CA locale which gives ISO date format natively.
 * PR is UTC-4 with no DST.
 */
export function getPRDateString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Puerto_Rico",
    year:     "numeric",
    month:    "2-digit",
    day:      "2-digit",
  }).format(new Date());
}

/**
 * Returns the current edition number anchored to PR time.
 * Edition 1 = EPOCH_PR_DATE. Increments by 1 for each PR calendar day.
 * Minimum value is 1 (never 0 or negative).
 */
export function getEditionNumber(): number {
  const todayPR = getPRDateString();
  const msPerDay = 24 * 60 * 60 * 1000;
  const epochMs = new Date(EPOCH_PR_DATE + "T00:00:00.000Z").getTime();
  const todayMs = new Date(todayPR    + "T00:00:00.000Z").getTime();
  return Math.max(1, Math.floor((todayMs - epochMs) / msPerDay) + 1);
}
