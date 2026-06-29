import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ColorFamily,
  PatternType,
  StyleVibe,
  WardrobeCategory,
} from "@/types/wardrobe";

const allowedItemStatuses = [
  "active",
  "archived",
  "donated",
  "sold",
  "damaged",
] as const;

function normalizeItemStatus(value?: string | null) {
  if (!value) {
    return "active";
  }

  return allowedItemStatuses.includes(value as (typeof allowedItemStatuses)[number])
    ? value
    : "active";
}

function normalizePaidPrice(value?: number | null) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return undefined;
  }

  return Number(value.toFixed(2));
}

function normalizeOptionalText(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length ? trimmed : null;
}

function normalizeProductUrl(value?: string) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("www.")) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function normalizeScore(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  return Math.max(0, Math.min(10, Math.round(value)));
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase is not configured." },
      { status: 500 },
    );
  }

  let body: {
    name?: string;
    category?: WardrobeCategory;
    itemStatus?: string | null;
    subcategory?: string;
    colorFamily?: ColorFamily;
    colorName?: string;
    patternType?: PatternType;
    patternSubtype?: string;
    size?: string;
    brand?: string;
      productUrl?: string;
    paidPrice?: number | null;
    purchaseSource?: string | null;
    purchaseDate?: string | null;
    notes?: string;
    stylingNotes?: string;
    vibes?: StyleVibe[];
    loveScore?: number | null;
    versatilityScore?: number | null;
    fitConfidenceScore?: number | null;
    capsuleValueScore?: number | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const name = body.name?.trim();
  const category = body.category;
  const colorFamily = body.colorFamily;
  const colorName = body.colorName?.trim();

  if (!id || !name || !category || !colorFamily || !colorName) {
    return NextResponse.json(
      { ok: false, error: "Missing required closet item fields." },
      { status: 400 },
    );
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
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  if (!data?.id) {
    return NextResponse.json(
      { ok: false, error: "Closet item was not updated." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, id: data.id });
}
