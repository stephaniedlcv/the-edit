/**
 * THE EDIT — Outfit Color Validator
 * outfit-color-validator.ts
 *
 * Consumes dark-autumn-palette.ts v1.1 as single source of truth.
 * Validates outfit color combinations against Stephanie's Dark Autumn profile.
 *
 * DESIGN PHILOSOPHY:
 * This validator is opinionated but not punishing.
 * Goal: allow "bold but wearable", reject "random, cold, chaotic, or impractical".
 * A good DA outfit can push color — but every push must be intentional and warm-grounded.
 *
 * VALIDATION FLOW:
 * 1. Resolve each item's color family and shade status (approved / risky / avoid / unknown)
 * 2. Classify each item's dominance role (dominant / accent_support / non_dominant_metallic)
 * 3. Run hard rule checks → auto-reject if any fail
 * 4. Run soft rule checks → flag needs_review if any fail
 * 5. Score color harmony (0–100)
 * 6. Apply context bonuses (tropical, occasion)
 * 7. Return result with reasons, suggestions, and score
 */

import {
  getPaletteFamilyById,
  getPaletteFamilyByApprovedShade,
  isShadeApprovedForStephanie,
  outfitRequiresWarmAnchor,
  outfitHasValidWarmAnchor,
  restrictedColorTokens,
  type PaletteFamily,
  type FamilyRole,
  type RestrictedToken,
  type ShadeStatus,
} from "./dark-autumn-palette"

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** Whether an item visually dominates the outfit or plays a supporting role */
export type ColorDominance =
  | "dominant"              // item is a major visual piece (top, bottom, dress, outerwear)
  | "accent_support"        // item adds color but doesn't anchor (scarf, small bag, shoes)
  | "non_dominant_metallic" // metallic jewelry, small hardware, subtle belt — exempt from accent count

/** Overall validation result for the outfit */
export type ValidationStatus =
  | "approved"              // all rules pass, outfit is wearable
  | "approved_with_note"    // passes but has a suggestion or low-risk observation
  | "needs_review"          // risky shades or borderline rules — evaluate in person
  | "rejected"              // hard rule violation — outfit should not be suggested

/** A single clothing or accessory item with its color metadata */
export interface OutfitColorItem {
  /** Human-readable label e.g. "Black wide-leg pants" */
  label: string

  /** normalizedName from palette e.g. "warm_black", "deep_teal", "camel"
   *  If the shade is not in the palette, pass the closest known shade or leave as freeform string.
   *  The validator will attempt a family lookup and flag unknowns. */
  normalizedShade: string

  /** Optional: override family lookup if known (e.g. "black", "blue_teal_peacock") */
  familyId?: string

  /** How dominant this item is in the outfit visually */
  dominance: ColorDominance

  /** Optional: item category for context-aware validation */
  category?: "top" | "bottom" | "dress" | "outerwear" | "shoes" | "bag" | "jewelry" | "belt" | "accessory" | "other"
}

/** Per-item resolution after palette lookup */
export interface ResolvedItem {
  item: OutfitColorItem
  shadeStatus: ShadeStatus
  family: PaletteFamily | null
  effectiveRole: FamilyRole | "unknown"  // roleOverride applied if present
  isTropicalApproved: boolean
  isMetallicAccessory: boolean           // true if non_dominant_metallic + metallics family
}

/** A single validation rule result */
export interface RuleResult {
  rule: string
  passed: boolean
  severity: "hard" | "soft"             // hard = reject, soft = needs_review
  message: string
  suggestion?: string
}

/** Full validation output */
export interface OutfitColorValidationResult {
  status: ValidationStatus
  harmonyScore: number                  // 0–100. ≥80 = great, 60–79 = good, 40–59 = marginal, <40 = poor
  resolvedItems: ResolvedItem[]
  dominantFamilies: string[]            // family IDs that count as dominant in this outfit
  statementFamilies: string[]           // dominant families with familyRole === "statement"
  hasValidWarmAnchor: boolean
  requiresWarmStyling: boolean
  ruleResults: RuleResult[]
  reasons: string[]                     // concise summary of issues
  suggestions: string[]                 // actionable next steps
  explanation: string                   // natural language explanation (for AI response)
}

/** Options to tune the validator */
export interface ValidatorOptions {
  /** Applies tropical context bonus to score and loosens strict restrictions slightly */
  context?: "tropical" | "office" | "casual" | "evening" | "general"
  /** When true, risky shades used as accent_support get downgraded from needs_review to note */
  allowRiskyAsAccessory?: boolean
  /** When true, validator skips unknown shades instead of flagging them */
  skipUnknownShades?: boolean
  /** Debug: return full ruleResults in output */
  verbose?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Resolve a single item against the palette */
function resolveItem(item: OutfitColorItem): ResolvedItem {
  const shadeStatus = isShadeApprovedForStephanie(item.normalizedShade)

  // Family resolution: explicit override > shade lookup > family lookup
  let family: PaletteFamily | null = null
  if (item.familyId) {
    family = getPaletteFamilyById(item.familyId) ?? null
  }
  if (!family) {
    family = getPaletteFamilyByApprovedShade(item.normalizedShade) ?? null
  }
  if (!family && shadeStatus.family) {
    family = getPaletteFamilyById(shadeStatus.family) ?? null
  }

  // Effective role: shade-level override > family role > unknown
  const approvedShade = family?.approvedShades.find(s => s.normalizedName === item.normalizedShade)
  const effectiveRole: FamilyRole | "unknown" =
    shadeStatus.roleOverride ??
    approvedShade?.roleOverride ??
    family?.familyRole ??
    "unknown"

  const isTropicalApproved =
    shadeStatus.tropicalApproved ||
    (family?.tropicalApproved ?? false)

  const isMetallicAccessory =
    item.dominance === "non_dominant_metallic" &&
    (family?.id === "metallics" || family?.family === "metallics")

  return { item, shadeStatus, family, effectiveRole, isTropicalApproved, isMetallicAccessory }
}

/**
 * Count dominant color families (excludes non_dominant_metallic items).
 * Items with dominance === "non_dominant_metallic" never count toward the 3-family limit.
 * Items with dominance === "accent_support" count only if they introduce a NEW family
 * not already represented by a dominant item.
 */
export function countDominantFamilies(resolved: ResolvedItem[]): string[] {
  const dominant = new Set<string>()
  const supportOnly = new Set<string>()

  for (const r of resolved) {
    if (!r.family) continue
    if (r.item.dominance === "non_dominant_metallic") continue

    if (r.item.dominance === "dominant") {
      dominant.add(r.family.id)
    } else if (r.item.dominance === "accent_support") {
      // accent_support only adds a family if no dominant piece covers it
      supportOnly.add(r.family.id)
    }
  }

  // Merge: support-only families that aren't already in dominant count too
  for (const id of supportOnly) {
    if (!dominant.has(id)) dominant.add(id)
  }

  return [...dominant]
}

/** Detect dominant statement families */
export function detectDominantStatement(resolved: ResolvedItem[]): string[] {
  return resolved
    .filter(r =>
      r.item.dominance === "dominant" &&
      r.family?.familyRole === "statement"
    )
    .map(r => r.family!.id)
    .filter((id, i, arr) => arr.indexOf(id) === i) // dedupe
}

/** Detect metallic accessory items (non-dominant metallics) */
export function detectMetallicAccessories(resolved: ResolvedItem[]): ResolvedItem[] {
  return resolved.filter(r => r.isMetallicAccessory)
}

/** Detect whether outfit has a valid warm anchor (non-black warm family present) */
export function detectWarmAnchor(resolved: ResolvedItem[]): { requires: boolean; hasValid: boolean } {
  const familyIds = resolved
    .filter(r => r.family)
    .map(r => r.family!.id)

  return {
    requires: outfitRequiresWarmAnchor(familyIds),
    hasValid: outfitHasValidWarmAnchor(familyIds),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RULE ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function runRules(
  resolved: ResolvedItem[],
  dominantFamilies: string[],
  statementFamilies: string[],
  warmAnchor: { requires: boolean; hasValid: boolean },
  options: ValidatorOptions
): RuleResult[] {
  const results: RuleResult[] = []
  const isTropical = options.context === "tropical" || options.context === "casual"

  // ── HARD RULES (reject) ───────────────────────────────────────────────────

  // HARD-1: No avoid shades as dominant items
  const avoidDominant = resolved.filter(
    r => r.shadeStatus.status === "avoid" && r.item.dominance === "dominant"
  )
  if (avoidDominant.length > 0) {
    results.push({
      rule: "HARD-1",
      passed: false,
      severity: "hard",
      message: `Avoid shade used as dominant piece: ${avoidDominant.map(r => `"${r.item.label}" (${r.item.normalizedShade})`).join(", ")}.`,
      suggestion: avoidDominant.map(r => {
        const family = r.family
        if (family && family.approvedShades.length > 0) {
          return `Replace "${r.item.label}" with an approved shade from ${family.displayName}: ${family.approvedShades.slice(0, 2).map(s => s.name).join(" or ")}.`
        }
        return `Remove "${r.item.label}" — shade is not compatible with Dark Autumn palette.`
      }).join(" "),
    })
  } else {
    results.push({ rule: "HARD-1", passed: true, severity: "hard", message: "No avoid shades as dominant pieces." })
  }

  // HARD-2: No avoid shades even as accessories (some are non-negotiable)
  // Exception: if allowRiskyAsAccessory is true, avoid shades as accent_support get downgraded to soft
  const avoidAccessory = resolved.filter(
    r => r.shadeStatus.status === "avoid" && r.item.dominance !== "dominant"
  )
  if (avoidAccessory.length > 0) {
    results.push({
      rule: "HARD-2",
      passed: false,
      severity: "hard",
      message: `Avoid shade present as accessory: ${avoidAccessory.map(r => `"${r.item.label}"`).join(", ")}. Even small items in avoid shades clash with DA palette.`,
      suggestion: `Replace with: bronze/gold jewelry, cognac bag, olive or camel accessories.`,
    })
  } else {
    results.push({ rule: "HARD-2", passed: true, severity: "hard", message: "No avoid shades in any item." })
  }

  // HARD-3: Max 3 dominant color families
  if (dominantFamilies.length > 3) {
    results.push({
      rule: "HARD-3",
      passed: false,
      severity: "hard",
      message: `Too many color families: ${dominantFamilies.length} detected (max 3). Outfit feels fragmented.`,
      suggestion: `Remove or unify the weakest color. Keep: base/neutral anchors + 1 accent or statement.`,
    })
  } else {
    results.push({ rule: "HARD-3", passed: true, severity: "hard", message: `Color family count: ${dominantFamilies.length}/3.` })
  }

  // HARD-4: Max 1 dominant statement family
  if (statementFamilies.length > 1) {
    results.push({
      rule: "HARD-4",
      passed: false,
      severity: "hard",
      message: `Multiple statement colors as dominant pieces: ${statementFamilies.join(", ")}. Outfits need one focal point.`,
      suggestion: `Keep the stronger statement and move the other to a small accessory, or replace one with a base/neutral.`,
    })
  } else {
    results.push({ rule: "HARD-4", passed: true, severity: "hard", message: `Statement family count: ${statementFamilies.length}/1.` })
  }

  // HARD-5: Black must be warmed up
  const hasBlack = resolved.some(r => r.family?.id === "black" && r.item.dominance === "dominant")
  if (hasBlack && warmAnchor.requires && !warmAnchor.hasValid) {
    results.push({
      rule: "HARD-5",
      passed: false,
      severity: "hard",
      message: `Black is present as a dominant piece but has no warm anchor. Black alone reads Dark Winter, not Dark Autumn.`,
      suggestion: `Add a warm element: rust top, camel belt, olive scarf, gold earrings, or burgundy bag.`,
    })
  } else if (hasBlack) {
    results.push({ rule: "HARD-5", passed: true, severity: "hard", message: "Black present with valid warm anchor." })
  } else {
    results.push({ rule: "HARD-5", passed: true, severity: "hard", message: "No black — warm anchor rule not triggered." })
  }

  // ── SOFT RULES (needs_review) ─────────────────────────────────────────────

  // SOFT-1: Risky shades as dominant items → needs_review
  const riskyDominant = resolved.filter(
    r => r.shadeStatus.status === "risky" && r.item.dominance === "dominant"
  )
  if (riskyDominant.length > 0) {
    results.push({
      rule: "SOFT-1",
      passed: false,
      severity: "soft",
      message: `Risky shade as main piece: ${riskyDominant.map(r => `"${r.item.label}" (${r.item.normalizedShade})`).join(", ")}.`,
      suggestion: riskyDominant.map(r => {
        const risk = r.shadeStatus
        const misclass = risk.misclassificationRisk ? ` May read as ${risk.misclassificationRisk}.` : ""
        return `"${r.item.label}": ${risk.reason}${misclass} Evaluate in natural light before wearing.`
      }).join(" "),
    })
  } else {
    results.push({ rule: "SOFT-1", passed: true, severity: "soft", message: "No risky shades as dominant pieces." })
  }

  // SOFT-2: Risky shades as accessories — downgraded if allowRiskyAsAccessory
  const riskyAccessory = resolved.filter(
    r => r.shadeStatus.status === "risky" && r.item.dominance === "accent_support"
  )
  if (riskyAccessory.length > 0 && !options.allowRiskyAsAccessory) {
    results.push({
      rule: "SOFT-2",
      passed: false,
      severity: "soft",
      message: `Risky shade as accessory: ${riskyAccessory.map(r => `"${r.item.label}"`).join(", ")}. Low risk but worth checking.`,
      suggestion: `Evaluate in person. If it reads cool or washed out, swap for an approved shade.`,
    })
  } else {
    results.push({ rule: "SOFT-2", passed: true, severity: "soft", message: "Risky accessories within tolerance." })
  }

  // SOFT-3: Statement color without base/neutral stabilizer
  const hasStatement = statementFamilies.length > 0
  // base_neutral stabilizer: any piece (dominant OR accent_support) with base_neutral role counts
  // A camel bag or cream shoes ground a statement just as well as a neutral top
  const hasBaseNeutral = resolved.some(
    r => (r.item.dominance === "dominant" || r.item.dominance === "accent_support") &&
         r.effectiveRole === "base_neutral"
  )
  if (hasStatement && !hasBaseNeutral) {
    results.push({
      rule: "SOFT-3",
      passed: false,
      severity: "soft",
      message: `Statement color present but no base/neutral dominant piece to stabilize it.`,
      suggestion: `Ground the outfit with a base/neutral: espresso, camel, warm black, dark denim, or warm cream piece.`,
    })
  } else {
    results.push({ rule: "SOFT-3", passed: true, severity: "soft", message: "Statement properly stabilized by base/neutral." })
  }

  // SOFT-4: 2 accent-role dominant pieces (not statement, not base) — risky but not hard reject
  const dominantAccents = resolved.filter(
    r => r.item.dominance === "dominant" && r.effectiveRole === "accent"
  )
  const uniqueAccentFamilies = [...new Set(dominantAccents.map(r => r.family?.id).filter(Boolean))]
  if (uniqueAccentFamilies.length > 1 && !isTropical) {
    results.push({
      rule: "SOFT-4",
      passed: false,
      severity: "soft",
      message: `Two different accent families as dominant pieces (${uniqueAccentFamilies.join(", ")}). Can feel busy.`,
      suggestion: `Try making one accent the star and swapping the other for a base/neutral tone.`,
    })
  } else {
    results.push({ rule: "SOFT-4", passed: true, severity: "soft", message: "Accent balance is fine." })
  }

  // SOFT-5: Unknown shades — flag unless skipUnknownShades
  if (!options.skipUnknownShades) {
    const unknowns = resolved.filter(r => r.shadeStatus.status === "unknown" && r.item.dominance === "dominant")
    if (unknowns.length > 0) {
      results.push({
        rule: "SOFT-5",
        passed: false,
        severity: "soft",
        message: `Unknown shade(s): ${unknowns.map(r => `"${r.item.normalizedShade}"`).join(", ")}. Cannot validate against palette.`,
        suggestion: `Map these shades to palette normalizedNames for accurate validation.`,
      })
    } else {
      results.push({ rule: "SOFT-5", passed: true, severity: "soft", message: "All dominant shades resolved." })
    }
  }

  // SOFT-6: Restricted token in outfit — check if any dominant item's shade is a known
  // restricted token (cool_grey, hot_pink, silver, etc.) per the restrictedColorTokens map.
  // This is a semantic check on the normalizedShade name, not a cross-family comparison.
  // Rationale: avoid pairings are concepts ("cool_grey", "silver"), not palette shades.
  // A warm outfit can pair brown + beige + rust freely — those are all DA-approved families.
  const restrictedTokenKeys = Object.keys(restrictedColorTokens) as RestrictedToken[]
  const restrictedItemsInOutfit = resolved.filter(r =>
    r.item.dominance !== "non_dominant_metallic" &&
    restrictedTokenKeys.includes(r.item.normalizedShade as RestrictedToken)
  )
  if (restrictedItemsInOutfit.length > 0) {
    const tokenDefs = restrictedItemsInOutfit.map(r => {
      const token = r.item.normalizedShade as RestrictedToken
      return `"${r.item.label}" (${restrictedColorTokens[token].label}): ${restrictedColorTokens[token].reason}`
    })
    results.push({
      rule: "SOFT-6",
      passed: false,
      severity: "soft",
      message: `Restricted color token detected: ${restrictedItemsInOutfit.map(r => `"${r.item.label}" [${r.item.normalizedShade}]`).join(", ")}.`,
      suggestion: tokenDefs[0],
    })
  } else {
    results.push({ rule: "SOFT-6", passed: true, severity: "soft", message: "No restricted color tokens in outfit." })
  }

  return results
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Score outfit color harmony on a 0–100 scale.
 * Does NOT require validateOutfitColors to run first — can be called independently.
 */
export function scoreOutfitColorHarmony(
  items: OutfitColorItem[],
  options: ValidatorOptions = {}
): number {
  const resolved = items.map(resolveItem)
  const isTropical = options.context === "tropical" || options.context === "casual"

  let score = 100

  // Deductions
  for (const r of resolved) {
    const isDominant = r.item.dominance === "dominant"

    if (r.shadeStatus.status === "avoid") {
      score -= isDominant ? 40 : 20
    } else if (r.shadeStatus.status === "risky") {
      score -= isDominant ? 15 : 5
    } else if (r.shadeStatus.status === "unknown") {
      score -= isDominant ? 10 : 3
    }
  }

  const dominantFamilies = countDominantFamilies(resolved)
  const statementFamilies = detectDominantStatement(resolved)
  const warmAnchor = detectWarmAnchor(resolved)

  // Too many families
  if (dominantFamilies.length > 3) score -= 20 * (dominantFamilies.length - 3)
  if (dominantFamilies.length === 3) score -= 5 // small penalty for max complexity

  // Multiple statements
  if (statementFamilies.length > 1) score -= 25

  // Black without warm anchor
  const hasBlackDominant = resolved.some(r => r.family?.id === "black" && r.item.dominance === "dominant")
  if (hasBlackDominant && warmAnchor.requires && !warmAnchor.hasValid) score -= 20

  // Bonuses
  // All approved shades
  const allApproved = resolved.every(r => r.shadeStatus.status === "approved" || r.isMetallicAccessory)
  if (allApproved) score += 5

  // Perfect base + accent structure (neutral anchor + 1 accent/statement)
  const hasPerfectStructure =
    dominantFamilies.length <= 2 &&
    statementFamilies.length <= 1 &&
    resolved.some(r => r.item.dominance === "dominant" && r.effectiveRole === "base_neutral")
  if (hasPerfectStructure) score += 8

  // Recommended pairing bonus: check if dominant families appear in each other's recommendedPairings
  const domFamilyObjects = dominantFamilies
    .map(id => getPaletteFamilyById(id))
    .filter(Boolean) as PaletteFamily[]

  for (let i = 0; i < domFamilyObjects.length; i++) {
    for (let j = i + 1; j < domFamilyObjects.length; j++) {
      const a = domFamilyObjects[i]
      const b = domFamilyObjects[j]
      const aRecommendsB = a.approvedShades.some(s => b.recommendedPairings.includes(s.normalizedName))
      const bRecommendsA = b.approvedShades.some(s => a.recommendedPairings.includes(s.normalizedName))
      if (aRecommendsB || bRecommendsA) score += 5
    }
  }

  // Tropical context bonus for tropical-approved families
  if (isTropical) {
    const tropicalCount = resolved.filter(r => r.isTropicalApproved && r.item.dominance === "dominant").length
    score += tropicalCount * 3
  }

  // Evening context: statement gets a bonus
  if (options.context === "evening" && statementFamilies.length === 1) score += 5

  // Metallic accessory bonus: good styling instinct
  const hasMetallicAccessory = resolved.some(r => r.isMetallicAccessory)
  if (hasMetallicAccessory) score += 3

  return Math.max(0, Math.min(100, Math.round(score)))
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN VALIDATOR
// ─────────────────────────────────────────────────────────────────────────────

export function validateOutfitColors(
  items: OutfitColorItem[],
  options: ValidatorOptions = {}
): OutfitColorValidationResult {
  const resolved = items.map(resolveItem)
  const dominantFamilies = countDominantFamilies(resolved)
  const statementFamilies = detectDominantStatement(resolved)
  const warmAnchor = detectWarmAnchor(resolved)

  const ruleResults = runRules(resolved, dominantFamilies, statementFamilies, warmAnchor, options)

  // Determine status
  const hardFails = ruleResults.filter(r => !r.passed && r.severity === "hard")
  const softFails = ruleResults.filter(r => !r.passed && r.severity === "soft")

  let status: ValidationStatus
  if (hardFails.length > 0) {
    status = "rejected"
  } else if (softFails.length > 0) {
    status = "needs_review"
  } else {
    // Check if there are any approved_with_note conditions
    const hasUnknowns = resolved.some(r => r.shadeStatus.status === "unknown")
    status = hasUnknowns ? "approved_with_note" : "approved"
  }

  const harmonyScore = scoreOutfitColorHarmony(items, options)

  // Build reasons and suggestions
  const reasons = [
    ...hardFails.map(r => `[REJECT] ${r.message}`),
    ...softFails.map(r => `[REVIEW] ${r.message}`),
  ]

  const suggestions = [
    ...ruleResults.filter(r => !r.passed && r.suggestion).map(r => r.suggestion!),
  ]

  // Score context note
  if (harmonyScore >= 80) {
    reasons.push(`Color harmony score: ${harmonyScore}/100 — strong combination.`)
  } else if (harmonyScore >= 60) {
    reasons.push(`Color harmony score: ${harmonyScore}/100 — solid, could be refined.`)
  } else if (harmonyScore >= 40) {
    reasons.push(`Color harmony score: ${harmonyScore}/100 — marginal, see suggestions.`)
    suggestions.push("Consider simplifying: fewer families or stronger neutral anchor.")
  } else {
    reasons.push(`Color harmony score: ${harmonyScore}/100 — combination needs significant revision.`)
  }

  return {
    status,
    harmonyScore,
    resolvedItems: resolved,
    dominantFamilies,
    statementFamilies,
    hasValidWarmAnchor: warmAnchor.hasValid,
    requiresWarmStyling: warmAnchor.requires,
    ruleResults: options.verbose ? ruleResults : ruleResults.filter(r => !r.passed),
    reasons,
    suggestions,
    explanation: explainOutfitColorDecision({
      status,
      harmonyScore,
      resolvedItems: resolved,
      dominantFamilies,
      statementFamilies,
      hasValidWarmAnchor: warmAnchor.hasValid,
      requiresWarmStyling: warmAnchor.requires,
      ruleResults,
      reasons,
      suggestions,
      explanation: "", // filled below
    }),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPLAINER
// ─────────────────────────────────────────────────────────────────────────────

/** Generate a natural language explanation suitable for AI outfit responses */
export function explainOutfitColorDecision(result: OutfitColorValidationResult): string {
  const { status, harmonyScore, dominantFamilies, statementFamilies, suggestions } = result

  const familyNames = dominantFamilies
    .map(id => getPaletteFamilyById(id)?.displayName ?? id)
    .join(", ")

  const scoreLabel =
    harmonyScore >= 80 ? "excellent" :
    harmonyScore >= 60 ? "good" :
    harmonyScore >= 40 ? "marginal" : "poor"

  const statusMessages: Record<ValidationStatus, string> = {
    approved: `✅ This outfit works well with your Dark Autumn palette.`,
    approved_with_note: `✅ This outfit is largely compatible, with one minor note.`,
    needs_review: `⚠️ This outfit has elements worth reviewing before wearing.`,
    rejected: `❌ This outfit has color conflicts that don't work with your Dark Autumn palette.`,
  }

  let explanation = statusMessages[status]
  explanation += ` Color harmony: ${scoreLabel} (${harmonyScore}/100).`

  if (dominantFamilies.length > 0) {
    explanation += ` The outfit reads as: ${familyNames}.`
  }

  if (statementFamilies.length === 1) {
    const sf = getPaletteFamilyById(statementFamilies[0])
    explanation += ` ${sf?.displayName ?? statementFamilies[0]} is doing the heavy lifting as the statement color.`
  }

  if (result.requiresWarmStyling && !result.hasValidWarmAnchor) {
    explanation += ` ⚠️ Black is present but needs a warm element — the outfit risks reading Dark Winter instead of Dark Autumn.`
  } else if (result.requiresWarmStyling && result.hasValidWarmAnchor) {
    explanation += ` Black is properly warmed up.`
  }

  const hardFails = result.ruleResults.filter(r => !r.passed && r.severity === "hard")
  if (hardFails.length > 0) {
    explanation += ` Issues found: ${hardFails.map(r => r.message).join(" | ")}`
  }

  if (suggestions.length > 0 && status !== "approved") {
    explanation += ` Suggestion: ${suggestions[0]}`
  }

  return explanation
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST CASES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Example outfit validation calls.
 * Run with: npx ts-node outfit-color-validator.ts (or import in tests)
 *
 * These serve as documentation AND regression tests.
 * Expected status is noted in comments.
 */
export const EXAMPLE_OUTFITS = {

  // ── APPROVED ────────────────────────────────────────────────────────────

  /** Classic DA formula: dark neutral + warm neutral + accent */
  espresso_camel_rust: {
    label: "Espresso wide-leg + camel blouse + rust mule",
    items: [
      { label: "Espresso wide-leg pants", normalizedShade: "espresso",     dominance: "dominant",              category: "bottom"   },
      { label: "Camel silk blouse",       normalizedShade: "camel",        dominance: "dominant",              category: "top"      },
      { label: "Rust mule heels",         normalizedShade: "rust",         dominance: "accent_support",        category: "shoes"    },
      { label: "Bronze hoop earrings",    normalizedShade: "bronze",       dominance: "non_dominant_metallic", category: "jewelry"  },
    ] as OutfitColorItem[],
    expectedStatus: "approved" as ValidationStatus,
  },

  /** Monochromatic brown tonal */
  tonal_brown: {
    label: "Tonal brown: cocoa + walnut + toffee",
    items: [
      { label: "Cocoa trousers",          normalizedShade: "cocoa",        dominance: "dominant",     category: "bottom"  },
      { label: "Walnut turtleneck",       normalizedShade: "walnut",       dominance: "dominant",     category: "top"     },
      { label: "Toffee belt",             normalizedShade: "toffee",       dominance: "accent_support", category: "belt"  },
    ] as OutfitColorItem[],
    expectedStatus: "approved" as ValidationStatus,
  },

  /** Tropical bold: peacock statement + warm neutral + metallic */
  peacock_tropical: {
    label: "Peacock dress + gold sandals [tropical context]",
    items: [
      { label: "Peacock midi dress",      normalizedShade: "peacock",      dominance: "dominant",              category: "dress"    },
      { label: "Camel woven bag",         normalizedShade: "camel",        dominance: "accent_support",        category: "bag"      },
      { label: "Gold strappy sandal",     normalizedShade: "metal_antique_gold", dominance: "non_dominant_metallic", category: "shoes" },
    ] as OutfitColorItem[],
    expectedStatus: "approved" as ValidationStatus,
  },

  /** Black done right: black + two warm anchors */
  black_warmed: {
    label: "Warm black pants + rust top + bronze earrings",
    items: [
      { label: "Warm black trousers",     normalizedShade: "warm_black",   dominance: "dominant",              category: "bottom"   },
      { label: "Rust knit top",           normalizedShade: "rust",         dominance: "dominant",              category: "top"      },
      { label: "Bronze link earrings",    normalizedShade: "bronze",       dominance: "non_dominant_metallic", category: "jewelry"  },
    ] as OutfitColorItem[],
    expectedStatus: "approved" as ValidationStatus,
  },

  /** Eggplant statement grounded by espresso + cream */
  eggplant_statement: {
    label: "Eggplant blazer + espresso pants + ivory tee",
    items: [
      { label: "Eggplant blazer",         normalizedShade: "eggplant",     dominance: "dominant",     category: "outerwear" },
      { label: "Espresso trousers",       normalizedShade: "espresso",     dominance: "dominant",     category: "bottom"    },
      { label: "Ivory silk tee",          normalizedShade: "ivory",        dominance: "accent_support", category: "top"     },
      { label: "Copper bangle",           normalizedShade: "copper",       dominance: "non_dominant_metallic", category: "jewelry" },
    ] as OutfitColorItem[],
    expectedStatus: "approved" as ValidationStatus,
  },

  // ── NEEDS_REVIEW ────────────────────────────────────────────────────────

  /** Slate denim is risky — flag but don't reject */
  slate_denim_risky: {
    label: "Slate denim + rust top [risky denim]",
    items: [
      { label: "Slate denim jeans",       normalizedShade: "slate_denim",  dominance: "dominant",     category: "bottom" },
      { label: "Rust linen top",          normalizedShade: "rust",         dominance: "dominant",     category: "top"    },
      { label: "Cognac loafer",           normalizedShade: "toffee",       dominance: "accent_support", category: "shoes" },
    ] as OutfitColorItem[],
    expectedStatus: "needs_review" as ValidationStatus,
  },

  /** Statement with no base/neutral anchor */
  statement_ungrounded: {
    label: "Brick red dress + terracotta sandals [no neutral]",
    items: [
      { label: "Brick red midi dress",    normalizedShade: "brick_red",    dominance: "dominant",     category: "dress"  },
      { label: "Terracotta mule",         normalizedShade: "terracotta",   dominance: "dominant",     category: "shoes"  },
    ] as OutfitColorItem[],
    expectedStatus: "needs_review" as ValidationStatus,
  },

  /** Two accent families dominant — busy but not outright wrong */
  two_accent_families: {
    label: "Mustard top + forest green pants [2 accent families]",
    items: [
      { label: "Mustard silk top",        normalizedShade: "mustard",      dominance: "dominant",     category: "top"    },
      { label: "Forest green trousers",   normalizedShade: "forest_green", dominance: "dominant",     category: "bottom" },
      { label: "Espresso loafer",         normalizedShade: "espresso",     dominance: "accent_support", category: "shoes" },
    ] as OutfitColorItem[],
    expectedStatus: "needs_review" as ValidationStatus,
  },

  // ── REJECTED ────────────────────────────────────────────────────────────

  /** The infamous bubble skirt disaster — recreated in color form */
  bubble_disaster: {
    label: "Beige bubble skirt + grey tank + hot pink bag [the original crime]",
    items: [
      { label: "Beige bubble skirt",      normalizedShade: "parchment",    dominance: "dominant",     category: "bottom"  },
      { label: "Cool grey tank",          normalizedShade: "cool_greige",  dominance: "dominant",     category: "top"     },
      { label: "Hot pink bag",            normalizedShade: "hot_pink",     dominance: "accent_support", category: "bag"  },
      { label: "Silver block heels",      normalizedShade: "cool_silver",  dominance: "accent_support", category: "shoes" },
    ] as OutfitColorItem[],
    expectedStatus: "rejected" as ValidationStatus,
  },

  /** Black without any warm anchor */
  black_cold: {
    label: "Pure black + cool grey + silver [full Dark Winter mistake]",
    items: [
      { label: "Pure black trousers",     normalizedShade: "pure_cool_black", dominance: "dominant",  category: "bottom"  },
      { label: "Cool grey blazer",        normalizedShade: "cool_greige",  dominance: "dominant",     category: "outerwear" },
      { label: "Silver necklace",         normalizedShade: "cool_silver",  dominance: "non_dominant_metallic", category: "jewelry" },
    ] as OutfitColorItem[],
    expectedStatus: "rejected" as ValidationStatus,
  },

  /** Too many families — 4 dominant color families */
  too_many_colors: {
    label: "Rust top + forest green bottom + deep teal scarf + mustard bag",
    items: [
      { label: "Rust structured top",     normalizedShade: "rust",         dominance: "dominant",     category: "top"      },
      { label: "Forest green midi skirt", normalizedShade: "forest_green", dominance: "dominant",     category: "bottom"   },
      { label: "Deep teal scarf",         normalizedShade: "deep_teal",    dominance: "dominant",     category: "accessory" },
      { label: "Mustard tote bag",        normalizedShade: "mustard",      dominance: "dominant",     category: "bag"      },
    ] as OutfitColorItem[],
    expectedStatus: "rejected" as ValidationStatus,
  },

  /** Two statement colors as dominant pieces */
  double_statement: {
    label: "Brick red blazer + deep teal dress [two statements]",
    items: [
      { label: "Brick red oversized blazer", normalizedShade: "brick_red", dominance: "dominant",    category: "outerwear" },
      { label: "Deep teal shirt dress",   normalizedShade: "deep_teal",    dominance: "dominant",    category: "dress"     },
    ] as OutfitColorItem[],
    expectedStatus: "rejected" as ValidationStatus,
  },

  /** Avoid shade as dominant piece */
  lavender_avoid: {
    label: "Lavender dress [avoid shade]",
    items: [
      { label: "Lavender midi dress",     normalizedShade: "lavender",     dominance: "dominant",     category: "dress"   },
      { label: "Camel sandal",            normalizedShade: "camel",        dominance: "accent_support", category: "shoes" },
    ] as OutfitColorItem[],
    expectedStatus: "rejected" as ValidationStatus,
  },

} as const

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONAL: Self-executing test runner (for debugging)
// Uncomment to run: npx ts-node outfit-color-validator.ts
// ─────────────────────────────────────────────────────────────────────────────

/*
function runTests() {
  console.log("═══ THE EDIT — Outfit Color Validator Tests ═══\n")

  for (const [key, outfit] of Object.entries(EXAMPLE_OUTFITS)) {
    const result = validateOutfitColors(outfit.items as OutfitColorItem[], {
      context: key.includes("tropical") ? "tropical" : "general",
      allowRiskyAsAccessory: false,
      verbose: false,
    })

    const statusIcon = result.status === outfit.expectedStatus ? "✅" : "❌ UNEXPECTED"
    console.log(`${statusIcon} ${outfit.label}`)
    console.log(`   Status: ${result.status} (expected: ${outfit.expectedStatus}) | Score: ${result.harmonyScore}/100`)
    if (result.reasons.length > 0) {
      result.reasons.forEach(r => console.log(`   ${r}`))
    }
    if (result.suggestions.length > 0) {
      console.log(`   💡 ${result.suggestions[0]}`)
    }
    console.log()
  }
}

runTests()
*/