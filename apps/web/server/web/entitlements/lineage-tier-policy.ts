import type { Brand } from "~/.generated/prisma/client"
import {
  FREE_LINEAGE_LISTING_RENDER_POLICY,
  LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS,
  type LineageListingRenderPolicy,
  type LineageProfileDetailRenderPolicy,
  resolveLineageListingRenderPolicyFromEntitlementKeys,
  resolveLineageProfileDetailRenderPolicyFromListingPolicy,
} from "~/lib/entitlements/lineage-tier-policy"
import { activeEntitlementWhereForUsers } from "~/server/web/entitlements/active-entitlement"
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

  const policies = await getLineageListingRenderPoliciesForUsers({
    userIds: [userId],
    brand,
    now,
  })

  return policies.get(userId) ?? FREE_LINEAGE_LISTING_RENDER_POLICY
}

export async function getLineageListingRenderPoliciesForUsers({
  userIds,
  brand,
  now = new Date(),
}: {
  userIds: string[]
  brand: Brand
  now?: Date
}): Promise<Map<string, LineageListingRenderPolicy>> {
  const uniqueUserIds = [...new Set(userIds)].filter(Boolean)
  const policies = new Map<string, LineageListingRenderPolicy>()

  for (const userId of uniqueUserIds) {
    policies.set(userId, FREE_LINEAGE_LISTING_RENDER_POLICY)
  }

  if (uniqueUserIds.length === 0) {
    return policies
  }

  // WL-P3-39 (SESSION_0535 FI-028): shares the active-tier-entitlement `where` predicate via
  // `activeEntitlementWhereForUsers`, NOT the single-user `hasAnyActiveEntitlement` boolean helper —
  // this is a genuinely different shape (batch `findMany` across many users, needs each user's
  // matched `entitlement.key`s to resolve their tier, not just an any-match boolean).
  const grants = await db.userEntitlement.findMany({
    where: activeEntitlementWhereForUsers({
      userIds: uniqueUserIds,
      keys: LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS,
      brand,
      now,
    }),
    select: {
      userId: true,
      entitlement: { select: { key: true } },
    },
  })

  const keysByUserId = new Map<string, string[]>()
  for (const grant of grants) {
    const keys = keysByUserId.get(grant.userId) ?? []
    keys.push(grant.entitlement.key)
    keysByUserId.set(grant.userId, keys)
  }

  for (const [userId, keys] of keysByUserId) {
    policies.set(userId, resolveLineageListingRenderPolicyFromEntitlementKeys(keys))
  }

  return policies
}

export async function getLineageProfileDetailRenderPolicyForUser({
  userId,
  brand,
  now = new Date(),
}: {
  userId?: string | null
  brand: Brand
  now?: Date
}): Promise<LineageProfileDetailRenderPolicy> {
  return resolveLineageProfileDetailRenderPolicyFromListingPolicy(
    await getLineageListingRenderPolicyForUser({ userId, brand, now }),
  )
}

export async function getLineageProfileDetailRenderPoliciesForUsers({
  userIds,
  brand,
  now = new Date(),
}: {
  userIds: string[]
  brand: Brand
  now?: Date
}): Promise<Map<string, LineageProfileDetailRenderPolicy>> {
  const listingPolicies = await getLineageListingRenderPoliciesForUsers({ userIds, brand, now })
  const policies = new Map<string, LineageProfileDetailRenderPolicy>()

  for (const [userId, policy] of listingPolicies) {
    policies.set(userId, resolveLineageProfileDetailRenderPolicyFromListingPolicy(policy))
  }

  return policies
}
