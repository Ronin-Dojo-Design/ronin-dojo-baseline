import { cache } from "react"
import { db } from "~/services/db"

export const findUserEnrollments = cache(async (userId: string) => {
  return db.programEnrollment.findMany({
    where: { userId },
    include: {
      program: {
        select: { id: true, name: true, organization: { select: { name: true } } },
      },
    },
    orderBy: { enrolledAt: "desc" },
  })
})

export const findUserEntitlements = cache(async (userId: string) => {
  return db.userEntitlement.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      entitlement: { select: { id: true, name: true, key: true } },
    },
    orderBy: { startsAt: "desc" },
  })
})

export const findUserRegistrations = cache(async (userId: string) => {
  return db.registration.findMany({
    where: { userId },
    include: {
      tournament: {
        select: { id: true, name: true, startDate: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })
})
