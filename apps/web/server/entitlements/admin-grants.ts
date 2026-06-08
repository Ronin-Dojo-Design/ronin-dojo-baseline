import { type Brand, Prisma } from "~/.generated/prisma/client"

type EntitlementDb = {
  $transaction?: <T>(fn: (tx: EntitlementDb) => Promise<T>) => Promise<T>
  entitlement: any
  userEntitlement: any
  auditLog: any
}

export type GrantAdminEntitlementInput = {
  db: EntitlementDb
  brand: Brand
  grantorUserId: string
  granteeUserId: string
  entitlementKey: string
  reason?: string | null
  now?: Date
}

export type RevokeAdminEntitlementInput = {
  db: EntitlementDb
  brand: Brand
  grantorUserId: string
  granteeUserId: string
  entitlementKey: string
  reason?: string | null
}

export type GrantAdminEntitlementResult = {
  grant: {
    id: string
    entitlementKey: string
    sourceId: string
  }
}

export type RevokeAdminEntitlementResult = {
  revoked: Array<{
    id: string
    entitlementKey: string
  }>
}

type EntitlementSnapshot = {
  id: string
  userId: string
  entitlementId: string
  sourceType: string
  sourceId: string | null
  status: string
  startsAt: Date
  endsAt: Date | null
}

const hasTransaction = (
  db: EntitlementDb,
): db is EntitlementDb & {
  $transaction: <T>(fn: (tx: EntitlementDb) => Promise<T>) => Promise<T>
} => typeof db.$transaction === "function"

const slugReason = (reason: string) => {
  const slug = reason
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || "manual-entitlement"
}

const defaultReason = (entitlementKey: string) => `Admin grant ${entitlementKey}`

const serializeEntitlement = (entitlement: EntitlementSnapshot) => ({
  id: entitlement.id,
  userId: entitlement.userId,
  entitlementId: entitlement.entitlementId,
  sourceType: entitlement.sourceType,
  sourceId: entitlement.sourceId,
  status: entitlement.status,
  startsAt: entitlement.startsAt.toISOString(),
  endsAt: entitlement.endsAt?.toISOString() ?? null,
})

async function grantAdminEntitlementInTx({
  db,
  brand,
  grantorUserId,
  granteeUserId,
  entitlementKey,
  reason,
  now = new Date(),
}: GrantAdminEntitlementInput): Promise<GrantAdminEntitlementResult> {
  const entitlement = await db.entitlement.findUnique({
    where: { brand_key: { brand, key: entitlementKey } },
    select: { id: true, key: true },
  })

  if (!entitlement) {
    throw new Error(`Entitlement "${entitlementKey}" not found for brand ${brand}`)
  }

  const auditReason = reason?.trim() || defaultReason(entitlementKey)
  const sourceId = `grant:${grantorUserId}:${slugReason(auditReason)}`
  const existing = await db.userEntitlement.findFirst({
    where: {
      userId: granteeUserId,
      entitlementId: entitlement.id,
      sourceType: "MANUAL_GRANT",
    },
    orderBy: { createdAt: "asc" },
  })
  const before = existing ? serializeEntitlement(existing) : null
  const after = {
    userId: granteeUserId,
    entitlementId: entitlement.id,
    entitlementKey,
    sourceType: "MANUAL_GRANT",
    sourceId,
    status: "ACTIVE",
    startsAt: now.toISOString(),
    endsAt: null,
    reason: auditReason,
  }

  await db.auditLog.create({
    data: {
      brand,
      action: "entitlement.admin.granted",
      entityType: "UserEntitlement",
      entityId: `${granteeUserId}:${entitlement.id}:${sourceId}`,
      userId: grantorUserId,
      before: before ?? Prisma.JsonNull,
      after,
    },
  })

  const mutationNow = new Date()
  const grant = existing
    ? await db.userEntitlement.update({
        where: { id: existing.id },
        data: {
          sourceId,
          status: "ACTIVE",
          startsAt: now,
          endsAt: null,
          updatedAt: mutationNow,
        },
        select: { id: true },
      })
    : await db.userEntitlement.create({
        data: {
          userId: granteeUserId,
          entitlementId: entitlement.id,
          sourceType: "MANUAL_GRANT",
          sourceId,
          startsAt: now,
          endsAt: null,
        },
        select: { id: true },
      })

  return { grant: { id: grant.id, entitlementKey, sourceId } }
}

async function revokeAdminEntitlementInTx({
  db,
  brand,
  grantorUserId,
  granteeUserId,
  entitlementKey,
  reason,
}: RevokeAdminEntitlementInput): Promise<RevokeAdminEntitlementResult> {
  const entitlement = await db.entitlement.findUnique({
    where: { brand_key: { brand, key: entitlementKey } },
    select: { id: true, key: true },
  })

  if (!entitlement) {
    throw new Error(`Entitlement "${entitlementKey}" not found for brand ${brand}`)
  }

  const activeGrants = await db.userEntitlement.findMany({
    where: {
      userId: granteeUserId,
      entitlementId: entitlement.id,
      status: "ACTIVE",
    },
    orderBy: { createdAt: "asc" },
  })
  const auditReason = reason?.trim() || `Admin revoke ${entitlementKey}`
  const revoked: RevokeAdminEntitlementResult["revoked"] = []

  for (const activeGrant of activeGrants) {
    const before = serializeEntitlement(activeGrant)

    await db.auditLog.create({
      data: {
        brand,
        action: "entitlement.admin.revoked",
        entityType: "UserEntitlement",
        entityId: activeGrant.id,
        userId: grantorUserId,
        before,
        after: {
          ...before,
          status: "REVOKED",
          reason: auditReason,
        },
      },
    })

    await db.userEntitlement.update({
      where: { id: activeGrant.id },
      data: { status: "REVOKED", updatedAt: new Date() },
    })

    revoked.push({ id: activeGrant.id, entitlementKey })
  }

  return { revoked }
}

export async function grantAdminEntitlement(
  input: GrantAdminEntitlementInput,
): Promise<GrantAdminEntitlementResult> {
  if (hasTransaction(input.db)) {
    return input.db.$transaction(tx => grantAdminEntitlementInTx({ ...input, db: tx }))
  }

  return grantAdminEntitlementInTx(input)
}

export async function revokeAdminEntitlement(
  input: RevokeAdminEntitlementInput,
): Promise<RevokeAdminEntitlementResult> {
  if (hasTransaction(input.db)) {
    return input.db.$transaction(tx => revokeAdminEntitlementInTx({ ...input, db: tx }))
  }

  return revokeAdminEntitlementInTx(input)
}
