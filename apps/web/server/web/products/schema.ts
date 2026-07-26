import { z } from "zod"

/**
 * SEC-02 — success/cancel URLs must be same-site relative paths.
 *
 * The action prefixes `siteConfig.url`, so a value like `https://evil.test`,
 * a protocol-relative `//evil.test`, or a userinfo trick (`/@evil.test`,
 * `/x@evil.test`) could redirect the buyer off-site after payment. Only a
 * single-slash-rooted path with no `@` and no backslash is accepted.
 */
export const relativeUrlSchema = z
  .string()
  .min(1, "URL is required")
  .refine(
    value =>
      value.startsWith("/") &&
      !value.startsWith("//") &&
      !value.includes("@") &&
      !value.includes("\\"),
    "URL must be a same-site relative path",
  )

/**
 * SEC-01 — every line item must reference a server-known Stripe price id.
 *
 * The former `price_data` union arm let the anonymous client set
 * `unit_amount` (i.e. name its own price) on live Stripe. Amounts are now
 * always derived from the canonical Stripe price referenced here, which the
 * action verifies against the Stripe account before creating a session.
 */
const lineItemSchema = z.object({
  price: z.string().min(1, "Price ID is required"),
  quantity: z.number().int().positive().max(100).default(1),
})

/**
 * SEC-01 — checkout metadata is a typed allowlist, not a free-form record.
 *
 * The webhook fulfills purchases from `session.metadata`; a `z.record`
 * passthrough let the client forge fulfillment payloads (programId,
 * tournament divisionIds, merch pricingPlanId, ads…). The generic checkout
 * only ever needs the tool slug — every other fulfillment flow has its own
 * server action that writes trusted metadata server-side.
 */
export const checkoutMetadataSchema = z
  .object({
    tool: z.string().min(1).max(128).optional(),
  })
  .strict()

export const checkoutSchema = z.object({
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  mode: z.enum(["subscription", "payment"]).default("payment"),
  metadata: checkoutMetadataSchema.optional(),
  coupon: z.string().optional(),
  successUrl: relativeUrlSchema,
  cancelUrl: relativeUrlSchema.optional(),
})
