/**
 * AUTH CONTRACT — Page-level gate, not query-level.
 *
 * These queries are called exclusively from server components wrapped in
 * `requireAuth()` / `requireOrgAccess()` HOCs. Auth is enforced at the page
 * boundary (L1 — Dirstarter pattern). Adding redundant auth checks here would
 * diverge from L1, add unnecessary DB round-trips, and create a maintenance
 * burden without improving security — all callers are already authenticated.
 *
 * See: SESSION_0302 grill Fork 2, F-0300-1 (accepted-risk).
 */
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

/**
 * Org-scoped invite list for the org settings → invites surface. Not cached —
 * generate/revoke must reflect immediately. Authorization is enforced at the
 * page/action layer via `hasOrgAdminAccess`. Default shows active (PENDING)
 * invites; `includeAll` returns every status. Includes claim count.
 */
export const getOrganizationInvites = async (organizationId: string, includeAll = false) => {
  return db.invite.findMany({
    where: {
      organizationId,
      type: "ORGANIZATION",
      ...(includeAll ? {} : { status: "PENDING" }),
    },
    select: {
      id: true,
      code: true,
      status: true,
      maxUses: true,
      currentUses: true,
      expiresAt: true,
      createdAt: true,
      _count: { select: { claims: true } },
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
