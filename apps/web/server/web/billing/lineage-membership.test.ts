/**
 * SESSION_0473 TASK_03 — black-belt-rate plan eligibility marker + filter.
 *
 * Run: cd apps/web && bun run test server/web/billing/lineage-membership.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  filterPlansForBlackBeltEligibility,
  type LineageMembershipPlan,
  parseLineageMembershipPlanMetadata,
} from "./lineage-membership"

const plan = (overrides: Partial<LineageMembershipPlan>): LineageMembershipPlan => ({
  id: "p",
  name: "Plan",
  pricingModel: "ANNUAL" as LineageMembershipPlan["pricingModel"],
  amountCents: 6500,
  currency: "usd",
  intervalMonths: 12,
  organizationId: "org",
  stripePriceId: "price_x",
  summary: null,
  features: [],
  ctaLabel: "Join",
  requiresBlackBelt: false,
  entitlementKeys: [],
  ...overrides,
})

describe("parseLineageMembershipPlanMetadata", () => {
  it("flags requiresBlackBelt from the eligibility marker", () => {
    expect(
      parseLineageMembershipPlanMetadata({
        surface: "lineage_membership",
        eligibility: "black_belt",
      })?.requiresBlackBelt,
    ).toBe(true)
  })

  it("defaults requiresBlackBelt to false without the marker", () => {
    expect(
      parseLineageMembershipPlanMetadata({ surface: "lineage_membership" })?.requiresBlackBelt,
    ).toBe(false)
  })

  it("returns null for non-membership metadata", () => {
    expect(parseLineageMembershipPlanMetadata({ surface: "other" })).toBeNull()
  })
})

describe("filterPlansForBlackBeltEligibility", () => {
  const plans = [
    plan({ id: "premium", requiresBlackBelt: false }),
    plan({ id: "elite", requiresBlackBelt: false }),
    plan({ id: "elite-bb", requiresBlackBelt: true }),
  ]

  it("hides the black-belt-rate plan for an ineligible viewer", () => {
    expect(filterPlansForBlackBeltEligibility(plans, false).map(p => p.id)).toEqual([
      "premium",
      "elite",
    ])
  })

  it("shows every plan for an eligible viewer", () => {
    expect(filterPlansForBlackBeltEligibility(plans, true).map(p => p.id)).toEqual([
      "premium",
      "elite",
      "elite-bb",
    ])
  })
})
