import {
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_LEGEND_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
} from "~/lib/entitlements/lineage-comp"

export type LineageListingTier = "free" | "premium" | "elite" | "legend"

export type LineageListingRenderPolicy = {
  tier: LineageListingTier
  canRenderFullCard: boolean
  features: {
    avatar: boolean
    school: boolean
    verificationBadge: boolean
    claimBadge: boolean
    bioPreview: boolean
    honorStripAvatar: boolean
  }
}

export type LineageProfileDetailRenderPolicy = {
  tier: LineageListingTier
  canRenderFullProfile: boolean
  features: {
    avatar: boolean
    rankSummary: boolean
    location: boolean
    organizations: boolean
    rankHistory: boolean
    email: boolean
    bio: boolean
    socialLinks: boolean
    qrShare: boolean
  }
}

export const FREE_LINEAGE_LISTING_RENDER_POLICY: LineageListingRenderPolicy = {
  tier: "free",
  canRenderFullCard: false,
  features: {
    avatar: false,
    school: false,
    verificationBadge: true,
    claimBadge: true,
    bioPreview: false,
    honorStripAvatar: false,
  },
}

export const PREMIUM_LINEAGE_LISTING_RENDER_POLICY: LineageListingRenderPolicy = {
  tier: "premium",
  canRenderFullCard: true,
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

export const LEGEND_LINEAGE_LISTING_RENDER_POLICY: LineageListingRenderPolicy = {
  ...PREMIUM_LINEAGE_LISTING_RENDER_POLICY,
  tier: "legend",
}

export const FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY: LineageProfileDetailRenderPolicy = {
  tier: "free",
  canRenderFullProfile: false,
  features: {
    avatar: true,
    rankSummary: true,
    location: false,
    organizations: false,
    rankHistory: false,
    email: false,
    bio: false,
    socialLinks: false,
    qrShare: false,
  },
}

export const PREMIUM_LINEAGE_PROFILE_DETAIL_RENDER_POLICY: LineageProfileDetailRenderPolicy = {
  tier: "premium",
  canRenderFullProfile: true,
  features: {
    avatar: true,
    rankSummary: true,
    location: true,
    organizations: true,
    rankHistory: true,
    email: true,
    bio: true,
    socialLinks: true,
    qrShare: true,
  },
}

export const ELITE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY: LineageProfileDetailRenderPolicy = {
  ...PREMIUM_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
  tier: "elite",
}

export const LEGEND_LINEAGE_PROFILE_DETAIL_RENDER_POLICY: LineageProfileDetailRenderPolicy = {
  ...PREMIUM_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
  tier: "legend",
}

export const LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS = [
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_LEGEND_ENTITLEMENT_KEY,
] as const

export function resolveLineageListingRenderPolicyFromEntitlementKeys(
  entitlementKeys: Iterable<string>,
): LineageListingRenderPolicy {
  const keys = new Set(entitlementKeys)

  if (keys.has(LINEAGE_LEGEND_ENTITLEMENT_KEY)) {
    return LEGEND_LINEAGE_LISTING_RENDER_POLICY
  }

  if (keys.has(LINEAGE_ELITE_ENTITLEMENT_KEY)) {
    return ELITE_LINEAGE_LISTING_RENDER_POLICY
  }

  if (keys.has(LINEAGE_PREMIUM_ENTITLEMENT_KEY)) {
    return PREMIUM_LINEAGE_LISTING_RENDER_POLICY
  }

  return FREE_LINEAGE_LISTING_RENDER_POLICY
}

export function resolveLineageProfileDetailRenderPolicyFromListingPolicy(
  listingPolicy: LineageListingRenderPolicy,
): LineageProfileDetailRenderPolicy {
  if (listingPolicy.tier === "legend") {
    return LEGEND_LINEAGE_PROFILE_DETAIL_RENDER_POLICY
  }

  if (listingPolicy.tier === "elite") {
    return ELITE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY
  }

  if (listingPolicy.tier === "premium") {
    return PREMIUM_LINEAGE_PROFILE_DETAIL_RENDER_POLICY
  }

  return FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY
}

export function resolveLineageProfileDetailRenderPolicyFromEntitlementKeys(
  entitlementKeys: Iterable<string>,
): LineageProfileDetailRenderPolicy {
  return resolveLineageProfileDetailRenderPolicyFromListingPolicy(
    resolveLineageListingRenderPolicyFromEntitlementKeys(entitlementKeys),
  )
}
