import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ColorFamily,
  StyleVibe,
  WardrobeCategory,
  WishlistDecision,
  WishlistPriorityTier,
  ClosetGap,
} from "@/types/wardrobe";

const ALLOWED_DECISIONS: WishlistDecision[] = [
  "wishlist",
  "consider",
  "skip",
  "buy-priority",
];

const ALLOWED_TIERS: WishlistPriorityTier[] = [
  "foundation-buys",
  "color-builders",
  "statement-review",
];

const ALLOWED_GAPS: ClosetGap[] = [
  "color",
  "silhouette",
  "shoes",
  "accessory",
  "workwear",
  "statement",
  "tropical",
];

const ALLOWED_RISKS = ["low", "medium", "high"] as const;

function clampScore(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 5;
  return Math.max(0, Math.min(10, Math.round(value)));
}

function normalizeUrl(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("www.")) return `https://${trimmed}`;
  return trimmed;
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();

  let body: {
    name?: string;
    category?: WardrobeCategory;
    colorFamily?: ColorFamily;
    colorName?: string;
    subcategory?: string;
    size?: string;
    brand?: string;
    productUrl?: string;
    currentPrice?: number | null;
    targetPrice?: number | null;
    notes?: string;
    decision?: WishlistDecision;
    priorityTier?: WishlistPriorityTier;
    closetGap?: ClosetGap;
    duplicateRisk?: "low" | "medium" | "high";
    priorityScore?: number;
    outfitPotential?: number;
    closetImpactScore?: number;
    vibes?: StyleVibe[];
    priceWatch?: boolean;
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

  if (!name || !category || !colorFamily || !colorName) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing required fields: name, category, colorFamily, colorName.",
      },
      { status: 400 },
    );
  }

  const decision: WishlistDecision =
    body.decision && ALLOWED_DECISIONS.includes(body.decision)
      ? body.decision
      : "wishlist";

  const priorityTier: WishlistPriorityTier =
    body.priorityTier && ALLOWED_TIERS.includes(body.priorityTier)
      ? body.priorityTier
      : "foundation-buys";

  const closetGap: ClosetGap =
    body.closetGap && ALLOWED_GAPS.includes(body.closetGap)
      ? body.closetGap
      : "accessory";

  const duplicateRisk =
    body.duplicateRisk && ALLOWED_RISKS.includes(body.duplicateRisk)
      ? body.duplicateRisk
      : ("low" as const);

  const priorityScore = clampScore(body.priorityScore);
  const outfitPotential = clampScore(body.outfitPotential);
  const closetImpactScore = clampScore(body.closetImpactScore);

  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Wishlist service is not available. Please try again later." },
      { status: 503 },
    );
  }

  const { data: maxRow } = await supabase
    .from("wishlist_items")
    .select("purchase_order")
    .order("purchase_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const purchaseOrder = (maxRow?.purchase_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("wishlist_items")
    .insert({
      name,
      status: "wishlist",
      category,
      color_family: colorFamily,
      color_name: colorName,
      subcategory: body.subcategory?.trim() || null,
      size: body.size?.trim() || null,
      brand: body.brand?.trim() || null,
      product_url: normalizeUrl(body.productUrl),
      vibes: Array.isArray(body.vibes) ? body.vibes : [],
      decision,
      priority_tier: priorityTier,
      purchase_order: purchaseOrder,
      duplicate_risk: duplicateRisk,
      closet_gap: closetGap,
      priority_score: priorityScore,
      outfit_potential: outfitPotential,
      closet_impact_score: closetImpactScore,
      current_price:
        typeof body.currentPrice === "number" ? body.currentPrice : null,
      target_price:
        typeof body.targetPrice === "number" ? body.targetPrice : null,
      price_watch: body.priceWatch ?? false,
      notes: body.notes?.trim() || null,
      is_archived: false,
    })
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
      { ok: false, error: "Item was not created." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id: data.id });
}
