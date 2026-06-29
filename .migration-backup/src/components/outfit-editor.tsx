"use client";

import { useEffect, useMemo, useState } from "react";
import { GeneratedOutfitVisual } from "@/components/generated-outfit-visual";
import type { WardrobeItem } from "@/types/wardrobe";

type LookMetadata = {
  title?: string;
  sourceOutfitId?: string;
  formula?: string;
  decision?: string;
  generatedPieceIds?: string[];
  scores?: Record<string, unknown>;
  stylingInstruction?: string;
  whyItWorks?: string[];
};

type OutfitEditorProps = {
  items: WardrobeItem[];
  closetItems: WardrobeItem[];
  lookMetadata?: LookMetadata;
};

type SlotId =
  | "outerwear"
  | "dress"
  | "top"
  | "bottom"
  | "shoes"
  | "bag"
  | "belt"
  | "eyewear"
  | "earrings"
  | "necklace"
  | "rings"
  | "bracelets"
  | "watch"
  | "hairAccessory"
  | "otherAccessory";

type SlotConfig = {
  id: SlotId;
  label: string;
  optional?: boolean;
  multiple?: boolean;
  filter: (item: WardrobeItem) => boolean;
};

type SelectionState = Partial<Record<SlotId, string[]>>;

function itemText(item: WardrobeItem) {
  return `${item.name} ${item.subcategory ?? ""}`.toLowerCase();
}

function includesAny(text: string, tokens: string[]) {
  return tokens.some((token) => text.includes(token));
}

function getSlotForItem(item: WardrobeItem): SlotId | null {
  const text = itemText(item);

  if (item.category === "outerwear") return "outerwear";
  if (item.category === "dress") return "dress";
  if (item.category === "top") return "top";
  if (item.category === "bottom") return "bottom";
  if (item.category === "shoes") return "shoes";
  if (item.category === "bag") return "bag";

  if (item.category === "accessory") {
    if (includesAny(text, ["belt", "correa"])) return "belt";
    if (includesAny(text, ["sunglasses", "glasses", "eyewear", "lentes", "gafas"])) return "eyewear";
    if (includesAny(text, ["hair", "headband", "scrunchie", "clip", "barrette", "pin", "accesorio de pelo"])) {
      return "hairAccessory";
    }

    return "otherAccessory";
  }

  if (item.category === "jewelry") {
    if (includesAny(text, ["earring", "earrings", "arete", "aretes", "hoop", "stud"])) return "earrings";
    if (includesAny(text, ["necklace", "collar", "chain", "pendant", "choker"])) return "necklace";
    if (includesAny(text, ["ring", "rings", "anillo", "anillos"])) return "rings";
    if (includesAny(text, ["bracelet", "bracelets", "pulsera", "pulseras", "bangle", "cuff"])) return "bracelets";
    if (includesAny(text, ["watch", "reloj"])) return "watch";

    return "otherAccessory";
  }

  return null;
}

const slots: SlotConfig[] = [
  { id: "outerwear", label: "Layer", optional: true, filter: (item) => getSlotForItem(item) === "outerwear" },
  { id: "dress", label: "Dress / Jumpsuit", optional: true, filter: (item) => getSlotForItem(item) === "dress" },
  { id: "top", label: "Top", optional: true, filter: (item) => getSlotForItem(item) === "top" },
  { id: "bottom", label: "Bottom", optional: true, filter: (item) => getSlotForItem(item) === "bottom" },
  { id: "shoes", label: "Shoes", optional: true, filter: (item) => getSlotForItem(item) === "shoes" },
  { id: "bag", label: "Bag", optional: true, filter: (item) => getSlotForItem(item) === "bag" },
  { id: "belt", label: "Belt", optional: true, filter: (item) => getSlotForItem(item) === "belt" },
  { id: "eyewear", label: "Eyewear / Sunglasses", optional: true, filter: (item) => getSlotForItem(item) === "eyewear" },
  { id: "earrings", label: "Earrings", optional: true, filter: (item) => getSlotForItem(item) === "earrings" },
  { id: "necklace", label: "Necklace", optional: true, filter: (item) => getSlotForItem(item) === "necklace" },
  { id: "rings", label: "Rings", optional: true, multiple: true, filter: (item) => getSlotForItem(item) === "rings" },
  { id: "bracelets", label: "Bracelets", optional: true, multiple: true, filter: (item) => getSlotForItem(item) === "bracelets" },
  { id: "watch", label: "Watch", optional: true, filter: (item) => getSlotForItem(item) === "watch" },
  { id: "hairAccessory", label: "Hair accessory", optional: true, filter: (item) => getSlotForItem(item) === "hairAccessory" },
  { id: "otherAccessory", label: "Other accessory", optional: true, multiple: true, filter: (item) => getSlotForItem(item) === "otherAccessory" },
];

function findSlot(slotId: SlotId) {
  return slots.find((slot) => slot.id === slotId);
}

function addToSelection(selection: SelectionState, slotId: SlotId, itemId: string) {
  const slot = findSlot(slotId);
  const current = selection[slotId] ?? [];

  if (slot?.multiple) {
    selection[slotId] = current.includes(itemId) ? current : [...current, itemId];
    return;
  }

  if (current.length === 0) {
    selection[slotId] = [itemId];
  }
}

function buildGeneratedSelection(items: WardrobeItem[]) {
  const selection: SelectionState = {};

  for (const item of items) {
    const slot = getSlotForItem(item);
    if (!slot) continue;
    addToSelection(selection, slot, item.id);
  }

  return selection;
}

function normalizeSavedSelection(
  value: unknown,
  generatedSelection: SelectionState,
  closetItems: WardrobeItem[],
): SelectionState {
  if (!value || typeof value !== "object") {
    return generatedSelection;
  }

  const normalized: SelectionState = { ...generatedSelection };
  const saved = value as Record<string, unknown>;

  for (const [savedSlotId, rawIds] of Object.entries(saved)) {
    const ids = Array.isArray(rawIds)
      ? rawIds.filter((id): id is string => typeof id === "string" && id.length > 0)
      : typeof rawIds === "string" && rawIds.length > 0
        ? [rawIds]
        : [];

    const fallbackSlot = slots.find((slot) => slot.id === savedSlotId)?.id;

    if (fallbackSlot) {
      normalized[fallbackSlot] = [];
    }

    for (const itemId of ids) {
      const item = closetItems.find((closetItem) => closetItem.id === itemId);
      const currentSlot = item ? getSlotForItem(item) : fallbackSlot;

      if (!currentSlot) continue;
      addToSelection(normalized, currentSlot, itemId);
    }
  }

  return normalized;
}

function sortForDropdown(items: WardrobeItem[]) {
  return [...items].sort((a, b) => {
    const scoreA =
      (a.loveScore ?? 0) +
      (a.versatilityScore ?? 0) +
      (a.fitConfidenceScore ?? 0) +
      (a.capsuleValueScore ?? 0);

    const scoreB =
      (b.loveScore ?? 0) +
      (b.versatilityScore ?? 0) +
      (b.fitConfidenceScore ?? 0) +
      (b.capsuleValueScore ?? 0);

    if (scoreA !== scoreB) return scoreB - scoreA;
    return a.name.localeCompare(b.name);
  });
}

export function OutfitEditor({ items, closetItems, lookMetadata }: OutfitEditorProps) {
  const storageKey = useMemo(
    () => `the-edit-outfit-edit:${items.map((item) => item.id).sort().join("|")}`,
    [items],
  );

  const generatedSelection = useMemo(() => buildGeneratedSelection(items), [items]);

  const [selection, setSelection] = useState<SelectionState>(generatedSelection);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "reset" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);

      if (!saved) {
        setSelection(generatedSelection);
        return;
      }

      setSelection(
        normalizeSavedSelection(JSON.parse(saved), generatedSelection, closetItems),
      );
    } catch {
      setSelection(generatedSelection);
    }
  }, [closetItems, generatedSelection, storageKey]);

  const editedItems = useMemo(() => {
    const seen = new Set<string>();

    return slots
      .flatMap((slot) => {
        return (selection[slot.id] ?? []).map((itemId) => {
          const item = closetItems.find((closetItem) => closetItem.id === itemId);
          return item ? { item, slot } : null;
        });
      })
      .filter((entry): entry is { item: WardrobeItem; slot: SlotConfig } => {
        if (!entry || seen.has(entry.item.id)) return false;
        seen.add(entry.item.id);
        return true;
      });
  }, [closetItems, selection]);

  const editedWardrobeItems = editedItems.map((entry) => entry.item);

  const editedPieceText = editedItems
    .map(({ item, slot }) => `${slot.label}: ${item.name}`)
    .join(" + ");

  function setSingleSlot(slotId: SlotId, itemId: string) {
    setSelection((current) => ({
      ...current,
      [slotId]: itemId ? [itemId] : [],
    }));

    setSaveStatus("idle");
    setSaveError(null);
  }

  function toggleMultiSlot(slotId: SlotId, itemId: string) {
    setSelection((current) => {
      const currentIds = current[slotId] ?? [];
      const nextIds = currentIds.includes(itemId)
        ? currentIds.filter((id) => id !== itemId)
        : [...currentIds, itemId];

      return {
        ...current,
        [slotId]: nextIds,
      };
    });

    setSaveStatus("idle");
    setSaveError(null);
  }

  async function saveChanges() {
    const selectedPieces = editedItems.map(({ item, slot }) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      subcategory: item.subcategory ?? null,
      slotId: slot.id,
      slotLabel: slot.label,
      colorFamily: item.colorFamily,
      colorName: item.colorName,
      imagePath: item.imagePath ?? null,
      imageUrl: null,
    }));

    const fallbackTitle =
      editedWardrobeItems
        .filter((item) => ["outerwear", "dress", "top", "bottom"].includes(item.category))
        .map((item) => item.name)
        .slice(0, 3)
        .join(" + ") || "Saved outfit";

    try {
      localStorage.setItem(storageKey, JSON.stringify(selection));
      setSaveStatus("saving");
      setSaveError(null);

      const response = await fetch("/api/outfits/saved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: lookMetadata?.title ?? fallbackTitle,
          status: "saved",
          source: "generated",
          sourceOutfitId: lookMetadata?.sourceOutfitId ?? items.map((item) => item.id).sort().join("|"),
          formula: lookMetadata?.formula,
          decision: lookMetadata?.decision,
          generatedPieceIds: lookMetadata?.generatedPieceIds ?? items.map((item) => item.id),
          editedPieceIds: editedWardrobeItems.map((item) => item.id),
          selectedPieces,
          scores: lookMetadata?.scores ?? {},
          stylingInstruction: lookMetadata?.stylingInstruction,
          whyItWorks: lookMetadata?.whyItWorks ?? [],
          notes: "Saved from generated outfit editor.",
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Could not save outfit.");
      }

      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("error");
      setSaveError(error instanceof Error ? error.message : "Could not save outfit.");
    }
  }

  function resetChanges() {
    localStorage.removeItem(storageKey);
    setSelection(generatedSelection);
    setSaveStatus("reset");
    setSaveError(null);
  }

  return (
    <div>
      <GeneratedOutfitVisual items={editedWardrobeItems} />

      <div className="mb-5 rounded-[6px] border border-[var(--line)] bg-[var(--paper-2)] p-4">
        <details>
          <summary className="cursor-pointer text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)]">
            Edit look
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {slots.map((slot) => {
              const options = sortForDropdown(closetItems.filter(slot.filter));
              if (options.length === 0) return null;

              if (slot.multiple) {
                return (
                  <fieldset
                    key={slot.id}
                    className="rounded-[4px] border border-[var(--line)] bg-[var(--paper)] p-3"
                  >
                    <legend className="px-1 text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-[var(--coffee)]">
                      {slot.label}
                    </legend>

                    <div className="mt-2 max-h-44 space-y-2 overflow-auto pr-1">
                      {options.map((item) => {
                        const checked = (selection[slot.id] ?? []).includes(item.id);

                        return (
                          <label
                            key={item.id}
                            className="flex items-start gap-2 text-sm leading-5 text-[var(--espresso)]"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleMultiSlot(slot.id, item.id)}
                              className="mt-1"
                            />
                            <span>
                              {item.name} · {item.colorName}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              }

              return (
                <label
                  key={slot.id}
                  className="block text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-[var(--coffee)]"
                >
                  {slot.label}
                  <select
                    value={selection[slot.id]?.[0] ?? ""}
                    onChange={(event) => setSingleSlot(slot.id, event.target.value)}
                    className="mt-2 block w-full rounded-[4px] border border-[var(--line)] bg-[var(--paper)] px-3 py-3 text-sm normal-case tracking-normal text-[var(--espresso)]"
                  >
                    {slot.optional ? <option value="">None</option> : null}
                    {options.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} · {item.colorName}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={saveChanges}
              className="rounded-full border border-[var(--espresso)] px-4 py-2 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[var(--espresso)]"
            >
              {saveStatus === "saving" ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              onClick={resetChanges}
              className="rounded-full border border-[var(--line)] px-4 py-2 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)]"
            >
              Reset to generated
            </button>

            {saveStatus !== "idle" ? (
              <span className="rounded-full border border-[rgba(88,119,74,0.28)] bg-[rgba(88,119,74,0.10)] px-4 py-2 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[var(--espresso)]">
                {saveStatus === "saving"
                  ? "Saving"
                  : saveStatus === "saved"
                    ? "Saved to Supabase"
                    : saveStatus === "error"
                      ? "Save failed"
                      : "Reset"}
              </span>
            ) : null}
          </div>

          {saveError ? (
            <p className="mt-3 text-xs leading-5 text-[var(--rust)]">
              {saveError}
            </p>
          ) : null}
        </details>

        <div className="mt-4 rounded-[4px] border border-[var(--line)] bg-[var(--paper)] p-4">
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[var(--caramel)]">
            Current edited pieces
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
            {editedPieceText || "No pieces selected."}
          </p>
        </div>
      </div>
    </div>
  );
}
