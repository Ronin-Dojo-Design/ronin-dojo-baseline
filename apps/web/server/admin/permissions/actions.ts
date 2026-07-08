"use server"

import { type Brand, Prisma } from "~/.generated/prisma/client"
import { adminActionClient } from "~/lib/safe-actions"
import {
  grantableUserPermissionSchema,
  type GrantableUserPermissionKey,
} from "~/server/admin/permissions/grantable"
import { z } from "zod"

const userPermissionGrantSchema = z.object({
  userId: z.string().min(1),
  grant: grantableUserPermissionSchema,
  reason: z.string().trim().min(1).max(200).optional(),
})

const userPermissionGrantAction = adminActionClient.inputSchema(userPermissionGrantSchema)

const permissionGrantSelect = {
  id: true,
  userId: true,
  grant: true,
  reason: true,
  createdAt: true,
  revokedAt: true,
  grantedById: true,
} as const

type PermissionGrantSnapshot = {
  id: string
  userId: string
  grant: string
  reason: string | null
  createdAt: Date
  revokedAt: Date | null
  grantedById: string | null
}

type PermissionGrantDb = {
  user: any
  userPermissionGrant: any
  auditLog: any
}

type PermissionGrantRevalidate = (opts: { paths: string[]; tags: string[] }) => void

const serializeGrant = (grant: PermissionGrantSnapshot) => ({
  id: grant.id,
  userId: grant.userId,
  grant: grant.grant,
  reason: grant.reason,
  createdAt: grant.createdAt.toISOString(),
  revokedAt: grant.revokedAt?.toISOString() ?? null,
  grantedById: grant.grantedById,
})

const findActiveGrant = (
  db: PermissionGrantDb,
  userId: string,
  grant: GrantableUserPermissionKey,
): Promise<PermissionGrantSnapshot | null> =>
  db.userPermissionGrant.findFirst({
    where: { userId, grant, revokedAt: null },
    select: permissionGrantSelect,
  })

const ensureGranteeExists = async (db: PermissionGrantDb, userId: string) => {
  const grantee = await db.user.findUnique({ where: { id: userId }, select: { id: true } })
  if (!grantee) {
    throw new Error("User not found.")
  }
}

const revalidatePermissionGrants = (revalidate: PermissionGrantRevalidate, userId: string) => {
  revalidate({
    paths: ["/app/users", `/app/users/${userId}`],
    tags: ["user-permission-grants", `user-permission-grants-${userId}`],
  })
}

const assertNotSelfPermissionChange = (
  targetUserId: string,
  actorUserId: string,
  action: "grant" | "revoke",
) => {
  if (targetUserId !== actorUserId) return

  throw new Error(
    `You cannot ${action} permissions ${action === "grant" ? "to" : "from"} your own account.`,
  )
}

const auditGrant = (
  db: PermissionGrantDb,
  input: {
    brand: Brand
    actorUserId: string
    granteeUserId: string
    grant: GrantableUserPermissionKey
    reason: string
  },
) =>
  db.auditLog.create({
    data: {
      brand: input.brand,
      action: "permission.admin.granted",
      entityType: "UserPermissionGrant",
      entityId: `${input.granteeUserId}:${input.grant}`,
      userId: input.actorUserId,
      before: Prisma.JsonNull,
      after: {
        userId: input.granteeUserId,
        grant: input.grant,
        reason: input.reason,
        grantedById: input.actorUserId,
      },
    },
  })

const auditRevoke = (
  db: PermissionGrantDb,
  input: {
    brand: Brand
    actorUserId: string
    activeGrant: PermissionGrantSnapshot
    revokedAt: Date
    reason: string
  },
) => {
  const before = serializeGrant(input.activeGrant)

  return db.auditLog.create({
    data: {
      brand: input.brand,
      action: "permission.admin.revoked",
      entityType: "UserPermissionGrant",
      entityId: input.activeGrant.id,
      userId: input.actorUserId,
      before,
      after: {
        ...before,
        revokedAt: input.revokedAt.toISOString(),
        reason: input.reason,
      },
    },
  })
}

async function grantPermissionInTx(
  db: PermissionGrantDb,
  input: {
    brand: Brand
    actorUserId: string
    granteeUserId: string
    grant: GrantableUserPermissionKey
    reason?: string
  },
) {
  await ensureGranteeExists(db, input.granteeUserId)

  const existing = await findActiveGrant(db, input.granteeUserId, input.grant)
  if (existing) {
    return { grant: existing, changed: false }
  }

  const auditReason = input.reason?.trim() || `Admin grant ${input.grant}`
  await auditGrant(db, { ...input, reason: auditReason })

  const created = await db.userPermissionGrant.create({
    data: {
      userId: input.granteeUserId,
      grant: input.grant,
      reason: auditReason,
      grantedById: input.actorUserId,
    },
    select: permissionGrantSelect,
  })

  return { grant: created as PermissionGrantSnapshot, changed: true }
}

async function revokePermissionInTx(
  db: PermissionGrantDb,
  input: {
    brand: Brand
    actorUserId: string
    granteeUserId: string
    grant: GrantableUserPermissionKey
    reason?: string
  },
) {
  const activeGrants = (await db.userPermissionGrant.findMany({
    where: { userId: input.granteeUserId, grant: input.grant, revokedAt: null },
    select: permissionGrantSelect,
    orderBy: { createdAt: "asc" },
  })) as PermissionGrantSnapshot[]
  const auditReason = input.reason?.trim() || `Admin revoke ${input.grant}`
  const revokedAt = new Date()
  const revoked: PermissionGrantSnapshot[] = []

  for (const activeGrant of activeGrants) {
    await auditRevoke(db, {
      brand: input.brand,
      actorUserId: input.actorUserId,
      activeGrant,
      revokedAt,
      reason: auditReason,
    })

    const updated = await db.userPermissionGrant.update({
      where: { id: activeGrant.id },
      data: { revokedAt },
      select: permissionGrantSelect,
    })

    revoked.push(updated as PermissionGrantSnapshot)
  }

  return { revoked }
}

export const grantUserPermission = userPermissionGrantAction.action(
  async ({ parsedInput: { userId, grant, reason }, ctx: { db, revalidate, brand, user } }) => {
    assertNotSelfPermissionChange(userId, user.id, "grant")

    const result = await db.$transaction(tx => {
      return grantPermissionInTx(tx, {
        brand,
        actorUserId: user.id,
        granteeUserId: userId,
        grant,
        reason,
      })
    })
    revalidatePermissionGrants(revalidate, userId)

    return {
      ...result,
      grant: serializeGrant(result.grant),
    }
  },
)

export const revokeUserPermission = userPermissionGrantAction.action(
  async ({ parsedInput: { userId, grant, reason }, ctx: { db, revalidate, brand, user } }) => {
    assertNotSelfPermissionChange(userId, user.id, "revoke")

    const result = await db.$transaction(tx => {
      return revokePermissionInTx(tx, {
        brand,
        actorUserId: user.id,
        granteeUserId: userId,
        grant,
        reason,
      })
    })
    revalidatePermissionGrants(revalidate, userId)

    return {
      revoked: result.revoked.map(serializeGrant),
    }
  },
)
