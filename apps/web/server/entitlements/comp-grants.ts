import { type Brand, Prisma } from "~/.generated/prisma/client"

type EntitlementDb = {
  $transaction?: <T>(fn: (tx: EntitlementDb) => Promise<T>) => Promise<T>
  entitlement: any
  userEntitlement: any
  auditLog: any
}

export type CompTerm = {
  days: number
}

export type GrantCompInput = {
  db: EntitlementDb
  brand: Brand
  grantorUserId: string
  granteeUserId: string
  entitlementKeys: readonly string[]
  term?: CompTerm | null
  reason: string
  now?: Date
}

export type RevokeCompInput = {
  db: EntitlementDb
  brand: Brand
  grantorUserId: string
  granteeUserId: string
  entitlementKeys: readonly string[]
  reason: string
  now?: Date
}

export type GrantCompResult = {
  grants: Array<{
    id: string
    entitlementKey: string
    sourceId: string
    endsAt: Date | null
  }>
}

export type RevokeCompResult = {
  revoked: Array<{
    id: string
    entitlementKey: string
  }>
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

  return slug || "manual-comp"
}

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)

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

async function grantCompInTx({
  db,
  brand,
  grantorUserId,
  granteeUserId,
  entitlementKeys,
  term,
  reason,
  now = new Date(),
}: GrantCompInput & { db: EntitlementDb }): Promise<GrantCompResult> {
  const uniqueKeys = [...new Set(entitlementKeys)]
  const sourceId = `grant:${grantorUserId}:${slugReason(reason)}`
  const endsAt = term ? addDays(now, term.days) : null
  const grants: GrantCompResult["grants"] = []

  for (const entitlementKey of uniqueKeys) {
    const entitlement = await db.entitlement.findUnique({
      where: { brand_key: { brand, key: entitlementKey } },
      select: { id: true, key: true },
    })

    if (!entitlement) {
      throw new Error(`Entitlement "${entitlementKey}" not found for brand ${brand}`)
    }

    const existing = await db.userEntitlement.findFirst({
      where: {
        userId: granteeUserId,
        entitlementId: entitlement.id,
        sourceType: "MANUAL_GRANT",
        sourceId,
      },
    })
    const after = {
      userId: granteeUserId,
      entitlementId: entitlement.id,
      entitlementKey,
      sourceType: "MANUAL_GRANT",
      sourceId,
      status: "ACTIVE",
      startsAt: now.toISOString(),
      endsAt: endsAt?.toISOString() ?? null,
      reason,
    }

    const before = existing ? serializeEntitlement(existing) : null

    await db.auditLog.create({
      data: {
        brand,
        action: "entitlement.comp.granted",
        entityType: "UserEntitlement",
        entityId: `${granteeUserId}:${entitlement.id}:${sourceId}`,
        userId: grantorUserId,
        before: before ?? Prisma.JsonNull,
        after,
      },
    })

    const grant = existing
      ? await db.userEntitlement.update({
          where: { id: existing.id },
          data: {
            status: "ACTIVE",
            startsAt: now,
            endsAt,
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
            endsAt,
          },
          select: { id: true },
        })

    grants.push({ id: grant.id, entitlementKey, sourceId, endsAt })
  }

  return { grants }
}

async function revokeCompInTx({
  db,
  brand,
  grantorUserId,
  granteeUserId,
  entitlementKeys,
  reason,
}: RevokeCompInput & { db: EntitlementDb }): Promise<RevokeCompResult> {
  const uniqueKeys = [...new Set(entitlementKeys)]
  const revoked: RevokeCompResult["revoked"] = []

  for (const entitlementKey of uniqueKeys) {
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
        sourceType: "MANUAL_GRANT",
        status: "ACTIVE",
      },
      orderBy: { createdAt: "asc" },
    })

    for (const activeGrant of activeGrants) {
      const before = serializeEntitlement(activeGrant)

      await db.auditLog.create({
        data: {
          brand,
          action: "entitlement.comp.revoked",
          entityType: "UserEntitlement",
          entityId: activeGrant.id,
          userId: grantorUserId,
          before,
          after: {
            ...before,
            status: "REVOKED",
            reason,
          },
        },
      })

      await db.userEntitlement.update({
        where: { id: activeGrant.id },
        data: { status: "REVOKED" },
      })

      revoked.push({ id: activeGrant.id, entitlementKey })
    }
  }

  return { revoked }
}

export async function grantComp(input: GrantCompInput): Promise<GrantCompResult> {
  if (hasTransaction(input.db)) {
    return input.db.$transaction(tx => grantCompInTx({ ...input, db: tx }))
  }

  return grantCompInTx({ ...input, db: input.db })
}

export async function revokeComp(input: RevokeCompInput): Promise<RevokeCompResult> {
  if (hasTransaction(input.db)) {
    return input.db.$transaction(tx => revokeCompInTx({ ...input, db: tx }))
  }

  return revokeCompInTx({ ...input, db: input.db })
}
