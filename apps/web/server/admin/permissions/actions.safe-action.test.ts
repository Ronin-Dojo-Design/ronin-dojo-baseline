/**
 * SESSION_0509 — FI-019 per-user permission grant actions.
 *
 * Run: cd apps/web && bun test server/admin/permissions/actions.safe-action.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test"

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BBL" })

import { grantUserPermission, revokeUserPermission } from "~/server/admin/permissions/actions"
import { APP_AREA_PERMISSIONS, MEDIA_UPLOAD_PERMISSION } from "~/server/orpc/roles"
import { db } from "~/services/db"

const TEST_BRAND = "BBL" as const
const PREFIX = `session-0509-permissions-${Date.now()}`
const tag = (name: string) => `${PREFIX}-${name}`

setDefaultTimeout(30_000)

const userIds: string[] = []
let adminUserId = ""
let nonAdminUserId = ""
let targetUserId = ""
let revokeTargetUserId = ""

beforeAll(async () => {
  const users = [
    { id: tag("admin"), name: tag("admin"), email: `${tag("admin")}@test.local`, role: "admin" },
    {
      id: tag("non-admin"),
      name: tag("non-admin"),
      email: `${tag("non-admin")}@test.local`,
      role: "user",
    },
    { id: tag("target"), name: tag("target"), email: `${tag("target")}@test.local`, role: "user" },
    {
      id: tag("revoke-target"),
      name: tag("revoke-target"),
      email: `${tag("revoke-target")}@test.local`,
      role: "user",
    },
  ] as const

  await db.user.createMany({ data: [...users] })
  userIds.push(...users.map(user => user.id))

  adminUserId = users[0].id
  nonAdminUserId = users[1].id
  targetUserId = users[2].id
  revokeTargetUserId = users[3].id
})

afterAll(async () => {
  await db.auditLog.deleteMany({
    where: {
      OR: [
        { userId: { in: userIds } },
        { entityId: { contains: PREFIX } },
        { entityId: { in: userIds } },
      ],
    },
  })
  await db.userPermissionGrant.deleteMany({ where: { userId: { in: userIds } } })
  await db.session.deleteMany({ where: { userId: { in: userIds } } })
  await db.user.deleteMany({ where: { id: { in: userIds } } })
})

describe("admin permission grant safe actions", () => {
  it("gates grant and revoke through adminActionClient", async () => {
    const input = { userId: targetUserId, grant: APP_AREA_PERMISSIONS.beta }

    setTestSession(null)
    expect((await grantUserPermission(input))?.serverError).toBe("User not authenticated")
    expect((await revokeUserPermission(input))?.serverError).toBe("User not authenticated")

    setTestSession({ id: nonAdminUserId, role: "user" })
    expect((await grantUserPermission(input))?.serverError).toBe("User not authorized")
    expect((await revokeUserPermission(input))?.serverError).toBe("User not authorized")
  })

  it("blocks self-grant and self-revoke", async () => {
    setTestSession({ id: adminUserId, role: "admin" })

    const grantResult = await grantUserPermission({
      userId: adminUserId,
      grant: APP_AREA_PERMISSIONS.beta,
    })
    expect(grantResult?.serverError).toBe("You cannot grant permissions to your own account.")

    const revokeResult = await revokeUserPermission({
      userId: adminUserId,
      grant: APP_AREA_PERMISSIONS.beta,
    })
    expect(revokeResult?.serverError).toBe("You cannot revoke permissions from your own account.")
  })

  it("grants a permission once and writes an audit row", async () => {
    setTestSession({ id: adminUserId, role: "admin" })

    const result = await grantUserPermission({
      userId: targetUserId,
      grant: APP_AREA_PERMISSIONS.beta,
      reason: "Test beta access",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.changed).toBe(true)
    expect(result?.data?.grant.grant).toBe(APP_AREA_PERMISSIONS.beta)

    const [grant, audit] = await Promise.all([
      db.userPermissionGrant.findFirst({
        where: { userId: targetUserId, grant: APP_AREA_PERMISSIONS.beta, revokedAt: null },
      }),
      db.auditLog.findFirst({
        where: {
          brand: TEST_BRAND,
          action: "permission.admin.granted",
          entityType: "UserPermissionGrant",
          entityId: `${targetUserId}:${APP_AREA_PERMISSIONS.beta}`,
          userId: adminUserId,
        },
      }),
    ])

    expect(grant).toBeTruthy()
    expect(audit).toBeTruthy()
    expect(audit?.before).toBeNull()
    expect(audit?.after).toMatchObject({
      userId: targetUserId,
      grant: APP_AREA_PERMISSIONS.beta,
      reason: "Test beta access",
      grantedById: adminUserId,
    })

    const duplicate = await grantUserPermission({
      userId: targetUserId,
      grant: APP_AREA_PERMISSIONS.beta,
    })
    expect(duplicate?.serverError).toBeUndefined()
    expect(duplicate?.data?.changed).toBe(false)

    const activeCount = await db.userPermissionGrant.count({
      where: { userId: targetUserId, grant: APP_AREA_PERMISSIONS.beta, revokedAt: null },
    })
    expect(activeCount).toBe(1)
  })

  it("soft-revokes active grants and writes an audit row", async () => {
    const activeGrant = await db.userPermissionGrant.create({
      data: {
        userId: revokeTargetUserId,
        grant: MEDIA_UPLOAD_PERMISSION,
        reason: "Seed revoke test",
        grantedById: adminUserId,
      },
    })

    setTestSession({ id: adminUserId, role: "admin" })
    const result = await revokeUserPermission({
      userId: revokeTargetUserId,
      grant: MEDIA_UPLOAD_PERMISSION,
      reason: "Revoke media upload",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.revoked).toHaveLength(1)
    expect(result?.data?.revoked[0]?.id).toBe(activeGrant.id)

    const [revokedGrant, audit] = await Promise.all([
      db.userPermissionGrant.findUnique({ where: { id: activeGrant.id } }),
      db.auditLog.findFirst({
        where: {
          brand: TEST_BRAND,
          action: "permission.admin.revoked",
          entityType: "UserPermissionGrant",
          entityId: activeGrant.id,
          userId: adminUserId,
        },
      }),
    ])

    expect(revokedGrant?.revokedAt).toBeInstanceOf(Date)
    expect(audit).toBeTruthy()
    expect(audit?.before).toMatchObject({
      id: activeGrant.id,
      userId: revokeTargetUserId,
      grant: MEDIA_UPLOAD_PERMISSION,
      reason: "Seed revoke test",
      revokedAt: null,
    })
    expect(audit?.after).toMatchObject({
      id: activeGrant.id,
      userId: revokeTargetUserId,
      grant: MEDIA_UPLOAD_PERMISSION,
      reason: "Revoke media upload",
    })
  })
})
