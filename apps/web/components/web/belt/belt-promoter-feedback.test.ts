// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dependency.
import { describe, expect, it } from "bun:test"
import {
  reconcileRecruitedPromoterPassportIds,
  resolvePromoterFeedbackIntent,
} from "./belt-promoter-feedback"

describe("promoter feedback intent", () => {
  it("describes established active B → authority anchor A as a proposal", () => {
    expect(
      resolvePromoterFeedbackIntent({
        selectedPromoterPassportId: "pp-anchor-a",
        activePromoterPassportId: "pp-established-b",
        anchorPromoterPassportId: "pp-anchor-a",
        recruitedPromoterPassportIds: new Set(),
        hasTypedName: true,
      }),
    ).toBe("proposal")
  })

  it("keeps an initial established non-anchor choice unverified without promising confirmation", () => {
    expect(
      resolvePromoterFeedbackIntent({
        selectedPromoterPassportId: "pp-established-b",
        activePromoterPassportId: null,
        anchorPromoterPassportId: "pp-anchor-a",
        recruitedPromoterPassportIds: new Set(),
        hasTypedName: true,
      }),
    ).toBe("unverified")
  })

  it("classifies an established active coach correctly even when the capped picker omitted them", () => {
    expect(
      resolvePromoterFeedbackIntent({
        selectedPromoterPassportId: "pp-established-b",
        activePromoterPassportId: "pp-established-off-picker",
        anchorPromoterPassportId: "pp-anchor-a",
        recruitedPromoterPassportIds: new Set(),
        hasTypedName: true,
      }),
    ).toBe("proposal")
  })

  it("keeps a recruited placeholder distinct from established coaches", () => {
    expect(
      resolvePromoterFeedbackIntent({
        selectedPromoterPassportId: "pp-recruited",
        activePromoterPassportId: null,
        anchorPromoterPassportId: "pp-anchor-a",
        recruitedPromoterPassportIds: new Set(["pp-recruited"]),
        hasTypedName: true,
      }),
    ).toBe("recruit")
  })

  it("keeps a newly recruited coach classified after a same-session save", () => {
    const recruitedPromoterPassportIds = reconcileRecruitedPromoterPassportIds(new Set(), {
      awardedByPassportId: "pp-new-recruited",
      promoterIsRecruited: true,
    })

    expect(
      resolvePromoterFeedbackIntent({
        selectedPromoterPassportId: "pp-established",
        activePromoterPassportId: "pp-new-recruited",
        anchorPromoterPassportId: "pp-anchor",
        recruitedPromoterPassportIds,
        hasTypedName: true,
      }),
    ).toBe("unverified")
  })
})
