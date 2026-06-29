/**
 * THE EDIT — Dark Autumn Color Intelligence System
 * dark-autumn-palette.ts — v1.1 (patched)
 *
 * PATCH NOTES v1.1:
 * - Fix #1: Orphaned recommendedPairings "burgundy" → "deep_burgundy", "gold" → "antique_gold"
 *           (color) or "metal_antique_gold" (metallic). Now all pairings resolve to real normalizedNames.
 * - Fix #2: avoidPairings now use restrictedColorTokens instead of ad-hoc strings.
 *           Generic tokens like "silver", "cool_grey", "navy_cold" are defined in one place.
 * - Fix #3: getPaletteFamilyByShade() renamed to getPaletteFamilyByApprovedShade()
 *           to make its search scope explicit. Old name kept as deprecated alias.
 * - Fix #4: buildColorContextForAI() accent rule updated:
 *           "1 accent max" → "1 main accent + metallic accessory allowed if not dominant"
 * - Fix #5: outfitRequiresWarmAnchor() now validates that a warm element OTHER than black exists.
 */

export type FamilyRole = "base_neutral" | "accent" | "statement"
export type Temperature = "warm" | "neutral_warm" | "cool_risk"
export type Depth = "light" | "light_medium" | "medium" | "medium_deep" | "deep"
export type Chroma = "muted" | "muted_rich" | "rich" | "rich_muted"

export interface ApprovedShade {
  name: string
  normalizedName: string
  hex: string
  roleOverride?: FamilyRole
  tropicalApproved?: boolean
  notes?: string
}

export interface RiskyShade {
  name: string
  normalizedName: string
  hex?: string
  reason: string
  misclassificationRisk?: string
}

export interface AvoidShade {
  name: string
  normalizedName: string
  hex?: string
  reason: string
}

export const restrictedColorTokens = {
  cool_grey: { label: "Cool grey", reason: "Loses DA warmth. Use warm taupe or olive instead." },
  light_grey: { label: "Light grey", reason: "Too cool and too light for DA depth." },
  silver: { label: "Silver", reason: "Cool metal. Use bronze, copper, or gold instead." },
  icy_white: { label: "Icy white", reason: "Pure/cool white creates harsh contrast on DA." },
  cool_off_white: { label: "Cool off-white", reason: "Any white with pink or grey cast." },
  pure_white: { label: "Pure white", reason: "Too cool. Use warm cream or ivory." },
  icy_blue: { label: "Icy blue", reason: "Cool pastel blue. Summer palette." },
  cool_blue: { label: "Cool blue", reason: "Any blue without green. Dark Winter direction." },
  navy_cold: { label: "Cold navy", reason: "Blue-dominant navy. Dark Winter signature." },
  icy_pink: { label: "Icy pink", reason: "Cool-light pink. True Summer territory." },
  cool_pink: { label: "Cool pink", reason: "Blue-base pink. Not DA." },
  hot_pink: { label: "Hot pink", reason: "Dark Winter / Bright Winter." },
  baby_pink: { label: "Baby pink", reason: "Light season. Washes out DA depth." },
} as const

export type RestrictedToken = keyof typeof restrictedColorTokens

export interface PaletteFamily {
  id: string
  family: string
  displayName: string
  familyRole: FamilyRole
  temperature: Temperature
  depth: Depth
  chroma: Chroma
  approvedShades: ApprovedShade[]
  riskyShades: RiskyShade[]
  avoidShades: AvoidShade[]
  recommendedPairings: string[]
  avoidPairings: RestrictedToken[]
  darkWinterWarning: string | null
  tropicalApproved: boolean
  closetAnchor: boolean
  defaultNeutral: boolean
  requiresWarmStyling: boolean
  misclassificationRisk: string | null
}

export const darkAutumnPalette: PaletteFamily[] = [
  {
    id: "white_cream_ivory",
    family: "white_cream_ivory",
    displayName: "White / Cream / Ivory",
    familyRole: "base_neutral",
    temperature: "neutral_warm",
    depth: "light",
    chroma: "muted",
    approvedShades: [
      { name: "Warm cream", normalizedName: "warm_cream", hex: "#F5EFE0", notes: "Primary light neutral. Yellow-base essential." },
      { name: "Ivory", normalizedName: "ivory", hex: "#EDE0C4", notes: "Slightly deeper than cream. Safe for all occasions." },
      { name: "Eggshell", normalizedName: "eggshell", hex: "#F0E6D3", notes: "Softest option. Works as contrast against deep tones." },
      { name: "Yellow-white", normalizedName: "yellow_white", hex: "#E8DCC8", notes: "Warm white with golden cast. Better than stark white." },
      { name: "Antique linen", normalizedName: "antique_linen", hex: "#DDD0B8", notes: "Most structured of the creams. Pairs with espresso." },
    ],
    riskyShades: [
      { name: "Floral white", normalizedName: "floral_white", hex: "#FFFAF0", reason: "Almost cold. Review in natural light before buying.", misclassificationRisk: "Soft Summer / True Summer" },
    ],
    avoidShades: [
      { name: "Pure white", normalizedName: "pure_white", hex: "#FFFFFF", reason: "Too cool and harsh. Creates unflattering contrast." },
      { name: "Ghost white", normalizedName: "ghost_white", hex: "#F8F8FF", reason: "Blue-based white. Dark Winter territory." },
      { name: "Cool off-white", normalizedName: "cool_off_white", reason: "Any white with pink or grey cast." },
    ],
    recommendedPairings: ["espresso", "dark_chocolate", "olive", "deep_burgundy", "rust", "camel"],
    avoidPairings: ["cool_grey", "silver", "navy_cold"],
    darkWinterWarning: "Dark Winter uses optical white and glacial white. Those are the ones to avoid — they look sharp and cold, not warm.",
    tropicalApproved: true,
    closetAnchor: true,
    defaultNeutral: true,
    requiresWarmStyling: false,
    misclassificationRisk: null,
  },
  {
    id: "beige_tan_camel",
    family: "beige_tan_camel",
    displayName: "Beige / Tan / Camel",
    familyRole: "base_neutral",
    temperature: "warm",
    depth: "light_medium",
    chroma: "muted",
    approvedShades: [
      { name: "Camel", normalizedName: "camel", hex: "#C19A6B", notes: "Most versatile neutral. Your power base." },
      { name: "Golden tan", normalizedName: "golden_tan", hex: "#D4A96A", notes: "Summer-ready. Strong against dark neutrals." },
      { name: "Warm sand", normalizedName: "warm_sand", hex: "#B8956A", notes: "Grounded version of beige. Works with everything." },
      { name: "Tawny", normalizedName: "tawny", hex: "#A0785A", notes: "Richer than standard beige. Almost a light brown." },
      { name: "Wheat", normalizedName: "wheat", hex: "#C4A882", notes: "Soft but warm. Good for layering." },
      { name: "Parchment", normalizedName: "parchment", hex: "#D6BC9A", notes: "Lighter option. Pairs beautifully with espresso and olive." },
    ],
    riskyShades: [
      { name: "Greige", normalizedName: "greige", hex: "#D8CBB5", reason: "Grey-beige can cool down fast. Verify yellow undertone in natural light.", misclassificationRisk: "Soft Summer" },
    ],
    avoidShades: [
      { name: "Cool greige", normalizedName: "cool_greige", hex: "#C8C0B0", reason: "Grey-dominant beige. Drains warmth from the face." },
      { name: "Pink-beige", normalizedName: "pink_beige", reason: "Any beige with a pink or mauve cast." },
    ],
    recommendedPairings: ["espresso", "dark_chocolate", "olive", "deep_burgundy", "rust", "warm_cream", "forest_green"],
    avoidPairings: ["cool_grey", "icy_blue", "silver"],
    darkWinterWarning: null,
    tropicalApproved: true,
    closetAnchor: true,
    defaultNeutral: true,
    requiresWarmStyling: false,
    misclassificationRisk: null,
  },
  {
    id: "brown",
    family: "brown",
    displayName: "Brown",
    familyRole: "base_neutral",
    temperature: "warm",
    depth: "deep",
    chroma: "rich",
    approvedShades: [
      { name: "Espresso", normalizedName: "espresso", hex: "#3B1F0E", notes: "Primary dark neutral. Replaces black in most outfits." },
      { name: "Dark chocolate", normalizedName: "dark_chocolate", hex: "#5C3317", notes: "Slightly lighter than espresso. Rich and grounding." },
      { name: "Walnut", normalizedName: "walnut", hex: "#7B4A2D", notes: "Medium-dark. Great for layering." },
      { name: "Mahogany", normalizedName: "mahogany", hex: "#6B3A2A", notes: "Red-brown tone. Warm and rich." },
      { name: "Toffee", normalizedName: "toffee", hex: "#8B5E3C", notes: "Lighter brown. Works as transition tone between neutrals." },
      { name: "Sienna", normalizedName: "sienna", hex: "#A0522D", notes: "Orange-brown. Can also act as accent." },
      { name: "Cocoa", normalizedName: "cocoa", hex: "#4A2810", notes: "Deep and warm. Pairs with cream and camel." },
    ],
    riskyShades: [],
    avoidShades: [
      { name: "Cool brown-grey", normalizedName: "cool_brown_grey", hex: "#5A5040", reason: "Grey-dominant brown loses warmth entirely." },
    ],
    recommendedPairings: ["warm_cream", "camel", "olive", "rust", "terracotta", "antique_gold", "deep_burgundy"],
    avoidPairings: ["cool_grey", "silver", "icy_pink"],
    darkWinterWarning: null,
    tropicalApproved: true,
    closetAnchor: true,
    defaultNeutral: true,
    requiresWarmStyling: false,
    misclassificationRisk: null,
  },
  {
    id: "black",
    family: "black",
    displayName: "Black",
    familyRole: "base_neutral",
    temperature: "neutral_warm",
    depth: "deep",
    chroma: "muted",
    approvedShades: [
      { name: "Warm black", normalizedName: "warm_black", hex: "#2B2416", notes: "Black with subtle green/brown undertone. Your best black." },
      { name: "Espresso-black", normalizedName: "espresso_black", hex: "#1C1410", notes: "Near-black with brown cast. Warmer read than pure black." },
      { name: "Brownish black", normalizedName: "brownish_black", hex: "#241E10", notes: "Very dark brown that reads as black. Ideal." },
    ],
    riskyShades: [
      { name: "Neutral black", normalizedName: "neutral_black", hex: "#1A1A1A", reason: "Acceptable if warmed up with accessories. Avoid as solo neutral.", misclassificationRisk: "Can read Dark Winter" },
    ],
    avoidShades: [
      { name: "Pure cool black", normalizedName: "pure_cool_black", hex: "#000000", reason: "Too harsh. Dark Winter signature. Avoid as base — use espresso instead." },
      { name: "Blue-black", normalizedName: "blue_black", hex: "#0A0A0F", reason: "Definitively Dark Winter. Do not use." },
    ],
    recommendedPairings: ["rust", "antique_gold", "camel", "warm_cream", "olive", "deep_burgundy", "bronze"],
    avoidPairings: ["cool_grey", "silver", "icy_white", "cool_blue"],
    darkWinterWarning: "Pure cool black and blue-black are Dark Winter signatures. Your black is always espresso-adjacent — warm, not icy.",
    tropicalApproved: false,
    closetAnchor: true,
    defaultNeutral: false,
    requiresWarmStyling: true,
    misclassificationRisk: "Dark Winter — when black appears too cool/sharp, it crosses over.",
  },
  {
    id: "denim",
    family: "denim",
    displayName: "Denim",
    familyRole: "base_neutral",
    temperature: "neutral_warm",
    depth: "medium_deep",
    chroma: "muted",
    approvedShades: [
      { name: "Indigo oscuro", normalizedName: "indigo_dark", hex: "#2E4053", notes: "Deepest denim. Most DA-compatible." },
      { name: "Dark denim", normalizedName: "dark_denim", hex: "#1C3A4A", notes: "Green-undertone dark. Ideal." },
      { name: "Midnight denim", normalizedName: "midnight_denim", hex: "#2C3E50", notes: "Almost black denim. Safe and versatile." },
      { name: "Washed black denim", normalizedName: "washed_black_denim", hex: "#2A2420", notes: "Warm-black denim. Excellent with camel and rust.", roleOverride: "base_neutral" },
    ],
    riskyShades: [
      { name: "Slate denim", normalizedName: "slate_denim", hex: "#3B4A59", reason: "Can cool down. Evaluate in person — must read warm, not steely.", misclassificationRisk: "Dark Winter / Soft Summer" },
      { name: "Medium wash", normalizedName: "medium_wash_denim", hex: "#4A7FA5", reason: "Too bright and cool for DA palette.", misclassificationRisk: "True Summer / Soft Summer" },
    ],
    avoidShades: [
      { name: "Light wash", normalizedName: "light_wash_denim", hex: "#B0C4DE", reason: "Washed-out pale blue. Dilutes your natural depth." },
      { name: "Acid wash", normalizedName: "acid_wash_denim", reason: "Too cool and too light. Wrong direction." },
      { name: "Pale blue denim", normalizedName: "pale_blue_denim", reason: "Any denim lighter than medium indigo." },
    ],
    recommendedPairings: ["rust", "camel", "warm_cream", "espresso", "antique_gold", "olive", "terracotta"],
    avoidPairings: ["silver", "icy_white", "cool_pink", "light_grey"],
    darkWinterWarning: null,
    tropicalApproved: true,
    closetAnchor: true,
    defaultNeutral: true,
    requiresWarmStyling: false,
    misclassificationRisk: "Slate denim can read as Dark Winter — always evaluate depth and warmth before adding to closet.",
  },
  {
    id: "burgundy_wine_berry",
    family: "burgundy_wine_berry",
    displayName: "Burgundy / Wine / Berry",
    familyRole: "accent",
    temperature: "warm",
    depth: "deep",
    chroma: "rich",
    approvedShades: [
      { name: "Deep burgundy", normalizedName: "deep_burgundy", hex: "#4A0E0E", notes: "Darkest and most grounding. Almost acts as a neutral." },
      { name: "Wine", normalizedName: "wine", hex: "#6B1A2E", notes: "Classic DA accent. Strong and elegant." },
      { name: "Claret", normalizedName: "claret", hex: "#7D1635", notes: "Red-dominant burgundy. More vibrant." },
      { name: "Boysenberry", normalizedName: "boysenberry", hex: "#5C1A3A", notes: "Warm pink-purple hybrid. Statement but grounded." },
      { name: "Raisin", normalizedName: "raisin", hex: "#6B2737", notes: "Very deep and warm. Professional and rich." },
      { name: "Espresso-wine", normalizedName: "espresso_wine", hex: "#3D0C11", notes: "Near-black wine. Acts almost as a dark neutral." },
    ],
    riskyShades: [
      { name: "Magenta-wine", normalizedName: "magenta_wine", hex: "#8B0057", reason: "Cools down fast if pink-dominant. Check undertone.", misclassificationRisk: "Dark Winter" },
    ],
    avoidShades: [
      { name: "Cool magenta", normalizedName: "cool_magenta", hex: "#9B0067", reason: "Blue-pink base. Dark Winter territory." },
      { name: "Purple-magenta", normalizedName: "purple_magenta", hex: "#800080", reason: "Too cool and too bright." },
    ],
    recommendedPairings: ["camel", "warm_cream", "espresso", "olive", "antique_gold", "dark_chocolate"],
    avoidPairings: ["silver", "icy_pink", "cool_blue", "pure_white"],
    darkWinterWarning: "Magenta-leaning burgundy can cross to Dark Winter. Your burgundy should read 'red-dominant', not 'purple-dominant'.",
    tropicalApproved: true,
    closetAnchor: false,
    defaultNeutral: false,
    requiresWarmStyling: false,
    misclassificationRisk: null,
  },
  {
    id: "orange_terracotta_rust",
    family: "orange_terracotta_rust",
    displayName: "Orange / Terracotta / Rust",
    familyRole: "accent",
    temperature: "warm",
    depth: "medium_deep",
    chroma: "rich",
    approvedShades: [
      { name: "Rust", normalizedName: "rust", hex: "#B7410E", notes: "Hero accent for DA. Warm, grounded, iconic." },
      { name: "Terracotta", normalizedName: "terracotta", hex: "#C46832", notes: "Your 'tropical intencional' star. Perfect for PR." },
      { name: "Burnt sienna", normalizedName: "burnt_sienna", hex: "#A0522D", notes: "Earth-orange. Works as accent and near-neutral." },
      { name: "Spice orange", normalizedName: "spice_orange", hex: "#D2691E", notes: "Livelier option. Keep it as solo color accent." },
      { name: "Pumpkin spice", normalizedName: "pumpkin_spice", hex: "#B85C38", notes: "Deep and warm. Excellent with olive." },
      { name: "Burnt orange", normalizedName: "burnt_orange", hex: "#CC5500", notes: "Statement-level orange. Use intentionally." },
    ],
    riskyShades: [
      { name: "Vivid orange", normalizedName: "vivid_orange", hex: "#FF6B35", reason: "Saturation can push into Spring territory.", misclassificationRisk: "True Autumn / True Spring" },
    ],
    avoidShades: [
      { name: "Bright orange", normalizedName: "bright_orange", hex: "#FF8C00", reason: "Too saturated. Loses DA earthiness." },
      { name: "Neon orange", normalizedName: "neon_orange", hex: "#FFA500", reason: "Spring palette. Not DA." },
    ],
    recommendedPairings: ["espresso", "olive", "camel", "dark_chocolate", "warm_cream", "forest_green", "mustard"],
    avoidPairings: ["silver", "cool_blue", "icy_white", "navy_cold", "hot_pink"],
    darkWinterWarning: null,
    tropicalApproved: true,
    closetAnchor: false,
    defaultNeutral: false,
    requiresWarmStyling: false,
    misclassificationRisk: null,
  },
  {
    id: "yellow_gold_mustard",
    family: "yellow_gold_mustard",
    displayName: "Yellow / Gold / Mustard",
    familyRole: "accent",
    temperature: "warm",
    depth: "medium",
    chroma: "rich",
    approvedShades: [
      { name: "Mustard", normalizedName: "mustard", hex: "#D4A017", notes: "Signature DA yellow. Best entry point for this family." },
      { name: "Ochre", normalizedName: "ochre", hex: "#B5921F", notes: "Earthy yellow. Deeper and more grounded than mustard." },
      { name: "Antique gold", normalizedName: "antique_gold", hex: "#C5A028", notes: "Golden but not flashy. Bridges color and metallic." },
      { name: "Honey gold", normalizedName: "honey_gold", hex: "#C9A227", notes: "Warm and luminous. Great for accessories." },
      { name: "Dark goldenrod", normalizedName: "dark_goldenrod", hex: "#B8860B", notes: "Rich and deep. Close to metallic gold." },
      { name: "Curry yellow", normalizedName: "curry_yellow", hex: "#D4AC0D", notes: "Vivid but warm. Strong statement accent." },
    ],
    riskyShades: [
      { name: "Bright gold", normalizedName: "bright_gold", hex: "#FFD700", reason: "Too saturated. Can push into Spring range.", misclassificationRisk: "True Spring / True Autumn" },
      { name: "Khaki pale-cool", normalizedName: "khaki_pale_cool", hex: "#F0E68C", reason: "Yellow-beige gone cool. Misclassification risk: may appear as DA yellow but belongs to grey-green-beige zone.", misclassificationRisk: "Soft Summer — belongs to a grey-green-beige zone, not DA yellow" },
    ],
    avoidShades: [
      { name: "Lemon yellow", normalizedName: "lemon_yellow", hex: "#FFFF00", reason: "Spring. Too cool and too bright." },
      { name: "Pastel yellow", normalizedName: "pastel_yellow", reason: "Light seasons only. Washes out DA depth." },
      { name: "Lemon chiffon", normalizedName: "lemon_chiffon", hex: "#FFFACD", reason: "Cool-pale yellow. Not DA." },
    ],
    recommendedPairings: ["espresso", "dark_chocolate", "olive", "deep_burgundy", "warm_cream", "camel", "rust"],
    avoidPairings: ["cool_grey", "silver", "baby_pink", "icy_blue"],
    darkWinterWarning: null,
    tropicalApproved: true,
    closetAnchor: false,
    defaultNeutral: false,
    requiresWarmStyling: false,
    misclassificationRisk: "Khaki/pale yellow can be misclassified as DA yellow. Always check warmth AND depth together.",
  },
  {
    id: "green",
    family: "green",
    displayName: "Green",
    familyRole: "accent",
    temperature: "warm",
    depth: "medium_deep",
    chroma: "muted_rich",
    approvedShades: [
      { name: "Olive", normalizedName: "olive", hex: "#4A5C2A", notes: "Most versatile DA green. Can act as accent or near-neutral.", roleOverride: "base_neutral" },
      { name: "Forest green", normalizedName: "forest_green", hex: "#2D5A27", notes: "Deep and rich. Strong statement color." },
      { name: "Moss", normalizedName: "moss", hex: "#6B7C3A", notes: "Muted yellow-green. Excellent with chocolate and camel." },
      { name: "Dark olive", normalizedName: "dark_olive", hex: "#3D5228", notes: "Deepened olive. Almost acts as dark neutral." },
      { name: "Hunter green", normalizedName: "hunter_green", hex: "#1B4D3E", notes: "Deep, cool-warm green. Borders DA/DW — verify warmth." },
      { name: "Avocado", normalizedName: "avocado", hex: "#4F6228", notes: "Earthy and deep. Iconic DA green." },
      { name: "Fern", normalizedName: "fern", hex: "#5C6A2A", notes: "Lighter version of moss. Good for layering." },
      { name: "Deep forest", normalizedName: "deep_forest", hex: "#2E4A1E", notes: "Darkest green option. Pairs with cream for contrast." },
    ],
    riskyShades: [
      { name: "Bright forest", normalizedName: "bright_forest", hex: "#228B22", reason: "Too saturated. Check that it reads warm, not emerald-cold.", misclassificationRisk: "True Spring / Bright Spring" },
      { name: "Pure green", normalizedName: "pure_green", hex: "#008000", reason: "Lacks the earthy warmth DA greens need." },
    ],
    avoidShades: [
      { name: "Lime green", normalizedName: "lime_green", hex: "#00FF00", reason: "Spring. Wrong season entirely." },
      { name: "Light green", normalizedName: "light_green", hex: "#90EE90", reason: "Too pale. Washes out depth." },
      { name: "Mint", normalizedName: "mint", hex: "#98FF98", reason: "Cool and pastel. Summer palette." },
      { name: "Pale sage", normalizedName: "pale_sage", reason: "Dusty cool sage belongs to Soft Autumn/Summer, not DA." },
    ],
    recommendedPairings: ["camel", "rust", "espresso", "dark_chocolate", "warm_cream", "deep_burgundy", "mustard"],
    avoidPairings: ["silver", "baby_pink", "icy_blue", "cool_grey"],
    darkWinterWarning: null,
    tropicalApproved: true,
    closetAnchor: false,
    defaultNeutral: false,
    requiresWarmStyling: false,
    misclassificationRisk: "Sage/dusty cool green often sold as 'DA green' but belongs to Soft Autumn or Soft Summer.",
  },
  {
    id: "pink_coral_salmon",
    family: "pink_coral_salmon",
    displayName: "Pink / Coral / Salmon",
    familyRole: "accent",
    temperature: "warm",
    depth: "medium",
    chroma: "rich",
    approvedShades: [
      { name: "Deep coral", normalizedName: "deep_coral", hex: "#C2623E", notes: "Star of this family. Rich, warm, tropical." },
      { name: "Warm coral", normalizedName: "warm_coral", hex: "#CD5B45", notes: "Orange-red direction. Perfect for PR skin tones." },
      { name: "Salmon-red", normalizedName: "salmon_red", hex: "#B85042", notes: "Deep salmon. More red than pink." },
      { name: "Warm mauve", normalizedName: "warm_mauve", hex: "#7D3445", notes: "Dusty pink-red. Bridges pink and burgundy." },
      { name: "Rosewood", normalizedName: "rosewood", hex: "#8B4560", notes: "Deep and warm. Statement without being too pink." },
      { name: "Cinnamon rose", normalizedName: "cinnamon_rose", hex: "#9A4A3A", notes: "Brown-rose. Works as accent and near-neutral." },
      { name: "Terracotta pink", normalizedName: "terracotta_pink", hex: "#C47A5A", notes: "Orange-pink. Tropical approved.", tropicalApproved: true },
    ],
    riskyShades: [
      { name: "Light coral", normalizedName: "light_coral", hex: "#E07070", reason: "Too light — may wash out depth.", misclassificationRisk: "True Autumn / Soft Autumn" },
      { name: "Boysenberry pink", normalizedName: "boysenberry_pink", hex: "#8B4560", reason: "Excellent if warm, risky if it reads purple-cool.", misclassificationRisk: "Dark Winter if cool-dominant" },
      { name: "Deep pink (generic)", normalizedName: "deep_pink_generic", hex: "#FF1493", reason: "May slide into fuchsia. Always verify warm-red direction.", misclassificationRisk: "Dark Winter / Bright Winter" },
    ],
    avoidShades: [
      { name: "Hot pink", normalizedName: "hot_pink", hex: "#FF69B4", reason: "Definitively Dark Winter / Bright Winter." },
      { name: "Baby pink", normalizedName: "baby_pink", hex: "#FFB6C1", reason: "Light season. Washes out DA completely." },
      { name: "Icy pink", normalizedName: "icy_pink", reason: "Cool-light. True Summer territory." },
      { name: "Fuchsia", normalizedName: "fuchsia", hex: "#FF00FF", reason: "Dark/Bright Winter. Never DA." },
    ],
    recommendedPairings: ["espresso", "camel", "olive", "warm_cream", "dark_chocolate"],
    avoidPairings: ["silver", "cool_blue", "icy_white", "cool_grey"],
    darkWinterWarning: "Hot pink, fuchsia, and electric pink are Dark Winter/Bright Winter. Your pink is always warm-earth direction: coral, salmon, mauve, rosewood.",
    tropicalApproved: true,
    closetAnchor: false,
    defaultNeutral: false,
    requiresWarmStyling: false,
    misclassificationRisk: "Generic 'deep pink' labels often hide fuchsia. Always check direction: warm-red = DA, cool-blue = DW.",
  },
  {
    id: "metallics",
    family: "metallics",
    displayName: "Metallics",
    familyRole: "accent",
    temperature: "warm",
    depth: "medium",
    chroma: "rich",
    approvedShades: [
      { name: "Antique gold (metal)", normalizedName: "metal_antique_gold", hex: "#CD7F32", notes: "Hammered, oxidized finish. Signature DA metal." },
      { name: "Bronze", normalizedName: "bronze", hex: "#B8860B", notes: "Rich and warm. Works for jewelry and bags." },
      { name: "Copper", normalizedName: "copper", hex: "#B87333", notes: "Red-warm metal. Strong statement with deep teal." },
      { name: "Brass / Latón", normalizedName: "brass", hex: "#D4AC0D", notes: "Golden-yellow. Textured finish preferred." },
      { name: "Matte gold", normalizedName: "matte_gold", hex: "#A0785A", notes: "Subtle. Works as neutral-adjacent metal." },
      { name: "Oxidized gold", normalizedName: "oxidized_gold", hex: "#8B6914", notes: "Darkened gold. Adds depth. Vintage feel." },
    ],
    riskyShades: [
      { name: "Warm silver", normalizedName: "warm_silver", hex: "#C0C0C0", reason: "Only if visibly warm tone (pewter direction). Bright silver never.", misclassificationRisk: "Dark Winter if cool-bright" },
    ],
    avoidShades: [
      { name: "Cool silver", normalizedName: "cool_silver", hex: "#E8E8E8", reason: "Dark Winter signature metal." },
      { name: "Chrome", normalizedName: "chrome", reason: "Too cold and high-shine." },
      { name: "Platinum", normalizedName: "platinum", hex: "#D4D4D4", reason: "Definitively cool. Not DA." },
    ],
    recommendedPairings: ["espresso", "deep_teal", "olive", "rust", "warm_cream", "camel", "dark_chocolate"],
    avoidPairings: ["silver", "icy_blue", "pure_white"],
    darkWinterWarning: "Bright cool silver is Dark Winter's defining metal. Your metals are always warm: bronze, gold, copper — antique or hammered finish, never mirror-polished.",
    tropicalApproved: true,
    closetAnchor: false,
    defaultNeutral: false,
    requiresWarmStyling: false,
    misclassificationRisk: null,
  },
  {
    id: "red",
    family: "red",
    displayName: "Red",
    familyRole: "statement",
    temperature: "warm",
    depth: "deep",
    chroma: "rich",
    approvedShades: [
      { name: "Brick red", normalizedName: "brick_red", hex: "#8B1A1A", notes: "Your classic DA red. Earthy and rich." },
      { name: "Paprika", normalizedName: "paprika", hex: "#9B2D1F", notes: "Spiced red. Signature DA tone." },
      { name: "Deep tomato", normalizedName: "deep_tomato", hex: "#C0392B", notes: "Richer tomato red. More vivid statement." },
      { name: "Cinnabar", normalizedName: "cinnabar", hex: "#7B2020", notes: "Dark and warm. Powerful statement." },
      { name: "Warm crimson", normalizedName: "warm_crimson", hex: "#A52A2A", notes: "True crimson with warm base." },
      { name: "Muted red", normalizedName: "muted_red", hex: "#8B3A3A", notes: "Softest DA red. Accessible starting point." },
    ],
    riskyShades: [
      { name: "Bright red", normalizedName: "bright_red", hex: "#CC0000", reason: "Saturation can tip cool. Verify in-person it reads warm.", misclassificationRisk: "True Winter / Bright Winter" },
    ],
    avoidShades: [
      { name: "Pure neon red", normalizedName: "pure_neon_red", hex: "#FF0000", reason: "Spring or Bright Winter. Too cool and too bright." },
      { name: "Cool crimson", normalizedName: "cool_crimson", hex: "#DC143C", reason: "Blue-base crimson. Dark Winter territory." },
    ],
    recommendedPairings: ["espresso", "camel", "warm_cream", "olive", "dark_chocolate", "antique_gold"],
    avoidPairings: ["silver", "icy_pink", "cool_blue", "navy_cold"],
    darkWinterWarning: "Cool crimson and pop-bright red are Dark Winter. Your red is 'spiced and earthy', not 'electric'. Think paprika, not fire truck.",
    tropicalApproved: true,
    closetAnchor: false,
    defaultNeutral: false,
    requiresWarmStyling: false,
    misclassificationRisk: "Bright red close to #FF0000 can shift cool — DA red is always noticeably darker and earthier.",
  },
  {
    id: "blue_teal_peacock",
    family: "blue_teal_peacock",
    displayName: "Blue / Teal / Peacock",
    familyRole: "statement",
    temperature: "neutral_warm",
    depth: "deep",
    chroma: "rich",
    approvedShades: [
      { name: "Deep teal", normalizedName: "deep_teal", hex: "#005F73", notes: "Hero DA blue-green. Strong statement, safe tropical choice." },
      { name: "Peacock", normalizedName: "peacock", hex: "#0A7E8C", notes: "Tropical elevated. Your most PR-friendly statement color." },
      { name: "Dark teal", normalizedName: "dark_teal", hex: "#1B6B77", notes: "Slightly warmer than deep teal. Versatile." },
      { name: "Teal-green", normalizedName: "teal_green", hex: "#2C7873", notes: "Green-dominant teal. Most DA-compatible." },
      { name: "Midnight teal", normalizedName: "midnight_teal", hex: "#0D5C6B", notes: "Near-dark teal. Can act as deep neutral-adjacent." },
    ],
    riskyShades: [
      { name: "Medium blue", normalizedName: "medium_blue", hex: "#1F618D", reason: "Blue-dominant, less green. Can read cold.", misclassificationRisk: "Dark Winter — when green disappears from teal, it crosses over" },
      { name: "Electric peacock", normalizedName: "electric_peacock", hex: "#0097A7", reason: "Bright and blue-dominant. Evaluate warmth in natural light.", misclassificationRisk: "Dark Winter / Bright Winter" },
      { name: "Warm navy", normalizedName: "warm_navy", hex: "#1A5276", reason: "Possible if visibly green-warm. Evaluate carefully." },
    ],
    avoidShades: [
      { name: "Pure blue", normalizedName: "pure_blue", hex: "#0000FF", reason: "Definitively cool. Wrong season." },
      { name: "Sky blue", normalizedName: "sky_blue", hex: "#87CEEB", reason: "Too light and cool. Summer palette." },
      { name: "Royal blue", normalizedName: "royal_blue", hex: "#4169E1", reason: "Cool and bright. Dark Winter." },
      { name: "Cold navy", normalizedName: "cold_navy", hex: "#000080", reason: "Blue-dominant navy. Dark Winter signature." },
    ],
    recommendedPairings: ["espresso", "camel", "metal_antique_gold", "rust", "warm_cream", "olive"],
    avoidPairings: ["silver", "cool_pink", "icy_white", "navy_cold"],
    darkWinterWarning: "Electric blue, royal blue, and cold navy are Dark Winter. Your blue ALWAYS has green in it. If the teal looks cold and sharp instead of deep and warm — it's not yours.",
    tropicalApproved: true,
    closetAnchor: false,
    defaultNeutral: false,
    requiresWarmStyling: false,
    misclassificationRisk: "When green disappears from teal/peacock, the color crosses into Dark Winter territory.",
  },
  {
    id: "purple_plum_eggplant",
    family: "purple_plum_eggplant",
    displayName: "Purple / Plum / Eggplant",
    familyRole: "statement",
    temperature: "warm",
    depth: "deep",
    chroma: "rich_muted",
    approvedShades: [
      { name: "Deep plum", normalizedName: "deep_plum", hex: "#4A0E4E", notes: "Most DA-safe purple. Very dark and red-dominant." },
      { name: "Eggplant", normalizedName: "eggplant", hex: "#5B2C6F", notes: "Your hero purple. Rich and warm-dark." },
      { name: "Warm purple", normalizedName: "warm_purple", hex: "#6B2D6B", notes: "Medium-dark purple. Warm direction confirmed." },
      { name: "Raisin purple", normalizedName: "raisin_purple", hex: "#4E1A45", notes: "Red-dominant dark purple. Safe." },
      { name: "Aubergine", normalizedName: "aubergine", hex: "#3D0C3D", notes: "Near-black purple. Can act as dark neutral-adjacent." },
    ],
    riskyShades: [
      { name: "Medium purple", normalizedName: "medium_purple", hex: "#7B2FBE", reason: "Blue-dominant medium purple cools down fast.", misclassificationRisk: "Dark Winter" },
    ],
    avoidShades: [
      { name: "Lavender", normalizedName: "lavender", hex: "#EE82EE", reason: "Light and cool. Summer palette entirely." },
      { name: "Orchid", normalizedName: "orchid", hex: "#DA70D6", reason: "Cool pink-purple. Not DA." },
      { name: "Amethyst bright", normalizedName: "amethyst_bright", hex: "#9B59B6", reason: "Too bright and cool-medium. Dark Winter." },
      { name: "Electric violet", normalizedName: "electric_violet", hex: "#8B00FF", reason: "Bright Winter. Never DA." },
    ],
    recommendedPairings: ["camel", "rust", "espresso", "warm_cream", "antique_gold", "dark_chocolate"],
    avoidPairings: ["silver", "icy_pink", "cool_blue", "pure_white"],
    darkWinterWarning: "Lavender, bright amethyst, electric violet — all Dark Winter. Your purple is 'dark as a fig or dried plum', not 'bright jewel-tone'. If it glows, it's not yours.",
    tropicalApproved: false,
    closetAnchor: false,
    defaultNeutral: false,
    requiresWarmStyling: false,
    misclassificationRisk: "Any purple that loses the red/brown warmth and becomes blue-dominant crosses to Dark Winter.",
  },
]

export const colorRoleGroups = {
  base_neutral: darkAutumnPalette.filter(f => f.familyRole === "base_neutral").map(f => f.id),
  accent: darkAutumnPalette.filter(f => f.familyRole === "accent").map(f => f.id),
  statement: darkAutumnPalette.filter(f => f.familyRole === "statement").map(f => f.id),
  tropical: darkAutumnPalette.filter(f => f.tropicalApproved).map(f => f.id),
  closetAnchors: darkAutumnPalette.filter(f => f.closetAnchor).map(f => f.id),
  requiresWarmStyling: darkAutumnPalette.filter(f => f.requiresWarmStyling).map(f => f.id),
  defaultNeutrals: darkAutumnPalette.filter(f => f.defaultNeutral).map(f => f.id),
}

export function getPaletteFamilyById(id: string): PaletteFamily | undefined {
  return darkAutumnPalette.find(f => f.id === id)
}

export function getPaletteFamilyByApprovedShade(normalizedName: string): PaletteFamily | undefined {
  return darkAutumnPalette.find(f =>
    f.approvedShades.some(s => s.normalizedName === normalizedName)
  )
}

/** @deprecated Use getPaletteFamilyByApprovedShade() */
export const getPaletteFamilyByShade = getPaletteFamilyByApprovedShade

export type ShadeStatus = {
  status: "approved" | "risky" | "avoid" | "unknown"
  family: string | null
  reason: string | null
  misclassificationRisk: string | null
  requiresWarmStyling: boolean
  tropicalApproved: boolean
  roleOverride: FamilyRole | null
}

export function isShadeApprovedForStephanie(normalizedName: string): ShadeStatus {
  for (const family of darkAutumnPalette) {
    const approved = family.approvedShades.find(s => s.normalizedName === normalizedName)
    if (approved) {
      return {
        status: "approved",
        family: family.id,
        reason: approved.notes ?? null,
        misclassificationRisk: null,
        requiresWarmStyling: family.requiresWarmStyling,
        tropicalApproved: approved.tropicalApproved ?? family.tropicalApproved,
        roleOverride: approved.roleOverride ?? null,
      }
    }

    const risky = family.riskyShades.find(s => s.normalizedName === normalizedName)
    if (risky) {
      return {
        status: "risky",
        family: family.id,
        reason: risky.reason,
        misclassificationRisk: risky.misclassificationRisk ?? null,
        requiresWarmStyling: family.requiresWarmStyling,
        tropicalApproved: false,
        roleOverride: null,
      }
    }

    const avoid = family.avoidShades.find(s => s.normalizedName === normalizedName)
    if (avoid) {
      return {
        status: "avoid",
        family: family.id,
        reason: avoid.reason,
        misclassificationRisk: null,
        requiresWarmStyling: false,
        tropicalApproved: false,
        roleOverride: null,
      }
    }
  }

  return {
    status: "unknown",
    family: null,
    reason: "Shade not found in palette system. Evaluate manually.",
    misclassificationRisk: null,
    requiresWarmStyling: false,
    tropicalApproved: false,
    roleOverride: null,
  }
}

export function getRecommendedPairingsForFamily(familyId: string): PaletteFamily[] {
  const family = getPaletteFamilyById(familyId)
  if (!family) return []

  return darkAutumnPalette.filter(f =>
    f.approvedShades.some(s => family.recommendedPairings.includes(s.normalizedName))
  )
}

export function outfitRequiresWarmAnchor(familyIds: string[]): boolean {
  return familyIds.some(id => {
    const family = getPaletteFamilyById(id)
    return family?.requiresWarmStyling === true
  })
}

export function outfitHasValidWarmAnchor(familyIds: string[]): boolean {
  const warmAnchorFamilies = new Set([
    "beige_tan_camel",
    "brown",
    "orange_terracotta_rust",
    "yellow_gold_mustard",
    "burgundy_wine_berry",
    "green",
    "metallics",
    "red",
    "blue_teal_peacock",
    "purple_plum_eggplant",
    "pink_coral_salmon",
  ])

  return familyIds.some(id => warmAnchorFamilies.has(id))
}

export function buildColorContextForAI(): string {
  const neutrals = colorRoleGroups.base_neutral.join(", ")
  const accents = colorRoleGroups.accent.join(", ")
  const statements = colorRoleGroups.statement.join(", ")
  const tropical = colorRoleGroups.tropical.join(", ")

  return `
DARK AUTUMN COLOR SYSTEM — Stephanie's palette rules:

IDENTITY: Dark Autumn = warm-dark. Yellow/golden base. NOT cool-dark (that's Dark Winter).

FAMILY ROLES:
- Base/neutral (can anchor outfit): ${neutrals}
- Accent: ${accents}
- Statement (use intentionally): ${statements}

COLOR RULES FOR OUTFIT BUILDING:
1. Max 3 dominant color families per outfit.
2. 1 main accent color per outfit. Exception: a metallic accessory (bronze, gold, copper)
   does NOT count as a dominant accent when used as jewelry, belt, or bag — it's accent-support.
3. If there's a statement color, base/neutrals carry the rest of the outfit.
4. Black is ALLOWED but MUST be paired with ≥1 warm element from another family
   (camel, rust, gold, olive, burgundy, cream — not another black or a cool grey).
5. Tropical-approved colors (${tropical}) can be used more freely in Puerto Rico context.
6. Never use: pure white, cold navy, hot pink, lavender, silver, pure black, electric blue.
7. When in doubt: espresso + camel + one warm accent = always safe.

DA vs. DARK WINTER CHECK:
- "Cool, sharp, icy, electric" → Dark Winter. Do not use.
- "Warm, deep, earthy, spiced" → Dark Autumn. Approved.
`.trim()
}
