import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { composeOutfits } from "@/lib/style-profile/outfit-composer";
import { AtelierPlaceholder } from "@/components/atelier-placeholder";
import type { WardrobeItem } from "@/types/wardrobe";

// Same positions as GeneratedOutfitVisual — proven to look great
const visualPositions = [
  { left: "7%",  top: "8%",  width: "31%", rotate: "-4deg" },
  { left: "37%", top: "7%",  width: "28%", rotate: "3deg"  },
  { left: "61%", top: "18%", width: "29%", rotate: "-2deg" },
  { left: "15%", top: "50%", width: "24%", rotate: "4deg"  },
  { left: "43%", top: "55%", width: "22%", rotate: "-3deg" },
  { left: "66%", top: "58%", width: "20%", rotate: "5deg"  },
];

function OutfitPieceVisual({
  item,
  index,
}: {
  item: WardrobeItem;
  index: number;
}) {
  const pos = visualPositions[index % visualPositions.length];
  const style = {
    left: pos.left,
    top: pos.top,
    width: pos.width,
    transform: `rotate(${pos.rotate})`,
    zIndex: index + 1,
  };

  if (item.imageUrl) {
    return (
      <div
        className="absolute aspect-[3/4] rounded-[5px] bg-contain bg-center bg-no-repeat drop-shadow-[0_18px_28px_rgba(74,47,34,0.18)]"
        style={{ ...style, backgroundImage: `url("${item.imageUrl}")` }}
        aria-label={item.name}
        title={item.name}
      />
    );
  }

  return (
    <div
      className="absolute aspect-[3/4] drop-shadow-[0_18px_28px_rgba(74,47,34,0.18)]"
      style={style}
      title={item.name}
    >
      <AtelierPlaceholder
        name={item.name}
        colorName={item.colorName}
        colorFamily={item.colorFamily}
        category={item.category}
        className="h-full"
        compact
        glass
      />
    </div>
  );
}

type OutfitData = {
  source: "planner" | "saved" | "ai" | "mock";
  title: string;
  caption: string | null;
  formula: string[];
  notes: string | null;
  status?: "planned" | "worn" | "skipped";
  visualItems: WardrobeItem[];
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
  const composed = composeOutfits(items, { occasion: "office", maxLooks: 5 });
  const best =
    composed.find((o) => o.decision === "approved") ?? composed[0];
  if (!best) return null;

  const pieceItems = best.pieceIds
    .map((id) => items.find((i) => i.id === id))
    .filter((i): i is WardrobeItem => !!i)
    .slice(0, 6);

  const formulaLabels = best.formula
    ? best.formula.split(/[+·,]/).map((s) => s.trim()).filter(Boolean)
    : pieceItems.map((p) => p.name);

  return {
    source: "ai",
    title: best.title,
    caption: best.stylingInstruction || null,
    formula: formulaLabels,
    notes: best.whyItWorks?.[0] ?? null,
    visualItems: pieceItems,
  };
}

const MOCK_VISUAL_ITEMS: WardrobeItem[] = [
  {
    id: "m1", name: "Warm Brown Blazer Vest", status: "owned",
    category: "outerwear", colorFamily: "brown", colorName: "Warm Brown",
    vibes: ["classic", "work", "elevated"],
  },
  {
    id: "m2", name: "Cream Linen Top", status: "owned",
    category: "top", colorFamily: "cream", colorName: "Warm Cream",
    vibes: ["minimal", "work"],
  },
  {
    id: "m3", name: "Brown Wide-leg Trousers", status: "owned",
    category: "bottom", colorFamily: "brown", colorName: "Chocolate",
    vibes: ["classic", "elevated"],
  },
  {
    id: "m4", name: "Dark Brown Loafers", status: "owned",
    category: "shoes", colorFamily: "brown", colorName: "Dark Espresso",
    vibes: ["classic", "work"],
  },
  {
    id: "m5", name: "Structured Tote", status: "owned",
    category: "bag", colorFamily: "camel", colorName: "Camel",
    vibes: ["classic", "elevated"],
  },
];

async function getTodayOutfit(items: WardrobeItem[]): Promise<OutfitData> {
  const supabase = getSupabaseServerClient();
  const today = getTodayLocalDate();

  if (supabase) {
    // 1. Check planner for today's log entry
    const { data: logEntry } = await supabase
      .from("outfit_log_entries")
      .select(
        `id, title, context, notes, status, outfit_need,
         outfit_formulas (
           id, name,
           outfit_formula_items (
             id, slot,
             wardrobe_items ( id, name, category, color_family, color_name, image_url, image_path )
           )
         )`,
      )
      .eq("worn_date", today)
      .in("status", ["planned", "worn"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (logEntry) {
      type FormulaItem = {
        id: string;
        slot: string;
        wardrobe_items: {
          id: string; name: string; category: string;
          color_family: string; color_name: string;
          image_url: string | null; image_path: string | null;
        } | null;
      };
      type Formula = { id: string; name: string; outfit_formula_items: FormulaItem[] } | null;

      const formula = logEntry.outfit_formulas as unknown as Formula;
      const rawPieces = formula?.outfit_formula_items ?? [];

      const visualItems: WardrobeItem[] = rawPieces
        .filter((p) => p.wardrobe_items)
        .map((p) => {
          const wi = p.wardrobe_items!;
          const fromCloset = items.find((i) => i.id === wi.id);
          return (
            fromCloset ?? {
              id: wi.id,
              name: wi.name,
              status: "owned" as const,
              category: wi.category as WardrobeItem["category"],
              colorFamily: (wi.color_family ?? "brown") as WardrobeItem["colorFamily"],
              colorName: wi.color_name ?? "",
              imageUrl: wi.image_url ?? undefined,
              imagePath: wi.image_path ?? undefined,
              vibes: [] as WardrobeItem["vibes"],
            }
          );
        });

      const formulaLabels =
        formula?.name
          ? formula.name.split(/[+·,]/).map((s) => s.trim()).filter(Boolean)
          : visualItems.map((p) => p.name);

      return {
        source: "planner",
        title: logEntry.title,
        caption: logEntry.context ?? logEntry.outfit_need ?? null,
        formula: formulaLabels,
        notes: logEntry.notes ?? null,
        status: logEntry.status as "planned" | "worn" | "skipped",
        visualItems,
      };
    }

    // 2. Fall back to most recent saved outfit
    const { data: savedOutfit } = await supabase
      .from("saved_outfits")
      .select(
        "id, title, formula, styling_instruction, why_it_works, selected_pieces",
      )
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (savedOutfit) {
      // Field names match outfit-editor.tsx saveChanges() output exactly
      type SP = {
        id?: string;
        name?: string;
        category?: string;
        slotId?: string;
        slotLabel?: string;
        colorFamily?: string;
        colorName?: string;
        imagePath?: string | null;
        imageUrl?: string | null;
      };
      const rawPieces: SP[] = Array.isArray(savedOutfit.selected_pieces)
        ? (savedOutfit.selected_pieces as SP[])
        : [];

      const visualItems: WardrobeItem[] = rawPieces.slice(0, 6).map((p, i) => {
        // First: look up by wardrobe item id — gives us signed image URL
        const fromCloset = p.id ? items.find((wi) => wi.id === p.id) : undefined;
        if (fromCloset) return fromCloset;

        // Fallback: construct from saved JSON (no signed URL, but has imagePath)
        return {
          id: `saved-${i}`,
          name: p.name ?? p.slotLabel ?? "Piece",
          status: "owned" as const,
          category: (p.category ?? p.slotId ?? "accessory") as WardrobeItem["category"],
          colorFamily: (p.colorFamily ?? "brown") as WardrobeItem["colorFamily"],
          colorName: p.colorName ?? "",
          imagePath: p.imagePath ?? undefined,
          imageUrl: undefined,
          vibes: [] as WardrobeItem["vibes"],
        };
      });

      const formulaLabels = savedOutfit.formula
        ? savedOutfit.formula
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : visualItems.map((p) => p.name);

      return {
        source: "saved",
        title: savedOutfit.title,
        caption: savedOutfit.styling_instruction ?? null,
        formula: formulaLabels,
        notes:
          (savedOutfit.why_it_works as string[] | null)?.[0] ?? null,
        visualItems,
      };
    }
  }

  // 3. AI-generated from wardrobe items
  const aiOutfit = buildAiOutfit(items);
  if (aiOutfit) return aiOutfit;

  // 4. Final mock fallback
  return {
    source: "mock",
    title: "Blazer Vest Office Formula",
    caption:
      "Structured yet breathable — the go-to formula for the PR office.",
    formula: ["Blazer vest", "Cream top", "Wide-leg trousers", "Loafers", "Structured bag"],
    notes:
      "This formula defines the waist without adding heat — perfect for Puerto Rico.",
    visualItems: MOCK_VISUAL_ITEMS,
  };
}

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  planned: { label: "Planned for today", color: "text-[#3E6B96]" },
  worn:    { label: "Worn today ✓",      color: "text-[#5A8A5A]" },
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
  ai:      "Generated from your closet by the AI. Plan a look in the Planner to pin it here.",
  mock:    "Example look — add pieces to your closet to get real AI suggestions.",
};

export async function TodayOutfit({ items }: { items: WardrobeItem[] }) {
  const outfit = await getTodayOutfit(items);

  return (
    <div className="overflow-hidden rounded-[2px] bg-[var(--paper-2)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(36,26,18,0.05),0_16px_44px_rgba(36,26,18,0.08)]">
      <div className="grid gap-0 md:grid-cols-[1fr_1fr]">

        {/* ── Visual collage — same premium style as Outfits page ── */}
        <div
          className="relative min-h-[22rem] overflow-hidden border-b border-[var(--line)] md:border-b-0 md:border-r md:min-h-[28rem]"
          style={{
            background:
              "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.9), transparent 28%), linear-gradient(135deg, var(--paper-2), #ead8c0)",
          }}
        >
          {/* Inner frame accent — same as Outfits page */}
          <div className="absolute inset-5 border border-white/55 pointer-events-none" />

          {/* Source badge */}
          <div className="absolute left-5 top-5 z-20">
            <span className="rounded-full bg-[rgba(255,255,255,0.86)] px-3 py-1.5 text-[0.49rem] font-semibold uppercase tracking-[0.22em] text-[var(--gold)] shadow-[0_4px_16px_rgba(36,26,18,0.1)] backdrop-blur-sm border border-[rgba(36,26,18,0.06)]">
              {SOURCE_BADGE[outfit.source]}
            </span>
          </div>

          {outfit.visualItems.length > 0 ? (
            outfit.visualItems.slice(0, 6).map((item, index) => (
              <OutfitPieceVisual key={`${item.id}-${index}`} item={item} index={index} />
            ))
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
              <p className="font-display text-[1.15rem] italic leading-[1.4] text-[var(--coffee)]">
                No look planned for today.
              </p>
              <Link
                href="/planner"
                className="rounded-full bg-[var(--espresso)] px-5 py-2.5 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[var(--paper)]"
              >
                Plan today →
              </Link>
            </div>
          )}
        </div>

        {/* ── Metadata ── */}
        <div className="flex flex-col justify-between px-7 py-8">
          <div>
            <div className="mb-5 flex items-start justify-between gap-2">
              <p className="eyebrow">Outfit of today</p>
              {outfit.status && STATUS_STYLE[outfit.status] && (
                <span
                  className={`text-[0.5rem] font-semibold uppercase tracking-[0.18em] ${STATUS_STYLE[outfit.status].color}`}
                >
                  {STATUS_STYLE[outfit.status].label}
                </span>
              )}
            </div>

            <h2 className="font-display text-[2.1rem] leading-[1.02] text-[var(--espresso)]">
              {outfit.title}
            </h2>

            {outfit.caption && (
              <p className="mt-4 text-[0.88rem] leading-[1.85] text-[var(--ink-soft)]">
                {outfit.caption}
              </p>
            )}

            {outfit.formula.length > 0 && (
              <div className="mt-7 border-y border-[var(--line)] py-5">
                <p className="eyebrow mb-3">Formula</p>
                <div className="flex flex-wrap gap-2">
                  {outfit.formula.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-[0.54rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {outfit.notes && (
              <p className="font-display mt-6 text-[1rem] italic leading-[1.6] text-[var(--coffee)]">
                &ldquo;{outfit.notes}&rdquo;
              </p>
            )}
          </div>

          <div>
            <p className="mt-6 text-[0.7rem] leading-[1.75] text-[var(--ink-soft)]">
              {SOURCE_NOTE[outfit.source]}
            </p>

            <div className="mt-5 flex flex-wrap gap-6 border-t border-[var(--line)] pt-5">
              <Link
                href="/outfits"
                className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--espresso)] underline-offset-4 hover:underline"
              >
                Open board
              </Link>
              <Link
                href="/planner"
                className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--gold)] underline-offset-4 hover:underline"
              >
                {outfit.status === "worn" ? "View planner" : "Plan / log outfit →"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
