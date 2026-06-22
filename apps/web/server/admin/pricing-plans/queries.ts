import { isTruthy } from "@dirstack/utils"
import { endOfDay, startOfDay } from "date-fns"
import { Brand, type Prisma } from "~/.generated/prisma/client"
import type { PricingPlansTableSchema } from "~/server/admin/pricing-plans/schema"
import { db } from "~/services/db"

export const findPricingPlans = async (
  search: PricingPlansTableSchema,
  where?: Prisma.PricingPlanWhereInput,
) => {
  const { name, page, perPage, sort, from, to, operator } = search

  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const fromDate = from ? startOfDay(new Date(from)) : undefined
  const toDate = to ? endOfDay(new Date(to)) : undefined

  const expressions: (Prisma.PricingPlanWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    fromDate || toDate ? { createdAt: { gte: fromDate, lte: toDate } } : undefined,
  ]

  const whereQuery: Prisma.PricingPlanWhereInput = {
    brand: Brand.BBL,
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [pricingPlans, pricingPlansTotal] = await db.$transaction([
    db.pricingPlan.findMany({
      where: { ...whereQuery, ...where },
      orderBy: [...orderBy, { createdAt: "asc" }],
      take: perPage,
      skip: offset,
      include: {
        organization: { select: { id: true, name: true } },
        program: { select: { id: true, name: true } },
        _count: { select: { entitlementGrants: true } },
      },
    }),

    db.pricingPlan.count({
      where: { ...whereQuery, ...where },
    }),
  ])

  const pageCount = Math.ceil(pricingPlansTotal / perPage)
  return { pricingPlans, pricingPlansTotal, pageCount }
}

export const findPricingPlanById = async (id: string) => {
  return db.pricingPlan.findFirst({
    where: { id, brand: Brand.BBL },
    include: {
      organization: { select: { id: true, name: true } },
      program: { select: { id: true, name: true } },
      entitlementGrants: {
        include: { entitlement: { select: { id: true, name: true, key: true } } },
      },
    },
  })
}

export const findPricingPlanList = async () => {
  return db.pricingPlan.findMany({
    where: { brand: Brand.BBL },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}

export const findOrganizationList = async () => {
  return db.organization.findMany({
    where: { brand: Brand.BBL },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}

export const findProgramList = async (organizationId?: string) => {
  return db.program.findMany({
    where: { brand: Brand.BBL, ...(organizationId ? { organizationId } : {}) },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}
