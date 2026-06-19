/**
 * SESSION_0031.5 TASK_06 part B — Concurrency proof for `materializeSchedule`.
 *
 * Concurrency-safe via the unique constraint on `(classScheduleId, date)` plus
 * the catch-and-rethrow in `materializeSchedule`. This test fires two parallel
 * `materializeSchedule` calls against the real Postgres dev DB and asserts:
 *   - Total `ClassSession` row count for `(classScheduleId === scheduleId)`
 *     matches the single-call expected count (no duplicates).
 *   - No duplicate `(classScheduleId, date)` rows — every group on `date` has
 *     count 1.
 *   - No exceptions surface to either caller. (One internal unique violation
 *     followed by a catch/converge is fine; the public surface stays clean.)
 *
 * Test-DB strategy mirrors `actions.test.ts`: real Postgres + setup/teardown
 * isolation with `actions-test-*` timestamp-tagged fixtures. Two-phase
 * `afterAll` (targeted deletes for this run + sweep of any zombie rows) so
 * reruns are idempotent.
 *
 * Run: cd apps/web && bun test server/web/schedule/materialize.concurrency.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

// -----------------------------------------------------------------------------
// Mutable state captured by the mocks below.
// -----------------------------------------------------------------------------

const sessionUserState = { id: "" }
const rateLimitState = { limited: false }
const requestBrand = "BBL"

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

import { materializeSchedule } from "~/server/web/schedule/actions"
import { db } from "~/services/db"

// -----------------------------------------------------------------------------
// Fixture set
// -----------------------------------------------------------------------------

const TS = Date.now()
const tag = (name: string) => `actions-test-${TS}-${name}`

type Fixtures = {
  userId: string
  organizationId: string
  programId: string
  disciplineId: string
  scheduleId: string
  ownerRoleId: string
  createdOwnerRole: boolean
}

let fx: Fixtures

const utc = (iso: string) => new Date(`${iso}T00:00:00.000Z`)

// Window: 2026-05-04 (Mon) → 2026-05-25 (Mon). 4 Mondays inclusive.
const WINDOW_START = utc("2026-05-04")
const WINDOW_END = utc("2026-05-25")
const EXPECTED_SESSIONS_SINGLE_CALL = 4

beforeAll(async () => {
  const owner = await db.user.create({
    data: { name: tag("owner"), email: `${tag("owner")}@test.local` },
  })

  const discipline = await db.discipline.create({
    data: { brand: requestBrand, name: tag("disc"), slug: tag("disc") },
  })

  const existingOwnerRole = await db.role.findUnique({
    where: { code_brand: { code: "OWNER", brand: requestBrand } },
  })
  const ownerRole =
    existingOwnerRole ??
    (await db.role.create({
      data: { brand: requestBrand, code: "OWNER", name: tag("OWNER") },
    }))
  const createdOwnerRole = !existingOwnerRole

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
      status: "ACTIVE",
      daysOfWeek: ["MON"],
      startTime: "17:00",
      endTime: "18:00",
      timezone: "America/Denver",
      effectiveFrom: WINDOW_START,
      effectiveTo: WINDOW_END,
    },
  })

  fx = {
    userId: owner.id,
    organizationId: organization.id,
    programId: program.id,
    disciplineId: discipline.id,
    scheduleId: schedule.id,
    ownerRoleId: ownerRole.id,
    createdOwnerRole,
  }

  sessionUserState.id = owner.id
})

afterAll(async () => {
  // Two-phase teardown matching actions.test.ts: targeted + sweep.
  const TAG_PREFIX = "actions-test-"

  if (fx) {
    await db.auditLog.deleteMany({ where: { userId: fx.userId } })
    await db.classSession.deleteMany({ where: { classScheduleId: fx.scheduleId } })
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
    await db.user.deleteMany({ where: { id: fx.userId } })
    await db.discipline.deleteMany({ where: { id: fx.disciplineId } })
    if (fx.createdOwnerRole) {
      await db.role.deleteMany({ where: { id: fx.ownerRoleId } })
    }
  }

  // Sweep zombie rows (matches actions.test.ts strategy).
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
  await db.role.deleteMany({ where: { name: { startsWith: TAG_PREFIX } } })

  await db.$disconnect()
})

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("materializeSchedule — concurrency", () => {
  it("two parallel calls produce no duplicate (classScheduleId, date) rows", async () => {
    rateLimitState.limited = false

    const [resultA, resultB] = await Promise.all([
      materializeSchedule({
        id: fx.scheduleId,
        windowStart: WINDOW_START,
        windowEnd: WINDOW_END,
      }),
      materializeSchedule({
        id: fx.scheduleId,
        windowStart: WINDOW_START,
        windowEnd: WINDOW_END,
      }),
    ])

    // Public surface: neither caller saw an exception. One of the two may have
    // been the loser of the unique-constraint race and produced
    // SCHEDULE_ERROR.UNEXPECTED_ERROR (caught + converted). The other must have
    // succeeded. We only require that any error visible to the caller is the
    // catalog string, NOT a leaked Prisma message.
    const surfaceErrors = [resultA?.serverError, resultB?.serverError].filter(
      (e): e is string => typeof e === "string",
    )
    for (const err of surfaceErrors) {
      // Catalog values are short uppercase tokens; Prisma errors leak words
      // like "Unique constraint", "PrismaClientKnownRequestError", model names.
      expect(err).not.toMatch(/Unique constraint|PrismaClient|classScheduleId_date/)
    }
    // At least one of the two callers must have succeeded.
    expect(resultA?.data || resultB?.data).toBeDefined()

    // Total session count matches single-call expected count.
    const total = await db.classSession.count({
      where: { classScheduleId: fx.scheduleId },
    })
    expect(total).toBe(EXPECTED_SESSIONS_SINGLE_CALL)

    // No duplicate (classScheduleId, date) rows — group by date and assert each
    // group has count 1.
    const grouped = await db.classSession.groupBy({
      by: ["date"],
      where: { classScheduleId: fx.scheduleId },
      _count: { _all: true },
    })
    expect(grouped.length).toBe(EXPECTED_SESSIONS_SINGLE_CALL)
    for (const row of grouped) {
      expect(row._count._all).toBe(1)
    }
  })
})
