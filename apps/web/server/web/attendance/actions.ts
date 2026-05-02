"use server"

import type { AttendanceStatus, Brand, Prisma } from "~/.generated/prisma/client"
import { canEditOrganization } from "~/lib/authz"
import { getRequestBrand } from "~/lib/brand-context"
import { isRateLimited } from "~/lib/rate-limiter"
import { userActionClient } from "~/lib/safe-actions"
import { ATTENDANCE_ERROR } from "~/server/web/attendance/errors"
import {
  type AttendanceCheckIn,
  type AttendanceRecord,
  attendanceCheckInPayload,
  attendanceRecordPayload,
} from "~/server/web/attendance/payloads"
import {
  markAttendanceSchema,
  recordCheckInSchema,
  voidCheckInSchema,
} from "~/server/web/attendance/schemas"
import { writeSchoolOpsAudit } from "~/server/web/school-ops/audit"

const DAY_MS = 24 * 60 * 60 * 1000
const FUTURE_ATTENDANCE_WINDOW_DAYS = 1

const REVALIDATE_ATTENDANCE_PATHS = (programId: string, scheduleId: string) => [
  `/programs/${programId}/schedules`,
  `/programs/${programId}/schedules/${scheduleId}`,
]

const startOfUtcDay = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

const isTooFarInFuture = (sessionDate: Date, now = new Date()) => {
  const maxDate = new Date(startOfUtcDay(now).getTime() + FUTURE_ATTENDANCE_WINDOW_DAYS * DAY_MS)
  return startOfUtcDay(sessionDate).getTime() > maxDate.getTime()
}

const normalizedNotes = (notes: string | undefined) => {
  const value = notes?.trim()
  return value ? value : undefined
}

type MembershipLookupDb = {
  membership: {
    findFirst: (args: Prisma.MembershipFindFirstArgs) => PromiseLike<{ id: string } | null>
  }
}

const assertTargetIsActiveMember = async ({
  db,
  brand,
  organizationId,
  userId,
  disciplineId,
}: {
  db: MembershipLookupDb
  brand: Brand
  organizationId: string
  userId: string
  disciplineId?: string | null
}) => {
  const membership = await db.membership.findFirst({
    where: {
      brand,
      organizationId,
      userId,
      status: "ACTIVE",
      ...(disciplineId ? { disciplineId } : {}),
    },
    select: { id: true },
  })

  if (!membership) {
    throw new Error(ATTENDANCE_ERROR.USER_NOT_ELIGIBLE)
  }
}

const assertSessionCanAcceptAttendance = (session: { date: Date; status: string }) => {
  if (session.status === "CANCELLED") {
    throw new Error(ATTENDANCE_ERROR.SESSION_NOT_OPEN)
  }

  if (isTooFarInFuture(session.date)) {
    throw new Error(ATTENDANCE_ERROR.SESSION_TOO_FAR_IN_FUTURE)
  }
}

const auditAttendanceSnapshot = (attendance: {
  id: string
  status: AttendanceStatus
  notes: string | null
  userId: string
  classSessionId: string
  checkIn?: { id: string } | null
}) => ({
  id: attendance.id,
  status: attendance.status,
  notes: attendance.notes,
  userId: attendance.userId,
  classSessionId: attendance.classSessionId,
  checkInId: attendance.checkIn?.id ?? null,
})

export const recordCheckIn = userActionClient
  .inputSchema(recordCheckInSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()

    if (await isRateLimited(user.id, "attendance_write")) {
      throw new Error(ATTENDANCE_ERROR.RATE_LIMITED)
    }

    const session = await db.classSession.findFirst({
      where: {
        id: parsedInput.classSessionId,
        classSchedule: { brand: requestBrand },
      },
      select: {
        id: true,
        date: true,
        status: true,
        classSchedule: {
          select: {
            id: true,
            brand: true,
            organizationId: true,
            programId: true,
            disciplineId: true,
          },
        },
      },
    })

    if (!session) {
      throw new Error(ATTENDANCE_ERROR.SESSION_NOT_FOUND)
    }

    if (!(await canEditOrganization(user, session.classSchedule.organizationId))) {
      throw new Error(ATTENDANCE_ERROR.NOT_AUTHORIZED)
    }

    assertSessionCanAcceptAttendance(session)

    await assertTargetIsActiveMember({
      db,
      brand: requestBrand,
      organizationId: session.classSchedule.organizationId,
      userId: parsedInput.userId,
      disciplineId: session.classSchedule.disciplineId,
    })

    const notes = normalizedNotes(parsedInput.notes)
    const deviceId = normalizedNotes(parsedInput.deviceId)

    let result: { attendance: AttendanceRecord; checkIn: AttendanceCheckIn }
    try {
      result = await db.$transaction(async tx => {
        const attendance = await tx.attendance.upsert({
          where: {
            userId_classSessionId: {
              userId: parsedInput.userId,
              classSessionId: session.id,
            },
          },
          update: {
            status: "PRESENT",
            ...(notes !== undefined ? { notes } : {}),
          },
          create: {
            userId: parsedInput.userId,
            classSessionId: session.id,
            status: "PRESENT",
            notes,
          },
          select: attendanceRecordPayload,
        })

        const existingCheckIn = await tx.checkIn.findUnique({
          where: { matchedToAttendanceId: attendance.id },
          select: attendanceCheckInPayload,
        })

        const checkIn =
          existingCheckIn ??
          (await tx.checkIn.create({
            data: {
              userId: parsedInput.userId,
              method: parsedInput.method,
              deviceId,
              matchedToAttendanceId: attendance.id,
            },
            select: attendanceCheckInPayload,
          }))

        const refreshedAttendance = await tx.attendance.findUniqueOrThrow({
          where: { id: attendance.id },
          select: attendanceRecordPayload,
        })

        return { attendance: refreshedAttendance, checkIn }
      })
    } catch (error) {
      console.error("recordCheckIn failed", error)
      throw new Error(ATTENDANCE_ERROR.UNEXPECTED_ERROR)
    }

    await writeSchoolOpsAudit({
      brand: session.classSchedule.brand,
      userId: user.id,
      organizationId: session.classSchedule.organizationId,
      entityType: "CheckIn",
      entityId: result.checkIn.id,
      action: "check_in.recorded",
      after: {
        attendanceId: result.attendance.id,
        classSessionId: session.id,
        checkedInUserId: parsedInput.userId,
        method: result.checkIn.method,
      },
    })

    revalidate({
      paths: REVALIDATE_ATTENDANCE_PATHS(session.classSchedule.programId, session.classSchedule.id),
    })

    return result
  })

export const markAttendance = userActionClient
  .inputSchema(markAttendanceSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()

    if (await isRateLimited(user.id, "attendance_write")) {
      throw new Error(ATTENDANCE_ERROR.RATE_LIMITED)
    }

    const session = await db.classSession.findFirst({
      where: {
        id: parsedInput.classSessionId,
        classSchedule: { brand: requestBrand },
      },
      select: {
        id: true,
        date: true,
        status: true,
        classSchedule: {
          select: {
            id: true,
            brand: true,
            organizationId: true,
            programId: true,
            disciplineId: true,
          },
        },
      },
    })

    if (!session) {
      throw new Error(ATTENDANCE_ERROR.SESSION_NOT_FOUND)
    }

    if (!(await canEditOrganization(user, session.classSchedule.organizationId))) {
      throw new Error(ATTENDANCE_ERROR.NOT_AUTHORIZED)
    }

    assertSessionCanAcceptAttendance(session)

    await assertTargetIsActiveMember({
      db,
      brand: requestBrand,
      organizationId: session.classSchedule.organizationId,
      userId: parsedInput.userId,
      disciplineId: session.classSchedule.disciplineId,
    })

    const existing = await db.attendance.findUnique({
      where: {
        userId_classSessionId: {
          userId: parsedInput.userId,
          classSessionId: session.id,
        },
      },
      select: attendanceRecordPayload,
    })

    if (
      existing?.checkIn &&
      (parsedInput.status === "EXCUSED" || parsedInput.status === "NO_SHOW")
    ) {
      throw new Error(ATTENDANCE_ERROR.CHECK_IN_ALREADY_RECORDED)
    }

    const notes = normalizedNotes(parsedInput.notes)

    let attendance: AttendanceRecord
    try {
      attendance = await db.attendance.upsert({
        where: {
          userId_classSessionId: {
            userId: parsedInput.userId,
            classSessionId: session.id,
          },
        },
        update: {
          status: parsedInput.status,
          ...(notes !== undefined ? { notes } : {}),
        },
        create: {
          userId: parsedInput.userId,
          classSessionId: session.id,
          status: parsedInput.status,
          notes,
        },
        select: attendanceRecordPayload,
      })
    } catch (error) {
      console.error("markAttendance failed", error)
      throw new Error(ATTENDANCE_ERROR.UNEXPECTED_ERROR)
    }

    await writeSchoolOpsAudit({
      brand: session.classSchedule.brand,
      userId: user.id,
      organizationId: session.classSchedule.organizationId,
      entityType: "Attendance",
      entityId: attendance.id,
      action: "attendance.marked",
      before: existing ? auditAttendanceSnapshot(existing) : undefined,
      after: auditAttendanceSnapshot(attendance),
    })

    revalidate({
      paths: REVALIDATE_ATTENDANCE_PATHS(session.classSchedule.programId, session.classSchedule.id),
    })

    return attendance
  })

export const voidCheckIn = userActionClient
  .inputSchema(voidCheckInSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()

    if (await isRateLimited(user.id, "attendance_write")) {
      throw new Error(ATTENDANCE_ERROR.RATE_LIMITED)
    }

    const existing = await db.attendance.findFirst({
      where: {
        id: parsedInput.attendanceId,
        classSession: {
          classSchedule: { brand: requestBrand },
        },
      },
      select: {
        ...attendanceRecordPayload,
        classSession: {
          select: {
            id: true,
            classSchedule: {
              select: {
                id: true,
                brand: true,
                organizationId: true,
                programId: true,
              },
            },
          },
        },
      },
    })

    if (!existing) {
      throw new Error(ATTENDANCE_ERROR.ATTENDANCE_NOT_FOUND)
    }

    if (!(await canEditOrganization(user, existing.classSession.classSchedule.organizationId))) {
      throw new Error(ATTENDANCE_ERROR.NOT_AUTHORIZED)
    }

    const notes = normalizedNotes(parsedInput.notes)

    let attendance: AttendanceRecord
    try {
      attendance = await db.$transaction(async tx => {
        if (existing.checkIn) {
          await tx.checkIn.update({
            where: { id: existing.checkIn.id },
            data: { matchedToAttendanceId: null },
          })
        }

        return tx.attendance.update({
          where: { id: existing.id },
          data: {
            status: parsedInput.statusAfterVoid,
            ...(notes !== undefined ? { notes } : {}),
          },
          select: attendanceRecordPayload,
        })
      })
    } catch (error) {
      console.error("voidCheckIn failed", error)
      throw new Error(ATTENDANCE_ERROR.UNEXPECTED_ERROR)
    }

    await writeSchoolOpsAudit({
      brand: existing.classSession.classSchedule.brand,
      userId: user.id,
      organizationId: existing.classSession.classSchedule.organizationId,
      entityType: "Attendance",
      entityId: attendance.id,
      action: "check_in.voided",
      before: auditAttendanceSnapshot(existing),
      after: {
        ...auditAttendanceSnapshot(attendance),
        voidedCheckInId: existing.checkIn?.id ?? null,
      },
    })

    revalidate({
      paths: REVALIDATE_ATTENDANCE_PATHS(
        existing.classSession.classSchedule.programId,
        existing.classSession.classSchedule.id,
      ),
    })

    return attendance
  })
