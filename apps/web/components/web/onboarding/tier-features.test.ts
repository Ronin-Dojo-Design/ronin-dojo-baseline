// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  getTierFeatures,
  getTierLabel,
  getUpgradeCta,
  normalizeTier,
  type OnboardingTier,
} from "./tier-features"

describe("onboarding tier-features mapper", () => {
  it("labels every tier", () => {
    expect(getTierLabel("free")).toBe("Free Member")
    expect(getTierLabel("premium")).toBe("Premium Member")
    expect(getTierLabel("instructor")).toBe("Instructor")
    expect(getTierLabel("school_owner")).toBe("School Owner")
    expect(getTierLabel("admin")).toBe("Administrator")
  })

  it("returns a non-empty feature list for every tier", () => {
    const tiers: OnboardingTier[] = ["free", "premium", "instructor", "school_owner", "admin"]
    for (const tier of tiers) {
      expect(getTierFeatures(tier).length).toBeGreaterThan(0)
    }
  })

  it("nudges only free members to upgrade (to Premium)", () => {
    const cta = getUpgradeCta("free")
    expect(cta).not.toBeNull()
    expect(cta?.targetTier).toBe("premium")
    expect(cta?.targetTierLabel).toBe("Premium Member")

    expect(getUpgradeCta("premium")).toBeNull()
    expect(getUpgradeCta("instructor")).toBeNull()
    expect(getUpgradeCta("school_owner")).toBeNull()
    expect(getUpgradeCta("admin")).toBeNull()
  })

  it("normalizes unknown/empty tiers to free", () => {
    expect(normalizeTier(null)).toBe("free")
    expect(normalizeTier(undefined)).toBe("free")
    expect(normalizeTier("")).toBe("free")
    expect(normalizeTier("nonsense")).toBe("free")
    expect(normalizeTier("instructor")).toBe("instructor")
  })
})
