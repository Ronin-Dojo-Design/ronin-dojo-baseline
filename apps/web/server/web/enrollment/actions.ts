"use server"

import { Brand, type EnrollmentStatus } from "~/.generated/prisma/client"
import { canEditOrganization } from "~/lib/authz"
import { isRateLimited } from "~/lib/rate-limiter"
import { userActionClient } from "~/lib/safe-actions"
import { ENROLLMENT_ERROR } from "~/server/web/enrollment/errors"
import {
  type EnrollmentProgram,
  enrollmentProgramPayload,
  type ProgramEnrollmentRecord,
  programEnrollmentPayload,
} from "~/server/web/enrollment/payloads"
import {
  enrollmentProgramUserSchema,
  promoteFromWaitlistSchema,
  withdrawEnrollmentSchema,
} from "~/server/web/enrollment/schemas"
import { writeSchoolOpsAudit } from "~/server/web/school-ops/audit"

const REVALIDATE_ENROLLMENT_PATHS = (programId: string) => [
  `/programs/${programId}`,
  `/programs/${programId}/enrollments`,
]

type DbLike = any

const assertTargetIsActiveMember = async ({
  db,
  brand,
  organizationId,
  userId,
  disciplineId,
}: {
  db: DbLike
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
    throw new Error(ENROLLMENT_ERROR.USER_NOT_ELIGIBLE)
  }
}

const assertUserHasPassport = async ({ db, userId }: { db: DbLike; userId: string }) => {
  const passport = await db.passport.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!passport) {
    throw new Error(ENROLLMENT_ERROR.NO_PASSPORT)
  }
}

const resolveProgramForEnrollment = async ({
  db,
  brand,
  programId,
}: {
  db: DbLike
  brand: Brand
  programId: string
}) => {
  const program = await db.program.findFirst({
    where: { id: programId, brand },
    select: enrollmentProgramPayload,
  })

  if (!program) {
    throw new Error(ENROLLMENT_ERROR.PROGRAM_NOT_FOUND)
  }

  return program
}

const assertCanManageProgram = async ({
  user,
  program,
}: {
  user: Parameters<typeof canEditOrganization>[0]
  program: Pick<EnrollmentProgram, "organizationId">
}) => {
  if (!(await canEditOrganization(user, program.organizationId))) {
    throw new Error(ENROLLMENT_ERROR.NOT_AUTHORIZED)
  }
}

const nextWaitlistPosition = async ({ db, programId }: { db: DbLike; programId: string }) => {
  const aggregate = await db.programEnrollment.aggregate({
    where: { programId, status: "WAITLISTED" },
    _max: { waitlistPosition: true },
  })
  return (aggregate._max.waitlistPosition ?? 0) + 1
}

const countActiveEnrollments = async ({ db, programId }: { db: DbLike; programId: string }) => {
  return db.programEnrollment.count({
    where: { programId, status: "ACTIVE" },
  })
}

const desiredEnrollmentStatus = async ({
  db,
  program,
}: {
  db: DbLike
  program: Pick<EnrollmentProgram, "id" | "maxEnrollment">
}): Promise<{ status: EnrollmentStatus; waitlistPosition: number | null }> => {
  if (!program.maxEnrollment) {
    return { status: "ACTIVE", waitlistPosition: null }
  }

  const activeCount = await countActiveEnrollments({ db, programId: program.id })
  if (activeCount < program.maxEnrollment) {
    return { status: "ACTIVE", waitlistPosition: null }
  }

  return {
    status: "WAITLISTED",
    waitlistPosition: await nextWaitlistPosition({ db, programId: program.id }),
  }
}

const auditEnrollmentSnapshot = (enrollment: ProgramEnrollmentRecord) => ({
  id: enrollment.id,
  status: enrollment.status,
  waitlistPosition: enrollment.waitlistPosition,
  enrolledAt: enrollment.enrolledAt,
  withdrawnAt: enrollment.withdrawnAt,
  userId: enrollment.userId,
  programId: enrollment.programId,
})

const upsertEnrollment = async ({
  db,
  program,
  userId,
  status,
  waitlistPosition,
}: {
  db: DbLike
  program: EnrollmentProgram
  userId: string
  status: EnrollmentStatus
  waitlistPosition: number | null
}) => {
  return db.programEnrollment.upsert({
    where: {
      userId_programId: {
        userId,
        programId: program.id,
      },
    },
    update: {
      status,
      waitlistPosition,
      withdrawnAt: null,
      ...(status === "ACTIVE" ? { enrolledAt: new Date() } : {}),
    },
    create: {
      userId,
      programId: program.id,
      status,
      waitlistPosition,
    },
    select: programEnrollmentPayload,
  })
}

export const enrollInProgram = userActionClient
  .inputSchema(enrollmentProgramUserSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    if (await isRateLimited(user.id, "enrollment_write")) {
      throw new Error(ENROLLMENT_ERROR.RATE_LIMITED)
    }

    const program = await resolveProgramForEnrollment({
      db,
      brand: Brand.BBL,
      programId: parsedInput.programId,
    })
    await assertCanManageProgram({ user, program })
    await assertTargetIsActiveMember({
      db,
      brand: Brand.BBL,
      organizationId: program.organizationId,
      userId: parsedInput.userId,
      disciplineId: program.disciplineId,
    })
    await assertUserHasPassport({ db, userId: parsedInput.userId })

    let enrollment: ProgramEnrollmentRecord
    try {
      enrollment = await db.$transaction(async tx => {
        const existing = await tx.programEnrollment.findUnique({
          where: {
            userId_programId: {
              userId: parsedInput.userId,
              programId: program.id,
            },
          },
          select: programEnrollmentPayload,
        })

        if (existing?.status === "ACTIVE") {
          return existing
        }

        const desired = await desiredEnrollmentStatus({ db: tx, program })
        if (existing?.status === "WAITLISTED" && desired.status === "WAITLISTED") {
          return existing
        }

        return upsertEnrollment({
          db: tx,
          program,
          userId: parsedInput.userId,
          ...desired,
        })
      })
    } catch (error) {
      console.error("enrollInProgram failed", error)
      throw new Error(ENROLLMENT_ERROR.UNEXPECTED_ERROR)
    }

    await writeSchoolOpsAudit({
      brand: program.brand,
      userId: user.id,
      organizationId: program.organizationId,
      entityType: "Enrollment",
      entityId: enrollment.id,
      action: enrollment.status === "WAITLISTED" ? "enrollment.waitlisted" : "enrollment.created",
      after: auditEnrollmentSnapshot(enrollment),
    })

    revalidate({ paths: REVALIDATE_ENROLLMENT_PATHS(program.id) })

    return enrollment
  })

export const joinProgramWaitlist = userActionClient
  .inputSchema(enrollmentProgramUserSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    if (await isRateLimited(user.id, "enrollment_write")) {
      throw new Error(ENROLLMENT_ERROR.RATE_LIMITED)
    }

    const program = await resolveProgramForEnrollment({
      db,
      brand: Brand.BBL,
      programId: parsedInput.programId,
    })
    await assertCanManageProgram({ user, program })
    await assertTargetIsActiveMember({
      db,
      brand: Brand.BBL,
      organizationId: program.organizationId,
      userId: parsedInput.userId,
      disciplineId: program.disciplineId,
    })
    await assertUserHasPassport({ db, userId: parsedInput.userId })

    let enrollment: ProgramEnrollmentRecord
    try {
      enrollment = await db.$transaction(async tx => {
        const existing = await tx.programEnrollment.findUnique({
          where: {
            userId_programId: {
              userId: parsedInput.userId,
              programId: program.id,
            },
          },
          select: programEnrollmentPayload,
        })

        if (existing?.status === "ACTIVE") {
          return existing
        }

        return upsertEnrollment({
          db: tx,
          program,
          userId: parsedInput.userId,
          status: "WAITLISTED",
          waitlistPosition:
            existing?.waitlistPosition ??
            (await nextWaitlistPosition({ db: tx, programId: program.id })),
        })
      })
    } catch (error) {
      console.error("joinProgramWaitlist failed", error)
      throw new Error(ENROLLMENT_ERROR.UNEXPECTED_ERROR)
    }

    await writeSchoolOpsAudit({
      brand: program.brand,
      userId: user.id,
      organizationId: program.organizationId,
      entityType: "Enrollment",
      entityId: enrollment.id,
      action: enrollment.status === "ACTIVE" ? "enrollment.created" : "enrollment.waitlisted",
      after: auditEnrollmentSnapshot(enrollment),
    })

    revalidate({ paths: REVALIDATE_ENROLLMENT_PATHS(program.id) })

    return enrollment
  })

export const withdrawEnrollment = userActionClient
  .inputSchema(withdrawEnrollmentSchema)
  .action(async ({ parsedInput: { enrollmentId }, ctx: { user, db, revalidate } }) => {
    if (await isRateLimited(user.id, "enrollment_write")) {
      throw new Error(ENROLLMENT_ERROR.RATE_LIMITED)
    }

    const existing = await db.programEnrollment.findFirst({
      where: {
        id: enrollmentId,
        program: { brand: Brand.BBL },
      },
      select: programEnrollmentPayload,
    })

    if (!existing) {
      throw new Error(ENROLLMENT_ERROR.ENROLLMENT_NOT_FOUND)
    }

    await assertCanManageProgram({ user, program: existing.program })

    let enrollment: ProgramEnrollmentRecord
    try {
      enrollment =
        existing.status === "WITHDRAWN"
          ? existing
          : await db.programEnrollment.update({
              where: { id: existing.id },
              data: {
                status: "WITHDRAWN",
                waitlistPosition: null,
                withdrawnAt: new Date(),
              },
              select: programEnrollmentPayload,
            })
    } catch (error) {
      console.error("withdrawEnrollment failed", error)
      throw new Error(ENROLLMENT_ERROR.UNEXPECTED_ERROR)
    }

    await writeSchoolOpsAudit({
      brand: existing.program.brand,
      userId: user.id,
      organizationId: existing.program.organizationId,
      entityType: "Enrollment",
      entityId: enrollment.id,
      action: "enrollment.withdrawn",
      before: auditEnrollmentSnapshot(existing),
      after: auditEnrollmentSnapshot(enrollment),
    })

    revalidate({ paths: REVALIDATE_ENROLLMENT_PATHS(existing.programId) })

    return enrollment
  })

export const promoteFromWaitlist = userActionClient
  .inputSchema(promoteFromWaitlistSchema)
  .action(async ({ parsedInput: { programId }, ctx: { user, db, revalidate } }) => {
    if (await isRateLimited(user.id, "enrollment_write")) {
      throw new Error(ENROLLMENT_ERROR.RATE_LIMITED)
    }

    const program = await resolveProgramForEnrollment({ db, brand: Brand.BBL, programId })
    await assertCanManageProgram({ user, program })

    let enrollment: ProgramEnrollmentRecord
    let before: ProgramEnrollmentRecord
    try {
      const result = await db.$transaction(async tx => {
        const activeCount = await countActiveEnrollments({ db: tx, programId: program.id })
        if (program.maxEnrollment && activeCount >= program.maxEnrollment) {
          throw new Error(ENROLLMENT_ERROR.CAPACITY_FULL)
        }

        const waitlisted = await tx.programEnrollment.findFirst({
          where: {
            programId: program.id,
            status: "WAITLISTED",
          },
          select: programEnrollmentPayload,
          orderBy: [{ waitlistPosition: "asc" }, { enrolledAt: "asc" }],
        })

        if (!waitlisted) {
          throw new Error(ENROLLMENT_ERROR.WAITLIST_EMPTY)
        }

        const promoted = await tx.programEnrollment.update({
          where: { id: waitlisted.id },
          data: {
            status: "ACTIVE",
            waitlistPosition: null,
            withdrawnAt: null,
            enrolledAt: new Date(),
          },
          select: programEnrollmentPayload,
        })

        return { before: waitlisted, enrollment: promoted }
      })
      before = result.before
      enrollment = result.enrollment
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === ENROLLMENT_ERROR.CAPACITY_FULL ||
          error.message === ENROLLMENT_ERROR.WAITLIST_EMPTY)
      ) {
        throw error
      }
      console.error("promoteFromWaitlist failed", error)
      throw new Error(ENROLLMENT_ERROR.UNEXPECTED_ERROR)
    }

    await writeSchoolOpsAudit({
      brand: program.brand,
      userId: user.id,
      organizationId: program.organizationId,
      entityType: "Enrollment",
      entityId: enrollment.id,
      action: "enrollment.promoted",
      before: auditEnrollmentSnapshot(before),
      after: auditEnrollmentSnapshot(enrollment),
    })

    revalidate({ paths: REVALIDATE_ENROLLMENT_PATHS(program.id) })

    return enrollment
  })
