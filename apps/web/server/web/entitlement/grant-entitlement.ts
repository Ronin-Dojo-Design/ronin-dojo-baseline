"use server"

import { z } from "zod"
import type { Brand, EntitlementSourceType } from "~/.generated/prisma/client"
import { getRequestBrand } from "~/lib/brand-context"
import { userActionClient } from "~/lib/safe-actions"

const grantEntitlementSchema = z.object({
  userId: z.string().min(1),
  entitlementKey: z.string().min(1),
  sourceType: z.enum(["PURCHASE", "SUBSCRIPTION", "MANUAL_GRANT", "MEMBERSHIP", "PROMO"]),
  sourceId: z.string().optional(),
  endsAt: z.coerce.date().optional(),
})

/**
 * Grant an entitlement to a user. Idempotent — upserts by
 * userId + entitlementId + sourceId.
 */
export const grantEntitlement = userActionClient
  .schema(grantEntitlementSchema)
  .action(async ({ parsedInput: input, ctx: { db } }) => {
    const brand = await getRequestBrand()

    // Resolve entitlement by key + brand
    const entitlement = await db.entitlement.findUnique({
      where: { brand_key: { brand, key: input.entitlementKey } },
    })

    if (!entitlement) {
      throw new Error(`Entitlement "${input.entitlementKey}" not found for brand ${brand}`)
    }

    // Upsert: find existing by userId + entitlementId + sourceId, else create
    const existing = await db.userEntitlement.findFirst({
      where: {
        userId: input.userId,
        entitlementId: entitlement.id,
        sourceId: input.sourceId ?? null,
      },
    })

    if (existing) {
      return db.userEntitlement.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          startsAt: new Date(),
          endsAt: input.endsAt ?? null,
        },
      })
    }

    return db.userEntitlement.create({
      data: {
        userId: input.userId,
        entitlementId: entitlement.id,
        sourceType: input.sourceType as EntitlementSourceType,
        sourceId: input.sourceId,
        endsAt: input.endsAt,
      },
    })
  })
