/**
 * LEGACY SCRIPT — audit-closet-photo-matches.mjs
 *
 * Audits which local closet photos in `data/closet-photos/` have a matching
 * entry in `wardrobe_items` via the `photo_filename` and `drive_photo_path`
 * columns, and prints a matched/missing summary.
 *
 * IMPORTANT — SCHEMA NOTE:
 * This script reads `wardrobe_items.photo_filename` and
 * `wardrobe_items.drive_photo_path` columns.  These columns were part of an
 * earlier schema and do NOT exist in the current migrations.  Running this
 * script against a fresh database will show all items as "No photo_filename
 * in database" — it will not error, but the audit output will be meaningless.
 *
 * Only run this script if you are auditing a legacy Supabase project that
 * still has those columns populated.  Current photo state is tracked through
 * `wardrobe_item_images` rows and Supabase Storage directly.
 *
 * Prerequisites:
 *   - .env.local with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *   - data/closet-photos/ directory present (unzip closet-photos.zip)
 *
 * Run with: node scripts/audit-closet-photo-matches.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const envPath = ".env.local";

  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local not found");
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const [key, ...rest] = line.split("=");
    process.env[key.trim()] = rest.join("=").trim();
  }
}

function walkFiles(dir) {
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const photosRoot = "data/closet-photos";

if (!fs.existsSync(photosRoot)) {
  throw new Error("data/closet-photos not found. Unzip closet-photos.zip first.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const localFiles = walkFiles(photosRoot);
const localByFilename = new Map();

for (const file of localFiles) {
  const filename = path.basename(file).toUpperCase();
  localByFilename.set(filename, file);
}

const { data: items, error } = await supabase
  .from("wardrobe_items")
  .select("id, name, category, photo_filename, drive_photo_path")
  .eq("is_archived", false)
  .order("category", { ascending: true })
  .order("name", { ascending: true });

if (error) {
  throw error;
}

const matched = [];
const missing = [];

for (const item of items) {
  const filename = item.photo_filename?.trim();

  if (!filename) {
    missing.push({ name: item.name, reason: "No photo_filename in database" });
    continue;
  }

  const localFile = localByFilename.get(filename.toUpperCase());

  if (localFile) {
    matched.push({
      id: item.id,
      name: item.name,
      category: item.category,
      photo_filename: filename,
      localFile,
    });
  } else {
    missing.push({
      name: item.name,
      photo_filename: filename,
      reason: "File not found locally",
    });
  }
}

const matchedFilenames = new Set(matched.map((item) => item.photo_filename.toUpperCase()));
const extraLocalFiles = localFiles.filter(
  (file) => !matchedFilenames.has(path.basename(file).toUpperCase()),
);

console.log("---- Closet photo audit ----");
console.log("Supabase wardrobe items:", items.length);
console.log("Local photo files:", localFiles.length);
console.log("Matched:", matched.length);
console.log("Missing:", missing.length);
console.log("Extra local files:", extraLocalFiles.length);

console.log("");
console.log("---- Missing sample ----");
console.table(missing.slice(0, 20));

console.log("");
console.log("---- Extra local sample ----");
console.table(extraLocalFiles.slice(0, 20).map((file) => ({
  filename: path.basename(file),
  path: file,
})));

fs.mkdirSync("data/photo-audit", { recursive: true });
fs.writeFileSync("data/photo-audit/matched.json", JSON.stringify(matched, null, 2));
fs.writeFileSync("data/photo-audit/missing.json", JSON.stringify(missing, null, 2));
fs.writeFileSync("data/photo-audit/extra-local-files.json", JSON.stringify(extraLocalFiles, null, 2));

console.log("");
console.log("Audit files written to data/photo-audit/");
