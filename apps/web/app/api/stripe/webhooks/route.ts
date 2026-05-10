import { revalidateTag } from "next/cache"
import { after } from "next/server"
import type Stripe from "stripe"
import type { Brand } from "~/.generated/prisma/client"
import { env } from "~/env"
import { notifyAdminOfPremiumTool, notifySubmitterOfPremiumTool } from "~/lib/notifications"
import { upsertStripeCustomerMapping } from "~/server/web/billing/stripe-customers"
import { db } from "~/services/db"
import { stripe } from "~/services/stripe"

const SUBSCRIPTION_PAYMENT_GRACE_DAYS = 7

const isPrismaWriteConflict = (error: unknown) => {
  const maybeError = error as {
    code?: string
    cause?: { originalCode?: string; kind?: string }
  }

  return (
    typeof error === "object" &&
    error !== null &&
    (maybeError.code === "P2034" ||
      maybeError.cause?.originalCode === "40001" ||
      maybeError.cause?.kind === "TransactionWriteConflict")
  )
}

const isPrismaUniqueConstraint = (error: unknown) => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  )
}

const retryOnSerializableWriteConflict = async <T>(operation: () => Promise<T>): Promise<T> => {
  let lastError: unknown

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (!isPrismaWriteConflict(error) || attempt === 3) {
        throw error
      }
    }
  }

  throw lastError
}

const getStripeId = (value: string | { id?: string | null } | null | undefined) => {
  if (!value) return null
  return typeof value === "string" ? value : (value.id ?? null)
}

const unixSecondsToDate = (value: number | null | undefined) => {
  return value ? new Date(value * 1000) : null
}

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

const getEventObjectId = (event: Stripe.Event) => {
  const object = event.data.object as { id?: string }
  return object.id ?? null
}

const claimStripeWebhookEvent = async (event: Stripe.Event) => {
  try {
    await db.stripeWebhookEvent.create({
      data: {
        id: event.id,
        type: event.type,
        objectId: getEventObjectId(event),
      },
    })
    return true
  } catch (error) {
    if (!isPrismaUniqueConstraint(error)) {
      throw error
    }

    const existing = await db.stripeWebhookEvent.findUnique({ where: { id: event.id } })
    if (existing?.status === "PROCESSED") {
      return false
    }

    await db.stripeWebhookEvent.update({
      where: { id: event.id },
      data: {
        status: "PROCESSING",
        attempts: { increment: 1 },
        lastError: null,
      },
    })

    return true
  }
}

const markStripeWebhookEventProcessed = async (eventId: string) => {
  await db.stripeWebhookEvent.update({
    where: { id: eventId },
    data: {
      status: "PROCESSED",
      processedAt: new Date(),
      lastError: null,
    },
  })
}

const markStripeWebhookEventFailed = async (eventId: string, error: unknown) => {
  await db.stripeWebhookEvent.update({
    where: { id: eventId },
    data: {
      status: "FAILED",
      lastError: error instanceof Error ? error.message : String(error),
    },
  })
}

type MappedPricingPlanLineItem = {
  priceId: string
  quantity: number
  plan: {
    id: string
    brand: Brand
    name: string
    organizationId: string
    programId: string | null
    amountCents: number
    currency: string
    entitlementGrants: Array<{
      entitlement: {
        id: string
      }
    }>
  }
}

const resolvePricingPlanPriceIds = async (
  items: Array<{ priceId: string; quantity?: number | null }>,
): Promise<MappedPricingPlanLineItem[]> => {
  const mappedItems: MappedPricingPlanLineItem[] = []

  for (const item of items) {
    const plan = await db.pricingPlan.findFirst({
      where: { stripePriceId: item.priceId },
      select: {
        id: true,
        brand: true,
        name: true,
        organizationId: true,
        programId: true,
        amountCents: true,
        currency: true,
        entitlementGrants: { select: { entitlement: { select: { id: true } } } },
      },
    })

    if (!plan) continue

    mappedItems.push({
      priceId: item.priceId,
      quantity: item.quantity ?? 1,
      plan,
    })
  }

  return mappedItems
}

const resolvePricingPlanLineItems = async (
  session: Stripe.Checkout.Session,
): Promise<MappedPricingPlanLineItem[]> => {
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
  return resolvePricingPlanPriceIds(
    lineItems.data
      .map(item => ({ priceId: item.price?.id, quantity: item.quantity }))
      .filter((item): item is { priceId: string; quantity: number | null } =>
        Boolean(item.priceId),
      ),
  )
}

const resolveBrandFromCheckout = async (
  session: Stripe.Checkout.Session,
  mappedItems: MappedPricingPlanLineItem[],
) => {
  const mappedBrand = mappedItems[0]?.plan.brand
  if (mappedBrand) return mappedBrand

  const tournamentId = session.metadata?.tournamentId
  if (tournamentId) {
    const tournament = await db.tournament.findUnique({
      where: { id: tournamentId },
      select: { brand: true },
    })
    return tournament?.brand ?? null
  }

  const programId = session.metadata?.programId
  if (programId) {
    const program = await db.program.findUnique({
      where: { id: programId },
      select: { brand: true },
    })
    return program?.brand ?? null
  }

  return null
}

const persistStripeCustomerFromCheckout = async (
  session: Stripe.Checkout.Session,
  mappedItems: MappedPricingPlanLineItem[],
) => {
  const userId = session.metadata?.userId
  const customerId = getStripeId(session.customer)
  if (!userId || !customerId) return

  const brand = await resolveBrandFromCheckout(session, mappedItems)
  if (!brand) return

  await upsertStripeCustomerMapping({
    userId,
    brand,
    stripeCustomerId: customerId,
  })
}

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
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null)

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
        stripePaymentIntentId: paymentIntentId,
      },
    })
    return
  }

  const totalFeeCents = session.amount_total ?? 0

  const result = await retryOnSerializableWriteConflict(() =>
    db.$transaction(
      async tx => {
        const divisions = await tx.division.findMany({
          where: { id: { in: parsedDivisionIds } },
          include: { _count: { select: { entries: { where: { status: "ACTIVE" } } } } },
        })

        if (divisions.length !== parsedDivisionIds.length) {
          throw new Error("One or more selected divisions not found")
        }

        // Snapshot the user's current rank and org for registration entries
        let snapshotRankName: string | null = null
        let snapshotOrgName: string | null = null

        if (representingMembershipId) {
          const membership = await tx.membership.findUnique({
            where: { id: representingMembershipId },
            select: {
              rank: { select: { name: true } },
              organization: { select: { name: true } },
            },
          })

          if (membership) {
            snapshotRankName = membership.rank?.name ?? null
            snapshotOrgName = membership.organization?.name ?? null
          }
        }

        const isAtCapacity = divisions.some(
          division =>
            division.capacity !== null &&
            division.capacity > 0 &&
            division._count.entries >= division.capacity,
        )

        if (isAtCapacity) {
          const registration = await tx.registration.create({
            data: {
              tournamentId,
              userId,
              status: "CANCELLED",
              paymentStatus: "REFUNDED",
              totalFeeCents,
              submittedAt: new Date(),
              stripePaymentIntentId: paymentIntentId,
              entries: {
                create: parsedDivisionIds.map(divisionId => ({
                  divisionId,
                  tournamentRoleId: roleId,
                  representingMembershipId: representingMembershipId || null,
                  snapshotRankName,
                  snapshotOrgName,
                  status: "CANCELLED",
                })),
              },
            },
          })

          return {
            type: "refund-needed" as const,
            registrationId: registration.id,
            paymentIntentId,
          }
        }

        const registration = await tx.registration.create({
          data: {
            tournamentId,
            userId,
            status: "SUBMITTED",
            paymentStatus: "PAID",
            totalFeeCents,
            submittedAt: new Date(),
            stripePaymentIntentId: paymentIntentId,
            entries: {
              create: parsedDivisionIds.map(divisionId => ({
                divisionId,
                tournamentRoleId: roleId,
                representingMembershipId: representingMembershipId || null,
                snapshotRankName,
                snapshotOrgName,
              })),
            },
          },
        })

        return {
          type: "registered" as const,
          registrationId: registration.id,
        }
      },
      { isolationLevel: "Serializable" },
    ),
  )

  if (result.type !== "refund-needed") return

  if (!result.paymentIntentId) {
    console.log("Tournament registration rejected at capacity but no payment intent found", {
      registrationId: result.registrationId,
      tournamentId,
      userId,
    })
    return
  }

  try {
    await stripe.refunds.create({ payment_intent: result.paymentIntentId })
  } catch (error) {
    console.log("Failed to refund at-capacity tournament registration", {
      error,
      registrationId: result.registrationId,
      paymentIntentId: result.paymentIntentId,
      tournamentId,
      userId,
    })
  }
}

async function createLedgerFromCheckout(
  session: Stripe.Checkout.Session,
  mappedItems: MappedPricingPlanLineItem[],
) {
  const userId = session.metadata?.userId
  if (!userId || session.metadata?.type === "tournament_registration" || mappedItems.length === 0) {
    return
  }

  const existing = await db.invoice.findUnique({
    where: { stripeCheckoutSessionId: session.id },
    select: { id: true },
  })

  if (existing) return

  const primaryPlan = mappedItems[0]!.plan
  const subtotalCents = mappedItems.reduce(
    (sum, item) => sum + item.plan.amountCents * item.quantity,
    0,
  )
  const totalCents = session.amount_total ?? subtotalCents
  const currency = (session.currency ?? primaryPlan.currency).toUpperCase()
  const paidAt = new Date()
  const paymentIntentId = getStripeId(session.payment_intent)
  const stripeInvoiceId = getStripeId(session.invoice)
  const subscriptionId = getStripeId(session.subscription)

  await db.invoice.create({
    data: {
      brand: primaryPlan.brand,
      organizationId: primaryPlan.organizationId,
      userId,
      status: "PAID",
      invoiceNumber: stripeInvoiceId ?? session.id,
      stripeInvoiceId,
      stripeCheckoutSessionId: session.id,
      stripeSubscriptionId: subscriptionId,
      subtotalCents,
      discountCents: Math.max(0, subtotalCents - totalCents),
      totalCents,
      currency,
      issuedAt: paidAt,
      paidAt,
      lineItems: {
        create: mappedItems.map(item => ({
          description: item.plan.name,
          amountCents: item.plan.amountCents,
          quantity: item.quantity,
          pricingPlanId: item.plan.id,
        })),
      },
      payments: {
        create: {
          amountCents: totalCents,
          currency,
          method: "CARD",
          stripePaymentIntentId: paymentIntentId,
          stripeCheckoutSessionId: session.id,
          paidAt,
        },
      },
    },
  })
}

/**
 * Given a Stripe checkout session, grant all entitlements linked to mapped
 * PricingPlans resolved from the session line-item price IDs.
 */
async function grantEntitlementsFromCheckout(
  session: Stripe.Checkout.Session,
  mappedItems: MappedPricingPlanLineItem[],
) {
  const userId = session.metadata?.userId
  if (!userId) return

  for (const item of mappedItems) {
    for (const grant of item.plan.entitlementGrants) {
      const sourceType = session.mode === "subscription" ? "SUBSCRIPTION" : "PURCHASE"
      const subscriptionId = getStripeId(session.subscription)
      const sourceId = sourceType === "SUBSCRIPTION" ? subscriptionId : session.id

      if (!sourceId) continue

      // Upsert: reactivate if revoked/expired, or create new
      const existing = await db.userEntitlement.findFirst({
        where: {
          userId,
          entitlementId: grant.entitlement.id,
          sourceType,
          sourceId,
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
            sourceType,
            sourceId,
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

const resolveSubscriptionUser = async ({
  subscriptionId,
  customerId,
  metadataUserId,
}: {
  subscriptionId: string
  customerId?: string | null
  metadataUserId?: string | null
}) => {
  if (metadataUserId) return metadataUserId

  const existingEntitlement = await db.userEntitlement.findFirst({
    where: { sourceType: "SUBSCRIPTION", sourceId: subscriptionId },
    select: { userId: true },
  })

  if (existingEntitlement) return existingEntitlement.userId

  if (!customerId) return null

  const customer = await db.stripeCustomer.findUnique({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
  })

  return customer?.userId ?? null
}

const syncSubscriptionEntitlements = async (subscription: Stripe.Subscription) => {
  const subscriptionWithPeriod = subscription as Stripe.Subscription & {
    current_period_end?: number | null
    items?: { data?: Array<{ price?: { id?: string | null } | null; quantity?: number | null }> }
  }
  const subscriptionId = subscription.id
  const customerId = getStripeId(subscription.customer)
  const priceItems =
    subscriptionWithPeriod.items?.data
      ?.map(item => ({ priceId: item.price?.id, quantity: item.quantity ?? null }))
      .filter((item): item is { priceId: string; quantity: number | null } =>
        Boolean(item.priceId),
      ) ?? []
  const mappedItems = await resolvePricingPlanPriceIds(priceItems)
  const userId = await resolveSubscriptionUser({
    subscriptionId,
    customerId,
    metadataUserId: subscription.metadata?.userId,
  })

  if (!userId) return

  const brand = mappedItems[0]?.plan.brand
  if (customerId && brand) {
    await upsertStripeCustomerMapping({ userId, brand, stripeCustomerId: customerId })
  }

  if (["canceled", "unpaid", "incomplete_expired"].includes(subscription.status)) {
    await revokeEntitlementsFromSubscription(subscriptionId)
    await suspendProgramEnrollmentsForEntitlementSource({ userId, sourceId: subscriptionId })
    return
  }

  if (!["active", "trialing", "past_due"].includes(subscription.status)) return

  const endsAt = subscription.cancel_at_period_end
    ? unixSecondsToDate(subscriptionWithPeriod.current_period_end)
    : null
  const desiredEntitlementIds = mappedItems.flatMap(item =>
    item.plan.entitlementGrants.map(grant => grant.entitlement.id),
  )

  for (const item of mappedItems) {
    for (const grant of item.plan.entitlementGrants) {
      const existing = await db.userEntitlement.findFirst({
        where: {
          userId,
          entitlementId: grant.entitlement.id,
          sourceType: "SUBSCRIPTION",
          sourceId: subscriptionId,
        },
      })

      if (existing) {
        await db.userEntitlement.update({
          where: { id: existing.id },
          data: { status: "ACTIVE", startsAt: new Date(), endsAt },
        })
      } else {
        await db.userEntitlement.create({
          data: {
            userId,
            entitlementId: grant.entitlement.id,
            sourceType: "SUBSCRIPTION",
            sourceId: subscriptionId,
            endsAt,
          },
        })
      }
    }
  }

  if (desiredEntitlementIds.length > 0) {
    await db.userEntitlement.updateMany({
      where: {
        userId,
        sourceType: "SUBSCRIPTION",
        sourceId: subscriptionId,
        entitlementId: { notIn: desiredEntitlementIds },
        status: "ACTIVE",
      },
      data: { status: "REVOKED" },
    })
  }
}

const applySubscriptionPaymentGrace = async (subscriptionId: string) => {
  await db.userEntitlement.updateMany({
    where: {
      sourceType: "SUBSCRIPTION",
      sourceId: subscriptionId,
      status: "ACTIVE",
    },
    data: { endsAt: addDays(new Date(), SUBSCRIPTION_PAYMENT_GRACE_DAYS) },
  })
}

const getInvoiceSubscriptionId = (invoice: Stripe.Invoice) => {
  const invoiceWithSubscription = invoice as Stripe.Invoice & {
    subscription?: string | { id?: string | null } | null
    parent?: { subscription_details?: { subscription?: string | null } | null } | null
  }

  return (
    getStripeId(invoiceWithSubscription.subscription) ??
    invoiceWithSubscription.parent?.subscription_details?.subscription ??
    null
  )
}

const getInvoiceLinePriceItems = (invoice: Stripe.Invoice) => {
  const invoiceWithLines = invoice as unknown as {
    lines?: {
      data?: Array<{
        price?: { id?: string | null } | null
        quantity?: number | null
        period?: { end?: number | null } | null
      }>
    }
  }

  return (
    invoiceWithLines.lines?.data
      ?.map(line => ({
        priceId: line.price?.id,
        quantity: line.quantity ?? null,
        periodEnd: line.period?.end ?? null,
      }))
      .filter(
        (line): line is { priceId: string; quantity: number | null; periodEnd: number | null } =>
          Boolean(line.priceId),
      ) ?? []
  )
}

const createLedgerFromPaidInvoice = async (invoice: Stripe.Invoice) => {
  const existing = await db.invoice.findUnique({
    where: { stripeInvoiceId: invoice.id },
    select: { id: true },
  })

  if (existing) return

  const subscriptionId = getInvoiceSubscriptionId(invoice)
  const customerId = getStripeId(invoice.customer)
  const priceItems = getInvoiceLinePriceItems(invoice)
  const mappedItems = await resolvePricingPlanPriceIds(priceItems)
  if (!subscriptionId || mappedItems.length === 0) return

  const userId = await resolveSubscriptionUser({
    subscriptionId,
    customerId,
    metadataUserId: invoice.metadata?.userId,
  })
  if (!userId) return

  const primaryPlan = mappedItems[0]!.plan
  if (customerId) {
    await upsertStripeCustomerMapping({
      userId,
      brand: primaryPlan.brand,
      stripeCustomerId: customerId,
    })
  }

  const periodEnd =
    priceItems.map(item => item.periodEnd).find((value): value is number => Boolean(value)) ?? null
  const endsAt = unixSecondsToDate(periodEnd)
  const subtotalCents =
    invoice.subtotal ??
    mappedItems.reduce((sum, item) => sum + item.plan.amountCents * item.quantity, 0)
  const totalCents = invoice.amount_paid ?? invoice.total ?? subtotalCents
  const currency = (invoice.currency ?? primaryPlan.currency).toUpperCase()
  const paidAt = new Date()
  const invoiceWithPayment = invoice as unknown as {
    payment_intent?: string | { id?: string | null } | null
  }
  const paymentIntentId = getStripeId(invoiceWithPayment.payment_intent)

  for (const item of mappedItems) {
    for (const grant of item.plan.entitlementGrants) {
      const existingEntitlement = await db.userEntitlement.findFirst({
        where: {
          userId,
          entitlementId: grant.entitlement.id,
          sourceType: "SUBSCRIPTION",
          sourceId: subscriptionId,
        },
      })

      if (existingEntitlement) {
        await db.userEntitlement.update({
          where: { id: existingEntitlement.id },
          data: { status: "ACTIVE", startsAt: new Date(), endsAt },
        })
      } else {
        await db.userEntitlement.create({
          data: {
            userId,
            entitlementId: grant.entitlement.id,
            sourceType: "SUBSCRIPTION",
            sourceId: subscriptionId,
            endsAt,
          },
        })
      }
    }
  }

  await db.invoice.create({
    data: {
      brand: primaryPlan.brand,
      organizationId: primaryPlan.organizationId,
      userId,
      status: "PAID",
      invoiceNumber: invoice.number ?? invoice.id,
      stripeInvoiceId: invoice.id,
      stripeSubscriptionId: subscriptionId,
      subtotalCents,
      totalCents,
      currency,
      issuedAt: invoice.created ? new Date(invoice.created * 1000) : paidAt,
      paidAt,
      lineItems: {
        create: mappedItems.map(item => ({
          description: item.plan.name,
          amountCents: item.plan.amountCents,
          quantity: item.quantity,
          pricingPlanId: item.plan.id,
        })),
      },
      payments: {
        create: {
          amountCents: totalCents,
          currency,
          method: "CARD",
          stripePaymentIntentId: paymentIntentId,
          paidAt,
        },
      },
    },
  })
}

async function suspendProgramEnrollmentsForEntitlementSource({
  userId,
  sourceId,
}: {
  userId: string
  sourceId: string
}) {
  const entitlements = await db.userEntitlement.findMany({
    where: { userId, sourceId, status: { in: ["REVOKED", "EXPIRED", "ACTIVE"] } },
    select: { entitlementId: true },
  })
  const entitlementIds = entitlements.map(entitlement => entitlement.entitlementId)
  if (entitlementIds.length === 0) return

  const plans = await db.pricingPlan.findMany({
    where: {
      programId: { not: null },
      entitlementGrants: { some: { entitlementId: { in: entitlementIds } } },
    },
    select: { programId: true },
  })
  const programIds = plans
    .map(plan => plan.programId)
    .filter((programId): programId is string => Boolean(programId))
  if (programIds.length === 0) return

  await db.programEnrollment.updateMany({
    where: {
      userId,
      programId: { in: programIds },
      status: "ACTIVE",
    },
    data: { status: "SUSPENDED" },
  })
}

const revokeAccessForPaymentIntent = async ({
  paymentIntentId,
  markRefunded,
}: {
  paymentIntentId: string
  markRefunded: boolean
}) => {
  const payments = await db.payment.findMany({
    where: { stripePaymentIntentId: paymentIntentId },
    include: {
      invoice: {
        include: {
          lineItems: {
            include: {
              pricingPlan: {
                include: { entitlementGrants: true },
              },
            },
          },
        },
      },
    },
  })

  for (const payment of payments) {
    const sourceIds = [
      payment.invoice.stripeCheckoutSessionId,
      payment.invoice.stripeSubscriptionId,
    ].filter((sourceId): sourceId is string => Boolean(sourceId))
    const entitlementIds = payment.invoice.lineItems.flatMap(
      lineItem => lineItem.pricingPlan?.entitlementGrants.map(grant => grant.entitlementId) ?? [],
    )

    if (sourceIds.length > 0 && entitlementIds.length > 0) {
      await db.userEntitlement.updateMany({
        where: {
          userId: payment.invoice.userId,
          sourceId: { in: sourceIds },
          entitlementId: { in: entitlementIds },
          status: "ACTIVE",
        },
        data: { status: "REVOKED" },
      })

      for (const sourceId of sourceIds) {
        await suspendProgramEnrollmentsForEntitlementSource({
          userId: payment.invoice.userId,
          sourceId,
        })
      }
    }

    if (markRefunded) {
      await db.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: "REFUNDED" },
      })
    }
  }
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
    const shouldProcess = await claimStripeWebhookEvent(event)
    if (!shouldProcess) {
      return new Response(JSON.stringify({ received: true, duplicate: true }))
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const { mode, subscription, metadata } = session
        const mappedItems = await resolvePricingPlanLineItems(session)

        await persistStripeCustomerFromCheckout(session, mappedItems)

        // Grant entitlements linked to the purchased/subscribed plan.
        await grantEntitlementsFromCheckout(session, mappedItems)

        switch (mode) {
          case "payment": {
            await createLedgerFromCheckout(session, mappedItems)

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

            // Handle merch purchase — create ledger only, no entitlement grant
            // Physical goods: no digital access to provision
            // @see docs/sprints/SESSION_0112.md TASK_07
            if (metadata?.type === "merch_purchase") {
              console.log(
                `🛍️ Merch purchase: user=${metadata.userId} plan=${metadata.pricingPlanId} size=${metadata.size ?? "n/a"} color=${metadata.color ?? "n/a"}`,
              )
              // Ledger already created by createLedgerFromCheckout above
              // Shipping address is on the Stripe session (session.shipping_details)
              revalidateTag("merch", "infinite")
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
            const subscriptionId = getStripeId(subscription)
            if (!subscriptionId) break

            const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)
            const { metadata } = stripeSubscription
            await syncSubscriptionEntitlements(stripeSubscription)

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

      case "customer.subscription.updated": {
        await syncSubscriptionEntitlements(event.data.object)
        break
      }

      case "customer.subscription.deleted": {
        const { id: subscriptionId, metadata } = event.data.object

        // Revoke entitlements sourced from this subscription
        await revokeEntitlementsFromSubscription(subscriptionId)
        const sourceEntitlement = await db.userEntitlement.findFirst({
          where: { sourceType: "SUBSCRIPTION", sourceId: subscriptionId },
          select: { userId: true },
        })
        if (sourceEntitlement) {
          await suspendProgramEnrollmentsForEntitlementSource({
            userId: sourceEntitlement.userId,
            sourceId: subscriptionId,
          })
        }

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

      case "invoice.payment_failed": {
        const subscriptionId = getInvoiceSubscriptionId(event.data.object)
        if (subscriptionId) {
          await applySubscriptionPaymentGrace(subscriptionId)
        }
        break
      }

      case "invoice.paid": {
        await createLedgerFromPaidInvoice(event.data.object)
        break
      }

      case "charge.refunded": {
        const charge = event.data.object
        const paymentIntentId = getStripeId(charge.payment_intent)
        const isFullRefund =
          charge.refunded === true ||
          (typeof charge.amount_refunded === "number" &&
            typeof charge.amount === "number" &&
            charge.amount_refunded >= charge.amount)

        if (paymentIntentId && isFullRefund) {
          await revokeAccessForPaymentIntent({ paymentIntentId, markRefunded: true })
        }
        break
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute & {
          payment_intent?: string | { id?: string | null } | null
          charge?: string | { id?: string | null; payment_intent?: string | null } | null
        }
        const paymentIntentId =
          getStripeId(dispute.payment_intent) ??
          (typeof dispute.charge === "object" ? (dispute.charge?.payment_intent ?? null) : null)

        if (paymentIntentId) {
          await revokeAccessForPaymentIntent({ paymentIntentId, markRefunded: false })
        }
        break
      }
    }

    await markStripeWebhookEventProcessed(event.id)
  } catch (error) {
    try {
      await markStripeWebhookEventFailed(event.id, error)
    } catch (markFailedError) {
      console.log(markFailedError)
    }
    console.log(error)

    return new Response(`Webhook handler failed: ${error}`, { status: 400 })
  }

  return new Response(JSON.stringify({ received: true }))
}
