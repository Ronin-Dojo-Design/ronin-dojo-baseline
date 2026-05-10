import type { Prisma } from "~/.generated/prisma/client"
import { getRequestBrand } from "~/lib/brand-context"
import { db } from "~/services/db"

export type MerchProductRow = Prisma.PricingPlanGetPayload<{
  select: {
    id: true
    name: true
    amountCents: true
    metadata: true
    isActive: true
    sortOrder: true
  }
}>

/** Type-safe accessor for merch product metadata */
export type MerchProductMetadata = {
  externalId: string
  description: string
  category: string
  type: string
  classType: string | null
  colors: string[]
  sizes: string[]
  features: string[]
  imagePath: string
  imagePaths: string[]
  featured: boolean
  inStock: boolean
  currency: string
  shippingFeeCents: number
  source: "tuffbuffs-merch"
}

const MERCH_SELECT = {
  id: true,
  name: true,
  amountCents: true,
  metadata: true,
  isActive: true,
  sortOrder: true,
} as const

/**
 * Fetches all TuffBuffs merch products from the DB.
 * These are PricingPlan rows where metadata.source = "tuffbuffs-merch".
 *
 * @see docs/sprints/SESSION_0111.md TASK_02
 */
export const findMerchProducts = async (category?: string) => {
  const brand = await getRequestBrand()

  const where: Prisma.PricingPlanWhereInput = {
    brand,
    isActive: true,
    metadata: {
      path: ["source"],
      equals: "tuffbuffs-merch",
    },
  }

  // Filter by category if provided
  if (category) {
    where.AND = [
      {
        metadata: {
          path: ["category"],
          equals: category,
        },
      },
    ]
  }

  return db.pricingPlan.findMany({
    where,
    select: MERCH_SELECT,
    orderBy: { sortOrder: "asc" },
  })
}

/**
 * Fetches a single merch product by its PricingPlan ID.
 */
export const findMerchProductById = async (id: string) => {
  const brand = await getRequestBrand()

  return db.pricingPlan.findFirst({
    where: {
      id,
      brand,
      isActive: true,
      metadata: {
        path: ["source"],
        equals: "tuffbuffs-merch",
      },
    },
    select: MERCH_SELECT,
  })
}

export const getMerchMetadata = (row: MerchProductRow): MerchProductMetadata | null => {
  if (!row.metadata || typeof row.metadata !== "object") return null
  return row.metadata as unknown as MerchProductMetadata
}
