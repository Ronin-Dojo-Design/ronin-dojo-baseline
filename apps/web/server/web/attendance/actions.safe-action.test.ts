/**
 * SESSION_0190 TASK_01 - end-to-end safe-action test for `recordCheckIn`.
 *
 * Invokes the next-safe-action-wrapped export through the full `userActionClient`
 * middleware chain using the reusable `installSafeActionMocks` harness.
 *
 * Run: cd apps/web && bun test --timeout 120000 \
 *        server/web/attendance/actions.safe-action.test.ts
 */

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

// Install mocks BEFORE any import that touches `~/server`, `~/lib/auth`, etc.
installSafeActionMocks({ brand: "BBL" })

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test"

import { recordCheckIn } from "~/server/web/attendance/actions"
import { db } from "~/services/db"

const TEST_BRAND = "BBL" as const
const TS = Date.now()
const TAG_PREFIX = "session-0190-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`

type Fixtures = {
  ownerId: string
  studentId: string
  organizationId: string
  disciplineId: string
  programId: string
  scheduleId: string
  classSessionId: string
}

let fx: Fixtures | null = null

const todayUtc = () => {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

const createClassSession = async () => {
  const session = await db.classSession.create({
    data: {
      classScheduleId: fx!.scheduleId,
      date: todayUtc(),
      startTime: "17:00",
      endTime: "18:00",
      status: "SCHEDULED",
    },
  })
  fx!.classSessionId = session.id
}

const validPayload = () => ({
  classSessionId: fx!.classSessionId,
  userId: fx!.studentId,
  method: "MANUAL" as const,
})

const writeCounts = async () => {
  const [attendance, checkIns, audits] = await Promise.all([
    db.attendance.count({ where: { classSessionId: fx!.classSessionId } }),
    db.checkIn.count({ where: { userId: fx!.studentId } }),
    db.auditLog.count({ where: { organizationId: fx!.organizationId } }),
  ])

  return { attendance, checkIns, audits }
}

beforeAll(async () => {
  const owner = await db.user.create({
    data: { name: tag("owner"), email: `${tag("owner")}@test.local` },
  })

  const student = await db.user.create({
    data: { name: tag("student"), email: `${tag("student")}@test.local` },
  })

  const discipline = await db.discipline.create({
    data: { brand: TEST_BRAND, name: tag("disc"), slug: tag("disc") },
  })

  const organization = await db.organization.create({
    data: {
      brand: TEST_BRAND,
      name: tag("org"),
      slug: tag("org"),
      type: "DOJO",
      ownerId: owner.id,
    },
  })

  await db.organizationDiscipline.create({
    data: { organizationId: organization.id, disciplineId: discipline.id },
  })

  await db.membership.create({
    data: {
      brand: TEST_BRAND,
      userId: owner.id,
      organizationId: organization.id,
      disciplineId: discipline.id,
      status: "ACTIVE",
      joinedAt: todayUtc(),
    },
  })

  await db.membership.create({
    data: {
      brand: TEST_BRAND,
      userId: student.id,
      organizationId: organization.id,
      disciplineId: discipline.id,
      status: "ACTIVE",
      joinedAt: todayUtc(),
    },
  })

  const program = await db.program.create({
    data: {
      brand: TEST_BRAND,
      organizationId: organization.id,
      disciplineId: discipline.id,
      name: tag("program"),
      slug: tag("program"),
      status: "ACTIVE",
    },
  })

  const schedule = await db.classSchedule.create({
    data: {
      brand: TEST_BRAND,
      organizationId: organization.id,
      programId: program.id,
      disciplineId: discipline.id,
      name: tag("schedule"),
      daysOfWeek: ["MON"],
      startTime: "17:00",
      endTime: "18:00",
      timezone: "America/Denver",
    },
  })

  fx = {
    ownerId: owner.id,
    studentId: student.id,
    organizationId: organization.id,
    disciplineId: discipline.id,
    programId: program.id,
    scheduleId: schedule.id,
    classSessionId: "",
  }
})

beforeEach(async () => {
  if (!fx) return

  await db.auditLog.deleteMany({ where: { organizationId: fx.organizationId } })
  await db.checkIn.deleteMany({ where: { userId: fx.studentId } })
  await db.attendance.deleteMany({ where: { classSession: { classScheduleId: fx.scheduleId } } })
  await db.classSession.deleteMany({ where: { classScheduleId: fx.scheduleId } })

  await createClassSession()
})

afterAll(async () => {
  if (!fx) return

  await db.auditLog.deleteMany({ where: { organizationId: fx.organizationId } })
  await db.checkIn.deleteMany({ where: { userId: fx.studentId } })
  await db.attendance.deleteMany({ where: { classSession: { classScheduleId: fx.scheduleId } } })
  await db.classSession.deleteMany({ where: { classScheduleId: fx.scheduleId } })
  await db.classInstructorAssignment.deleteMany({
    where: { classSchedule: { organizationId: fx.organizationId } },
  })
  await db.classSchedule.deleteMany({ where: { id: fx.scheduleId } })
  await db.membershipRoleAssignment.deleteMany({
    where: { membership: { organizationId: fx.organizationId } },
  })
  await db.membership.deleteMany({ where: { organizationId: fx.organizationId } })
  await db.organizationDiscipline.deleteMany({
    where: { organizationId: fx.organizationId },
  })
  await db.program.deleteMany({ where: { id: fx.programId } })
  await db.organization.deleteMany({ where: { id: fx.organizationId } })
  await db.user.deleteMany({ where: { id: { in: [fx.ownerId, fx.studentId] } } })
  await db.discipline.deleteMany({ where: { id: fx.disciplineId } })

  const zombieOrgs = await db.organization.findMany({
    where: { name: { startsWith: TAG_PREFIX } },
    select: { id: true },
  })
  const zombieOrgIds = zombieOrgs.map(org => org.id)

  const zombieUsers = await db.user.findMany({
    where: { name: { startsWith: TAG_PREFIX } },
    select: { id: true },
  })
  const zombieUserIds = zombieUsers.map(user => user.id)

  if (zombieUserIds.length > 0) {
    await db.auditLog.deleteMany({ where: { userId: { in: zombieUserIds } } })
    await db.checkIn.deleteMany({ where: { userId: { in: zombieUserIds } } })
    await db.attendance.deleteMany({ where: { userId: { in: zombieUserIds } } })
  }

  if (zombieOrgIds.length > 0) {
    await db.auditLog.deleteMany({ where: { organizationId: { in: zombieOrgIds } } })
    await db.checkIn.deleteMany({
      where: {
        attendance: {
          classSession: {
            classSchedule: { organizationId: { in: zombieOrgIds } },
          },
        },
      },
    })
    await db.attendance.deleteMany({
      where: {
        classSession: {
          classSchedule: { organizationId: { in: zombieOrgIds } },
        },
      },
    })
    await db.classSession.deleteMany({
      where: { classSchedule: { organizationId: { in: zombieOrgIds } } },
    })
    await db.classInstructorAssignment.deleteMany({
      where: { classSchedule: { organizationId: { in: zombieOrgIds } } },
    })
    await db.classSchedule.deleteMany({ where: { organizationId: { in: zombieOrgIds } } })
    await db.membershipRoleAssignment.deleteMany({
      where: { membership: { organizationId: { in: zombieOrgIds } } },
    })
    await db.membership.deleteMany({ where: { organizationId: { in: zombieOrgIds } } })
    await db.organizationDiscipline.deleteMany({
      where: { organizationId: { in: zombieOrgIds } },
    })
    await db.program.deleteMany({ where: { organizationId: { in: zombieOrgIds } } })
    await db.organization.deleteMany({ where: { id: { in: zombieOrgIds } } })
  }

  if (zombieUserIds.length > 0) {
    await db.user.deleteMany({ where: { id: { in: zombieUserIds } } })
  }
  await db.discipline.deleteMany({ where: { name: { startsWith: TAG_PREFIX } } })
})

describe("recordCheckIn - safe-action wrapper", () => {
  it("returns serverError 'User not authenticated' when no session is present", async () => {
    setTestSession(null)

    const result = await recordCheckIn(validPayload())

    expect(result?.serverError).toBe("User not authenticated")
    expect(result?.data).toBeUndefined()
    expect(await writeCounts()).toEqual({ attendance: 0, checkIns: 0, audits: 0 })
  })

  it("surfaces validationErrors and writes nothing when the schema rejects input", async () => {
    setTestSession({ id: fx!.ownerId })

    const result = await recordCheckIn({
      ...validPayload(),
      classSessionId: "not-a-cuid",
    })

    expect(result?.validationErrors).toBeDefined()
    expect(result?.data).toBeUndefined()
    expect(await writeCounts()).toEqual({ attendance: 0, checkIns: 0, audits: 0 })
  })

  it("records an authorized check-in and writes the audit row", async () => {
    setTestSession({ id: fx!.ownerId })

    const result = await recordCheckIn(validPayload())

    expect(result?.serverError).toBeUndefined()
    expect(result?.validationErrors).toBeUndefined()
    expect(result?.data?.attendance.status).toBe("PRESENT")
    expect(result?.data?.checkIn.id).toBeDefined()

    const attendanceId = result?.data?.attendance.id as string
    const checkInId = result?.data?.checkIn.id as string

    const attendance = await db.attendance.findUnique({
      where: {
        userId_classSessionId: {
          userId: fx!.studentId,
          classSessionId: fx!.classSessionId,
        },
      },
      include: { checkIn: true },
    })

    expect(attendance?.id).toBe(attendanceId)
    expect(attendance?.status).toBe("PRESENT")
    expect(attendance?.checkIn?.id).toBe(checkInId)

    const checkIn = await db.checkIn.findUnique({ where: { id: checkInId } })
    expect(checkIn?.userId).toBe(fx!.studentId)
    expect(checkIn?.matchedToAttendanceId).toBe(attendanceId)

    const audits = await db.auditLog.findMany({
      where: {
        organizationId: fx!.organizationId,
        entityType: "CheckIn",
        action: "check_in.recorded",
      },
    })

    expect(audits).toHaveLength(1)
    expect(audits[0].entityType).toBe("CheckIn")
    expect(audits[0].action).toBe("check_in.recorded")
    expect(audits[0].brand).toBe(TEST_BRAND)
    expect(audits[0].organizationId).toBe(fx!.organizationId)
    expect(audits[0].entityId).toBe(checkInId)
    expect(audits[0].userId).toBe(fx!.ownerId)
  })
})
