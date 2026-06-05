import type { Brand } from "~/.generated/prisma/client"
import {
  FREE_LINEAGE_LISTING_RENDER_POLICY,
  LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS,
  type LineageListingRenderPolicy,
  resolveLineageListingRenderPolicyFromEntitlementKeys,
} from "~/lib/entitlements/lineage-tier-policy"
import { db } from "~/services/db"

export async function getLineageListingRenderPolicyForUser({
  userId,
  brand,
  now = new Date(),
}: {
  userId?: string | null
  brand: Brand
  now?: Date
}): Promise<LineageListingRenderPolicy> {
  if (!userId) {
    return FREE_LINEAGE_LISTING_RENDER_POLICY
  }

  const grants = await db.userEntitlement.findMany({
    where: {
      userId,
      status: "ACTIVE",
      entitlement: {
        brand,
        key: { in: [...LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS] },
      },
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
    select: {
      entitlement: { select: { key: true } },
    },
  })

  return resolveLineageListingRenderPolicyFromEntitlementKeys(
    grants.map(grant => grant.entitlement.key),
  )
}
