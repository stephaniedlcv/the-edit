export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getWardrobeItems } from "@/lib/wardrobe/data";
import { SPECTRUM_META } from "@/lib/wardrobe/spectrum";
import { ClosetGalleryBoard } from "@/components/ui/closet-gallery-board";
import type { WardrobeCategory } from "@/types/wardrobe";

export default async function ClosetGalleryPage() {
  const ownedItems = await getWardrobeItems();

  const counts = ownedItems.reduce<Partial<Record<WardrobeCategory, number>>>(
    (acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const burgundyHex = SPECTRUM_META.burgundy?.hex ?? "#6B2D3E";

  return (
    <section
      className="min-h-screen px-4 pb-28 pt-6 md:px-6 md:pt-10"
      style={{ background: "var(--gal)", overflowX: "clip" }}
    >
      <div className="mx-auto max-w-[760px]">
        {/* Header — Cromática pattern */}
        <div className="mb-7">
          <p
            className="mb-2"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--tinta-tenue)",
            }}
          >
            Clóset · Galería · {ownedItems.length} piezas
          </p>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem,8vw,2.8rem)",
              fontWeight: 300,
              lineHeight: 1.0,
              color: "var(--tinta)",
            }}
          >
            La{" "}
            <em style={{ fontStyle: "italic", color: burgundyHex }}>
              galería.
            </em>
          </p>
        </div>

        <Suspense
          fallback={
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                color: "var(--tinta-tenue)",
                padding: "2rem 0",
              }}
            >
              Cargando…
            </p>
          }
        >
          <ClosetGalleryBoard items={ownedItems} counts={counts} />
        </Suspense>
      </div>
    </section>
  );
}
