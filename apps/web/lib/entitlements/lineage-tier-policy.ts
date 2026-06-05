import {
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
} from "~/lib/entitlements/lineage-comp"

export type LineageListingTier = "free" | "premium" | "elite"

export type LineageListingRenderPolicy = {
  tier: LineageListingTier
  canRenderFullCard: boolean
  canOpenProfileDrawer: boolean
  features: {
    avatar: boolean
    school: boolean
    verificationBadge: boolean
    claimBadge: boolean
    bioPreview: boolean
    honorStripAvatar: boolean
  }
}

export const FREE_LINEAGE_LISTING_RENDER_POLICY: LineageListingRenderPolicy = {
  tier: "free",
  canRenderFullCard: false,
  canOpenProfileDrawer: false,
  features: {
    avatar: false,
    school: false,
    verificationBadge: false,
    claimBadge: false,
    bioPreview: false,
    honorStripAvatar: false,
  },
}

export const PREMIUM_LINEAGE_LISTING_RENDER_POLICY: LineageListingRenderPolicy = {
  tier: "premium",
  canRenderFullCard: true,
  canOpenProfileDrawer: true,
  features: {
    avatar: true,
    school: true,
    verificationBadge: true,
    claimBadge: true,
    bioPreview: true,
    honorStripAvatar: true,
  },
}

export const ELITE_LINEAGE_LISTING_RENDER_POLICY: LineageListingRenderPolicy = {
  ...PREMIUM_LINEAGE_LISTING_RENDER_POLICY,
  tier: "elite",
}

export const LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS = [
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
  LINEAGE_ELITE_ENTITLEMENT_KEY,
] as const

export function resolveLineageListingRenderPolicyFromEntitlementKeys(
  entitlementKeys: Iterable<string>,
): LineageListingRenderPolicy {
  const keys = new Set(entitlementKeys)

  if (keys.has(LINEAGE_ELITE_ENTITLEMENT_KEY)) {
    return ELITE_LINEAGE_LISTING_RENDER_POLICY
  }

  if (keys.has(LINEAGE_PREMIUM_ENTITLEMENT_KEY)) {
    return PREMIUM_LINEAGE_LISTING_RENDER_POLICY
  }

  return FREE_LINEAGE_LISTING_RENDER_POLICY
}
