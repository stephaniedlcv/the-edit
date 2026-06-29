export const styleProfile = {
  identity: {
    name: "Stephanie",
    styleSystem: "The Stephanie Edit",
    palette: "Dark Autumn / Warm Olive",
    silhouette: "Bottom Hourglass",
    location: "Puerto Rico",
    aesthetic: "Classic, minimal, elevated, warm, tropical-polished.",
  },

  measurements: [
    { label: "Bust", value: '34"', note: "Keep tops fitted but not tight." },
    { label: "Waist", value: '28.5"', note: "Define with belts, high rise, and open layers." },
    { label: "Hips", value: '38.5"', note: "Prioritize clean drape through the hip." },
    { label: "Glutes", value: '39"', note: "Check length and fabric pull on bottoms." },
  ],

  palette: [
    { name: "Chocolate", family: "brown", role: "Core neutral" },
    { name: "Camel", family: "camel", role: "Warm lightener" },
    { name: "Olive", family: "olive", role: "Color builder" },
    { name: "Burgundy", family: "burgundy", role: "Elegant color" },
    { name: "Plum", family: "plum", role: "Soft statement" },
    { name: "Muted Mustard", family: "mustard", role: "Tropical warmth" },
    { name: "Terracotta", family: "statement", role: "Caribbean pop" },
    { name: "Cream", family: "cream", role: "Soft base" },
  ],

  fitRules: [
    {
      title: "Define the waist",
      body: "Bottom Hourglass benefits from visible waist definition through belts, high-rise bottoms, tucked tops, wrap details, or open vertical layers.",
    },
    {
      title: "Balance the hip line",
      body: "Avoid stiff cuts that stop at the widest part of the hip. Prefer pieces that either crop higher or fall cleanly past the hip.",
    },
    {
      title: "Prefer vertical structure",
      body: "Open blazers, vest layers, long lines, and clean lapels help elongate the frame without adding bulk.",
    },
    {
      title: "Use volume intentionally",
      body: "If the bottom is wide-leg, keep the top fitted or structured. If the top is dramatic, ground it with cleaner bottoms.",
    },
  ],

  shoppingRules: [
    {
      title: "No duplicate neutrals without a job",
      body: "Black, beige, cream, brown, denim, and basics must add a new silhouette, fabric, or use case to be worth adding.",
    },
    {
      title: "Color must create outfits",
      body: "A wishlist color piece should combine with at least 5 owned pieces or unlock a clear capsule gap.",
    },
    {
      title: "Statement pieces need styling proof",
      body: "A statement item should have at least 3 realistic outfit formulas before moving from consider to buy-priority.",
    },
    {
      title: "Shoes and accessories get priority",
      body: "Because the closet has limited shoes and accessories, these can create more outfit variety than another neutral top.",
    },
  ],

  climateRules: [
    {
      title: "Puerto Rico heat",
      body: "Prioritize breathable fabrics, sleeveless layers, open blazers, sandals, mules, and pieces that survive humidity.",
    },
    {
      title: "AC-friendly polish",
      body: "Keep light layers for offices and indoor spaces without building outfits around heavy outerwear.",
    },
    {
      title: "Rain-aware styling",
      body: "Avoid delicate shoes or dragging hems on high-rain days. Prefer practical shoes with polished accessories.",
    },
  ],

  capsuleGoals: [
    "Add intentional color without losing the classic elevated base.",
    "Reduce over-reliance on black, white, beige, and cream.",
    "Build work outfits that still feel tropical and fun.",
    "Increase shoes, bags, belts, and jewelry as outfit multipliers.",
    "Use wishlist discipline before buying statement pieces.",
  ],

  aiRules: [
    "Always evaluate color against Dark Autumn first, then allow intentional Caribbean pops when they create useful outfits.",
    "Flag duplicates when an item repeats an existing color, silhouette, or function.",
    "Prioritize waist definition and clean hip drape for Bottom Hourglass.",
    "For Puerto Rico, avoid recommendations that depend on heavy layering or cold-weather styling.",
    "Recommend shoes and accessories often because they are a known closet gap.",
  ],
};
