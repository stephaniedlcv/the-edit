import { Router } from "express";
import { getSupabaseServerClient } from "../lib/supabase";

const router = Router();

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

router.get("/saved", async (_req, res) => {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase is not configured." });
    return;
  }

  const { data, error } = await supabase
    .from("saved_outfits")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    res.status(500).json({ ok: false, error: error.message });
    return;
  }

  res.json({ ok: true, outfits: data });
});

router.post("/saved", async (req, res) => {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase is not configured." });
    return;
  }

  const body = req.body;

  const title = normalizeText(body.title) ?? "Saved outfit";
  const status = normalizeText(body.status) ?? "saved";
  const source = normalizeText(body.source) ?? "generated";
  const sourceOutfitId = normalizeText(body.sourceOutfitId);
  const editedPieceIds = normalizeArray(body.editedPieceIds);
  const generatedPieceIds = normalizeArray(body.generatedPieceIds);

  if (editedPieceIds.length === 0) {
    res.status(400).json({ ok: false, error: "Saved outfit needs at least one piece." });
    return;
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
      res.status(500).json({ ok: false, error: lookupError.message });
      return;
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
    res.status(500).json({ ok: false, error: error.message });
    return;
  }

  res.json({ ok: true, id: data.id, action: existingId ? "updated" : "inserted" });
});

router.delete("/saved", async (req, res) => {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    res.status(500).json({ ok: false, error: "Supabase is not configured." });
    return;
  }

  const body = req.body;
  const id = normalizeText(body.id);

  if (!id) {
    res.status(400).json({ ok: false, error: "Saved outfit id is required." });
    return;
  }

  const { error } = await supabase
    .from("saved_outfits")
    .update({ status: "deleted" })
    .eq("id", id);

  if (error) {
    res.status(500).json({ ok: false, error: error.message });
    return;
  }

  res.json({ ok: true, id, action: "deleted" });
});

export default router;
