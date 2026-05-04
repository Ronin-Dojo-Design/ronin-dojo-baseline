import { revalidateTag } from "next/cache"
import { after } from "next/server"
import type Stripe from "stripe"
import { env } from "~/env"
import { notifyAdminOfPremiumTool, notifySubmitterOfPremiumTool } from "~/lib/notifications"
import { db } from "~/services/db"
import { stripe } from "~/services/stripe"

/**
 * Fulfill a program enrollment after successful Stripe checkout.
 * Creates ProgramEnrollment record.
 */
async function fulfillProgramEnrollment(session: Stripe.Checkout.Session) {
  const { programId, userId } = session.metadata ?? {}

  if (!programId || !userId) return

  // Upsert: if enrollment exists (race condition), just update status
  const existing = await db.programEnrollment.findFirst({
    where: { programId, userId },
  })

  if (existing) {
    await db.programEnrollment.update({
      where: { id: existing.id },
      data: { status: "ACTIVE", enrolledAt: new Date() },
    })
    return
  }

  await db.programEnrollment.create({
    data: {
      programId,
      userId,
      status: "ACTIVE",
      enrolledAt: new Date(),
    },
  })
}

/**
 * Fulfill a tournament registration after successful Stripe checkout.
 * Creates Registration + RegistrationEntry records.
 */
async function fulfillTournamentRegistration(session: Stripe.Checkout.Session) {
  const { tournamentId, userId, divisionIds, roleId, representingMembershipId } =
    session.metadata ?? {}

  if (!tournamentId || !userId || !divisionIds || !roleId) return

  const parsedDivisionIds: string[] = JSON.parse(divisionIds)

  // Upsert: if registration exists (race condition), just update payment status
  const existing = await db.registration.findUnique({
    where: { tournamentId_userId: { tournamentId, userId } },
  })

  if (existing) {
    await db.registration.update({
      where: { id: existing.id },
      data: {
        paymentStatus: "PAID",
        status: "SUBMITTED",
        submittedAt: new Date(),
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
      },
    })
    return
  }

  const totalFeeCents = session.amount_total ?? 0

  await db.registration.create({
    data: {
      tournamentId,
      userId,
      status: "SUBMITTED",
      paymentStatus: "PAID",
      totalFeeCents,
      submittedAt: new Date(),
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      entries: {
        create: parsedDivisionIds.map((divisionId) => ({
          divisionId,
          tournamentRoleId: roleId,
          representingMembershipId: representingMembershipId || null,
        })),
      },
    },
  })
}

/**
 * Given a Stripe checkout session, look up the PricingPlan by stripePriceId
 * and grant all linked entitlements to the user.
 */
async function grantEntitlementsFromCheckout(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  if (!userId) return

  // Expand line items to get price IDs
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

  for (const item of lineItems.data) {
    const priceId = item.price?.id
    if (!priceId) continue

    const plan = await db.pricingPlan.findFirst({
      where: { stripePriceId: priceId },
      include: { entitlementGrants: { include: { entitlement: true } } },
    })

    if (!plan) continue

    for (const grant of plan.entitlementGrants) {
      // Upsert: reactivate if revoked/expired, or create new
      const existing = await db.userEntitlement.findFirst({
        where: {
          userId,
          entitlementId: grant.entitlement.id,
          sourceId: session.subscription as string | undefined,
        },
      })

      if (existing) {
        await db.userEntitlement.update({
          where: { id: existing.id },
          data: { status: "ACTIVE", startsAt: new Date() },
        })
      } else {
        await db.userEntitlement.create({
          data: {
            userId,
            entitlementId: grant.entitlement.id,
            sourceType: session.mode === "subscription" ? "SUBSCRIPTION" : "PURCHASE",
            sourceId: (session.subscription as string) ?? session.id,
          },
        })
      }
    }
  }
}

/**
 * Revoke all entitlements sourced from a deleted subscription.
 */
async function revokeEntitlementsFromSubscription(subscriptionId: string) {
  await db.userEntitlement.updateMany({
    where: {
      sourceType: "SUBSCRIPTION",
      sourceId: subscriptionId,
      status: "ACTIVE",
    },
    data: { status: "REVOKED" },
  })
}

/**
 * Handle the Stripe webhook
 * @param req - The request
 * @returns The response
 */
export const POST = async (req: Request) => {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature") as string
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET
  let event: Stripe.Event

  try {
    if (!signature || !webhookSecret) {
      return new Response("Webhook secret not found.", { status: 400 })
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const { mode, subscription, metadata } = session

        // Grant entitlements linked to the purchased/subscribed plan
        await grantEntitlementsFromCheckout(session)

        switch (mode) {
          case "payment": {
            // Handle program enrollment payment
            if (metadata?.type === "program_enrollment") {
              await fulfillProgramEnrollment(session)
              revalidateTag("programs", "infinite")
              break
            }

            // Handle tournament registration payment
            if (metadata?.type === "tournament_registration") {
              await fulfillTournamentRegistration(session)
              revalidateTag("tournaments", "infinite")
              break
            }

            // Handle tool expedited payment
            if (metadata?.tool) {
              const tool = await db.tool.findUniqueOrThrow({
                where: { slug: metadata.tool },
              })

              // Notify the submitter of the premium tool
              after(async () => await notifySubmitterOfPremiumTool(tool))

              // Notify the admin of the premium tool
              after(async () => await notifyAdminOfPremiumTool(tool))
            }

            break
          }

          case "subscription": {
            const { metadata } = await stripe.subscriptions.retrieve(subscription as string)

            // Handle tool featured listing
            if (metadata?.tool) {
              const tool = await db.tool.update({
                where: { slug: metadata.tool },
                data: { isFeatured: true },
              })

              // Revalidate the cache
              revalidateTag("tools", "infinite")

              // Notify the submitter of the premium tool
              after(async () => await notifySubmitterOfPremiumTool(tool))

              // Notify the admin of the premium tool
              after(async () => await notifyAdminOfPremiumTool(tool))
            }

            break
          }
        }

        break
      }

      case "customer.subscription.deleted": {
        const { id: subscriptionId, metadata } = event.data.object

        // Revoke entitlements sourced from this subscription
        await revokeEntitlementsFromSubscription(subscriptionId)

        // Handle tool featured listing
        if (metadata?.tool) {
          await db.tool.update({
            where: { slug: metadata?.tool },
            data: { isFeatured: false },
          })

          // Revalidate the cache
          revalidateTag("tools", "infinite")
        }

        break
      }
    }
  } catch (error) {
    console.log(error)

    return new Response(`Webhook handler failed: ${error}`, { status: 400 })
  }

  return new Response(JSON.stringify({ received: true }))
}
