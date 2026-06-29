import Link from "next/link";
import { AtelierPlaceholder } from "@/components/atelier-placeholder";
import type { WardrobeItem } from "@/types/wardrobe";
function getClosetScore(item: ClosetCardProps["item"]) {
  const scores = [
    item.loveScore,
    item.versatilityScore,
    item.fitConfidenceScore,
    item.capsuleValueScore,
  ].filter((score): score is number => typeof score === "number");

  if (!scores.length) {
    return null;
  }

  const average =
    scores.reduce((total, score) => total + score, 0) / scores.length;

  return Number(average.toFixed(1));
}


type ClosetCardProps = {
  item: WardrobeItem;
  onSelect?: (item: WardrobeItem) => void;
};

function formatCategory(category: string) {
  return category.replace("-", " ");
}

function ClosetCardContent({ item }: { item: WardrobeItem }) {
  const closetScore = getClosetScore(item);
  return (
    <div className="flex h-full flex-col">
      <div className="bg-[var(--paper-2)] p-4">
        {item.imageUrl ? (
          <div
            className="h-[22rem] rounded-[3px] bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${item.imageUrl})` }}
            aria-label={item.name}
          />
        ) : (
          <AtelierPlaceholder
            name={item.name}
            colorName={item.colorName}
            colorFamily={item.colorFamily}
            category={formatCategory(item.category)}
            className="h-[22rem]"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6 pt-5 text-left">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
              {item.colorName} · {item.size ?? "One size"}
            </p>
            <h3 className="font-display mt-2 min-h-[6rem] text-[2rem] leading-none text-[var(--espresso)]">
              {item.name}
            </h3>
          </div>

          <p className="shrink-0 pt-1 text-right text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)]">
            Curated
          </p>
        </div>

        <p className="mt-5 text-[0.58rem] font-medium uppercase tracking-[0.22em] text-[var(--ink-soft)]">
          {item.vibes.join(" / ")}
        </p>

        {item.itemStatus && item.itemStatus !== "active" ? (
          <div className="mt-4 rounded-[3px] border border-[var(--line)] bg-[var(--paper-2)] px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--coffee)]">
            Status: {item.itemStatus}
          </div>
        ) : null}

        {closetScore !== null ? (
          <div className="mt-4 rounded-[3px] border border-[var(--coffee)] bg-[var(--paper)] px-3 py-2 text-center">
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
              Closet Score
            </p>
            <p className="mt-1 font-serif text-xl text-[var(--espresso)]">
              {closetScore}/10
            </p>
          </div>
        ) : null}

        {[
          ["Love", item.loveScore],
          ["Versatility", item.versatilityScore],
          ["Fit", item.fitConfidenceScore],
          ["Capsule", item.capsuleValueScore],
        ].some(([, score]) => typeof score === "number") ? (
          <div className="mt-4 grid grid-cols-2 gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
            {[
              ["Love", item.loveScore],
              ["Vers", item.versatilityScore],
              ["Fit", item.fitConfidenceScore],
              ["Caps", item.capsuleValueScore],
            ].map(([label, score]) =>
              typeof score === "number" ? (
                <span
                  key={label}
                  className="rounded-full border border-[var(--line)] px-2 py-1 text-center"
                >
                  {label} {score}/10
                </span>
              ) : null,
            )}
          </div>
        ) : null}

        {item.paidPrice || item.purchaseSource || item.purchaseDate ? (
          <div className="mt-4 rounded-[3px] border border-[var(--line)] bg-[var(--paper-2)] px-3 py-2 text-[0.62rem] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
            {item.paidPrice ? (
              <span className="mr-3">Paid ${item.paidPrice}</span>
            ) : null}
            {item.purchaseSource ? (
              <span className="mr-3">{item.purchaseSource}</span>
            ) : null}
            {item.purchaseDate ? <span>{item.purchaseDate}</span> : null}
          </div>
        ) : null}

        {item.productUrl ? (
          <a
            href={item.productUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="mt-4 inline-flex text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--coffee)] underline-offset-4 hover:underline"
          >
            Product link
          </a>
        ) : null}

        <div className="mt-auto border-t border-[var(--line)] pt-5">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
            Stylist&apos;s note
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
            {item.stylingNotes ?? item.notes}
          </p>
        </div>
      </div>
    </div>
  );
}

const cardClassName =
  "group block h-full w-full overflow-hidden rounded-[4px] border border-[var(--line)] bg-[var(--paper)] shadow-[0_18px_60px_rgba(74,47,34,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(74,47,34,0.1)]";

export function ClosetCard({ item, onSelect }: ClosetCardProps) {
  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(item)}
        className={cardClassName}
      >
        <ClosetCardContent item={item} />
      </button>
    );
  }

  return (
    <Link href={`/closet/${item.id}`} className={cardClassName}>
      <ClosetCardContent item={item} />
    </Link>
  );
}
