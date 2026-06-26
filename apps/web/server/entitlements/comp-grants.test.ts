/**
 * SESSION_0346 TASK_01 — audited lineage comp grants.
 *
 * Run: cd apps/web && bun test server/entitlements/comp-grants.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BBL" })

import {
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
} from "~/lib/entitlements/lineage-comp"
import { grantUserComp, revokeUserComp } from "~/server/admin/entitlements/actions"
import { grantComp } from "~/server/entitlements/comp-grants"
import type { UserRole } from "~/.generated/prisma/client"
import { db } from "~/services/db"

const TEST_BRAND = "BBL" as const
const PREFIX = `session-0346-comp-${Date.now()}`
const tag = (name: string) => `${PREFIX}-${name}`

const createdEntitlementIds: string[] = []
const createdUserIds: string[] = []
const createdOrgIds: string[] = []
const createdDisciplineIds: string[] = []

async function ensureEntitlement(key: string, name: string) {
  const existing = await db.entitlement.findUnique({
    where: { brand_key: { brand: TEST_BRAND, key } },
  })
  if (existing) return existing

  const entitlement = await db.entitlement.create({
    data: { brand: TEST_BRAND, key, name },
  })
  createdEntitlementIds.push(entitlement.id)
  return entitlement
}

async function createUser(name: string, role: UserRole = "user") {
  const user = await db.user.create({
    data: {
      id: tag(name),
      name: tag(name),
      email: `${tag(name)}@test.local`,
      role,
    },
  })
  createdUserIds.push(user.id)
  return user
}

async function createMembership(userId: string) {
  const org = await db.organization.create({
    data: {
      id: tag(`org-${userId}`),
      brand: TEST_BRAND,
      type: "DOJO",
      name: tag(`org-${userId}`),
      slug: tag(`org-${userId}`),
    },
  })
  createdOrgIds.push(org.id)

  const discipline = await db.discipline.create({
    data: {
      id: tag(`discipline-${userId}`),
      brand: TEST_BRAND,
      name: tag(`discipline-${userId}`),
      slug: tag(`discipline-${userId}`),
    },
  })
  createdDisciplineIds.push(discipline.id)

  return db.membership.create({
    data: {
      brand: TEST_BRAND,
      status: "ACTIVE",
      userId,
      organizationId: org.id,
      disciplineId: discipline.id,
      joinedAt: new Date("2026-01-01T00:00:00.000Z"),
    },
  })
}

beforeAll(async () => {
  await ensureEntitlement(LINEAGE_PREMIUM_ENTITLEMENT_KEY, "Lineage Premium")
  await ensureEntitlement(LINEAGE_ELITE_ENTITLEMENT_KEY, "Lineage Elite")
})

afterAll(async () => {
  await db.auditLog.deleteMany({
    where: {
      OR: [{ userId: { in: createdUserIds } }, { entityId: { contains: PREFIX } }],
    },
  })
  await db.userEntitlement.deleteMany({ where: { userId: { in: createdUserIds } } })
  await db.membership.deleteMany({ where: { userId: { in: createdUserIds } } })
  await db.organization.deleteMany({ where: { id: { in: createdOrgIds } } })
  await db.discipline.deleteMany({ where: { id: { in: createdDisciplineIds } } })
  await db.session.deleteMany({ where: { userId: { in: createdUserIds } } })
  await db.user.deleteMany({ where: { id: { in: createdUserIds } } })

  for (const entitlementId of createdEntitlementIds) {
    await db.entitlement.delete({ where: { id: entitlementId } })
  }
})

describe("lineage comp grants", () => {
  it("rejects the admin action for unauthenticated and non-admin users", async () => {
    const grantee = await createUser("gate-grantee")

    setTestSession(null)
    const unauthenticated = await grantUserComp({
      userId: grantee.id,
      tier: LINEAGE_PREMIUM_ENTITLEMENT_KEY,
      reason: "Gate check",
    })
    expect(unauthenticated?.serverError).toBe("User not authenticated")

    setTestSession({ id: grantee.id, role: "user" })
    const unauthorized = await grantUserComp({
      userId: grantee.id,
      tier: LINEAGE_PREMIUM_ENTITLEMENT_KEY,
      reason: "Gate check",
    })
    expect(unauthorized?.serverError).toBe("User not authorized")
  })

  it("grants a lifetime premium comp with audit before mutation and no membership mutation", async () => {
    const admin = await createUser("lifetime-admin", "admin")
    const grantee = await createUser("lifetime-grantee")
    const membership = await createMembership(grantee.id)

    setTestSession({ id: admin.id, role: "admin" })
    const result = await grantUserComp({
      userId: grantee.id,
      tier: LINEAGE_PREMIUM_ENTITLEMENT_KEY,
      reason: "Lifetime gift",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.grants).toHaveLength(1)

    const [grant, audit, unchangedMembership] = await Promise.all([
      db.userEntitlement.findFirst({
        where: {
          userId: grantee.id,
          entitlement: { brand: TEST_BRAND, key: LINEAGE_PREMIUM_ENTITLEMENT_KEY },
          sourceType: "MANUAL_GRANT",
          sourceId: `grant:${admin.id}:lifetime-gift`,
        },
      }),
      db.auditLog.findFirst({
        where: {
          brand: TEST_BRAND,
          action: "entitlement.comp.granted",
          userId: admin.id,
          entityId: { contains: `grant:${admin.id}:lifetime-gift` },
        },
      }),
      db.membership.findUnique({ where: { id: membership.id } }),
    ])
    const auditAfter = audit?.after as Record<string, unknown> | null

    expect(grant?.status).toBe("ACTIVE")
    expect(grant?.endsAt).toBeNull()
    expect(audit?.createdAt.getTime()).toBeLessThanOrEqual(grant?.createdAt.getTime() ?? 0)
    expect(audit?.before).toBeNull()
    expect(auditAfter).toMatchObject({
      userId: grantee.id,
      entitlementKey: LINEAGE_PREMIUM_ENTITLEMENT_KEY,
      sourceType: "MANUAL_GRANT",
      sourceId: `grant:${admin.id}:lifetime-gift`,
      status: "ACTIVE",
      endsAt: null,
      reason: "Lifetime gift",
    })
    expect(unchangedMembership?.status).toBe("ACTIVE")
    expect(unchangedMembership?.version).toBe(0)
  })

  it("idempotently grants a term elite comp as premium plus elite without duplicate rows", async () => {
    const admin = await createUser("term-admin", "admin")
    const grantee = await createUser("term-grantee")
    const now = new Date("2026-06-01T12:00:00.000Z")

    await grantComp({
      db,
      brand: TEST_BRAND,
      grantorUserId: admin.id,
      granteeUserId: grantee.id,
      entitlementKeys: [LINEAGE_PREMIUM_ENTITLEMENT_KEY, LINEAGE_ELITE_ENTITLEMENT_KEY],
      term: { days: 30 },
      reason: "Elite gift",
      now,
    })
    await grantComp({
      db,
      brand: TEST_BRAND,
      grantorUserId: admin.id,
      granteeUserId: grantee.id,
      entitlementKeys: [LINEAGE_PREMIUM_ENTITLEMENT_KEY, LINEAGE_ELITE_ENTITLEMENT_KEY],
      term: { days: 30 },
      reason: "Elite gift",
      now,
    })

    const grants = await db.userEntitlement.findMany({
      where: {
        userId: grantee.id,
        sourceType: "MANUAL_GRANT",
        sourceId: `grant:${admin.id}:elite-gift`,
      },
      include: { entitlement: { select: { key: true } } },
    })

    expect(grants).toHaveLength(2)
    expect(grants.map(grant => grant.entitlement.key).sort()).toEqual([
      LINEAGE_ELITE_ENTITLEMENT_KEY,
      LINEAGE_PREMIUM_ENTITLEMENT_KEY,
    ])
    for (const grant of grants) {
      expect(grant.status).toBe("ACTIVE")
      expect(grant.endsAt?.toISOString()).toBe("2026-07-01T12:00:00.000Z")
    }
  })

  it("revokes active manual comp grants through the admin action", async () => {
    const admin = await createUser("revoke-admin", "admin")
    const grantee = await createUser("revoke-grantee")

    await grantComp({
      db,
      brand: TEST_BRAND,
      grantorUserId: admin.id,
      granteeUserId: grantee.id,
      entitlementKeys: [LINEAGE_PREMIUM_ENTITLEMENT_KEY, LINEAGE_ELITE_ENTITLEMENT_KEY],
      reason: "Revoke gift",
    })

    setTestSession({ id: admin.id, role: "admin" })
    const result = await revokeUserComp({
      userId: grantee.id,
      tier: LINEAGE_ELITE_ENTITLEMENT_KEY,
      reason: "Comp ended",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.revoked).toHaveLength(2)

    const activeCount = await db.userEntitlement.count({
      where: {
        userId: grantee.id,
        sourceType: "MANUAL_GRANT",
        status: "ACTIVE",
      },
    })
    const revokeAuditCount = await db.auditLog.count({
      where: {
        brand: TEST_BRAND,
        action: "entitlement.comp.revoked",
        userId: admin.id,
      },
    })

    expect(activeCount).toBe(0)
    expect(revokeAuditCount).toBe(2)
  })
})
