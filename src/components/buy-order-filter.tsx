"use client";

import type {
  WishlistDecision,
  WishlistItem,
  WishlistPriorityTier,
} from "@/types/wardrobe";

export type BuyOrderFilterId =
  | "all"
  | WishlistPriorityTier
  | "price-watch"
  | WishlistDecision;

type FilterDef = {
  id: BuyOrderFilterId;
  label: string;
  desc: string;
};

const FILTERS: FilterDef[] = [
  {
    id: "all",
    label: "Full wishlist",
    desc: "Every piece, sorted by purchase tier.",
  },
  {
    id: "foundation-buys",
    label: "Foundation",
    desc: "Buy first — these build the most outfits.",
  },
  {
    id: "color-builders",
    label: "Color",
    desc: "Adds intentional, useful color.",
  },
  {
    id: "statement-review",
    label: "Statement",
    desc: "Review carefully before buying.",
  },
  {
    id: "price-watch",
    label: "Price watch",
    desc: "Tracking, waiting for the right moment.",
  },
  {
    id: "buy-priority",
    label: "Priority",
    desc: "Highest buy signal right now.",
  },
  {
    id: "consider",
    label: "Consider",
    desc: "Needs more review before it earns a spot.",
  },
];

export function matchesFilter(item: WishlistItem, filterId: BuyOrderFilterId) {
  if (filterId === "all") return true;
  if (filterId === "price-watch") return item.priceWatch === true;

  if (
    filterId === "foundation-buys" ||
    filterId === "color-builders" ||
    filterId === "statement-review"
  ) {
    return item.priorityTier === filterId;
  }

  return item.decision === filterId;
}

function getCount(items: WishlistItem[], filterId: BuyOrderFilterId) {
  return items.filter((item) => matchesFilter(item, filterId)).length;
}

function metaFor({
  activeFilter,
  activeCount,
  totalCount,
}: {
  activeFilter: FilterDef;
  activeCount: number;
  totalCount: number;
}) {
  if (activeFilter.id === "all") {
    return `Full wishlist · ${totalCount} pieces`;
  }

  return `${String(activeCount).padStart(2, "0")} of ${String(
    totalCount,
  ).padStart(2, "0")} pieces`;
}

export function BuyOrderFilter({
  items,
  active,
  onChange,
}: {
  items: WishlistItem[];
  active: BuyOrderFilterId;
  onChange: (id: BuyOrderFilterId) => void;
}) {
  const activeFilter =
    FILTERS.find((filter) => filter.id === active) ?? FILTERS[0];

  const activeCount = getCount(items, activeFilter.id);
  const totalCount = items.length;

  return (
    <div className="mb-12 rounded-[2px] bg-[var(--paper-2)] px-6 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(36,26,18,0.05),0_16px_44px_rgba(36,26,18,0.08)] md:px-8">
      <div className="mb-8 flex items-end justify-between gap-8">
        <div>
          <p className="eyebrow mb-3">Shopping Discipline</p>
          <h2 className="font-display text-[2.8rem] leading-none text-[var(--espresso)] md:text-5xl">
            Buy order
          </h2>
        </div>

        <button
          type="button"
          className="pb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--gold)]"
        >
          + Review Item
        </button>
      </div>

      <div className="border-t border-[var(--line)] pt-6">
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-4 md:gap-x-10">
          {FILTERS.map((filter) => {
            const isActive = filter.id === active;
            const count = getCount(items, filter.id);

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onChange(filter.id)}
                className="inline-flex items-start gap-1.5 pb-2 transition-colors duration-300"
                style={{
                  borderBottom: `1px solid ${
                    isActive ? "var(--espresso)" : "transparent"
                  }`,
                }}
              >
                <span
                  className="font-display text-[1.5rem] leading-none transition-colors duration-300 md:text-[1.65rem]"
                  style={{
                    fontStyle: isActive ? "italic" : "normal",
                    color: isActive ? "var(--espresso)" : "var(--caramel)",
                  }}
                >
                  {filter.label}
                </span>

                <span
                  className="font-display text-[0.82rem] leading-none"
                  style={{
                    color: isActive ? "var(--gold)" : "var(--ink-soft)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        key={activeFilter.id}
        className="mt-7 flex flex-col gap-3 md:flex-row md:items-baseline md:gap-5"
        style={{
          animation: "buyOrderFadeUp 0.5s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <span className="shrink-0 pt-1 eyebrow">
          {metaFor({ activeFilter, activeCount, totalCount })}
        </span>

        <span className="hidden h-[26px] w-px shrink-0 bg-[var(--line)] md:block" />

        <p className="font-display m-0 text-[1.55rem] italic leading-tight text-[var(--coffee)]">
          {activeFilter.desc}
        </p>
      </div>
    </div>
  );
}
