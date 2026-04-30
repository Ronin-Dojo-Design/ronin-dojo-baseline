import type { Prisma } from "~/.generated/prisma/client"

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
        select: {
          id: true,
          title: true,
          slug: true,
        },
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
