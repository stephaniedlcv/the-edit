import type {
  ColorFamily,
  PatternType,
  StyleVibe,
  WardrobeCategory,
} from "@/types/wardrobe";

export const categoryOptions: WardrobeCategory[] = [
  "top",
  "bottom",
  "dress",
  "outerwear",
  "shoes",
  "bag",
  "accessory",
  "jewelry",
];

export const subcategoryOptionsByCategory: Record<WardrobeCategory, string[]> = {
  top: [
    "Bodysuit",
    "Tank",
    "Camisole",
    "Crop Top",
    "Sleeveless Top",
    "Blouse",
    "Button Down",
    "Button-Down",
    "T-Shirt",
    "Long Sleeve Top",
    "Vest",
    "Cardigan",
  ],
  bottom: [
    "Pants",
    "Trouser",
    "Straight Leg Pants",
    "Wide Leg Pants",
    "Wide Leg",
    "Straight Leg",
    "Jeans",
    "Shorts",
    "Skirt",
  ],
  dress: ["Dress", "Jumpsuit", "Romper", "Set"],
  outerwear: ["Blazer", "Vest", "Jacket", "Cardigan", "Layer"],
  shoes: ["Loafer", "Mule", "Flat", "Sandal", "Heel", "Sneaker", "Boot"],
  bag: ["Shoulder Bag", "Crossbody", "Tote", "Clutch"],
  accessory: ["Belt", "Scarf", "Sunglasses", "Glasses", "Hat", "Hair Accessory"],
  jewelry: ["Earrings", "Necklace", "Bracelet", "Ring", "Watch"],
};

export const colorFamilyOptions: ColorFamily[] = [
  "black",
  "brown",
  "cream",
  "beige",
  "white",
  "burgundy",
  "olive",
  "camel",
  "plum",
  "mustard",
  "denim",
  "blue",
  "pink",
  "gray",
  "orange",
  "metallic",
  "multicolor",
  "statement",
];

export const colorNameByFamily: Record<ColorFamily, string[]> = {
  black: ["Black", "Washed Black", "Black/Silver Lurex"],
  brown: [
    "Espresso",
    "Chocolate",
    "Dark Brown",
    "Brown",
    "Cognac",
    "Leopard Brown",
    "Tortoise",
    "Amber",
  ],
  cream: ["Cream", "Ivory", "Ivory/Cream", "Warm Cream"],
  beige: [
    "Beige",
    "Taupe",
    "Light Taupe",
    "Beige/Oatmeal",
    "Cream/Beige",
    "Natural",
    "Nude",
    "Sand",
    "Warm Beige",
  ],
  white: ["White", "Off White"],
  burgundy: ["Burgundy", "Wine", "Oxblood", "Deep Red", "Red", "True Red"],
  olive: [
    "Olive",
    "Dark Olive",
    "Forest Green",
    "Moss",
    "Emerald Green",
    "Deep Teal",
    "Sage Green",
    "Teal",
  ],
  camel: ["Camel", "Caramel", "Warm Tan"],
  plum: ["Plum", "Eggplant", "Mauve"],
  mustard: ["Mustard", "Golden Mustard", "Ochre", "Gold", "Champagne", "Pale Yellow"],
  denim: ["Denim", "Dark Blue Denim", "Medium Blue Denim", "Light Blue Denim"],
  blue: ["Navy", "Dark Navy", "Blue", "Light Blue", "Electric Blue", "Teal", "Petrol"],
  pink: ["Pink", "Blush Pink", "Rose", "Dusty Pink"],
  gray: ["Gray", "Heather Gray", "Light Gray", "Charcoal"],
  orange: ["Orange", "Rust Orange", "Terracotta"],
  metallic: ["Gold", "Silver", "Champagne"],
  multicolor: ["Multicolor", "Pattern", "Cow Print", "Floral Print"],
  statement: [
    "Gold",
    "Silver",
    "Leopard",
    "Cow Print",
    "Snake Print",
    "Multicolor",
    "Print",
    "Pattern",
    "Heather Gray",
    "Light Gray",
    "Gray",
    "Charcoal",
    "Pink",
    "Blush Pink",
    "Orange",
    "Clear",
  ],
};

export const clothingSizeOptions = [
  "XXS",
  "XS",
  "Small",
  "Medium",
  "Large",
  "XLarge",
  "XXLarge",
  "One Size",
];

export const shoeSizeOptions = [
  "5",
  "5.5",
  "6",
  "6.5",
  "7",
  "7.5",
  "8",
  "8.5",
  "9",
  "9.5",
  "10",
];

export const oneSizeOptions = ["One Size"];

export const vibeOptions: StyleVibe[] = [
  "classic",
  "minimal",
  "elevated",
  "work",
  "tropical",
  "statement",
  "casual",
];

export const patternTypeOptions: {
  value: PatternType | "";
  label: string;
}[] = [
  { value: "", label: "Solid / No pattern" },
  { value: "animal_print", label: "Animal Print" },
  { value: "floral", label: "Floral" },
  { value: "striped", label: "Striped" },
  { value: "polka_dot", label: "Polka Dot" },
  { value: "plaid", label: "Plaid / Check" },
  { value: "geometric", label: "Geometric" },
  { value: "abstract", label: "Abstract" },
  { value: "mixed_print", label: "Mixed Print" },
];

export const patternSubtypeByType: Record<PatternType, string[]> = {
  animal_print: ["Leopard", "Snake", "Cow", "Zebra", "Tortoise"],
  floral: ["Small Floral", "Large Floral", "Tropical Floral", "Abstract Floral"],
  striped: ["Vertical Stripe", "Horizontal Stripe", "Pinstripe"],
  polka_dot: ["Small Polka Dot", "Large Polka Dot"],
  plaid: ["Plaid", "Check", "Windowpane"],
  geometric: ["Geometric", "Chevron"],
  abstract: ["Abstract", "Painterly"],
  mixed_print: ["Mixed Print", "Multicolor Print"],
};

export function formatLabel(value: string) {
  return value.replaceAll("_", " ").replaceAll("-", " ");
}

export function normalizeLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getSubcategoryOptions(category: WardrobeCategory) {
  return subcategoryOptionsByCategory[category] ?? [];
}

export function getSizeOptions(category: WardrobeCategory) {
  if (category === "shoes") return shoeSizeOptions;

  if (category === "bag" || category === "accessory" || category === "jewelry") {
    return oneSizeOptions;
  }

  return clothingSizeOptions;
}

export function getPatternSubtypeOptions(patternType?: PatternType | "") {
  if (!patternType) return [];

  return patternSubtypeByType[patternType] ?? [];
}
