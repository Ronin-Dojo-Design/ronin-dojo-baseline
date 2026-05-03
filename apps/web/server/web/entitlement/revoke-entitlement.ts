"use server"

import { z } from "zod"
import { getRequestBrand } from "~/lib/brand-context"
import { userActionClient } from "~/lib/safe-actions"

const revokeEntitlementSchema = z.object({
  userId: z.string().min(1),
  entitlementKey: z.string().min(1),
})

/**
 * Revoke an entitlement for a user. Sets status to REVOKED.
 */
export const revokeEntitlement = userActionClient
  .schema(revokeEntitlementSchema)
  .action(async ({ parsedInput: input, ctx: { db } }) => {
    const brand = await getRequestBrand()

    const entitlement = await db.entitlement.findUnique({
      where: { brand_key: { brand, key: input.entitlementKey } },
    })

    if (!entitlement) {
      throw new Error(`Entitlement "${input.entitlementKey}" not found for brand ${brand}`)
    }

    // Revoke all active grants for this user + entitlement
    return db.userEntitlement.updateMany({
      where: {
        userId: input.userId,
        entitlementId: entitlement.id,
        status: "ACTIVE",
      },
      data: { status: "REVOKED" },
    })
  })
