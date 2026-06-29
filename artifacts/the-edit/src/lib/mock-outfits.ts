import type { ColorFamily } from "@/types/wardrobe";

export type OutfitBoardFilter =
  | "all"
  | "work"
  | "friday-office"
  | "casual-polish"
  | "elevated-errands"
  | "saved-formulas";

export type OutfitPieceSlot =
  | "outerwear"
  | "top"
  | "bottom"
  | "shoes"
  | "bag"
  | "accessory";

export type OutfitPiece = {
  id: string;
  x?: string;
  y?: string;
  name: string;
  slot: OutfitPieceSlot;
  colorFamily: ColorFamily;
  colorName: string;
  top: string;
  left: string;
  width: string;
  height: string;
  rotate?: number;
  imageUrl?: string;
};

export type OutfitLook = {
  id: string;
  title: string;
  vibe: string;
  occasion: string;
  caption: string;
  notes: string;
  filters: Exclude<OutfitBoardFilter, "all">[];
  saved?: boolean;
  formula: string[];
  pieces: OutfitPiece[];
};

export const outfitLooks: OutfitLook[] = [
  {
    id: "open-blazer-vest-office",
    title: "Open Blazer Vest Office Formula",
    vibe: "Office polish",
    occasion: "Work",
    caption: "Polished, elongating, and relaxed in an expensive way.",
    notes:
      "The vest works best worn open. It creates a vertical line and feels office-ready without looking stiff.",
    filters: ["work", "saved-formulas"],
    saved: true,
    formula: [
      "Blazer vest",
      "Cream top",
      "Brown wide-leg pants",
      "Loafers",
      "Structured bag",
    ],
    pieces: [
      {
        id: "piece-1",
        name: "Warm Brown Blazer Vest",
        slot: "outerwear",
        colorFamily: "brown",
        colorName: "Warm Brown",
        top: "10%",
        left: "6%",
        width: "28%",
        height: "58%",
        rotate: -4,
      },
      {
        id: "piece-2",
        name: "Cream Top",
        slot: "top",
        colorFamily: "cream",
        colorName: "Soft Cream",
        top: "14%",
        left: "36%",
        width: "24%",
        height: "34%",
        rotate: 2,
      },
      {
        id: "piece-3",
        name: "Brown Wide Leg Pants",
        slot: "bottom",
        colorFamily: "brown",
        colorName: "Chocolate Brown",
        top: "24%",
        left: "58%",
        width: "24%",
        height: "55%",
        rotate: -2,
      },
      {
        id: "piece-4",
        name: "Loafers",
        slot: "shoes",
        colorFamily: "brown",
        colorName: "Espresso",
        top: "70%",
        left: "18%",
        width: "24%",
        height: "14%",
        rotate: -2,
      },
      {
        id: "piece-5",
        name: "Structured Bag",
        slot: "bag",
        colorFamily: "camel",
        colorName: "Camel",
        top: "64%",
        left: "68%",
        width: "18%",
        height: "16%",
        rotate: 4,
      },
    ],
  },
  {
    id: "friday-dark-denim",
    title: "Friday Dark Denim Formula",
    vibe: "Friday office",
    occasion: "Work",
    caption: "More relaxed, still clean, structured, and intentional.",
    notes:
      "Good Friday formula when denim is allowed. Dark denim keeps the look polished while feeling easier.",
    filters: ["work", "friday-office", "saved-formulas"],
    saved: true,
    formula: [
      "Blazer",
      "Elevated top",
      "Dark denim",
      "Loafers",
      "Work tote",
    ],
    pieces: [
      {
        id: "piece-1",
        name: "Black Blazer",
        slot: "outerwear",
        colorFamily: "black",
        colorName: "Black",
        top: "8%",
        left: "8%",
        width: "28%",
        height: "58%",
        rotate: -3,
      },
      {
        id: "piece-2",
        name: "Elevated Top",
        slot: "top",
        colorFamily: "cream",
        colorName: "Warm Ivory",
        top: "14%",
        left: "40%",
        width: "21%",
        height: "32%",
        rotate: 2,
      },
      {
        id: "piece-3",
        name: "Dark Denim Straight Leg Jeans",
        slot: "bottom",
        colorFamily: "denim",
        colorName: "Dark Denim",
        top: "24%",
        left: "60%",
        width: "23%",
        height: "54%",
        rotate: -2,
      },
      {
        id: "piece-4",
        name: "Loafers",
        slot: "shoes",
        colorFamily: "brown",
        colorName: "Deep Brown",
        top: "70%",
        left: "18%",
        width: "24%",
        height: "14%",
        rotate: -1,
      },
      {
        id: "piece-5",
        name: "Work Tote",
        slot: "bag",
        colorFamily: "brown",
        colorName: "Espresso",
        top: "60%",
        left: "72%",
        width: "16%",
        height: "18%",
        rotate: 4,
      },
    ],
  },
  {
    id: "warm-neutral-work",
    title: "Warm Neutral Work Formula",
    vibe: "Soft polish",
    occasion: "Work",
    caption: "Quiet, warm, and very repeatable for polished office days.",
    notes:
      "This formula makes getting dressed easier because the colors already work with the closet foundation.",
    filters: ["work", "casual-polish", "saved-formulas"],
    saved: true,
    formula: [
      "Beige blazer",
      "Neutral top",
      "Brown trousers",
      "Loafers",
      "Minimal bag",
    ],
    pieces: [
      {
        id: "piece-1",
        name: "Beige Blazer",
        slot: "outerwear",
        colorFamily: "beige",
        colorName: "Warm Beige",
        top: "10%",
        left: "8%",
        width: "28%",
        height: "56%",
        rotate: -4,
      },
      {
        id: "piece-2",
        name: "Neutral Top",
        slot: "top",
        colorFamily: "cream",
        colorName: "Cream",
        top: "14%",
        left: "38%",
        width: "22%",
        height: "32%",
        rotate: 1,
      },
      {
        id: "piece-3",
        name: "Brown Wide Leg Pants",
        slot: "bottom",
        colorFamily: "brown",
        colorName: "Chocolate Brown",
        top: "24%",
        left: "58%",
        width: "24%",
        height: "54%",
        rotate: -1,
      },
      {
        id: "piece-4",
        name: "Loafers",
        slot: "shoes",
        colorFamily: "camel",
        colorName: "Camel",
        top: "70%",
        left: "18%",
        width: "24%",
        height: "14%",
        rotate: 0,
      },
      {
        id: "piece-5",
        name: "Minimal Bag",
        slot: "bag",
        colorFamily: "beige",
        colorName: "Light Beige",
        top: "61%",
        left: "70%",
        width: "18%",
        height: "16%",
        rotate: 3,
      },
    ],
  },
  {
    id: "light-rose-soft-office",
    title: "Light Rose Soft Office",
    vibe: "Feminine polish",
    occasion: "Work",
    caption: "Soft color, grounded styling, and a cleaner office finish.",
    notes:
      "The rose blazer works best when the rest of the look stays grounded and quiet.",
    filters: ["casual-polish"],
    formula: [
      "Light rose blazer",
      "Cream top",
      "Dark denim",
      "Neutral shoe",
      "Simple bag",
    ],
    pieces: [
      {
        id: "piece-1",
        name: "Light Rose Blazer",
        slot: "outerwear",
        colorFamily: "statement",
        colorName: "Soft Rose",
        top: "10%",
        left: "7%",
        width: "29%",
        height: "56%",
        rotate: -3,
      },
      {
        id: "piece-2",
        name: "Cream Top",
        slot: "top",
        colorFamily: "cream",
        colorName: "Soft Cream",
        top: "15%",
        left: "39%",
        width: "22%",
        height: "31%",
        rotate: 1,
      },
      {
        id: "piece-3",
        name: "Dark Denim Straight Leg Jeans",
        slot: "bottom",
        colorFamily: "denim",
        colorName: "Dark Denim",
        top: "24%",
        left: "60%",
        width: "23%",
        height: "54%",
        rotate: -1,
      },
      {
        id: "piece-4",
        name: "Neutral Shoe",
        slot: "shoes",
        colorFamily: "beige",
        colorName: "Warm Beige",
        top: "70%",
        left: "18%",
        width: "24%",
        height: "14%",
        rotate: -1,
      },
      {
        id: "piece-5",
        name: "Simple Bag",
        slot: "bag",
        colorFamily: "beige",
        colorName: "Beige",
        top: "61%",
        left: "70%",
        width: "17%",
        height: "16%",
        rotate: 4,
      },
    ],
  },
  {
    id: "espresso-errand-polish",
    title: "Espresso Errand Polish",
    vibe: "Elevated casual",
    occasion: "Errands",
    caption: "Still put together, but easier and more day-to-day.",
    notes:
      "Useful for elevated errands or casual days when you still want a styled look rather than basic clothes.",
    filters: ["elevated-errands", "casual-polish"],
    formula: [
      "Black blazer",
      "Simple tee",
      "Dark denim",
      "Flat shoe",
      "Crossbody",
    ],
    pieces: [
      {
        id: "piece-1",
        name: "Black Blazer",
        slot: "outerwear",
        colorFamily: "black",
        colorName: "Black",
        top: "10%",
        left: "8%",
        width: "27%",
        height: "56%",
        rotate: -4,
      },
      {
        id: "piece-2",
        name: "Simple Tee",
        slot: "top",
        colorFamily: "cream",
        colorName: "Ivory",
        top: "16%",
        left: "39%",
        width: "21%",
        height: "29%",
        rotate: 1,
      },
      {
        id: "piece-3",
        name: "Dark Denim Straight Leg Jeans",
        slot: "bottom",
        colorFamily: "denim",
        colorName: "Dark Denim",
        top: "24%",
        left: "59%",
        width: "23%",
        height: "54%",
        rotate: -1,
      },
      {
        id: "piece-4",
        name: "Flat Shoe",
        slot: "shoes",
        colorFamily: "brown",
        colorName: "Espresso",
        top: "70%",
        left: "18%",
        width: "24%",
        height: "14%",
        rotate: -2,
      },
      {
        id: "piece-5",
        name: "Crossbody",
        slot: "bag",
        colorFamily: "brown",
        colorName: "Deep Brown",
        top: "60%",
        left: "71%",
        width: "17%",
        height: "17%",
        rotate: 4,
      },
    ],
  },
];

export const mockOutfits = outfitLooks;
