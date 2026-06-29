import { PageHeader } from "@/components/page-header";
import { WishlistPriorityBoard } from "@/components/wishlist-priority-board";
import { getWishlistItems } from "@/lib/wishlist/data";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const items = await getWishlistItems();
  const priceWatchCount = items.filter((item) => item.priceWatch).length;
  return (
    <>
      <PageHeader
        eyebrow="Shopping Discipline"
        title={
          <>
            Curated wishlist,{" "}
            <em className="text-[var(--coffee)]">by priority.</em>
          </>
        }
        description="Wishlist pieces are grouped by purchase priority so the next buy is based on closet impact, not impulse."
        asideEyebrow="Wishlist Signal"
        asideText={`${String(priceWatchCount).padStart(2, "0")} pieces are on price watch.`}
      />

      <WishlistPriorityBoard items={items} />
    </>
  );
}
