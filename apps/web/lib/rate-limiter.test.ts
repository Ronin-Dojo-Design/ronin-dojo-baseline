// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { shouldFailClosed } from "./rate-limiter"

// RISK #5: when Redis is configured but the limiter errors, sensitive (public /
// abuse-prone / auth-adjacent) buckets must fail CLOSED (block), while the
// authenticated actor-keyed write buckets stay fail-OPEN (don't block legit work
// on a transient blip). This pins that classification so a new bucket is a
// conscious choice, not an accidental fail-open. The behavior only applies on the
// limiter-error path; the no-Redis path (dev/CI) always fails open.

describe("rate-limiter fail-closed classification (RISK #5)", () => {
  it("fails CLOSED for the public / abuse-prone / auth-adjacent buckets", () => {
    for (const bucket of [
      "claim",
      "invite",
      "evidence_upload",
      "avatar_upload",
      "teaser_signup",
      "email_notify",
      "submission",
      "report",
    ]) {
      expect(shouldFailClosed(bucket)).toBe(true)
    }
  })

  it("stays fail-OPEN for authenticated actor-keyed write buckets", () => {
    for (const bucket of [
      "schedule_write",
      "attendance_write",
      "enrollment_write",
      "family_write",
      "waiver_write",
      "lead_write",
      "trial_book",
      "instructor_search",
      "newsletter",
    ]) {
      expect(shouldFailClosed(bucket)).toBe(false)
    }
  })

  it("defaults unknown buckets to fail-open (availability over a typo blocking traffic)", () => {
    expect(shouldFailClosed("does_not_exist")).toBe(false)
  })
})
