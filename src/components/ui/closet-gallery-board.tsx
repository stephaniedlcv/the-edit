"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type {
  ColorFamily,
  StyleVibe,
  WardrobeCategory,
  WardrobeItem,
  WardrobeItemStatus,
} from "@/types/wardrobe";
import { colorFamilyOptions, vibeOptions } from "@/lib/taxonomy";

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

const COLOR_LABELS: Record<ColorFamily, string> = {
  black: "Black",
  brown: "Brown",
  cream: "Cream",
  beige: "Beige",
  white: "White",
  burgundy: "Burgundy",
  olive: "Olive",
  camel: "Camel",
  plum: "Plum",
  mustard: "Mustard",
  denim: "Denim",
  blue: "Blue",
  pink: "Pink",
  gray: "Gray",
  orange: "Orange",
  metallic: "Metallic",
  multicolor: "Multi",
  statement: "Statement",
};

const VIBE_LABELS: Record<StyleVibe, string> = {
  classic: "Classic",
  minimal: "Minimal",
  elevated: "Elevated",
  work: "Work",
  tropical: "Tropical",
  statement: "Statement",
  casual: "Casual",
};

const STATUS_LABELS: Record<WardrobeItemStatus, string> = {
  active: "Active",
  archived: "Archived",
  donated: "Donated",
  sold: "Sold",
  damaged: "Damaged",
};

const STATUS_ORDER: WardrobeItemStatus[] = [
  "active",
  "archived",
  "donated",
  "sold",
  "damaged",
];

type ScoreFilter = "high" | "low" | "needs-review";

const SCORE_OPTIONS: { value: ScoreFilter; label: string }[] = [
  { value: "high", label: "High ≥7" },
  { value: "low", label: "Low ≤4" },
  { value: "needs-review", label: "Needs review" },
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
  const [selectedColor, setSelectedColor] = useState<ColorFamily | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<WardrobeItemStatus | "all">("all");
  const [selectedVibe, setSelectedVibe] = useState<StyleVibe | "all">("all");
  const [selectedScore, setSelectedScore] = useState<ScoreFilter | "all">("all");

  const availableColors = useMemo(() => {
    const seen = new Set<ColorFamily>();
    items.forEach((item) => seen.add(item.colorFamily));
    return colorFamilyOptions.filter((c) => seen.has(c));
  }, [items]);

  const availableVibes = useMemo(() => {
    const seen = new Set<StyleVibe>();
    items.forEach((item) => item.vibes.forEach((v) => seen.add(v)));
    return vibeOptions.filter((v) => seen.has(v));
  }, [items]);

  const availableStatuses = useMemo(() => {
    const seen = new Set<WardrobeItemStatus>();
    items.forEach((item) => seen.add(item.itemStatus ?? "active"));
    return STATUS_ORDER.filter((s) => seen.has(s));
  }, [items]);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchesCategory =
          selectedCategory === "all" || item.category === selectedCategory;

        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.colorName.toLowerCase().includes(q) ||
          (item.brand ?? "").toLowerCase().includes(q);

        const matchesColor =
          selectedColor === "all" || item.colorFamily === selectedColor;

        const matchesStatus =
          selectedStatus === "all" ||
          (item.itemStatus ?? "active") === selectedStatus;

        const matchesVibe =
          selectedVibe === "all" || item.vibes.includes(selectedVibe);

        const avg = getAverageScore(item);
        const matchesScore =
          selectedScore === "all" ||
          (selectedScore === "high" && avg !== null && avg >= 7) ||
          (selectedScore === "low" && avg !== null && avg <= 4) ||
          (selectedScore === "needs-review" && avg === null);

        return (
          matchesCategory &&
          matchesSearch &&
          matchesColor &&
          matchesStatus &&
          matchesVibe &&
          matchesScore
        );
      }),
    [
      items,
      selectedCategory,
      searchQuery,
      selectedColor,
      selectedStatus,
      selectedVibe,
      selectedScore,
    ],
  );

  const hasActiveFilters =
    selectedCategory !== "all" ||
    searchQuery !== "" ||
    selectedColor !== "all" ||
    selectedStatus !== "all" ||
    selectedVibe !== "all" ||
    selectedScore !== "all";

  function clearAllFilters() {
    setSelectedCategory("all");
    setSearchQuery("");
    setSelectedColor("all");
    setSelectedStatus("all");
    setSelectedVibe("all");
    setSelectedScore("all");
  }

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
        <Link href="/closet/add" className="gallery-v2-add-btn">
          + Add piece
        </Link>
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

      <div className="gallery-filters">
        <div className="gallery-filter-row" role="group" aria-label="Filter by color">
          <span className="gf-row-label">Color</span>
          <button
            type="button"
            className={selectedColor === "all" ? "gf-chip active" : "gf-chip"}
            onClick={() => setSelectedColor("all")}
          >
            All
          </button>
          {availableColors.map((color) => (
            <button
              key={color}
              type="button"
              className={selectedColor === color ? "gf-chip active" : "gf-chip"}
              onClick={() =>
                setSelectedColor(selectedColor === color ? "all" : color)
              }
            >
              {COLOR_LABELS[color]}
            </button>
          ))}
        </div>

        <div className="gallery-filter-row" role="group" aria-label="Filter by status">
          <span className="gf-row-label">Status</span>
          <button
            type="button"
            className={selectedStatus === "all" ? "gf-chip active" : "gf-chip"}
            onClick={() => setSelectedStatus("all")}
          >
            All
          </button>
          {availableStatuses.map((status) => (
            <button
              key={status}
              type="button"
              className={selectedStatus === status ? "gf-chip active" : "gf-chip"}
              onClick={() =>
                setSelectedStatus(selectedStatus === status ? "all" : status)
              }
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        <div className="gallery-filter-row" role="group" aria-label="Filter by vibe">
          <span className="gf-row-label">Vibe</span>
          <button
            type="button"
            className={selectedVibe === "all" ? "gf-chip active" : "gf-chip"}
            onClick={() => setSelectedVibe("all")}
          >
            All
          </button>
          {availableVibes.map((vibe) => (
            <button
              key={vibe}
              type="button"
              className={selectedVibe === vibe ? "gf-chip active" : "gf-chip"}
              onClick={() =>
                setSelectedVibe(selectedVibe === vibe ? "all" : vibe)
              }
            >
              {VIBE_LABELS[vibe]}
            </button>
          ))}
        </div>

        <div className="gallery-filter-row" role="group" aria-label="Filter by score">
          <span className="gf-row-label">Score</span>
          <button
            type="button"
            className={selectedScore === "all" ? "gf-chip active" : "gf-chip"}
            onClick={() => setSelectedScore("all")}
          >
            All
          </button>
          {SCORE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={selectedScore === opt.value ? "gf-chip active" : "gf-chip"}
              onClick={() =>
                setSelectedScore(selectedScore === opt.value ? "all" : opt.value)
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="gallery-filter-status">
        <p className="gallery-filter-count">
          Showing <strong>{filtered.length}</strong> of {items.length} pieces
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            className="gallery-filter-clear"
            onClick={clearAllFilters}
          >
            × Clear filters
          </button>
        ) : null}
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
            Try adjusting your filters.
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-5 rounded-full bg-[var(--burgundy)] px-4 py-2 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-white"
            >
              Clear all filters
            </button>
          ) : null}
        </div>
      )}
    </>
  );
}
