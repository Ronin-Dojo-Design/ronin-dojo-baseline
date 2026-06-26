/**
 * SESSION_0347 TASK_01 — admin entitlement safe-action and audit coverage.
 *
 * Run: cd apps/web && bun test server/admin/entitlements/actions.safe-action.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BBL" })

import {
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
} from "~/lib/entitlements/lineage-comp"
import {
  grantUserComp,
  grantUserEntitlement,
  revokeUserComp,
  revokeUserEntitlement,
} from "~/server/admin/entitlements/actions"
import type { UserRole } from "~/.generated/prisma/client"
import { db } from "~/services/db"

const TEST_BRAND = "BBL" as const
const PREFIX = `session-0347-entitlements-${Date.now()}`
const tag = (name: string) => `${PREFIX}-${name}`

const userIds: string[] = []
const createdEntitlementIds: string[] = []
let adminUserId = ""
let nonAdminUserId = ""
let compGranteeUserId = ""
let genericGrantUserId = ""
let genericRevokeUserId = ""
let genericEntitlementKey = ""
let genericEntitlementId = ""

async function createUser(name: string, role: UserRole = "user") {
  const user = await db.user.create({
    data: {
      id: tag(name),
      name: tag(name),
      email: `${tag(name)}@test.local`,
      role,
    },
  })
  userIds.push(user.id)
  return user
}

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

async function expectAdminGate<TInput>(
  action: (input: TInput) => Promise<{ serverError?: string } | undefined>,
  input: TInput,
) {
  setTestSession(null)
  const unauthenticated = await action(input)
  expect(unauthenticated?.serverError).toBe("User not authenticated")

  setTestSession({ id: nonAdminUserId, role: "user" })
  const unauthorized = await action(input)
  expect(unauthorized?.serverError).toBe("User not authorized")
}

beforeAll(async () => {
  const [admin, nonAdmin, compGrantee, genericGrantUser, genericRevokeUser] = await Promise.all([
    createUser("admin", "admin"),
    createUser("non-admin"),
    createUser("comp-grantee"),
    createUser("generic-grant-user"),
    createUser("generic-revoke-user"),
  ])

  adminUserId = admin.id
  nonAdminUserId = nonAdmin.id
  compGranteeUserId = compGrantee.id
  genericGrantUserId = genericGrantUser.id
  genericRevokeUserId = genericRevokeUser.id

  await ensureEntitlement(LINEAGE_PREMIUM_ENTITLEMENT_KEY, "Lineage Premium")
  await ensureEntitlement(LINEAGE_ELITE_ENTITLEMENT_KEY, "Lineage Elite")
  const genericEntitlement = await ensureEntitlement(tag("GENERIC_UPLOAD_AUDIT"), "Generic Audit")
  genericEntitlementKey = genericEntitlement.key
  genericEntitlementId = genericEntitlement.id
})

afterAll(async () => {
  await db.auditLog.deleteMany({
    where: {
      OR: [{ userId: { in: userIds } }, { entityId: { contains: PREFIX } }],
    },
  })
  await db.userEntitlement.deleteMany({ where: { userId: { in: userIds } } })
  await db.session.deleteMany({ where: { userId: { in: userIds } } })
  await db.user.deleteMany({ where: { id: { in: userIds } } })

  for (const entitlementId of createdEntitlementIds) {
    await db.entitlement.delete({ where: { id: entitlementId } })
  }
})

describe("admin entitlement safe actions", () => {
  it("gates comp and generic admin mutations through adminActionClient", async () => {
    await expectAdminGate(grantUserComp, {
      userId: compGranteeUserId,
      tier: LINEAGE_PREMIUM_ENTITLEMENT_KEY,
      reason: "Gate check",
    })
    await expectAdminGate(revokeUserComp, {
      userId: compGranteeUserId,
      tier: LINEAGE_PREMIUM_ENTITLEMENT_KEY,
      reason: "Gate check",
    })
    await expectAdminGate(grantUserEntitlement, {
      userId: genericGrantUserId,
      entitlementKey: genericEntitlementKey,
    })
    await expectAdminGate(revokeUserEntitlement, {
      userId: genericGrantUserId,
      entitlementKey: genericEntitlementKey,
    })
  })

  it("runs grantUserComp and revokeUserComp through the admin wrapper for an admin", async () => {
    setTestSession({ id: adminUserId, role: "admin" })

    const grant = await grantUserComp({
      userId: compGranteeUserId,
      tier: LINEAGE_PREMIUM_ENTITLEMENT_KEY,
      reason: "Wrapper happy path",
    })
    expect(grant?.serverError).toBeUndefined()
    expect(grant?.data?.grants).toHaveLength(1)

    const revoke = await revokeUserComp({
      userId: compGranteeUserId,
      tier: LINEAGE_PREMIUM_ENTITLEMENT_KEY,
      reason: "Wrapper happy path ended",
    })
    expect(revoke?.serverError).toBeUndefined()
    expect(revoke?.data?.revoked).toHaveLength(1)
  })

  it("audits generic admin grants before creating the user entitlement", async () => {
    setTestSession({ id: adminUserId, role: "admin" })

    const result = await grantUserEntitlement({
      userId: genericGrantUserId,
      entitlementKey: genericEntitlementKey,
      reason: "Generic audit grant",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.grant.entitlementKey).toBe(genericEntitlementKey)

    const [grant, audit] = await Promise.all([
      db.userEntitlement.findFirst({
        where: {
          userId: genericGrantUserId,
          entitlementId: genericEntitlementId,
          status: "ACTIVE",
        },
      }),
      db.auditLog.findFirst({
        where: {
          brand: TEST_BRAND,
          action: "entitlement.admin.granted",
          userId: adminUserId,
          entityId: { contains: genericGrantUserId },
        },
        orderBy: { createdAt: "desc" },
      }),
    ])

    const auditAfter = audit?.after as Record<string, unknown> | null
    expect(grant).toBeTruthy()
    expect(audit).toBeTruthy()
    expect(audit?.createdAt.getTime()).toBeLessThanOrEqual(grant?.createdAt.getTime() ?? 0)
    expect(audit?.before).toBeNull()
    expect(auditAfter).toMatchObject({
      userId: genericGrantUserId,
      entitlementKey: genericEntitlementKey,
      sourceType: "MANUAL_GRANT",
      status: "ACTIVE",
      endsAt: null,
      reason: "Generic audit grant",
    })
  })

  it("audits generic admin revokes before mutating active entitlement rows", async () => {
    const activeGrant = await db.userEntitlement.create({
      data: {
        userId: genericRevokeUserId,
        entitlementId: genericEntitlementId,
        sourceType: "MANUAL_GRANT",
        sourceId: tag("revoke-source"),
        status: "ACTIVE",
      },
    })

    setTestSession({ id: adminUserId, role: "admin" })
    const result = await revokeUserEntitlement({
      userId: genericRevokeUserId,
      entitlementKey: genericEntitlementKey,
      reason: "Generic audit revoke",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.revoked).toEqual([
      { id: activeGrant.id, entitlementKey: genericEntitlementKey },
    ])

    const [revokedGrant, audit] = await Promise.all([
      db.userEntitlement.findUnique({ where: { id: activeGrant.id } }),
      db.auditLog.findFirst({
        where: {
          brand: TEST_BRAND,
          action: "entitlement.admin.revoked",
          entityId: activeGrant.id,
          userId: adminUserId,
        },
      }),
    ])

    const auditBefore = audit?.before as Record<string, unknown> | null
    const auditAfter = audit?.after as Record<string, unknown> | null
    expect(revokedGrant?.status).toBe("REVOKED")
    expect(audit?.createdAt.getTime()).toBeLessThanOrEqual(revokedGrant?.updatedAt.getTime() ?? 0)
    expect(auditBefore).toMatchObject({
      id: activeGrant.id,
      status: "ACTIVE",
      sourceId: tag("revoke-source"),
    })
    expect(auditAfter).toMatchObject({
      id: activeGrant.id,
      status: "REVOKED",
      reason: "Generic audit revoke",
    })
  })
})
