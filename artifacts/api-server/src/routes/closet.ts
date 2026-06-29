import { Router } from "express";
import multer from "multer";
import { getSupabaseServerClient } from "../lib/supabase";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const allowedItemStatuses = ["active", "archived", "donated", "sold", "damaged"] as const;

function normalizeItemStatus(value?: string | null) {
  if (!value) return "active";
  return allowedItemStatuses.includes(value as (typeof allowedItemStatuses)[number]) ? value : "active";
}

function normalizePaidPrice(value?: number | null) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) return undefined;
  return Number(value.toFixed(2));
}

function normalizeOptionalText(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function normalizeProductUrl(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("www.")) return `https://${trimmed}`;
  return trimmed;
}

function normalizeScore(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(10, Math.round(value)));
}

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

router.post("/items", async (req, res) => {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase is not configured." });
    return;
  }

  const body = req.body;
  const name = body.name?.trim();
  const category = body.category;
  const colorFamily = body.colorFamily;
  const colorName = body.colorName?.trim();
  const normalizedPaidPrice = normalizePaidPrice(body.paidPrice);

  if (!name || !category || !colorFamily || !colorName) {
    res.status(400).json({ ok: false, error: "Missing required closet item fields." });
    return;
  }

  if (normalizedPaidPrice === undefined) {
    res.status(400).json({ ok: false, error: "Paid price must be a positive number." });
    return;
  }

  const { data, error } = await supabase
    .from("wardrobe_items")
    .insert({
      name,
      status: "owned",
      category,
      item_status: normalizeItemStatus(body.itemStatus),
      subcategory: body.subcategory?.trim() || null,
      color_family: colorFamily,
      color_name: colorName,
      pattern_type: body.patternType || null,
      pattern_subtype: body.patternSubtype?.trim() || null,
      size: body.size?.trim() || null,
      brand: body.brand?.trim() || null,
      product_url: normalizeProductUrl(body.productUrl),
      paid_price: normalizedPaidPrice,
      purchase_source: normalizeOptionalText(body.purchaseSource),
      purchase_date: normalizeOptionalText(body.purchaseDate),
      notes: body.notes?.trim() || null,
      styling_notes: body.stylingNotes?.trim() || null,
      vibes: Array.isArray(body.vibes) ? body.vibes : [],
      love_score: normalizeScore(body.loveScore),
      versatility_score: normalizeScore(body.versatilityScore),
      fit_confidence_score: normalizeScore(body.fitConfidenceScore),
      capsule_value_score: normalizeScore(body.capsuleValueScore),
    })
    .select("id")
    .single();

  if (error) {
    res.status(500).json({ ok: false, error: error.message });
    return;
  }

  res.json({ ok: true, id: data.id });
});

router.patch("/items/:id", async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase is not configured." });
    return;
  }

  const body = req.body;
  const name = body.name?.trim();
  const category = body.category;
  const colorFamily = body.colorFamily;
  const colorName = body.colorName?.trim();

  if (!id || !name || !category || !colorFamily || !colorName) {
    res.status(400).json({ ok: false, error: "Missing required closet item fields." });
    return;
  }

  const { data, error } = await supabase
    .from("wardrobe_items")
    .update({
      name,
      category,
      item_status: normalizeItemStatus(body.itemStatus),
      subcategory: body.subcategory?.trim() || null,
      color_family: colorFamily,
      color_name: colorName,
      pattern_type: body.patternType || null,
      pattern_subtype: body.patternSubtype?.trim() || null,
      size: body.size?.trim() || null,
      brand: body.brand?.trim() || null,
      product_url: normalizeProductUrl(body.productUrl),
      paid_price: normalizePaidPrice(body.paidPrice),
      purchase_source: normalizeOptionalText(body.purchaseSource),
      purchase_date: normalizeOptionalText(body.purchaseDate),
      notes: body.notes?.trim() || null,
      styling_notes: body.stylingNotes?.trim() || null,
      vibes: Array.isArray(body.vibes) ? body.vibes : [],
      love_score: normalizeScore(body.loveScore),
      versatility_score: normalizeScore(body.versatilityScore),
      fit_confidence_score: normalizeScore(body.fitConfidenceScore),
      capsule_value_score: normalizeScore(body.capsuleValueScore),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    res.status(500).json({ ok: false, error: error.message });
    return;
  }

  if (!data?.id) {
    res.status(404).json({ ok: false, error: "Closet item was not updated." });
    return;
  }

  res.json({ ok: true, id: data.id });
});

router.post("/items/:id/image", upload.single("file"), async (req, res) => {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase is not configured." });
    return;
  }

  const { id } = req.params;

  if (!id) {
    res.status(400).json({ ok: false, error: "Missing closet item id." });
    return;
  }

  const file = req.file;

  if (!file) {
    res.status(400).json({ ok: false, error: "Missing image file." });
    return;
  }

  if (!file.mimetype.startsWith("image/")) {
    res.status(400).json({ ok: false, error: "File must be an image." });
    return;
  }

  const BUCKET_NAME = "closet-items";
  const safeFileName = sanitizeFileName(file.originalname || "closet-photo.jpg");
  const imagePath = `${id}/main/${Date.now()}-${safeFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(imagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    res.status(500).json({ ok: false, error: uploadError.message });
    return;
  }

  const { error: clearPrimaryError } = await supabase
    .from("wardrobe_item_images")
    .update({ is_primary: false })
    .eq("wardrobe_item_id", id);

  if (clearPrimaryError) {
    res.status(500).json({ ok: false, error: clearPrimaryError.message });
    return;
  }

  const { error: insertError } = await supabase.from("wardrobe_item_images").insert({
    wardrobe_item_id: id,
    storage_bucket: BUCKET_NAME,
    image_path: imagePath,
    image_url: null,
    image_type: "main",
    alt_text: file.originalname,
    sort_order: 0,
    is_primary: true,
  });

  if (insertError) {
    res.status(500).json({ ok: false, error: insertError.message });
    return;
  }

  const { data: signedData, error: signedError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(imagePath, 60 * 60);

  if (signedError || !signedData?.signedUrl) {
    res.status(500).json({ ok: false, error: signedError?.message ?? "Could not create signed URL." });
    return;
  }

  res.json({ ok: true, imagePath, imageUrl: signedData.signedUrl });
});

export default router;
