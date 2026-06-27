/**
 * SESSION_0452 — admin role-change audit + self-escalation guard (WL-P2-20, risk-register #11)
 * plus the `media.manage` premise behind the admin upload-gate bypass (WL-P2-19).
 *
 * Run: cd apps/web && bun test server/admin/users/role-change.safe-action.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BBL" })

import type { SessionUser } from "~/server/orpc/context"
import { can } from "~/server/orpc/permissions"
import { updateUser, updateUserRole } from "~/server/admin/users/actions"
import type { UserRole } from "~/.generated/prisma/client"
import { db } from "~/services/db"

const PREFIX = `session-0452-rolechange-${Date.now()}`
const tag = (n: string) => `${PREFIX}-${n}`
const userIds: string[] = []
let adminId = ""
let targetId = ""

async function createUser(name: string, role: UserRole = "user") {
  const u = await db.user.create({
    data: { id: tag(name), name: tag(name), email: `${tag(name)}@test.local`, role },
  })
  userIds.push(u.id)
  return u
}

const latestRoleAudit = (entityId: string) =>
  db.auditLog.findFirst({
    where: { action: "user.role.changed", entityId },
    orderBy: { createdAt: "desc" },
  })

beforeAll(async () => {
  const [admin, target] = await Promise.all([
    createUser("admin", "admin"),
    createUser("target", "user"),
  ])
  adminId = admin.id
  targetId = target.id
})

afterAll(async () => {
  await db.auditLog.deleteMany({ where: { entityId: { in: userIds } } })
  await db.session.deleteMany({ where: { userId: { in: userIds } } })
  await db.user.deleteMany({ where: { id: { in: userIds } } })
})

describe("media.manage premise (upload-gate bypass)", () => {
  it("admin holds media.manage; a plain user does not", () => {
    expect(can({ id: "x", role: "admin" } as SessionUser, "media.manage")).toBe(true)
    expect(can({ id: "y", role: "user" } as SessionUser, "media.manage")).toBe(false)
  })
})

describe("updateUserRole — gate + self-guard + audit", () => {
  it("is gated by adminActionClient (unauth / non-admin)", async () => {
    setTestSession(null)
    expect((await updateUserRole({ id: targetId, role: "user" }))?.serverError).toBe(
      "User not authenticated",
    )
    setTestSession({ id: targetId, role: "user" })
    expect((await updateUserRole({ id: targetId, role: "admin" }))?.serverError).toBe(
      "User not authorized",
    )
  })

  it("blocks an admin changing their OWN role and leaves it unchanged", async () => {
    setTestSession({ id: adminId, role: "admin" })
    const res = await updateUserRole({ id: adminId, role: "user" })
    expect(res?.serverError).toBe("You cannot change your own role.")
    const still = await db.user.findUnique({ where: { id: adminId }, select: { role: true } })
    expect(still?.role).toBe("admin")
  })

  it("changes another user's role and writes an audit row (before/after + acting admin)", async () => {
    setTestSession({ id: adminId, role: "admin" })
    const res = await updateUserRole({ id: targetId, role: "tournament_director" })
    expect(res?.serverError).toBeUndefined()
    const updated = await db.user.findUnique({ where: { id: targetId }, select: { role: true } })
    expect(updated?.role).toBe("tournament_director")
    const audit = await latestRoleAudit(targetId)
    expect(audit?.userId).toBe(adminId)
    expect((audit?.before as { role?: string } | null)?.role).toBe("user")
    expect((audit?.after as { role?: string } | null)?.role).toBe("tournament_director")
  })
})

describe("updateUser — role change through the generic edit is audited + self-guarded", () => {
  it("audits a role change made via updateUser", async () => {
    setTestSession({ id: adminId, role: "admin" })
    const res = await updateUser({ id: targetId, role: "user" })
    expect(res?.serverError).toBeUndefined()
    const audit = await latestRoleAudit(targetId)
    expect((audit?.after as { role?: string } | null)?.role).toBe("user")
  })

  it("blocks a self role-change via updateUser", async () => {
    setTestSession({ id: adminId, role: "admin" })
    const res = await updateUser({ id: adminId, role: "user" })
    expect(res?.serverError).toBe("You cannot change your own role.")
  })
})
