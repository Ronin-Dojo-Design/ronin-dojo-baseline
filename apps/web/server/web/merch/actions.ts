"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { siteConfig } from "~/config/site"
import { getRequestBrand } from "~/lib/brand-context"
import { userActionClient } from "~/lib/safe-actions"
import {
  findStripeCustomerForCheckout,
  STRIPE_CUSTOMER_ACCOUNT_SCOPE,
} from "~/server/web/billing/stripe-customers"
import { stripe } from "~/services/stripe"

/**
 * Flat-rate shipping fee for TuffBuffs merch orders.
 * @see docs/sprints/SESSION_0112.md — resolved decision #2
 */
const TUFFBUFFS_MERCH_SHIPPING_FEE_CENTS = 499

const createMerchCheckoutSchema = z.object({
  pricingPlanId: z.string().min(1, "Product is required"),
  quantity: z.number().int().min(1).max(10).default(1),
  size: z.string().optional(),
  color: z.string().optional(),
})

/**
 * Creates a Stripe Checkout Session for a TuffBuffs merch purchase.
 * Follows the `createProgramEnrollmentCheckout` pattern exactly.
 *
 * @see apps/web/server/web/billing/actions.ts — gold-standard checkout pattern
 * @see docs/architecture/decisions/0014-stripe-product-policy.md
 * @see docs/sprints/SESSION_0112.md TASK_02
 */
export const createMerchCheckout = userActionClient
  .inputSchema(createMerchCheckoutSchema)
  .action(async ({ parsedInput: { pricingPlanId, quantity, size, color }, ctx: { user, db } }) => {
    const brand = await getRequestBrand()

    // 1. Resolve the merch PricingPlan
    const matchingPlans = await db.pricingPlan.findMany({
      where: {
        id: pricingPlanId,
        brand,
        isActive: true,
        metadata: {
          path: ["source"],
          equals: "tuffbuffs-merch",
        },
      },
      select: {
        id: true,
        brand: true,
        name: true,
        amountCents: true,
        currency: true,
        organizationId: true,
        stripePriceId: true,
        stripeProductId: true,
        metadata: true,
      },
      take: 2,
    })

    if (matchingPlans.length !== 1) {
      throw new Error("Selected merch product is not available.")
    }

    const plan = matchingPlans[0]!

    // 2. Verify Stripe IDs exist
    if (!plan.stripePriceId) {
      throw new Error("This product is not yet available for purchase.")
    }

    // 3. Verify in-stock
    const meta = plan.metadata as Record<string, unknown> | null
    if (!meta || meta.inStock !== true) {
      throw new Error("This product is currently out of stock.")
    }

    // 4. Resolve or find existing Stripe customer
    const existingCustomer = await findStripeCustomerForCheckout({
      userId: user.id,
      brand,
    })

    // 5. Build checkout session metadata (ADR 0014 §4)
    const metadata = {
      type: "merch_purchase",
      userId: user.id,
      pricingPlanId: plan.id,
      organizationId: plan.organizationId,
      brand,
      ...(size ? { size } : {}),
      ...(color ? { color } : {}),
    }

    // 6. Create Stripe Checkout Session
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        { price: plan.stripePriceId, quantity },
      ],
      // Flat-rate shipping
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: TUFFBUFFS_MERCH_SHIPPING_FEE_CENTS,
              currency: "usd",
            },
            display_name: "Standard Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 10 },
            },
          },
        },
      ],
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      customer: existingCustomer?.stripeCustomerId,
      customer_creation: !existingCustomer ? "always" : undefined,
      invoice_creation: { enabled: true },
      metadata,
      success_url: `${siteConfig.url}/merch/order/success?sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteConfig.url}/merch?cancelled=true`,
    })

    if (!checkout.url) {
      throw new Error("Unable to create a Stripe Checkout Session for this product.")
    }

    redirect(checkout.url)
  })
