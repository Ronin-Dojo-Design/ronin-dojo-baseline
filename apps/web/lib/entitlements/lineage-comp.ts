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

/**
 * BBL "comp gift" epic (SESSION_0403): when an existing member claims their
 * imported placeholder Passport on Black Belt Legacy, the Elite tier is comped —
 * the **Dirty Dozen** cohort gets it for life (no end date), everyone else gets
 * one year. Manual admin comps (`input.comp`) still override this auto-grant.
 */
export const BBL_CLAIM_COMP_TERM_DAYS = 365

/** Comp term (in days) for a BBL claim auto-grant; `null` = lifetime (Dirty Dozen). */
export function bblClaimCompTermDays(isDirtyDozen: boolean): number | null {
  return isDirtyDozen ? null : BBL_CLAIM_COMP_TERM_DAYS
}

export function parseLineageCompMeta(meta: unknown): LineageCompGrantSpec | null {
  const result = z.object({ comp: lineageCompGrantSpecSchema.optional() }).safeParse(meta)
  return result.success ? (result.data.comp ?? null) : null
}
