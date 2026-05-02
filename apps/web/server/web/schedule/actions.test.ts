/**
 * SESSION_0031.5 TASK_02 — Action-level proof of gates 4 + 9.
 *
 * Drives `saveSchedule`, `assignInstructor`, and `archiveSchedule` against a
 * real Postgres dev DB (per OD-4: real DB, not a mock). Two cases per action:
 *   - Happy path: action succeeds and writes an `AuditLog` row with the
 *     canonical `entityType` + `action` strings (gate 9 proof).
 *   - Rate-limited path: `isRateLimited` is mocked to `true`; action throws
 *     the literal `SCHEDULE_ERROR.RATE_LIMITED` from the catalog (gate 4 +
 *     gate 8 proof) and writes no AuditLog.
 *
 * Test-DB strategy: real Postgres + setup/teardown isolation. The actions use
 * the singleton `db` from `~/services/db`, so a tx-rollback wrapper would not
 * scope writes inside the action. Instead, `beforeAll` creates a self-
 * contained fixture set with timestamp-suffixed slugs/emails; `afterAll`
 * deletes the fixtures (cascade handles dependents); `afterEach` clears any
 * per-test AuditLog rows so happy-path / rate-limited assertions don't see
 * each other's writes. End-to-end runtime budget < 5s.
 *
 * Mocking surface (smallest seam that keeps the action stack honest):
 *   - `~/lib/auth.getServerSession` — returns a fake session for our test
 *     user; this is the *only* auth surface the safe-action client touches.
 *   - `next/headers.headers` — returns `x-brand` matching our fixtures.
 *   - `next/cache.revalidatePath` / `updateTag` — no-ops; the action stack
 *     calls them after success and they require a Next request context.
 *   - `~/lib/rate-limiter.isRateLimited` — backed by a mutable boolean so each
 *     test can flip it without re-mocking the module.
 *
 * The DB, the action handlers, the brand-context resolver, the audit writer,
 * the safe-action middleware, the error catalog — all real.
 *
 * Run: cd apps/web && bun test server/web/schedule/actions.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test"

// -----------------------------------------------------------------------------
// Mutable state captured by the mocks below.
// -----------------------------------------------------------------------------

const sessionUserState = { id: "" }
const rateLimitState = { limited: false }
const requestBrand = "BASELINE_MARTIAL_ARTS"

// -----------------------------------------------------------------------------
// Module mocks — must be installed before importing `actions.ts`.
// -----------------------------------------------------------------------------

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
    session: { id: "test-session" },
  }),
  auth: {},
}))

mock.module("~/lib/rate-limiter", () => ({
  isRateLimited: async () => rateLimitState.limited,
}))

// -----------------------------------------------------------------------------
// Real imports happen *after* the mocks are registered.
// -----------------------------------------------------------------------------

import { db } from "~/services/db"
import { archiveSchedule, assignInstructor, saveSchedule } from "~/server/web/schedule/actions"
import { SCHEDULE_ERROR } from "~/server/web/schedule/errors"

// -----------------------------------------------------------------------------
// Fixture set — created once, deleted once.
// -----------------------------------------------------------------------------

const TS = Date.now()
const tag = (name: string) => `actions-test-${TS}-${name}`

type Fixtures = {
  userId: string
  instructorUserId: string
  organizationId: string
  programId: string
  disciplineId: string
  ownerRoleId: string
  instructorRoleId: string
  createdOwnerRole: boolean
  createdInstructorRole: boolean
}

let fx: Fixtures

beforeAll(async () => {
  const owner = await db.user.create({
    data: { name: tag("owner"), email: `${tag("owner")}@test.local` },
  })
  const instructor = await db.user.create({
    data: { name: tag("instructor"), email: `${tag("instructor")}@test.local` },
  })

  const discipline = await db.discipline.create({
    data: { brand: requestBrand, name: tag("disc"), slug: tag("disc") },
  })

  // Roles are keyed by (code, brand) — they may already exist from prior smoke
  // runs in this dev DB. Reuse if present; create if not. Cleanup never deletes
  // a role we did not create (we tag `createdOwnerRole`/`createdInstructorRole`).
  const existingOwnerRole = await db.role.findUnique({
    where: { code_brand: { code: "OWNER", brand: requestBrand } },
  })
  const ownerRole =
    existingOwnerRole ??
    (await db.role.create({
      data: { brand: requestBrand, code: "OWNER", name: tag("OWNER") },
    }))
  const createdOwnerRole = !existingOwnerRole

  const existingInstructorRole = await db.role.findUnique({
    where: { code_brand: { code: "INSTRUCTOR", brand: requestBrand } },
  })
  const instructorRole =
    existingInstructorRole ??
    (await db.role.create({
      data: { brand: requestBrand, code: "INSTRUCTOR", name: tag("INSTRUCTOR") },
    }))
  const createdInstructorRole = !existingInstructorRole

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

  // Owner membership with OWNER role — passes canEditOrganization.
  const ownerMembership = await db.membership.create({
    data: {
      brand: requestBrand,
      userId: owner.id,
      organizationId: organization.id,
      disciplineId: discipline.id,
      status: "ACTIVE",
      joinedAt: new Date(),
    },
  })
  await db.membershipRoleAssignment.create({
    data: { membershipId: ownerMembership.id, roleId: ownerRole.id },
  })

  // Instructor membership — passes the gate 5 instructor selector predicate.
  const instructorMembership = await db.membership.create({
    data: {
      brand: requestBrand,
      userId: instructor.id,
      organizationId: organization.id,
      disciplineId: discipline.id,
      status: "ACTIVE",
      joinedAt: new Date(),
    },
  })
  await db.membershipRoleAssignment.create({
    data: { membershipId: instructorMembership.id, roleId: instructorRole.id },
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

  fx = {
    userId: owner.id,
    instructorUserId: instructor.id,
    organizationId: organization.id,
    programId: program.id,
    disciplineId: discipline.id,
    ownerRoleId: ownerRole.id,
    instructorRoleId: instructorRole.id,
    createdOwnerRole,
    createdInstructorRole,
  }

  sessionUserState.id = owner.id
})

afterAll(async () => {
  // Two-phase teardown:
  //   1) Delete this run's specific fixtures (by id, fast, no false positives).
  //   2) Sweep ANY leftover `actions-test-*` rows from this OR earlier crashed
  //      runs in the dev DB. Without (2), zombie rows accumulate and break the
  //      smoke script + future test reruns. Cascade order: assignments first,
  //      then schedules / memberships, then orgs / disciplines / programs,
  //      then users / roles. AuditLog has no FK cascade from User and is
  //      separately scrubbed.
  const TAG_PREFIX = "actions-test-"

  if (fx) {
    await db.auditLog.deleteMany({ where: { userId: { in: [fx.userId, fx.instructorUserId] } } })
  }

  // (1) Targeted: this run.
  if (fx) {
    await db.classInstructorAssignment.deleteMany({
      where: { classSchedule: { organizationId: fx.organizationId } },
    })
    await db.classSchedule.deleteMany({ where: { organizationId: fx.organizationId } })
    await db.membershipRoleAssignment.deleteMany({
      where: { membership: { organizationId: fx.organizationId } },
    })
    await db.membership.deleteMany({ where: { organizationId: fx.organizationId } })
    await db.organizationDiscipline.deleteMany({
      where: { organizationId: fx.organizationId },
    })
    await db.program.deleteMany({ where: { id: fx.programId } })
    await db.organization.deleteMany({ where: { id: fx.organizationId } })
    await db.user.deleteMany({ where: { id: { in: [fx.userId, fx.instructorUserId] } } })
    await db.discipline.deleteMany({ where: { id: fx.disciplineId } })
    const rolesToDelete: string[] = []
    if (fx.createdOwnerRole) rolesToDelete.push(fx.ownerRoleId)
    if (fx.createdInstructorRole) rolesToDelete.push(fx.instructorRoleId)
    if (rolesToDelete.length > 0) {
      await db.role.deleteMany({ where: { id: { in: rolesToDelete } } })
    }
  }

  // (2) Sweep: any zombie `actions-test-*` rows left by prior crashed runs.
  //     Order matters — leaves before edges before nodes.
  const zombieOrgs = await db.organization.findMany({
    where: { name: { startsWith: TAG_PREFIX } },
    select: { id: true },
  })
  const zombieOrgIds = zombieOrgs.map(o => o.id)

  const zombieUsers = await db.user.findMany({
    where: { name: { startsWith: TAG_PREFIX } },
    select: { id: true },
  })
  const zombieUserIds = zombieUsers.map(u => u.id)

  if (zombieUserIds.length > 0) {
    await db.auditLog.deleteMany({ where: { userId: { in: zombieUserIds } } })
  }
  if (zombieOrgIds.length > 0) {
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
  // Roles created by this test family use a tagged `name` (e.g. "actions-test-...-OWNER")
  // even when reusing canonical OWNER/INSTRUCTOR codes. Only delete tagged roles
  // — never touch system roles whose names don't carry the prefix.
  await db.role.deleteMany({ where: { name: { startsWith: TAG_PREFIX } } })

  await db.$disconnect()
})

beforeEach(async () => {
  rateLimitState.limited = false
  // Wipe any AuditLog rows from prior cases so each test starts clean.
  await db.auditLog.deleteMany({ where: { userId: { in: [fx.userId, fx.instructorUserId] } } })
  // Wipe any schedules created by prior cases.
  await db.classSchedule.deleteMany({ where: { organizationId: fx.organizationId } })
})

afterEach(async () => {
  rateLimitState.limited = false
})

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const baseSavePayload = () => ({
  organizationId: fx.organizationId,
  programId: fx.programId,
  disciplineId: fx.disciplineId,
  name: tag("schedule"),
  status: "ACTIVE" as const,
  daysOfWeek: ["MON" as const, "WED" as const],
  startTime: "17:00",
  endTime: "18:00",
  timezone: "America/Denver",
})

const auditRowsForSchedule = async (entityId: string) =>
  db.auditLog.findMany({
    where: { userId: fx.userId, entityType: "ClassSchedule", entityId },
  })

const auditRowsForAssignment = async (entityId: string) =>
  db.auditLog.findMany({
    where: { userId: fx.userId, entityType: "ClassInstructorAssignment", entityId },
  })

const allAuditRows = async () =>
  db.auditLog.findMany({ where: { userId: { in: [fx.userId, fx.instructorUserId] } } })

// -----------------------------------------------------------------------------
// saveSchedule
// -----------------------------------------------------------------------------

describe("saveSchedule", () => {
  it("happy path: creates schedule and writes AuditLog with entityType=ClassSchedule action=schedule.created", async () => {
    const result = await saveSchedule(baseSavePayload())

    expect(result?.serverError).toBeUndefined()
    expect(result?.validationErrors).toBeUndefined()
    expect(result?.data?.id).toBeDefined()

    const scheduleId = result?.data?.id as string
    const audits = await auditRowsForSchedule(scheduleId)
    expect(audits.length).toBe(1)
    expect(audits[0].entityType).toBe("ClassSchedule")
    expect(audits[0].action).toBe("schedule.created")
    expect(audits[0].brand).toBe(requestBrand)
    expect(audits[0].organizationId).toBe(fx.organizationId)
  })

  it("rate-limited: throws literal SCHEDULE_ERROR.RATE_LIMITED and writes no AuditLog", async () => {
    rateLimitState.limited = true

    const result = await saveSchedule(baseSavePayload())

    expect(result?.serverError).toBe(SCHEDULE_ERROR.RATE_LIMITED)
    expect(result?.data).toBeUndefined()

    const audits = await allAuditRows()
    expect(audits.length).toBe(0)
  })
})

// -----------------------------------------------------------------------------
// assignInstructor
// -----------------------------------------------------------------------------

describe("assignInstructor", () => {
  it("happy path: creates assignment and writes AuditLog with entityType=ClassInstructorAssignment action=instructor.assigned", async () => {
    // Seed: schedule the assignment will attach to.
    const created = await saveSchedule(baseSavePayload())
    const scheduleId = created?.data?.id as string
    expect(scheduleId).toBeDefined()
    // Clear the schedule.created audit so we only assert the assignment row below.
    await db.auditLog.deleteMany({
      where: { userId: fx.userId, entityType: "ClassSchedule", entityId: scheduleId },
    })

    const result = await assignInstructor({
      classScheduleId: scheduleId,
      userId: fx.instructorUserId,
      isPrimary: true,
      displayTitle: "Lead Coach",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.validationErrors).toBeUndefined()
    expect(result?.data?.id).toBeDefined()

    const assignmentId = result?.data?.id as string
    const audits = await auditRowsForAssignment(assignmentId)
    expect(audits.length).toBe(1)
    expect(audits[0].entityType).toBe("ClassInstructorAssignment")
    expect(audits[0].action).toBe("instructor.assigned")
    expect(audits[0].brand).toBe(requestBrand)
  })

  it("rate-limited: throws literal SCHEDULE_ERROR.RATE_LIMITED and writes no AuditLog", async () => {
    // Pre-seed schedule so we know the rate-limit guard fires *before* the DB
    // lookup, not because of input shape errors.
    rateLimitState.limited = false
    const created = await saveSchedule(baseSavePayload())
    const scheduleId = created?.data?.id as string
    expect(scheduleId).toBeDefined()
    await db.auditLog.deleteMany({ where: { userId: fx.userId } })

    rateLimitState.limited = true

    const result = await assignInstructor({
      classScheduleId: scheduleId,
      userId: fx.instructorUserId,
      isPrimary: false,
    })

    expect(result?.serverError).toBe(SCHEDULE_ERROR.RATE_LIMITED)
    expect(result?.data).toBeUndefined()

    const audits = await allAuditRows()
    expect(audits.length).toBe(0)
  })
})

// -----------------------------------------------------------------------------
// archiveSchedule
// -----------------------------------------------------------------------------

describe("archiveSchedule", () => {
  it("happy path: archives schedule and writes AuditLog with entityType=ClassSchedule action=schedule.archived", async () => {
    const created = await saveSchedule(baseSavePayload())
    const scheduleId = created?.data?.id as string
    expect(scheduleId).toBeDefined()
    await db.auditLog.deleteMany({
      where: { userId: fx.userId, entityType: "ClassSchedule", entityId: scheduleId },
    })

    const result = await archiveSchedule({ id: scheduleId })

    expect(result?.serverError).toBeUndefined()
    expect(result?.validationErrors).toBeUndefined()
    expect(result?.data?.id).toBe(scheduleId)
    expect(result?.data?.status).toBe("ARCHIVED")

    const audits = await auditRowsForSchedule(scheduleId)
    expect(audits.length).toBe(1)
    expect(audits[0].entityType).toBe("ClassSchedule")
    expect(audits[0].action).toBe("schedule.archived")
    expect(audits[0].brand).toBe(requestBrand)
  })

  it("rate-limited: throws literal SCHEDULE_ERROR.RATE_LIMITED and writes no AuditLog", async () => {
    rateLimitState.limited = false
    const created = await saveSchedule(baseSavePayload())
    const scheduleId = created?.data?.id as string
    expect(scheduleId).toBeDefined()
    await db.auditLog.deleteMany({ where: { userId: fx.userId } })

    rateLimitState.limited = true

    const result = await archiveSchedule({ id: scheduleId })

    expect(result?.serverError).toBe(SCHEDULE_ERROR.RATE_LIMITED)
    expect(result?.data).toBeUndefined()

    const audits = await allAuditRows()
    expect(audits.length).toBe(0)
  })
})
