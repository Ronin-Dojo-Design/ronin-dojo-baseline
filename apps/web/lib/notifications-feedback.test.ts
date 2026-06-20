/**
 * SESSION_0420 — proof for the public feedback-widget operator notification.
 *
 * Before this, `reportFeedback` only wrote a Report row (type = Feedback) and
 * pinged no one — feedback landed in a table nobody watched. This proves
 * `notifyAdminOfFeedback` routes a real email to the BBL operator inbox
 * (welcome@blackbeltlegacy.com via getBrandSenderEmail) with the SUBMITTER as
 * Reply-To, so the operator can reply directly. DB-free: it stubs Resend and the
 * rate limiter only, and uses the REAL brand-sender resolution.
 *
 * Run:
 *   cd apps/web && bun test lib/notifications-feedback.test.ts
 */

// RESEND_API_KEY must be truthy BEFORE ~/env evaluates, so sendEmail proceeds to
// the (mocked) Resend client instead of short-circuiting. Set before the dynamic
// import of ~/lib/notifications below.
process.env.RESEND_API_KEY = "re_test_feedback"

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { beforeEach, describe, expect, it, mock } from "bun:test"

// Capture the outbound Resend payload instead of sending it.
const sendMock = mock(async (payload: { to: string; replyTo?: string; subject: string }) => ({
  data: { id: "test-email-id", ...payload },
  error: null,
}))

mock.module("~/services/resend", () => ({
  resend: { emails: { send: sendMock } },
  createResendContact: async () => "test-contact",
}))

// No Redis in tests — never rate-limited.
mock.module("~/lib/rate-limiter", () => ({
  isRateLimited: async () => false,
  getIP: async () => "203.0.113.7",
}))

beforeEach(() => {
  sendMock.mockClear()
})

describe("notifyAdminOfFeedback", () => {
  // 30s timeout: the first react-email render() in a cold process can exceed bun's
  // default 5s test timeout (cold-start flake), which would flake CI.
  it("emails the BBL operator inbox with the submitter as Reply-To", async () => {
    const { notifyAdminOfFeedback } = await import("~/lib/notifications")

    await notifyAdminOfFeedback({
      brand: "BBL",
      email: "member@example.com",
      message: "Please add a discipline filter to the lineage tree.",
    })

    expect(sendMock).toHaveBeenCalledTimes(1)
    const payload = sendMock.mock.calls[0][0]

    // Lands in the operator inbox, replyable straight back to the submitter.
    expect(payload.to).toBe("welcome@blackbeltlegacy.com")
    expect(payload.replyTo).toBe("member@example.com")
    expect(payload.from).toContain("Black Belt Legacy")
    expect(payload.subject).toContain("Black Belt Legacy feedback")
    // The submitter's message survives into the rendered email body.
    expect(payload.text).toContain("discipline filter")
  }, 30_000)
})
