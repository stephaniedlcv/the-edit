import type { PatternType, WishlistItem, WardrobeItem } from "@/types/wardrobe";
import { styleProfile as fallbackStyleProfile } from "@/lib/style-profile";

type SupabaseImageRow = {
  image_url?: string | null;
  image_path?: string | null;
  image_type?: string | null;
  is_primary?: boolean | null;
  sort_order?: number | null;
};

type WardrobeItemRow = {
  id: string;
  name: string;
  status: "owned";
  category: WardrobeItem["category"];
  item_status?: WardrobeItem["itemStatus"] | null;
  subcategory?: string | null;
  color_family: WardrobeItem["colorFamily"];
  color_name: string;
  pattern_type?: PatternType | null;
  pattern_subtype?: string | null;
  size?: string | null;
  brand?: string | null;
  source?: string | null;
  product_url?: string | null;
  paid_price?: number | null;
  purchase_source?: string | null;
  purchase_date?: string | null;
  notes?: string | null;
  styling_notes?: string | null;
  vibes?: WardrobeItem["vibes"] | null;
  love_score?: number | null;
  versatility_score?: number | null;
  fit_confidence_score?: number | null;
  capsule_value_score?: number | null;
  wardrobe_item_images?: SupabaseImageRow[] | null;
};

type WishlistItemRow = {
  id: string;
  name: string;
  status: "wishlist";
  category: WishlistItem["category"];
  subcategory?: string | null;
  color_family: WishlistItem["colorFamily"];
  color_name: string;
  pattern_type?: PatternType | null;
  pattern_subtype?: string | null;
  size?: string | null;
  brand?: string | null;
  source?: string | null;
  product_url?: string | null;
  vibes?: WishlistItem["vibes"] | null;
  decision: WishlistItem["decision"];
  priority_tier: WishlistItem["priorityTier"];
  purchase_order: number;
  duplicate_risk: WishlistItem["duplicateRisk"];
  closet_gap: WishlistItem["closetGap"];
  priority_score: number;
  outfit_potential: number;
  closet_impact_score: number;
  current_price?: number | null;
  target_price?: number | null;
  lowest_price?: number | null;
  price_watch?: boolean | null;
  notes?: string | null;
  wishlist_item_images?: SupabaseImageRow[] | null;
  price_history?: { observed_at: string; price: number }[] | null;
};

type StyleProfileRow = {
  display_name: string;
  style_system: string;
  palette_label: string;
  silhouette_label: string;
  location_label: string;
  aesthetic_summary?: string | null;
  measurements?: unknown;
  palette?: unknown;
  fit_rules?: unknown;
  shopping_rules?: unknown;
  climate_rules?: unknown;
  capsule_goals?: unknown;
  ai_rules?: unknown;
};

function primaryImage(images?: SupabaseImageRow[] | null) {
  if (!images?.length) {
    return {
      imageUrl: undefined,
      imagePath: undefined,
    };
  }

  const primary =
    images.find((image) => image.is_primary) ??
    [...images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];

  return {
    imageUrl: primary?.image_url ?? primary?.image_path ?? undefined,
    imagePath: primary?.image_path ?? undefined,
  };
}

export function mapWardrobeItem(row: WardrobeItemRow): WardrobeItem {
  const wardrobeImage = primaryImage(row.wardrobe_item_images);

  return {
    id: row.id,
    name: row.name,
    status: "owned",
    category: row.category,
    itemStatus: row.item_status ?? "active",
    subcategory: row.subcategory ?? undefined,
    colorFamily: row.color_family,
    colorName: row.color_name,
    patternType: row.pattern_type ?? undefined,
    patternSubtype: row.pattern_subtype ?? undefined,
    size: row.size ?? undefined,
    brand: row.brand ?? undefined,
    source: row.source ?? undefined,
    productUrl: row.product_url ?? undefined,
    paidPrice: row.paid_price ?? undefined,
    purchaseSource: row.purchase_source ?? undefined,
    purchaseDate: row.purchase_date ?? undefined,
    imageUrl: wardrobeImage.imageUrl,
    imagePath: wardrobeImage.imagePath,
    vibes: row.vibes ?? [],
    loveScore: row.love_score ?? undefined,
    versatilityScore: row.versatility_score ?? undefined,
    fitConfidenceScore: row.fit_confidence_score ?? undefined,
    capsuleValueScore: row.capsule_value_score ?? undefined,
    notes: row.notes ?? undefined,
    stylingNotes: row.styling_notes ?? row.notes ?? undefined,
  };
}

export function mapWishlistItem(row: WishlistItemRow): WishlistItem {
  const wishlistImage = primaryImage(row.wishlist_item_images);

  return {
    id: row.id,
    name: row.name,
    status: "wishlist",
    category: row.category,
    subcategory: row.subcategory ?? undefined,
    colorFamily: row.color_family,
    colorName: row.color_name,
    size: row.size ?? undefined,
    brand: row.brand ?? undefined,
    source: row.source ?? undefined,
    productUrl: row.product_url ?? undefined,
    imageUrl: wishlistImage.imageUrl,
    imagePath: wishlistImage.imagePath,
    vibes: row.vibes ?? [],
    decision: row.decision,
    priorityTier: row.priority_tier,
    purchaseOrder: row.purchase_order,
    duplicateRisk: row.duplicate_risk,
    closetGap: row.closet_gap,
    priorityScore: row.priority_score,
    outfitPotential: row.outfit_potential,
    closetImpactScore: row.closet_impact_score,
    currentPrice: row.current_price ?? undefined,
    targetPrice: row.target_price ?? undefined,
    lowestPrice: row.lowest_price ?? undefined,
    priceWatch: row.price_watch ?? false,
    priceHistory: row.price_history?.map((point) => ({
      date: point.observed_at,
      price: point.price,
    })),
    notes: row.notes ?? undefined,
  };
}

export function mapStyleProfile(row: StyleProfileRow) {
  return {
    identity: {
      name: row.display_name,
      styleSystem: row.style_system,
      palette: row.palette_label,
      silhouette: row.silhouette_label,
      location: row.location_label,
      aesthetic:
        row.aesthetic_summary ?? fallbackStyleProfile.identity.aesthetic,
    },
    measurements:
      (row.measurements as typeof fallbackStyleProfile.measurements) ??
      fallbackStyleProfile.measurements,
    palette:
      (row.palette as typeof fallbackStyleProfile.palette) ??
      fallbackStyleProfile.palette,
    fitRules:
      (row.fit_rules as typeof fallbackStyleProfile.fitRules) ??
      fallbackStyleProfile.fitRules,
    shoppingRules:
      (row.shopping_rules as typeof fallbackStyleProfile.shoppingRules) ??
      fallbackStyleProfile.shoppingRules,
    climateRules:
      (row.climate_rules as typeof fallbackStyleProfile.climateRules) ??
      fallbackStyleProfile.climateRules,
    capsuleGoals:
      (row.capsule_goals as typeof fallbackStyleProfile.capsuleGoals) ??
      fallbackStyleProfile.capsuleGoals,
    aiRules:
      (row.ai_rules as typeof fallbackStyleProfile.aiRules) ??
      fallbackStyleProfile.aiRules,
  };
}
