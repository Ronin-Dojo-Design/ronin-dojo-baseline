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

// ---------------------------------------------------------------------------
// Admin: Merch Order actions (Phase 3)
// ---------------------------------------------------------------------------

import { FulfillmentStatus } from "~/.generated/prisma/client"
import { adminActionClient } from "~/lib/safe-actions"
import { db } from "~/services/db"
import { createOrder } from "~/services/printful"

// ---------------------------------------------------------------------------
// Shared schemas
// ---------------------------------------------------------------------------

/**
 * Zod schema for a single line item in a MerchOrder's `lineItems` JSON field.
 * Used to validate the JSON before mapping to Printful order items.
 *
 * @see docs/sprints/SESSION_0121.md — TASK_01 (FINDING_01 remediation)
 */
const merchLineItemSchema = z.object({
  printfulVariantId: z.number(),
  quantity: z.number().int().min(1).default(1),
  name: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  files: z.array(z.object({ url: z.string().url() })).optional(),
})

type MerchLineItem = z.infer<typeof merchLineItemSchema>

/**
 * Schema for a status history entry in MerchOrder's `statusHistory` JSON field.
 * Append-only audit trail for admin status overrides.
 *
 * @see docs/sprints/SESSION_0121.md — TASK_02 (FINDING_02 remediation)
 */
const statusHistoryEntrySchema = z.object({
  timestamp: z.string(),
  adminUserId: z.string(),
  oldStatus: z.string(),
  newStatus: z.string(),
  reason: z.string().optional(),
})

type StatusHistoryEntry = z.infer<typeof statusHistoryEntrySchema>

const updateMerchOrderStatusSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(FulfillmentStatus),
  reason: z.string().optional(),
})

/**
 * Admin: manually override a merch order's fulfillment status.
 * Brand-scoped via getRequestBrand().
 *
 * @see docs/sprints/SESSION_0120.md — TASK_07
 */
export const updateMerchOrderStatus = adminActionClient
  .inputSchema(updateMerchOrderStatusSchema)
  .action(async ({ parsedInput: { id, status, reason }, ctx: { user } }) => {
    const brand = await getRequestBrand()

    const order = await db.merchOrder.findFirst({ where: { id, brand } })
    if (!order) {
      throw new Error("Order not found.")
    }

    // Build audit trail entry (append-only JSON array)
    const existingHistory = Array.isArray(order.statusHistory) ? order.statusHistory : []
    const entry: StatusHistoryEntry = {
      timestamp: new Date().toISOString(),
      adminUserId: user.id,
      oldStatus: order.fulfillmentStatus,
      newStatus: status,
      ...(reason ? { reason } : {}),
    }

    await db.merchOrder.update({
      where: { id },
      data: {
        fulfillmentStatus: status,
        statusHistory: [...existingHistory, entry],
        ...(reason ? { failureReason: reason } : {}),
      },
    })

    return { success: true }
  })

const retryPrintfulOrderSchema = z.object({
  merchOrderId: z.string().min(1),
})

/**
 * Admin: retry submitting a failed merch order to Printful.
 * Only allowed when current status is PAID or FAILED.
 *
 * @see docs/sprints/SESSION_0120.md — TASK_07
 */
export const retryPrintfulOrder = adminActionClient
  .inputSchema(retryPrintfulOrderSchema)
  .action(async ({ parsedInput: { merchOrderId } }) => {
    const brand = await getRequestBrand()

    const order = await db.merchOrder.findFirst({
      where: { id: merchOrderId, brand },
    })

    if (!order) {
      throw new Error("Order not found.")
    }

    if (order.fulfillmentStatus !== "PAID" && order.fulfillmentStatus !== "FAILED") {
      throw new Error(`Cannot retry order in ${order.fulfillmentStatus} status.`)
    }

    // Parse and validate line items using Zod schema (FINDING_01 remediation)
    const lineItems = Array.isArray(order.lineItems) ? order.lineItems : []
    if (lineItems.length === 0) {
      throw new Error("Order has no line items.")
    }

    const parseResult = z.array(merchLineItemSchema).safeParse(lineItems)
    if (!parseResult.success) {
      throw new Error(`Invalid line items: ${parseResult.error.message}`)
    }

    const printfulItems = parseResult.data.map((item: MerchLineItem) => ({
      sync_variant_id: item.printfulVariantId,
      quantity: item.quantity,
      files: item.files,
    }))

    const recipient = {
      name: order.shippingName ?? order.customerName ?? "",
      email: order.customerEmail,
      address1: order.shippingAddress1 ?? "",
      address2: order.shippingAddress2 ?? undefined,
      city: order.shippingCity ?? "",
      state_code: order.shippingState ?? "",
      zip: order.shippingPostalCode ?? "",
      country_code: order.shippingCountryCode ?? "US",
    }

    try {
      const printfulOrder = await createOrder({
        externalId: order.id,
        recipient,
        items: printfulItems,
      })

      await db.merchOrder.update({
        where: { id: merchOrderId },
        data: {
          fulfillmentStatus: "SUBMITTED",
          printfulOrderId: printfulOrder.id,
          printfulExternalId: order.id,
          failureReason: null,
        },
      })

      return { success: true, printfulOrderId: printfulOrder.id }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown Printful error"

      await db.merchOrder.update({
        where: { id: merchOrderId },
        data: {
          fulfillmentStatus: "FAILED",
          failureReason: `Retry failed: ${message}`,
        },
      })

      throw new Error(`Printful submission failed: ${message}`)
    }
  })
