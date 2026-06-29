"use client";

import { useState } from "react";
import {
  BuyOrderFilter,
  matchesFilter,
  type BuyOrderFilterId,
} from "@/components/buy-order-filter";
import { WishlistCard } from "@/components/wishlist-card";
import type { WishlistItem } from "@/types/wardrobe";
import { mockWishlistItems } from "@/lib/mock-wishlist-items";

function sortWishlistItems(items: WishlistItem[]) {
  return [...items].sort((a, b) => {
    if (a.purchaseOrder !== b.purchaseOrder) {
      return a.purchaseOrder - b.purchaseOrder;
    }

    if (b.closetImpactScore !== a.closetImpactScore) {
      return b.closetImpactScore - a.closetImpactScore;
    }

    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }

    return b.outfitPotential - a.outfitPotential;
  });
}

function filteredTitle(activeFilter: BuyOrderFilterId) {
  if (activeFilter === "foundation-buys") return "Foundation buys";
  if (activeFilter === "color-builders") return "Color builders";
  if (activeFilter === "statement-review") return "Statement review";
  if (activeFilter === "price-watch") return "Price watch";
  if (activeFilter === "buy-priority") return "Priority picks";
  if (activeFilter === "consider") return "Consider list";

  return "Selected pieces";
}

export function WishlistPriorityBoard() {
  const [activeFilter, setActiveFilter] = useState<BuyOrderFilterId>("all");

  const filteredItems = sortWishlistItems(
    mockWishlistItems.filter((item) => matchesFilter(item, activeFilter)),
  );

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-10 md:px-10 md:pb-20 md:pt-12">
      <BuyOrderFilter
        items={mockWishlistItems}
        active={activeFilter}
        onChange={setActiveFilter}
      />

      {activeFilter === "all" ? (
        <section>
          <div className="mb-6 border-t border-[var(--line)] pt-7">
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-[var(--caramel)]">
              Full wishlist
            </p>

            <h3 className="font-display mt-3 text-4xl text-[var(--espresso)]">
              All wishlist pieces
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
              Every piece together, ordered by purchase priority and closet
              impact. Use the filters above when you want to narrow the edit.
            </p>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <WishlistCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-[3px] border border-dashed border-[var(--line)] bg-[var(--paper-2)] p-10 text-center">
              <p className="font-display text-3xl text-[var(--espresso)]">
                No wishlist pieces yet.
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--ink-soft)]">
                Add a wishlist piece when you identify a new closet priority.
              </p>
            </div>
          )}
        </section>
      ) : (
        <section>
          <div className="mb-6 border-t border-[var(--line)] pt-7">
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-[var(--caramel)]">
              Filtered edit
            </p>

            <h3 className="font-display mt-3 text-4xl text-[var(--espresso)]">
              {filteredTitle(activeFilter)}
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
              Showing only the pieces that match this filter, ordered by purchase
              priority and closet impact.
            </p>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <WishlistCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-[3px] border border-dashed border-[var(--line)] bg-[var(--paper-2)] p-10 text-center">
              <p className="font-display text-3xl text-[var(--espresso)]">
                No pieces match this filter.
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--ink-soft)]">
                Try another wishlist filter or add a new item to this category.
              </p>
            </div>
          )}
        </section>
      )}
    </section>
  );
}
