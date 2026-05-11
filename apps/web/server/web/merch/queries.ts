import type { Prisma } from "~/.generated/prisma/client"
import { type Brand, FulfillmentStatus } from "~/.generated/prisma/client"
import { isTruthy } from "@primoui/utils"
import { endOfDay, startOfDay } from "date-fns"
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

// ---------------------------------------------------------------------------
// Admin: Merch Order queries (Phase 3)
// ---------------------------------------------------------------------------

const MERCH_ORDER_SELECT = {
  id: true,
  brand: true,
  stripeCheckoutSessionId: true,
  stripePaymentIntentId: true,
  printfulOrderId: true,
  printfulExternalId: true,
  fulfillmentStatus: true,
  customerEmail: true,
  customerName: true,
  amountCents: true,
  shippingCents: true,
  totalCents: true,
  currency: true,
  lineItems: true,
  shippingName: true,
  shippingAddress1: true,
  shippingAddress2: true,
  shippingCity: true,
  shippingState: true,
  shippingPostalCode: true,
  shippingCountryCode: true,
  trackingNumber: true,
  trackingUrl: true,
  carrier: true,
  shippedAt: true,
  deliveredAt: true,
  failureReason: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  organizationId: true,
  pricingPlanId: true,
} as const

export type MerchOrderRow = Prisma.MerchOrderGetPayload<{
  select: typeof MERCH_ORDER_SELECT
}>

export type MerchOrdersTableSchema = {
  search: string
  status: FulfillmentStatus[]
  sort: { id: string; desc: boolean }[]
  page: number
  perPage: number
  from: string
  to: string
  operator: "and" | "or"
}

/**
 * Admin: list merch orders with brand/status/date/search filters + pagination.
 * Brand-scoped — requires explicit brand parameter.
 *
 * @see docs/sprints/SESSION_0119.md — Phase 3 plan
 * @see docs/sprints/SESSION_0120.md — TASK_02
 */
export const findMerchOrders = async (brand: Brand, search: MerchOrdersTableSchema) => {
  const { search: searchText, status, sort, page, perPage, from, to, operator } = search

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.MerchOrderWhereInput | undefined)[] = [
    searchText
      ? {
          OR: [
            { customerEmail: { contains: searchText, mode: "insensitive" } },
            { customerName: { contains: searchText, mode: "insensitive" } },
            { id: { contains: searchText, mode: "insensitive" } },
          ],
        }
      : undefined,
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
    status.length > 0 ? { fulfillmentStatus: { in: status } } : undefined,
  ]

  const whereQuery: Prisma.MerchOrderWhereInput = {
    brand,
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [orders, total] = await db.$transaction([
    db.merchOrder.findMany({
      where: whereQuery,
      select: MERCH_ORDER_SELECT,
      orderBy: [...orderBy, { createdAt: "desc" }],
      take: perPage,
      skip: offset,
    }),
    db.merchOrder.count({ where: whereQuery }),
  ])

  const pageCount = Math.ceil(total / perPage)
  return { orders, total, pageCount }
}

/**
 * Admin: fetch a single merch order by ID, brand-scoped.
 *
 * @see docs/sprints/SESSION_0120.md — TASK_02
 */
export const findMerchOrderById = async (id: string, brand: Brand) => {
  return db.merchOrder.findFirst({
    where: { id, brand },
    select: MERCH_ORDER_SELECT,
  })
}
