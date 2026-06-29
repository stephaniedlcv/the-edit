/**
 * THE EDIT — Style Intelligence System
 *
 * Color validator asks: "Do these colors work?"
 * Style intelligence asks: "Does this outfit have a point of view?"
 *
 * THE ELEVATION RULE:
 * Every outfit must have at least one intentional decision — accessory, shoe,
 * bag, belt, texture, tuck, layer, proportion, or styling detail — that takes
 * it from "dressed" to "styled".
 */

import { type OutfitColorItem } from "./outfit-color-validator"

export type OccasionLevel =
  | "office"
  | "casual_elevated"
  | "evening"
  | "athleisure"
  | "general"

export type ProportionFormula =
  | "fitted_top_wide_bottom"
  | "oversized_top_slim_bottom"
  | "monochromatic"
  | "dress_with_accessories"
  | "layer_over_slim"
  | "belt_defines_waist"
  | "contrast_volume"
  | "tuck_and_drape"
  | "elevated_athleisure"
  | "editorial_unexpected"

export type ElevationPieceType =
  | "statement_earrings"
  | "structured_bag"
  | "color_pop_bag"
  | "waist_belt"
  | "elevated_shoe"
  | "interesting_texture"
  | "tuck_or_layer_detail"
  | "outerwear_as_anchor"
  | "metallic_accent"
  | "unexpected_proportion"

export type StylingStatus =
  | "elevated"
  | "needs_elevation"
  | "underdressed"
  | "overdressed"
  | "proportions_off"

export interface OutfitStylingItem extends OutfitColorItem {
  fit?: "fitted" | "slim" | "straight" | "wide" | "oversized" | "flowy" | "structured"
  material?: "cotton" | "linen" | "silk" | "satin" | "knit" | "denim" | "leather" | "suede" | "synthetic" | "wool" | "other"
  isElevationPiece?: boolean
  elevationType?: ElevationPieceType
}

export interface StylingRuleResult {
  rule: string
  passed: boolean
  severity: "elevation" | "proportion" | "occasion" | "texture" | "fit"
  message: string
  suggestion?: string
}

export interface OutfitStylingResult {
  stylingStatus: StylingStatus
  elevationScore: number
  hasElevationPiece: boolean
  elevationPieces: OutfitStylingItem[]
  detectedFormula: ProportionFormula | null
  formulaSuggestions: ProportionFormula[]
  occasionFit: "perfect" | "good" | "stretch" | "mismatch"
  ruleResults: StylingRuleResult[]
  elevationSuggestion: string
  stylingNarrative: string
  trendNote: string | null
}

export interface StylingEvaluationOptions {
  occasion?: OccasionLevel
  pushBeyondComfort?: boolean
  includeTrendNote?: boolean
}

export const STEPHANIE_STYLE_PROFILE = {
  name: "Stephanie",
  colorProfile: "Dark Autumn",
  silhouette: "Bottom Hourglass",
  waistRule: "always_defined",
  climateContext: "Puerto Rico tropical",

  knownFormulas: [
    "fitted_top_wide_bottom",
    "oversized_top_slim_bottom",
    "monochromatic",
    "dress_with_accessories",
  ] as ProportionFormula[],

  expansionFormulas: [
    "layer_over_slim",
    "belt_defines_waist",
    "contrast_volume",
    "tuck_and_drape",
    "elevated_athleisure",
    "editorial_unexpected",
  ] as ProportionFormula[],

  elevationHierarchy: [
    "statement_earrings",
    "elevated_shoe",
    "structured_bag",
    "waist_belt",
    "interesting_texture",
    "metallic_accent",
    "outerwear_as_anchor",
    "tuck_or_layer_detail",
    "unexpected_proportion",
    "color_pop_bag",
  ] as ElevationPieceType[],

  occasionPolishLevel: {
    office: 4,
    casual_elevated: 3,
    evening: 5,
    athleisure: 2,
    general: 3,
  } as Record<OccasionLevel, number>,

  elevatingMaterials: ["linen", "silk", "satin", "knit", "leather", "suede"] as const,
  basicMaterials: ["cotton", "synthetic"] as const,

  silhouetteRules: [
    "No simultaneous volume top + volume bottom.",
    "If bottom has volume, top must be fitted, tucked, cropped, or waist-defined.",
    "If top has volume, bottom must be slim, straight, or fitted.",
    "Every outfit needs waist definition or waist implication.",
    "Every outfit needs at least one elevation piece.",
  ],
} as const

export const PROPORTION_FORMULAS: Record<ProportionFormula, {
  label: string
  description: string
  bestFor: OccasionLevel[]
  elevationTip: string
  isInStephanieRotation: boolean
  difficultyToStyle: "easy" | "medium" | "bold"
}> = {
  fitted_top_wide_bottom: {
    label: "Fitted top + wide/full bottom",
    description: "Defined top with wide-leg pants or full skirt.",
    bestFor: ["office", "casual_elevated", "evening"],
    elevationTip: "Use a tuck, belt, or pointed shoe to keep it polished.",
    isInStephanieRotation: true,
    difficultyToStyle: "easy",
  },
  oversized_top_slim_bottom: {
    label: "Oversized top + slim bottom",
    description: "Volume on top balanced by a slim or fitted bottom.",
    bestFor: ["office", "casual_elevated", "athleisure"],
    elevationTip: "Add earrings or a structured bag so oversized reads intentional.",
    isInStephanieRotation: true,
    difficultyToStyle: "easy",
  },
  monochromatic: {
    label: "Monochromatic tonal look",
    description: "One color family with tonal variation.",
    bestFor: ["office", "casual_elevated", "evening"],
    elevationTip: "Needs texture variation: silk + linen, knit + leather, etc.",
    isInStephanieRotation: true,
    difficultyToStyle: "medium",
  },
  dress_with_accessories: {
    label: "Dress/jumpsuit + accessories",
    description: "Simple base where accessories create the point of view.",
    bestFor: ["office", "casual_elevated", "evening"],
    elevationTip: "Pick one hero: earrings, shoe, bag, or belt.",
    isInStephanieRotation: true,
    difficultyToStyle: "easy",
  },
  layer_over_slim: {
    label: "Layer over slim base",
    description: "Blazer, jacket, or overshirt over a clean slim base.",
    bestFor: ["office", "casual_elevated", "evening"],
    elevationTip: "Leave open, push sleeves, or belt the layer.",
    isInStephanieRotation: false,
    difficultyToStyle: "medium",
  },
  belt_defines_waist: {
    label: "Belt defines waist",
    description: "Belt creates the waist when the clothes do not.",
    bestFor: ["office", "casual_elevated", "evening"],
    elevationTip: "Use cognac, chocolate, rust, or gold-buckle belt.",
    isInStephanieRotation: false,
    difficultyToStyle: "easy",
  },
  contrast_volume: {
    label: "Intentional volume contrast",
    description: "One piece has volume, the other creates structure.",
    bestFor: ["casual_elevated", "evening"],
    elevationTip: "Keep colors simple so silhouette is the statement.",
    isInStephanieRotation: false,
    difficultyToStyle: "bold",
  },
  tuck_and_drape: {
    label: "Tuck or drape detail",
    description: "Front tuck, half tuck, side tuck, or draped styling.",
    bestFor: ["office", "casual_elevated", "general"],
    elevationTip: "Same pieces, more intention.",
    isInStephanieRotation: false,
    difficultyToStyle: "easy",
  },
  elevated_athleisure: {
    label: "Elevated athleisure",
    description: "Active base with one polished item.",
    bestFor: ["athleisure", "casual_elevated"],
    elevationTip: "Add blazer, clean shoe, or structured bag.",
    isInStephanieRotation: false,
    difficultyToStyle: "medium",
  },
  editorial_unexpected: {
    label: "Editorial unexpected pairing",
    description: "High-low mix: formal with casual, casual with formal.",
    bestFor: ["casual_elevated", "evening"],
    elevationTip: "Keep one piece quiet so the unexpected part feels intentional.",
    isInStephanieRotation: false,
    difficultyToStyle: "bold",
  },
}

function isElevatingMaterial(item: OutfitStylingItem): boolean {
  if (!item.material) return false
  return (STEPHANIE_STYLE_PROFILE.elevatingMaterials as readonly string[]).includes(item.material)
}

function isBasicMaterial(item: OutfitStylingItem): boolean {
  if (!item.material) return false
  return (STEPHANIE_STYLE_PROFILE.basicMaterials as readonly string[]).includes(item.material)
}

function detectProportionFormula(items: OutfitStylingItem[]): ProportionFormula | null {
  const tops = items.filter(item => item.category === "top" || item.category === "outerwear")
  const bottoms = items.filter(item => item.category === "bottom")
  const dresses = items.filter(item => item.category === "dress")

  if (dresses.length > 0) return "dress_with_accessories"
  if (tops.length === 0 || bottoms.length === 0) return null

  const hasOversizedTop = tops.some(item => item.fit === "oversized" || item.fit === "flowy")
  const hasStructuredLayer = tops.some(item => item.category === "outerwear" && item.fit === "structured")
  const hasFittedTop = tops.some(item => item.fit === "fitted" || item.fit === "slim")
  const hasSlimBottom = bottoms.some(item => item.fit === "slim" || item.fit === "fitted" || item.fit === "straight")
  const hasWideBottom = bottoms.some(item => item.fit === "wide" || item.fit === "flowy")

  if (hasOversizedTop && hasSlimBottom) return "oversized_top_slim_bottom"
  if (hasFittedTop && hasWideBottom) return "fitted_top_wide_bottom"
  if (hasStructuredLayer && hasSlimBottom) return "layer_over_slim"

  return null
}

function detectElevationPieces(items: OutfitStylingItem[]): OutfitStylingItem[] {
  return items.filter(item => {
    if (item.isElevationPiece) return true
    if (isElevatingMaterial(item)) return true
    if (item.category === "jewelry") return true
    if (item.category === "belt") return true
    if (item.category === "bag" && item.dominance === "accent_support") return true
    if (item.category === "shoes" && item.dominance === "accent_support") return true
    if (item.category === "outerwear" && item.fit === "structured") return true
    return false
  })
}

function scoreElevation(
  items: OutfitStylingItem[],
  elevationPieces: OutfitStylingItem[],
  formula: ProportionFormula | null,
  occasion: OccasionLevel
): number {
  let score = 40

  if (elevationPieces.length > 0) score += 25
  if (items.some(item => item.isElevationPiece)) score += 10
  if (items.some(isElevatingMaterial)) score += 10
  if (formula) score += 10
  if (formula && STEPHANIE_STYLE_PROFILE.expansionFormulas.includes(formula)) score += 5

  const elevationTypes = new Set(elevationPieces.map(item => item.elevationType).filter(Boolean))
  if (elevationTypes.size === 2) score += 5
  if (elevationTypes.size >= 3) score -= 5

  const polishRequired = STEPHANIE_STYLE_PROFILE.occasionPolishLevel[occasion]
  const hasHighPolish = elevationPieces.some(item =>
    item.elevationType &&
    (["statement_earrings", "elevated_shoe", "outerwear_as_anchor"] as ElevationPieceType[]).includes(item.elevationType)
  )

  if (polishRequired >= 4 && hasHighPolish) score += 5
  if (polishRequired >= 4 && !hasHighPolish) score -= 10

  return Math.max(0, Math.min(100, score))
}

export function evaluateOutfitStyling(
  items: OutfitStylingItem[],
  options: StylingEvaluationOptions = {}
): OutfitStylingResult {
  const occasion = options.occasion ?? "general"
  const pushBeyond = options.pushBeyondComfort ?? true

  const formula = detectProportionFormula(items)
  const elevationPieces = detectElevationPieces(items)
  const hasElevationPiece = elevationPieces.length > 0
  const elevationScore = scoreElevation(items, elevationPieces, formula, occasion)

  const ruleResults: StylingRuleResult[] = []

  const tops = items.filter(item => item.category === "top" || item.category === "outerwear")
  const bottoms = items.filter(item => item.category === "bottom")
  const hasVolumeTop = tops.some(item => item.fit === "oversized" || item.fit === "flowy")
  const hasVolumeBottom = bottoms.some(item => item.fit === "wide" || item.fit === "flowy")

  if (hasVolumeTop && hasVolumeBottom) {
    ruleResults.push({
      rule: "PROPORTION-1",
      passed: false,
      severity: "proportion",
      message: "Volume on both top and bottom simultaneously. Silhouette loses shape.",
      suggestion: "If bottom is wide, top needs tuck/fit/crop/waist definition. If top is oversized, bottom should be slim or straight.",
    })
  } else {
    ruleResults.push({
      rule: "PROPORTION-1",
      passed: true,
      severity: "proportion",
      message: "Volume balance is good.",
    })
  }

  const hasBelt = items.some(item => item.category === "belt")
  const hasFittedOrSlim = items.some(item => item.fit === "fitted" || item.fit === "slim")
  const hasDress = items.some(item => item.category === "dress")

  if (!hasBelt && !hasFittedOrSlim && !hasDress && (hasVolumeTop || hasVolumeBottom)) {
    ruleResults.push({
      rule: "PROPORTION-2",
      passed: false,
      severity: "proportion",
      message: "Waist is not clearly defined or implied.",
      suggestion: "Add a belt, tuck one piece, or swap one item for a fitted silhouette.",
    })
  } else {
    ruleResults.push({
      rule: "PROPORTION-2",
      passed: true,
      severity: "proportion",
      message: "Waist is defined or implied.",
    })
  }

  if (!hasElevationPiece) {
    ruleResults.push({
      rule: "ELEVATION-1",
      passed: false,
      severity: "elevation",
      message: "No elevation piece detected. This is dressed, not styled.",
      suggestion: suggestElevation(items, occasion),
    })
  } else {
    ruleResults.push({
      rule: "ELEVATION-1",
      passed: true,
      severity: "elevation",
      message: `Elevation piece present: ${elevationPieces.map(item => item.label).join(", ")}.`,
    })
  }

  const competingElevation = items.filter(item => {
    if (!item.isElevationPiece) return false

    // Normal styling supports complete a look, but should not automatically compete.
    if (item.elevationType === "structured_bag") return false
    if (item.elevationType === "waist_belt") return false
    if (item.elevationType === "elevated_shoe") return false
    if (item.elevationType === "metallic_accent") return false
    if (item.elevationType === "tuck_or_layer_detail") return false

    // A metallic watch or simple gold jewelry supports the look.
    if (item.category === "jewelry" && item.dominance === "non_dominant_metallic") return false

    return true
  })

  if (competingElevation.length > 2) {
    ruleResults.push({
      rule: "ELEVATION-2",
      passed: false,
      severity: "elevation",
      message: `Too many competing hero moments (${competingElevation.length}).`,
      suggestion: "Pick 1 hero and 1 supporting moment. Let the rest stay quiet.",
    })
  } else {
    ruleResults.push({
      rule: "ELEVATION-2",
      passed: true,
      severity: "elevation",
      message: "Elevation is focused, not competing.",
    })
  }

  if (occasion === "office" && elevationScore < 60) {
    ruleResults.push({
      rule: "OCCASION-1",
      passed: false,
      severity: "occasion",
      message: "Outfit may read too casual for Berlitz office.",
      suggestion: "Add a polished element: blazer, structured bag, pointed shoe, or gold jewelry.",
    })
  } else {
    ruleResults.push({
      rule: "OCCASION-1",
      passed: true,
      severity: "occasion",
      message: `Occasion fit for ${occasion}: appropriate polish level.`,
    })
  }

  const materialItems = items.filter(item => item.material)
  const allBasicMaterials = materialItems.length >= 2 && materialItems.every(isBasicMaterial)

  if (allBasicMaterials) {
    ruleResults.push({
      rule: "TEXTURE-1",
      passed: false,
      severity: "texture",
      message: "All pieces are basic materials. Outfit needs texture.",
      suggestion: "Add silk, linen, leather, suede, or knit — or use a stronger accessory.",
    })
  } else {
    ruleResults.push({
      rule: "TEXTURE-1",
      passed: true,
      severity: "texture",
      message: "Texture mix is intentional enough.",
    })
  }

  const failedProportions = ruleResults.filter(result => !result.passed && result.severity === "proportion")
  const failedElevation = ruleResults.filter(result => !result.passed && result.severity === "elevation")
  const failedOccasion = ruleResults.filter(result => !result.passed && result.severity === "occasion")
  const polishRequired = STEPHANIE_STYLE_PROFILE.occasionPolishLevel[occasion]

  let stylingStatus: StylingStatus
  if (failedProportions.some(result => result.rule === "PROPORTION-1")) {
    stylingStatus = "proportions_off"
  } else if (failedOccasion.length > 0 && polishRequired >= 4 && elevationScore < 55) {
    stylingStatus = "underdressed"
  } else if (
    !hasElevationPiece ||
    failedElevation.some(result => result.rule === "ELEVATION-1" || result.rule === "ELEVATION-2")
  ) {
    stylingStatus = "needs_elevation"
  } else {
    stylingStatus = "elevated"
  }

  const formulaSuggestions = getFormulaSuggestions(formula, occasion, pushBeyond)
  const trendNote = options.includeTrendNote ? buildTrendNote(formula, occasion) : null

  return {
    stylingStatus,
    elevationScore,
    hasElevationPiece,
    elevationPieces,
    detectedFormula: formula,
    formulaSuggestions,
    occasionFit: failedOccasion.length > 0 ? "stretch" : "good",
    ruleResults,
    elevationSuggestion: suggestElevation(items, occasion),
    stylingNarrative: buildStylingNarrative({
      formula,
      elevationPieces,
      stylingStatus,
      elevationScore,
      ruleResults,
      formulaSuggestions,
    }),
    trendNote,
  }
}

export function suggestElevation(items: OutfitStylingItem[], occasion: OccasionLevel = "general"): string {
  const hasJewelry = items.some(item => item.category === "jewelry")
  const hasBag = items.some(item => item.category === "bag")
  const hasShoe = items.some(item => item.category === "shoes")
  const hasBelt = items.some(item => item.category === "belt")
  const hasOuterwear = items.some(item => item.category === "outerwear")
  const hasDress = items.some(item => item.category === "dress")
  const materialItems = items.filter(item => item.material)
  const allBasicMaterials = materialItems.length > 0 && materialItems.every(isBasicMaterial)

  if (!hasJewelry && occasion !== "athleisure") {
    return "Add earrings — your fastest elevation move. Try medium-large gold hoops or bronze textured drops."
  }

  if (!hasShoe && (occasion === "office" || occasion === "evening")) {
    return "Add an intentional shoe: cognac pointed mule, bronze sandal, or chocolate loafer with hardware."
  }

  if (!hasBelt && !hasDress && items.some(item => item.fit === "wide" || item.fit === "oversized")) {
    return "Add a belt to define the waist: cognac leather, chocolate, or camel with gold hardware."
  }

  if (!hasBag && occasion !== "athleisure") {
    return "Add a structured bag: camel top-handle, espresso crossbody, or cognac shoulder bag."
  }

  if (allBasicMaterials) {
    return "Add a texture moment: silk top, linen trouser, leather belt, suede shoe, or textured knit."
  }

  if (!hasOuterwear && occasion === "office") {
    return "Add a structured blazer or linen layer to make the look office-polished."
  }

  return "Style it with a front tuck, pushed sleeves, or one warm metallic accent so the outfit has a focal point."
}

export function getFormulaSuggestions(
  currentFormula: ProportionFormula | null,
  occasion: OccasionLevel,
  pushBeyond = true
): ProportionFormula[] {
  const formulas = Object.keys(PROPORTION_FORMULAS) as ProportionFormula[]

  const suitable = formulas.filter(formula => {
    const definition = PROPORTION_FORMULAS[formula]
    const fitsOccasion = occasion === "general" || definition.bestFor.includes(occasion)
    return fitsOccasion && formula !== currentFormula
  })

  if (!pushBeyond) {
    return suitable
      .filter(formula => STEPHANIE_STYLE_PROFILE.knownFormulas.includes(formula))
      .slice(0, 2)
  }

  const known = suitable.filter(formula => STEPHANIE_STYLE_PROFILE.knownFormulas.includes(formula))
  const expansion = suitable.filter(formula => STEPHANIE_STYLE_PROFILE.expansionFormulas.includes(formula))

  return [...known.slice(0, 1), ...expansion.slice(0, 2)]
}

function buildTrendNote(formula: ProportionFormula | null, occasion: OccasionLevel): string | null {
  if (formula === "monochromatic") {
    return "Tonal dressing works best when texture changes: same color family, different materials."
  }

  if (formula === "layer_over_slim") {
    return "The current elevated move is a structured layer over a clean slim base, with sleeves pushed or waist belted."
  }

  if (formula === "belt_defines_waist") {
    return "A strong belt is one of the easiest ways to make basics look intentional and current."
  }

  if (occasion === "office") {
    return "Office elevation works best with one unexpected detail: sculptural earrings, textured bag, or elevated shoe."
  }

  if (occasion === "evening") {
    return "Evening looks feel most current when one silhouette, one texture, and one accessory carry the look."
  }

  return null
}

function buildStylingNarrative(context: {
  formula: ProportionFormula | null
  elevationPieces: OutfitStylingItem[]
  stylingStatus: StylingStatus
  elevationScore: number
  ruleResults: StylingRuleResult[]
  formulaSuggestions: ProportionFormula[]
}): string {
  const { formula, elevationPieces, stylingStatus, elevationScore, ruleResults, formulaSuggestions } = context

  const openers: Record<StylingStatus, string> = {
    elevated: "✨ This outfit has a point of view.",
    needs_elevation: "👀 This outfit is dressed, but not yet styled.",
    underdressed: "⚠️ This combination is too relaxed for the occasion.",
    overdressed: "⚠️ This reads too formal for the context.",
    proportions_off: "📐 The proportions need attention first.",
  }

  let narrative = `${openers[stylingStatus]} Elevation score: ${elevationScore}/100.`

  if (formula) {
    const formulaDefinition = PROPORTION_FORMULAS[formula]
    narrative += ` Formula: ${formulaDefinition.label}. ${formulaDefinition.elevationTip}`
  }

  if (elevationPieces.length > 0) {
    narrative += ` Elevation comes from: ${elevationPieces.map(item => item.label).join(", ")}.`
  }

  const failedRules = ruleResults.filter(result => !result.passed)
  if (failedRules.length > 0) {
    narrative += ` Issues: ${failedRules.map(result => result.message).join(" | ")}`
  }

  const expansionSuggestion = formulaSuggestions.find(
    formulaSuggestion => !STEPHANIE_STYLE_PROFILE.knownFormulas.includes(formulaSuggestion)
  )

  if (expansionSuggestion) {
    const suggestionDefinition = PROPORTION_FORMULAS[expansionSuggestion]
    narrative += ` Next-level idea: ${suggestionDefinition.label} — ${suggestionDefinition.description}`
  }

  return narrative
}

export function buildStylingContextForAI(occasion?: OccasionLevel): string {
  const selectedOccasion = occasion ?? "general"
  const polishLevel = STEPHANIE_STYLE_PROFILE.occasionPolishLevel[selectedOccasion]

  const knownFormulas = STEPHANIE_STYLE_PROFILE.knownFormulas
    .map(formula => PROPORTION_FORMULAS[formula].label)
    .join("; ")

  const expansionFormulas = STEPHANIE_STYLE_PROFILE.expansionFormulas
    .map(formula => PROPORTION_FORMULAS[formula].label)
    .join("; ")

  const elevationHierarchy = STEPHANIE_STYLE_PROFILE.elevationHierarchy
    .slice(0, 5)
    .join(", ")

  return `
STYLE INTELLIGENCE — Stephanie's Styling Profile

CORE PRINCIPLE — THE ELEVATION RULE:
Every outfit must have at least one intentional decision that elevates it from dressed to styled.
No clothing-only outfit should be fully approved.

SILHOUETTE:
- Body: Bottom Hourglass.
- Waist must always be defined, implied, or created.
- Never simultaneous volume top + volume bottom.
- If wide bottom: top must tuck, fit, crop, or be waist-defined.
- If oversized top: bottom must be slim, straight, or fitted.

KNOWN FORMULAS:
${knownFormulas}

EXPANSION FORMULAS:
${expansionFormulas}

ELEVATION TOOLS:
${elevationHierarchy}

STYLING RULES:
1. Every outfit needs at least one elevation piece.
2. Max 2 competing elevation moments.
3. If earrings are the star, bag and shoes stay quieter.
4. If shoe is the star, jewelry stays minimal.
5. Texture counts as elevation: silk, linen, satin, leather, suede, knit.
6. Styling detail counts: front tuck, half tuck, pushed sleeves, belted layer.
7. AI should elevate beyond obvious combinations, but never into random chaos.

OCCASION: ${selectedOccasion}
POLISH REQUIRED: ${polishLevel}/5

CLIMATE:
Puerto Rico tropical. Prioritize breathable fabrics and polished lightweight styling.

GOAL:
Stephanie should always look polished, pretty, elegant, and a little extra — even in basics.
`.trim()
}
