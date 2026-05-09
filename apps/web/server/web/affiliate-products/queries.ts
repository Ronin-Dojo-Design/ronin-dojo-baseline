import type { Prisma } from "~/.generated/prisma/client"
import { getRequestBrand } from "~/lib/brand-context"
import { db } from "~/services/db"

export type AffiliateProductRow = Prisma.PricingPlanGetPayload<{
  select: {
    id: true
    name: true
    amountCents: true
    metadata: true
    isActive: true
    sortOrder: true
  }
}>

/**
 * Fetches all TuffBuffs affiliate products from the DB.
 * These are PricingPlan rows where metadata.source = "tuffbuffs-affiliate".
 */
export const findAffiliateProducts = async () => {
  const brand = await getRequestBrand()

  return db.pricingPlan.findMany({
    where: {
      brand,
      isActive: true,
      metadata: {
        path: ["source"],
        equals: "tuffbuffs-affiliate",
      },
    },
    select: {
      id: true,
      name: true,
      amountCents: true,
      metadata: true,
      isActive: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: "asc" },
  })
}

/** Type-safe accessor for affiliate product metadata */
export type AffiliateProductMetadata = {
  externalId: string
  description: string
  category: string
  affiliateUrl: string
  imagePath: string | null
  recommendedFor: string[]
  source: string
}

export const getMetadata = (row: AffiliateProductRow): AffiliateProductMetadata | null => {
  if (!row.metadata || typeof row.metadata !== "object") return null
  return row.metadata as unknown as AffiliateProductMetadata
}
