"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { siteConfig } from "~/config/site"
import { getRequestBrand } from "~/lib/brand-context"
import { userActionClient } from "~/lib/safe-actions"
import { STRIPE_CUSTOMER_ACCOUNT_SCOPE } from "~/server/web/billing/stripe-customers"
import { stripe } from "~/services/stripe"

const createBillingPortalSessionSchema = z.object({
  returnUrl: z.string().default("/dashboard"),
})

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
