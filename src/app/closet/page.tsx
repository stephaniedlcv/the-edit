export const dynamic = "force-dynamic";

import { ClosetCategoryBoard } from "@/components/closet-category-board";
import { getWardrobeItems } from "@/lib/wardrobe/data";

export default async function ClosetPage() {
  const ownedItems = await getWardrobeItems();

  return (
    <main className="closet-page min-h-screen px-4 py-6 md:px-6 md:py-8">
      <section className="mx-auto max-w-[1120px]">
        <div className="edit-card-glass mb-6 overflow-hidden p-6 md:p-8">
          <p className="eyebrow mb-4">Owned Wardrobe</p>
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="font-display text-[4.2rem] leading-[0.82] text-[var(--espresso)] md:text-[6rem]">
                Your closet,
                <br />
                clearly edited.
              </h1>
              <p className="mt-6 max-w-2xl text-[1rem] leading-7 text-[var(--ink-soft)]">
                Owned pieces only — organized as a private wardrobe gallery for styling,
                outfit building, capsule decisions, and repeatable formulas.
              </p>
            </div>

            <div className="rounded-[1.75rem] bg-white/52 p-5 text-center shadow-[inset_0_0_0_1px_rgba(48,35,31,0.04)]">
              <p className="eyebrow mb-3">Ready to style</p>
              <p className="font-display text-[4.5rem] leading-none text-[var(--burgundy)]">
                {String(ownedItems.length).padStart(2, "0")}
              </p>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">owned pieces</p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            <span className="edit-chip edit-chip-active">Wardrobe Gallery</span>
            <span className="edit-chip">Dark Autumn</span>
            <span className="edit-chip">Bottom Hourglass</span>
            <span className="edit-chip">PR Lifestyle</span>
          </div>
        </div>

        <ClosetCategoryBoard items={ownedItems} />
      </section>
    </main>
  );
}
