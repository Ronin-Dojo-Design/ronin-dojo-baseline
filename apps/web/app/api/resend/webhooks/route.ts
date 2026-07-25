import { randomUUID } from "node:crypto"
import { type NextRequest, NextResponse } from "next/server"
import { env, isProd } from "~/env"
import {
  type ParsedInboundEmail,
  type ParsedInboundEmailEvent,
  parseInboundEmailEvent,
  resolveBrandFromRecipients,
} from "~/server/inbox/resend-payload"
import { verifySvixSignature } from "~/server/inbox/svix-signature"
import { db } from "~/services/db"

// ---------------------------------------------------------------------------
// Resend Webhook Handler (G-033 slice 1, SESSION_0639)
// ---------------------------------------------------------------------------
// Receives Resend events for the portfolio's receiving domains (BBL + RDD live
// as of SESSION_0635). This slice consumes exactly one event:
//   - email.received → capture an InboundEmail row (idempotent on resendEmailId)
// Every other event type is acknowledged with 200 and ignored.
//
// Signature: Resend signs deliveries with the Svix scheme. RESEND_WEBHOOK_SECRET
// unset → dev accepts-with-log, PROD rejects (fail closed — unlike Printful's
// skip-when-unset, an open inbound-mail sink in prod would accept forged mail).
// Verification itself is the pure `server/inbox/svix-signature.ts` module.
// ---------------------------------------------------------------------------

/** Signature gate: the rejection response, or null when the delivery may proceed. */
const rejectUnverifiedDelivery = (req: NextRequest, body: string): NextResponse | null => {
  const secret = env.RESEND_WEBHOOK_SECRET
  if (secret) {
    const result = verifySvixSignature({
      payload: body,
      id: req.headers.get("svix-id"),
      timestamp: req.headers.get("svix-timestamp"),
      signature: req.headers.get("svix-signature"),
      secret,
    })
    if (!result.valid) {
      console.error(`❌ Resend webhook: signature rejected (${result.reason})`)
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }
    return null
  }
  if (isProd) {
    console.error("❌ Resend webhook: RESEND_WEBHOOK_SECRET unset in prod — rejecting")
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 401 })
  }
  console.warn("⚠️ Resend webhook: RESEND_WEBHOOK_SECRET unset — accepting UNVERIFIED (dev only)")
  return null
}

/** Non-`email.received` shapes: 400 for non-objects, 200-and-ignore for unknown event types. */
const ackOrRejectNonEmailEvent = (
  parsed: Extract<ParsedInboundEmailEvent, { ok: false }>,
): NextResponse => {
  if (parsed.reason === "not-an-object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
  console.log(`ℹ️ Resend webhook: ignoring event type "${parsed.type ?? "unknown"}"`)
  return NextResponse.json({ received: true })
}

const upsertInboundEmail = async (email: ParsedInboundEmail, payload: unknown, svixId: string | null) => {
  // Idempotency key: Resend's email id, falling back to the svix delivery id (stable across
  // redelivery retries), then a random id as the store-anyway last resort — rawPayload is always
  // captured, so mail is never dropped for a shape gap.
  const resendEmailId =
    email.resendEmailId ?? (svixId ? `svix:${svixId}` : `unkeyed:${randomUUID()}`)

  // Payload-derived fields, shared by create AND the redelivery-refresh update — which must
  // NEVER touch triageStatus (an admin's triage must survive a webhook retry).
  const emailFields = {
    fromAddress: email.fromAddress,
    toAddress: email.toAddress,
    subject: email.subject,
    textBody: email.textBody,
    htmlBody: email.htmlBody,
    rawPayload: payload as object,
    brand: resolveBrandFromRecipients(email.recipients),
    receivedAt: email.receivedAt,
  }

  return await db.inboundEmail.upsert({
    where: { resendEmailId },
    create: { resendEmailId, ...emailFields },
    update: emailFields,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()

  const rejection = rejectUnverifiedDelivery(req, body)
  if (rejection) return rejection

  let payload: unknown
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = parseInboundEmailEvent(payload)
  if (!parsed.ok) return ackOrRejectNonEmailEvent(parsed)

  const record = await upsertInboundEmail(parsed.email, payload, req.headers.get("svix-id"))

  console.log(
    `📥 Resend webhook: captured InboundEmail ${record.id} (${parsed.email.fromAddress} → ${parsed.email.toAddress})`,
  )

  return NextResponse.json({ received: true })
}
