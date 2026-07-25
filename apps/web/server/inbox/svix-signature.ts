import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Svix webhook-signature verification (G-033 slice 1, SESSION_0639) — Resend signs webhook
 * deliveries with the Svix scheme (https://docs.svix.com/receiving/verifying-payloads/how-manual):
 *
 *   signedContent = `${svix-id}.${svix-timestamp}.${rawBody}`
 *   expected      = base64(HMAC-SHA256(base64decode(secret minus "whsec_"), signedContent))
 *   header        = space-delimited `v1,<base64sig>` entries (any one match passes)
 *
 * PURE module by design (kernel-shaped, later-extractable): no env, no db, no Request — the
 * webhook route (`app/api/resend/webhooks/route.ts`) feeds it strings. `nowMs` is injectable so
 * the replay-tolerance window is unit-testable with a fixed clock. svix is deliberately NOT a
 * dependency — this mirrors the in-house `services/printful.ts verifyWebhookSignature` precedent.
 */

/** Svix default replay tolerance: 5 minutes either side of the delivery timestamp. */
const DEFAULT_TOLERANCE_SECONDS = 5 * 60

const SECRET_PREFIX = "whsec_"

export type SvixVerificationFailure =
  | "missing-headers"
  | "malformed-secret"
  | "timestamp-invalid"
  | "timestamp-out-of-tolerance"
  | "no-signature-match"

export type SvixVerificationResult =
  | { valid: true }
  | { valid: false; reason: SvixVerificationFailure }

export type SvixVerificationInput = {
  /** The RAW request body — must be the exact bytes Resend signed, not a re-serialization. */
  payload: string
  /** `svix-id` header. */
  id: string | null
  /** `svix-timestamp` header (unix seconds). */
  timestamp: string | null
  /** `svix-signature` header (space-delimited `v1,<base64>` entries). */
  signature: string | null
  /** The endpoint signing secret (`whsec_...`). */
  secret: string
  /** Injectable clock for tests; defaults to `Date.now()`. */
  nowMs?: number
  toleranceSeconds?: number
}

const constantTimeEqual = (a: Buffer, b: Buffer): boolean => {
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export const verifySvixSignature = (input: SvixVerificationInput): SvixVerificationResult => {
  const { payload, id, timestamp, signature, secret } = input

  if (!id || !timestamp || !signature) {
    return { valid: false, reason: "missing-headers" }
  }

  const encodedSecret = secret.startsWith(SECRET_PREFIX)
    ? secret.slice(SECRET_PREFIX.length)
    : secret
  let key: Buffer
  try {
    key = Buffer.from(encodedSecret, "base64")
  } catch {
    return { valid: false, reason: "malformed-secret" }
  }
  if (key.length === 0) {
    return { valid: false, reason: "malformed-secret" }
  }

  const timestampSeconds = Number.parseInt(timestamp, 10)
  if (!Number.isFinite(timestampSeconds)) {
    return { valid: false, reason: "timestamp-invalid" }
  }

  const nowSeconds = Math.floor((input.nowMs ?? Date.now()) / 1000)
  const tolerance = input.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS
  if (Math.abs(nowSeconds - timestampSeconds) > tolerance) {
    return { valid: false, reason: "timestamp-out-of-tolerance" }
  }

  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${payload}`).digest()

  // Header format: "v1,<sig>" entries separated by spaces (key rotation can emit several).
  for (const entry of signature.split(" ")) {
    const [version, encoded] = entry.split(",", 2)
    if (version !== "v1" || !encoded) continue

    const candidate = Buffer.from(encoded, "base64")
    if (constantTimeEqual(candidate, expected)) {
      return { valid: true }
    }
  }

  return { valid: false, reason: "no-signature-match" }
}
