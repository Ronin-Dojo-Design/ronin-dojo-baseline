"use server"

import { after } from "next/server"
import { z } from "zod"
import { Brand } from "~/.generated/prisma/client"
import {
  getLineageCompEntitlementKeys,
  lineageCompGrantSpecSchema,
  lineageCompTierSchema,
} from "~/lib/entitlements/lineage-comp"
import { adminActionClient } from "~/lib/safe-actions"
import { entitlementSchema } from "~/server/admin/entitlements/schema"
import { idsSchema } from "~/server/admin/shared/schema"
import { grantAdminEntitlement, revokeAdminEntitlement } from "~/server/entitlements/admin-grants"
import { grantComp, revokeComp } from "~/server/entitlements/comp-grants"

export const upsertEntitlement = adminActionClient
  .inputSchema(entitlementSchema)
  .action(async ({ parsedInput: { id, ...input }, ctx: { db, revalidate } }) => {
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
            brand: Brand.BBL,
            key: input.key,
            name: input.name,
            description: input.description,
          },
        })

    after(async () => {
      revalidate({
        paths: ["/app/entitlements"],
        tags: ["entitlements", `entitlement-${entitlement.id}`],
      })
    })

    return entitlement
  })

export const deleteEntitlements = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    await db.entitlement.deleteMany({
      where: { id: { in: ids }, brand: Brand.BBL },
    })

    revalidate({
      paths: ["/app/entitlements"],
      tags: ["entitlements"],
    })
  })

const grantEntitlementSchema = z.object({
  userId: z.string().min(1),
  entitlementKey: z.string().trim().min(1),
  reason: z.string().trim().min(1).max(200).optional(),
})

export const grantUserEntitlement = adminActionClient
  .inputSchema(grantEntitlementSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate, brand, user } }) => {
    const result = await grantAdminEntitlement({
      db,
      brand,
      grantorUserId: user.id,
      granteeUserId: parsedInput.userId,
      entitlementKey: parsedInput.entitlementKey,
      reason: parsedInput.reason,
    })

    revalidate({
      paths: ["/admin/users", `/admin/users/${parsedInput.userId}`],
      tags: ["user-entitlements", `user-entitlements-${parsedInput.userId}`],
    })

    return result
  })

export const revokeUserEntitlement = adminActionClient
  .inputSchema(grantEntitlementSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate, brand, user } }) => {
    const result = await revokeAdminEntitlement({
      db,
      brand,
      grantorUserId: user.id,
      granteeUserId: parsedInput.userId,
      entitlementKey: parsedInput.entitlementKey,
      reason: parsedInput.reason,
    })

    revalidate({
      paths: ["/admin/users", `/admin/users/${parsedInput.userId}`],
      tags: ["user-entitlements", `user-entitlements-${parsedInput.userId}`],
    })

    return result
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
