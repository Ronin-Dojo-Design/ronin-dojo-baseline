// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dependency.
import { describe, expect, it } from "bun:test"
import { type BeltReviewDetailState, beltReviewDetailState } from "./belt-review-detail-state"

const captured = {
  proposalCapturedAt: new Date("2026-07-16T00:00:00.000Z"),
  expectedPromoterPassportId: "coach-a",
  expectedPromoterName: null,
  proposedPromoterPassportId: "coach-b",
  activePromoterPassportId: "coach-a",
  activePromoterName: null,
}

type DetailStateInput = Parameters<typeof beltReviewDetailState>[0]
type DetailStateCase = {
  name: string
  input: DetailStateInput
  expected: Partial<BeltReviewDetailState>
}

const cases = [
  {
    name: "legacy PENDING",
    input: {
      ...captured,
      status: "PENDING" as const,
      proposalCapturedAt: null,
      expectedPromoterPassportId: null,
      proposedPromoterPassportId: null,
    },
    expected: {
      surface: "legacy",
      canApprove: false,
      showStaleWarning: false,
      statusVariant: "warning",
      statusLabel: "PENDING",
    },
  },
  {
    name: "captured proposal matching the active promoter",
    input: { ...captured, status: "PROPOSAL_PENDING" as const },
    expected: {
      surface: "actions",
      canApprove: true,
      showStaleWarning: false,
      statusVariant: "warning",
      statusLabel: "PENDING",
    },
  },
  {
    name: "captured proposal made stale by an active-promoter change",
    input: {
      ...captured,
      status: "PROPOSAL_PENDING" as const,
      activePromoterPassportId: "coach-c",
    },
    expected: {
      surface: "actions",
      canApprove: false,
      showStaleWarning: true,
      statusVariant: "warning",
      statusLabel: "PENDING",
    },
  },
  {
    name: "malformed captured proposal",
    input: {
      ...captured,
      status: "PROPOSAL_PENDING" as const,
      proposedPromoterPassportId: null,
    },
    expected: {
      surface: "terminal",
      canApprove: false,
      showStaleWarning: false,
      statusVariant: "warning",
      statusLabel: "PENDING",
    },
  },
  {
    name: "approved proposal",
    input: { ...captured, status: "APPROVED" as const },
    expected: {
      surface: "terminal",
      canApprove: false,
      showStaleWarning: false,
      statusVariant: "success",
      statusLabel: "APPROVED",
    },
  },
  {
    name: "denied proposal",
    input: { ...captured, status: "DENIED" as const },
    expected: {
      surface: "terminal",
      canApprove: false,
      showStaleWarning: false,
      statusVariant: "danger",
      statusLabel: "DENIED",
    },
  },
] satisfies DetailStateCase[]

describe("beltReviewDetailState", () => {
  for (const { name, input, expected } of cases) {
    it(`classifies ${name}`, () => {
      expect(beltReviewDetailState(input)).toMatchObject(expected)
    })
  }
})
