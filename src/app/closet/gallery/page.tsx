export const dynamic = "force-dynamic";

import Link from "next/link";
import { getWardrobeItems } from "@/lib/wardrobe/data";
import type { WardrobeCategory, WardrobeItem } from "@/types/wardrobe";

const CATEGORY_LABELS: Record<WardrobeCategory, string> = {
  outerwear: "Outerwear",
  top: "Tops",
  bottom: "Bottoms",
  dress: "Dresses",
  shoes: "Shoes",
  bag: "Bags",
  accessory: "Accessories",
  jewelry: "Jewelry",
};

const CATEGORY_ORDER: WardrobeCategory[] = [
  "top",
  "bottom",
  "shoes",
  "dress",
  "bag",
  "accessory",
  "jewelry",
  "outerwear",
];

function getAverageScore(item: WardrobeItem) {
  const scores = [
    item.loveScore,
    item.versatilityScore,
    item.fitConfidenceScore,
    item.capsuleValueScore,
  ].filter((score): score is number => typeof score === "number");

  if (!scores.length) return null;

  return Number(
    (scores.reduce((total, score) => total + score, 0) / scores.length).toFixed(1),
  );
}

function GalleryCard({ item }: { item: WardrobeItem }) {
  const score = getAverageScore(item);

  return (
    <Link href="/closet/gallery" className="gallery-v2-card">
      <div className="gallery-v2-image">
        {item.imageUrl ? (
          <div
            className="h-full w-full bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${item.imageUrl})` }}
          />
        ) : (
          <div className="grid h-full place-items-center p-4 text-center">
            <p className="font-display text-2xl leading-none text-[var(--espresso)]">
              {item.name}
            </p>
          </div>
        )}

        <span className="gallery-v2-type">{CATEGORY_LABELS[item.category]}</span>

        {score !== null ? (
          <span className="gallery-v2-score">{score}</span>
        ) : null}
      </div>

      <div className="gallery-v2-copy">
        <p>{item.colorName} · {item.size ?? "Size"}</p>
        <h2 className="font-display">{item.name}</h2>
      </div>
    </Link>
  );
}

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

        <section className="gallery-v2-actions">
          <div className="gallery-v2-search">Search closet</div>

          <div className="gallery-v2-links">
            <Link href="/closet" className="gallery-v2-link primary">
              Dashboard
            </Link>
            <Link href="/outfits" className="gallery-v2-link">
              Build look
            </Link>
            <Link href="/wishlist" className="gallery-v2-link">
              Wishlist
            </Link>
          </div>
        </section>

        <section className="gallery-v2-chips">
          <span className="gallery-v2-chip active">
            All <strong>{ownedItems.length}</strong>
          </span>

          {CATEGORY_ORDER.map((category) => (
            <span key={category} className="gallery-v2-chip">
              {CATEGORY_LABELS[category]} <strong>{counts[category] ?? 0}</strong>
            </span>
          ))}
        </section>

        <section className="gallery-v2-head">
          <div>
            <p className="eyebrow">All owned pieces</p>
            <h2 className="font-display">Wardrobe grid</h2>
          </div>

          <button type="button">Filters</button>
        </section>

        <section className="gallery-v2-grid">
          {ownedItems.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </section>
      </section>
    </main>
  );
}
