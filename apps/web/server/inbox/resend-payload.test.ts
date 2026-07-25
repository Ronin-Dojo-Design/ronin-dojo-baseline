// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  extractDomain,
  extractEmailAddress,
  parseInboundEmailEvent,
  resolveBrandFromRecipients,
} from "~/server/inbox/resend-payload"

const NOW = new Date("2026-07-24T08:00:00.000Z")

describe("extractEmailAddress", () => {
  it("unwraps display-name angle addresses and lowercases", () => {
    expect(extractEmailAddress("Jane Doe <Jane@Example.com>")).toBe("jane@example.com")
    expect(extractEmailAddress("  plain@example.com  ")).toBe("plain@example.com")
  })
})

describe("extractDomain", () => {
  it("returns the domain after the last @", () => {
    expect(extractDomain("a@blackbeltlegacy.com")).toBe("blackbeltlegacy.com")
    expect(extractDomain('Weird <"a@b"@example.com>')).toBe("example.com")
  })

  it("returns null when there is no domain", () => {
    expect(extractDomain("not-an-address")).toBeNull()
    expect(extractDomain("trailing@")).toBeNull()
  })
})

describe("resolveBrandFromRecipients", () => {
  it("maps each live receiving domain to its brand", () => {
    expect(resolveBrandFromRecipients(["hello@blackbeltlegacy.com"])).toBe("BBL")
    expect(resolveBrandFromRecipients(["intake@ronindojodesign.com"])).toBe("RONIN_DOJO_DESIGN")
    expect(resolveBrandFromRecipients(["a@baselinemartialarts.com"])).toBe("BASELINE_MARTIAL_ARTS")
    expect(resolveBrandFromRecipients(["b@wekafusa.com"])).toBe("WEKAF")
  })

  it("resolves through display-name wrappers and later recipients", () => {
    expect(
      resolveBrandFromRecipients(["someone@gmail.com", "BBL <Hello@BlackBeltLegacy.com>"]),
    ).toBe("BBL")
  })

  it("returns null for unrecognized domains or empty lists", () => {
    expect(resolveBrandFromRecipients(["a@example.com"])).toBeNull()
    expect(resolveBrandFromRecipients([])).toBeNull()
  })
})

describe("parseInboundEmailEvent", () => {
  it("parses a representative email.received payload", () => {
    const result = parseInboundEmailEvent(
      {
        type: "email.received",
        created_at: "2026-07-24T07:59:00.000Z",
        data: {
          email_id: "em_abc123",
          from: "Jane <jane@example.com>",
          to: ["hello@blackbeltlegacy.com"],
          subject: "Belt question",
          text: "Hi there",
          html: "<p>Hi there</p>",
          created_at: "2026-07-24T07:58:30.000Z",
        },
      },
      NOW,
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.email.resendEmailId).toBe("em_abc123")
    expect(result.email.fromAddress).toBe("Jane <jane@example.com>")
    expect(result.email.toAddress).toBe("hello@blackbeltlegacy.com")
    expect(result.email.recipients).toEqual(["hello@blackbeltlegacy.com"])
    expect(result.email.subject).toBe("Belt question")
    expect(result.email.textBody).toBe("Hi there")
    expect(result.email.htmlBody).toBe("<p>Hi there</p>")
    expect(result.email.receivedAt).toEqual(new Date("2026-07-24T07:58:30.000Z"))
  })

  it("accepts object-form from/to and a bare-string to", () => {
    const result = parseInboundEmailEvent(
      {
        type: "email.received",
        data: {
          email_id: "em_objform",
          from: { email: "jane@example.com", name: "Jane" },
          to: "intake@ronindojodesign.com",
          subject: "Hello",
        },
      },
      NOW,
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.email.fromAddress).toBe("jane@example.com")
    expect(result.email.toAddress).toBe("intake@ronindojodesign.com")
    expect(result.email.recipients).toEqual(["intake@ronindojodesign.com"])
  })

  it("falls back leniently when fields are missing (raw payload is the recovery path)", () => {
    const result = parseInboundEmailEvent({ type: "email.received", data: {} }, NOW)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.email.resendEmailId).toBeNull()
    expect(result.email.fromAddress).toBe("")
    expect(result.email.toAddress).toBe("")
    expect(result.email.subject).toBe("")
    expect(result.email.textBody).toBeNull()
    expect(result.email.htmlBody).toBeNull()
    expect(result.email.receivedAt).toEqual(NOW)
  })

  it("uses the event-level created_at when data omits its own, and the injected now on garbage", () => {
    const eventLevel = parseInboundEmailEvent(
      { type: "email.received", created_at: "2026-07-24T07:00:00.000Z", data: {} },
      NOW,
    )
    expect(eventLevel.ok && eventLevel.email.receivedAt).toEqual(
      new Date("2026-07-24T07:00:00.000Z"),
    )

    const garbage = parseInboundEmailEvent(
      { type: "email.received", data: { created_at: "not-a-date" } },
      NOW,
    )
    expect(garbage.ok && garbage.email.receivedAt).toEqual(NOW)
  })

  it("flags unknown event types as ignored (route answers 200)", () => {
    const result = parseInboundEmailEvent({ type: "email.delivered", data: {} }, NOW)
    expect(result).toEqual({ ok: false, type: "email.delivered", reason: "ignored-event-type" })
  })

  it("flags non-object payloads (route answers 400)", () => {
    expect(parseInboundEmailEvent("nope", NOW)).toEqual({
      ok: false,
      type: null,
      reason: "not-an-object",
    })
    expect(parseInboundEmailEvent(null, NOW)).toEqual({
      ok: false,
      type: null,
      reason: "not-an-object",
    })
  })
})
