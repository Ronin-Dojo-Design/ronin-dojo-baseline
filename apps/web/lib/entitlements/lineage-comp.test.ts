// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  getLineageCompEntitlementKeys,
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
  resolveLineageCohortComp,
} from "~/lib/entitlements/lineage-comp"

describe("resolveLineageCohortComp", () => {
  it("comps the Dirty Dozen cohort lifetime LINEAGE_ELITE", () => {
    const comp = resolveLineageCohortComp(["The Dirty Dozen — BJJ's First American Black Belts"])
    expect(comp).toEqual({ tier: LINEAGE_ELITE_ENTITLEMENT_KEY, termDays: null })
  })

  it("matches the cohort label case-insensitively and as a substring", () => {
    expect(resolveLineageCohortComp(["dirty dozen"])?.tier).toBe(LINEAGE_ELITE_ENTITLEMENT_KEY)
    expect(resolveLineageCohortComp(["Rigan's First Black Belts (the Dirty Dozen)"])?.tier).toBe(
      LINEAGE_ELITE_ENTITLEMENT_KEY,
    )
  })

  it("returns null when no group label matches a cohort rule", () => {
    expect(resolveLineageCohortComp([])).toBeNull()
    expect(resolveLineageCohortComp(["Promotion 2024", "Black Belts"])).toBeNull()
  })

  it("expands the cohort tier to cumulative entitlement keys (ELITE ⊇ PREMIUM)", () => {
    const comp = resolveLineageCohortComp(["Dirty Dozen"])
    expect(comp).not.toBeNull()
    expect([...getLineageCompEntitlementKeys(comp!.tier)].sort()).toEqual(
      [LINEAGE_ELITE_ENTITLEMENT_KEY, LINEAGE_PREMIUM_ENTITLEMENT_KEY].sort(),
    )
  })
})
