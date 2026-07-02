"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  categoryOptions,
  colorFamilyOptions,
  colorNameByFamily,
  getSizeOptions,
  subcategoryOptionsByCategory,
} from "@/lib/taxonomy";
import type {
  ColorFamily,
  WardrobeCategory,
  WishlistDecision,
  WishlistPriorityTier,
  ClosetGap,
} from "@/types/wardrobe";

type FormState = {
  name: string;
  productUrl: string;
  brand: string;
  currentPrice: string;
  targetPrice: string;
  category: WardrobeCategory | "";
  subcategory: string;
  colorFamily: ColorFamily | "";
  colorName: string;
  size: string;
  decision: WishlistDecision;
  priorityTier: WishlistPriorityTier;
  closetGap: ClosetGap;
  duplicateRisk: "low" | "medium" | "high";
  priorityScore: number;
  outfitPotential: number;
  closetImpactScore: number;
  notes: string;
};

const DECISION_OPTIONS: { value: WishlistDecision; label: string }[] = [
  { value: "wishlist", label: "Wishlist — on the list, not yet committed" },
  { value: "buy-priority", label: "Priority buy — high signal, buy soon" },
  { value: "consider", label: "Consider — needs more review" },
  { value: "skip", label: "Skip — keeping for reference only" },
];

const TIER_OPTIONS: { value: WishlistPriorityTier; label: string }[] = [
  { value: "foundation-buys", label: "Foundation — builds the most outfits" },
  { value: "color-builders", label: "Color builder — adds intentional color" },
  { value: "statement-review", label: "Statement — review carefully before buying" },
];

const GAP_OPTIONS: { value: ClosetGap; label: string }[] = [
  { value: "accessory", label: "Accessory" },
  { value: "color", label: "Color" },
  { value: "silhouette", label: "Silhouette" },
  { value: "shoes", label: "Shoes" },
  { value: "workwear", label: "Workwear" },
  { value: "statement", label: "Statement" },
  { value: "tropical", label: "Tropical" },
];

const RISK_OPTIONS: { value: "low" | "medium" | "high"; label: string }[] = [
  { value: "low", label: "Low — nothing like it in my closet" },
  { value: "medium", label: "Medium — similar items exist" },
  { value: "high", label: "High — likely a duplicate" },
];

function ScoreInput({
  label,
  sublabel,
  value,
  onChange,
}: {
  label: string;
  sublabel: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="cf-group-label" style={{ border: "none", paddingTop: 0, marginTop: 0 }}>
        {label}
      </label>
      <p className="text-[0.72rem] text-[var(--ink-soft)] mb-3 leading-snug">{sublabel}</p>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1 accent-[var(--gold)]"
        />
        <span className="font-display text-[1.6rem] leading-none text-[var(--espresso)] w-7 text-right shrink-0">
          {value}
        </span>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[0.52rem] font-semibold uppercase tracking-[0.2em] text-[var(--coffee)] mb-1.5">
        {label}
        {required && <span className="text-[var(--burgundy)] ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{ appearance: "none", WebkitAppearance: "none" }}
        className="w-full rounded-[0.55rem] bg-[rgba(255,253,252,0.80)] border border-[rgba(122,46,53,0.13)] px-3.5 py-2.5 text-[0.9rem] text-[var(--espresso)] focus:outline-none focus:border-[var(--caramel)] transition-colors"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-[0.52rem] font-semibold uppercase tracking-[0.2em] text-[var(--coffee)] mb-1.5">
        {label}
        {required && <span className="text-[var(--burgundy)] ml-0.5">*</span>}
      </label>
      <input
        type={type ?? "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-[0.55rem] bg-[rgba(255,253,252,0.80)] border border-[rgba(122,46,53,0.13)] px-3.5 py-2.5 text-[0.9rem] text-[var(--espresso)] placeholder:text-[var(--ink-soft)] focus:outline-none focus:border-[var(--caramel)] transition-colors"
      />
      {hint && (
        <p className="mt-1 text-[0.65rem] text-[var(--ink-soft)] leading-snug">{hint}</p>
      )}
    </div>
  );
}

const INITIAL: FormState = {
  name: "",
  productUrl: "",
  brand: "",
  currentPrice: "",
  targetPrice: "",
  category: "",
  subcategory: "",
  colorFamily: "",
  colorName: "",
  size: "",
  decision: "wishlist",
  priorityTier: "foundation-buys",
  closetGap: "accessory",
  duplicateRisk: "low",
  priorityScore: 5,
  outfitPotential: 5,
  closetImpactScore: 5,
  notes: "",
};

export function AddWishlistClient() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    set("colorName", "");
    set("subcategory", "");
    set("size", "");
  }, [form.category]);

  useEffect(() => {
    set("colorName", "");
  }, [form.colorFamily]);

  const colorNameOptions = form.colorFamily
    ? colorNameByFamily[form.colorFamily].map((c) => ({ value: c, label: c }))
    : [];

  const subcategoryOptions = form.category
    ? subcategoryOptionsByCategory[form.category].map((s) => ({
        value: s,
        label: s,
      }))
    : [];

  const sizeOptions = form.category
    ? getSizeOptions(form.category).map((s) => ({ value: s, label: s }))
    : [];

  const canSubmit =
    form.name.trim() !== "" &&
    form.category !== "" &&
    form.colorFamily !== "" &&
    form.colorName.trim() !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || saving) return;
    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/wishlist/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category,
          colorFamily: form.colorFamily,
          colorName: form.colorName.trim(),
          subcategory: form.subcategory || undefined,
          size: form.size || undefined,
          brand: form.brand.trim() || undefined,
          productUrl: form.productUrl.trim() || undefined,
          currentPrice: form.currentPrice ? Number(form.currentPrice) : undefined,
          targetPrice: form.targetPrice ? Number(form.targetPrice) : undefined,
          notes: form.notes.trim() || undefined,
          decision: form.decision,
          priorityTier: form.priorityTier,
          closetGap: form.closetGap,
          duplicateRisk: form.duplicateRisk,
          priorityScore: form.priorityScore,
          outfitPotential: form.outfitPotential,
          closetImpactScore: form.closetImpactScore,
        }),
      });

      const json = (await res.json()) as { ok: boolean; error?: string };

      if (!json.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        setSaving(false);
        return;
      }

      router.push("/wishlist");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSaving(false);
    }
  }

  return (
    <div className="add-wishlist-page">
      <div className="add-piece-wrap">
        <header className="add-piece-header">
          <p className="eyebrow mb-3">New wishlist review</p>
          <h1 className="font-display add-piece-title">Add wishlist item</h1>
          <p className="add-piece-sub">
            Capture the piece before it becomes an impulse buy.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="add-piece-form-grid">

            {/* ── Card 1: Product basics ──────────────────────── */}
            <div className="ap-card-main">
              <p className="cf-group-label">Product basics</p>

              <TextField
                label="Piece name"
                required
                value={form.name}
                onChange={(v) => set("name", v)}
                placeholder="e.g. Wide-leg camel trousers"
              />

              <TextField
                label="Product URL"
                value={form.productUrl}
                onChange={(v) => set("productUrl", v)}
                placeholder="https://..."
                type="url"
                hint="Where to find it — store page, Instagram post, screenshot link."
              />

              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Brand / Store"
                  value={form.brand}
                  onChange={(v) => set("brand", v)}
                  placeholder="e.g. Zara"
                />
                <div />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Current price"
                  value={form.currentPrice}
                  onChange={(v) => set("currentPrice", v)}
                  placeholder="0.00"
                  type="number"
                />
                <TextField
                  label="Target price"
                  value={form.targetPrice}
                  onChange={(v) => set("targetPrice", v)}
                  placeholder="0.00"
                  type="number"
                  hint="The price you'd actually pull the trigger at."
                />
              </div>
            </div>

            {/* ── Card 2: Closet classification ───────────────── */}
            <div className="ap-card-main">
              <p className="cf-group-label">Closet classification</p>

              <SelectField
                label="Category"
                required
                value={form.category}
                onChange={(v) => set("category", v as WardrobeCategory)}
                placeholder="Select a category"
                options={categoryOptions.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
              />

              {form.category && subcategoryOptions.length > 0 && (
                <SelectField
                  label="Subcategory"
                  value={form.subcategory}
                  onChange={(v) => set("subcategory", v)}
                  placeholder="Select a subcategory"
                  options={subcategoryOptions}
                />
              )}

              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Color family"
                  required
                  value={form.colorFamily}
                  onChange={(v) => set("colorFamily", v as ColorFamily)}
                  placeholder="Select a color"
                  options={colorFamilyOptions.map((c) => ({
                    value: c,
                    label: c.charAt(0).toUpperCase() + c.slice(1),
                  }))}
                />

                {form.colorFamily ? (
                  <SelectField
                    label="Color name"
                    required
                    value={form.colorName}
                    onChange={(v) => set("colorName", v)}
                    placeholder="Select a shade"
                    options={colorNameOptions}
                  />
                ) : (
                  <div>
                    <label className="block text-[0.52rem] font-semibold uppercase tracking-[0.2em] text-[var(--coffee)] mb-1.5">
                      Color name <span className="text-[var(--burgundy)]">*</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value=""
                      placeholder="Select family first"
                      className="w-full rounded-[0.55rem] bg-[rgba(244,232,223,0.35)] border border-[rgba(122,46,53,0.08)] px-3.5 py-2.5 text-[0.9rem] text-[var(--ink-soft)] cursor-not-allowed"
                    />
                  </div>
                )}
              </div>

              {form.category && sizeOptions.length > 0 && (
                <SelectField
                  label="Size"
                  value={form.size}
                  onChange={(v) => set("size", v)}
                  placeholder="Select a size"
                  options={sizeOptions}
                />
              )}
            </div>

            {/* ── Card 3: Decision ────────────────────────────── */}
            <div className="ap-card-secondary">
              <p className="cf-group-label">Decision</p>

              <SelectField
                label="Buy decision"
                value={form.decision}
                onChange={(v) => set("decision", v as WishlistDecision)}
                options={DECISION_OPTIONS}
              />

              <SelectField
                label="Priority tier"
                value={form.priorityTier}
                onChange={(v) => set("priorityTier", v as WishlistPriorityTier)}
                options={TIER_OPTIONS}
              />

              <div>
                <label className="block text-[0.52rem] font-semibold uppercase tracking-[0.2em] text-[var(--coffee)] mb-1.5">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Why this piece? What gap does it fill? Any styling notes."
                  rows={3}
                  className="w-full rounded-[0.55rem] bg-[rgba(255,253,252,0.80)] border border-[rgba(122,46,53,0.13)] px-3.5 py-2.5 text-[0.9rem] text-[var(--espresso)] placeholder:text-[var(--ink-soft)] focus:outline-none focus:border-[var(--caramel)] transition-colors resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* ── Card 4: Intelligence scores ──────────────────── */}
            <div className="ap-card-secondary">
              <p className="cf-group-label">Intelligence scores</p>

              <div className="grid gap-5 pt-1">
                <ScoreInput
                  label="Priority score"
                  sublabel="How urgently does your wardrobe need this? 0 = low, 10 = immediate."
                  value={form.priorityScore}
                  onChange={(v) => set("priorityScore", v)}
                />
                <ScoreInput
                  label="Outfit potential"
                  sublabel="How many outfits can you build around this piece?"
                  value={form.outfitPotential}
                  onChange={(v) => set("outfitPotential", v)}
                />
                <ScoreInput
                  label="Closet impact"
                  sublabel="How much does this change what's possible in your wardrobe?"
                  value={form.closetImpactScore}
                  onChange={(v) => set("closetImpactScore", v)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <SelectField
                  label="Duplicate risk"
                  value={form.duplicateRisk}
                  onChange={(v) => set("duplicateRisk", v as "low" | "medium" | "high")}
                  options={RISK_OPTIONS}
                />
                <SelectField
                  label="Closet gap it fills"
                  value={form.closetGap}
                  onChange={(v) => set("closetGap", v as ClosetGap)}
                  options={GAP_OPTIONS}
                />
              </div>
            </div>

            {/* ── Actions ──────────────────────────────────────── */}
            {error && (
              <div className="rounded-[0.7rem] border border-[rgba(122,46,53,0.20)] bg-[rgba(122,46,53,0.05)] px-4 py-3">
                <p className="text-[0.8rem] text-[var(--burgundy)] leading-snug">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1 pb-6">
              <button
                type="submit"
                disabled={!canSubmit || saving}
                style={{ appearance: "none", WebkitAppearance: "none" }}
                className="inline-flex items-center justify-center rounded-full bg-[var(--espresso)] px-6 py-3 text-[0.52rem] font-semibold uppercase tracking-[0.2em] text-[#fffdfc] shadow-[0_6px_18px_rgba(36,26,18,0.22)] transition-all duration-200 hover:bg-[var(--coffee)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save to wishlist"}
              </button>

              <Link
                href="/wishlist"
                className="inline-flex items-center justify-center rounded-full border border-[rgba(36,26,18,0.15)] bg-transparent px-5 py-3 text-[0.52rem] font-semibold uppercase tracking-[0.2em] text-[var(--coffee)] transition-all duration-200 hover:border-[rgba(36,26,18,0.30)]"
              >
                Cancel
              </Link>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
