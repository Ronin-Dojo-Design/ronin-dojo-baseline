// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { SOCIAL_QUEUE_STATUSES } from "~/server/social-queue/schema"
import {
  canTransition,
  CONSENT_REVOKED_REASON,
  evaluateApprovalConsent,
  REJECTABLE_STATUSES,
  SOCIAL_QUEUE_TRANSITIONS,
} from "~/server/social-queue/transitions"

/**
 * The two non-negotiables of the social approval queue (SESSION_0686), pinned:
 *   1. NOTHING publishes — the status machine has NO edge into PUBLISHED.
 *   2. Consent is a precondition — person-centric approval fails closed without a live,
 *      verifiable affirmative signal.
 */

describe("status machine — allowed transitions (spec §3)", () => {
  it("DRAFT → APPROVED is legal (the human sign-off)", () => {
    expect(canTransition("DRAFT", "APPROVED")).toBe(true)
  })

  it("DRAFT → REJECTED is legal", () => {
    expect(canTransition("DRAFT", "REJECTED")).toBe(true)
  })

  it("APPROVED → REJECTED is legal (pulled before publish, incl. consent revocation)", () => {
    expect(canTransition("APPROVED", "REJECTED")).toBe(true)
  })

  it("REJECTABLE_STATUSES derives exactly DRAFT and APPROVED from the map", () => {
    expect([...REJECTABLE_STATUSES].sort()).toEqual(["APPROVED", "DRAFT"])
  })
})

describe("status machine — NOTHING publishes (non-negotiable #1)", () => {
  it("NO state has an edge into PUBLISHED — approval STOPS the machine", () => {
    for (const from of SOCIAL_QUEUE_STATUSES) {
      expect(canTransition(from, "PUBLISHED")).toBe(false)
    }
  })

  it("the transition map literally contains no PUBLISHED target (belt & braces)", () => {
    for (const targets of Object.values(SOCIAL_QUEUE_TRANSITIONS)) {
      expect(targets).not.toContain("PUBLISHED")
    }
  })

  it("REJECTED is terminal — a rejected item can NEVER re-enter the flow (so it can never publish)", () => {
    expect(SOCIAL_QUEUE_TRANSITIONS.REJECTED).toEqual([])
    expect(canTransition("REJECTED", "APPROVED")).toBe(false)
    expect(canTransition("REJECTED", "DRAFT")).toBe(false)
    expect(canTransition("REJECTED", "REJECTED")).toBe(false)
  })

  it("PUBLISHED is terminal — a published item never re-enters review", () => {
    expect(SOCIAL_QUEUE_TRANSITIONS.PUBLISHED).toEqual([])
  })

  it("self-transitions are not legal (no idempotent re-approve double-stamping)", () => {
    expect(canTransition("APPROVED", "APPROVED")).toBe(false)
    expect(canTransition("DRAFT", "DRAFT" as never)).toBe(false)
  })

  it("unknown states fail closed", () => {
    expect(canTransition("SCHEDULED", "APPROVED")).toBe(false)
    expect(canTransition("", "REJECTED")).toBe(false)
  })
})

describe("consent gate — evaluateApprovalConsent (spec §2.3, non-negotiable #2)", () => {
  const optedIn = { userId: "user-1", allowSocialCelebration: true }
  const notOptedIn = { userId: "user-1", allowSocialCelebration: false }
  const placeholder = { userId: null, allowSocialCelebration: false }

  it("AGGREGATE_ONLY passes with no subject — aggregate numbers name no person", () => {
    expect(evaluateApprovalConsent({ consentBasis: "AGGREGATE_ONLY", passport: null })).toEqual({
      ok: true,
    })
  })

  it("OWNED_CONTENT passes — brand editorial has no member subject", () => {
    expect(evaluateApprovalConsent({ consentBasis: "OWNED_CONTENT", passport: null })).toEqual({
      ok: true,
    })
  })

  it("MEMBER_OPT_IN with NO subject Passport → consent-revoked (structural fail-closed)", () => {
    expect(evaluateApprovalConsent({ consentBasis: "MEMBER_OPT_IN", passport: null })).toEqual({
      ok: false,
      reason: "consent-revoked",
    })
  })

  it("MEMBER_OPT_IN with an UNCLAIMED (placeholder) Passport → consent-revoked — an accountless person cannot have consented", () => {
    expect(
      evaluateApprovalConsent({ consentBasis: "MEMBER_OPT_IN", passport: placeholder }),
    ).toEqual({ ok: false, reason: "consent-revoked" })
  })

  it("MEMBER_OPT_IN: claimed subject HOLDING the allowSocialCelebration opt-in → ok (fork F2, ratified SESSION_0705)", () => {
    // The deliberate flip of 0686's pinned fail-closed test: F2 is ratified, the opt-in bit
    // exists, and "ok when the bit is true, consent-revoked when false" is now the law.
    expect(evaluateApprovalConsent({ consentBasis: "MEMBER_OPT_IN", passport: optedIn })).toEqual({
      ok: true,
    })
  })

  it("MEMBER_OPT_IN: claimed subject WITHOUT the opt-in (default OFF) → consent-revoked — no affirmative signal, no approval", () => {
    expect(
      evaluateApprovalConsent({ consentBasis: "MEMBER_OPT_IN", passport: notOptedIn }),
    ).toEqual({ ok: false, reason: "consent-revoked" })
  })

  it("MEMBER_OPT_IN: an UNCLAIMED Passport with the bit somehow true is STILL revoked — structural legs run first", () => {
    expect(
      evaluateApprovalConsent({
        consentBasis: "MEMBER_OPT_IN",
        passport: { userId: null, allowSocialCelebration: true },
      }),
    ).toEqual({ ok: false, reason: "consent-revoked" })
  })

  it("an unknown consent basis fails closed — never approve what cannot be classified", () => {
    expect(evaluateApprovalConsent({ consentBasis: "IMPLIED", passport: optedIn })).toEqual({
      ok: false,
      reason: "unknown-basis",
    })
    expect(evaluateApprovalConsent({ consentBasis: "", passport: null })).toEqual({
      ok: false,
      reason: "unknown-basis",
    })
  })

  it("the machine-set revocation reason is the spec's literal", () => {
    expect(CONSENT_REVOKED_REASON).toBe("consent-revoked")
  })
})
