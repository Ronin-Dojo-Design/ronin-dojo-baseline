import { isTruthy } from "@primoui/utils"
import { endOfDay, startOfDay } from "date-fns"
import type { Prisma } from "~/.generated/prisma/client"
import { getRequestBrand } from "~/lib/brand-context"
import type { SubscriptionTiersTableSchema } from "~/server/admin/subscription-tiers/schema"
import { db } from "~/services/db"

export const findSubscriptionTiers = async (
  search: SubscriptionTiersTableSchema,
  where?: Prisma.SubscriptionTierWhereInput,
) => {
  const { name, page, perPage, sort, from, to, operator } = search
  const brand = await getRequestBrand()

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.SubscriptionTierWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
  ]

  const whereQuery: Prisma.SubscriptionTierWhereInput = {
    brand,
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [tiers, tiersTotal] = await db.$transaction([
    db.subscriptionTier.findMany({
      where: { ...whereQuery, ...where },
      orderBy: [...orderBy, { level: "asc" }],
      take: perPage,
      skip: offset,
      include: {
        _count: { select: { subscriptions: true } },
      },
    }),

    db.subscriptionTier.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  const pageCount = Math.ceil(tiersTotal / perPage)
  return { tiers, tiersTotal, pageCount }
}

export const findSubscriptionTierById = async (id: string) => {
  const brand = await getRequestBrand()

  return db.subscriptionTier.findFirst({
    where: { id, brand },
    include: {
      subscriptions: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  })
}

export const findSubscriptionTierList = async () => {
  const brand = await getRequestBrand()

  return db.subscriptionTier.findMany({
    where: { brand },
    select: { id: true, name: true, code: true, level: true },
    orderBy: { level: "asc" },
  })
}
