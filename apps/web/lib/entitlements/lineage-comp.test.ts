// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  BBL_CLAIM_COMP_TERM_DAYS,
  bblClaimCompTermDays,
  getLineageCompEntitlementKeys,
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
} from "~/lib/entitlements/lineage-comp"

describe("BBL claim comp term (graphify comp gift epic)", () => {
  it("grants the Dirty Dozen lifetime access (null term = no end date)", () => {
    expect(bblClaimCompTermDays(true)).toBeNull()
  })

  it("grants everyone else one year", () => {
    expect(bblClaimCompTermDays(false)).toBe(365)
    expect(BBL_CLAIM_COMP_TERM_DAYS).toBe(365)
  })
})

describe("lineage comp entitlement keys are cumulative", () => {
  it("Elite comp also grants Premium (so Elite implies Premium access)", () => {
    expect(getLineageCompEntitlementKeys(LINEAGE_ELITE_ENTITLEMENT_KEY)).toEqual([
      LINEAGE_PREMIUM_ENTITLEMENT_KEY,
      LINEAGE_ELITE_ENTITLEMENT_KEY,
    ])
  })
})
