import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ClosetCategoryBoard } from "@/components/closet-category-board";
import { PageHeader } from "@/components/page-header";
import { getWardrobeItems } from "@/lib/wardrobe/data";
import { mockOwnedItems } from "@/lib/mock-owned-items";
import type { WardrobeItem } from "@/types/wardrobe";

export function ClosetPage() {
  const [items, setItems] = useState<WardrobeItem[]>(mockOwnedItems);

  useEffect(() => {
    getWardrobeItems().then((result) => {
      setItems(result);
    });
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Owned Wardrobe"
        title={
          <>
            Your closet,{" "}
            <em className="text-[var(--coffee)]">clearly edited.</em>
          </>
        }
        description="Owned pieces only. This is the inventory you can actually style, repeat, and build outfits from."
        asideEyebrow="Closet Mode"
        asideText={`${String(items.length).padStart(2, "0")} pieces ready to style.`}
      >
        <div className="flex flex-wrap gap-5">
          <Link
            to="/closet"
            className="border-b-[1.5px] border-[var(--espresso)] pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--espresso)] no-underline"
          >
            Wardrobe Gallery
          </Link>
          <Link
            to="/closet-health"
            className="border-b-[1.5px] border-transparent pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)] no-underline transition hover:border-[var(--coffee)]"
          >
            Closet Health
          </Link>
        </div>
      </PageHeader>

      <ClosetCategoryBoard items={items} />
    </>
  );
}
