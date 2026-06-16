import { cache } from "react"
import type { Brand } from "~/.generated/prisma/client"
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
  // Find techniques for organizations the user owns/instructs
  return db.technique.findMany({
    where: {
      organization: {
        brand,
        memberships: {
          some: {
            userId,
            roleAssignments: { some: { role: { code: { in: ["OWNER", "INSTRUCTOR"] } } } },
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isPublished: true,
      difficultyLevel: true,
      createdAt: true,
      updatedAt: true,
      discipline: { select: { id: true, name: true } },
      organization: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  })
})
