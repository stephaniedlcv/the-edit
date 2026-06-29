import { useEffect, useState } from "react";
import { Link } from "wouter";
import { OutfitBuilder } from "@/components/outfit-builder";
import { getWardrobeItems } from "@/lib/wardrobe/data";
import { mockOwnedItems } from "@/lib/mock-owned-items";
import type { WardrobeItem } from "@/types/wardrobe";

export function OutfitsPage() {
  const [items, setItems] = useState<WardrobeItem[]>(mockOwnedItems);

  useEffect(() => {
    getWardrobeItems().then((result) => {
      setItems(result);
    });
  }, []);

  return (
    <>
      <section className="mx-auto flex max-w-6xl justify-end px-6 pt-8 md:px-10">
        <div className="flex flex-wrap gap-5">
          <Link
            to="/outfits"
            className="border-b-[1.5px] border-[var(--espresso)] pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--espresso)] no-underline"
          >
            Outfit Builder
          </Link>

          <Link
            to="/outfits/saved"
            className="border-b-[1.5px] border-transparent pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)] no-underline transition hover:border-[var(--coffee)]"
          >
            Saved Outfits
          </Link>
        </div>
      </section>

      <OutfitBuilder items={items} />
    </>
  );
}
