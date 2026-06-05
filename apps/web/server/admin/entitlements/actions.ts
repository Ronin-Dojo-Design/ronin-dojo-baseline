"use server"

import { after } from "next/server"
import { z } from "zod"
import { getRequestBrand } from "~/lib/brand-context"
import {
  getLineageCompEntitlementKeys,
  lineageCompGrantSpecSchema,
  lineageCompTierSchema,
} from "~/lib/entitlements/lineage-comp"
import { adminActionClient } from "~/lib/safe-actions"
import { entitlementSchema } from "~/server/admin/entitlements/schema"
import { idsSchema } from "~/server/admin/shared/schema"
import { grantComp, revokeComp } from "~/server/entitlements/comp-grants"

export const upsertEntitlement = adminActionClient
  .inputSchema(entitlementSchema)
  .action(async ({ parsedInput: { id, ...input }, ctx: { db, revalidate } }) => {
    const brand = await getRequestBrand()

    const entitlement = id
      ? await db.entitlement.update({
          where: { id },
          data: {
            key: input.key,
            name: input.name,
            description: input.description,
          },
        })
      : await db.entitlement.create({
          data: {
            brand,
            key: input.key,
            name: input.name,
            description: input.description,
          },
        })

    after(async () => {
      revalidate({
        paths: ["/admin/entitlements"],
        tags: ["entitlements", `entitlement-${entitlement.id}`],
      })
    })

    return entitlement
  })

export const deleteEntitlements = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    const brand = await getRequestBrand()

    await db.entitlement.deleteMany({
      where: { id: { in: ids }, brand },
    })

    revalidate({
      paths: ["/admin/entitlements"],
      tags: ["entitlements"],
    })
  })

const grantEntitlementSchema = z.object({
  userId: z.string(),
  entitlementKey: z.string(),
})

export const grantUserEntitlement = adminActionClient
  .inputSchema(grantEntitlementSchema)
  .action(async ({ parsedInput: { userId, entitlementKey }, ctx: { db, revalidate } }) => {
    const brand = await getRequestBrand()

    const entitlement = await db.entitlement.findUnique({
      where: { brand_key: { brand, key: entitlementKey } },
    })

    if (!entitlement) {
      throw new Error(`Entitlement "${entitlementKey}" not found for brand ${brand}`)
    }

    // Upsert: if already exists and REVOKED, reactivate; otherwise create
    const existing = await db.userEntitlement.findFirst({
      where: { userId, entitlementId: entitlement.id },
    })

    if (existing) {
      await db.userEntitlement.update({
        where: { id: existing.id },
        data: { status: "ACTIVE", endsAt: null },
      })
    } else {
      await db.userEntitlement.create({
        data: {
          userId,
          entitlementId: entitlement.id,
          sourceType: "MANUAL_GRANT",
          status: "ACTIVE",
        },
      })
    }

    revalidate({
      paths: ["/admin/users", `/admin/users/${userId}`],
      tags: ["user-entitlements", `user-entitlements-${userId}`],
    })
  })

export const revokeUserEntitlement = adminActionClient
  .inputSchema(grantEntitlementSchema)
  .action(async ({ parsedInput: { userId, entitlementKey }, ctx: { db, revalidate } }) => {
    const brand = await getRequestBrand()

    const entitlement = await db.entitlement.findUnique({
      where: { brand_key: { brand, key: entitlementKey } },
    })

    if (!entitlement) {
      throw new Error(`Entitlement "${entitlementKey}" not found for brand ${brand}`)
    }

    await db.userEntitlement.updateMany({
      where: { userId, entitlementId: entitlement.id, status: "ACTIVE" },
      data: { status: "REVOKED" },
    })

    revalidate({
      paths: ["/admin/users", `/admin/users/${userId}`],
      tags: ["user-entitlements", `user-entitlements-${userId}`],
    })
  })

const grantUserCompSchema = z.object({
  userId: z.string().min(1),
  tier: lineageCompTierSchema,
  termDays: lineageCompGrantSpecSchema.shape.termDays,
  reason: z.string().trim().min(1).max(200),
})

export const grantUserComp = adminActionClient
  .inputSchema(grantUserCompSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate, brand, user } }) => {
    const result = await grantComp({
      db,
      brand,
      grantorUserId: user.id,
      granteeUserId: parsedInput.userId,
      entitlementKeys: getLineageCompEntitlementKeys(parsedInput.tier),
      term: parsedInput.termDays ? { days: parsedInput.termDays } : null,
      reason: parsedInput.reason,
    })

    revalidate({
      paths: ["/admin/users", `/admin/users/${parsedInput.userId}`],
      tags: ["user-entitlements", `user-entitlements-${parsedInput.userId}`],
    })

    return result
  })

const revokeUserCompSchema = z.object({
  userId: z.string().min(1),
  tier: lineageCompTierSchema,
  reason: z.string().trim().min(1).max(200),
})

export const revokeUserComp = adminActionClient
  .inputSchema(revokeUserCompSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate, brand, user } }) => {
    const result = await revokeComp({
      db,
      brand,
      grantorUserId: user.id,
      granteeUserId: parsedInput.userId,
      entitlementKeys: getLineageCompEntitlementKeys(parsedInput.tier),
      reason: parsedInput.reason,
    })

    revalidate({
      paths: ["/admin/users", `/admin/users/${parsedInput.userId}`],
      tags: ["user-entitlements", `user-entitlements-${parsedInput.userId}`],
    })

    return result
  })
