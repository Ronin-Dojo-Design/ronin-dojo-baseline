"use server"

import { redirect } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
import { siteConfig } from "~/config/site"
import { getServerSession } from "~/lib/auth"
import { actionClient } from "~/lib/safe-actions"
import { findStripeCustomerForCheckout } from "~/server/web/billing/stripe-customers"
import { checkoutSchema } from "~/server/web/products/schema"
import { stripe } from "~/services/stripe"

export const createStripeCheckout = actionClient
  .inputSchema(checkoutSchema)
  .action(async ({ parsedInput: { lineItems, successUrl, cancelUrl, mode, metadata, coupon } }) => {
    const session = await getServerSession()
    const shouldAttachCustomer = Boolean(session?.user?.id && metadata?.userId === session.user.id)
    const requestBrand = shouldAttachCustomer ? Brand.BBL : null
    const existingCustomer =
      session?.user?.id && requestBrand
        ? await findStripeCustomerForCheckout({
            userId: session.user.id,
            brand: requestBrand,
          })
        : null

    const checkout = await stripe.checkout.sessions.create({
      mode,
      line_items: lineItems,
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      customer: existingCustomer?.stripeCustomerId,
      customer_creation:
        mode === "payment" && !existingCustomer
          ? shouldAttachCustomer
            ? "always"
            : "if_required"
          : undefined,
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
