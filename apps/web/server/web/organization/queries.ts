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

export const getOrganizationBySlug = cache(async (brand: string, slug: string) => {
  return db.organization.findUnique({
    where: { brand_slug: { brand: brand as any, slug } },
    include: {
      disciplines: { include: { discipline: true } },
      owner: { select: { id: true, name: true, email: true } },
      memberships: {
        include: {
          user: { select: { id: true, name: true } },
          discipline: { select: { id: true, name: true } },
          roleAssignments: {
            include: { role: { select: { id: true, code: true, name: true } } },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { memberships: true } },
    },
  })
})

export const getOrganizationByInviteCode = cache(async (inviteCode: string) => {
  return db.organization.findUnique({
    where: { inviteCode },
    include: {
      disciplines: { include: { discipline: true } },
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
      roleAssignments: {
        include: { role: { select: { id: true, code: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  })
})

export const getSystemRoles = cache(async () => {
  return db.role.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  })
})
