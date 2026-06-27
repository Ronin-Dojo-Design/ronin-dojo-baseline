import { Brand, type Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { PricingPlansTableSchema } from "~/server/admin/pricing-plans/schema"
import { db } from "~/services/db"

export const findPricingPlans = async (
  search: PricingPlansTableSchema,
  where?: Prisma.PricingPlanWhereInput,
) => {
  const { name, perPage, operator } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.PricingPlanOrderByWithRelationInput>(search)

  const expressions: (Prisma.PricingPlanWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
    createdAtRangeExpression<Prisma.PricingPlanWhereInput>(fromDate, toDate),
  ]

  const whereQuery = buildAdminListWhere<Prisma.PricingPlanWhereInput>({
    baseWhere: { brand: Brand.BBL },
    expressions,
    extraWhere: where,
    operator,
  })

  const {
    rows: pricingPlans,
    total: pricingPlansTotal,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.pricingPlan.findMany({
        where: whereQuery,
        orderBy: [...orderBy, { createdAt: "asc" }],
        take: perPage,
        skip: offset,
        include: {
          organization: { select: { id: true, name: true } },
          program: { select: { id: true, name: true } },
          _count: { select: { entitlementGrants: true } },
        },
      }),
    count: () => db.pricingPlan.count({ where: whereQuery }),
  })

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
