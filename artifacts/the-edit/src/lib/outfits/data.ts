import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { STYLE_OS_STORAGE_BUCKETS } from "@/lib/supabase/storage";

export type SavedOutfitPiece = {
  id?: string;
  name: string;
  category?: string;
  subcategory?: string | null;
  slotId?: string | null;
  slotLabel?: string | null;
  colorFamily?: string;
  colorName?: string;
  imagePath?: string | null;
  imageUrl?: string | null;
};

export type SavedOutfit = {
  id: string;
  title: string;
  status: string;
  source: string;
  sourceOutfitId: string | null;
  occasion: string | null;
  formula: string | null;
  decision: string | null;
  generatedPieceIds: string[];
  editedPieceIds: string[];
  selectedPieces: SavedOutfitPiece[];
  scores: Record<string, unknown>;
  stylingInstruction: string | null;
  whyItWorks: string[];
  notes: string | null;
  wornAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const mockSavedOutfits: SavedOutfit[] = [
  {
    id: "saved-mock-001",
    title: "Open Blazer Vest Office Formula",
    status: "saved",
    source: "generated",
    sourceOutfitId: "open-blazer-vest-office",
    occasion: "Work",
    formula: "Blazer vest + cream top + brown trousers + dark loafers",
    decision: "keep",
    generatedPieceIds: [],
    editedPieceIds: ["owned-004", "owned-007", "owned-012", "owned-022"],
    selectedPieces: [
      { name: "Warm Brown Blazer Vest", category: "outerwear", colorFamily: "brown", colorName: "Warm Brown" },
      { name: "Cream Silk Blouse", category: "tops", colorFamily: "cream", colorName: "Warm Cream" },
      { name: "Brown Wide-Leg Trousers", category: "bottoms", colorFamily: "brown", colorName: "Warm Brown" },
      { name: "Dark Brown Loafers", category: "shoes", colorFamily: "brown", colorName: "Dark Brown" },
    ],
    scores: { colorHarmony: 9, occasionFit: 9, silhouette: 8 },
    stylingInstruction: "Wear vest open to create a vertical line. Keep accessories minimal and warm-toned.",
    whyItWorks: [
      "Warm neutral story reads polished without trying too hard.",
      "Vest open creates a waist-defining vertical line.",
      "All brown tones work together as a Dark Autumn palette story.",
    ],
    notes: null,
    wornAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "saved-mock-002",
    title: "Friday Elevated Denim",
    status: "saved",
    source: "generated",
    sourceOutfitId: "elevated-denim-friday",
    occasion: "Casual Friday",
    formula: "Blazer + elevated top + dark denim + loafers",
    decision: "keep",
    generatedPieceIds: [],
    editedPieceIds: ["owned-001", "owned-009", "owned-018", "owned-022"],
    selectedPieces: [
      { name: "Black Blazer", category: "outerwear", colorFamily: "black", colorName: "Black" },
      { name: "Warm White Fitted Top", category: "tops", colorFamily: "white", colorName: "Warm White" },
      { name: "Dark Wash Straight Jeans", category: "bottoms", colorFamily: "navy", colorName: "Dark Indigo" },
      { name: "Dark Brown Loafers", category: "shoes", colorFamily: "brown", colorName: "Dark Brown" },
    ],
    scores: { colorHarmony: 8, occasionFit: 8, silhouette: 9 },
    stylingInstruction: "Keep the blazer open and the top tucked to define the waist.",
    whyItWorks: [
      "Dark denim grounds the black blazer without competing.",
      "Warm white top prevents the look from reading too harsh.",
    ],
    notes: null,
    wornAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function normalizeText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : fallback;
}

function normalizeTextArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
}

function normalizeSavedPieces(value: unknown): SavedOutfitPiece[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((piece): piece is Record<string, unknown> => {
      return Boolean(piece && typeof piece === "object");
    })
    .map((piece) => ({
      id: typeof piece.id === "string" ? piece.id : undefined,
      name: normalizeText(piece.name, "Unnamed piece"),
      category: typeof piece.category === "string" ? piece.category : undefined,
      subcategory: typeof piece.subcategory === "string" ? piece.subcategory : null,
      slotId: typeof piece.slotId === "string" ? piece.slotId : null,
      slotLabel: typeof piece.slotLabel === "string" ? piece.slotLabel : null,
      colorFamily: typeof piece.colorFamily === "string" ? piece.colorFamily : undefined,
      colorName: typeof piece.colorName === "string" ? piece.colorName : undefined,
      imagePath: typeof piece.imagePath === "string" ? piece.imagePath : null,
      imageUrl: typeof piece.imageUrl === "string" ? piece.imageUrl : null,
    }));
}

async function attachSignedPieceImageUrls(pieces: SavedOutfitPiece[]) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return pieces;

  return Promise.all(
    pieces.map(async (piece) => {
      if (!piece.imagePath) {
        return piece;
      }

      const { data, error } = await supabase.storage
        .from(STYLE_OS_STORAGE_BUCKETS.closetItems)
        .createSignedUrl(piece.imagePath, 60 * 60);

      if (error || !data?.signedUrl) {
        return piece;
      }

      return { ...piece, imageUrl: data.signedUrl };
    }),
  );
}

function mapSavedOutfitRow(row: Record<string, unknown>, selectedPieces: SavedOutfitPiece[]): SavedOutfit {
  return {
    id: String(row.id),
    title: normalizeText(row.title, "Saved outfit"),
    status: normalizeText(row.status, "saved"),
    source: normalizeText(row.source, "generated"),
    sourceOutfitId: typeof row.source_outfit_id === "string" ? row.source_outfit_id : null,
    occasion: typeof row.occasion === "string" ? row.occasion : null,
    formula: typeof row.formula === "string" ? row.formula : null,
    decision: typeof row.decision === "string" ? row.decision : null,
    generatedPieceIds: normalizeTextArray(row.generated_piece_ids),
    editedPieceIds: normalizeTextArray(row.edited_piece_ids),
    selectedPieces,
    scores: row.scores && typeof row.scores === "object" && !Array.isArray(row.scores)
      ? (row.scores as Record<string, unknown>)
      : {},
    stylingInstruction: typeof row.styling_instruction === "string" ? row.styling_instruction : null,
    whyItWorks: normalizeTextArray(row.why_it_works),
    notes: typeof row.notes === "string" ? row.notes : null,
    wornAt: typeof row.worn_at === "string" ? row.worn_at : null,
    createdAt: typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : new Date().toISOString(),
  };
}

export async function getSavedOutfits(): Promise<{
  outfits: SavedOutfit[];
  error: string | null;
}> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return { outfits: mockSavedOutfits, error: null };
  }

  const { data, error } = await supabase
    .from("saved_outfits")
    .select("*")
    .neq("status", "deleted")
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) {
    console.warn("Saved outfits: failed to load from Supabase, using mock data.", error.message);
    return { outfits: mockSavedOutfits, error: error.message };
  }

  if (!data || data.length === 0) {
    return { outfits: mockSavedOutfits, error: null };
  }

  const outfits = await Promise.all(
    (data as Record<string, unknown>[]).map(async (row) => {
      const pieces = normalizeSavedPieces(row.selected_pieces);
      const signedPieces = await attachSignedPieceImageUrls(pieces);
      return mapSavedOutfitRow(row, signedPieces);
    }),
  );

  return { outfits, error: null };
}
