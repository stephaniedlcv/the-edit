"use client";

import { useState } from "react";
import Link from "next/link";
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

function GalleryCard({ item }: { item: WardrobeItem }) {
  const score = getAverageScore(item);

  return (
    <Link href={`/closet/item/${item.id}`} className="gallery-v2-card">
      <div className="gallery-v2-image">
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

        <span className="gallery-v2-type">{CATEGORY_LABELS[item.category]}</span>

        {score !== null ? (
          <span className="gallery-v2-score">{score}</span>
        ) : null}
      </div>

      <div className="gallery-v2-copy">
        <p>{item.colorName}{item.size ? ` · ${item.size}` : ""}</p>
        <h2 className="font-display">{item.name}</h2>
      </div>
    </Link>
  );
}

type Props = {
  items: WardrobeItem[];
  counts: Partial<Record<WardrobeCategory, number>>;
};

export function ClosetGalleryBoard({ items, counts }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<WardrobeCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = items.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.colorName.toLowerCase().includes(q) ||
      (item.brand ?? "").toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="gallery-v2-controls">
        <input
          type="search"
          placeholder="Search by name, color, or brand…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="gallery-v2-search-input"
          aria-label="Search closet"
        />
      </div>

      <div className="gallery-v2-chips" role="group" aria-label="Filter by category">
        <button
          type="button"
          className={selectedCategory === "all" ? "gallery-v2-chip active" : "gallery-v2-chip"}
          onClick={() => setSelectedCategory("all")}
        >
          All <strong>{items.length}</strong>
        </button>

        {CATEGORY_ORDER.map((category) => (
          <button
            key={category}
            type="button"
            className={
              selectedCategory === category ? "gallery-v2-chip active" : "gallery-v2-chip"
            }
            onClick={() => setSelectedCategory(category)}
          >
            {CATEGORY_LABELS[category]} <strong>{counts[category] ?? 0}</strong>
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="gallery-v2-grid">
          {filtered.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="gallery-v2-empty">
          <p className="font-display text-[2.4rem] leading-none text-[var(--espresso)]">
            No pieces match.
          </p>
          <p className="mt-3 text-sm text-[var(--ink-soft)]">
            Try a different category or clear the search.
          </p>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-5 rounded-full bg-[var(--burgundy)] px-4 py-2 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-white"
            >
              Clear search
            </button>
          ) : null}
        </div>
      )}
    </>
  );
}
