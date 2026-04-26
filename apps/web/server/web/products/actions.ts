"use server"

import { redirect } from "next/navigation"
import { siteConfig } from "~/config/site"
import { actionClient } from "~/lib/safe-actions"
import { checkoutSchema } from "~/server/web/products/schema"
import { stripe } from "~/services/stripe"

export const createStripeCheckout = actionClient
  .inputSchema(checkoutSchema)
  .action(async ({ parsedInput: { lineItems, successUrl, cancelUrl, mode, metadata, coupon } }) => {
    const checkout = await stripe.checkout.sessions.create({
      mode,
      line_items: lineItems,
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      customer_creation: mode === "payment" ? "if_required" : undefined,
      invoice_creation: mode === "payment" ? { enabled: true } : undefined,
      metadata: mode === "payment" ? metadata : undefined,
      subscription_data: mode === "subscription" && metadata ? { metadata } : undefined,
      allow_promotion_codes: coupon ? undefined : true,
      discounts: coupon ? [{ coupon }] : undefined,
      success_url: `${siteConfig.url}${successUrl}?sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl ? `${siteConfig.url}${cancelUrl}?cancelled=true` : undefined,
    })

    if (!checkout.url) {
      throw new Error("Unable to create a new Stripe Checkout Session.")
    }

    // Redirect to the checkout session url
    redirect(checkout.url)
  })
