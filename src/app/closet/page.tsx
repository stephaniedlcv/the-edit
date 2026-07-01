export const dynamic = "force-dynamic";

import { ClosetCategoryBoard } from "@/components/closet-category-board";
import { PageHero } from "@/components/ui/page-hero";
import { getWardrobeItems } from "@/lib/wardrobe/data";

export default async function ClosetPage() {
  const ownedItems = await getWardrobeItems();

  return (
    <main className="closet-page min-h-screen px-4 py-6 md:px-6 md:py-8">
      <section className="mx-auto max-w-[1120px]">
        <PageHero
          eyebrow="Owned Wardrobe"
          title="Closet edit"
          description="Browse what you already own as a private wardrobe gallery for styling, outfit building, capsule decisions, and repeatable formulas."
          statLabel="Ready to style"
          statValue={ownedItems.length}
          chips={["Wardrobe Gallery", "Dark Autumn", "Bottom Hourglass", "PR Lifestyle"]}
        />

        <ClosetCategoryBoard items={ownedItems} />
      </section>
    </main>
  );
}
