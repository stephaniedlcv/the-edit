export type WardrobeStatus = "owned" | "wishlist";

export type WardrobeItemStatus =
  | "active"
  | "archived"
  | "donated"
  | "sold"
  | "damaged";

export type WardrobeCategory =
  | "top"
  | "bottom"
  | "dress"
  | "outerwear"
  | "shoes"
  | "bag"
  | "accessory"
  | "jewelry";

export type ColorFamily =
  | "black"
  | "brown"
  | "cream"
  | "beige"
  | "white"
  | "burgundy"
  | "olive"
  | "camel"
  | "plum"
  | "mustard"
  | "denim"
  | "blue"
  | "pink"
  | "gray"
  | "orange"
  | "metallic"
  | "multicolor"
  | "statement";

export type PatternType =
  | "animal_print"
  | "floral"
  | "striped"
  | "polka_dot"
  | "plaid"
  | "geometric"
  | "abstract"
  | "mixed_print";

export type StyleVibe =
  | "classic"
  | "minimal"
  | "elevated"
  | "work"
  | "tropical"
  | "statement"
  | "casual";

export type PricePoint = {
  date: string;
  price: number;
};

export type WardrobeItem = {
  id: string;
  name: string;
  status: "owned";
  category: WardrobeCategory;
  itemStatus?: WardrobeItemStatus;
  subcategory?: string;
  colorFamily: ColorFamily;
  colorName: string;
  patternType?: PatternType;
  patternSubtype?: string;
  size?: string;
  brand?: string;
  source?: string;
  productUrl?: string;
  paidPrice?: number;
  purchaseSource?: string;
  purchaseDate?: string;
  imageUrl?: string;
  imagePath?: string;
  vibes: StyleVibe[];
  loveScore?: number;
  versatilityScore?: number;
  fitConfidenceScore?: number;
  capsuleValueScore?: number;
  notes?: string;
  stylingNotes?: string;
};

export type WishlistDecision =
  | "wishlist"
  | "consider"
  | "skip"
  | "buy-priority";

export type WishlistPriorityTier =
  | "foundation-buys"
  | "color-builders"
  | "statement-review";

export type ClosetGap =
  | "color"
  | "silhouette"
  | "shoes"
  | "accessory"
  | "workwear"
  | "statement"
  | "tropical";

export type WishlistItem = {
  id: string;
  name: string;
  status: "wishlist";
  category: WardrobeCategory;
  subcategory?: string;
  colorFamily: ColorFamily;
  colorName: string;
  size?: string;
  brand?: string;
  source?: string;
  productUrl?: string;
  imageUrl?: string;
  imagePath?: string;
  vibes: StyleVibe[];
  decision: WishlistDecision;
  priorityTier: WishlistPriorityTier;
  purchaseOrder: number;
  duplicateRisk: "low" | "medium" | "high";
  closetGap: ClosetGap;
  priorityScore: number;
  outfitPotential: number;
  closetImpactScore: number;
  currentPrice?: number;
  targetPrice?: number;
  lowestPrice?: number;
  priceWatch?: boolean;
  priceHistory?: PricePoint[];
  notes?: string;
};

export type OutfitFormula = {
  id: string;
  name: string;
  status: "tested" | "idea";
  occasion: "office" | "casual" | "weekend" | "dinner" | "tropical";
  vibe: StyleVibe[];
  pieces: string[];
  colorStory: string[];
  imageUrls?: string[];
  notes: string;
};
