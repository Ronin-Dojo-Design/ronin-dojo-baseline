import type { Prisma } from "~/.generated/prisma/client"
import { courseManyPayload } from "~/server/web/courses/payloads"

export const programOrganizationPayload = {
  id: true,
  name: true,
  slug: true,
  type: true,
  city: true,
  state: true,
  ownerId: true,
} satisfies Prisma.OrganizationSelect

export const programDisciplinePayload = {
  id: true,
  name: true,
  slug: true,
} satisfies Prisma.DisciplineSelect

export const programManyPayload = {
  id: true,
  brand: true,
  name: true,
  slug: true,
  description: true,
  status: true,
  ageMin: true,
  ageMax: true,
  maxEnrollment: true,
  minEnrollment: true,
  sortOrder: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
  organizationId: true,
  disciplineId: true,
  organization: { select: programOrganizationPayload },
  discipline: { select: programDisciplinePayload },
  _count: {
    select: {
      classSchedules: true,
      programEnrollments: true,
    },
  },
} satisfies Prisma.ProgramSelect

export const programDetailPayload = {
  ...programManyPayload,
  courses: {
    select: {
      course: {
        select: courseManyPayload,
      },
    },
    orderBy: { course: { title: "asc" as const } },
  },
  pricingPlans: {
    select: {
      id: true,
      name: true,
      pricingModel: true,
      amountCents: true,
      currency: true,
      intervalMonths: true,
      isActive: true,
    },
    orderBy: { amountCents: "asc" as const },
  },
} satisfies Prisma.ProgramSelect

export type ProgramMany = Prisma.ProgramGetPayload<{
  select: typeof programManyPayload
}>

export type ProgramDetail = Prisma.ProgramGetPayload<{
  select: typeof programDetailPayload
}>

/**
 * Gate 11 (SESSION_0031): public schedule surface payload.
 *
 * Strict allowlist for unauthenticated / public consumers (brand-domain
 * marketing pages). Exposes only day/time blocks, location summary, and
 * capacity bucket. No instructor names, no notes, no enrollment counts.
 *
 * If a future surface needs more, add a new payload — do NOT widen this one.
 */
export const programPublicSchedulePayload = {
  id: true,
  name: true,
  status: true,
  daysOfWeek: true,
  startTime: true,
  endTime: true,
  timezone: true,
  effectiveFrom: true,
  effectiveTo: true,
  capacity: true,
  locationName: true,
} satisfies Prisma.ClassScheduleSelect

export type ProgramPublicSchedule = Prisma.ClassScheduleGetPayload<{
  select: typeof programPublicSchedulePayload
}>
