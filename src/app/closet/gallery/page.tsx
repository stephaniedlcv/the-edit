export const dynamic = "force-dynamic";

import Link from "next/link";
import { ClosetCategoryBoard } from "@/components/closet-category-board";
import { getWardrobeItems } from "@/lib/wardrobe/data";

export default async function ClosetGalleryPage() {
  const ownedItems = await getWardrobeItems();

  return (
    <main className="closet-page min-h-screen px-4 py-6 md:px-6 md:py-8">
      <section className="mx-auto max-w-[1120px]">
        <div className="mb-5 flex items-center justify-between gap-4 rounded-[1.5rem] border border-white/70 bg-white/60 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_36px_rgba(74,52,42,0.07)]">
          <div>
            <p className="eyebrow mb-1">Closet Gallery</p>
            <h1 className="font-display text-[2.9rem] leading-none text-[var(--espresso)]">
              Browse pieces
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              {ownedItems.length} owned pieces ready for styling.
            </p>
          </div>

          <Link
            href="/closet"
            className="rounded-full bg-[var(--burgundy)] px-4 py-3 text-[0.56rem] font-bold uppercase tracking-[0.18em] text-white no-underline shadow-[0_10px_24px_rgba(122,46,53,0.18)]"
          >
            Dashboard
          </Link>
        </div>

        <ClosetCategoryBoard items={ownedItems} />
      </section>
    </main>
  );
}
