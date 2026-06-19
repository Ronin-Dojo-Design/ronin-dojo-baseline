/**
 * SESSION_0189 TASK_01 — end-to-end safe-action test for `saveSchedule`.
 *
 * Invokes the next-safe-action-wrapped export through the full `userActionClient`
 * middleware chain (auth + brand + rate-limit + revalidate) using the reusable
 * `installSafeActionMocks` harness. The sibling helper-level tests live in
 * `actions.test.ts`; this file proves the wrapper itself wires up — and is the
 * first wrapped-action test family to prove `result.validationErrors` surfaces
 * correctly through the next-safe-action wrapper.
 *
 * Proves three gates:
 *   (a) unauthenticated short-circuit — no DB write,
 *   (b) Zod validation error — `result.validationErrors` defined, no DB write,
 *   (c) authorized happy path — schedule created + audit row written.
 *
 * Run: cd apps/web && bun test --timeout 120000 \
 *        server/web/schedule/actions.safe-action.test.ts
 *
 * Author: Cody / SESSION_0189 TASK_01.
 */

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

// Install mocks BEFORE any import that touches `~/server`, `~/lib/auth`, etc.
// `mock.module` registers eagerly when this top-level statement runs, and the
// static imports below resolve after this point, so the action module picks up
// the mocked dependencies. Ordering is load-bearing.
installSafeActionMocks({ brand: "BBL" })

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test"

import { saveSchedule } from "~/server/web/schedule/actions"
import { db } from "~/services/db"

const TEST_BRAND = "BBL" as const
const TS = Date.now()
const TAG_PREFIX = "session-0189-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`

type Fixtures = {
  ownerId: string
  organizationId: string
  disciplineId: string
  programId: string
  ownerRoleId: string
  createdOwnerRole: boolean
}

let fx: Fixtures | null = null

beforeAll(async () => {
  const owner = await db.user.create({
    data: { name: tag("owner"), email: `${tag("owner")}@test.local` },
  })

  const discipline = await db.discipline.create({
    data: { brand: TEST_BRAND, name: tag("disc"), slug: tag("disc") },
  })

  // Roles are keyed by (code, brand) — they may already exist from prior runs
  // in this dev DB. Reuse if present; create if not. Cleanup never deletes a
  // role we did not create (we tag `createdOwnerRole`).
  const existingOwnerRole = await db.role.findUnique({
    where: { code_brand: { code: "OWNER", brand: TEST_BRAND } },
  })
  const ownerRole =
    existingOwnerRole ??
    (await db.role.create({
      data: { brand: TEST_BRAND, code: "OWNER", name: tag("OWNER") },
    }))
  const createdOwnerRole = !existingOwnerRole

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

  // Owner membership with OWNER role — passes canEditOrganization.
  const ownerMembership = await db.membership.create({
    data: {
      brand: TEST_BRAND,
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
      brand: TEST_BRAND,
      organizationId: organization.id,
      disciplineId: discipline.id,
      name: tag("program"),
      slug: tag("program"),
      status: "ACTIVE",
    },
  })

  fx = {
    ownerId: owner.id,
    organizationId: organization.id,
    disciplineId: discipline.id,
    programId: program.id,
    ownerRoleId: ownerRole.id,
    createdOwnerRole,
  }
})

beforeEach(async () => {
  if (!fx) return
  // Wipe any AuditLog + ClassSchedule rows from prior cases so each test
  // starts clean. AuditLog cleanup is scoped by userId (not entityType /
  // entityId) because tests can race and we want a stable baseline.
  await db.auditLog.deleteMany({ where: { userId: fx.ownerId } })
  await db.classSchedule.deleteMany({ where: { organizationId: fx.organizationId } })
})

afterAll(async () => {
  if (!fx) return

  // Two-phase teardown (mirrors `actions.test.ts`):
  //   1) Delete this run's specific fixtures (by id, fast, no false positives).
  //   2) Sweep ANY leftover `session-0189-*` rows from this OR earlier crashed
  //      runs in the dev DB so zombie rows don't accumulate.
  //
  // AuditLog has no FK cascade from User and is separately scrubbed.

  // (1) Targeted: this run.
  await db.auditLog.deleteMany({ where: { userId: fx.ownerId } })
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
  await db.user.deleteMany({ where: { id: fx.ownerId } })
  await db.discipline.deleteMany({ where: { id: fx.disciplineId } })
  if (fx.createdOwnerRole) {
    await db.role.deleteMany({ where: { id: fx.ownerRoleId } })
  }

  // (2) Zombie sweep by tag prefix.
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
  // Roles created by this test family use a tagged `name` (e.g.
  // "session-0189-...-OWNER") even when reusing the canonical OWNER code.
  // Only delete tagged roles — never touch system roles whose names don't
  // carry the prefix.
  await db.role.deleteMany({ where: { name: { startsWith: TAG_PREFIX } } })
})

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const validPayload = () => ({
  organizationId: fx!.organizationId,
  programId: fx!.programId,
  disciplineId: fx!.disciplineId,
  name: "session-0189 evening class",
  status: "ACTIVE" as const,
  daysOfWeek: ["MON" as const, "WED" as const, "FRI" as const],
  startTime: "18:00",
  endTime: "19:30",
  timezone: "America/Denver",
})

describe("saveSchedule — safe-action wrapper", () => {
  it("returns serverError 'User not authenticated' when no session is present", async () => {
    setTestSession(null)

    const result = await saveSchedule(validPayload())

    expect(result?.serverError).toBe("User not authenticated")
    expect(result?.data).toBeUndefined()
    expect(await db.classSchedule.count({ where: { organizationId: fx!.organizationId } })).toBe(0)
  })

  it("surfaces validationErrors when the Zod schema rejects the payload", async () => {
    setTestSession({ id: fx!.ownerId })

    const result = await saveSchedule({
      ...validPayload(),
      daysOfWeek: [],
    })

    expect(result?.validationErrors).toBeDefined()
    expect(result?.validationErrors?.daysOfWeek).toBeDefined()
    expect(result?.data).toBeUndefined()
    expect(await db.classSchedule.count({ where: { organizationId: fx!.organizationId } })).toBe(0)
  })

  it("creates the schedule and writes an audit row on the authorized happy path", async () => {
    setTestSession({ id: fx!.ownerId })

    const result = await saveSchedule(validPayload())

    expect(result?.serverError).toBeUndefined()
    expect(result?.validationErrors).toBeUndefined()
    expect(result?.data?.id).toBeTruthy()
    expect(result?.data?.status).toBe("ACTIVE")

    const scheduleId = result?.data?.id as string

    const audits = await db.auditLog.findMany({
      where: {
        userId: fx!.ownerId,
        entityType: "ClassSchedule",
        entityId: scheduleId,
      },
    })
    expect(audits.length).toBe(1)
    expect(audits[0].action).toBe("schedule.created")
    expect(audits[0].entityType).toBe("ClassSchedule")
    expect(audits[0].entityId).toBe(scheduleId)
    expect(audits[0].userId).toBe(fx!.ownerId)
  })
})
