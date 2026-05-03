import { db } from "~/services/db"

/**
 * Expire all ACTIVE UserEntitlements whose endsAt has passed.
 * Intended to be called from a cron job.
 */
export async function expireEntitlements(): Promise<number> {
  const now = new Date()

  const result = await db.userEntitlement.updateMany({
    where: {
      status: "ACTIVE",
      endsAt: { lte: now },
    },
    data: { status: "EXPIRED" },
  })

  return result.count
}
