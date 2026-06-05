// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
} from "~/lib/entitlements/lineage-comp"
import { resolveLineageListingRenderPolicyFromEntitlementKeys } from "~/lib/entitlements/lineage-tier-policy"

describe("lineage listing render policy", () => {
  it("defaults to free with no full-card rendering", () => {
    const policy = resolveLineageListingRenderPolicyFromEntitlementKeys([])

    expect(policy.tier).toBe("free")
    expect(policy.canRenderFullCard).toBe(false)
    expect(policy.canOpenProfileDrawer).toBe(false)
    expect(policy.features.avatar).toBe(false)
  })

  it("maps premium entitlement to full-card rendering", () => {
    const policy = resolveLineageListingRenderPolicyFromEntitlementKeys([
      LINEAGE_PREMIUM_ENTITLEMENT_KEY,
    ])

    expect(policy.tier).toBe("premium")
    expect(policy.canRenderFullCard).toBe(true)
    expect(policy.canOpenProfileDrawer).toBe(true)
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
})
