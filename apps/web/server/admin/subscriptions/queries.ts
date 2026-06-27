import { Brand, type Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { SubscriptionsTableSchema } from "~/server/admin/subscriptions/schema"
import { db } from "~/services/db"

export const findSubscriptions = async (
  search: SubscriptionsTableSchema,
  where?: Prisma.UserBrandSubscriptionWhereInput,
) => {
  const { name, perPage, operator } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.UserBrandSubscriptionOrderByWithRelationInput>(search)

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
    createdAtRangeExpression<Prisma.UserBrandSubscriptionWhereInput>(fromDate, toDate),
  ]

  const whereQuery = buildAdminListWhere<Prisma.UserBrandSubscriptionWhereInput>({
    baseWhere: { brand: Brand.BBL },
    expressions,
    extraWhere: where,
    operator,
  })

  const {
    rows: subscriptions,
    total: subscriptionsTotal,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.userBrandSubscription.findMany({
        where: whereQuery,
        orderBy: [...orderBy, { createdAt: "desc" }],
        take: perPage,
        skip: offset,
        include: {
          user: { select: { id: true, name: true, email: true } },
          tier: { select: { id: true, name: true, code: true, level: true } },
        },
      }),
    count: () => db.userBrandSubscription.count({ where: whereQuery }),
  })

  return { subscriptions, subscriptionsTotal, pageCount }
}

export const findSubscriptionById = async (id: string) => {
  return db.userBrandSubscription.findFirst({
    where: { id, brand: Brand.BBL },
    include: {
      user: { select: { id: true, name: true, email: true } },
      tier: { select: { id: true, name: true, code: true, level: true } },
    },
  })
}
