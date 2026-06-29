import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
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

type SavedOutfitRow = {
  id: string;
  title: string;
  status: string;
  source: string;
  source_outfit_id: string | null;
  occasion: string | null;
  formula: string | null;
  decision: string | null;
  generated_piece_ids: string[] | null;
  edited_piece_ids: string[] | null;
  selected_pieces: unknown;
  scores: Record<string, unknown> | null;
  styling_instruction: string | null;
  why_it_works: string[] | null;
  notes: string | null;
  worn_at: string | null;
  created_at: string;
  updated_at: string;
};

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
      colorFamily:
        typeof piece.colorFamily === "string" ? piece.colorFamily : undefined,
      colorName: typeof piece.colorName === "string" ? piece.colorName : undefined,
      imagePath: typeof piece.imagePath === "string" ? piece.imagePath : null,
      imageUrl: typeof piece.imageUrl === "string" ? piece.imageUrl : null,
    }));
}

async function attachSignedPieceImageUrls(
  pieces: SavedOutfitPiece[],
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
) {
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

      return {
        ...piece,
        imageUrl: data.signedUrl,
      };
    }),
  );
}

function mapSavedOutfitRow(
  row: SavedOutfitRow,
  selectedPieces: SavedOutfitPiece[],
): SavedOutfit {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    source: row.source,
    sourceOutfitId: row.source_outfit_id,
    occasion: row.occasion,
    formula: row.formula,
    decision: row.decision,
    generatedPieceIds: row.generated_piece_ids ?? [],
    editedPieceIds: row.edited_piece_ids ?? [],
    selectedPieces,
    scores: row.scores ?? {},
    stylingInstruction: row.styling_instruction,
    whyItWorks: row.why_it_works ?? [],
    notes: row.notes,
    wornAt: row.worn_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getSavedOutfits() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return {
      outfits: [] as SavedOutfit[],
      error: "Supabase is not configured.",
    };
  }

  const { data, error } = await supabase
    .from("saved_outfits")
    .select("*")
    .neq("status", "deleted")
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) {
    return {
      outfits: [] as SavedOutfit[],
      error: error.message,
    };
  }

  const outfits = await Promise.all(
    ((data ?? []) as SavedOutfitRow[]).map(async (row) => {
      const pieces = normalizeSavedPieces(row.selected_pieces);
      const signedPieces = await attachSignedPieceImageUrls(pieces, supabase);

      return mapSavedOutfitRow(row, signedPieces);
    }),
  );

  return {
    outfits,
    error: null,
  };
}
