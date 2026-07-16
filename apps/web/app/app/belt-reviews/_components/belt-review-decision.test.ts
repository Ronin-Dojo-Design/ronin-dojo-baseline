// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dependency.
import { describe, expect, it } from "bun:test"
import { getBeltReviewDecisionCopy } from "./belt-review-decision"

describe("belt-review decision copy", () => {
  it("locks the approve confirmation to applying the proposal and verifying the belt", () => {
    expect(
      getBeltReviewDecisionCopy("approve", {
        memberName: "Avery Kim",
        rankName: "Brown Belt",
        proposedPromoterName: "Professor Silva",
      }),
    ).toEqual({
      title: "Approve promoter change?",
      description:
        "Apply Professor Silva as the promoter for Avery Kim’s Brown Belt and mark the belt VERIFIED? This cannot be undone from this review.",
      confirmLabel: "Approve and verify",
      confirmVariant: "primary",
    })
  })

  it("does not append a second belt label to degree-ranked belt names", () => {
    expect(
      getBeltReviewDecisionCopy("approve", {
        memberName: "Avery Kim",
        rankName: "Black Belt - 1st Degree",
        proposedPromoterName: "Professor Silva",
      }).description,
    ).toBe(
      "Apply Professor Silva as the promoter for Avery Kim’s Black Belt - 1st Degree and mark the belt VERIFIED? This cannot be undone from this review.",
    )
  })

  it("locks denial to retaining current provenance and not applying the proposal", () => {
    expect(
      getBeltReviewDecisionCopy("deny", {
        memberName: "Avery Kim",
        rankName: "Brown Belt",
        proposedPromoterName: "Professor Silva",
      }),
    ).toEqual({
      title: "Deny promoter change?",
      description:
        "Deny Professor Silva as the proposed promoter for Avery Kim’s Brown Belt? The current promoter stays unchanged. This cannot be undone from this review.",
      confirmLabel: "Deny proposal",
      confirmVariant: "destructive",
    })
  })
})
