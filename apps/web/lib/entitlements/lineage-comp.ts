import { z } from "zod"

export const LINEAGE_PREMIUM_ENTITLEMENT_KEY = "LINEAGE_PREMIUM" as const
export const LINEAGE_ELITE_ENTITLEMENT_KEY = "LINEAGE_ELITE" as const
export const LINEAGE_LEGEND_ENTITLEMENT_KEY = "LINEAGE_LEGEND" as const

export const lineageCompTierSchema = z.enum([
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_LEGEND_ENTITLEMENT_KEY,
])

export const lineageCompSelectionSchema = z.enum([
  "NONE",
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_LEGEND_ENTITLEMENT_KEY,
])

export const lineageCompGrantSpecSchema = z.object({
  tier: lineageCompTierSchema,
  termDays: z.coerce.number().int().positive().nullable().optional(),
})

export type LineageCompTier = z.infer<typeof lineageCompTierSchema>
export type LineageCompGrantSpec = z.infer<typeof lineageCompGrantSpecSchema>

export function getLineageCompEntitlementKeys(tier: LineageCompTier): readonly string[] {
  if (tier === LINEAGE_LEGEND_ENTITLEMENT_KEY) {
    return [
      LINEAGE_PREMIUM_ENTITLEMENT_KEY,
      LINEAGE_ELITE_ENTITLEMENT_KEY,
      LINEAGE_LEGEND_ENTITLEMENT_KEY,
    ]
  }

  if (tier === LINEAGE_ELITE_ENTITLEMENT_KEY) {
    return [LINEAGE_PREMIUM_ENTITLEMENT_KEY, LINEAGE_ELITE_ENTITLEMENT_KEY]
  }

  return [LINEAGE_PREMIUM_ENTITLEMENT_KEY]
}

export function parseLineageCompMeta(meta: unknown): LineageCompGrantSpec | null {
  const result = z.object({ comp: lineageCompGrantSpecSchema.optional() }).safeParse(meta)
  return result.success ? (result.data.comp ?? null) : null
}

/**
 * Cohort → comp policy (auto-on-claim).
 *
 * When a claim is approved and the reviewer did not supply an explicit comp, the
 * claimed person's lineage visual-group labels are matched against these rules to
 * auto-grant a comp. The BBL "Dirty Dozen" founding cohort (tagged by
 * `import-bbl-lineage-profiles.ts` as a "Dirty Dozen" `LineageVisualGroup`) is
 * comped **lifetime LINEAGE_ELITE** (operator decision, SESSION_0403).
 *
 * Matching is by case-insensitive label substring so it stays robust to the exact
 * cohort label the import writes.
 */
export const LINEAGE_COHORT_COMP_RULES: ReadonlyArray<{
  labelIncludes: string
  spec: LineageCompGrantSpec
}> = [
  { labelIncludes: "dirty dozen", spec: { tier: LINEAGE_ELITE_ENTITLEMENT_KEY, termDays: null } },
]

/** Resolve the auto-comp for a set of lineage visual-group labels, if any rule matches. */
export function resolveLineageCohortComp(
  visualGroupLabels: readonly string[],
): LineageCompGrantSpec | null {
  const lowered = visualGroupLabels.map(label => label.toLowerCase())
  for (const rule of LINEAGE_COHORT_COMP_RULES) {
    if (lowered.some(label => label.includes(rule.labelIncludes))) {
      return rule.spec
    }
  }
  return null
}
