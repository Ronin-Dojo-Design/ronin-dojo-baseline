/**
 * SESSION_0301 TASK_01 — Org management safe-action test suite.
 *
 * Run: cd apps/web && bun test server/web/organization/org-management.safe-action.test.ts
 *
 * Proves that all 6 org management actions enforce auth, cross-org rejection,
 * and happy-path behavior through the full safe-action middleware chain.
 *
 * Actions under test:
 *   - transitionOrgMembershipStatus (membership-actions.ts)
 *   - assignOrgRole (membership-actions.ts)
 *   - removeOrgRole (membership-actions.ts)
 *   - rejectOrgJoinRequest (membership-actions.ts)
 *   - createOrgInvite (invite-actions.ts)
 *   - revokeOrgInvite (invite-actions.ts)
 *
 * Author: Cody / SESSION_0301 TASK_01.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test"

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BBL" })

import { db } from "~/services/db"

// Single-brand collapse (brand-prune Stage 1): the action scopes by the
// server-resolved Brand.BBL, so seed under BBL too (seed == filter).
const TEST_BRAND = "BBL" as const
const PREFIX = `s0301-org-${Date.now()}`

// Fixture IDs
let ownerUserId = ""
let otherUserId = ""
let orgId = ""
let _otherOrgId = ""
let disciplineId = ""
let membershipId = ""
let pendingMembershipId = ""
let systemRoleId = ""

beforeAll(async () => {
  // --- Owner user (org admin via ownership) ---
  const owner = await db.user.create({
    data: {
      id: `${PREFIX}-owner`,
      name: "Owner 0301",
      email: `${PREFIX}-owner@test.local`,
      role: "user",
      emailVerified: true,
    },
  })
  ownerUserId = owner.id

  // --- Other user (not in org) ---
  const other = await db.user.create({
    data: {
      id: `${PREFIX}-other`,
      name: "Other 0301",
      email: `${PREFIX}-other@test.local`,
      role: "user",
      emailVerified: true,
    },
  })
  otherUserId = other.id

  // --- Discipline ---
  const discipline = await db.discipline.create({
    data: {
      id: `${PREFIX}-disc`,
      brand: TEST_BRAND,
      name: `${PREFIX}-discipline`,
      slug: `${PREFIX}-disc`,
    },
  })
  disciplineId = discipline.id

  // --- Primary org (owned by owner) ---
  const org = await db.organization.create({
    data: {
      id: `${PREFIX}-org`,
      brand: TEST_BRAND,
      name: "Test Org 0301",
      slug: `${PREFIX}-org`,
      ownerId: ownerUserId,
    },
  })
  orgId = org.id

  // --- Other org (for cross-org tests) ---
  const otherOrg = await db.organization.create({
    data: {
      id: `${PREFIX}-org2`,
      brand: TEST_BRAND,
      name: "Other Org 0301",
      slug: `${PREFIX}-org2`,
      ownerId: otherUserId,
    },
  })
  _otherOrgId = otherOrg.id

  // --- OrganizationDiscipline link ---
  await db.organizationDiscipline.create({
    data: {
      organizationId: orgId,
      disciplineId,
    },
  })

  // --- ACTIVE membership for role tests (owner's member in org) ---
  const membership = await db.membership.create({
    data: {
      id: `${PREFIX}-mem`,
      brand: TEST_BRAND,
      userId: otherUserId,
      organizationId: orgId,
      disciplineId,
      status: "ACTIVE",
      version: 1,
    },
  })
  membershipId = membership.id

  // --- PENDING membership for transition + reject tests ---
  const pendingMembership = await db.membership.create({
    data: {
      id: `${PREFIX}-mem-pending`,
      brand: TEST_BRAND,
      userId: ownerUserId,
      organizationId: orgId,
      disciplineId,
      status: "PENDING",
      version: 1,
    },
  })
  pendingMembershipId = pendingMembership.id

  // --- System role for assign/remove tests ---
  const role = await db.role.create({
    data: {
      id: `${PREFIX}-role`,
      brand: TEST_BRAND,
      name: `${PREFIX}-role`,
      code: `${PREFIX}-ROLE`,
      isSystem: true,
    },
  })
  systemRoleId = role.id
})

afterAll(async () => {
  // Cascade-aware teardown
  await db.auditLog.deleteMany({ where: { entityId: { startsWith: PREFIX } } })
  await db.membershipRoleAssignment.deleteMany({
    where: { membershipId: { startsWith: PREFIX } },
  })
  await db.invite.deleteMany({ where: { organizationId: { startsWith: PREFIX } } })
  // Re-create pending membership if it was deleted by reject test
  await db.membership.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.organizationDiscipline.deleteMany({
    where: { organizationId: { startsWith: PREFIX } },
  })
  await db.organization.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.user.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.discipline.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.role.deleteMany({ where: { id: { startsWith: PREFIX } } })
  // reject discipline cleaned up by the discipline deleteMany above
})

beforeEach(() => {
  setTestSession({ id: ownerUserId, role: "user" })
})

// ─── transitionOrgMembershipStatus ───────────────────────────────────────

describe("transitionOrgMembershipStatus", () => {
  it("rejects unauthenticated callers", async () => {
    const { transitionOrgMembershipStatus } =
      await import("~/server/web/organization/membership-actions")
    setTestSession(null)

    const result = await transitionOrgMembershipStatus({
      organizationId: orgId,
      membershipId: pendingMembershipId,
      toStatus: "ACTIVE",
    })

    expect(result?.serverError).toBeDefined()
  })

  it("rejects cross-org access", async () => {
    const { transitionOrgMembershipStatus } =
      await import("~/server/web/organization/membership-actions")
    // otherUserId owns otherOrg, try to transition a membership in orgId
    setTestSession({ id: otherUserId, role: "user" })

    const result = await transitionOrgMembershipStatus({
      organizationId: orgId,
      membershipId: pendingMembershipId,
      toStatus: "ACTIVE",
    })

    expect(result?.serverError).toBeDefined()
  })

  it("happy path: transitions PENDING → ACTIVE", async () => {
    const { transitionOrgMembershipStatus } =
      await import("~/server/web/organization/membership-actions")

    const result = await transitionOrgMembershipStatus({
      organizationId: orgId,
      membershipId: pendingMembershipId,
      toStatus: "ACTIVE",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data).toBeDefined()
    expect(result!.data!.status).toBe("ACTIVE")

    // Reset for other tests
    await db.membership.update({
      where: { id: pendingMembershipId },
      data: { status: "PENDING", version: { increment: 1 } },
    })
  })
})

// ─── assignOrgRole ───────────────────────────────────────────────────────

describe("assignOrgRole", () => {
  it("rejects unauthenticated callers", async () => {
    const { assignOrgRole } = await import("~/server/web/organization/membership-actions")
    setTestSession(null)

    const result = await assignOrgRole({
      organizationId: orgId,
      membershipId: membershipId,
      roleId: systemRoleId,
    })

    expect(result?.serverError).toBeDefined()
  })

  it("rejects cross-org access", async () => {
    const { assignOrgRole } = await import("~/server/web/organization/membership-actions")
    setTestSession({ id: otherUserId, role: "user" })

    const result = await assignOrgRole({
      organizationId: orgId,
      membershipId: membershipId,
      roleId: systemRoleId,
    })

    expect(result?.serverError).toBeDefined()
  })

  it("happy path: assigns a system role", async () => {
    const { assignOrgRole } = await import("~/server/web/organization/membership-actions")

    const result = await assignOrgRole({
      organizationId: orgId,
      membershipId: membershipId,
      roleId: systemRoleId,
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data).toBeDefined()
    expect(result!.data!.membershipId).toBe(membershipId)
    expect(result!.data!.roleId).toBe(systemRoleId)

    // Clean up assignment
    await db.membershipRoleAssignment.deleteMany({
      where: { membershipId, roleId: systemRoleId },
    })
  })
})

// ─── removeOrgRole ───────────────────────────────────────────────────────

describe("removeOrgRole", () => {
  it("rejects unauthenticated callers", async () => {
    const { removeOrgRole } = await import("~/server/web/organization/membership-actions")
    setTestSession(null)

    const result = await removeOrgRole({
      organizationId: orgId,
      membershipId: membershipId,
      roleId: systemRoleId,
    })

    expect(result?.serverError).toBeDefined()
  })

  it("rejects cross-org access", async () => {
    const { removeOrgRole } = await import("~/server/web/organization/membership-actions")
    setTestSession({ id: otherUserId, role: "user" })

    const result = await removeOrgRole({
      organizationId: orgId,
      membershipId: membershipId,
      roleId: systemRoleId,
    })

    expect(result?.serverError).toBeDefined()
  })

  it("happy path: removes a role assignment", async () => {
    const { removeOrgRole } = await import("~/server/web/organization/membership-actions")

    // Create assignment to remove
    await db.membershipRoleAssignment.create({
      data: { membershipId, roleId: systemRoleId },
    })

    const result = await removeOrgRole({
      organizationId: orgId,
      membershipId: membershipId,
      roleId: systemRoleId,
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data).toBeDefined()
    expect(result!.data!.removed).toBe(true)

    // Verify gone
    const row = await db.membershipRoleAssignment.findUnique({
      where: { membershipId_roleId: { membershipId, roleId: systemRoleId } },
    })
    expect(row).toBeNull()
  })
})

// ─── rejectOrgJoinRequest ────────────────────────────────────────────────

describe("rejectOrgJoinRequest", () => {
  // We need a fresh PENDING membership for each reject test since reject deletes the row.
  // Use a separate discipline to avoid @@unique([userId, organizationId, disciplineId]) collision
  // with the ACTIVE membership created in beforeAll.
  let rejectMembershipId = ""
  let rejectDisciplineId = ""

  beforeAll(async () => {
    const disc = await db.discipline.create({
      data: {
        id: `${PREFIX}-disc-reject`,
        brand: TEST_BRAND,
        name: `${PREFIX}-disc-reject`,
        slug: `${PREFIX}-disc-reject`,
      },
    })
    rejectDisciplineId = disc.id
  })

  beforeEach(async () => {
    // Create a fresh pending membership for reject tests
    const m = await db.membership.create({
      data: {
        id: `${PREFIX}-reject-${Date.now()}`,
        brand: TEST_BRAND,
        userId: otherUserId,
        organizationId: orgId,
        disciplineId: rejectDisciplineId,
        status: "PENDING",
        version: 1,
      },
    })
    rejectMembershipId = m.id
    setTestSession({ id: ownerUserId, role: "user" })
  })

  it("rejects unauthenticated callers", async () => {
    const { rejectOrgJoinRequest } = await import("~/server/web/organization/membership-actions")
    setTestSession(null)

    const result = await rejectOrgJoinRequest({
      organizationId: orgId,
      membershipId: rejectMembershipId,
    })

    expect(result?.serverError).toBeDefined()

    // Clean up since reject didn't succeed
    await db.membership.deleteMany({ where: { id: rejectMembershipId } })
  })

  it("rejects cross-org access", async () => {
    const { rejectOrgJoinRequest } = await import("~/server/web/organization/membership-actions")
    setTestSession({ id: otherUserId, role: "user" })

    const result = await rejectOrgJoinRequest({
      organizationId: orgId,
      membershipId: rejectMembershipId,
    })

    expect(result?.serverError).toBeDefined()

    // Clean up since reject didn't succeed
    await db.membership.deleteMany({ where: { id: rejectMembershipId } })
  })

  it("happy path: deletes a PENDING membership", async () => {
    const { rejectOrgJoinRequest } = await import("~/server/web/organization/membership-actions")

    const result = await rejectOrgJoinRequest({
      organizationId: orgId,
      membershipId: rejectMembershipId,
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data).toBeDefined()
    expect(result!.data!.rejected).toBe(true)

    // Verify deleted
    const row = await db.membership.findUnique({ where: { id: rejectMembershipId } })
    expect(row).toBeNull()
  })
})

// ─── createOrgInvite ─────────────────────────────────────────────────────

describe("createOrgInvite", () => {
  it("rejects unauthenticated callers", async () => {
    const { createOrgInvite } = await import("~/server/web/organization/invite-actions")
    setTestSession(null)

    const result = await createOrgInvite({
      organizationId: orgId,
    })

    expect(result?.serverError).toBeDefined()
  })

  it("rejects cross-org access", async () => {
    const { createOrgInvite } = await import("~/server/web/organization/invite-actions")
    setTestSession({ id: otherUserId, role: "user" })

    const result = await createOrgInvite({
      organizationId: orgId,
    })

    expect(result?.serverError).toBeDefined()
  })

  it("happy path: creates an org invite", async () => {
    const { createOrgInvite } = await import("~/server/web/organization/invite-actions")

    const result = await createOrgInvite({
      organizationId: orgId,
      maxUses: 5,
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data).toBeDefined()
    expect(result!.data!.organizationId).toBe(orgId)
    expect(result!.data!.type).toBe("ORGANIZATION")
    expect(result!.data!.brand).toBe(TEST_BRAND)
    expect(result!.data!.maxUses).toBe(5)
  })
})

// ─── revokeOrgInvite ─────────────────────────────────────────────────────

describe("revokeOrgInvite", () => {
  let inviteId = ""

  beforeEach(async () => {
    // Create an invite to revoke
    const invite = await db.invite.create({
      data: {
        id: `${PREFIX}-inv-${Date.now()}`,
        brand: TEST_BRAND,
        type: "ORGANIZATION",
        organizationId: orgId,
        createdById: ownerUserId,
      },
    })
    inviteId = invite.id
    setTestSession({ id: ownerUserId, role: "user" })
  })

  it("rejects unauthenticated callers", async () => {
    const { revokeOrgInvite } = await import("~/server/web/organization/invite-actions")
    setTestSession(null)

    const result = await revokeOrgInvite({
      organizationId: orgId,
      inviteId,
    })

    expect(result?.serverError).toBeDefined()
  })

  it("rejects cross-org access", async () => {
    const { revokeOrgInvite } = await import("~/server/web/organization/invite-actions")
    setTestSession({ id: otherUserId, role: "user" })

    const result = await revokeOrgInvite({
      organizationId: orgId,
      inviteId,
    })

    expect(result?.serverError).toBeDefined()
  })

  it("happy path: revokes an invite", async () => {
    const { revokeOrgInvite } = await import("~/server/web/organization/invite-actions")

    const result = await revokeOrgInvite({
      organizationId: orgId,
      inviteId,
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data).toBeDefined()
    expect(result!.data!.revoked).toBe(true)

    // Verify status changed
    const row = await db.invite.findUnique({ where: { id: inviteId } })
    expect(row?.status).toBe("REVOKED")
  })
})
