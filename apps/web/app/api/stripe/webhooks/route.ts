import { env } from "~/env"
import { processStripeWebhook } from "~/server/web/billing/stripe-webhook"
import { stripe } from "~/services/stripe"

/**
 * Platform Stripe account webhook — Baseline / Ronin Dojo Design / WEKAF.
 * Black Belt Legacy has its own account + endpoint (`./bbl/route.ts`).
 */
export const POST = (req: Request) => processStripeWebhook(req, stripe, env.STRIPE_WEBHOOK_SECRET)
