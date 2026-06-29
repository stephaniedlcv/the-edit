"use client";

import { useMemo, useState } from "react";
import type {
  ColorFamily,
  PatternType,
  StyleVibe,
  WardrobeCategory,
  WardrobeItem,
} from "@/types/wardrobe";
import {
  categoryOptions,
  colorFamilyOptions,
  colorNameByFamily,
  formatLabel,
  getPatternSubtypeOptions,
  getSizeOptions,
  getSubcategoryOptions,
  patternTypeOptions,
  vibeOptions,
} from "@/lib/taxonomy";

type ClosetItemEditFormProps = {
  item: WardrobeItem;
  onSaved?: (updatedItem: WardrobeItem) => void;
  onCancel?: () => void;
  mode?: "edit" | "create";
};

function parsePaidPrice(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);

  return Number.isNaN(parsed) || parsed < 0 ? null : Number(parsed.toFixed(2));
}

function parseScore(value: FormDataEntryValue | null) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return null;
  }

  const parsed = Number(rawValue);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return Math.max(0, Math.min(10, Math.round(parsed)));
}

function withCurrentValue(options: string[], currentValue?: string) {
  if (!currentValue || options.includes(currentValue)) {
    return options;
  }

  return [currentValue, ...options];
}

export function ClosetItemEditForm({ item, onSaved, onCancel, mode = "edit" }: ClosetItemEditFormProps) {
  const [category, setCategory] = useState<WardrobeCategory>(item.category);
  const [subcategory, setSubcategory] = useState(item.subcategory ?? "");
  const [colorFamily, setColorFamily] = useState<ColorFamily>(item.colorFamily);
  const [colorName, setColorName] = useState(item.colorName);
  const [patternType, setPatternType] = useState<PatternType | "">(item.patternType ?? "");
  const [patternSubtype, setPatternSubtype] = useState(item.patternSubtype ?? "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const isCreateMode = mode === "create";

  const subcategoryOptions = useMemo(
    () => withCurrentValue(getSubcategoryOptions(category), subcategory),
    [category, subcategory],
  );

  const sizeOptions = useMemo(
    () => withCurrentValue(getSizeOptions(category), item.size),
    [category, item.size],
  );

  const colorNameOptions = useMemo(
    () => withCurrentValue(colorNameByFamily[colorFamily], colorName),
    [colorFamily, colorName],
  );

  const patternSubtypeOptions = useMemo(
    () => withCurrentValue(getPatternSubtypeOptions(patternType), patternSubtype),
    [patternType, patternSubtype],
  );

  function handleCategoryChange(nextCategory: WardrobeCategory) {
    setCategory(nextCategory);
    const nextOptions = getSubcategoryOptions(nextCategory);

    if (!nextOptions.includes(subcategory)) {
      setSubcategory(nextOptions[0] ?? "");
    }
  }

  function handlePatternTypeChange(nextPatternType: PatternType | "") {
    setPatternType(nextPatternType);

    const nextOptions = getPatternSubtypeOptions(nextPatternType);
    if (!nextPatternType || !nextOptions.includes(patternSubtype)) {
      setPatternSubtype(nextOptions[0] ?? "");
    }
  }

  function handleColorFamilyChange(nextColorFamily: ColorFamily) {
    setColorFamily(nextColorFamily);
    const nextOptions = colorNameByFamily[nextColorFamily];

    if (!nextOptions.includes(colorName)) {
      setColorName(nextOptions[0]);
    }
  }

  async function handleSubmit(formData: FormData) {
    setSaveStatus("saving");
    setErrorMessage("");

    const payload = {
      name: String(formData.get("name") ?? ""),
      category: String(formData.get("category") ?? "") as WardrobeCategory,
      itemStatus: String(formData.get("itemStatus") ?? "active") as WardrobeItem["itemStatus"],
      subcategory: String(formData.get("subcategory") ?? ""),
      colorFamily: String(formData.get("colorFamily") ?? "") as ColorFamily,
      colorName: String(formData.get("colorName") ?? ""),
      patternType: String(formData.get("patternType") ?? "") as PatternType | "",
      patternSubtype: String(formData.get("patternSubtype") ?? ""),
      size: String(formData.get("size") ?? ""),
      brand: String(formData.get("brand") ?? ""),
      productUrl: String(formData.get("productUrl") ?? ""),
      paidPrice: parsePaidPrice(formData.get("paidPrice")),
      purchaseSource: String(formData.get("purchaseSource") ?? ""),
      purchaseDate: String(formData.get("purchaseDate") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      stylingNotes: String(formData.get("stylingNotes") ?? ""),
      vibes: formData.getAll("vibes").map(String) as StyleVibe[],
      loveScore: parseScore(formData.get("loveScore")),
      versatilityScore: parseScore(formData.get("versatilityScore")),
      fitConfidenceScore: parseScore(formData.get("fitConfidenceScore")),
      capsuleValueScore: parseScore(formData.get("capsuleValueScore")),
    };

    const response = await fetch(
      isCreateMode ? "/api/closet/items" : `/api/closet/items/${item.id}`,
      {
      method: isCreateMode ? "POST" : "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    );

    const result = (await response.json()) as { ok?: boolean; id?: string; error?: string };

    if (!response.ok || !result.ok) {
      setSaveStatus("error");
      setErrorMessage(result.error ?? "Could not save this closet item.");
      return;
    }

    const updatedItem: WardrobeItem = {
      ...item,
      id: result.id ?? item.id,
      name: payload.name,
      category: payload.category,
      itemStatus: payload.itemStatus || "active",
      subcategory: payload.subcategory || undefined,
      colorFamily: payload.colorFamily,
      colorName: payload.colorName,
      patternType: payload.patternType || undefined,
      patternSubtype: payload.patternSubtype || undefined,
      size: payload.size || undefined,
      brand: payload.brand || undefined,
      productUrl: payload.productUrl || undefined,
      paidPrice: payload.paidPrice ?? undefined,
      purchaseSource: payload.purchaseSource || undefined,
      purchaseDate: payload.purchaseDate || undefined,
      notes: payload.notes || undefined,
      stylingNotes: payload.stylingNotes || undefined,
      vibes: payload.vibes,
      loveScore: payload.loveScore ?? undefined,
      versatilityScore: payload.versatilityScore ?? undefined,
      fitConfidenceScore: payload.fitConfidenceScore ?? undefined,
      capsuleValueScore: payload.capsuleValueScore ?? undefined,
    };

    if (onSaved) {
      onSaved(updatedItem);
      return;
    }

    setSaveStatus("saved");
  }



  return (
    <section className="rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] p-7">
      <p className="eyebrow mb-3">{isCreateMode ? "Add item" : "Edit item"}</p>
      <h2 className="font-display text-4xl leading-none text-[var(--espresso)]">
        {isCreateMode ? "New closet piece" : item.name}
      </h2>
      <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
        {isCreateMode
          ? "Create a new owned closet item. Add details and attach a photo in the same flow."
          : "Use this form to correct color, category, size, brand, purchase info, scores, and styling notes."}
      </p>

      {saveStatus === "error" ? (
        <div className="mt-6 rounded-[3px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <form action={handleSubmit} className="mt-8 grid gap-5">

        <label className="grid gap-2">
          <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
            Name
          </span>
          <input
            name="name"
            defaultValue={item.name}
            required
            className="rounded-[3px] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
              Category
            </span>
            <select
              name="category"
              value={category}
              onChange={(event) =>
                handleCategoryChange(event.target.value as WardrobeCategory)
              }
              className="rounded-[3px] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm capitalize text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {formatLabel(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
              Type
            </span>
            <select
              name="subcategory"
              value={subcategory}
              onChange={(event) => setSubcategory(event.target.value)}
              className="rounded-[3px] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
            >
              <option value="">Not set</option>
              {subcategoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
              Size
            </span>
            <select
              name="size"
              defaultValue={item.size ?? "One Size"}
              className="rounded-[3px] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
            >
              <option value="">Not set</option>
              {sizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
              Color family
            </span>
            <select
              name="colorFamily"
              value={colorFamily}
              onChange={(event) =>
                handleColorFamilyChange(event.target.value as ColorFamily)
              }
              className="rounded-[3px] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm capitalize text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
            >
              {colorFamilyOptions.map((option) => (
                <option key={option} value={option}>
                  {formatLabel(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
              Color name
            </span>
            <select
              name="colorName"
              value={colorName}
              onChange={(event) => setColorName(event.target.value)}
              required
              className="rounded-[3px] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
            >
              {colorNameOptions.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
              Pattern type
            </span>
            <select
              name="patternType"
              value={patternType}
              onChange={(event) =>
                handlePatternTypeChange(event.target.value as PatternType | "")
              }
              className="rounded-[3px] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
            >
              {patternTypeOptions.map((option) => (
                <option key={option.value || "solid"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
              Pattern subtype
            </span>
            <select
              name="patternSubtype"
              value={patternSubtype}
              onChange={(event) => setPatternSubtype(event.target.value)}
              disabled={!patternType}
              className="rounded-[3px] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--espresso)] outline-none focus:border-[var(--coffee)] disabled:opacity-45"
            >
              <option value="">
                {!patternType ? "Choose pattern type first" : "Not set"}
              </option>
              {patternSubtypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
            Brand
          </span>
          <input
            name="brand"
            defaultValue={item.brand ?? ""}
            className="rounded-[3px] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
          />
        </label>

        <fieldset className="grid gap-3 rounded-[3px] border border-[var(--line)] bg-[var(--paper)] p-4">
          <legend className="px-2 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
            Vibes
          </legend>
          <div className="flex flex-wrap gap-3">
            {vibeOptions.map((vibe) => (
              <label
                key={vibe}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--coffee)]"
              >
                <input
                  type="checkbox"
                  name="vibes"
                  value={vibe}
                  defaultChecked={item.vibes.includes(vibe)}
                />
                {formatLabel(vibe)}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="grid gap-2">
          <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
            Product URL
          </span>
          <input
            name="productUrl"
            type="text"
            inputMode="url"
            defaultValue={item.productUrl ?? ""}
            placeholder="https://..."
            className="rounded-[3px] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
          />
        </label>

        <fieldset className="rounded-[4px] border border-[var(--line)] p-4">
          <legend className="px-2 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
            Item status
          </legend>

          <label className="mt-3 grid gap-2">
            <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
              Status
            </span>
            <select
              name="itemStatus"
              defaultValue={item.itemStatus ?? "active"}
              className="rounded-[3px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-sm text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="donated">Donated</option>
              <option value="sold">Sold</option>
              <option value="damaged">Damaged</option>
            </select>
          </label>
        </fieldset>

        <fieldset className="rounded-[4px] border border-[var(--line)] p-4">
          <legend className="px-2 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
            Purchase info
          </legend>

          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
                Paid price
              </span>
              <input
                name="paidPrice"
                type="number"
                min="0"
                step="0.01"
                defaultValue={item.paidPrice ?? ""}
                placeholder="24.99"
                className="rounded-[3px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-sm text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
                Purchase source
              </span>
              <input
                name="purchaseSource"
                type="text"
                defaultValue={item.purchaseSource ?? ""}
                placeholder="SHEIN, Zara, Marshalls..."
                className="rounded-[3px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-sm text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
                Purchase date
              </span>
              <input
                name="purchaseDate"
                type="date"
                defaultValue={item.purchaseDate ?? ""}
                className="rounded-[3px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-sm text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="grid gap-4 rounded-[3px] border border-[var(--line)] bg-[var(--paper)] p-4">
          <legend className="px-2 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
            Closet scores
          </legend>

          <div className="grid gap-4 md:grid-cols-4">
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                Love
              </span>
              <input
                name="loveScore"
                type="number"
                min="0"
                max="10"
                defaultValue={item.loveScore ?? ""}
                placeholder="0-10"
                className="rounded-[3px] border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                Versatility
              </span>
              <input
                name="versatilityScore"
                type="number"
                min="0"
                max="10"
                defaultValue={item.versatilityScore ?? ""}
                placeholder="0-10"
                className="rounded-[3px] border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                Fit
              </span>
              <input
                name="fitConfidenceScore"
                type="number"
                min="0"
                max="10"
                defaultValue={item.fitConfidenceScore ?? ""}
                placeholder="0-10"
                className="rounded-[3px] border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                Capsule
              </span>
              <input
                name="capsuleValueScore"
                type="number"
                min="0"
                max="10"
                defaultValue={item.capsuleValueScore ?? ""}
                placeholder="0-10"
                className="rounded-[3px] border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
              />
            </label>
          </div>
        </fieldset>

        <label className="grid gap-2">
          <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
            Notes
          </span>
          <textarea
            name="notes"
            defaultValue={item.notes ?? ""}
            rows={4}
            className="rounded-[3px] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm leading-6 text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
            Stylist notes
          </span>
          <textarea
            name="stylingNotes"
            defaultValue={item.stylingNotes ?? ""}
            rows={5}
            className="rounded-[3px] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm leading-6 text-[var(--espresso)] outline-none focus:border-[var(--coffee)]"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3 pt-3">
          <button
            type="submit"
            className="rounded-full border border-[var(--espresso)] bg-[var(--espresso)] px-5 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white"
          >
            {saveStatus === "saving" ? "Saving..." : isCreateMode ? "Create piece" : "Save changes"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[var(--line)] px-5 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--coffee)]"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
