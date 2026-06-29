/**
 * THE EDIT — Outfit Composer
 *
 * This is the bridge between the closet inventory and the intelligence layers.
 *
 * It receives WardrobeItem[] and returns styled outfit ideas that have passed:
 * 1. color validation
 * 2. styling / elevation validation
 * 3. basic completeness rules
 *
 * V1 goal:
 * Generate complete styled looks, not clothing-only combinations.
 */

import type { ColorFamily, WardrobeItem } from "@/types/wardrobe"
import {
  validateOutfitColors,
  type ColorDominance,
  type OutfitColorItem,
  type OutfitColorValidationResult,
} from "./outfit-color-validator"
import {
  evaluateOutfitStyling,
  type OccasionLevel,
  type OutfitStylingItem,
  type OutfitStylingResult,
  type ElevationPieceType,
} from "./style-intelligence"

type ValidatorCategory = NonNullable<OutfitColorItem["category"]>

export type ComposerDecision = "approved" | "needs_review" | "rejected"

export interface OutfitComposerOptions {
  occasion?: OccasionLevel
  maxLooks?: number
  includeOuterwear?: boolean
  includeAccessories?: boolean
  allowDenim?: boolean
  requireColorApproval?: boolean
  pushBeyondComfort?: boolean
}

export interface ComposedOutfit {
  id: string
  title: string
  occasion: OccasionLevel
  decision: ComposerDecision
  totalScore: number
  colorScore: number
  elevationScore: number
  formula: string
  items: OutfitStylingItem[]
  pieceIds: string[]
  colorValidation: OutfitColorValidationResult
  stylingValidation: OutfitStylingResult
  stylingInstruction: string
  whyItWorks: string[]
  missingToElevate: string[]
}

const DEFAULT_OPTIONS: Required<OutfitComposerOptions> = {
  occasion: "general",
  maxLooks: 12,
  includeOuterwear: true,
  includeAccessories: true,
  allowDenim: true,
  requireColorApproval: false,
  pushBeyondComfort: true,
}

const FAMILY_ID_BY_COLOR_FAMILY: Partial<Record<ColorFamily, string>> = {
  black: "black",
  brown: "brown",
  cream: "white_cream_ivory",
  beige: "beige_tan_camel",
  white: "white_cream_ivory",
  burgundy: "burgundy_wine_berry",
  olive: "green",
  camel: "beige_tan_camel",
  plum: "purple_plum_eggplant",
  mustard: "yellow_gold_mustard",
  denim: "denim",
  blue: "blue_teal_peacock",
  pink: "pink_coral_salmon",
  orange: "orange_terracotta_rust",
  metallic: "metallics",
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function textForItem(item: WardrobeItem): string {
  return `${item.name} ${item.subcategory ?? ""} ${item.colorFamily} ${item.colorName}`.toLowerCase()
}

export function mapWardrobeItemToNormalizedShade(item: WardrobeItem): string {
  const text = textForItem(item)

  if (text.includes("electric blue")) return "electric_blue"
  if (text.includes("pure white")) return "pure_white"
  if (text.includes("silver") && !text.includes("warm")) return "cool_silver"
  if (text.includes("hot pink")) return "hot_pink"
  if (text.includes("lavender")) return "lavender"

  if (text.includes("espresso")) return "espresso"
  if (text.includes("chocolate") || text.includes("dark brown")) return "dark_chocolate"
  if (text.includes("cognac")) return "toffee"
  if (text.includes("tortoise")) return "tortoise"
  if (text.includes("amber")) return "amber"

  if (text.includes("warm cream")) return "warm_cream"
  if (text.includes("ivory")) return "ivory"
  if (text.includes("cream")) return "warm_cream"
  if (text.includes("warm white")) return "yellow_white"
  if (text.includes("off white")) return "yellow_white"

  if (text.includes("camel")) return "camel"
  if (text.includes("caramel")) return "camel"
  if (text.includes("warm tan")) return "golden_tan"
  if (text.includes("warm beige")) return "warm_sand"
  if (text.includes("sand")) return "warm_sand"
  if (text.includes("taupe")) return "greige"

  if (text.includes("burgundy")) return "deep_burgundy"
  if (text.includes("wine")) return "wine"
  if (text.includes("oxblood")) return "deep_burgundy"
  if (text.includes("deep red")) return "brick_red"
  if (text.includes("true red") || text.includes("red")) return "brick_red"

  if (text.includes("deep teal")) return "deep_teal"
  if (text.includes("teal")) return "deep_teal"
  if (text.includes("peacock")) return "peacock"
  if (text.includes("petrol")) return "deep_teal"
  if (text.includes("navy")) return "warm_navy"
  if (text.includes("blue")) return "deep_teal"

  if (text.includes("dark olive")) return "dark_olive"
  if (text.includes("olive")) return "olive"
  if (text.includes("forest")) return "forest_green"
  if (text.includes("moss")) return "moss"
  if (text.includes("sage")) return "sage_pale"
  if (text.includes("emerald")) return "hunter_green"

  if (text.includes("mustard")) return "mustard"
  if (text.includes("golden mustard")) return "golden_mustard"
  if (text.includes("ochre")) return "ochre"
  if (text.includes("champagne")) return "champagne_gold"
  if (text.includes("gold")) return item.category === "jewelry" ? "metal_antique_gold" : "antique_gold"

  if (text.includes("dark denim")) return "dark_denim"
  if (text.includes("medium blue denim")) return "medium_wash_denim"
  if (text.includes("light blue denim")) return "light_wash_denim"
  if (text.includes("denim")) return "dark_denim"

  if (text.includes("plum")) return "plum"
  if (text.includes("eggplant")) return "eggplant"
  if (text.includes("mauve")) return "mauve"

  if (text.includes("coral")) return "coral"
  if (text.includes("rose")) return "rosewood"
  if (text.includes("blush")) return "baby_pink"
  if (text.includes("pink")) return "rosewood"

  if (text.includes("rust")) return "rust"
  if (text.includes("terracotta")) return "terracotta"
  if (text.includes("orange")) return "spice_orange"

  if (text.includes("bronze")) return "bronze"
  if (text.includes("copper")) return "copper"
  if (text.includes("antique gold")) return "metal_antique_gold"
  if (text.includes("gold")) return "metal_antique_gold"

  if (text.includes("washed black")) return "washed_black_denim"
  if (text.includes("black")) return "warm_black"

  return normalizeText(item.colorName || item.colorFamily)
}

function inferFamilyId(item: WardrobeItem, normalizedShade: string): string | undefined {
  if (["deep_teal", "peacock", "warm_navy"].includes(normalizedShade)) return "blue_teal_peacock"
  if (["brick_red", "paprika", "deep_tomato"].includes(normalizedShade)) return "red"
  if (["plum", "eggplant", "mauve"].includes(normalizedShade)) return "purple_plum_eggplant"
  if (["rosewood", "coral", "baby_pink", "hot_pink"].includes(normalizedShade)) return "pink_coral_salmon"
  if (["metal_antique_gold", "bronze", "copper", "cool_silver"].includes(normalizedShade)) return "metallics"
  return FAMILY_ID_BY_COLOR_FAMILY[item.colorFamily]
}

function toValidatorCategory(item: WardrobeItem): ValidatorCategory {
  const text = textForItem(item)

  if (item.category === "accessory" && text.includes("belt")) return "belt"
  if (item.category === "accessory") return "accessory"

  return item.category
}

function inferDominance(item: WardrobeItem, category: ValidatorCategory): ColorDominance {
  if (category === "top" || category === "bottom" || category === "dress" || category === "outerwear") {
    return "dominant"
  }

  if (category === "jewelry") {
    const text = textForItem(item)
    return text.includes("gold") || text.includes("bronze") || text.includes("copper") || text.includes("metallic")
      ? "non_dominant_metallic"
      : "accent_support"
  }

  return "accent_support"
}

function inferFit(item: WardrobeItem): OutfitStylingItem["fit"] {
  const text = textForItem(item)

  if (text.includes("oversized") || text.includes("boxy")) return "oversized"
  if (text.includes("flowy") || text.includes("ruffle") || text.includes("drape")) return "flowy"
  if (text.includes("wide leg") || text.includes("wide-leg") || text.includes("palazzo")) return "wide"
  if (text.includes("straight")) return "straight"
  if (text.includes("skinny") || text.includes("legging") || text.includes("slim")) return "slim"
  if (text.includes("blazer") || text.includes("vest") || text.includes("jacket")) return "structured"
  if (text.includes("bodysuit") || text.includes("tank") || text.includes("camisole") || text.includes("crop") || text.includes("tube")) return "fitted"
  if (item.category === "top") return "fitted"
  if (item.category === "bottom") return "straight"
  if (item.category === "dress") return "flowy"
  if (item.category === "outerwear") return "structured"

  return undefined
}

function inferMaterial(item: WardrobeItem): OutfitStylingItem["material"] {
  const text = textForItem(item)

  if (text.includes("linen")) return "linen"
  if (text.includes("silk")) return "silk"
  if (text.includes("satin")) return "satin"
  if (text.includes("knit")) return "knit"
  if (text.includes("denim") || text.includes("jean")) return "denim"
  if (text.includes("leather")) return "leather"
  if (text.includes("suede")) return "suede"
  if (text.includes("cotton") || text.includes("tee") || text.includes("t-shirt")) return "cotton"

  return undefined
}

function inferElevationType(item: WardrobeItem, category: ValidatorCategory): ElevationPieceType | undefined {
  const text = textForItem(item)

  if (category === "jewelry") return "statement_earrings"
  if (category === "belt") return "waist_belt"
  if (category === "shoes") return "elevated_shoe"
  if (category === "bag") {
    return item.vibes.includes("statement") ? "color_pop_bag" : "structured_bag"
  }
  if (category === "outerwear") return "outerwear_as_anchor"
  if (text.includes("silk") || text.includes("satin") || text.includes("linen") || text.includes("leather") || text.includes("suede") || text.includes("knit")) {
    return "interesting_texture"
  }
  if (item.vibes.includes("statement")) return "unexpected_proportion"

  return undefined
}

export function wardrobeItemToStylingItem(item: WardrobeItem): OutfitStylingItem {
  const category = toValidatorCategory(item)
  const normalizedShade = mapWardrobeItemToNormalizedShade(item)
  const elevationType = inferElevationType(item, category)
  const isElevationPiece =
    Boolean(elevationType) ||
    item.vibes.includes("statement") ||
    (item.vibes.includes("elevated") && (category === "shoes" || category === "bag" || category === "outerwear"))

  return {
    label: item.name,
    normalizedShade,
    familyId: inferFamilyId(item, normalizedShade),
    dominance: inferDominance(item, category),
    category,
    fit: inferFit(item),
    material: inferMaterial(item),
    isElevationPiece,
    elevationType,
  }
}

function isActiveOwnedItem(item: WardrobeItem): boolean {
  return !item.itemStatus || item.itemStatus === "active"
}

function isOfficeCompatible(item: WardrobeItem, allowDenim: boolean): boolean {
  if (!allowDenim && item.colorFamily === "denim") return false
  if (item.category === "bottom" && !allowDenim && textForItem(item).includes("jean")) return false
  return true
}

function scoreWardrobeItem(item: WardrobeItem, occasion: OccasionLevel): number {
  let score = 0

  score += item.loveScore ?? 0
  score += item.versatilityScore ?? 0
  score += item.fitConfidenceScore ?? 0
  score += item.capsuleValueScore ?? 0

  if (occasion === "office" && item.vibes.includes("work")) score += 10
  if (occasion === "casual_elevated" && item.vibes.includes("casual")) score += 5
  if (occasion === "evening" && item.vibes.includes("statement")) score += 8
  if (item.vibes.includes("elevated")) score += 6
  if (item.vibes.includes("classic")) score += 4
  if (item.vibes.includes("tropical")) score += 4

  return score
}

function sortByUsefulness(items: WardrobeItem[], occasion: OccasionLevel): WardrobeItem[] {
  return [...items].sort((a, b) => scoreWardrobeItem(b, occasion) - scoreWardrobeItem(a, occasion))
}

function uniqueItems(items: Array<WardrobeItem | undefined>): WardrobeItem[] {
  const seen = new Set<string>()
  const result: WardrobeItem[] = []

  for (const item of items) {
    if (!item) continue
    if (seen.has(item.id)) continue
    seen.add(item.id)
    result.push(item)
  }

  return result
}

function getFirstUseful(items: WardrobeItem[], occasion: OccasionLevel): WardrobeItem | undefined {
  return sortByUsefulness(items, occasion)[0]
}

function getSupportItems(
  baseItems: WardrobeItem[],
  pools: {
    shoes: WardrobeItem[]
    bags: WardrobeItem[]
    belts: WardrobeItem[]
    jewelry: WardrobeItem[]
  },
  options: Required<OutfitComposerOptions>
): WardrobeItem[] {
  if (!options.includeAccessories) return []

  const hasDress = baseItems.some(item => item.category === "dress")
  const hasVolume = baseItems.some(item => {
    const fit = inferFit(item)
    return fit === "wide" || fit === "oversized" || fit === "flowy"
  })

  const seed = Math.abs(
    baseItems.map((item) => item.id).join("|").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
  )

  const pickRotated = (items: WardrobeItem[], offset = 0) => {
    const sorted = sortByUsefulness(items, options.occasion).slice(0, 5)
    if (sorted.length === 0) return undefined
    return sorted[(seed + offset) % sorted.length]
  }

  const shoe = pickRotated(pools.shoes, 0)
  const bag = pickRotated(pools.bags, 2)
  const jewelry = pickRotated(pools.jewelry, 4)
  const belt = hasVolume && !hasDress ? pickRotated(pools.belts, 6) : undefined

  return uniqueItems([shoe, bag, jewelry, belt])
}

function getPools(items: WardrobeItem[], options: Required<OutfitComposerOptions>) {
  const active = items
    .filter(isActiveOwnedItem)
    .filter(item => isOfficeCompatible(item, options.allowDenim))

  const accessories = active.filter(item => item.category === "accessory")
  const belts = accessories.filter(item => textForItem(item).includes("belt"))

  return {
    tops: sortByUsefulness(active.filter(item => item.category === "top"), options.occasion).slice(0, 16),
    bottoms: sortByUsefulness(active.filter(item => item.category === "bottom"), options.occasion).slice(0, 16),
    dresses: sortByUsefulness(active.filter(item => item.category === "dress"), options.occasion).slice(0, 10),
    outerwear: sortByUsefulness(active.filter(item => item.category === "outerwear"), options.occasion).slice(0, 8),
    shoes: sortByUsefulness(
      active.filter(item =>
        item.category === "shoes" &&
        !(options.occasion === "office" &&
          textForItem(item).includes("sneaker") &&
          !item.vibes.includes("work") &&
          !item.vibes.includes("elevated"))
      ),
      options.occasion
    ).slice(0, 8),
    bags: sortByUsefulness(active.filter(item => item.category === "bag"), options.occasion).slice(0, 8),
    belts: sortByUsefulness(belts, options.occasion).slice(0, 8),
    jewelry: sortByUsefulness(active.filter(item => item.category === "jewelry"), options.occasion).slice(0, 8),
  }
}

function colorContextForOccasion(occasion: OccasionLevel): "tropical" | "office" | "casual" | "evening" | "general" {
  if (occasion === "casual_elevated" || occasion === "athleisure") return "casual"
  return occasion
}

function getDecision(
  colorValidation: OutfitColorValidationResult,
  stylingValidation: OutfitStylingResult
): ComposerDecision {
  if (colorValidation.status === "rejected") return "rejected"
  if (stylingValidation.stylingStatus === "proportions_off") return "rejected"

  if (
    colorValidation.status === "needs_review" ||
    stylingValidation.stylingStatus !== "elevated"
  ) {
    return "needs_review"
  }

  return "approved"
}

function getTotalScore(
  colorValidation: OutfitColorValidationResult,
  stylingValidation: OutfitStylingResult,
  items: WardrobeItem[]
): number {
  const baseScore = Math.round((colorValidation.harmonyScore * 0.48) + (stylingValidation.elevationScore * 0.52))
  const closetConfidence = Math.min(3, Math.round(items.reduce((sum, item) => sum + (item.loveScore ?? 0), 0) / 30))
  const completeLookBonus = items.some(item => item.category === "shoes") ? 2 : 0

  const colorBuilderFamilies: ColorFamily[] = [
    "burgundy",
    "olive",
    "camel",
    "plum",
    "mustard",
    "orange",
    "blue",
    "pink",
    "metallic",
    "statement",
  ]

  const safeNeutralFamilies: ColorFamily[] = ["black", "cream", "white", "beige"]

  const dominantCoreItems = items.filter(item =>
    item.category === "outerwear" ||
    item.category === "top" ||
    item.category === "bottom" ||
    item.category === "dress"
  )

  const blackDominantCount = dominantCoreItems.filter(item => item.colorFamily === "black").length
  const hasBlackBottom = items.some(item => item.category === "bottom" && item.colorFamily === "black")
  const hasNonBlackBottom = items.some(item => item.category === "bottom" && item.colorFamily !== "black")
  const hasColorBuilderCore = dominantCoreItems.some(item =>
    colorBuilderFamilies.includes(item.colorFamily) ||
    item.vibes.includes("tropical") ||
    item.vibes.includes("statement")
  )
  const hasColorBuilderAnywhere = items.some(item =>
    colorBuilderFamilies.includes(item.colorFamily) ||
    item.vibes.includes("tropical") ||
    item.vibes.includes("statement")
  )

  const allCoreSafeNeutrals =
    dominantCoreItems.length >= 2 &&
    dominantCoreItems.every(item => safeNeutralFamilies.includes(item.colorFamily))

  let intentionAdjustment = 0

  if (hasColorBuilderCore) intentionAdjustment += 7
  else if (hasColorBuilderAnywhere) intentionAdjustment += 3

  if (hasNonBlackBottom) intentionAdjustment += 5
  if (hasBlackBottom) intentionAdjustment -= 4
  if (blackDominantCount >= 2) intentionAdjustment -= 12
  if (blackDominantCount >= 3) intentionAdjustment -= 10
  if (allCoreSafeNeutrals) intentionAdjustment -= 5

  if (stylingValidation.stylingStatus !== "elevated") intentionAdjustment -= 8
  if (colorValidation.status === "needs_review") intentionAdjustment -= 5
  if (colorValidation.status === "approved_with_note") intentionAdjustment -= 2

  const rawScore = baseScore + closetConfidence + completeLookBonus + intentionAdjustment

  let scoreCap = 100

  if (stylingValidation.elevationScore < 90) scoreCap = Math.min(scoreCap, 94)
  if (stylingValidation.elevationScore < 80) scoreCap = Math.min(scoreCap, 90)
  if (colorValidation.status === "needs_review") scoreCap = Math.min(scoreCap, 92)
  if (colorValidation.status === "approved_with_note") scoreCap = Math.min(scoreCap, 95)
  if (hasBlackBottom) scoreCap = Math.min(scoreCap, 96)
  if (hasBlackBottom && !hasColorBuilderCore) scoreCap = Math.min(scoreCap, 90)
  if (allCoreSafeNeutrals && !hasColorBuilderCore) scoreCap = Math.min(scoreCap, 92)

  return Math.max(0, Math.min(scoreCap, rawScore))
}

function buildTitle(items: WardrobeItem[]): string {
  const core = items
    .filter(item => item.category === "outerwear" || item.category === "top" || item.category === "bottom" || item.category === "dress")
    .map(item => item.name)
    .slice(0, 3)
    .join(" + ")

  return core || items.map(item => item.name).slice(0, 3).join(" + ")
}

function buildStylingInstruction(
  items: WardrobeItem[],
  stylingValidation: OutfitStylingResult
): string {
  const hasOuterwear = items.some(item => item.category === "outerwear")
  const hasBelt = items.some(item => toValidatorCategory(item) === "belt")
  const hasWideBottom = items.some(item => inferFit(item) === "wide")
  const hasJewelry = items.some(item => item.category === "jewelry")

  const instructions: string[] = []

  if (hasWideBottom) instructions.push("Define the waist with a tuck or fitted top.")
  if (hasOuterwear) instructions.push("Wear the layer open or push the sleeves so it feels styled, not stiff.")
  if (hasBelt) instructions.push("Let the belt be the waist anchor.")
  if (hasJewelry) instructions.push("Keep the jewelry visible; it is part of the elevation.")
  if (instructions.length === 0) instructions.push(stylingValidation.elevationSuggestion)

  return instructions.join(" ")
}

function buildWhyItWorks(
  colorValidation: OutfitColorValidationResult,
  stylingValidation: OutfitStylingResult
): string[] {
  return [
    colorValidation.explanation,
    stylingValidation.stylingNarrative,
  ]
}

function buildMissingToElevate(stylingValidation: OutfitStylingResult): string[] {
  return stylingValidation.ruleResults
    .filter(result => !result.passed && result.suggestion)
    .map(result => result.suggestion!)
}

function composeCandidate(
  rawItems: WardrobeItem[],
  options: Required<OutfitComposerOptions>
): ComposedOutfit | null {
  const pieces = uniqueItems(rawItems)

  const hasCore =
    pieces.some(item => item.category === "dress") ||
    (pieces.some(item => item.category === "top") && pieces.some(item => item.category === "bottom"))

  if (!hasCore) return null

  if (options.occasion === "office") {
    const hasOuterwear = pieces.some(item => item.category === "outerwear")
    const hasDress = pieces.some(item => item.category === "dress")
    const hasExposedCasualTop = pieces.some(item => {
      const text = textForItem(item)
      return item.category === "top" && (
        text.includes("camisole") ||
        text.includes("tank") ||
        text.includes("tube") ||
        text.includes("crop")
      )
    })

    if (hasExposedCasualTop && !hasOuterwear && !hasDress) return null
  }

  const stylingItems = pieces.map(wardrobeItemToStylingItem)

  const colorValidation = validateOutfitColors(stylingItems, {
    context: colorContextForOccasion(options.occasion),
    allowRiskyAsAccessory: true,
    skipUnknownShades: false,
    verbose: false,
  })

  const stylingValidation = evaluateOutfitStyling(stylingItems, {
    occasion: options.occasion,
    pushBeyondComfort: options.pushBeyondComfort,
    includeTrendNote: true,
  })

  let decision = getDecision(colorValidation, stylingValidation)

  if (options.occasion === "office") {
    const hasOuterwear = pieces.some(item => item.category === "outerwear")
    const hasCasualOnlyTop = pieces.some(item =>
      item.category === "top" &&
      item.vibes.includes("casual") &&
      !item.vibes.includes("work") &&
      !item.vibes.includes("elevated")
    )

    if (hasCasualOnlyTop && !hasOuterwear) {
      decision = "needs_review"
    }
  }

  if (options.requireColorApproval && colorValidation.status === "rejected") return null
  if (decision === "rejected") return null

  const totalScore = getTotalScore(colorValidation, stylingValidation, pieces)

  return {
    id: `look-${pieces.map(item => item.id).join("-")}`,
    title: buildTitle(pieces),
    occasion: options.occasion,
    decision,
    totalScore,
    colorScore: colorValidation.harmonyScore,
    elevationScore: stylingValidation.elevationScore,
    formula: stylingValidation.detectedFormula ?? "styled_complete_look",
    items: stylingItems,
    pieceIds: pieces.map(item => item.id),
    colorValidation,
    stylingValidation,
    stylingInstruction: buildStylingInstruction(pieces, stylingValidation),
    whyItWorks: buildWhyItWorks(colorValidation, stylingValidation),
    missingToElevate: buildMissingToElevate(stylingValidation),
  }
}

export function composeOutfits(
  wardrobeItems: WardrobeItem[],
  options: OutfitComposerOptions = {}
): ComposedOutfit[] {
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options }
  const pools = getPools(wardrobeItems, resolvedOptions)
  const candidates: WardrobeItem[][] = []

  for (const dress of pools.dresses) {
    candidates.push(uniqueItems([
      dress,
      ...getSupportItems([dress], pools, resolvedOptions),
    ]))

    if (resolvedOptions.includeOuterwear) {
      for (const layer of pools.outerwear.slice(0, 4)) {
        candidates.push(uniqueItems([
          layer,
          dress,
          ...getSupportItems([layer, dress], pools, resolvedOptions),
        ]))
      }
    }
  }

  for (const top of pools.tops) {
    for (const bottom of pools.bottoms) {
      candidates.push(uniqueItems([
        top,
        bottom,
        ...getSupportItems([top, bottom], pools, resolvedOptions),
      ]))

      if (resolvedOptions.includeOuterwear) {
        for (const layer of pools.outerwear.slice(0, 4)) {
          candidates.push(uniqueItems([
            layer,
            top,
            bottom,
            ...getSupportItems([layer, top, bottom], pools, resolvedOptions),
          ]))
        }
      }
    }
  }

  const seen = new Set<string>()
  const looks: ComposedOutfit[] = []

  for (const candidate of candidates) {
    const key = candidate.map(item => item.id).sort().join("|")
    if (seen.has(key)) continue
    seen.add(key)

    const look = composeCandidate(candidate, resolvedOptions)
    if (look) looks.push(look)
  }

  const sortedLooks = looks.sort((a, b) => {
    if (a.decision !== b.decision) {
      if (a.decision === "approved") return -1
      if (b.decision === "approved") return 1
    }

    return b.totalScore - a.totalScore
  })

  const diverseLooks: ComposedOutfit[] = []
  const usedCoreKeys = new Set<string>()
  const usedBottomCounts = new Map<string, number>()
  const usedOuterwearCounts = new Map<string, number>()

  function addLook(look: ComposedOutfit) {
    const dress = look.items.find(item => item.category === "dress")?.label
    const top = look.items.find(item => item.category === "top")?.label
    const bottom = look.items.find(item => item.category === "bottom")?.label
    const outerwear = look.items.find(item => item.category === "outerwear")?.label

    const coreKey = dress ? `dress:${dress}` : `top-bottom:${top ?? ""}:${bottom ?? ""}`

    diverseLooks.push(look)
    usedCoreKeys.add(coreKey)

    if (bottom) usedBottomCounts.set(bottom, (usedBottomCounts.get(bottom) ?? 0) + 1)
    if (outerwear) usedOuterwearCounts.set(outerwear, (usedOuterwearCounts.get(outerwear) ?? 0) + 1)
  }

  for (const look of sortedLooks) {
    if (diverseLooks.length >= resolvedOptions.maxLooks) break

    const dress = look.items.find(item => item.category === "dress")?.label
    const top = look.items.find(item => item.category === "top")?.label
    const bottom = look.items.find(item => item.category === "bottom")?.label
    const outerwear = look.items.find(item => item.category === "outerwear")?.label
    const coreKey = dress ? `dress:${dress}` : `top-bottom:${top ?? ""}:${bottom ?? ""}`

    if (usedCoreKeys.has(coreKey)) continue
    if (bottom && (usedBottomCounts.get(bottom) ?? 0) >= 2) continue
    if (outerwear && (usedOuterwearCounts.get(outerwear) ?? 0) >= 2) continue

    addLook(look)
  }

  // Relax only if there are not enough looks.
  for (const look of sortedLooks) {
    if (diverseLooks.length >= resolvedOptions.maxLooks) break
    if (diverseLooks.some(existing => existing.id === look.id)) continue

    const bottom = look.items.find(item => item.category === "bottom")?.label
    const outerwear = look.items.find(item => item.category === "outerwear")?.label

    if (bottom && (usedBottomCounts.get(bottom) ?? 0) >= 3) continue
    if (outerwear && (usedOuterwearCounts.get(outerwear) ?? 0) >= 3) continue

    addLook(look)
  }

  return diverseLooks.slice(0, resolvedOptions.maxLooks)
}

export function buildOutfitComposerContext(): string {
  return `
OUTFIT COMPOSER RULES:
- Never return clothing-only outfits.
- A complete look requires: core outfit + footwear + at least one styling anchor.
- Core outfit = top + bottom OR dress/jumpsuit.
- Styling anchors include: jewelry, belt, bag, outerwear, texture, tuck, or elevated shoe.
- Run color validation first.
- Run styling validation second.
- Reject anything with color status "rejected" or styling status "proportions_off".
- Prefer outfits that are elevated, warm-grounded, PR-friendly, and occasion-aware.
`.trim()
}
