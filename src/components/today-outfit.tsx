import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { composeOutfits } from "@/lib/style-profile/outfit-composer";
import type { WardrobeItem } from "@/types/wardrobe";

const COLOR_SWATCH: Record<string, string> = {
  black:     "#1C1412",
  brown:     "#7D4E2D",
  cream:     "#EDE6DA",
  beige:     "#D1B899",
  white:     "#F5F0E8",
  burgundy:  "#6B2737",
  olive:     "#6D7A45",
  camel:     "#C08B4C",
  plum:      "#5D3A5E",
  mustard:   "#C49A2C",
  denim:     "#4A6FA5",
  blue:      "#4A6FA5",
  pink:      "#D4909A",
  gray:      "#9A8F85",
  orange:    "#C96A3A",
  metallic:  "#B8A870",
  multicolor:"#8B5E3C",
  statement: "#A1223F",
};

const COLLAGE_POSITIONS = [
  { top: "4%",  left: "3%",  width: "46%", height: "32%", rotate: -3 },
  { top: "7%",  left: "52%", width: "41%", height: "27%", rotate:  2 },
  { top: "44%", left: "4%",  width: "44%", height: "29%", rotate: -2 },
  { top: "57%", left: "52%", width: "37%", height: "25%", rotate:  3 },
  { top: "76%", left: "19%", width: "34%", height: "18%", rotate: -1 },
];

type PieceData = {
  id: string;
  name: string;
  slot: string;
  color: string;
  imageUrl?: string | null;
  x: string | null;
  y: string | null;
  w: string | null;
  r: string | null;
};

type OutfitData = {
  source: "planner" | "saved" | "ai" | "mock";
  title: string;
  caption: string | null;
  formula: string[];
  notes: string | null;
  status?: "planned" | "worn" | "skipped";
  pieces: PieceData[];
};

function getTodayLocalDate(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function buildAiOutfit(items: WardrobeItem[]): OutfitData | null {
  if (items.length === 0) return null;

  const composed = composeOutfits(items, { occasion: "work", maxLooks: 5 });
  const best =
    composed.find((o) => o.decision === "approved") ?? composed[0];
  if (!best) return null;

  const pieceItems = best.pieceIds
    .map((id) => items.find((i) => i.id === id))
    .filter((i): i is WardrobeItem => !!i)
    .slice(0, 5);

  return {
    source: "ai",
    title: best.title,
    caption: best.stylingInstruction || null,
    formula: best.formula
      ? best.formula.split(/[+·,]/).map((s) => s.trim()).filter(Boolean)
      : pieceItems.map((p) => p.name),
    notes: best.whyItWorks?.[0] ?? null,
    pieces: pieceItems.map((item) => ({
      id: item.id,
      name: item.name,
      slot: item.category,
      color: COLOR_SWATCH[item.colorFamily] ?? "#EDE6DA",
      imageUrl: item.imageUrl ?? null,
      x: null,
      y: null,
      w: null,
      r: null,
    })),
  };
}

async function getTodayOutfit(items: WardrobeItem[]): Promise<OutfitData> {
  const supabase = getSupabaseServerClient();
  const today = getTodayLocalDate();

  if (supabase) {
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

      const rawPieces = formula?.outfit_formula_items ?? [];
      const pieces: PieceData[] = rawPieces.map((item) => {
        const wardrobeItem = items.find(
          (wi) => wi.id === item.wardrobe_items?.id,
        );
        return {
          id: item.id,
          name: item.wardrobe_items?.name ?? item.slot,
          slot: item.slot,
          color: wardrobeItem
            ? (COLOR_SWATCH[wardrobeItem.colorFamily] ?? "#EDE6DA")
            : "#EDE6DA",
          imageUrl: wardrobeItem?.imageUrl ?? null,
          x: item.x_position,
          y: item.y_position,
          w: item.width_value,
          r: item.rotate_value,
        };
      });

      return {
        source: "planner",
        title: logEntry.title,
        caption: logEntry.context ?? logEntry.outfit_need,
        formula: pieces.length > 0 ? pieces.map((p) => p.name) : [logEntry.title],
        notes: logEntry.notes,
        status: logEntry.status as "planned" | "worn" | "skipped",
        pieces,
      };
    }

    const { data: savedOutfit } = await supabase
      .from("saved_outfits")
      .select("id, title, formula, styling_instruction, why_it_works, selected_pieces, worn_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (savedOutfit) {
      type SP = { name?: string; slot?: string; color_family?: string; image_url?: string };
      const rawPieces: SP[] = Array.isArray(savedOutfit.selected_pieces)
        ? (savedOutfit.selected_pieces as SP[])
        : [];
      const formulaItems: string[] = savedOutfit.formula
        ? savedOutfit.formula.split(",").map((s: string) => s.trim()).filter(Boolean)
        : rawPieces.map((p) => p.name ?? p.slot ?? "Piece");

      const pieces: PieceData[] = rawPieces.slice(0, 5).map((p, i) => ({
        id: `saved-${i}`,
        name: p.name ?? p.slot ?? "Piece",
        slot: p.slot ?? "piece",
        color: COLOR_SWATCH[p.color_family ?? ""] ?? "#EDE6DA",
        imageUrl: p.image_url ?? null,
        x: null,
        y: null,
        w: null,
        r: null,
      }));

      return {
        source: "saved",
        title: savedOutfit.title,
        caption: savedOutfit.styling_instruction ?? null,
        formula: formulaItems,
        notes: (savedOutfit.why_it_works as string[] | null)?.[0] ?? null,
        pieces,
      };
    }
  }

  // AI fallback from wardrobe items
  const aiOutfit = buildAiOutfit(items);
  if (aiOutfit) return aiOutfit;

  // Final mock fallback
  return {
    source: "mock",
    title: "Open Blazer Vest Office Formula",
    caption: "Structured yet breathable — the go-to formula for the PR office.",
    formula: ["Blazer vest", "Cream top", "Wide-leg trousers", "Loafers", "Structured bag"],
    notes: "This formula works because it defines the waist without adding heat.",
    pieces: [
      { id: "m1", name: "Warm Brown Blazer Vest", slot: "outerwear", color: "#7D4E2D", imageUrl: null, x: null, y: null, w: null, r: null },
      { id: "m2", name: "Cream Top",               slot: "top",       color: "#EDE6DA", imageUrl: null, x: null, y: null, w: null, r: null },
      { id: "m3", name: "Brown Wide-leg Pants",    slot: "bottom",    color: "#9B7355", imageUrl: null, x: null, y: null, w: null, r: null },
      { id: "m4", name: "Dark Brown Loafers",      slot: "shoes",     color: "#4A2E18", imageUrl: null, x: null, y: null, w: null, r: null },
      { id: "m5", name: "Structured Bag",           slot: "bag",       color: "#6B4C30", imageUrl: null, x: null, y: null, w: null, r: null },
    ],
  };
}

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  planned: { label: "Planned for today", color: "text-[#3E6B96]" },
  worn:    { label: "Worn today ✓",       color: "text-[#5A8A5A]" },
};

const SOURCE_BADGE: Record<string, string> = {
  planner: "Today's look",
  saved:   "Latest saved look",
  ai:      "AI Pick",
  mock:    "Example look",
};

const SOURCE_NOTE: Record<string, string> = {
  planner: "From your planner — logged for today.",
  saved:   "Most recent saved outfit. Nothing planned for today yet.",
  ai:      "Generated from your closet — plan a look in the Planner to pin it here.",
  mock:    "Example look — add pieces to your closet to see real suggestions.",
};

function getTextColorForBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#241A12" : "#FAF8F5";
}

export async function TodayOutfit({ items }: { items: WardrobeItem[] }) {
  const outfit = await getTodayOutfit(items);
  const hasPositioning = outfit.pieces.some((p) => p.x && p.y);
  const usePositioned = hasPositioning;

  return (
    <div className="overflow-hidden rounded-[2px] bg-[var(--paper-2)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(36,26,18,0.05),0_16px_44px_rgba(36,26,18,0.08)]">
      <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">

        {/* Visual collage */}
        <div
          className="relative min-h-[22rem] overflow-hidden border-b border-[var(--line)] md:border-b-0 md:border-r md:min-h-[26rem]"
          style={{ background: "linear-gradient(170deg, #F4EEE4 0%, #EDE6DA 70%, #E6DDCE 100%)" }}
        >
          {/* Badge */}
          <div className="absolute right-4 top-4 z-10 rounded-full bg-[rgba(255,255,255,0.88)] px-3 py-1.5 text-[0.5rem] font-semibold uppercase tracking-[0.2em] text-[var(--gold)] shadow-[0_4px_16px_rgba(36,26,18,0.12)] backdrop-blur-sm border border-[rgba(36,26,18,0.08)]">
            {SOURCE_BADGE[outfit.source]}
          </div>

          {outfit.pieces.length > 0 ? (
            usePositioned ? (
              /* DB-positioned pieces */
              outfit.pieces.slice(0, 5).map((piece) => (
                <div
                  key={piece.id}
                  className="absolute overflow-hidden rounded-[18px] shadow-[0_12px_32px_rgba(36,26,18,0.14)]"
                  style={{
                    top: piece.y ?? "20%",
                    left: piece.x ?? "10%",
                    width: piece.w ?? "40%",
                    transform: `rotate(${piece.r ?? 0}deg)`,
                    aspectRatio: "3/4",
                    backgroundColor: piece.color,
                  }}
                >
                  {piece.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={piece.imageUrl}
                      alt={piece.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-end p-3">
                      <span
                        className="font-display text-[0.8rem] leading-tight"
                        style={{ color: getTextColorForBg(piece.color) }}
                      >
                        {piece.name}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              /* Scattered collage with fixed positions */
              outfit.pieces.slice(0, 5).map((piece, idx) => {
                const pos = COLLAGE_POSITIONS[idx] ?? COLLAGE_POSITIONS[0];
                return (
                  <div
                    key={piece.id}
                    className="absolute overflow-hidden rounded-[18px] shadow-[0_12px_32px_rgba(36,26,18,0.14)]"
                    style={{
                      top: pos.top,
                      left: pos.left,
                      width: pos.width,
                      height: pos.height,
                      transform: `rotate(${pos.rotate}deg)`,
                      backgroundColor: piece.color,
                    }}
                  >
                    {piece.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={piece.imageUrl}
                        alt={piece.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-end p-3">
                        <span
                          className="font-display text-[0.78rem] leading-tight"
                          style={{ color: getTextColorForBg(piece.color) }}
                        >
                          {piece.name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )
          ) : (
            /* Empty state */
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
          <div className="mb-4 flex items-start justify-between gap-2">
            <p className="eyebrow">Outfit of today</p>
            {outfit.status && STATUS_STYLE[outfit.status] && (
              <span className={`text-[0.52rem] font-semibold uppercase tracking-[0.18em] ${STATUS_STYLE[outfit.status].color}`}>
                {STATUS_STYLE[outfit.status].label}
              </span>
            )}
          </div>

          <h2 className="font-display text-[2.1rem] leading-[1.02] text-[var(--espresso)]">
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

          <p className="mt-4 text-[0.72rem] leading-[1.7] text-[var(--ink-soft)]">
            {SOURCE_NOTE[outfit.source]}
          </p>

          <div className="mt-6 flex flex-wrap gap-6 border-t border-[var(--line)] pt-5">
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
