import type { Prisma } from "~/.generated/prisma/client"
import { OrganizationType } from "~/.generated/prisma/client"

// ---------------------------------------------------------------------------
// Schools payloads — Dirstarter L1 pattern
//
// School lens = Organizations where type IN (DOJO, SCHOOL).
// LEAGUE and CLUB stay on /organizations/[slug].
//
// Mirrors apps/web/server/web/organization/payloads.ts shape with a
// school-specific detail payload that adds programs, classSchedules,
// parentRelationships and richer membership.roleAssignments for the
// Instructors section on /schools/[slug].
// ---------------------------------------------------------------------------

/**
 * OrganizationType values counted as "schools" for this lens.
 * Used in `where: { type: { in: SCHOOL_ORG_TYPES } }` filters.
 */
export const SCHOOL_ORG_TYPES = [OrganizationType.DOJO, OrganizationType.SCHOOL] as const

/**
 * Shared discipline fragment for Organization.disciplines.
 */
const schoolDisciplinePayload = {
  discipline: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.OrganizationDisciplineSelect

/**
 * List-card payload for school cards (Related Schools, listing pages).
 */
export const schoolManyPayload = {
  id: true,
  brand: true,
  name: true,
  slug: true,
  description: true,
  type: true,
  city: true,
  state: true,
  country: true,
  phoneE164: true,
  email: true,
  websiteUrl: true,
  createdAt: true,
  ownerId: true,
  disciplines: { select: schoolDisciplinePayload },
  _count: { select: { memberships: true, programs: true, classSchedules: true } },
} satisfies Prisma.OrganizationSelect

/**
 * Detail payload for /schools/[slug]. Adds instructor-capable memberships,
 * programs, classSchedules, parentRelationships (affiliation sidebar).
 */
export const schoolDetailPayload = {
  id: true,
  brand: true,
  name: true,
  slug: true,
  description: true,
  type: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  state: true,
  zip: true,
  country: true,
  websiteUrl: true,
  phoneE164: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  ownerId: true,
  owner: { select: { id: true, name: true } },
  disciplines: { select: schoolDisciplinePayload },
  memberships: {
    select: {
      id: true,
      status: true,
      joinedAt: true,
      createdAt: true,
      user: { select: { id: true, name: true, image: true } },
      discipline: { select: { id: true, name: true, slug: true } },
      rank: { select: { id: true, name: true, sortOrder: true } },
      roleAssignments: {
        select: {
          role: {
            select: { id: true, code: true, name: true, displayTitle: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
  programs: {
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      status: true,
      imageUrl: true,
      sortOrder: true,
      ageMin: true,
      ageMax: true,
      discipline: { select: { id: true, name: true, slug: true } },
    },
    orderBy: [{ sortOrder: "asc" as const }, { name: "asc" as const }],
  },
  classSchedules: {
    select: {
      id: true,
      name: true,
      status: true,
      daysOfWeek: true,
      startTime: true,
      endTime: true,
      timezone: true,
      locationName: true,
      program: { select: { id: true, name: true, slug: true } },
      discipline: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { startTime: "asc" as const },
  },
  parentRelationships: {
    where: { isActive: true },
    select: {
      id: true,
      type: true,
      parentOrg: {
        select: { id: true, name: true, slug: true, type: true, brand: true },
      },
    },
  },
  _count: {
    select: { memberships: true, programs: true, classSchedules: true, courses: true },
  },
} satisfies Prisma.OrganizationSelect

export type SchoolMany = Prisma.OrganizationGetPayload<{
  select: typeof schoolManyPayload
}>

export type SchoolDetail = Prisma.OrganizationGetPayload<{
  select: typeof schoolDetailPayload
}>
