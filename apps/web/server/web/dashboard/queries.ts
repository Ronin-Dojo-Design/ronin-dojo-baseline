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

export const findUserPassport = cache(async (userId: string) => {
  return db.passport.findUnique({
    where: { userId },
  })
})
