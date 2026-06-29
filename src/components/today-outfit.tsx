import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { outfitLooks } from "@/lib/mock-outfits";

type PieceData = {
  id: string;
  name: string;
  slot: string;
  x: string | null;
  y: string | null;
  w: string | null;
  r: string | null;
};

type OutfitData = {
  source: "planner" | "saved" | "mock";
  title: string;
  caption: string | null;
  formula: string[];
  notes: string | null;
  status?: "planned" | "worn" | "skipped";
  pieces: PieceData[];
};

function getTodayLocalDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function getTodayOutfit(): Promise<OutfitData> {
  const supabase = getSupabaseServerClient();
  const today = getTodayLocalDate();

  if (supabase) {
    // 1. Check planner: today's log entry (planned or worn)
    const { data: logEntry } = await supabase
      .from("outfit_log_entries")
      .select(
        `id, title, context, notes, status, outfit_need,
         outfit_formulas (
           id, name,
           outfit_formula_items (
             id, slot,
             x_position, y_position, width_value, rotate_value,
             wardrobe_items ( id, name )
           )
         )`,
      )
      .eq("worn_date", today)
      .in("status", ["planned", "worn"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (logEntry) {
      const formula = logEntry.outfit_formulas as {
        id: string;
        name: string;
        outfit_formula_items: {
          id: string;
          slot: string;
          x_position: string | null;
          y_position: string | null;
          width_value: string | null;
          rotate_value: string | null;
          wardrobe_items: { id: string; name: string } | null;
        }[];
      } | null;

      const pieces: PieceData[] = formula?.outfit_formula_items?.map((item) => ({
        id: item.id,
        name: item.wardrobe_items?.name ?? item.slot,
        slot: item.slot,
        x: item.x_position,
        y: item.y_position,
        w: item.width_value,
        r: item.rotate_value,
      })) ?? [];

      return {
        source: "planner",
        title: logEntry.title,
        caption: logEntry.context ?? logEntry.outfit_need,
        formula: pieces.length > 0
          ? pieces.map((p) => p.name)
          : [logEntry.title],
        notes: logEntry.notes,
        status: logEntry.status as "planned" | "worn" | "skipped",
        pieces,
      };
    }

    // 2. Fall back to most recent saved outfit
    const { data: savedOutfit } = await supabase
      .from("saved_outfits")
      .select("id, title, formula, styling_instruction, why_it_works, selected_pieces, worn_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (savedOutfit) {
      type SelectedPiece = { name?: string; slot?: string };
      const pieces_raw: SelectedPiece[] =
        Array.isArray(savedOutfit.selected_pieces)
          ? (savedOutfit.selected_pieces as SelectedPiece[])
          : [];
      const formulaItems: string[] = savedOutfit.formula
        ? savedOutfit.formula.split(",").map((s: string) => s.trim())
        : pieces_raw.map((p) => p.name ?? p.slot ?? "Piece");

      return {
        source: "saved",
        title: savedOutfit.title,
        caption: savedOutfit.styling_instruction ?? null,
        formula: formulaItems,
        notes: (savedOutfit.why_it_works as string[] | null)?.[0] ?? null,
        pieces: [],
      };
    }
  }

  // 3. Mock fallback
  const mock = outfitLooks[0];
  return {
    source: "mock",
    title: mock.title,
    caption: mock.caption,
    formula: mock.formula,
    notes: mock.notes,
    pieces: mock.pieces.map((p) => ({
      id: p.id,
      name: p.name,
      slot: p.name,
      x: p.left,
      y: p.top,
      w: p.width,
      r: p.rotate ? String(p.rotate) : "0",
    })),
  };
}

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  planned: { label: "Planned for today", color: "text-[#3E6B96]" },
  worn:    { label: "Worn today ✓",       color: "text-[#5A8A5A]" },
};

export async function TodayOutfit() {
  const outfit = await getTodayOutfit();
  const hasPositioning = outfit.pieces.some((p) => p.x && p.y);
  const mockPieces = outfit.source === "mock" || hasPositioning;

  return (
    <div className="overflow-hidden rounded-[2px] bg-[var(--paper-2)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(36,26,18,0.05),0_16px_44px_rgba(36,26,18,0.08)]">
      <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
        {/* Visual collage */}
        <div
          className="relative min-h-[22rem] overflow-hidden border-b border-[var(--line)] md:border-b-0 md:border-r md:min-h-[26rem]"
          style={{
            background:
              "linear-gradient(170deg, #F4EEE4 0%, #EDE6DA 70%, #E6DDCE 100%)",
          }}
        >
          <div className="absolute right-4 top-4 rounded-full bg-[rgba(255,255,255,0.85)] px-3 py-1.5 text-[0.5rem] font-semibold uppercase tracking-[0.2em] text-[var(--gold)] shadow-[0_4px_16px_rgba(36,26,18,0.12)] backdrop-blur-sm border border-[rgba(36,26,18,0.08)]">
            {outfit.status === "worn" ? "Worn today ✓" : "Today's look"}
          </div>

          {mockPieces && outfit.pieces.length > 0 ? (
            outfit.pieces.slice(0, 5).map((piece) => (
              <div
                key={piece.id}
                className="absolute rounded-[22px] bg-[rgba(255,255,255,0.7)] shadow-[0_16px_36px_rgba(36,26,18,0.12)]"
                style={{
                  top: piece.y ?? "20%",
                  left: piece.x ?? "10%",
                  width: piece.w ?? "40%",
                  height: "auto",
                  minHeight: "4rem",
                  transform: `rotate(${piece.r ?? 0}deg)`,
                }}
              >
                <div className="absolute inset-3 rounded-[16px] border border-[rgba(36,26,18,0.08)]" />
                <div className="flex h-full min-h-[4rem] items-center justify-center px-4 py-3 text-center">
                  <span className="font-display text-[0.95rem] leading-tight text-[var(--coffee)]">
                    {piece.name}
                  </span>
                </div>
              </div>
            ))
          ) : outfit.pieces.length > 0 ? (
            /* Grid layout for pieces without positioning data */
            <div className="absolute inset-4 flex flex-wrap content-center items-center justify-center gap-3">
              {outfit.pieces.slice(0, 5).map((piece, i) => (
                <div
                  key={piece.id}
                  className="rounded-[18px] bg-[rgba(255,255,255,0.75)] px-4 py-3 shadow-[0_8px_24px_rgba(36,26,18,0.10)]"
                  style={{ transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)` }}
                >
                  <span className="font-display text-[0.9rem] text-[var(--coffee)]">
                    {piece.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            /* No pieces — empty/CTA state */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="font-display text-[1.15rem] italic leading-[1.4] text-[var(--coffee)]">
                No look planned for today.
              </p>
              <Link
                href="/planner"
                className="rounded-full bg-[var(--espresso)] px-5 py-2.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[var(--paper)]"
              >
                Plan today →
              </Link>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="px-6 py-7">
          <div className="flex items-start justify-between gap-2 mb-4">
            <p className="eyebrow">Outfit of today</p>
            {outfit.status && STATUS_STYLE[outfit.status] && (
              <span
                className={`text-[0.52rem] font-semibold uppercase tracking-[0.18em] ${STATUS_STYLE[outfit.status].color}`}
              >
                {STATUS_STYLE[outfit.status].label}
              </span>
            )}
          </div>

          <h2 className="font-display text-[2.4rem] leading-[1.02] text-[var(--espresso)]">
            {outfit.title}
          </h2>

          {outfit.caption && (
            <p className="mt-4 text-[0.9rem] leading-[1.8] text-[var(--ink-soft)]">
              {outfit.caption}
            </p>
          )}

          {outfit.formula.length > 0 && (
            <div className="mt-6 border-y border-[var(--line)] py-4">
              <p className="eyebrow mb-3">Formula</p>
              <div className="flex flex-wrap gap-2">
                {outfit.formula.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-[0.56rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {outfit.notes && (
            <p className="font-display mt-5 text-[1.02rem] italic leading-[1.55] text-[var(--coffee)]">
              {outfit.notes}
            </p>
          )}

          {/* Source hint */}
          {outfit.source === "planner" && (
            <p className="mt-3 text-[0.72rem] text-[var(--ink-soft)]">
              From your planner — logged for today.
            </p>
          )}
          {outfit.source === "saved" && (
            <p className="mt-3 text-[0.72rem] text-[var(--ink-soft)]">
              Most recent saved outfit — nothing logged for today yet.
            </p>
          )}
          {outfit.source === "mock" && (
            <p className="mt-3 text-[0.72rem] text-[var(--ink-soft)]">
              Example look — log an outfit in your planner to see it here.
            </p>
          )}

          <div className="mt-7 flex flex-wrap gap-6 border-t border-[var(--line)] pt-5">
            <Link
              href="/outfits"
              className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[var(--espresso)] underline-offset-4 hover:underline"
            >
              Open board
            </Link>
            <Link
              href="/planner"
              className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[var(--gold)] underline-offset-4 hover:underline"
            >
              {outfit.status === "worn" ? "View planner" : "Plan / log outfit"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
