export const dynamic = "force-dynamic";

import Link from "next/link";
import { getWardrobeItems } from "@/lib/wardrobe/data";
import type { WardrobeCategory } from "@/types/wardrobe";
import { ClosetGalleryBoard } from "@/components/ui/closet-gallery-board";

export default async function ClosetGalleryPage() {
  const ownedItems = await getWardrobeItems();

  const counts = ownedItems.reduce<Partial<Record<WardrobeCategory, number>>>(
    (acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <main className="gallery-v2 min-h-screen px-4 py-6 md:px-6 md:py-8">
      <section className="mx-auto max-w-[1120px]">
        <section className="gallery-v2-hero">
          <div>
            <p className="eyebrow mb-2">Closet Gallery</p>
            <h1 className="font-display">Browse pieces</h1>
            <p>
              A clean visual inventory of every owned piece, ready for styling,
              outfit building, and capsule decisions.
            </p>
          </div>

          <div className="gallery-v2-count">
            <span>{ownedItems.length}</span>
            <small>owned pieces</small>
          </div>
        </section>

        <nav className="gallery-v2-nav">
          <Link href="/closet" className="gallery-v2-link primary">
            Dashboard
          </Link>
          <Link href="/outfits" className="gallery-v2-link">
            Build look
          </Link>
          <Link href="/wishlist" className="gallery-v2-link">
            Wishlist
          </Link>
        </nav>

        <ClosetGalleryBoard items={ownedItems} counts={counts} />
      </section>
    </main>
  );
}
