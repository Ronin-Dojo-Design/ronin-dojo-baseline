"use server"

import { redirect } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
import { siteConfig } from "~/config/site"
import { getServerSession } from "~/lib/auth"
import { actionClient } from "~/lib/safe-actions"
import { findStripeCustomerForCheckout } from "~/server/web/billing/stripe-customers"
import { checkoutSchema } from "~/server/web/products/schema"
import { db } from "~/services/db"
import { stripe } from "~/services/stripe"

export const createStripeCheckout = actionClient
  .inputSchema(checkoutSchema)
  .action(async ({ parsedInput: { lineItems, successUrl, cancelUrl, mode, metadata, coupon } }) => {
    const session = await getServerSession()

    // SEC-01: every line item must reference a server-known Stripe price.
    // Client-supplied amounts (`price_data`) are rejected at the schema; here
    // each referenced price is verified against the Stripe account and against
    // the requested mode, so the charged amount always comes from the
    // canonical Stripe price record.
    for (const item of lineItems) {
      const price = await stripe.prices.retrieve(item.price).catch(() => null)

      if (!price?.active) {
        throw new Error("Selected price is not available.")
      }

      if (mode === "subscription" && !price.recurring) {
        throw new Error("Selected price does not support subscriptions.")
      }

      if (mode === "payment" && price.recurring) {
        throw new Error("Selected price requires a subscription checkout.")
      }
    }

    // SEC-01: metadata is server-derived from the typed allowlist — the tool
    // slug must reference a real tool, and the userId is taken from the
    // authenticated session, never from the client.
    if (metadata?.tool) {
      const tool = await db.tool.findUnique({
        where: { slug: metadata.tool },
        select: { id: true },
      })

      if (!tool) {
        throw new Error("Selected tool is not available.")
      }
    }

    const trustedMetadata: Record<string, string> = {
      ...(metadata?.tool ? { tool: metadata.tool } : {}),
      ...(session?.user?.id ? { userId: session.user.id } : {}),
    }
    const hasMetadata = Object.keys(trustedMetadata).length > 0

    const shouldAttachCustomer = Boolean(session?.user?.id)
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
      metadata: mode === "payment" && hasMetadata ? trustedMetadata : undefined,
      subscription_data:
        mode === "subscription" && hasMetadata ? { metadata: trustedMetadata } : undefined,
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
