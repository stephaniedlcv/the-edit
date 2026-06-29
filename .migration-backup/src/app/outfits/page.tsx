import Link from "next/link";
import { OutfitBuilder } from "@/components/outfit-builder";
import { getWardrobeItems } from "@/lib/wardrobe/data";

export default async function OutfitsPage() {
  const items = await getWardrobeItems();

  return (
    <>
      <section className="mx-auto flex max-w-6xl justify-end px-6 pt-8 md:px-10">
        <div className="flex flex-wrap gap-5">
          <Link
            href="/outfits"
            className="border-b-[1.5px] border-[var(--espresso)] pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--espresso)] no-underline"
          >
            Outfit Builder
          </Link>

          <Link
            href="/outfits/saved"
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
