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

  it("keeps free profile detail to avatar/name/rank summary features", () => {
    const policy = resolveLineageProfileDetailRenderPolicyFromEntitlementKeys([])

    expect(policy.tier).toBe("free")
    expect(policy.canRenderFullProfile).toBe(false)
    expect(policy.features.avatar).toBe(true)
    expect(policy.features.rankSummary).toBe(true)
    expect(policy.features.bio).toBe(false)
    expect(policy.features.socialLinks).toBe(false)
    expect(policy.features.organizations).toBe(false)
  })

  it("maps premium profile detail to full public profile publishing", () => {
    const policy = resolveLineageProfileDetailRenderPolicyFromEntitlementKeys([
      LINEAGE_PREMIUM_ENTITLEMENT_KEY,
    ])

    expect(policy.tier).toBe("premium")
    expect(policy.canRenderFullProfile).toBe(true)
    expect(policy.features.bio).toBe(true)
    expect(policy.features.socialLinks).toBe(true)
    expect(policy.features.rankHistory).toBe(true)
    expect(policy.features.qrShare).toBe(true)
  })

  it("maps legend profile detail to full public profile publishing", () => {
    const policy = resolveLineageProfileDetailRenderPolicyFromEntitlementKeys([
      LINEAGE_LEGEND_ENTITLEMENT_KEY,
    ])

    expect(policy.tier).toBe("legend")
    expect(policy.canRenderFullProfile).toBe(true)
    expect(policy.features.bio).toBe(true)
    expect(policy.features.qrShare).toBe(true)
  })
})
