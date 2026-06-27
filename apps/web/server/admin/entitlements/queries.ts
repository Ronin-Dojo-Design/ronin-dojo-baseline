import { Brand, type Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { EntitlementsTableSchema } from "~/server/admin/entitlements/schema"
import { db } from "~/services/db"

export const findEntitlements = async (
  search: EntitlementsTableSchema,
  where?: Prisma.EntitlementWhereInput,
) => {
  const { name, perPage, operator } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.EntitlementOrderByWithRelationInput>(search)

  const expressions: (Prisma.EntitlementWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    createdAtRangeExpression<Prisma.EntitlementWhereInput>(fromDate, toDate),
  ]

  const whereQuery = buildAdminListWhere<Prisma.EntitlementWhereInput>({
    baseWhere: { brand: Brand.BBL },
    expressions,
    extraWhere: where,
    operator,
  })

  const {
    rows: entitlements,
    total: entitlementsTotal,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.entitlement.findMany({
        where: whereQuery,
        orderBy: [...orderBy, { createdAt: "asc" }],
        take: perPage,
        skip: offset,
        include: {
          _count: { select: { grants: true, assignments: true } },
        },
      }),
    count: () => db.entitlement.count({ where: whereQuery }),
  })

  return { entitlements, entitlementsTotal, pageCount }
}

export const findEntitlementById = async (id: string) => {
  return db.entitlement.findFirst({
    where: { id, brand: Brand.BBL },
    include: {
      grants: {
        include: { pricingPlan: true },
      },
      assignments: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  })
}

export const findEntitlementList = async () => {
  return db.entitlement.findMany({
    where: { brand: Brand.BBL },
    select: { id: true, name: true, key: true },
    orderBy: { name: "asc" },
  })
}
