/**
 * audit-wishlist-color-families.mjs
 *
 * Reads active wishlist_items from Supabase and reports:
 *   - total items
 *   - how many have a valid colorFamily
 *   - how many are null / empty
 *   - non-canonical values
 *   - histogram by family
 *   - list of problematic items (can't appear as ghosts in El Archivo)
 *   - distribution by decision tier
 *
 * Read-only. No data is modified.
 */

import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

// ── Canonical color families (mirrors src/lib/taxonomy.ts) ──────────────────
const CANONICAL_FAMILIES = new Set([
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
]);

// ── Load .env.local if present (Replit injects secrets directly) ─────────────
try {
  process.loadEnvFile(".env.local");
} catch {
  // File doesn't exist or Node < 20.12 — env vars come from Replit secrets
}

// ── Supabase client ──────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌  Missing Supabase credentials.\n" +
      "    Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: WebSocket },
});

// ── Query — active (non-archived) wishlist items ─────────────────────────────
const { data: rows, error } = await supabase
  .from("wishlist_items")
  .select("id, name, category, subcategory, color_family, color_name, decision")
  .eq("is_archived", false)
  .order("category", { ascending: true });

if (error) {
  console.error("❌  Supabase query failed:", error.message);
  process.exit(1);
}

if (!rows || rows.length === 0) {
  console.log("⚠️  No active wishlist items found.");
  process.exit(0);
}

// ── Analysis ─────────────────────────────────────────────────────────────────
const total = rows.length;
const nullOrEmpty = [];
const nonCanonical = [];
const histogram = {};
const uniqueValues = new Set();
const decisionCounts = {};

for (const row of rows) {
  // Decision distribution
  const dec = row.decision ?? "(null)";
  decisionCounts[dec] = (decisionCounts[dec] ?? 0) + 1;

  const cf = row.color_family;
  const isEmpty = cf === null || cf === undefined || cf.toString().trim() === "";

  if (isEmpty) {
    nullOrEmpty.push(row);
    continue;
  }

  const value = cf.toString().trim();
  uniqueValues.add(value);
  histogram[value] = (histogram[value] ?? 0) + 1;

  if (!CANONICAL_FAMILIES.has(value)) {
    nonCanonical.push(row);
  }
}

const validCount = total - nullOrEmpty.length;
const ghostReady = validCount - nonCanonical.length;
const problematic = [...nullOrEmpty, ...nonCanonical];

// ── Report ───────────────────────────────────────────────────────────────────
const divider = "─".repeat(62);

console.log("\n" + divider);
console.log("  CROMÁTICA — Wishlist Color Family Audit");
console.log(divider);

console.log(`\n🛍   Total active wishlist items    : ${total}`);
console.log(`✅  With valid colorFamily          : ${validCount} (${pct(validCount, total)})`);
console.log(`👻  Ghost-ready (canonical)         : ${ghostReady} (${pct(ghostReady, total)})`);
console.log(`❌  Null / empty colorFamily        : ${nullOrEmpty.length} (${pct(nullOrEmpty.length, total)})`);
console.log(`⚠️   Non-canonical colorFamily       : ${nonCanonical.length} (${pct(nonCanonical.length, total)})`);

// Decision distribution
console.log(`\n${divider}`);
console.log("  Decision tier distribution");
console.log(divider);
const sortedDecisions = Object.entries(decisionCounts).sort(([, a], [, b]) => b - a);
for (const [dec, count] of sortedDecisions) {
  console.log(`  ${dec.padEnd(22)} ${String(count).padStart(3)}`);
}

// Unique values
console.log(`\n${divider}`);
console.log("  Unique colorFamily values found");
console.log(divider);
const sortedUnique = [...uniqueValues].sort();
if (sortedUnique.length === 0) {
  console.log("  (none)");
} else {
  for (const v of sortedUnique) {
    const tag = CANONICAL_FAMILIES.has(v) ? "✓" : "⚠  non-canonical";
    console.log(`  ${v.padEnd(22)} ${tag}`);
  }
}

// Non-canonical
console.log(`\n${divider}`);
console.log("  Non-canonical values (not in taxonomy.ts)");
console.log(divider);
const nonCanonicalValues = sortedUnique.filter((v) => !CANONICAL_FAMILIES.has(v));
if (nonCanonicalValues.length === 0) {
  console.log("  ✓ All values match canonical families.");
} else {
  for (const v of nonCanonicalValues) {
    const count = histogram[v] ?? 0;
    console.log(`  "${v}"  (${count} item${count === 1 ? "" : "s"})`);
  }
}

// Histogram
console.log(`\n${divider}`);
console.log("  Histogram by colorFamily (wishlist items)");
console.log(divider);
const sortedHisto = Object.entries(histogram).sort(([, a], [, b]) => b - a);
if (sortedHisto.length === 0) {
  console.log("  (no data)");
} else {
  const maxCount = sortedHisto[0][1];
  const barWidth = 28;
  for (const [family, count] of sortedHisto) {
    const bar = "█".repeat(Math.round((count / maxCount) * barWidth));
    const tag = CANONICAL_FAMILIES.has(family) ? "" : " ⚠";
    console.log(`  ${family.padEnd(14)} ${String(count).padStart(3)}  ${bar}${tag}`);
  }
}

// Families with 0 wishlist items
const zeroFamilies = [...CANONICAL_FAMILIES].filter(
  (f) => !histogram[f],
).sort();
console.log(`\n${divider}`);
console.log(`  Families with 0 wishlist items (${zeroFamilies.length})`);
console.log(divider);
if (zeroFamilies.length === 0) {
  console.log("  — All 18 families have at least one wishlist item.");
} else {
  console.log("  " + zeroFamilies.join(", "));
}

// Problematic items — can't appear as ghosts
console.log(`\n${divider}`);
console.log(
  `  Problematic items (${problematic.length}) — null/empty or non-canonical colorFamily`,
);
console.log(`  These items CANNOT appear as wishlist ghosts in El Archivo.`);
console.log(divider);
if (problematic.length === 0) {
  console.log("  ✓ No problematic items found. All wishlist items are ghost-ready.");
} else {
  const header = [
    "id".padEnd(36),
    "category".padEnd(12),
    "colorFamily".padEnd(16),
    "colorName".padEnd(18),
    "name",
  ].join("  ");
  console.log("  " + header);
  console.log("  " + "─".repeat(header.length));

  for (const row of problematic) {
    const cf = row.color_family ?? "(null)";
    const cn = row.color_name ?? "(null)";
    const line = [
      row.id.padEnd(36),
      (row.category ?? "").padEnd(12),
      String(cf).padEnd(16),
      String(cn).padEnd(18),
      row.name,
    ].join("  ");
    console.log("  " + line);
  }
}

// Recommendation
console.log(`\n${divider}`);
console.log("  Recommendation before Fase 6D.2");
console.log(divider);
if (problematic.length === 0) {
  console.log("  ✅  All wishlist items are ghost-ready. Proceed to El Archivo.");
} else {
  console.log(`  ⚠️   ${problematic.length} item${problematic.length === 1 ? " needs" : "s need"} a canonical colorFamily`);
  console.log("      before it can appear as a ghost in El Archivo.");
  console.log("      Fix manually in Supabase (no schema change, just data).");
}

console.log("\n" + divider + "\n");

// ── Helpers ──────────────────────────────────────────────────────────────────
function pct(n, total) {
  if (total === 0) return "0%";
  return ((n / total) * 100).toFixed(1) + "%";
}
