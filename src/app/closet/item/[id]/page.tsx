export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { getWardrobeItemById } from "@/lib/wardrobe/data";
import type { WardrobeItem } from "@/types/wardrobe";
import { ClosetItemLifecycleAction } from "@/components/ui/closet-item-lifecycle-action";

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

function ScoreChip({ label, value }: { label: string; value?: number }) {
  if (value === undefined || value === null) return null;
  return (
    <div className="item-d-score-chip">
      <em>{label}</em>
      <span>{value}</span>
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
  const hasStyleNotes = !!(item.stylingNotes || item.notes);
  const hasDetails = !!(
    item.brand ||
    item.purchaseSource ||
    (item.paidPrice !== undefined && item.paidPrice !== null) ||
    item.purchaseDate ||
    item.productUrl
  );

  return (
    <section className="item-detail">
      <div className="item-d-wrap">

        <nav className="item-d-nav">
          <Link href="/closet/gallery" className="item-d-back">← Gallery</Link>
          <Link href="/closet" className="item-d-back">Dashboard</Link>
        </nav>

        <header className="item-d-identity">
          {item.itemStatus && item.itemStatus !== "active" ? (
            <span className="item-d-status-badge">{item.itemStatus}</span>
          ) : null}
          <h1 className="font-display item-d-name">{item.name}</h1>
          <p className="item-d-sub">
            {item.colorName}
            {item.size ? ` · ${item.size}` : ""}
          </p>
        </header>

        <div className="item-d-image-wrap">
          {item.imageUrl ? (
            <div
              className="item-d-image"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
              role="img"
              aria-label={item.name}
            />
          ) : (
            <div className="item-d-image--empty">
              <p className="font-display text-2xl leading-none text-[var(--espresso)]">
                {item.name}
              </p>
            </div>
          )}
          <span className="item-d-cat-badge">
            {CATEGORY_LABELS[item.category] ?? item.category}
          </span>
          {avgScore !== null ? (
            <span className="item-d-score-badge">{avgScore}</span>
          ) : null}
        </div>

        {item.vibes.length > 0 ? (
          <div className="item-d-vibes">
            {item.vibes.map((v) => (
              <span key={v} className="item-d-vibe">{v}</span>
            ))}
          </div>
        ) : null}

        <div className="item-d-actions">
          <Link href={`/closet/item/${item.id}/edit`} className="item-d-btn primary">
            Edit piece
          </Link>
          <Link href={`/outfits?pieceId=${item.id}`} className="item-d-btn">
            Style it
          </Link>
        </div>

        {hasStyleNotes ? (
          <section className="item-d-panel">
            <p className="item-d-panel-label">Styling notes</p>
            {item.stylingNotes ? (
              <p className="item-d-note">{item.stylingNotes}</p>
            ) : null}
            {item.notes ? (
              <p className="item-d-note">{item.notes}</p>
            ) : null}
          </section>
        ) : null}

        {hasScores ? (
          <section className="item-d-panel">
            <p className="item-d-panel-label">Scores</p>
            <div className="item-d-scores">
              <ScoreChip label="Love" value={item.loveScore} />
              <ScoreChip label="Vers" value={item.versatilityScore} />
              <ScoreChip label="Fit" value={item.fitConfidenceScore} />
              <ScoreChip label="Capsule" value={item.capsuleValueScore} />
            </div>
          </section>
        ) : null}

        {hasDetails ? (
          <section className="item-d-panel">
            <p className="item-d-panel-label">Piece info</p>
            <dl className="item-d-dl">
              {item.brand ? (
                <div className="item-d-dl-row">
                  <dt>Brand</dt>
                  <dd>{item.brand}</dd>
                </div>
              ) : null}
              {item.purchaseSource ? (
                <div className="item-d-dl-row">
                  <dt>Source</dt>
                  <dd>{item.purchaseSource}</dd>
                </div>
              ) : null}
              {item.paidPrice !== undefined && item.paidPrice !== null ? (
                <div className="item-d-dl-row">
                  <dt>Paid</dt>
                  <dd>${item.paidPrice.toFixed(2)}</dd>
                </div>
              ) : null}
              {item.purchaseDate ? (
                <div className="item-d-dl-row">
                  <dt>Date</dt>
                  <dd>{item.purchaseDate}</dd>
                </div>
              ) : null}
            </dl>
            {item.productUrl ? (
              <a
                href={item.productUrl}
                className="item-d-product-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                View product →
              </a>
            ) : null}
          </section>
        ) : null}

        <ClosetItemLifecycleAction item={item} />

      </div>
    </section>
  );
}
