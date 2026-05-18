import { cache } from "react"
import type { Brand, ScheduleStatus } from "~/.generated/prisma/client"
import { scheduleDetailPayload, scheduleManyPayload } from "~/server/web/schedule/payloads"
import { db } from "~/services/db"

/**
 * Gate 5: instructor selector limited to ACTIVE memberships in the schedule's
 * organization with role codes OWNER / ORG_ADMIN / INSTRUCTOR. Coach is
 * intentionally excluded (OD-5). Re-verify with `docs/sprints/SESSION_0031.md`
 * security gate row 5.
 */
export const SCHEDULE_INSTRUCTOR_ROLE_CODES = ["OWNER", "ORG_ADMIN", "INSTRUCTOR"] as const

/**
 * SESSION_0031.5 TASK_01 — paginated schedule list.
 *
 * Defaults per OD-1: pageSize 20, max 50.
 * Defaults per OD-2: when `status` is undefined, exclude ARCHIVED (i.e. show
 * all non-archived). Explicit `status` value (ACTIVE / PAUSED / ARCHIVED) is
 * applied directly.
 *
 * MB-002: `{ brand, organizationId, programId }` are explicit predicates on
 * every read; not derived solely from a context helper.
 *
 * react.cache only — auth-scoped per D-005; never "use cache".
 */
export const getSchedulesByProgramPaginated = cache(
  async (
    brand: Brand,
    programId: string,
    organizationId: string,
    {
      status,
      page = 1,
      pageSize = 20,
    }: { status?: ScheduleStatus; page?: number; pageSize?: number } = {},
  ) => {
    const safePageSize = Math.min(Math.max(1, pageSize), 50)
    const safePage = Math.max(1, page)
    const skip = (safePage - 1) * safePageSize

    const where = {
      brand,
      programId,
      organizationId,
      ...(status ? { status } : { status: { not: "ARCHIVED" as const } }),
    }

    const [items, total] = await db.$transaction([
      db.classSchedule.findMany({
        where,
        select: scheduleManyPayload,
        orderBy: [{ status: "asc" }, { name: "asc" }],
        skip,
        take: safePageSize,
      }),
      db.classSchedule.count({ where }),
    ])

    return {
      items,
      total,
      hasMore: skip + items.length < total,
    }
  },
)

export const getScheduleById = cache(async (brand: Brand, id: string) => {
  return db.classSchedule.findFirst({
    where: { id, brand },
    select: scheduleDetailPayload,
  })
})

export const getEditableInstructors = cache(async (brand: Brand, organizationId: string) => {
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
})
