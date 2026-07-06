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

/**
 * The public directory-detail render policy. Split into two gates (SESSION_0502, operator-
 * ratified): every claimed profile publishes the full BASIC identity (name/avatar/bio/rank
 * history/organizations/ancestry), so `canRenderProfile` is true for ALL tiers incl. free.
 * Premium+ additionally unlocks RICH MEDIA (cover photo, video intro, social links, location,
 * email, analytics), gated behind `canRenderRichMedia`. The `features` map is now interpreted
 * as the per-field RICH gate (basic fields — bio/rankHistory/organizations — are granted on
 * free too, so their flags are `true` at every tier).
 */
export type LineageProfileDetailRenderPolicy = {
  tier: LineageListingTier
  /** Basic identity+bio+school+ranks+ancestry — true for ALL tiers incl. free. */
  canRenderProfile: boolean
  /** Cover/video/social/location/email/analytics — premium+ only. */
  canRenderRichMedia: boolean
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
    // @changed SESSION_0474 (S2, D472-15) — the free tier's immediate value: a free
    // member shows their avatar + name + (self-declared) belt and stays listed under
    // their instructor. The full card (school label, bio preview, honor-strip avatar)
    // stays Premium+ — only the identity avatar is granted free.
    avatar: true,
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
  // @changed SESSION_0502 (TASK_03, operator-ratified) — a free claimed profile now renders
  // the FULL BASIC public profile: bio, full rank history, and organizations are granted on
  // free (`canRenderProfile: true`). Only RICH MEDIA (cover/video/social/location/email) stays
  // gated to premium+ (`canRenderRichMedia: false`).
  canRenderProfile: true,
  canRenderRichMedia: false,
  features: {
    avatar: true,
    rankSummary: true,
    // Basic-tier fields — granted on free.
    bio: true,
    rankHistory: true,
    organizations: true,
    // Rich-media fields — gated to premium+.
    location: false,
    email: false,
    socialLinks: false,
    qrShare: false,
  },
}

export const PREMIUM_LINEAGE_PROFILE_DETAIL_RENDER_POLICY: LineageProfileDetailRenderPolicy = {
  tier: "premium",
  canRenderProfile: true,
  canRenderRichMedia: true,
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
