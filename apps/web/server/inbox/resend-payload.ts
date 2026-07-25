import { z } from "zod"
import type { Brand } from "~/.generated/prisma/client"

/**
 * Resend inbound-webhook payload parsing + recipient-domain → Brand resolution (G-033 slice 1,
 * SESSION_0639). PURE module by design (kernel-shaped, later-extractable): no env, no db — the
 * webhook route feeds it the decoded JSON body and persists what comes back.
 *
 * Parsing is deliberately LENIENT: the `InboundEmail` row always stores the full `rawPayload`,
 * so a shape drift in Resend's event never loses mail — missing fields fall back to `""`/`null`
 * and the raw JSON remains the recovery path.
 */

/** The one event type this slice consumes; everything else is 200-and-ignore. */
export const EMAIL_RECEIVED_EVENT = "email.received"

/**
 * Recipient-domain → Brand map for INBOUND mail. This is a different axis from
 * `lib/brand-context.ts HOST_TO_BRAND` (request-host resolution, single-brand collapse — always
 * BBL): inbound email arrives for ANY portfolio brand's receiving domain, so the full map lives
 * here. Domains mirror `lib/email.ts BRAND_DEFAULT_SENDER_EMAIL` (the send-side counterpart).
 * Values are string literals (type-checked against the Prisma `Brand` union via the type-only
 * import) so this module never value-imports the Brand enum — the known client-shared trap.
 */
export const RECIPIENT_DOMAIN_TO_BRAND: Record<string, Brand> = {
  "blackbeltlegacy.com": "BBL",
  "ronindojodesign.com": "RONIN_DOJO_DESIGN",
  "baselinemartialarts.com": "BASELINE_MARTIAL_ARTS",
  "wekafusa.com": "WEKAF",
}

/** `"Name <a@b.c>"` → `"a@b.c"`; plain addresses pass through. Lowercased, trimmed. */
export const extractEmailAddress = (value: string): string => {
  const angled = /<([^<>]+)>/.exec(value)
  return (angled?.[1] ?? value).trim().toLowerCase()
}

/** Domain part of an address (after the last `@`), or null when there isn't one. */
export const extractDomain = (address: string): string | null => {
  const normalized = extractEmailAddress(address)
  const at = normalized.lastIndexOf("@")
  if (at === -1 || at === normalized.length - 1) return null
  return normalized.slice(at + 1)
}

/**
 * First recipient whose domain maps to a portfolio brand wins; unrecognized domains resolve to
 * null (the `InboundEmail.brand` column is nullable by design — never guess).
 */
export const resolveBrandFromRecipients = (recipients: readonly string[]): Brand | null => {
  for (const recipient of recipients) {
    const domain = extractDomain(recipient)
    if (domain && domain in RECIPIENT_DOMAIN_TO_BRAND) {
      return RECIPIENT_DOMAIN_TO_BRAND[domain]
    }
  }
  return null
}

const addressSchema = z.union([
  z.string(),
  z.looseObject({ email: z.string(), name: z.string().nullish() }),
])

const addressListSchema = z.union([addressSchema, z.array(addressSchema)])

const receivedDataSchema = z.looseObject({
  email_id: z.string().nullish(),
  from: addressSchema.nullish(),
  to: addressListSchema.nullish(),
  subject: z.string().nullish(),
  text: z.string().nullish(),
  html: z.string().nullish(),
  created_at: z.string().nullish(),
})

const eventSchema = z.looseObject({
  type: z.string().nullish(),
  created_at: z.string().nullish(),
  data: receivedDataSchema.nullish(),
})

const flattenAddress = (value: z.infer<typeof addressSchema>): string =>
  typeof value === "string" ? value : value.email

const flattenAddressList = (value: z.infer<typeof addressListSchema>): string[] =>
  (Array.isArray(value) ? value : [value]).map(flattenAddress)

export type ParsedInboundEmail = {
  /** Resend's id for the email — null when absent (route falls back to the svix delivery id). */
  resendEmailId: string | null
  fromAddress: string
  toAddress: string
  /** Every recipient, for brand resolution across cc'd portfolio domains. */
  recipients: string[]
  subject: string
  textBody: string | null
  htmlBody: string | null
  receivedAt: Date
}

export type ParsedInboundEmailEvent =
  | { ok: true; type: typeof EMAIL_RECEIVED_EVENT; email: ParsedInboundEmail }
  | { ok: false; type: string | null; reason: "not-an-object" | "ignored-event-type" }

const parseReceivedAt = (candidate: string | null | undefined, fallback: Date): Date => {
  if (!candidate) return fallback
  const parsed = new Date(candidate)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}

/**
 * Parse a decoded webhook body. Only `email.received` yields `ok: true`; every other shape is a
 * typed rejection the route maps to 200-and-ignore (unknown events) or 400 (non-objects).
 * `now` is injectable so the `receivedAt` fallback is unit-testable with a fixed clock.
 */
export const parseInboundEmailEvent = (
  payload: unknown,
  now: Date = new Date(),
): ParsedInboundEmailEvent => {
  const event = eventSchema.safeParse(payload)
  if (!event.success) {
    return { ok: false, type: null, reason: "not-an-object" }
  }

  const type = event.data.type ?? null
  if (type !== EMAIL_RECEIVED_EVENT) {
    return { ok: false, type, reason: "ignored-event-type" }
  }

  const data = event.data.data
  const recipients = data?.to ? flattenAddressList(data.to) : []

  return {
    ok: true,
    type: EMAIL_RECEIVED_EVENT,
    email: {
      resendEmailId: data?.email_id ?? null,
      fromAddress: data?.from ? flattenAddress(data.from) : "",
      toAddress: recipients[0] ?? "",
      recipients,
      subject: data?.subject ?? "",
      textBody: data?.text ?? null,
      htmlBody: data?.html ?? null,
      receivedAt: parseReceivedAt(data?.created_at ?? event.data.created_at, now),
    },
  }
}
