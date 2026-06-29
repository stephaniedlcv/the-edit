import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "closet-items";
const PHOTOS_ROOT = "data/closet-photos";

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

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();

  if (ext === ".avif") return "image/avif";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";

  return "application/octet-stream";
}

function sanitizeStorageName(filename) {
  return filename.replace(/\s+/g, "-");
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

if (!fs.existsSync(PHOTOS_ROOT)) {
  throw new Error("data/closet-photos not found. Unzip closet-photos.zip first.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const localFiles = walkFiles(PHOTOS_ROOT);
const localByFilename = new Map();

for (const file of localFiles) {
  localByFilename.set(path.basename(file).toUpperCase(), file);
}

const { data: items, error: itemsError } = await supabase
  .from("wardrobe_items")
  .select("id, name, category, photo_filename")
  .eq("is_archived", false)
  .order("category", { ascending: true })
  .order("name", { ascending: true });

if (itemsError) throw itemsError;

const itemsWithPhotos = items.filter((item) => item.photo_filename);
const missing = [];
const uploaded = [];
const failed = [];

console.log("---- Closet photo upload ----");
console.log("Items from Supabase:", items.length);
console.log("Items with photo_filename:", itemsWithPhotos.length);
console.log("Local files:", localFiles.length);

for (const item of itemsWithPhotos) {
  const filename = item.photo_filename.trim();
  const localFile = localByFilename.get(filename.toUpperCase());

  if (!localFile) {
    missing.push({ item: item.name, photo_filename: filename });
    continue;
  }

  const safeFilename = sanitizeStorageName(filename);
  const storagePath = `${item.category}/${item.id}/${safeFilename}`;
  const fileBuffer = fs.readFileSync(localFile);
  const contentType = getContentType(filename);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    failed.push({
      item: item.name,
      photo_filename: filename,
      reason: uploadError.message,
    });
    continue;
  }

  const { error: deleteImageError } = await supabase
    .from("wardrobe_item_images")
    .delete()
    .eq("wardrobe_item_id", item.id)
    .eq("image_type", "main");

  if (deleteImageError) {
    failed.push({
      item: item.name,
      photo_filename: filename,
      reason: deleteImageError.message,
    });
    continue;
  }

  const { error: insertImageError } = await supabase
    .from("wardrobe_item_images")
    .insert({
      wardrobe_item_id: item.id,
      storage_bucket: BUCKET,
      image_path: storagePath,
      image_url: null,
      image_type: "main",
      alt_text: item.name,
      sort_order: 0,
      is_primary: true,
    });

  if (insertImageError) {
    failed.push({
      item: item.name,
      photo_filename: filename,
      reason: insertImageError.message,
    });
    continue;
  }

  uploaded.push({
    item: item.name,
    photo_filename: filename,
    storage_path: storagePath,
  });

  if (uploaded.length % 25 === 0) {
    console.log(`Uploaded ${uploaded.length}/${itemsWithPhotos.length}...`);
  }
}

console.log("");
console.log("---- Upload summary ----");
console.log("Uploaded:", uploaded.length);
console.log("Missing local files:", missing.length);
console.log("Failed:", failed.length);

if (missing.length) {
  console.log("");
  console.log("Missing:");
  console.table(missing.slice(0, 20));
}

if (failed.length) {
  console.log("");
  console.log("Failed:");
  console.table(failed.slice(0, 20));
}

fs.mkdirSync("data/photo-upload", { recursive: true });
fs.writeFileSync("data/photo-upload/uploaded.json", JSON.stringify(uploaded, null, 2));
fs.writeFileSync("data/photo-upload/missing.json", JSON.stringify(missing, null, 2));
fs.writeFileSync("data/photo-upload/failed.json", JSON.stringify(failed, null, 2));

if (failed.length || missing.length) {
  process.exit(1);
}

console.log("");
console.log("Photo upload complete.");
