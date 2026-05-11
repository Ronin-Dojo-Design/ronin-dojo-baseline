/**
 * SESSION_0130 — Integration test for canUploadMedia authorization paths.
 *
 * Tests all 3 code paths:
 * 1. Explicit S3_UPLOAD entitlement grant
 * 2. Role-based membership (INSTRUCTOR/COACH/OWNER/ORG_ADMIN)
 * 3. Organization ownership
 * Plus negative case and revocation case.
 *
 * Uses real Postgres dev DB. Fixtures are cleaned up after.
 *
 * Run: cd apps/web && bun test server/web/entitlements/queries.integration.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

import { db } from "~/services/db"

// Inline replicas of query logic without "use cache" wrapper (requires Next.js runtime)

async function queryHasEntitlement(
  userId: string,
  entitlementKey: string,
  brand: "BASELINE_MARTIAL_ARTS",
): Promise<boolean> {
  const grant = await db.userEntitlement.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      entitlement: { key: entitlementKey, brand },
      OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
    },
  })
  return !!grant
}

async function queryCanUploadMedia(
  userId: string,
  brand: "BASELINE_MARTIAL_ARTS",
): Promise<boolean> {
  const [entitlementGrant, roleBasedMembership, ownedOrg] = await Promise.all([
    db.userEntitlement.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        entitlement: { key: "S3_UPLOAD", brand },
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
      },
      select: { id: true },
    }),
    db.membership.findFirst({
      where: {
        userId,
        brand,
        status: "ACTIVE",
        roleAssignments: {
          some: {
            role: {
              code: { in: ["INSTRUCTOR", "COACH", "OWNER", "ORG_ADMIN"] },
            },
          },
        },
      },
      select: { id: true },
    }),
    db.organization.findFirst({
      where: { ownerId: userId, brand },
      select: { id: true },
    }),
  ])

  return !!(entitlementGrant || roleBasedMembership || ownedOrg)
}

const BRAND = "BASELINE_MARTIAL_ARTS" as const
const TEST_PREFIX = "test-entitlement-integ-"

// Track created IDs for cleanup
const cleanup: {
  userIds: string[]
  orgIds: string[]
  membershipIds: string[]
  entitlementId: string | null
  userEntitlementIds: string[]
  roleAssignmentIds: string[]
} = {
  userIds: [],
  orgIds: [],
  membershipIds: [],
  entitlementId: null,
  userEntitlementIds: [],
  roleAssignmentIds: [],
}

describe("canUploadMedia", () => {
  let entitlementId: string

  beforeAll(async () => {
    // Ensure S3_UPLOAD entitlement exists for BASELINE brand
    let entitlement = await db.entitlement.findUnique({
      where: { brand_key: { brand: BRAND, key: "S3_UPLOAD" } },
    })

    if (!entitlement) {
      entitlement = await db.entitlement.create({
        data: { brand: BRAND, key: "S3_UPLOAD", name: "S3 Upload" },
      })
      cleanup.entitlementId = entitlement.id
    }

    entitlementId = entitlement.id
  })

  afterAll(async () => {
    // Clean up in reverse dependency order
    if (cleanup.roleAssignmentIds.length) {
      await db.membershipRoleAssignment.deleteMany({
        where: { id: { in: cleanup.roleAssignmentIds } },
      })
    }
    if (cleanup.userEntitlementIds.length) {
      await db.userEntitlement.deleteMany({
        where: { id: { in: cleanup.userEntitlementIds } },
      })
    }
    if (cleanup.membershipIds.length) {
      await db.membership.deleteMany({
        where: { id: { in: cleanup.membershipIds } },
      })
    }
    if (cleanup.orgIds.length) {
      await db.organization.deleteMany({
        where: { id: { in: cleanup.orgIds } },
      })
    }
    if (cleanup.entitlementId) {
      await db.entitlement.delete({ where: { id: cleanup.entitlementId } })
    }
    // Clean up users — must delete passport + directoryProfile first
    for (const userId of cleanup.userIds) {
      await db.passport.deleteMany({ where: { userId } })
      await db.directoryProfile.deleteMany({ where: { userId } })
      await db.account.deleteMany({ where: { userId } })
      await db.session.deleteMany({ where: { userId } })
    }
    if (cleanup.userIds.length) {
      await db.user.deleteMany({ where: { id: { in: cleanup.userIds } } })
    }
  })

  async function createTestUser(suffix: string) {
    const user = await db.user.create({
      data: {
        name: `${TEST_PREFIX}${suffix}`,
        email: `${TEST_PREFIX}${suffix}@test.local`,
      },
    })
    cleanup.userIds.push(user.id)
    return user
  }

  it("returns false for user with no entitlement, role, or org ownership", async () => {
    const user = await createTestUser("no-access")
    const result = await queryCanUploadMedia(user.id, BRAND)
    expect(result).toBe(false)
  })

  it("returns true for user with active S3_UPLOAD entitlement", async () => {
    const user = await createTestUser("has-entitlement")
    const ue = await db.userEntitlement.create({
      data: {
        userId: user.id,
        entitlementId,
        sourceType: "MANUAL_GRANT",
        status: "ACTIVE",
      },
    })
    cleanup.userEntitlementIds.push(ue.id)

    const result = await queryCanUploadMedia(user.id, BRAND)
    expect(result).toBe(true)
  })

  it("returns false after entitlement is revoked", async () => {
    const user = await createTestUser("revoked")
    const ue = await db.userEntitlement.create({
      data: {
        userId: user.id,
        entitlementId,
        sourceType: "MANUAL_GRANT",
        status: "ACTIVE",
      },
    })
    cleanup.userEntitlementIds.push(ue.id)

    // Verify active
    expect(await queryCanUploadMedia(user.id, BRAND)).toBe(true)

    // Revoke
    await db.userEntitlement.update({
      where: { id: ue.id },
      data: { status: "REVOKED" },
    })

    expect(await queryCanUploadMedia(user.id, BRAND)).toBe(false)
  })

  it("returns true for user with INSTRUCTOR role membership", async () => {
    const user = await createTestUser("instructor")

    // Need an org + discipline for the membership
    const org = await db.organization.create({
      data: {
        name: `${TEST_PREFIX}org`,
        slug: `${TEST_PREFIX}org`,
        brand: BRAND,
        type: "DOJO",
        ownerId: (await createTestUser("org-owner-for-instructor")).id,
      },
    })
    cleanup.orgIds.push(org.id)

    // Find any discipline
    const discipline = await db.discipline.findFirst()
    if (!discipline) throw new Error("No disciplines seeded")

    // Find or create INSTRUCTOR role
    let role = await db.role.findFirst({ where: { code: "INSTRUCTOR" } })
    if (!role) throw new Error("No INSTRUCTOR role seeded")

    const membership = await db.membership.create({
      data: {
        userId: user.id,
        organizationId: org.id,
        disciplineId: discipline.id,
        brand: BRAND,
        status: "ACTIVE",
      },
    })
    cleanup.membershipIds.push(membership.id)

    const ra = await db.membershipRoleAssignment.create({
      data: {
        membershipId: membership.id,
        roleId: role.id,
      },
    })
    cleanup.roleAssignmentIds.push(ra.id)

    const result = await queryCanUploadMedia(user.id, BRAND)
    expect(result).toBe(true)
  })

  it("returns true for organization owner", async () => {
    const user = await createTestUser("org-owner")
    const org = await db.organization.create({
      data: {
        name: `${TEST_PREFIX}owned-org`,
        slug: `${TEST_PREFIX}owned-org`,
        brand: BRAND,
        type: "DOJO",
        ownerId: user.id,
      },
    })
    cleanup.orgIds.push(org.id)

    const result = await queryCanUploadMedia(user.id, BRAND)
    expect(result).toBe(true)
  })
})
