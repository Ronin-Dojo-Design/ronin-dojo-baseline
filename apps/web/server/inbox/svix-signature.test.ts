// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { createHmac } from "node:crypto"
import { verifySvixSignature } from "~/server/inbox/svix-signature"

// Fixed test secret (never a real one): "test-secret-key-0123456789abcdef" base64-encoded.
const RAW_KEY = "test-secret-key-0123456789abcdef"
const SECRET = `whsec_${Buffer.from(RAW_KEY).toString("base64")}`

const PAYLOAD = JSON.stringify({ type: "email.received", data: { email_id: "em_1" } })
const ID = "msg_2y5FakeSvixId"
const NOW_MS = 1_753_300_000_000
const TIMESTAMP = String(Math.floor(NOW_MS / 1000))

const sign = (payload: string, id: string, timestamp: string, key: string = RAW_KEY) =>
  createHmac("sha256", Buffer.from(key)).update(`${id}.${timestamp}.${payload}`).digest("base64")

describe("verifySvixSignature", () => {
  it("accepts a correctly signed payload", () => {
    const result = verifySvixSignature({
      payload: PAYLOAD,
      id: ID,
      timestamp: TIMESTAMP,
      signature: `v1,${sign(PAYLOAD, ID, TIMESTAMP)}`,
      secret: SECRET,
      nowMs: NOW_MS,
    })
    expect(result).toEqual({ valid: true })
  })

  it("accepts when ANY space-separated v1 entry matches (key rotation)", () => {
    const result = verifySvixSignature({
      payload: PAYLOAD,
      id: ID,
      timestamp: TIMESTAMP,
      signature: `v1,${sign(PAYLOAD, ID, TIMESTAMP, "old-rotated-key")} v1,${sign(PAYLOAD, ID, TIMESTAMP)}`,
      secret: SECRET,
      nowMs: NOW_MS,
    })
    expect(result).toEqual({ valid: true })
  })

  it("accepts a secret without the whsec_ prefix", () => {
    const result = verifySvixSignature({
      payload: PAYLOAD,
      id: ID,
      timestamp: TIMESTAMP,
      signature: `v1,${sign(PAYLOAD, ID, TIMESTAMP)}`,
      secret: Buffer.from(RAW_KEY).toString("base64"),
      nowMs: NOW_MS,
    })
    expect(result).toEqual({ valid: true })
  })

  it("rejects a tampered payload", () => {
    const result = verifySvixSignature({
      payload: `${PAYLOAD} `,
      id: ID,
      timestamp: TIMESTAMP,
      signature: `v1,${sign(PAYLOAD, ID, TIMESTAMP)}`,
      secret: SECRET,
      nowMs: NOW_MS,
    })
    expect(result).toEqual({ valid: false, reason: "no-signature-match" })
  })

  it("rejects a signature minted with the wrong key", () => {
    const result = verifySvixSignature({
      payload: PAYLOAD,
      id: ID,
      timestamp: TIMESTAMP,
      signature: `v1,${sign(PAYLOAD, ID, TIMESTAMP, "attacker-key")}`,
      secret: SECRET,
      nowMs: NOW_MS,
    })
    expect(result).toEqual({ valid: false, reason: "no-signature-match" })
  })

  it("rejects missing svix headers", () => {
    const result = verifySvixSignature({
      payload: PAYLOAD,
      id: null,
      timestamp: TIMESTAMP,
      signature: `v1,${sign(PAYLOAD, ID, TIMESTAMP)}`,
      secret: SECRET,
      nowMs: NOW_MS,
    })
    expect(result).toEqual({ valid: false, reason: "missing-headers" })
  })

  it("rejects a timestamp outside the replay tolerance (both directions)", () => {
    for (const skewSeconds of [6 * 60, -6 * 60]) {
      const skewed = String(Math.floor(NOW_MS / 1000) + skewSeconds)
      const result = verifySvixSignature({
        payload: PAYLOAD,
        id: ID,
        timestamp: skewed,
        signature: `v1,${sign(PAYLOAD, ID, skewed)}`,
        secret: SECRET,
        nowMs: NOW_MS,
      })
      expect(result).toEqual({ valid: false, reason: "timestamp-out-of-tolerance" })
    }
  })

  it("accepts a timestamp inside the tolerance window", () => {
    const skewed = String(Math.floor(NOW_MS / 1000) - 4 * 60)
    const result = verifySvixSignature({
      payload: PAYLOAD,
      id: ID,
      timestamp: skewed,
      signature: `v1,${sign(PAYLOAD, ID, skewed)}`,
      secret: SECRET,
      nowMs: NOW_MS,
    })
    expect(result).toEqual({ valid: true })
  })

  it("rejects a non-numeric timestamp", () => {
    const result = verifySvixSignature({
      payload: PAYLOAD,
      id: ID,
      timestamp: "not-a-number",
      signature: `v1,${sign(PAYLOAD, ID, "not-a-number")}`,
      secret: SECRET,
      nowMs: NOW_MS,
    })
    expect(result).toEqual({ valid: false, reason: "timestamp-invalid" })
  })

  it("ignores non-v1 signature entries", () => {
    const result = verifySvixSignature({
      payload: PAYLOAD,
      id: ID,
      timestamp: TIMESTAMP,
      signature: `v2,${sign(PAYLOAD, ID, TIMESTAMP)}`,
      secret: SECRET,
      nowMs: NOW_MS,
    })
    expect(result).toEqual({ valid: false, reason: "no-signature-match" })
  })
})
