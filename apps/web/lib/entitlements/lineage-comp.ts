import { z } from "zod"

export const LINEAGE_PREMIUM_ENTITLEMENT_KEY = "LINEAGE_PREMIUM" as const
export const LINEAGE_ELITE_ENTITLEMENT_KEY = "LINEAGE_ELITE" as const

export const lineageCompTierSchema = z.enum([
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
  LINEAGE_ELITE_ENTITLEMENT_KEY,
])

export const lineageCompSelectionSchema = z.enum([
  "NONE",
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
  LINEAGE_ELITE_ENTITLEMENT_KEY,
])

export const lineageCompGrantSpecSchema = z.object({
  tier: lineageCompTierSchema,
  termDays: z.coerce.number().int().positive().nullable().optional(),
})

export type LineageCompTier = z.infer<typeof lineageCompTierSchema>
export type LineageCompGrantSpec = z.infer<typeof lineageCompGrantSpecSchema>

export function getLineageCompEntitlementKeys(tier: LineageCompTier): readonly string[] {
  if (tier === LINEAGE_ELITE_ENTITLEMENT_KEY) {
    return [LINEAGE_PREMIUM_ENTITLEMENT_KEY, LINEAGE_ELITE_ENTITLEMENT_KEY]
  }

  return [LINEAGE_PREMIUM_ENTITLEMENT_KEY]
}

export function parseLineageCompMeta(meta: unknown): LineageCompGrantSpec | null {
  const result = z.object({ comp: lineageCompGrantSpecSchema.optional() }).safeParse(meta)
  return result.success ? (result.data.comp ?? null) : null
}
