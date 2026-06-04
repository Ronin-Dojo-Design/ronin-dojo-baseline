/**
 * Bun-only Stripe checkout DB/webhook bridge for Playwright.
 *
 * Playwright runs helpers in Node. This script keeps Prisma fixture writes and
 * real webhook-route calls in Bun, where the generated Prisma TS client and
 * bun:test module mocks are available.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { mock } from "bun:test"
import { PrismaPg } from "@prisma/adapter-pg"
import type Stripe from "stripe"
import { PrismaClient } from "../../.generated/prisma/client"

const BRAND = "BASELINE_MARTIAL_ARTS"
const LINEAGE_MEMBERSHIP_SURFACE = "lineage_membership"

let mockedLineItems: Stripe.LineItem[] = []
const mockedSubscriptions = new Map<string, Partial<Stripe.Subscription>>()
let routeLoaded = false

mock.module("~/env", () => ({
  env: new Proxy({} as Record<string, string | undefined>, {
    get: (_target, key: string) => {
      if (key === "STRIPE_WEBHOOK_SECRET") return "whsec_e2e_signature_bypassed_by_mock"
      if (key === "STRIPE_SECRET_KEY") return "sk_test_unused_by_mocked_sdk"
      return process.env[key]
    },
  }),
  isProd: false,
  isDev: true,
}))

mock.module("~/services/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: (body: string) => JSON.parse(body) as Stripe.Event,
    },
    checkout: {
      sessions: {
        listLineItems: async () => ({ data: mockedLineItems }),
        create: async () => ({ id: "cs_e2e_unused", url: "http://localhost:3000/unused" }),
      },
    },
    subscriptions: {
      retrieve: async (subscriptionId: string) =>
        ({
          id: subscriptionId,
          object: "subscription",
          status: "active",
          metadata: {},
          customer: null,
          items: { data: [] },
          ...mockedSubscriptions.get(subscriptionId),
        }) as unknown as Stripe.Subscription,
    },
    refunds: {
      create: async () => ({}),
    },
  },
}))

mock.module("next/cache", () => ({
  revalidateTag: () => {},
  revalidatePath: () => {},
  updateTag: () => {},
}))

mock.module("next/server", () => ({
  after: (fn: () => void | Promise<void>) => {
    void Promise.resolve().then(() => fn())
  },
}))

mock.module("~/lib/notifications", () => ({
  notifyAdminOfPremiumTool: async () => {},
  notifyCustomerOfMerchOrder: async () => {},
  notifySubmitterOfPremiumTool: async () => {},
  notifyUserOfTournamentRegistration: async () => {},
}))

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const prisma = new PrismaClient({ adapter })

type LineageMembershipCheckoutFixture = {
  suffix: string
  userId: string
  organizationId: string
  planIds: string[]
  entitlementIds: string[]
  oneTimePlanId: string
  oneTimePlanName: string
  oneTimePriceId: string
  oneTimeEntitlementId: string
  subscriptionPlanId: string
  subscriptionPlanName: string
  subscriptionPriceId: string
  subscriptionEntitlementId: string
}

type FixturePayload = {
  fixture: LineageMembershipCheckoutFixture
}

const decodePayload = <T>() => {
  const encoded = process.argv[3]
  if (!encoded) return undefined as T | undefined

  return JSON.parse(Buffer.from(encoded, "base64").toString("utf-8")) as T
}

const tag = (suffix: string, name: string) => `e2e-lineage-membership-${suffix}-${name}`

async function getWebhookPost() {
  routeLoaded = true
  const route = await import("~/app/api/stripe/webhooks/route")
  return route.POST
}

const setMockedLineItemPriceIds = (...priceIds: string[]) => {
  mockedLineItems = priceIds.map(priceId => {
    return {
      object: "item",
      quantity: 1,
      price: {
        id: priceId,
        object: "price",
      },
    } as unknown as Stripe.LineItem
  })
}

const makeCheckoutCompletedEvent = (
  fixture: LineageMembershipCheckoutFixture,
  session: Stripe.Checkout.Session,
) => {
  return {
    id: `evt_e2e_lineage_${fixture.suffix}_checkout_${session.id}`,
    object: "event",
    type: "checkout.session.completed",
    api_version: "2025-08-27.basil",
    created: Math.floor(Date.now() / 1000),
    data: { object: session },
    livemode: false,
    pending_webhooks: 0,
    request: { id: null, idempotency_key: null },
  } as unknown as Stripe.Event
}

const makeSubscriptionDeletedEvent = (
  fixture: LineageMembershipCheckoutFixture,
  subscriptionId: string,
) => {
  return {
    id: `evt_e2e_lineage_${fixture.suffix}_deleted_${subscriptionId}`,
    object: "event",
    type: "customer.subscription.deleted",
    api_version: "2025-08-27.basil",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: subscriptionId,
        object: "subscription",
        metadata: {},
      },
    },
    livemode: false,
    pending_webhooks: 0,
    request: { id: null, idempotency_key: null },
  } as unknown as Stripe.Event
}

async function postWebhook(event: Stripe.Event) {
  const POST = await getWebhookPost()
  const req = new Request("http://localhost/api/stripe/webhooks", {
    method: "POST",
    body: JSON.stringify(event),
    headers: { "stripe-signature": "e2e-signature-bypassed-by-mock" },
  })
  const response = await POST(req)
  return { status: response.status, body: await response.text() }
}

async function seedFixture(userId: string): Promise<LineageMembershipCheckoutFixture> {
  const suffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
  const organization = await prisma.organization.create({
    data: {
      brand: BRAND,
      name: tag(suffix, "org"),
      slug: tag(suffix, "org"),
      type: "DOJO",
      ownerId: userId,
    },
  })

  const [oneTimeEntitlement, subscriptionEntitlement] = await Promise.all([
    prisma.entitlement.create({
      data: {
        brand: BRAND,
        key: tag(suffix, "legacy-access"),
        name: tag(suffix, "Legacy Access"),
      },
    }),
    prisma.entitlement.create({
      data: {
        brand: BRAND,
        key: tag(suffix, "legacy-subscription"),
        name: tag(suffix, "Legacy Subscription"),
      },
    }),
  ])

  const oneTimePriceId = `price_e2e_lineage_${suffix}_one_time`
  const subscriptionPriceId = `price_e2e_lineage_${suffix}_monthly`
  const metadata = {
    surface: LINEAGE_MEMBERSHIP_SURFACE,
    summary: "E2E paid lineage access",
    features: ["Profile claim support", "Legacy listing access", "Entitlement lifecycle proof"],
    ctaLabel: "Join Legacy",
  }

  const [oneTimePlan, subscriptionPlan] = await Promise.all([
    prisma.pricingPlan.create({
      data: {
        brand: BRAND,
        organizationId: organization.id,
        name: tag(suffix, "Legacy One-Time"),
        pricingModel: "CUSTOM",
        amountCents: 9900,
        stripeProductId: `prod_e2e_lineage_${suffix}_one_time`,
        stripePriceId: oneTimePriceId,
        metadata,
        sortOrder: 10,
      },
    }),
    prisma.pricingPlan.create({
      data: {
        brand: BRAND,
        organizationId: organization.id,
        name: tag(suffix, "Legacy Monthly"),
        pricingModel: "MONTHLY",
        amountCents: 2900,
        intervalMonths: 1,
        stripeProductId: `prod_e2e_lineage_${suffix}_monthly`,
        stripePriceId: subscriptionPriceId,
        metadata: { ...metadata, ctaLabel: "Start Monthly" },
        sortOrder: 20,
      },
    }),
  ])

  await prisma.entitlementGrant.createMany({
    data: [
      { pricingPlanId: oneTimePlan.id, entitlementId: oneTimeEntitlement.id },
      { pricingPlanId: subscriptionPlan.id, entitlementId: subscriptionEntitlement.id },
    ],
  })

  return {
    suffix,
    userId,
    organizationId: organization.id,
    planIds: [oneTimePlan.id, subscriptionPlan.id],
    entitlementIds: [oneTimeEntitlement.id, subscriptionEntitlement.id],
    oneTimePlanId: oneTimePlan.id,
    oneTimePlanName: oneTimePlan.name,
    oneTimePriceId,
    oneTimeEntitlementId: oneTimeEntitlement.id,
    subscriptionPlanId: subscriptionPlan.id,
    subscriptionPlanName: subscriptionPlan.name,
    subscriptionPriceId,
    subscriptionEntitlementId: subscriptionEntitlement.id,
  }
}

async function readState(fixture: LineageMembershipCheckoutFixture) {
  const [
    entitlements,
    membershipCount,
    programEnrollmentCount,
    paidInvoiceCount,
    stripeCustomerCount,
  ] = await Promise.all([
    prisma.userEntitlement.findMany({
      where: {
        userId: fixture.userId,
        entitlementId: { in: fixture.entitlementIds },
      },
      orderBy: [{ sourceType: "asc" }, { sourceId: "asc" }],
      select: {
        entitlementId: true,
        sourceType: true,
        sourceId: true,
        status: true,
      },
    }),
    prisma.membership.count({
      where: { userId: fixture.userId, organizationId: fixture.organizationId },
    }),
    prisma.programEnrollment.count({ where: { userId: fixture.userId } }),
    prisma.invoice.count({
      where: {
        userId: fixture.userId,
        organizationId: fixture.organizationId,
        status: "PAID",
      },
    }),
    prisma.stripeCustomer.count({
      where: {
        OR: [
          { userId: fixture.userId },
          { stripeCustomerId: { startsWith: `cus_e2e_lineage_${fixture.suffix}` } },
        ],
      },
    }),
  ])

  const processedWebhookCount = await prisma.stripeWebhookEvent.count({
    where: {
      id: { startsWith: `evt_e2e_lineage_${fixture.suffix}` },
      status: "PROCESSED",
    },
  })

  return {
    activePurchaseGrantCount: entitlements.filter(
      row => row.sourceType === "PURCHASE" && row.status === "ACTIVE",
    ).length,
    activeSubscriptionGrantCount: entitlements.filter(
      row => row.sourceType === "SUBSCRIPTION" && row.status === "ACTIVE",
    ).length,
    revokedSubscriptionGrantCount: entitlements.filter(
      row => row.sourceType === "SUBSCRIPTION" && row.status === "REVOKED",
    ).length,
    membershipCount,
    programEnrollmentCount,
    paidInvoiceCount,
    stripeCustomerCount,
    processedWebhookCount,
    entitlements,
  }
}

async function completeCheckout({
  fixture,
  mode,
  sessionId,
  subscriptionId,
}: FixturePayload & {
  mode: "payment" | "subscription"
  sessionId: string
  subscriptionId?: string
}) {
  const customerId = `cus_e2e_lineage_${fixture.suffix}_${mode}`
  const isSubscription = mode === "subscription"
  const priceId = isSubscription ? fixture.subscriptionPriceId : fixture.oneTimePriceId
  const pricingPlanId = isSubscription ? fixture.subscriptionPlanId : fixture.oneTimePlanId

  setMockedLineItemPriceIds(priceId)

  if (isSubscription) {
    const resolvedSubscriptionId = subscriptionId ?? `sub_e2e_lineage_${fixture.suffix}`
    mockedSubscriptions.set(resolvedSubscriptionId, {
      id: resolvedSubscriptionId,
      status: "active",
      customer: customerId,
      metadata: { userId: fixture.userId },
      items: {
        data: [
          {
            price: { id: priceId, object: "price" },
            quantity: 1,
          },
        ],
      } as unknown as Stripe.ApiList<Stripe.SubscriptionItem>,
    })
  }

  const session = {
    id: sessionId,
    object: "checkout.session",
    mode,
    payment_status: "paid",
    subscription: isSubscription ? (subscriptionId ?? `sub_e2e_lineage_${fixture.suffix}`) : null,
    customer: customerId,
    payment_intent: isSubscription ? null : `pi_e2e_lineage_${fixture.suffix}`,
    invoice: isSubscription ? null : `in_e2e_lineage_${fixture.suffix}`,
    amount_total: isSubscription ? 2900 : 9900,
    currency: "usd",
    metadata: isSubscription
      ? {}
      : {
          type: LINEAGE_MEMBERSHIP_SURFACE,
          userId: fixture.userId,
          pricingPlanId,
          organizationId: fixture.organizationId,
          brand: BRAND,
        },
  } as unknown as Stripe.Checkout.Session

  const response = await postWebhook(makeCheckoutCompletedEvent(fixture, session))
  return { ...response, state: await readState(fixture) }
}

async function deleteSubscription({
  fixture,
  subscriptionId,
}: FixturePayload & { subscriptionId: string }) {
  const response = await postWebhook(makeSubscriptionDeletedEvent(fixture, subscriptionId))
  return { ...response, state: await readState(fixture) }
}

async function cleanupFixture(fixture: LineageMembershipCheckoutFixture) {
  const invoices = await prisma.invoice.findMany({
    where: {
      OR: [
        { userId: fixture.userId, organizationId: fixture.organizationId },
        { lineItems: { some: { pricingPlanId: { in: fixture.planIds } } } },
      ],
    },
    select: { id: true },
  })
  const invoiceIds = invoices.map(invoice => invoice.id)

  if (invoiceIds.length > 0) {
    await prisma.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } })
    await prisma.invoiceLineItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } })
    await prisma.invoice.deleteMany({ where: { id: { in: invoiceIds } } })
  }

  await prisma.stripeWebhookEvent.deleteMany({
    where: { id: { startsWith: `evt_e2e_lineage_${fixture.suffix}` } },
  })
  await prisma.stripeCustomer.deleteMany({
    where: {
      OR: [
        { userId: fixture.userId },
        { stripeCustomerId: { startsWith: `cus_e2e_lineage_${fixture.suffix}` } },
      ],
    },
  })
  await prisma.programEnrollment.deleteMany({ where: { userId: fixture.userId } })
  await prisma.userEntitlement.deleteMany({
    where: {
      userId: fixture.userId,
      entitlementId: { in: fixture.entitlementIds },
    },
  })
  await prisma.entitlementGrant.deleteMany({
    where: {
      OR: [
        { pricingPlanId: { in: fixture.planIds } },
        { entitlementId: { in: fixture.entitlementIds } },
      ],
    },
  })
  await prisma.pricingPlan.deleteMany({ where: { id: { in: fixture.planIds } } })
  await prisma.entitlement.deleteMany({ where: { id: { in: fixture.entitlementIds } } })
  await prisma.membership.deleteMany({ where: { organizationId: fixture.organizationId } })
  await prisma.organizationDiscipline.deleteMany({
    where: { organizationId: fixture.organizationId },
  })
  await prisma.organization.deleteMany({ where: { id: fixture.organizationId } })
}

const command = process.argv[2]

try {
  if (command === "seed") {
    const payload = decodePayload<{ userId: string }>()
    if (!payload?.userId) throw new Error("Missing userId")

    process.stdout.write(JSON.stringify(await seedFixture(payload.userId)))
  } else if (command === "complete-checkout") {
    const payload = decodePayload<
      FixturePayload & {
        mode: "payment" | "subscription"
        sessionId: string
        subscriptionId?: string
      }
    >()
    if (!payload?.fixture || !payload.sessionId) {
      throw new Error("Missing checkout completion payload")
    }

    process.stdout.write(JSON.stringify(await completeCheckout(payload)))
  } else if (command === "delete-subscription") {
    const payload = decodePayload<FixturePayload & { subscriptionId: string }>()
    if (!payload?.fixture || !payload.subscriptionId) {
      throw new Error("Missing subscription deletion payload")
    }

    process.stdout.write(JSON.stringify(await deleteSubscription(payload)))
  } else if (command === "read-state") {
    const payload = decodePayload<FixturePayload>()
    if (!payload?.fixture) throw new Error("Missing fixture")

    process.stdout.write(JSON.stringify(await readState(payload.fixture)))
  } else if (command === "cleanup") {
    const payload = decodePayload<FixturePayload>()
    if (!payload?.fixture) throw new Error("Missing fixture")

    await cleanupFixture(payload.fixture)
  } else {
    throw new Error(`Unknown stripe-checkout-db command: ${command ?? "<missing>"}`)
  }
} finally {
  await prisma.$disconnect()

  if (routeLoaded) {
    const { db } = await import("~/services/db")
    await db.$disconnect()
  }
}
