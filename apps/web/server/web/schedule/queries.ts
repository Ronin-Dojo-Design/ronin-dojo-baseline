import { cache } from "react"
import type { Brand } from "~/.generated/prisma/client"
import {
  scheduleDetailPayload,
  scheduleManyPayload,
} from "~/server/web/schedule/payloads"
import { db } from "~/services/db"

/**
 * Gate 5: instructor selector limited to ACTIVE memberships in the schedule's
 * organization with role codes OWNER / ORG_ADMIN / INSTRUCTOR. Coach is
 * intentionally excluded (OD-5). Re-verify with `docs/sprints/SESSION_0031.md`
 * security gate row 5.
 */
export const SCHEDULE_INSTRUCTOR_ROLE_CODES = ["OWNER", "ORG_ADMIN", "INSTRUCTOR"] as const

export const getSchedulesByProgram = cache(
  async (brand: Brand, programId: string, organizationId: string) => {
    return db.classSchedule.findMany({
      where: { brand, programId, organizationId },
      select: scheduleManyPayload,
      orderBy: [{ status: "asc" }, { name: "asc" }],
    })
  },
)

export const getScheduleById = cache(async (brand: Brand, id: string) => {
  return db.classSchedule.findFirst({
    where: { id, brand },
    select: scheduleDetailPayload,
  })
})

export const getEditableInstructors = cache(
  async (brand: Brand, organizationId: string) => {
    const memberships = await db.membership.findMany({
      where: {
        brand,
        organizationId,
        status: "ACTIVE",
        roleAssignments: {
          some: {
            role: { code: { in: [...SCHEDULE_INSTRUCTOR_ROLE_CODES] } },
          },
        },
      },
      select: {
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      distinct: ["userId"],
      orderBy: { user: { name: "asc" } },
    })

    return memberships.map(m => m.user)
  },
)
