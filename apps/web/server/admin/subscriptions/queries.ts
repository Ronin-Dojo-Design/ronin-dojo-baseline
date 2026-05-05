import { isTruthy } from "@primoui/utils"
import { endOfDay, startOfDay } from "date-fns"
import type { Prisma } from "~/.generated/prisma/client"
import { getRequestBrand } from "~/lib/brand-context"
import type { SubscriptionsTableSchema } from "~/server/admin/subscriptions/schema"
import { db } from "~/services/db"

export const findSubscriptions = async (
  search: SubscriptionsTableSchema,
  where?: Prisma.UserBrandSubscriptionWhereInput,
) => {
  const { name, page, perPage, sort, from, to, operator } = search
  const brand = await getRequestBrand()

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.UserBrandSubscriptionWhereInput | undefined)[] = [
    name
      ? {
          user: {
            OR: [
              { name: { contains: name, mode: "insensitive" } },
              { email: { contains: name, mode: "insensitive" } },
            ],
          },
        }
      : undefined,
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
  ]

  const whereQuery: Prisma.UserBrandSubscriptionWhereInput = {
    brand,
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [subscriptions, subscriptionsTotal] = await db.$transaction([
    db.userBrandSubscription.findMany({
      where: { ...whereQuery, ...where },
      orderBy: [...orderBy, { createdAt: "desc" }],
      take: perPage,
      skip: offset,
      include: {
        user: { select: { id: true, name: true, email: true } },
        tier: { select: { id: true, name: true, code: true, level: true } },
      },
    }),

    db.userBrandSubscription.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  const pageCount = Math.ceil(subscriptionsTotal / perPage)
  return { subscriptions, subscriptionsTotal, pageCount }
}

export const findSubscriptionById = async (id: string) => {
  const brand = await getRequestBrand()

  return db.userBrandSubscription.findFirst({
    where: { id, brand },
    include: {
      user: { select: { id: true, name: true, email: true } },
      tier: { select: { id: true, name: true, code: true, level: true } },
    },
  })
}
