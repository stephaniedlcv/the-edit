/**
 * audit-color-families.mjs
 *
 * Reads active wardrobe_items from Supabase and reports:
 *   - total pieces
 *   - how many have a valid colorFamily
 *   - how many are null / empty
 *   - unique values found
 *   - values that don't match canonical taxonomy families
 *   - histogram by family
 *   - list of problematic pieces
 *
 * Read-only. No data is modified.
 */

import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

// ── Canonical color families from src/lib/taxonomy.ts ──────────────────────
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

// ── Load .env.local if present (optional — Replit injects secrets directly) ─
try {
  process.loadEnvFile(".env.local");
} catch {
  // File doesn't exist or Node < 20.12 — env vars come from Replit secrets
}

// ── Supabase client ─────────────────────────────────────────────────────────
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

// ── Query ───────────────────────────────────────────────────────────────────
const { data: rows, error } = await supabase
  .from("wardrobe_items")
  .select("id, name, category, color_family, color_name")
  .eq("item_status", "active")
  .order("category", { ascending: true });

if (error) {
  console.error("❌  Supabase query failed:", error.message);
  process.exit(1);
}

if (!rows || rows.length === 0) {
  console.log("⚠️  No active wardrobe items found.");
  process.exit(0);
}

// ── Analysis ────────────────────────────────────────────────────────────────
const total = rows.length;
const nullOrEmpty = [];
const nonCanonical = [];
const histogram = {};
const uniqueValues = new Set();

for (const row of rows) {
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
const problematic = [...nullOrEmpty, ...nonCanonical];

// ── Report ──────────────────────────────────────────────────────────────────
const divider = "─".repeat(60);

console.log("\n" + divider);
console.log("  CROMÁTICA — Color Family Audit");
console.log(divider);

console.log(`\n📦  Total active pieces          : ${total}`);
console.log(
  `✅  With valid colorFamily       : ${validCount} (${pct(validCount, total)})`,
);
console.log(
  `❌  Null / empty colorFamily     : ${nullOrEmpty.length} (${pct(nullOrEmpty.length, total)})`,
);

// Unique values
console.log(`\n${divider}`);
console.log("  Unique colorFamily values found");
console.log(divider);
const sortedUnique = [...uniqueValues].sort();
if (sortedUnique.length === 0) {
  console.log("  (none)");
} else {
  for (const v of sortedUnique) {
    const tag = CANONICAL_FAMILIES.has(v) ? "✓" : "⚠ non-canonical";
    console.log(`  ${v.padEnd(20)} ${tag}`);
  }
}

// Non-canonical values
console.log(`\n${divider}`);
console.log("  Non-canonical values (not in taxonomy.ts)");
console.log(divider);
const nonCanonicalValues = sortedUnique.filter((v) => !CANONICAL_FAMILIES.has(v));
if (nonCanonicalValues.length === 0) {
  console.log("  ✓ All values match canonical families.");
} else {
  for (const v of nonCanonicalValues) {
    const count = histogram[v] ?? 0;
    console.log(`  "${v}"  (${count} piece${count === 1 ? "" : "s"})`);
  }
}

// Histogram
console.log(`\n${divider}`);
console.log("  Histogram by colorFamily");
console.log(divider);
const sortedHisto = Object.entries(histogram).sort(([, a], [, b]) => b - a);
if (sortedHisto.length === 0) {
  console.log("  (no data)");
} else {
  const maxCount = sortedHisto[0][1];
  const barWidth = 30;
  for (const [family, count] of sortedHisto) {
    const bar = "█".repeat(Math.round((count / maxCount) * barWidth));
    const tag = CANONICAL_FAMILIES.has(family) ? "" : " ⚠";
    console.log(
      `  ${family.padEnd(14)} ${String(count).padStart(3)}  ${bar}${tag}`,
    );
  }
}

// Problematic pieces
console.log(`\n${divider}`);
console.log(
  `  Problematic pieces (${problematic.length}) — null/empty or non-canonical`,
);
console.log(divider);
if (problematic.length === 0) {
  console.log("  ✓ No problematic pieces found.");
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

console.log("\n" + divider + "\n");

// ── Helpers ─────────────────────────────────────────────────────────────────
function pct(n, total) {
  if (total === 0) return "0%";
  return ((n / total) * 100).toFixed(1) + "%";
}
