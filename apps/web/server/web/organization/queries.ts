import { cache } from "react"
import { db } from "~/services/db"

export const getOrganizationById = cache(async (id: string) => {
  return db.organization.findUnique({
    where: { id },
    include: {
      disciplines: { include: { discipline: true } },
      owner: { select: { id: true, name: true } },
      _count: { select: { memberships: true } },
    },
  })
})

export const getOrganizationsByBrand = cache(async (brand: string) => {
  return db.organization.findMany({
    where: { brand: brand as any },
    include: {
      disciplines: { include: { discipline: true } },
      _count: { select: { memberships: true } },
    },
    orderBy: { name: "asc" },
  })
})

export const getUserMemberships = cache(async (userId: string) => {
  return db.membership.findMany({
    where: { userId },
    include: {
      organization: true,
      discipline: true,
      style: true,
      rank: true,
    },
    orderBy: { createdAt: "desc" },
  })
})
