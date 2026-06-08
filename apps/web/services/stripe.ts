import Stripe from "stripe"
import { env } from "~/env"

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

export const stripe = env.STRIPE_SECRET_KEY
  ? isE2EStripeMockEnabled
    ? createE2EStripeMock()
    : new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-08-27.basil",
      })
  : isE2EStripeMockEnabled
    ? createE2EStripeMock()
    : (null as unknown as Stripe)
