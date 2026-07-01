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

const TARGETS: Partial<Record<WardrobeCategory, number>> = {
  dress: 10,
  bag: 6,
  accessory: 15,
  jewelry: 12,
  outerwear: 2,
};

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

function getInsightCopy(category: WardrobeCategory, count: number, target: number) {
  if (category === "dress") {
    return "Good PR heat shortcut. Add only if it works for office, weekends, or easy dinners.";
  }

  if (category === "bag") {
    return "Almost covered. Prioritize structure, color, or polish — not another neutral duplicate.";
  }

  if (category === "accessory") {
    return "Big opportunity area. Belts, earrings, hair pieces, and sunglasses can elevate basics fast.";
  }

  if (category === "jewelry") {
    return "Repeatable staples will make simple outfits feel finished with less effort.";
  }

  if (category === "outerwear") {
    return "Keep this light and breathable. One sharp layer can make work outfits feel styled.";
  }

  return `${count}/${target} covered. Add intentionally only if it creates new outfit formulas.`;
}

function StatTile({
  label,
  value,
  note,
  href = "/closet/gallery",
}: {
  label: string;
  value: number;
  note: string;
  href?: string;
}) {
  return (
    <Link href={href} className="closet-stat-tile no-underline">
      <span className="closet-stat-label">{label}</span>
      <span className="closet-stat-value">{value}</span>
      <span className="closet-stat-note">{note}</span>
    </Link>
  );
}

function ActionTile({
  title,
  note,
  href,
  primary = false,
}: {
  title: string;
  note: string;
  href: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={primary ? "closet-action-tile primary" : "closet-action-tile"}
    >
      <span>{title}</span>
      <small>{note}</small>
    </Link>
  );
}

function CategoryPill({
  label,
  count,
}: {
  label: string;
  count: number;
}) {
  return (
    <Link href="/closet/gallery" className="closet-category-pill">
      <span>{label}</span>
      <strong>{count}</strong>
    </Link>
  );
}

function RecentPiece({ item }: { item: WardrobeItem }) {
  const score = getAverageScore(item);

  return (
    <Link href="/closet/gallery" className="closet-recent-card no-underline">
      <div className="closet-recent-image">
        {item.imageUrl ? (
          <div
            className="h-full w-full bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${item.imageUrl})` }}
            aria-label={item.name}
          />
        ) : (
          <div className="grid h-full place-items-center p-4 text-center">
            <p className="font-display text-2xl leading-none text-[var(--espresso)]">
              {item.name}
            </p>
          </div>
        )}

        <span className="closet-recent-type">{CATEGORY_LABELS[item.category]}</span>

        {score !== null ? (
          <span className="closet-recent-score">{score}</span>
        ) : null}
      </div>

      <div className="closet-recent-copy">
        <p>{item.colorName} · {item.size ?? "Size"}</p>
        <h3>{item.name}</h3>
      </div>
    </Link>
  );
}

export default async function ClosetPage() {
  const ownedItems = await getWardrobeItems();

  const counts = ownedItems.reduce<Partial<Record<WardrobeCategory, number>>>(
    (acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const total = ownedItems.length;
  const tops = counts.top ?? 0;
  const bottoms = counts.bottom ?? 0;
  const shoes = counts.shoes ?? 0;
  const bags = counts.bag ?? 0;

  const insightItems = CATEGORY_ORDER
    .map((category) => {
      const count = counts[category] ?? 0;
      const target = TARGETS[category] ?? 0;

      return {
        category,
        label: CATEGORY_LABELS[category],
        count,
        target,
        needsAttention: target > 0 && count < target,
      };
    })
    .filter((item) => item.needsAttention)
    .slice(0, 3);

  const categoryHighlights = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    count: counts[category] ?? 0,
  }));

  
function normalizeReadyToStyleCategory(item: any) {
  const raw = String(
    item.category ??
    item.categoryName ??
    item.type ??
    item.section ??
    ""
  ).toLowerCase();

  if (raw.includes("top")) return "tops";
  if (raw.includes("bottom")) return "bottoms";
  if (raw.includes("shoe")) return "shoes";
  if (raw.includes("dress")) return "dresses";
  if (raw.includes("bag")) return "bags";
  if (raw.includes("access")) return "accessories";
  if (raw.includes("jewel")) return "jewelry";
  if (raw.includes("outer")) return "outerwear";
  return "other";
}

function buildReadyToStylePieces(items: any[], limit = 8) {
  const order = [
    "tops",
    "bottoms",
    "shoes",
    "dresses",
    "bags",
    "accessories",
    "jewelry",
    "outerwear",
    "other",
  ];

  const buckets = new Map(order.map((key) => [key, [] as any[]]));

  for (const item of items) {
    const key = normalizeReadyToStyleCategory(item);
    buckets.get(key)?.push(item);
  }

  const result: any[] = [];
  let added = true;

  while (result.length < limit && added) {
    added = false;

    for (const key of order) {
      const bucket = buckets.get(key);
      if (bucket && bucket.length > 0) {
        result.push(bucket.shift());
        added = true;
        if (result.length >= limit) break;
      }
    }
  }

  return result;
}

const recentPieces = buildReadyToStylePieces(ownedItems, 8);


  return (
    <main className="closet-dashboard-v2 min-h-screen px-4 py-6 md:px-6 md:py-8">
      <section className="mx-auto max-w-[1120px]">
        <section className="closet-v2-hero">
          <div>
            <p className="eyebrow mb-2">Closet</p>
            <h1>Wardrobe dashboard</h1>
            <p>
              Your private closet overview — what you own, what is strong, what needs
              attention, and what is ready to style.
            </p>
          </div>

          <div className="closet-v2-hero-count">
            <span>{total}</span>
            <small>owned pieces</small>
          </div>
        </section>

        <section className="closet-v2-actions">
          <ActionTile
            title="Browse gallery"
            note="View all pieces"
            href="/closet/gallery"
            primary
          />
          <ActionTile
            title="Add piece"
            note="Upload item"
            href="/closet/gallery"
          />
          <ActionTile
            title="Build look"
            note="Create outfit"
            href="/outfits"
          />
          <ActionTile
            title="Wishlist"
            note="Review gaps"
            href="/wishlist"
          />
        </section>

        <section className="closet-v2-stats">
          <StatTile label="Owned" value={total} note="Total closet" />
          <StatTile label="Tops" value={tops} note="Strongest base" />
          <StatTile label="Bottoms" value={bottoms} note="Outfit anchors" />
          <StatTile label="Shoes" value={shoes} note="Style finishers" />
          <StatTile label="Bags" value={bags} note="Polish layer" />
        </section>

        <section className="closet-v2-grid">
          <div className="closet-v2-panel">
            <div className="closet-v2-section-head">
              <div>
                <p className="eyebrow">Closet focus</p>
                <h2>Needs attention</h2>
              </div>
              <Link href="/wishlist" className="closet-mini-link">
                Review wishlist
              </Link>
            </div>

            <div className="closet-insight-list">
              {insightItems.length > 0 ? (
                insightItems.map((item) => (
                  <div key={item.category} className="closet-insight-card">
                    <div>
                      <p>{item.label}</p>
                      <span>{getInsightCopy(item.category, item.count, item.target)}</span>
                    </div>

                    <strong>
                      {item.count}/{item.target}
                    </strong>
                  </div>
                ))
              ) : (
                <div className="closet-insight-card">
                  <div>
                    <p>Styling focus</p>
                    <span>
                      Your main categories are covered. Focus on creating repeatable outfits
                      from what you own.
                    </span>
                  </div>
                  <strong>OK</strong>
                </div>
              )}
            </div>
          </div>

          <div className="closet-v2-panel">
            <div className="closet-v2-section-head">
              <div>
                <p className="eyebrow">Categories</p>
                <h2>Browse by section</h2>
              </div>
              <Link href="/closet/gallery" className="closet-mini-link">
                View all
              </Link>
            </div>

            <div className="closet-category-grid">
              {categoryHighlights.map((item) => (
                <CategoryPill
                  key={item.category}
                  label={item.label}
                  count={item.count}
                />
              ))}
            </div>
          </div>
        </section>

        {recentPieces.length > 0 ? (
          <section className="closet-v2-panel">
            <div className="closet-v2-section-head">
              <div>
                <p className="eyebrow">Recent pieces</p>
                <h2>Ready to style</h2>
              </div>
              <Link href="/closet/gallery" className="closet-mini-link">
                Open gallery
              </Link>
            </div>

            <div className="closet-recent-grid">
              {recentPieces.map((item) => (
                <RecentPiece key={item.id} item={item} />
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
