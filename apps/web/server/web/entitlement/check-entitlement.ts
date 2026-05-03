import type { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * Check whether a user holds an active entitlement.
 * Returns true if at least one ACTIVE UserEntitlement exists
 * whose endsAt is null or in the future.
 */
export async function checkEntitlement({
  userId,
  entitlementKey,
  brand,
}: {
  userId: string
  entitlementKey: string
  brand: Brand
}): Promise<boolean> {
  const now = new Date()

  const count = await db.userEntitlement.count({
    where: {
      userId,
      status: "ACTIVE",
      entitlement: { key: entitlementKey, brand },
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
  })

  return count > 0
}
