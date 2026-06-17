import Stripe from "stripe"
import { Brand } from "~/.generated/prisma/client"
import { env } from "~/env"

const STRIPE_API_VERSION = "2026-05-27.dahlia" as const

const isE2EStripeMockEnabled =
  process.env.E2E_STRIPE_MOCK === "1" &&
  process.env.NODE_ENV !== "production" &&
  process.env.VERCEL_ENV !== "production"

const createE2EStripeMock = () => {
  return {
    checkout: {
      sessions: {
        create: async (params: Stripe.Checkout.SessionCreateParams) => {
          const sessionId = `cs_e2e_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`
          const successUrl = params.success_url?.replace("{CHECKOUT_SESSION_ID}", sessionId)

          return {
            id: sessionId,
            object: "checkout.session",
            url: successUrl ?? params.cancel_url ?? "http://localhost:3000/",
          }
        },
        listLineItems: async () => ({ data: [] }),
      },
    },
    billingPortal: {
      sessions: {
        create: async () => {
          throw new Error("E2E Stripe mock does not implement billing portal sessions.")
        },
      },
    },
    subscriptions: {
      retrieve: async (subscriptionId: string) => ({
        id: subscriptionId,
        object: "subscription",
        status: "active",
        metadata: {},
        customer: null,
        items: { data: [] },
      }),
    },
    webhooks: {
      constructEvent: (body: string) => JSON.parse(body) as Stripe.Event,
    },
    refunds: {
      create: async () => ({}),
    },
  } as unknown as Stripe
}

const createStripeClient = (secretKey: string | undefined): Stripe | null => {
  if (isE2EStripeMockEnabled) return createE2EStripeMock()
  if (!secretKey) return null
  return new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION })
}

/**
 * Default (platform) Stripe client — serves every brand that shares the platform
 * Stripe account (Baseline, Ronin Dojo Design, WEKAF). Kept as the historical
 * named export so existing imports are unchanged.
 */
export const stripe = createStripeClient(env.STRIPE_SECRET_KEY) as Stripe

/**
 * Black Belt Legacy runs on its OWN Stripe account (separate keys + webhook
 * secret) — see `docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md`. This is
 * only constructed when `STRIPE_SECRET_KEY_BBL` is set; otherwise BBL falls back
 * to the platform client (e.g. preview/dev where the BBL account isn't wired).
 */
const stripeBBL = createStripeClient(env.STRIPE_SECRET_KEY_BBL)

/**
 * Resolve the Stripe client for a brand. BBL uses its dedicated account when
 * configured; every other brand uses the shared platform account. Checkout /
 * billing-portal creation must call this with the request brand so funds land
 * in the correct account.
 */
export const getStripeClient = (brand: Brand): Stripe => {
  if (brand === Brand.BBL && stripeBBL) return stripeBBL
  return stripe
}

/**
 * The webhook-verifying secret for a brand's Stripe account. Each account signs
 * with its own secret, so the BBL webhook endpoint verifies with the BBL secret.
 */
export const getStripeWebhookSecret = (brand: Brand): string | undefined => {
  if (brand === Brand.BBL) return env.STRIPE_WEBHOOK_SECRET_BBL
  return env.STRIPE_WEBHOOK_SECRET
}
