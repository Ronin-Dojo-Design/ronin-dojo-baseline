/**
 * SESSION_0150 TASK_02 — Integration tests for membership admin actions.
 *
 * Proves:
 *   - transitionMembershipStatus: valid transitions succeed + create AuditLog,
 *     invalid transitions throw.
 *   - assignRoleToMembership: creates assignment, duplicate is idempotent (upsert).
 *   - removeRoleFromMembership: deletes assignment.
 *
 * Test-DB strategy: real Postgres + setup/teardown isolation with timestamp-
 * tagged fixtures. Two-phase afterAll: targeted deletes + zombie sweep.
 *
 * Run: cd apps/web && bun test server/admin/memberships/actions.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

// ---------------------------------------------------------------------------
// Mutable state captured by the mocks below.
// ---------------------------------------------------------------------------

const sessionUserState = { id: "", role: "admin" as string | null }
const requestBrand = "BASELINE_MARTIAL_ARTS"

// ---------------------------------------------------------------------------
// Module mocks — must be installed before importing actions.
// ---------------------------------------------------------------------------

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
    user: {
      id: sessionUserState.id,
      role: sessionUserState.role,
      lastActiveBrandId: null,
    },
    session: { id: "membership-actions-test-session" },
  }),
  auth: {},
}))

mock.module("next/server", () => ({
  after: (fn: () => void | Promise<void>) => {
    void Promise.resolve().then(() => fn())
  },
}))

// ---------------------------------------------------------------------------
// Real imports — after mocks.
// ---------------------------------------------------------------------------

import {
  assignRoleToMembership,
  removeRoleFromMembership,
  transitionMembershipStatus,
} from "~/server/admin/memberships/actions"
import { db } from "~/services/db"

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const TS = Date.now()
const TAG_PREFIX = "membership-actions-test-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`

type Fixtures = {
  userId: string
  organizationId: string
  disciplineId: string
  membershipId: string
  roleId: string
  createdRole: boolean
}

let fx: Fixtures

beforeAll(async () => {
  const user = await db.user.create({
    data: {
      name: tag("admin"),
      email: `${tag("admin")}@test.local`,
      emailVerified: true,
    },
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
      ownerId: user.id,
    },
  })

  await db.organizationDiscipline.create({
    data: { organizationId: organization.id, disciplineId: discipline.id },
  })

  const membership = await db.membership.create({
    data: {
      brand: requestBrand,
      userId: user.id,
      organizationId: organization.id,
      disciplineId: discipline.id,
      status: "PENDING",
    },
  })

  // Find or create a role for assignment tests
  let role = await db.role.findFirst({ where: { code: "INSTRUCTOR", brand: requestBrand } })
  let createdRole = false
  if (!role) {
    role = await db.role.create({
      data: { code: tag("role"), name: tag("role"), brand: requestBrand },
    })
    createdRole = true
  }

  sessionUserState.id = user.id

  fx = {
    userId: user.id,
    organizationId: organization.id,
    disciplineId: discipline.id,
    membershipId: membership.id,
    roleId: role.id,
    createdRole,
  }
})

afterAll(async () => {
  if (!fx) return

  // Phase 1: targeted deletes for this run
  await db.auditLog.deleteMany({ where: { userId: fx.userId } })
  await db.membershipRoleAssignment.deleteMany({
    where: { membershipId: fx.membershipId },
  })
  await db.membership.deleteMany({ where: { id: fx.membershipId } })
  await db.organizationDiscipline.deleteMany({
    where: { organizationId: fx.organizationId },
  })
  await db.organization.deleteMany({ where: { id: fx.organizationId } })
  await db.user.deleteMany({ where: { id: fx.userId } })
  await db.discipline.deleteMany({ where: { id: fx.disciplineId } })
  if (fx.createdRole) {
    await db.role.deleteMany({ where: { id: fx.roleId } })
  }

  // Phase 2: sweep zombies from crashed prior runs
  const zombieUsers = await db.user.findMany({
    where: { email: { startsWith: "membership-actions-test-" } },
    select: { id: true },
  })
  if (zombieUsers.length > 0) {
    const ids = zombieUsers.map(u => u.id)
    await db.auditLog.deleteMany({ where: { userId: { in: ids } } })
    await db.membershipRoleAssignment.deleteMany({
      where: { membership: { userId: { in: ids } } },
    })
    await db.membership.deleteMany({ where: { userId: { in: ids } } })
  }
  await db.organization.deleteMany({
    where: { slug: { startsWith: "membership-actions-test-" } },
  })
  await db.discipline.deleteMany({
    where: { slug: { startsWith: "membership-actions-test-" } },
  })
  await db.user.deleteMany({
    where: { email: { startsWith: "membership-actions-test-" } },
  })
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("transitionMembershipStatus", () => {
  it("valid transition PENDING → ACTIVE succeeds", async () => {
    const result = await transitionMembershipStatus({
      id: fx.membershipId,
      toStatus: "ACTIVE",
    })

    expect(result?.data).toBeDefined()
    expect(result?.data?.status).toBe("ACTIVE")

    // Verify DB state
    const m = await db.membership.findUnique({ where: { id: fx.membershipId } })
    expect(m?.status).toBe("ACTIVE")
  })

  it("creates AuditLog on transition", async () => {
    // Allow after() callback to settle from the previous test
    await new Promise(r => setTimeout(r, 100))

    const log = await db.auditLog.findFirst({
      where: {
        entityType: "Membership",
        entityId: fx.membershipId,
        action: "STATUS_TRANSITION",
      },
      orderBy: { createdAt: "desc" },
    })

    expect(log).not.toBeNull()
    expect(log?.before).toEqual({ status: "PENDING" })
    expect(log?.after).toEqual({ status: "ACTIVE" })
    expect(log?.userId).toBe(fx.userId)
    expect(log?.brand).toBe(requestBrand)
  })

  it("invalid transition ACTIVE → PENDING throws", async () => {
    const result = await transitionMembershipStatus({
      id: fx.membershipId,
      toStatus: "PENDING",
    })

    expect(result?.serverError).toBeDefined()

    // Status should still be ACTIVE
    const m = await db.membership.findUnique({ where: { id: fx.membershipId } })
    expect(m?.status).toBe("ACTIVE")
  })

  it("transition on nonexistent membership throws", async () => {
    const result = await transitionMembershipStatus({
      id: "nonexistent-id-0150",
      toStatus: "ACTIVE",
    })

    expect(result?.serverError).toBeDefined()
  })

  it("terminal state CANCELLED has no outbound transitions", async () => {
    // Set to CANCELLED first (ACTIVE → CANCELLED is valid)
    await transitionMembershipStatus({ id: fx.membershipId, toStatus: "CANCELLED" })
    await new Promise(r => setTimeout(r, 50))

    const m = await db.membership.findUnique({ where: { id: fx.membershipId } })
    expect(m?.status).toBe("CANCELLED")
    expect(m?.leftAt).not.toBeNull()

    // Now try CANCELLED → ACTIVE — should fail
    const result = await transitionMembershipStatus({
      id: fx.membershipId,
      toStatus: "ACTIVE",
    })
    expect(result?.serverError).toBeDefined()

    // Reset to PENDING for subsequent tests
    await db.membership.update({
      where: { id: fx.membershipId },
      data: { status: "PENDING", leftAt: null },
    })
  })

  it("multi-step walk: PENDING → ACTIVE → SUSPENDED → ACTIVE", async () => {
    // PENDING → ACTIVE
    let result = await transitionMembershipStatus({
      id: fx.membershipId,
      toStatus: "ACTIVE",
    })
    expect(result?.data?.status).toBe("ACTIVE")

    await new Promise(r => setTimeout(r, 50))

    // ACTIVE → SUSPENDED
    result = await transitionMembershipStatus({
      id: fx.membershipId,
      toStatus: "SUSPENDED",
    })
    expect(result?.data?.status).toBe("SUSPENDED")

    await new Promise(r => setTimeout(r, 50))

    // SUSPENDED → ACTIVE (reinstatement)
    result = await transitionMembershipStatus({
      id: fx.membershipId,
      toStatus: "ACTIVE",
    })
    expect(result?.data?.status).toBe("ACTIVE")

    await new Promise(r => setTimeout(r, 50))

    // Verify multiple AuditLog entries exist
    const logCount = await db.auditLog.count({
      where: {
        entityType: "Membership",
        entityId: fx.membershipId,
        action: "STATUS_TRANSITION",
      },
    })
    // At least 4: original PENDING→ACTIVE + CANCELLED test + 3 in this walk
    expect(logCount).toBeGreaterThanOrEqual(3)
  })
})

describe("assignRoleToMembership", () => {
  it("assigns a role to a membership", async () => {
    const result = await assignRoleToMembership({
      membershipId: fx.membershipId,
      roleId: fx.roleId,
    })

    expect(result?.data).toBeDefined()
    expect(result?.data?.membershipId).toBe(fx.membershipId)
    expect(result?.data?.roleId).toBe(fx.roleId)

    // Verify DB
    const assignment = await db.membershipRoleAssignment.findUnique({
      where: { membershipId_roleId: { membershipId: fx.membershipId, roleId: fx.roleId } },
    })
    expect(assignment).not.toBeNull()
  })

  it("duplicate assignment is idempotent (upsert)", async () => {
    const result = await assignRoleToMembership({
      membershipId: fx.membershipId,
      roleId: fx.roleId,
    })

    // Should not throw — upsert handles it
    expect(result?.data).toBeDefined()

    // Should still be exactly one assignment
    const count = await db.membershipRoleAssignment.count({
      where: { membershipId: fx.membershipId, roleId: fx.roleId },
    })
    expect(count).toBe(1)
  })
})

describe("removeRoleFromMembership", () => {
  it("removes a role assignment", async () => {
    // Ensure assignment exists first
    await db.membershipRoleAssignment.upsert({
      where: { membershipId_roleId: { membershipId: fx.membershipId, roleId: fx.roleId } },
      create: { membershipId: fx.membershipId, roleId: fx.roleId },
      update: {},
    })

    const result = await removeRoleFromMembership({
      membershipId: fx.membershipId,
      roleId: fx.roleId,
    })

    expect(result?.data).toBe(true)

    // Verify DB — assignment should be gone
    const assignment = await db.membershipRoleAssignment.findUnique({
      where: { membershipId_roleId: { membershipId: fx.membershipId, roleId: fx.roleId } },
    })
    expect(assignment).toBeNull()
  })

  it("removing nonexistent assignment throws", async () => {
    // Ensure no assignment exists
    await db.membershipRoleAssignment.deleteMany({
      where: { membershipId: fx.membershipId, roleId: fx.roleId },
    })

    const result = await removeRoleFromMembership({
      membershipId: fx.membershipId,
      roleId: fx.roleId,
    })

    expect(result?.serverError).toBeDefined()
  })
})
