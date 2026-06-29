import type { WishlistItem } from "@/types/wardrobe";
import { AtelierPlaceholder } from "@/components/atelier-placeholder";

type WishlistCardProps = {
  item: WishlistItem;
};

const decisionLabel: Record<WishlistItem["decision"], string> = {
  "buy-priority": "Priority buy",
  wishlist: "Wishlist",
  consider: "Consider",
  skip: "Skip",
};

const tierLabel: Record<WishlistItem["priorityTier"], string> = {
  "foundation-buys": "Foundation",
  "color-builders": "Color builder",
  "statement-review": "Statement review",
};

function formatMoney(value?: number) {
  if (typeof value !== "number") return "—";
  return `$${value.toFixed(2)}`;
}

function MiniPriceLine({ item }: { item: WishlistItem }) {
  const history = item.priceHistory ?? [];
  if (history.length < 2) {
    return <div className="h-px w-full bg-[var(--line)]" />;
  }

  const prices = history.map((point) => point.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = prices
    .map((price, index) => {
      const x = (index / (prices.length - 1)) * 100;
      const y = 100 - ((price - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-9 w-full overflow-visible" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[var(--coffee)]"
      />
    </svg>
  );
}

export function WishlistCard({ item }: WishlistCardProps) {
  return (
    <article className="group overflow-hidden rounded-[4px] border border-[var(--line)] bg-[var(--paper)] shadow-[0_18px_60px_rgba(74,47,34,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(74,47,34,0.1)]">
      <div className="bg-[var(--paper-2)] p-4">
        {item.imageUrl ? (
          <div
            className="h-[20rem] rounded-[3px] bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${item.imageUrl})` }}
            aria-label={item.name}
          />
        ) : (
          <AtelierPlaceholder
            name={item.name}
            colorName={item.colorName}
            colorFamily={item.colorFamily}
            category={item.category}
            className="h-[20rem]"
          />
        )}
      </div>

      <div className="px-6 pb-6 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
              #{String(item.purchaseOrder).padStart(2, "0")} · {tierLabel[item.priorityTier]}
            </p>
            <h3 className="font-display mt-2 text-[2rem] leading-none text-[var(--espresso)]">
              {item.name}
            </h3>
          </div>

          <span className="rounded-full border border-[var(--line)] px-3 py-1 text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-[var(--coffee)]">
            {decisionLabel[item.decision]}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-3 border-y border-[var(--line)] py-4 text-center">
          <div>
            <p className="font-display text-2xl text-[var(--espresso)]">
              {item.priorityScore}
            </p>
            <p className="mt-1 text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Priority
            </p>
          </div>
          <div className="border-x border-[var(--line)]">
            <p className="font-display text-2xl text-[var(--espresso)]">
              {item.outfitPotential}
            </p>
            <p className="mt-1 text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Outfits
            </p>
          </div>
          <div>
            <p className="font-display text-2xl text-[var(--espresso)]">
              {item.closetImpactScore}
            </p>
            <p className="mt-1 text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Impact
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_7rem] items-end gap-5">
          <div>
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[var(--caramel)]">
              Price signal
            </p>
            <div className="mt-2">
              <MiniPriceLine item={item} />
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl text-[var(--espresso)]">
              {formatMoney(item.currentPrice)}
            </p>
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              Target {formatMoney(item.targetPrice)}
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-[var(--ink-soft)]">
          {item.notes}
        </p>
      </div>
    </article>
  );
}
