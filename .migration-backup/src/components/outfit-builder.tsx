import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { OutfitEditor } from "@/components/outfit-editor";
import {
  composeOutfits,
  type ComposedOutfit,
} from "@/lib/style-profile/outfit-composer";
import type { WardrobeItem } from "@/types/wardrobe";

type OutfitBuilderProps = {
  items: WardrobeItem[];
};

type OutfitSlot = {
  id: string;
  label: string;
  helper: string;
};

function activeOnly(items: WardrobeItem[]) {
  return items.filter((item) => (item.itemStatus ?? "active") === "active");
}

function countByCategory(items: WardrobeItem[]) {
  return items.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.category] = (accumulator[item.category] ?? 0) + 1;
    return accumulator;
  }, {});
}

function formatMachineLabel(value: string) {
  return value.replaceAll("_", " ").replaceAll("-", " ");
}

function decisionLabel(decision: ComposedOutfit["decision"]) {
  if (decision === "approved") return "Approved";
  if (decision === "needs_review") return "Needs review";
  return "Rejected";
}

function decisionClassName(decision: ComposedOutfit["decision"]) {
  if (decision === "approved") {
    return "border-[rgba(88,119,74,0.28)] bg-[rgba(88,119,74,0.10)] text-[var(--espresso)]";
  }

  if (decision === "needs_review") {
    return "border-[rgba(194,126,56,0.32)] bg-[rgba(194,126,56,0.10)] text-[var(--coffee)]";
  }

  return "border-[rgba(128,55,45,0.28)] bg-[rgba(128,55,45,0.10)] text-[var(--espresso)]";
}

function getPieceText(look: ComposedOutfit) {
  return look.items.map((item) => item.label).join(" + ");
}

function GeneratedLookCard({
  look,
  index,
  closetItems,
}: {
  look: ComposedOutfit;
  index: number;
  closetItems: WardrobeItem[];
}) {
  const visualItems = look.pieceIds
    .map((pieceId) => closetItems.find((item) => item.id === pieceId))
    .filter((item): item is WardrobeItem => Boolean(item));

  return (
    <article className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-[0_18px_60px_rgba(74,47,34,0.05)]">
      <OutfitEditor
        items={visualItems}
        closetItems={closetItems}
        lookMetadata={{
          title: look.title,
          sourceOutfitId: look.id,
          formula: look.formula,
          decision: look.decision,
          generatedPieceIds: look.pieceIds,
          scores: {
            total: look.totalScore,
            color: look.colorScore,
            elevation: look.elevationScore,
          },
          stylingInstruction: look.stylingInstruction,
          whyItWorks: look.whyItWorks,
        }}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
            Style Intelligence · Look {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="font-display mt-3 text-[2.35rem] leading-none text-[var(--espresso)]">
            {look.title}
          </h3>
        </div>

        <div
          className={`rounded-full border px-3 py-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.18em] ${decisionClassName(
            look.decision,
          )}`}
        >
          {decisionLabel(look.decision)}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] px-4 py-3">
          <p className="text-[0.52rem] font-semibold uppercase tracking-[0.18em] text-[var(--caramel)]">
            Total
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--espresso)]">
            {look.totalScore}
          </p>
        </div>

        <div className="rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] px-4 py-3">
          <p className="text-[0.52rem] font-semibold uppercase tracking-[0.18em] text-[var(--caramel)]">
            Color
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--espresso)]">
            {look.colorScore}
          </p>
        </div>

        <div className="rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] px-4 py-3">
          <p className="text-[0.52rem] font-semibold uppercase tracking-[0.18em] text-[var(--caramel)]">
            Elevation
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--espresso)]">
            {look.elevationScore}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] p-4">
        <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[var(--caramel)]">
          Pieces
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
          {getPieceText(look)}
        </p>
      </div>

      <div className="mt-5 space-y-3 text-sm leading-6 text-[var(--ink-soft)]">
        <p>
          <span className="font-semibold text-[var(--espresso)]">Styling: </span>
          {look.stylingInstruction}
        </p>
        <p>
          <span className="font-semibold text-[var(--espresso)]">Formula: </span>
          {formatMachineLabel(look.formula)}
        </p>
        <p>
          <span className="font-semibold text-[var(--espresso)]">Color status: </span>
          {formatMachineLabel(look.colorValidation.status)}
        </p>
        <p>
          <span className="font-semibold text-[var(--espresso)]">Styling status: </span>
          {formatMachineLabel(look.stylingValidation.stylingStatus)}
        </p>
      </div>

      <details className="mt-5 rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] p-4">
        <summary className="cursor-pointer text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)]">
          Why it works
        </summary>
        <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--ink-soft)]">
          {look.whyItWorks.map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
        </div>
      </details>
    </article>
  );
}

export function OutfitBuilder({ items }: OutfitBuilderProps) {
  const activeItems = activeOnly(items);
  const categoryCounts = countByCategory(activeItems);

  const generatedLooks = composeOutfits(activeItems, {
    occasion: "office",
    maxLooks: 8,
    includeOuterwear: true,
    includeAccessories: true,
    allowDenim: false,
    requireColorApproval: false,
    pushBeyondComfort: true,
  });

  const approvedLooks = generatedLooks.filter((look) => look.decision === "approved");
  const reviewLooks = generatedLooks.filter((look) => look.decision === "needs_review");

  const slots: OutfitSlot[] = [
    {
      id: "top",
      label: "Top",
      helper: "Choose a top that sets the color story.",
    },
    {
      id: "bottom",
      label: "Bottom",
      helper: "Ground the outfit with the right silhouette.",
    },
    {
      id: "shoes",
      label: "Shoes",
      helper: "Match the outfit mood, not just the category.",
    },
    {
      id: "layer",
      label: "Layer",
      helper: "Optional blazer, vest, cardigan, or jacket.",
    },
    {
      id: "finishing",
      label: "Finishing piece",
      helper: "Bag, belt, jewelry, or styling detail.",
    },
  ];

  const categorySummary = [
    ["Tops", categoryCounts.top ?? 0],
    ["Bottoms", categoryCounts.bottom ?? 0],
    ["Shoes", categoryCounts.shoes ?? 0],
    ["Outerwear", categoryCounts.outerwear ?? 0],
    ["Bags", categoryCounts.bag ?? 0],
    ["Accessories", categoryCounts.accessory ?? 0],
    ["Jewelry", categoryCounts.jewelry ?? 0],
    ["Dresses", categoryCounts.dress ?? 0],
  ];

  return (
    <main className="pb-16 md:pb-20">
      <PageHeader
        eyebrow="Outfit Builder"
        title={
          <>
            Build from{" "}
            <em className="text-[var(--coffee)]">what you own.</em>
          </>
        }
        description="Style Intelligence is now reading your active closet and generating office-ready outfit ideas using your color, silhouette, and elevation rules."
        asideEyebrow="Style Intelligence"
        asideText="Generated from real closet pieces. Denim is off for this office preview."
      >
        <div className="flex flex-wrap gap-5">
          <Link
            href="/closet"
            className="border-b-[1.5px] border-transparent pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)] no-underline transition hover:border-[var(--coffee)]"
          >
            Wardrobe Gallery
          </Link>
          <Link
            href="/outfits"
            className="border-b-[1.5px] border-[var(--espresso)] pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--espresso)] no-underline"
          >
            Outfit Builder
          </Link>
        </div>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="relative overflow-hidden rounded-[8px] border border-[var(--line)] bg-[var(--espresso)] p-8 text-[var(--paper)]">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
              Active closet available
            </p>
            <p className="mt-6 font-display text-8xl leading-none">
              {activeItems.length}
            </p>
            <p className="mt-6 max-w-md text-sm leading-7 text-[rgba(255,248,237,0.76)]">
              These are the pieces eligible for generated outfit formulas. Archived,
              donated, sold, and damaged pieces are excluded.
            </p>
          </article>

          <article className="rounded-[8px] border border-[var(--line)] bg-[var(--paper-2)] p-8">
            <p className="eyebrow mb-3">Recommendation engine</p>
            <h2 className="font-display text-4xl text-[var(--espresso)]">
              Active
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
              The system is now checking color harmony, outfit formula, office polish,
              silhouette balance, and the elevation rule before showing looks.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[4px] border border-[var(--line)] bg-[var(--paper)] p-4">
                <p className="text-3xl font-semibold text-[var(--espresso)]">
                  {generatedLooks.length}
                </p>
                <p className="mt-2 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[var(--caramel)]">
                  Generated
                </p>
              </div>

              <div className="rounded-[4px] border border-[var(--line)] bg-[var(--paper)] p-4">
                <p className="text-3xl font-semibold text-[var(--espresso)]">
                  {approvedLooks.length}
                </p>
                <p className="mt-2 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[var(--caramel)]">
                  Approved
                </p>
              </div>

              <div className="rounded-[4px] border border-[var(--line)] bg-[var(--paper)] p-4">
                <p className="text-3xl font-semibold text-[var(--espresso)]">
                  {reviewLooks.length}
                </p>
                <p className="mt-2 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[var(--caramel)]">
                  Review
                </p>
              </div>
            </div>
          </article>
        </div>

        <div className="mt-8 rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] p-5 md:p-7">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow mb-2">Generated by Style Intelligence</p>
              <h2 className="font-display text-4xl text-[var(--espresso)]">
                Office outfit ideas
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--ink-soft)]">
              These are not random combinations. Each look is scored for color,
              elevation, proportion, and office wearability.
            </p>
          </div>

          {generatedLooks.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {generatedLooks.map((look, index) => (
                <GeneratedLookCard key={look.id} look={look} index={index} closetItems={activeItems} />
              ))}
            </div>
          ) : (
            <div className="rounded-[4px] border border-dashed border-[var(--line)] bg-[var(--paper)] p-8 text-sm leading-7 text-[var(--ink-soft)]">
              No generated looks yet. Add more active closet items with tops, bottoms,
              shoes, bags, or accessories.
            </div>
          )}
        </div>

        <div className="mt-8 rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] p-5 md:p-7">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow mb-2">Outfit formula structure</p>
              <h2 className="font-display text-4xl text-[var(--espresso)]">
                Slots the engine fills
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--ink-soft)]">
              The composer builds from a core outfit, then adds shoes and styling anchors.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {slots.map((slot) => (
              <article
                key={slot.id}
                className="rounded-[8px] border border-dashed border-[var(--line)] bg-[var(--paper)] p-5"
              >
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
                  {slot.label}
                </p>
                <div className="mt-5 flex h-52 items-center justify-center rounded-[4px] bg-[var(--paper-2)] px-5 text-center text-sm leading-6 text-[var(--ink-soft)]">
                  {slot.helper}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-[8px] border border-[var(--line)] bg-[var(--paper-2)] p-7">
          <p className="eyebrow mb-3">Closet pieces by slot</p>
          <h2 className="font-display text-4xl text-[var(--espresso)]">
            What the builder can use
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categorySummary.map(([label, count]) => (
              <div
                key={label}
                className="rounded-[4px] border border-[var(--line)] bg-[var(--paper)] px-5 py-4"
              >
                <p className="text-3xl font-semibold text-[var(--espresso)]">
                  {count}
                </p>
                <p className="mt-2 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[var(--caramel)]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
