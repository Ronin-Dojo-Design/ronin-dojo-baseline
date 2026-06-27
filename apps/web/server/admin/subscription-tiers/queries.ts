import { Brand, type Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { SubscriptionTiersTableSchema } from "~/server/admin/subscription-tiers/schema"
import { db } from "~/services/db"

export const findSubscriptionTiers = async (
  search: SubscriptionTiersTableSchema,
  where?: Prisma.SubscriptionTierWhereInput,
) => {
  const { name, perPage, operator } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.SubscriptionTierOrderByWithRelationInput>(search)

  const expressions: (Prisma.SubscriptionTierWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    createdAtRangeExpression<Prisma.SubscriptionTierWhereInput>(fromDate, toDate),
  ]

  const whereQuery = buildAdminListWhere<Prisma.SubscriptionTierWhereInput>({
    baseWhere: { brand: Brand.BBL },
    expressions,
    extraWhere: where,
    operator,
  })

  const {
    rows: tiers,
    total: tiersTotal,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.subscriptionTier.findMany({
        where: whereQuery,
        orderBy: [...orderBy, { level: "asc" }],
        take: perPage,
        skip: offset,
        include: {
          _count: { select: { subscriptions: true } },
        },
      }),
    count: () => db.subscriptionTier.count({ where: whereQuery }),
  })

  return { tiers, tiersTotal, pageCount }
}

export const findSubscriptionTierById = async (id: string) => {
  return db.subscriptionTier.findFirst({
    where: { id, brand: Brand.BBL },
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
  return db.subscriptionTier.findMany({
    where: { brand: Brand.BBL },
    select: { id: true, name: true, code: true, level: true },
    orderBy: { level: "asc" },
  })
}
