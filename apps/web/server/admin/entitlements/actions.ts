"use server"

import { after } from "next/server"
import { z } from "zod"
import { getRequestBrand } from "~/lib/brand-context"
import { adminActionClient } from "~/lib/safe-actions"
import { entitlementSchema } from "~/server/admin/entitlements/schema"
import { idsSchema } from "~/server/admin/shared/schema"

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
      tags: ["user-entitlements"],
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
      tags: ["user-entitlements"],
    })
  })
