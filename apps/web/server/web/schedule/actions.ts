"use server"

import type { ClassSchedule } from "~/.generated/prisma/client"
import { canEditOrganization } from "~/lib/authz"
import { getRequestBrand } from "~/lib/brand-context"
import { isRateLimited } from "~/lib/rate-limiter"
import { userActionClient } from "~/lib/safe-actions"
import { writeScheduleAudit } from "~/server/web/schedule/audit"
import { SCHEDULE_ERROR } from "~/server/web/schedule/errors"
import { SCHEDULE_INSTRUCTOR_ROLE_CODES } from "~/server/web/schedule/queries"
import {
  archiveScheduleSchema,
  assignInstructorSchema,
  materializeScheduleSchema,
  saveScheduleSchema,
  setPrimaryInstructorSchema,
  unassignInstructorSchema,
} from "~/server/web/schedule/schemas"
import { generateSessionPlan } from "~/server/web/schedule/session-generator"

/**
 * Schedule slice (SESSION_0031 TASK_01).
 *
 * Mirrors `server/web/program/actions.ts` exactly:
 *   - userActionClient (auth-guarded)
 *   - getRequestBrand from ~/lib/brand-context (gate 1)
 *   - canEditOrganization (org+role) check
 *   - explicit { brand, organizationId } predicates on every write (MB-002)
 *
 * Security gates folded into done-criteria:
 *   1 brand-context import       (this file)
 *   4 schedule_write rate limiter (each action)
 *   5 instructor selector predicates (assignInstructor)
 *   7 IANA timezone validation   (schemas.ts)
 *   8 error catalog              (errors.ts + try/catch wrapping)
 *   9 AuditLog write             (audit.ts)
 *  11 public payload             (server/web/program/payloads.ts)
 */
const REVALIDATE_SCHEDULE_PATHS = (programId: string, scheduleId?: string) => [
  `/programs/${programId}`,
  `/programs/${programId}/schedules`,
  ...(scheduleId
    ? [
        `/programs/${programId}/schedules/${scheduleId}`,
        `/programs/${programId}/schedules/${scheduleId}/edit`,
      ]
    : []),
]

export const saveSchedule = userActionClient
  .inputSchema(saveScheduleSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()

    if (await isRateLimited(user.id, "schedule_write")) {
      throw new Error(SCHEDULE_ERROR.RATE_LIMITED)
    }

    const {
      id: rawId,
      organizationId,
      programId,
      disciplineId: rawDisciplineId,
      description: rawDescription,
      locationName: rawLocationName,
      capacity,
      effectiveFrom,
      effectiveTo,
      ...rest
    } = parsedInput

    const id = rawId && rawId !== "none" ? rawId : undefined
    const disciplineId = rawDisciplineId && rawDisciplineId !== "none" ? rawDisciplineId : undefined
    const description = rawDescription?.trim() || undefined
    const locationName = rawLocationName?.trim() || undefined

    const organization = await db.organization.findFirst({
      where: { id: organizationId, brand: requestBrand },
      select: {
        id: true,
        brand: true,
        slug: true,
        disciplines: { select: { disciplineId: true } },
      },
    })

    if (!organization) {
      throw new Error(SCHEDULE_ERROR.ORG_NOT_FOUND)
    }

    if (!(await canEditOrganization(user, organization.id))) {
      throw new Error(SCHEDULE_ERROR.NOT_AUTHORIZED)
    }

    if (disciplineId && !organization.disciplines.some(d => d.disciplineId === disciplineId)) {
      throw new Error(SCHEDULE_ERROR.DISCIPLINE_NOT_LINKED)
    }

    const program = await db.program.findFirst({
      where: { id: programId, brand: requestBrand, organizationId: organization.id },
      select: { id: true },
    })
    if (!program) {
      throw new Error(SCHEDULE_ERROR.PROGRAM_NOT_FOUND)
    }

    let before: ClassSchedule | null = null
    if (id) {
      const existing = await db.classSchedule.findFirst({
        where: { id, brand: requestBrand, organizationId: organization.id, programId },
      })
      if (!existing) {
        throw new Error(SCHEDULE_ERROR.SCHEDULE_NOT_FOUND)
      }
      before = existing
    }

    const data = {
      name: rest.name,
      description,
      status: rest.status,
      daysOfWeek: rest.daysOfWeek,
      startTime: rest.startTime,
      endTime: rest.endTime,
      timezone: rest.timezone,
      effectiveFrom: effectiveFrom ?? null,
      effectiveTo: effectiveTo ?? null,
      capacity: capacity ?? null,
      locationName: locationName ?? null,
      disciplineId: disciplineId ?? null,
    }

    let schedule: ClassSchedule
    try {
      schedule = id
        ? await db.classSchedule.update({ where: { id }, data })
        : await db.classSchedule.create({
            data: {
              ...data,
              brand: organization.brand,
              organizationId: organization.id,
              programId,
            },
          })
    } catch (error) {
      console.error("saveSchedule failed", error)
      throw new Error(SCHEDULE_ERROR.UNEXPECTED_ERROR)
    }

    await writeScheduleAudit({
      brand: organization.brand,
      userId: user.id,
      organizationId: organization.id,
      entityType: "ClassSchedule",
      entityId: schedule.id,
      action: id ? "schedule.updated" : "schedule.created",
      before: before ?? undefined,
      after: schedule,
    })

    revalidate({ paths: REVALIDATE_SCHEDULE_PATHS(programId, schedule.id) })

    return schedule
  })

export const archiveSchedule = userActionClient
  .inputSchema(archiveScheduleSchema)
  .action(async ({ parsedInput: { id }, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()

    if (await isRateLimited(user.id, "schedule_write")) {
      throw new Error(SCHEDULE_ERROR.RATE_LIMITED)
    }

    const schedule = await db.classSchedule.findFirst({
      where: { id, brand: requestBrand },
      select: { id: true, organizationId: true, programId: true, status: true },
    })

    if (!schedule) {
      throw new Error(SCHEDULE_ERROR.SCHEDULE_NOT_FOUND)
    }

    if (!(await canEditOrganization(user, schedule.organizationId))) {
      throw new Error(SCHEDULE_ERROR.NOT_AUTHORIZED)
    }

    let archived: ClassSchedule
    try {
      archived = await db.classSchedule.update({
        where: { id: schedule.id },
        data: { status: "ARCHIVED" },
      })
    } catch (error) {
      console.error("archiveSchedule failed", error)
      throw new Error(SCHEDULE_ERROR.UNEXPECTED_ERROR)
    }

    await writeScheduleAudit({
      brand: requestBrand,
      userId: user.id,
      organizationId: schedule.organizationId,
      entityType: "ClassSchedule",
      entityId: schedule.id,
      action: "schedule.archived",
      before: { status: schedule.status },
      after: { status: archived.status },
    })

    revalidate({ paths: REVALIDATE_SCHEDULE_PATHS(schedule.programId, schedule.id) })

    return archived
  })

export const assignInstructor = userActionClient
  .inputSchema(assignInstructorSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()

    if (await isRateLimited(user.id, "schedule_write")) {
      throw new Error(SCHEDULE_ERROR.RATE_LIMITED)
    }

    const schedule = await db.classSchedule.findFirst({
      where: { id: parsedInput.classScheduleId, brand: requestBrand },
      select: { id: true, organizationId: true, programId: true },
    })

    if (!schedule) {
      throw new Error(SCHEDULE_ERROR.SCHEDULE_NOT_FOUND)
    }

    if (!(await canEditOrganization(user, schedule.organizationId))) {
      throw new Error(SCHEDULE_ERROR.NOT_AUTHORIZED)
    }

    // Gate 5: instructor must hold an ACTIVE membership in this org with an
    // OWNER/ORG_ADMIN/INSTRUCTOR role assignment.
    const eligibleMembership = await db.membership.findFirst({
      where: {
        brand: requestBrand,
        organizationId: schedule.organizationId,
        userId: parsedInput.userId,
        status: "ACTIVE",
        roleAssignments: {
          some: {
            role: { code: { in: [...SCHEDULE_INSTRUCTOR_ROLE_CODES] } },
          },
        },
      },
      select: { id: true },
    })

    if (!eligibleMembership) {
      throw new Error(SCHEDULE_ERROR.INSTRUCTOR_NOT_ELIGIBLE)
    }

    let assignment: { id: string }
    try {
      assignment = await db.$transaction(async tx => {
        if (parsedInput.isPrimary) {
          await tx.classInstructorAssignment.updateMany({
            where: { classScheduleId: schedule.id, isPrimary: true },
            data: { isPrimary: false },
          })
        }

        return tx.classInstructorAssignment.upsert({
          where: {
            classScheduleId_userId: {
              classScheduleId: schedule.id,
              userId: parsedInput.userId,
            },
          },
          update: {
            isPrimary: parsedInput.isPrimary,
            displayTitle: parsedInput.displayTitle?.trim() || null,
          },
          create: {
            classScheduleId: schedule.id,
            userId: parsedInput.userId,
            isPrimary: parsedInput.isPrimary,
            displayTitle: parsedInput.displayTitle?.trim() || null,
          },
          select: { id: true },
        })
      })
    } catch (error) {
      console.error("assignInstructor failed", error)
      throw new Error(SCHEDULE_ERROR.UNEXPECTED_ERROR)
    }

    await writeScheduleAudit({
      brand: requestBrand,
      userId: user.id,
      organizationId: schedule.organizationId,
      entityType: "ClassInstructorAssignment",
      entityId: assignment.id,
      action: "instructor.assigned",
      after: {
        classScheduleId: schedule.id,
        userId: parsedInput.userId,
        isPrimary: parsedInput.isPrimary,
        displayTitle: parsedInput.displayTitle ?? null,
      },
    })

    revalidate({ paths: REVALIDATE_SCHEDULE_PATHS(schedule.programId, schedule.id) })

    return assignment
  })

export const unassignInstructor = userActionClient
  .inputSchema(unassignInstructorSchema)
  .action(async ({ parsedInput: { assignmentId }, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()

    if (await isRateLimited(user.id, "schedule_write")) {
      throw new Error(SCHEDULE_ERROR.RATE_LIMITED)
    }

    const assignment = await db.classInstructorAssignment.findFirst({
      where: { id: assignmentId, classSchedule: { brand: requestBrand } },
      select: {
        id: true,
        userId: true,
        classSchedule: { select: { id: true, organizationId: true, programId: true } },
      },
    })

    if (!assignment) {
      throw new Error(SCHEDULE_ERROR.ASSIGNMENT_NOT_FOUND)
    }

    if (!(await canEditOrganization(user, assignment.classSchedule.organizationId))) {
      throw new Error(SCHEDULE_ERROR.NOT_AUTHORIZED)
    }

    try {
      await db.classInstructorAssignment.delete({ where: { id: assignment.id } })
    } catch (error) {
      console.error("unassignInstructor failed", error)
      throw new Error(SCHEDULE_ERROR.UNEXPECTED_ERROR)
    }

    await writeScheduleAudit({
      brand: requestBrand,
      userId: user.id,
      organizationId: assignment.classSchedule.organizationId,
      entityType: "ClassInstructorAssignment",
      entityId: assignment.id,
      action: "instructor.unassigned",
      before: { userId: assignment.userId, classScheduleId: assignment.classSchedule.id },
    })

    revalidate({
      paths: REVALIDATE_SCHEDULE_PATHS(
        assignment.classSchedule.programId,
        assignment.classSchedule.id,
      ),
    })

    return { id: assignment.id }
  })

export const setPrimaryInstructor = userActionClient
  .inputSchema(setPrimaryInstructorSchema)
  .action(async ({ parsedInput: { assignmentId }, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()

    if (await isRateLimited(user.id, "schedule_write")) {
      throw new Error(SCHEDULE_ERROR.RATE_LIMITED)
    }

    const assignment = await db.classInstructorAssignment.findFirst({
      where: { id: assignmentId, classSchedule: { brand: requestBrand } },
      select: {
        id: true,
        classSchedule: { select: { id: true, organizationId: true, programId: true } },
      },
    })

    if (!assignment) {
      throw new Error(SCHEDULE_ERROR.ASSIGNMENT_NOT_FOUND)
    }

    if (!(await canEditOrganization(user, assignment.classSchedule.organizationId))) {
      throw new Error(SCHEDULE_ERROR.NOT_AUTHORIZED)
    }

    try {
      await db.$transaction([
        db.classInstructorAssignment.updateMany({
          where: {
            classScheduleId: assignment.classSchedule.id,
            isPrimary: true,
          },
          data: { isPrimary: false },
        }),
        db.classInstructorAssignment.update({
          where: { id: assignment.id },
          data: { isPrimary: true },
        }),
      ])
    } catch (error) {
      console.error("setPrimaryInstructor failed", error)
      throw new Error(SCHEDULE_ERROR.UNEXPECTED_ERROR)
    }

    await writeScheduleAudit({
      brand: requestBrand,
      userId: user.id,
      organizationId: assignment.classSchedule.organizationId,
      entityType: "ClassInstructorAssignment",
      entityId: assignment.id,
      action: "instructor.set_primary",
    })

    revalidate({
      paths: REVALIDATE_SCHEDULE_PATHS(
        assignment.classSchedule.programId,
        assignment.classSchedule.id,
      ),
    })

    return { id: assignment.id }
  })

export const materializeSchedule = userActionClient
  .inputSchema(materializeScheduleSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const startedAt = Date.now()
    const requestBrand = await getRequestBrand()

    if (await isRateLimited(user.id, "schedule_write")) {
      throw new Error(SCHEDULE_ERROR.RATE_LIMITED)
    }

    const schedule = await db.classSchedule.findFirst({
      where: { id: parsedInput.id, brand: requestBrand },
      select: {
        id: true,
        organizationId: true,
        programId: true,
        status: true,
        daysOfWeek: true,
        startTime: true,
        endTime: true,
        effectiveFrom: true,
        effectiveTo: true,
      },
    })

    if (!schedule) {
      throw new Error(SCHEDULE_ERROR.SCHEDULE_NOT_FOUND)
    }

    if (!(await canEditOrganization(user, schedule.organizationId))) {
      throw new Error(SCHEDULE_ERROR.NOT_AUTHORIZED)
    }

    const existingSessions = await db.classSession.findMany({
      where: { classScheduleId: schedule.id },
      select: {
        id: true,
        date: true,
        status: true,
        startTime: true,
        endTime: true,
        _count: { select: { attendances: true } },
      },
    })

    const plan = generateSessionPlan({
      schedule: {
        daysOfWeek: schedule.daysOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        effectiveFrom: schedule.effectiveFrom,
        effectiveTo: schedule.effectiveTo,
        status: schedule.status,
      },
      existingSessions: existingSessions.map(s => ({
        id: s.id,
        date: s.date,
        status: s.status,
        startTime: s.startTime,
        endTime: s.endTime,
        hasAttendance: s._count.attendances > 0,
      })),
      windowStart: parsedInput.windowStart,
      windowEnd: parsedInput.windowEnd,
    })

    let result: { created: number; cancelled: number; deleted: number; refreshed: number }
    try {
      result = await db.$transaction(async tx => {
        let created = 0
        for (const row of plan.toCreate) {
          await tx.classSession.upsert({
            where: {
              classScheduleId_date: {
                classScheduleId: schedule.id,
                date: row.date,
              },
            },
            update: {
              startTime: row.startTime,
              endTime: row.endTime,
            },
            create: {
              classScheduleId: schedule.id,
              date: row.date,
              startTime: row.startTime,
              endTime: row.endTime,
            },
          })
          created += 1
        }

        let refreshed = 0
        for (const row of plan.toRefreshTimes) {
          await tx.classSession.update({
            where: { id: row.id },
            data: { startTime: row.startTime, endTime: row.endTime },
          })
          refreshed += 1
        }

        let cancelled = 0
        if (plan.toCancel.length > 0) {
          const updated = await tx.classSession.updateMany({
            where: { id: { in: plan.toCancel.map(s => s.id) } },
            data: { status: "CANCELLED" },
          })
          cancelled = updated.count
        }

        let deleted = 0
        if (plan.toDelete.length > 0) {
          const removed = await tx.classSession.deleteMany({
            where: { id: { in: plan.toDelete.map(s => s.id) } },
          })
          deleted = removed.count
        }

        return { created, cancelled, deleted, refreshed }
      })
    } catch (error) {
      console.error("materializeSchedule failed", error)
      throw new Error(SCHEDULE_ERROR.UNEXPECTED_ERROR)
    }

    console.info(
      "[schedule] materialize: created=%d cancelled=%d deleted=%d refreshed=%d duration=%dms",
      result.created,
      result.cancelled,
      result.deleted,
      result.refreshed,
      Date.now() - startedAt,
    )

    await writeScheduleAudit({
      brand: requestBrand,
      userId: user.id,
      organizationId: schedule.organizationId,
      entityType: "ClassSchedule",
      entityId: schedule.id,
      action: "schedule.materialized",
      after: {
        windowStart: plan.windowStart,
        windowEnd: plan.windowEnd,
        ...result,
      },
    })

    revalidate({ paths: REVALIDATE_SCHEDULE_PATHS(schedule.programId, schedule.id) })

    return result
  })
