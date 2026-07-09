"use client";

import { useState } from "react";
import {
  BuyOrderFilter,
  matchesFilter,
  type BuyOrderFilterId,
} from "@/components/buy-order-filter";
import { WishlistCard } from "@/components/wishlist-card";
import type { WishlistItem } from "@/types/wardrobe";

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
  if (activeFilter === "foundation-buys") return "Bases del clóset";
  if (activeFilter === "color-builders")  return "Constructores de color";
  if (activeFilter === "statement-review") return "Revisión de statement";
  if (activeFilter === "price-watch")     return "Price watch";
  if (activeFilter === "buy-priority")    return "Prioridad de compra";
  if (activeFilter === "consider")        return "A considerar";

  return "Selección filtrada";
}

type WishlistPriorityBoardProps = {
  items: WishlistItem[];
};

export function WishlistPriorityBoard({ items }: WishlistPriorityBoardProps) {
  const [activeFilter, setActiveFilter] = useState<BuyOrderFilterId>("all");

  const filteredItems = sortWishlistItems(
    items.filter((item) => matchesFilter(item, activeFilter)),
  );

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-10 md:px-10 md:pb-20 md:pt-12">
        <div className="rounded-[2px] border border-dashed border-[var(--line)] bg-[var(--paper-2)] p-14 text-center">
          <p className="font-display text-3xl text-[var(--espresso)]">
            La lista está vacía.
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--ink-soft)]">
            Añade un deseo cuando identifiques una prioridad real para el clóset — piezas que comprarías por impacto, no por impulso.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-8 md:px-10 md:pb-20 md:pt-10">
      <BuyOrderFilter
        items={items}
        active={activeFilter}
        onChange={setActiveFilter}
      />

      {activeFilter === "all" ? (
        <section>
          <div className="mb-6 border-t border-[var(--line)] pt-7">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[var(--caramel)]">
              Lista completa
            </p>

            <h3 className="font-display mt-3 text-4xl text-[var(--espresso)]">
              Todos los deseos
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
              Cada pieza ordenada por prioridad de compra e impacto en el clóset. Usa los filtros para editar la vista.
            </p>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <WishlistCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2px] border border-dashed border-[var(--line)] bg-[var(--paper-2)] p-10 text-center">
              <p className="font-display text-3xl text-[var(--espresso)]">
                La lista está vacía.
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--ink-soft)]">
                Añade un deseo cuando identifiques una prioridad real para el clóset.
              </p>
            </div>
          )}
        </section>
      ) : (
        <section>
          <div className="mb-6 border-t border-[var(--line)] pt-7">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[var(--caramel)]">
              Vista filtrada
            </p>

            <h3 className="font-display mt-3 text-4xl text-[var(--espresso)]">
              {filteredTitle(activeFilter)}
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
              Solo las piezas que coinciden con este filtro, ordenadas por prioridad de compra e impacto.
            </p>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <WishlistCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2px] border border-dashed border-[var(--line)] bg-[var(--paper-2)] p-10 text-center">
              <p className="font-display text-3xl text-[var(--espresso)]">
                Ninguna pieza coincide.
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--ink-soft)]">
                Prueba otro filtro o añade una nueva pieza en esta categoría.
              </p>
            </div>
          )}
        </section>
      )}
    </section>
  );
}
