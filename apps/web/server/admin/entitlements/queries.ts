import { isTruthy } from "@primoui/utils"
import { endOfDay, startOfDay } from "date-fns"
import type { Prisma } from "~/.generated/prisma/client"
import { getRequestBrand } from "~/lib/brand-context"
import type { EntitlementsTableSchema } from "~/server/admin/entitlements/schema"
import { db } from "~/services/db"

export const findEntitlements = async (
  search: EntitlementsTableSchema,
  where?: Prisma.EntitlementWhereInput,
) => {
  const { name, page, perPage, sort, from, to, operator } = search
  const brand = await getRequestBrand()

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.EntitlementWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
  ]

  const whereQuery: Prisma.EntitlementWhereInput = {
    brand,
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [entitlements, entitlementsTotal] = await db.$transaction([
    db.entitlement.findMany({
      where: { ...whereQuery, ...where },
      orderBy: [...orderBy, { createdAt: "asc" }],
      take: perPage,
      skip: offset,
      include: {
        _count: { select: { grants: true, assignments: true } },
      },
    }),

    db.entitlement.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  const pageCount = Math.ceil(entitlementsTotal / perPage)
  return { entitlements, entitlementsTotal, pageCount }
}

export const findEntitlementById = async (id: string) => {
  const brand = await getRequestBrand()

  return db.entitlement.findFirst({
    where: { id, brand },
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
  const brand = await getRequestBrand()

  return db.entitlement.findMany({
    where: { brand },
    select: { id: true, name: true, key: true },
    orderBy: { name: "asc" },
  })
}
