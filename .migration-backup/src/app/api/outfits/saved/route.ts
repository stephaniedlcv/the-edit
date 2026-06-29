import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type SaveOutfitBody = {
  title?: string;
  status?: string;
  source?: string;
  sourceOutfitId?: string;
  occasion?: string;
  formula?: string;
  decision?: string;
  generatedPieceIds?: string[];
  editedPieceIds?: string[];
  selectedPieces?: unknown[];
  scores?: Record<string, unknown>;
  stylingInstruction?: string;
  whyItWorks?: string[];
  notes?: string;
};

function normalizeText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase is not configured." },
      { status: 500 },
    );
  }

  let body: SaveOutfitBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const title = normalizeText(body.title) ?? "Saved outfit";
  const status = normalizeText(body.status) ?? "saved";
  const source = normalizeText(body.source) ?? "generated";
  const sourceOutfitId = normalizeText(body.sourceOutfitId);
  const editedPieceIds = normalizeArray(body.editedPieceIds);
  const generatedPieceIds = normalizeArray(body.generatedPieceIds);

  if (editedPieceIds.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Saved outfit needs at least one piece." },
      { status: 400 },
    );
  }

  const savedOutfitPayload = {
    title,
    status,
    source,
    source_outfit_id: sourceOutfitId,
    occasion: normalizeText(body.occasion),
    formula: normalizeText(body.formula),
    decision: normalizeText(body.decision),
    generated_piece_ids: generatedPieceIds,
    edited_piece_ids: editedPieceIds,
    selected_pieces: Array.isArray(body.selectedPieces) ? body.selectedPieces : [],
    scores: body.scores ?? {},
    styling_instruction: normalizeText(body.stylingInstruction),
    why_it_works: normalizeArray(body.whyItWorks),
    notes: normalizeText(body.notes),
  };

  let existingId: string | null = null;

  if (sourceOutfitId) {
    const { data: existing, error: lookupError } = await supabase
      .from("saved_outfits")
      .select("id")
      .eq("source", source)
      .eq("source_outfit_id", sourceOutfitId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json(
        { ok: false, error: lookupError.message },
        { status: 500 },
      );
    }

    existingId = existing?.id ?? null;
  }

  const { data, error } = existingId
    ? await supabase
        .from("saved_outfits")
        .update(savedOutfitPayload)
        .eq("id", existingId)
        .select("id")
        .single()
    : await supabase
        .from("saved_outfits")
        .insert(savedOutfitPayload)
        .select("id")
        .single();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    id: data.id,
    action: existingId ? "updated" : "inserted",
  });
}


export async function DELETE(request: Request) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase is not configured." },
      { status: 500 },
    );
  }

  let body: { id?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const id = normalizeText(body.id);

  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Saved outfit id is required." },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("saved_outfits")
    .update({ status: "deleted" })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id, action: "deleted" });
}

export async function GET() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase is not configured." },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from("saved_outfits")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, outfits: data });
}
