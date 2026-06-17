import { Brand } from "~/.generated/prisma/client"
import { processStripeWebhook } from "~/server/web/billing/stripe-webhook"
import { getStripeClient, getStripeWebhookSecret } from "~/services/stripe"

/**
 * Black Belt Legacy Stripe account webhook. BBL runs on its own Stripe account
 * (separate keys + signing secret) — register this endpoint
 * (`https://blackbeltlegacy.com/api/stripe/webhooks/bbl`) in the BBL account and
 * set `STRIPE_WEBHOOK_SECRET_BBL`. Until the BBL account is configured, this
 * returns 400 (no secret) and BBL falls back to the platform client.
 */
export const POST = (req: Request) =>
  processStripeWebhook(req, getStripeClient(Brand.BBL), getStripeWebhookSecret(Brand.BBL))
