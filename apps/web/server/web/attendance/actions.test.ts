/**
 * SESSION_0032 TASK_02 - action-level proof for attendance gates.
 *
 * Mirrors the SESSION_0031 schedule action tests: real Postgres fixtures, real
 * actions/audit/brand/authz path, and only the request/session/rate-limit seams
 * mocked. Run: cd apps/web && bun test server/web/attendance/actions.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test"

const sessionUserState = { id: "" }
const rateLimitState = { limited: false }
const requestBrand = "BASELINE_MARTIAL_ARTS"

mock.module("next/headers", () => ({
  headers: async () => ({
    get: (key: string) => {
      const k = key.toLowerCase()
      if (k === "x-brand") return requestBrand
      if (k === "host") return "baseline.local"
      return null
    },
  }),
}))

mock.module("next/cache", () => ({
  revalidatePath: () => {},
  updateTag: () => {},
  revalidateTag: () => {},
}))

mock.module("~/lib/auth", () => ({
  getServerSession: async () => ({
    user: { id: sessionUserState.id, role: null, lastActiveBrandId: null },
    session: { id: "attendance-test-session" },
  }),
  auth: {},
}))

mock.module("~/lib/rate-limiter", () => ({
  isRateLimited: async () => rateLimitState.limited,
}))

import { markAttendance, recordCheckIn, voidCheckIn } from "~/server/web/attendance/actions"
import { ATTENDANCE_ERROR } from "~/server/web/attendance/errors"
import { db } from "~/services/db"

const TS = Date.now()
const tag = (name: string) => `attendance-actions-test-${TS}-${name}`

type Fixtures = {
  ownerId: string
  studentId: string
  organizationId: string
  disciplineId: string
  programId: string
  scheduleId: string
  classSessionId: string
}

let fx: Fixtures

const todayUtc = () => {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

const createClassSession = async () => {
  const session = await db.classSession.create({
    data: {
      classScheduleId: fx.scheduleId,
      date: todayUtc(),
      startTime: "17:00",
      endTime: "18:00",
      status: "SCHEDULED",
    },
  })
  fx.classSessionId = session.id
  return session
}

beforeAll(async () => {
  const owner = await db.user.create({
    data: { name: tag("owner"), email: `${tag("owner")}@test.local` },
  })
  const student = await db.user.create({
    data: { name: tag("student"), email: `${tag("student")}@test.local` },
  })

  const discipline = await db.discipline.create({
    data: { brand: requestBrand, name: tag("disc"), slug: tag("disc") },
  })

  const organization = await db.organization.create({
    data: {
      brand: requestBrand,
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
      brand: requestBrand,
      userId: owner.id,
      organizationId: organization.id,
      disciplineId: discipline.id,
      status: "ACTIVE",
      joinedAt: todayUtc(),
    },
  })

  await db.membership.create({
    data: {
      brand: requestBrand,
      userId: student.id,
      organizationId: organization.id,
      disciplineId: discipline.id,
      status: "ACTIVE",
      joinedAt: todayUtc(),
    },
  })

  const program = await db.program.create({
    data: {
      brand: requestBrand,
      organizationId: organization.id,
      disciplineId: discipline.id,
      name: tag("program"),
      slug: tag("program"),
      status: "ACTIVE",
    },
  })

  const schedule = await db.classSchedule.create({
    data: {
      brand: requestBrand,
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

  sessionUserState.id = owner.id
  await createClassSession()
})

afterAll(async () => {
  const TAG_PREFIX = "attendance-actions-test-"

  await db.auditLog.deleteMany({ where: { userId: fx ? fx.ownerId : undefined } })
  await db.checkIn.deleteMany({ where: { userId: fx ? fx.studentId : undefined } })
  if (fx?.scheduleId) {
    await db.attendance.deleteMany({ where: { classSession: { classScheduleId: fx.scheduleId } } })
    await db.classSession.deleteMany({ where: { classScheduleId: fx.scheduleId } })
    await db.classSchedule.deleteMany({ where: { id: fx.scheduleId } })
  }
  if (fx?.programId) {
    await db.program.deleteMany({ where: { id: fx.programId } })
  }
  if (fx?.organizationId) {
    await db.membershipRoleAssignment.deleteMany({
      where: { membership: { organizationId: fx.organizationId } },
    })
    await db.membership.deleteMany({ where: { organizationId: fx.organizationId } })
    await db.organizationDiscipline.deleteMany({ where: { organizationId: fx.organizationId } })
    await db.organization.deleteMany({ where: { id: fx.organizationId } })
  }
  await db.user.deleteMany({ where: { name: { startsWith: TAG_PREFIX } } })
  await db.discipline.deleteMany({ where: { name: { startsWith: TAG_PREFIX } } })

  await db.$disconnect()
})

beforeEach(async () => {
  rateLimitState.limited = false
  sessionUserState.id = fx.ownerId

  await db.auditLog.deleteMany({ where: { userId: fx.ownerId } })
  await db.checkIn.deleteMany({ where: { userId: fx.studentId } })
  await db.attendance.deleteMany({ where: { classSession: { classScheduleId: fx.scheduleId } } })
  await db.classSession.deleteMany({ where: { classScheduleId: fx.scheduleId } })
  await createClassSession()
})

const attendanceRows = () =>
  db.attendance.findMany({
    where: { userId: fx.studentId, classSessionId: fx.classSessionId },
    include: { checkIn: true },
  })

const auditRows = () =>
  db.auditLog.findMany({
    where: { userId: fx.ownerId },
    orderBy: { createdAt: "asc" },
  })

describe("recordCheckIn", () => {
  it("happy path: creates one Attendance, one matched CheckIn, and an audit row", async () => {
    const result = await recordCheckIn({
      classSessionId: fx.classSessionId,
      userId: fx.studentId,
      method: "MANUAL",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.attendance.id).toBeDefined()
    expect(result?.data?.checkIn.id).toBeDefined()

    const rows = await attendanceRows()
    expect(rows.length).toBe(1)
    expect(rows[0].status).toBe("PRESENT")
    expect(rows[0].checkIn?.id).toBe(result?.data?.checkIn.id)

    const audits = await auditRows()
    expect(audits.length).toBe(1)
    expect(audits[0].entityType).toBe("CheckIn")
    expect(audits[0].action).toBe("check_in.recorded")
    expect(audits[0].brand).toBe(requestBrand)
    expect(audits[0].organizationId).toBe(fx.organizationId)
  })

  it("idempotent: duplicate check-in keeps one Attendance and one matched CheckIn", async () => {
    const first = await recordCheckIn({
      classSessionId: fx.classSessionId,
      userId: fx.studentId,
      method: "MANUAL",
    })
    const second = await recordCheckIn({
      classSessionId: fx.classSessionId,
      userId: fx.studentId,
      method: "MANUAL",
    })

    expect(second?.serverError).toBeUndefined()
    expect(second?.data?.attendance.id).toBe(first?.data?.attendance.id)
    expect(second?.data?.checkIn.id).toBe(first?.data?.checkIn.id)

    const rows = await attendanceRows()
    expect(rows.length).toBe(1)
    const checkIns = await db.checkIn.findMany({ where: { userId: fx.studentId } })
    expect(checkIns.length).toBe(1)
  })

  it("rate-limited: returns catalog literal and writes no rows or audit", async () => {
    rateLimitState.limited = true

    const result = await recordCheckIn({
      classSessionId: fx.classSessionId,
      userId: fx.studentId,
      method: "MANUAL",
    })

    expect(result?.serverError).toBe(ATTENDANCE_ERROR.RATE_LIMITED)
    expect(result?.data).toBeUndefined()
    expect(await attendanceRows()).toHaveLength(0)
    expect(await auditRows()).toHaveLength(0)
  })
})

describe("markAttendance", () => {
  it("happy path: marks attendance and writes Attendance audit", async () => {
    const result = await markAttendance({
      classSessionId: fx.classSessionId,
      userId: fx.studentId,
      status: "LATE",
      notes: "Traffic",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.status).toBe("LATE")

    const rows = await attendanceRows()
    expect(rows.length).toBe(1)
    expect(rows[0].notes).toBe("Traffic")

    const audits = await auditRows()
    expect(audits.length).toBe(1)
    expect(audits[0].entityType).toBe("Attendance")
    expect(audits[0].action).toBe("attendance.marked")
  })

  it("rate-limited: returns catalog literal and writes no rows or audit", async () => {
    rateLimitState.limited = true

    const result = await markAttendance({
      classSessionId: fx.classSessionId,
      userId: fx.studentId,
      status: "PRESENT",
    })

    expect(result?.serverError).toBe(ATTENDANCE_ERROR.RATE_LIMITED)
    expect(result?.data).toBeUndefined()
    expect(await attendanceRows()).toHaveLength(0)
    expect(await auditRows()).toHaveLength(0)
  })
})

describe("voidCheckIn", () => {
  it("happy path: unlinks CheckIn, marks attendance NO_SHOW, and writes audit", async () => {
    const checkInResult = await recordCheckIn({
      classSessionId: fx.classSessionId,
      userId: fx.studentId,
      method: "MANUAL",
    })
    const attendanceId = checkInResult?.data?.attendance.id as string
    const checkInId = checkInResult?.data?.checkIn.id as string
    await db.auditLog.deleteMany({ where: { userId: fx.ownerId } })

    const result = await voidCheckIn({
      attendanceId,
      statusAfterVoid: "NO_SHOW",
      notes: "Wrong student",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.status).toBe("NO_SHOW")
    expect(result?.data?.checkIn).toBeNull()

    const checkIn = await db.checkIn.findUnique({ where: { id: checkInId } })
    expect(checkIn?.matchedToAttendanceId).toBeNull()

    const audits = await auditRows()
    expect(audits.length).toBe(1)
    expect(audits[0].entityType).toBe("Attendance")
    expect(audits[0].action).toBe("check_in.voided")
  })

  it("rate-limited: returns catalog literal and does not unlink CheckIn", async () => {
    const checkInResult = await recordCheckIn({
      classSessionId: fx.classSessionId,
      userId: fx.studentId,
      method: "MANUAL",
    })
    const attendanceId = checkInResult?.data?.attendance.id as string
    const checkInId = checkInResult?.data?.checkIn.id as string
    await db.auditLog.deleteMany({ where: { userId: fx.ownerId } })

    rateLimitState.limited = true

    const result = await voidCheckIn({ attendanceId })

    expect(result?.serverError).toBe(ATTENDANCE_ERROR.RATE_LIMITED)
    expect(result?.data).toBeUndefined()

    const checkIn = await db.checkIn.findUnique({ where: { id: checkInId } })
    expect(checkIn?.matchedToAttendanceId).toBe(attendanceId)
    expect(await auditRows()).toHaveLength(0)
  })
})
