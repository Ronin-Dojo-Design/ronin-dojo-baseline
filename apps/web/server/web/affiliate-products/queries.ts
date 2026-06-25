import { Brand, type Prisma } from "~/.generated/prisma/client"
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
  return db.pricingPlan.findMany({
    where: {
      brand: Brand.BBL,
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

/**
 * Fetches all gear recommendations grouped by discipline slug.
 *
 * @see docs/sprints/SESSION_0109.md TASK_04
 */
export const findAllGearRecommendations = async () => {
  const recommendations = await db.gearRecommendation.findMany({
    where: { brand: Brand.BBL },
    select: {
      type: true,
      sortOrder: true,
      discipline: { select: { slug: true, name: true } },
      pricingPlan: {
        select: {
          id: true,
          name: true,
          amountCents: true,
          metadata: true,
          isActive: true,
          sortOrder: true,
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  })

  const byDiscipline = new Map<
    string,
    { name: string; required: AffiliateProductRow[]; recommended: AffiliateProductRow[] }
  >()

  for (const rec of recommendations) {
    const slug = rec.discipline.slug
    if (!byDiscipline.has(slug)) {
      byDiscipline.set(slug, { name: rec.discipline.name, required: [], recommended: [] })
    }
    const group = byDiscipline.get(slug)!
    if (rec.type === "REQUIRED") {
      group.required.push(rec.pricingPlan)
    } else {
      group.recommended.push(rec.pricingPlan)
    }
  }

  return byDiscipline
}
