// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  getLineageCompEntitlementKeys,
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_LEGEND_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
} from "~/lib/entitlements/lineage-comp"
import {
  resolveLineageListingRenderPolicyFromEntitlementKeys,
  resolveLineageProfileDetailRenderPolicyFromEntitlementKeys,
} from "~/lib/entitlements/lineage-tier-policy"

describe("lineage listing render policy", () => {
  it("defaults to free with no full-card rendering", () => {
    const policy = resolveLineageListingRenderPolicyFromEntitlementKeys([])

    expect(policy.tier).toBe("free")
    expect(policy.canRenderFullCard).toBe(false)
    // SESSION_0474 (S2): the free tier shows its avatar (immediate value) while the
    // rest of the full card (school, bio preview, honor-strip avatar) stays Premium+.
    expect(policy.features.avatar).toBe(true)
    expect(policy.features.school).toBe(false)
    expect(policy.features.honorStripAvatar).toBe(false)
    expect(policy.features.verificationBadge).toBe(true)
    expect(policy.features.claimBadge).toBe(true)
  })

  it("maps premium entitlement to full-card rendering", () => {
    const policy = resolveLineageListingRenderPolicyFromEntitlementKeys([
      LINEAGE_PREMIUM_ENTITLEMENT_KEY,
    ])

    expect(policy.tier).toBe("premium")
    expect(policy.canRenderFullCard).toBe(true)
    expect(policy.features.school).toBe(true)
  })

  it("treats elite as the top-tier superset even if premium is absent", () => {
    const policy = resolveLineageListingRenderPolicyFromEntitlementKeys([
      LINEAGE_ELITE_ENTITLEMENT_KEY,
    ])

    expect(policy.tier).toBe("elite")
    expect(policy.canRenderFullCard).toBe(true)
    expect(policy.features.bioPreview).toBe(true)
  })

  it("keeps elite above premium when both entitlement keys are present", () => {
    const policy = resolveLineageListingRenderPolicyFromEntitlementKeys([
      LINEAGE_PREMIUM_ENTITLEMENT_KEY,
      LINEAGE_ELITE_ENTITLEMENT_KEY,
    ])

    expect(policy.tier).toBe("elite")
  })

  it("treats legend as the top full-feature tier", () => {
    const policy = resolveLineageListingRenderPolicyFromEntitlementKeys([
      LINEAGE_PREMIUM_ENTITLEMENT_KEY,
      LINEAGE_ELITE_ENTITLEMENT_KEY,
      LINEAGE_LEGEND_ENTITLEMENT_KEY,
    ])

    expect(policy.tier).toBe("legend")
    expect(policy.canRenderFullCard).toBe(true)
  })

  it("expands legend comp grants to all lineage listing feature entitlements", () => {
    expect(getLineageCompEntitlementKeys(LINEAGE_LEGEND_ENTITLEMENT_KEY)).toEqual([
      LINEAGE_PREMIUM_ENTITLEMENT_KEY,
      LINEAGE_ELITE_ENTITLEMENT_KEY,
      LINEAGE_LEGEND_ENTITLEMENT_KEY,
    ])
  })

  it("publishes basic profile detail (bio/ranks/orgs) for free while gating rich media", () => {
    // @changed SESSION_0502 — the free tier now renders the full BASIC profile
    // (bio + rank history + organizations) and gates only rich media (cover/video/social/
    // location/email). `canRenderProfile` is true for all tiers; `canRenderRichMedia` is
    // premium+.
    const policy = resolveLineageProfileDetailRenderPolicyFromEntitlementKeys([])

    expect(policy.tier).toBe("free")
    expect(policy.canRenderProfile).toBe(true)
    expect(policy.canRenderRichMedia).toBe(false)
    // Basic features unlocked on free.
    expect(policy.features.avatar).toBe(true)
    expect(policy.features.rankSummary).toBe(true)
    expect(policy.features.bio).toBe(true)
    expect(policy.features.rankHistory).toBe(true)
    expect(policy.features.organizations).toBe(true)
    // Rich-media features still gated on free.
    expect(policy.features.socialLinks).toBe(false)
    expect(policy.features.location).toBe(false)
    expect(policy.features.email).toBe(false)
  })

  it("unlocks rich media for premium profile detail", () => {
    const policy = resolveLineageProfileDetailRenderPolicyFromEntitlementKeys([
      LINEAGE_PREMIUM_ENTITLEMENT_KEY,
    ])

    expect(policy.tier).toBe("premium")
    expect(policy.canRenderProfile).toBe(true)
    expect(policy.canRenderRichMedia).toBe(true)
    expect(policy.features.bio).toBe(true)
    expect(policy.features.socialLinks).toBe(true)
    expect(policy.features.location).toBe(true)
    expect(policy.features.rankHistory).toBe(true)
    expect(policy.features.qrShare).toBe(true)
  })

  it("unlocks rich media for legend profile detail", () => {
    const policy = resolveLineageProfileDetailRenderPolicyFromEntitlementKeys([
      LINEAGE_LEGEND_ENTITLEMENT_KEY,
    ])

    expect(policy.tier).toBe("legend")
    expect(policy.canRenderProfile).toBe(true)
    expect(policy.canRenderRichMedia).toBe(true)
    expect(policy.features.bio).toBe(true)
    expect(policy.features.qrShare).toBe(true)
  })
})
