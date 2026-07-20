import { cache } from "react"
import type { Brand } from "~/.generated/prisma/client"
import { activeStaffMembershipWhere } from "~/server/web/techniques/permissions"
import { db } from "~/services/db"

export const findUserEnrollments = cache(async (userId: string, brand: Brand) => {
  return db.programEnrollment.findMany({
    where: { userId, program: { organization: { brand } } },
    include: {
      program: {
        select: { id: true, name: true, organization: { select: { name: true } } },
      },
    },
    orderBy: { enrolledAt: "desc" },
  })
})

export const findUserEntitlements = cache(async (userId: string, brand: Brand) => {
  return db.userEntitlement.findMany({
    where: { userId, status: "ACTIVE", entitlement: { brand } },
    include: {
      entitlement: { select: { id: true, name: true, key: true } },
    },
    orderBy: { startsAt: "desc" },
  })
})

export const findUserStripeCustomer = cache(async (userId: string, brand: Brand) => {
  return db.stripeCustomer.findUnique({
    where: {
      userId_brand_accountScope: {
        userId,
        brand,
        accountScope: "platform",
      },
    },
  })
})

export const findUserRegistrations = cache(async (userId: string, brand: Brand) => {
  return db.registration.findMany({
    where: { userId, tournament: { brand } },
    include: {
      tournament: {
        select: { id: true, name: true, startDate: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })
})

export const findUserOrganization = cache(async (userId: string, brand: Brand) => {
  // Find organization where user is owner
  return db.organization.findFirst({
    where: {
      brand,
      memberships: {
        some: {
          userId,
          roleAssignments: { some: { role: { code: "OWNER" } } },
        },
      },
    },
    include: {
      disciplines: {
        include: { discipline: { select: { id: true, name: true } } },
      },
    },
  })
})

export const findUserTechniques = cache(async (userId: string, brand: Brand) => {
  // Techniques the user can manage: their org-library rows (OWNER/INSTRUCTOR school staff) PLUS
  // their own AUTHORED rows (ADR 0046 D2 — `authorPassportId` via the user's Passport, org-grouped
  // or profile-only alike; SESSION_0529 Slice 3B).
  // @changed WL-P2-49: the staff leg now rides the ONE shared predicate — which adds
  // `status: ACTIVE`. This was the last unhardened copy (SESSION_0529 Giddy drift class); the read
  // now matches the write-gates, so a CANCELLED staff member no longer sees org rows they can't edit.
  return db.technique.findMany({
    where: {
      OR: [
        {
          organization: {
            brand,
            memberships: { some: activeStaffMembershipWhere(userId) },
          },
        },
        { brand, author: { userId } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isPublished: true,
      difficultyLevel: true,
      createdAt: true,
      updatedAt: true,
      authorPassportId: true,
      discipline: { select: { id: true, name: true } },
      organization: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  })
})

/**
 * The caller's OWN technique-progress rows for the dashboard "My progress" section (G-022 Lane B,
 * SESSION_0580) — DISTINCT from `findUserTechniques` above (techniques the user AUTHORS/manages).
 * Scoped by `technique: { brand }` (progress has no `brand` column of its own). Deliberately
 * UNCACHED (no `react cache()` wrapper) — progress changes on every write and this is a
 * per-request dashboard read, matching the CACHE TRAP note in `server/web/techniques/progress.ts`.
 */
export const findUserTechniqueProgress = async (userId: string, brand: Brand) => {
  return db.techniqueProgress.findMany({
    where: { userId, technique: { brand } },
    select: {
      id: true,
      status: true,
      lastDrilledAt: true,
      updatedAt: true,
      technique: {
        select: {
          id: true,
          name: true,
          slug: true,
          discipline: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })
}
