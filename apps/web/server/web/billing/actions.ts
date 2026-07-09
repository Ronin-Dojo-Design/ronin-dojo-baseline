"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { Brand } from "~/.generated/prisma/client"
import { getBrandOrigin } from "~/lib/brand-origin"
import { userActionClient } from "~/lib/safe-actions"
import {
  isLineageMembershipPlanMetadata,
  LINEAGE_MEMBERSHIP_SURFACE,
} from "~/server/web/billing/lineage-membership"
import {
  findStripeCustomerForCheckout,
  STRIPE_CUSTOMER_ACCOUNT_SCOPE,
} from "~/server/web/billing/stripe-customers"
import { getStripeClient } from "~/services/stripe"

const createBillingPortalSessionSchema = z.object({
  returnUrl: z.string().default("/dashboard"),
})

const createProgramEnrollmentCheckoutSchema = z.object({
  programId: z.string().min(1, "Program is required"),
  stripePriceId: z.string().min(1, "Price is required"),
  coupon: z.string().min(1).optional(),
})

const createLineageMembershipCheckoutSchema = z.object({
  pricingPlanId: z.string().min(1, "Membership plan is required"),
  coupon: z.string().min(1).optional(),
})

const SUBSCRIPTION_PRICING_MODELS = new Set(["MONTHLY", "ANNUAL"])

const resolvePlanCheckoutMode = ({
  intervalMonths,
  pricingModel,
}: {
  intervalMonths: number | null
  pricingModel: string
}) => {
  return intervalMonths || SUBSCRIPTION_PRICING_MODELS.has(pricingModel)
    ? "subscription"
    : "payment"
}

export const createBillingPortalSession = userActionClient
  .inputSchema(createBillingPortalSessionSchema)
  .action(async ({ parsedInput: { returnUrl }, ctx: { user, db } }) => {
    const customer = await db.stripeCustomer.findUnique({
      where: {
        userId_brand_accountScope: {
          userId: user.id,
          brand: Brand.BBL,
          accountScope: STRIPE_CUSTOMER_ACCOUNT_SCOPE,
        },
      },
    })

    if (!customer) {
      throw new Error("No billing customer found for this brand.")
    }

    const session = await getStripeClient(Brand.BBL).billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: `${await getBrandOrigin()}${returnUrl}`,
    })

    if (!session.url) {
      throw new Error("Unable to create a Stripe Customer Portal session.")
    }

    redirect(session.url)
  })

export const createProgramEnrollmentCheckout = userActionClient
  .inputSchema(createProgramEnrollmentCheckoutSchema)
  .action(async ({ parsedInput: { programId, stripePriceId, coupon }, ctx: { user, db } }) => {
    const matchingPlans = await db.pricingPlan.findMany({
      where: {
        brand: Brand.BBL,
        programId,
        stripePriceId,
        isActive: true,
      },
      select: {
        id: true,
        brand: true,
        pricingModel: true,
        intervalMonths: true,
        organizationId: true,
        programId: true,
        stripePriceId: true,
        entitlementGrants: { select: { id: true } },
        program: {
          select: {
            id: true,
            brand: true,
            status: true,
            organizationId: true,
          },
        },
      },
      take: 2,
    })

    if (matchingPlans.length !== 1) {
      throw new Error("Selected program plan is not available.")
    }

    const pricingPlan = matchingPlans[0]!
    if (
      !pricingPlan.program ||
      pricingPlan.program.status !== "ACTIVE" ||
      pricingPlan.program.brand !== Brand.BBL ||
      pricingPlan.program.organizationId !== pricingPlan.organizationId ||
      pricingPlan.programId !== programId ||
      !pricingPlan.stripePriceId ||
      pricingPlan.entitlementGrants.length === 0
    ) {
      throw new Error("Selected program plan is not available.")
    }

    const existingCustomer = await findStripeCustomerForCheckout({
      userId: user.id,
      brand: Brand.BBL,
    })
    const origin = await getBrandOrigin()
    const mode = resolvePlanCheckoutMode(pricingPlan)
    const metadata = {
      type: "program_enrollment",
      userId: user.id,
      programId: pricingPlan.program.id,
      pricingPlanId: pricingPlan.id,
      organizationId: pricingPlan.organizationId,
      brand: Brand.BBL,
    }

    const checkout = await getStripeClient(Brand.BBL).checkout.sessions.create({
      mode,
      line_items: [{ price: pricingPlan.stripePriceId, quantity: 1 }],
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      customer: existingCustomer?.stripeCustomerId,
      customer_creation: mode === "payment" && !existingCustomer ? "always" : undefined,
      // Reusing an existing Stripe customer with automatic_tax + tax_id_collection
      // requires customer_update; otherwise Stripe rejects the session for any
      // returning customer (SESSION_0345 live-mode rehearsal finding).
      customer_update: existingCustomer ? { name: "auto", address: "auto" } : undefined,
      invoice_creation: mode === "payment" ? { enabled: true } : undefined,
      metadata: mode === "payment" ? metadata : undefined,
      subscription_data: mode === "subscription" ? { metadata } : undefined,
      allow_promotion_codes: coupon ? undefined : true,
      discounts: coupon ? [{ coupon }] : undefined,
      success_url: `${origin}/programs/${pricingPlan.program.id}/enroll/success?sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/programs/${pricingPlan.program.id}/enroll?cancelled=true`,
    })

    if (!checkout.url) {
      throw new Error("Unable to create a Stripe Checkout Session for this program.")
    }

    redirect(checkout.url)
  })

export const createLineageMembershipCheckout = userActionClient
  .inputSchema(createLineageMembershipCheckoutSchema)
  .action(async ({ parsedInput: { pricingPlanId, coupon }, ctx: { user, db } }) => {
    const pricingPlan = await db.pricingPlan.findUnique({
      where: { id: pricingPlanId },
      select: {
        id: true,
        brand: true,
        pricingModel: true,
        intervalMonths: true,
        organizationId: true,
        programId: true,
        stripePriceId: true,
        isActive: true,
        metadata: true,
        entitlementGrants: { select: { id: true } },
      },
    })

    if (
      !pricingPlan ||
      pricingPlan.brand !== Brand.BBL ||
      !pricingPlan.isActive ||
      pricingPlan.programId !== null ||
      !pricingPlan.stripePriceId ||
      pricingPlan.entitlementGrants.length === 0 ||
      !isLineageMembershipPlanMetadata(pricingPlan.metadata)
    ) {
      throw new Error("Selected lineage membership plan is not available.")
    }

    const existingCustomer = await findStripeCustomerForCheckout({
      userId: user.id,
      brand: Brand.BBL,
    })
    const origin = await getBrandOrigin()
    const mode = resolvePlanCheckoutMode(pricingPlan)
    const metadata = {
      type: LINEAGE_MEMBERSHIP_SURFACE,
      userId: user.id,
      pricingPlanId: pricingPlan.id,
      organizationId: pricingPlan.organizationId,
      brand: Brand.BBL,
    }

    const checkout = await getStripeClient(Brand.BBL).checkout.sessions.create({
      mode,
      line_items: [{ price: pricingPlan.stripePriceId, quantity: 1 }],
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      customer: existingCustomer?.stripeCustomerId,
      customer_creation: mode === "payment" && !existingCustomer ? "always" : undefined,
      // Reusing an existing Stripe customer with automatic_tax + tax_id_collection
      // requires customer_update; otherwise Stripe rejects the session for any
      // returning customer (SESSION_0345 live-mode rehearsal finding).
      customer_update: existingCustomer ? { name: "auto", address: "auto" } : undefined,
      invoice_creation: mode === "payment" ? { enabled: true } : undefined,
      metadata: mode === "payment" ? metadata : undefined,
      subscription_data: mode === "subscription" ? { metadata } : undefined,
      allow_promotion_codes: coupon ? undefined : true,
      discounts: coupon ? [{ coupon }] : undefined,
      success_url: `${origin}/app/profile?complete=1&checkout=lineage-membership&sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/lineage/join?cancelled=true`,
    })

    if (!checkout.url) {
      throw new Error("Unable to create a Stripe Checkout Session for this membership.")
    }

    return { checkoutUrl: checkout.url }
  })
