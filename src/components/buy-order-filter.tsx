"use client";

import Link from "next/link";
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
    label: "Todo",
    desc: "Cada pieza, ordenada por nivel de prioridad.",
  },
  {
    id: "foundation-buys",
    label: "Bases",
    desc: "Comprar primero — construyen el mayor número de looks.",
  },
  {
    id: "color-builders",
    label: "Color",
    desc: "Añade color intencional y útil al clóset.",
  },
  {
    id: "statement-review",
    label: "Statement",
    desc: "Revisar con cuidado antes de comprar.",
  },
  {
    id: "price-watch",
    label: "Price watch",
    desc: "En seguimiento, esperando el momento justo.",
  },
  {
    id: "buy-priority",
    label: "Prioridad",
    desc: "Mayor señal de compra ahora mismo.",
  },
  {
    id: "consider",
    label: "Considerar",
    desc: "Necesita más revisión antes de ganarse un lugar.",
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
    return `Lista completa · ${totalCount} deseos`;
  }

  return `${String(activeCount).padStart(2, "0")} de ${String(
    totalCount,
  ).padStart(2, "0")} deseos`;
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
    <div className="mb-10 rounded-[3px] bg-[var(--paper-2)] px-5 py-7 shadow-[0_0_0_1px_rgba(95,63,50,0.07),0_2px_12px_rgba(36,26,18,0.04)] md:px-7">
      <div className="mb-8 flex items-end justify-between gap-8">
        <div>
          <p className="eyebrow mb-3">Orden de compra</p>
          <h2 className="font-display text-[2.8rem] leading-none text-[var(--espresso)] md:text-5xl">
            El filtro
          </h2>
        </div>

        <Link
          href="/wishlist/add"
          className="pb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--gold)] hover:text-[var(--caramel)] transition-colors"
        >
          + Añadir
        </Link>
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
