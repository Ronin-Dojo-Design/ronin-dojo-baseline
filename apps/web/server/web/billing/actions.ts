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

const createBillingPortalSessionSchema = z.object({
  returnUrl: z.string().default("/dashboard"),
})

const createProgramEnrollmentCheckoutSchema = z.object({
  programId: z.string().min(1, "Program is required"),
  stripePriceId: z.string().min(1, "Price is required"),
  coupon: z.string().min(1).optional(),
})

const SUBSCRIPTION_PRICING_MODELS = new Set(["MONTHLY", "ANNUAL"])

const resolveProgramPlanCheckoutMode = ({
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
    const brand = await getRequestBrand()

    const customer = await db.stripeCustomer.findUnique({
      where: {
        userId_brand_accountScope: {
          userId: user.id,
          brand,
          accountScope: STRIPE_CUSTOMER_ACCOUNT_SCOPE,
        },
      },
    })

    if (!customer) {
      throw new Error("No billing customer found for this brand.")
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: `${siteConfig.url}${returnUrl}`,
    })

    if (!session.url) {
      throw new Error("Unable to create a Stripe Customer Portal session.")
    }

    redirect(session.url)
  })

export const createProgramEnrollmentCheckout = userActionClient
  .inputSchema(createProgramEnrollmentCheckoutSchema)
  .action(async ({ parsedInput: { programId, stripePriceId, coupon }, ctx: { user, db } }) => {
    const brand = await getRequestBrand()

    const matchingPlans = await db.pricingPlan.findMany({
      where: {
        brand,
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
      pricingPlan.program.brand !== brand ||
      pricingPlan.program.organizationId !== pricingPlan.organizationId ||
      pricingPlan.programId !== programId ||
      !pricingPlan.stripePriceId ||
      pricingPlan.entitlementGrants.length === 0
    ) {
      throw new Error("Selected program plan is not available.")
    }

    const existingCustomer = await findStripeCustomerForCheckout({
      userId: user.id,
      brand,
    })
    const mode = resolveProgramPlanCheckoutMode(pricingPlan)
    const metadata = {
      type: "program_enrollment",
      userId: user.id,
      programId: pricingPlan.program.id,
      pricingPlanId: pricingPlan.id,
      organizationId: pricingPlan.organizationId,
      brand,
    }

    const checkout = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: pricingPlan.stripePriceId, quantity: 1 }],
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      customer: existingCustomer?.stripeCustomerId,
      customer_creation: mode === "payment" && !existingCustomer ? "always" : undefined,
      invoice_creation: mode === "payment" ? { enabled: true } : undefined,
      metadata: mode === "payment" ? metadata : undefined,
      subscription_data: mode === "subscription" ? { metadata } : undefined,
      allow_promotion_codes: coupon ? undefined : true,
      discounts: coupon ? [{ coupon }] : undefined,
      success_url: `${siteConfig.url}/programs/${pricingPlan.program.id}/enroll/success?sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteConfig.url}/programs/${pricingPlan.program.id}/enroll?cancelled=true`,
    })

    if (!checkout.url) {
      throw new Error("Unable to create a Stripe Checkout Session for this program.")
    }

    redirect(checkout.url)
  })
