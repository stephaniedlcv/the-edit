"use client";

import { useMemo, useState } from "react";
import { outfitLooks, type OutfitBoardFilter } from "@/lib/mock-outfits";
import { OutfitCollageCard } from "@/components/outfit-collage-card";
import { PageHeader } from "@/components/page-header";

const filters: {
  id: OutfitBoardFilter;
  label: string;
  caption: string;
}[] = [
  {
    id: "all",
    label: "All looks",
    caption: "Every saved look and outfit formula, in collage view.",
  },
  {
    id: "work",
    label: "Work",
    caption: "Office-ready looks with polish, structure, and ease.",
  },
  {
    id: "friday-office",
    label: "Friday office",
    caption: "A softer office finish for denim-friendly workdays.",
  },
  {
    id: "casual-polish",
    label: "Casual polish",
    caption: "Relaxed looks that still feel styled and intentional.",
  },
  {
    id: "elevated-errands",
    label: "Elevated errands",
    caption: "Practical outfits that still feel dressed and refined.",
  },
  {
    id: "saved-formulas",
    label: "Saved formulas",
    caption: "Repeatable outfit structures you can wear again and again.",
  },
];

export function OutfitBoard() {
  const [activeFilter, setActiveFilter] = useState<OutfitBoardFilter>("all");

  const visibleLooks = useMemo(() => {
    if (activeFilter === "all") return outfitLooks;

    return outfitLooks.filter((look) => look.filters.includes(activeFilter));
  }, [activeFilter]);

  const activeMeta =
    filters.find((filter) => filter.id === activeFilter) ?? filters[0];

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 md:px-10 md:pb-20">
      <PageHeader
        contained={false}
        eyebrow="Styled Looks"
        title="Outfit board"
        description="Collage-first outfit building for Stephanie Style OS. This is the Alta-inspired visual layer now, with space to evolve later into an on-you AI styling view based on your real body and proportions."
        asideEyebrow="Current mode"
        asideText="Transparent collage styling, before AI try-on."
      />

      <div className="pt-10 md:pt-12">
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3.5">
          {filters.map((filter) => {
            const isActive = filter.id === activeFilter;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className="inline-flex items-start gap-1.5 pb-2 transition-colors duration-300"
                style={{
                  borderBottom: `1.5px solid ${
                    isActive ? "var(--espresso)" : "transparent"
                  }`,
                }}
              >
                <span
                  className="font-display text-[1.55rem] leading-none transition-colors duration-300"
                  style={{
                    fontStyle: isActive ? "italic" : "normal",
                    color: isActive ? "var(--espresso)" : "#b7a185",
                  }}
                >
                  {filter.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-7 flex items-baseline gap-5">
          <span className="shrink-0 pt-1 text-[0.6rem] font-medium uppercase tracking-[0.3em] text-[var(--caramel)]">
            {activeFilter === "all"
              ? `Full board · ${String(outfitLooks.length).padStart(2, "0")} looks`
              : `${String(visibleLooks.length).padStart(2, "0")} of ${String(
                  outfitLooks.length,
                ).padStart(2, "0")} looks`}
          </span>
          <span className="h-[26px] w-px shrink-0 bg-[var(--line)]" />
          <p className="font-display m-0 text-[1.55rem] italic leading-tight text-[var(--coffee)]">
            {activeMeta.caption}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {visibleLooks.map((look) => (
          <OutfitCollageCard key={look.id} look={look} />
        ))}
      </div>
    </section>
  );
}
