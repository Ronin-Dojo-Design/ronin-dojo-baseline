import type { Brand, PricingModel } from "~/.generated/prisma/client"
import { db } from "~/services/db"

export const LINEAGE_MEMBERSHIP_SURFACE = "lineage_membership"

type LineageMembershipPlanMetadata = {
  summary: string | null
  features: string[]
  ctaLabel: string
}

export type LineageMembershipPlan = {
  id: string
  name: string
  pricingModel: PricingModel
  amountCents: number
  currency: string
  intervalMonths: number | null
  organizationId: string
  stripePriceId: string
  summary: string | null
  features: string[]
  ctaLabel: string
  entitlementKeys: string[]
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export const parseLineageMembershipPlanMetadata = (
  metadata: unknown,
): LineageMembershipPlanMetadata | null => {
  if (!isRecord(metadata) || metadata.surface !== LINEAGE_MEMBERSHIP_SURFACE) {
    return null
  }

  return {
    summary: typeof metadata.summary === "string" ? metadata.summary : null,
    features: Array.isArray(metadata.features)
      ? metadata.features.filter((feature): feature is string => typeof feature === "string")
      : [],
    ctaLabel: typeof metadata.ctaLabel === "string" ? metadata.ctaLabel : "Join membership",
  }
}

export const isLineageMembershipPlanMetadata = (metadata: unknown) => {
  return Boolean(parseLineageMembershipPlanMetadata(metadata))
}

export const findLineageMembershipPlans = async (
  brand: Brand,
): Promise<LineageMembershipPlan[]> => {
  const plans = await db.pricingPlan.findMany({
    where: {
      brand,
      isActive: true,
      programId: null,
      stripePriceId: { not: null },
      entitlementGrants: { some: {} },
    },
    orderBy: [{ sortOrder: "asc" }, { amountCents: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      pricingModel: true,
      amountCents: true,
      currency: true,
      intervalMonths: true,
      organizationId: true,
      stripePriceId: true,
      metadata: true,
      entitlementGrants: {
        select: {
          entitlement: { select: { key: true } },
        },
      },
    },
  })

  return plans.flatMap(plan => {
    const metadata = parseLineageMembershipPlanMetadata(plan.metadata)
    if (!metadata || !plan.stripePriceId) return []

    return [
      {
        id: plan.id,
        name: plan.name,
        pricingModel: plan.pricingModel,
        amountCents: plan.amountCents,
        currency: plan.currency,
        intervalMonths: plan.intervalMonths,
        organizationId: plan.organizationId,
        stripePriceId: plan.stripePriceId,
        summary: metadata.summary,
        features: metadata.features,
        ctaLabel: metadata.ctaLabel,
        entitlementKeys: plan.entitlementGrants.map(grant => grant.entitlement.key),
      },
    ]
  })
}
