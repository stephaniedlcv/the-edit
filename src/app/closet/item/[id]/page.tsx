export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { getWardrobeItemById } from "@/lib/wardrobe/data";
import type { WardrobeItem } from "@/types/wardrobe";

const CATEGORY_LABELS: Record<string, string> = {
  outerwear: "Outerwear",
  top: "Tops",
  bottom: "Bottoms",
  dress: "Dresses",
  shoes: "Shoes",
  bag: "Bags",
  accessory: "Accessories",
  jewelry: "Jewelry",
};

function getAverageScore(item: WardrobeItem) {
  const scores = [
    item.loveScore,
    item.versatilityScore,
    item.fitConfidenceScore,
    item.capsuleValueScore,
  ].filter((s): s is number => typeof s === "number");
  if (!scores.length) return null;
  return Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1));
}

function ScorePill({ label, value }: { label: string; value?: number }) {
  if (value === undefined || value === null) return null;
  return (
    <div className="item-score-pill">
      <span className="item-score-pill-value">{value}</span>
      <span className="item-score-pill-label">{label}</span>
    </div>
  );
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ClosetItemPage({ params }: Props) {
  const { id } = await params;
  const item = await getWardrobeItemById(id);

  if (!item) {
    notFound();
  }

  const avgScore = getAverageScore(item);
  const hasScores = [
    item.loveScore,
    item.versatilityScore,
    item.fitConfidenceScore,
    item.capsuleValueScore,
  ].some((s) => typeof s === "number");
  const hasStyleNotes = !!(item.stylingNotes ?? item.notes);
  const hasDetails = !!(
    item.brand ??
    item.purchaseSource ??
    (item.paidPrice !== undefined && item.paidPrice !== null) ??
    item.purchaseDate ??
    item.productUrl
  );

  return (
    <main className="item-detail min-h-screen px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-[1120px]">

        <nav className="item-detail-nav">
          <Link href="/closet/gallery" className="item-detail-back">
            ← Gallery
          </Link>
          <Link href="/closet" className="item-detail-back">
            Dashboard
          </Link>
        </nav>

        <section className="item-detail-hero">
          <div className="item-detail-image-wrap">
            {item.imageUrl ? (
              <div
                className="item-detail-image"
                style={{ backgroundImage: `url(${item.imageUrl})` }}
                role="img"
                aria-label={item.name}
              />
            ) : (
              <div className="item-detail-image item-detail-image--empty">
                <p className="font-display text-2xl leading-none text-[var(--espresso)]">
                  {item.name}
                </p>
              </div>
            )}
          </div>

          <div className="item-detail-meta">
            <p className="eyebrow mb-3">{CATEGORY_LABELS[item.category] ?? item.category}</p>

            {avgScore !== null ? (
              <div className="item-detail-score-badge">
                <span>{avgScore}</span>
              </div>
            ) : null}

            <h1 className="font-display item-detail-name">{item.name}</h1>

            <p className="item-detail-color">
              {item.colorName}
              {item.size ? ` · ${item.size}` : ""}
            </p>

            {item.itemStatus && item.itemStatus !== "active" ? (
              <span className="item-detail-status-badge">{item.itemStatus}</span>
            ) : null}

            {item.vibes.length > 0 ? (
              <div className="item-detail-vibes">
                {item.vibes.map((v) => (
                  <span key={v} className="edit-chip">{v}</span>
                ))}
              </div>
            ) : null}

            <div className="item-detail-actions">
              <Link href={`/closet/item/${item.id}/edit`} className="item-detail-action primary">
                Edit piece
              </Link>
              <Link href="/closet/gallery" className="item-detail-action">
                Gallery
              </Link>
              <Link href="/outfits" className="item-detail-action">
                Build outfit
              </Link>
            </div>
          </div>
        </section>

        {hasStyleNotes ? (
          <section className="item-detail-panel">
            <div className="item-detail-panel-head">
              <p className="eyebrow">Style notes</p>
              <h2 className="font-display item-detail-section-title">Styling</h2>
            </div>
            {item.stylingNotes ? (
              <p className="item-detail-note">{item.stylingNotes}</p>
            ) : null}
            {item.notes ? (
              <p className="item-detail-note mt-4">{item.notes}</p>
            ) : null}
          </section>
        ) : null}

        {hasScores ? (
          <section className="item-detail-panel">
            <div className="item-detail-panel-head">
              <p className="eyebrow">Scores</p>
              <h2 className="font-display item-detail-section-title">Rating</h2>
            </div>
            <div className="item-score-grid">
              <ScorePill label="Love" value={item.loveScore} />
              <ScorePill label="Versatility" value={item.versatilityScore} />
              <ScorePill label="Fit" value={item.fitConfidenceScore} />
              <ScorePill label="Capsule" value={item.capsuleValueScore} />
            </div>
          </section>
        ) : null}

        {hasDetails ? (
          <section className="item-detail-panel">
            <div className="item-detail-panel-head">
              <p className="eyebrow">Details</p>
              <h2 className="font-display item-detail-section-title">Piece info</h2>
            </div>
            <dl className="item-detail-dl">
              {item.brand ? (
                <div className="item-detail-dl-row">
                  <dt>Brand</dt>
                  <dd>{item.brand}</dd>
                </div>
              ) : null}
              {item.purchaseSource ? (
                <div className="item-detail-dl-row">
                  <dt>Purchased from</dt>
                  <dd>{item.purchaseSource}</dd>
                </div>
              ) : null}
              {item.paidPrice !== undefined && item.paidPrice !== null ? (
                <div className="item-detail-dl-row">
                  <dt>Paid</dt>
                  <dd>${item.paidPrice.toFixed(2)}</dd>
                </div>
              ) : null}
              {item.purchaseDate ? (
                <div className="item-detail-dl-row">
                  <dt>Purchased</dt>
                  <dd>{item.purchaseDate}</dd>
                </div>
              ) : null}
            </dl>
            {item.productUrl ? (
              <a
                href={item.productUrl}
                className="item-product-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                View product →
              </a>
            ) : null}
          </section>
        ) : null}

      </div>
    </main>
  );
}
