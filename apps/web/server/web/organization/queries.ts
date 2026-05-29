import { cacheLife, cacheTag } from "next/cache"
import { cache } from "react"
import {
  organizationDetailPayload,
  organizationManyPayload,
  organizationOnePayload,
} from "~/server/web/organization/payloads"
import { db } from "~/services/db"

export const getOrganizationById = cache(async (id: string) => {
  return db.organization.findUnique({
    where: { id },
    select: organizationOnePayload,
  })
})

export const getOrganizationBySlug = async (brand: string, slug: string) => {
  "use cache"

  cacheTag(`organization-${slug}`)
  cacheLife("minutes")

  return db.organization.findUnique({
    where: { brand_slug: { brand: brand as any, slug } },
    select: organizationDetailPayload,
  })
}

export const getOrganizationByInviteCode = cache(async (inviteCode: string) => {
  return db.organization.findUnique({
    where: { inviteCode },
    select: organizationManyPayload,
  })
})

export const getOrganizationsByBrand = async (brand: string) => {
  "use cache"

  cacheTag("organizations")
  cacheLife("minutes")

  return db.organization.findMany({
    where: { brand: brand as any },
    select: organizationManyPayload,
    orderBy: { name: "asc" },
  })
}

export const getUserMemberships = cache(async (userId: string) => {
  return db.membership.findMany({
    where: { userId },
    select: {
      id: true,
      brand: true,
      status: true,
      joinedAt: true,
      createdAt: true,
      organization: {
        select: { id: true, name: true, slug: true, brand: true },
      },
      discipline: {
        select: { id: true, name: true, slug: true },
      },
      style: {
        select: { id: true, name: true },
      },
      rank: {
        select: { id: true, name: true, sortOrder: true },
      },
      roleAssignments: {
        select: {
          role: { select: { id: true, code: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
})

/**
 * Org-scoped membership roster for the org settings → members surface.
 * Not cached: status changes (approvals) must reflect immediately. Authorization
 * is enforced at the page/action layer via `hasOrgAdminAccess`. The page
 * partitions PENDING members into the approval queue.
 */
export const getOrganizationMembers = async (organizationId: string) => {
  return db.membership.findMany({
    where: { organizationId },
    select: {
      id: true,
      status: true,
      memberNumber: true,
      joinedAt: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true, image: true } },
      discipline: { select: { id: true, name: true } },
      rank: { select: { id: true, name: true } },
      roleAssignments: {
        select: { role: { select: { id: true, code: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export const getSystemRoles = async () => {
  "use cache"

  cacheTag("system-roles")
  cacheLife("infinite")

  return db.role.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  })
}

export const findOrganizationSlugs = async () => {
  "use cache"

  cacheTag("organization-slugs")
  cacheLife("hours")

  return db.organization.findMany({
    select: { slug: true, brand: true },
    orderBy: { name: "asc" },
  })
}

export const findRelatedOrganizations = async ({
  organizationId,
  brand,
  disciplineIds,
  city,
}: {
  organizationId: string
  brand: string
  disciplineIds: string[]
  city: string | null
}) => {
  "use cache"

  cacheTag(`related-organizations-${organizationId}`)
  cacheLife("minutes")

  return db.organization.findMany({
    where: {
      brand: brand as any,
      id: { not: organizationId },
      OR: [
        ...(disciplineIds.length > 0
          ? [{ disciplines: { some: { disciplineId: { in: disciplineIds } } } }]
          : []),
        ...(city ? [{ city }] : []),
      ],
    },
    select: organizationManyPayload,
    take: 6,
    orderBy: { name: "asc" },
  })
}
