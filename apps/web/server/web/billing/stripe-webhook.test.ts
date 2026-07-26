/**
 * SESSION_0711 / LANE SEC-01 — payment-integrity verification in the Stripe
 * webhook fulfillment branches.
 *
 * Drives `processStripeWebhook` directly with a stubbed Stripe client (no
 * module mock needed — the client is a parameter), against the dev Postgres
 * DB. Proves every `checkout.session.completed` payment branch cross-checks
 * the paid amount against the canonical expected price BEFORE granting:
 * forged-metadata and wrong-amount sessions are ACKed (200) but NOT fulfilled,
 * and the event row is flagged.
 *
 * Run: cd apps/web && bun test server/web/billing/stripe-webhook.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { afterAll, beforeEach, beforeAll, describe, expect, it, mock } from "bun:test"
import type Stripe from "stripe"

const notifySubmitterMock = mock(async () => {})
const notifyAdminMock = mock(async () => {})
const notifyMerchCustomerMock = mock(async () => {})
const createPrintfulOrderMock = mock(async () => {})

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
  notifyAdminOfPremiumTool: notifyAdminMock,
  notifySubmitterOfPremiumTool: notifySubmitterMock,
  notifyCustomerOfMerchOrder: notifyMerchCustomerMock,
  notifyUserOfLifecycleEvent: async () => {},
  notifyUserOfTournamentRegistration: async () => {},
}))

mock.module("~/server/web/merch/printful-actions", () => ({
  createPrintfulOrder: createPrintfulOrderMock,
}))

import { processStripeWebhook } from "~/server/web/billing/stripe-webhook"
import { db } from "~/services/db"

const TS = Date.now()
const TAG_PREFIX = "sec01-webhook-test-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`
const requestBrand = "BBL"
const WEBHOOK_SECRET = "whsec_sec01_test"

let mockedLineItems: Stripe.LineItem[] = []

/** Stub Stripe client — constructEvent parses the body verbatim. */
const stripeClient = {
  webhooks: {
    constructEvent: (body: string) => JSON.parse(body) as Stripe.Event,
  },
  checkout: {
    sessions: {
      listLineItems: async () => ({ data: mockedLineItems }),
    },
  },
  refunds: {
    create: async () => ({}),
  },
} as unknown as Stripe

type Fixtures = {
  userId: string
  organizationId: string
  disciplineId: string
  programId: string
  planId: string
  merchPlanId: string
  entitlementId: string
  priceId: string
  merchPriceId: string
  toolId: string
  toolSlug: string
  tournamentId: string
  tournamentDisciplineId: string
  divisionId: string
  roleId: string
  createdRole: boolean
}

let fx: Fixtures

const PLAN_CENTS = 9900
const MERCH_CENTS = 2500
const DIVISION_FEE_CENTS = 5000

beforeAll(async () => {
  const user = await db.user.create({
    data: { name: tag("user"), email: `${tag("user")}@test.local` },
  })

  const organization = await db.organization.create({
    data: {
      brand: requestBrand,
      name: tag("org"),
      slug: tag("org"),
      type: "DOJO",
      ownerId: user.id,
    },
  })

  const discipline = await db.discipline.create({
    data: { brand: requestBrand, name: tag("disc"), slug: tag("disc") },
  })

  const program = await db.program.create({
    data: {
      brand: requestBrand,
      name: tag("program"),
      slug: tag("program"),
      status: "ACTIVE",
      organizationId: organization.id,
    },
  })

  const entitlement = await db.entitlement.create({
    data: { brand: requestBrand, key: tag("access"), name: tag("access") },
  })

  const priceId = `price_sec01_plan_${TS}`
  const plan = await db.pricingPlan.create({
    data: {
      brand: requestBrand,
      organizationId: organization.id,
      programId: program.id,
      name: tag("plan"),
      pricingModel: "DROP_IN",
      amountCents: PLAN_CENTS,
      stripeProductId: `prod_sec01_plan_${TS}`,
      stripePriceId: priceId,
    },
  })

  await db.entitlementGrant.create({
    data: { pricingPlanId: plan.id, entitlementId: entitlement.id },
  })

  const merchPriceId = `price_sec01_merch_${TS}`
  const merchPlan = await db.pricingPlan.create({
    data: {
      brand: requestBrand,
      organizationId: organization.id,
      name: tag("merch-plan"),
      pricingModel: "CUSTOM",
      amountCents: MERCH_CENTS,
      stripeProductId: `prod_sec01_merch_${TS}`,
      stripePriceId: merchPriceId,
    },
  })

  const tool = await db.tool.create({
    data: {
      name: tag("tool"),
      slug: tag("tool"),
      websiteUrl: "https://example.test",
    },
  })

  const tournament = await db.tournament.create({
    data: {
      brand: requestBrand,
      name: tag("tournament"),
      slug: tag("tournament"),
      status: "PUBLISHED",
      startDate: new Date("2032-06-01T00:00:00.000Z"),
      endDate: new Date("2032-06-02T00:00:00.000Z"),
      hostId: organization.id,
    },
  })

  const tournamentDiscipline = await db.tournamentDiscipline.create({
    data: { tournamentId: tournament.id, disciplineId: discipline.id },
  })

  const existingRole = await db.tournamentRole.findFirst({
    where: { code: "COMPETITOR", OR: [{ brand: requestBrand }, { brand: null, isSystem: true }] },
  })
  const role =
    existingRole ??
    (await db.tournamentRole.create({
      data: { brand: requestBrand, code: "COMPETITOR", name: tag("COMPETITOR") },
    }))

  const division = await db.division.create({
    data: {
      name: tag("division"),
      format: "SPARRING",
      gender: "ANY",
      feeCents: DIVISION_FEE_CENTS,
      tournamentDisciplineId: tournamentDiscipline.id,
      roleRequiredId: role.id,
    },
  })

  fx = {
    userId: user.id,
    organizationId: organization.id,
    disciplineId: discipline.id,
    programId: program.id,
    planId: plan.id,
    merchPlanId: merchPlan.id,
    entitlementId: entitlement.id,
    priceId,
    merchPriceId,
    toolId: tool.id,
    toolSlug: tool.slug,
    tournamentId: tournament.id,
    tournamentDisciplineId: tournamentDiscipline.id,
    divisionId: division.id,
    roleId: role.id,
    createdRole: !existingRole,
  }
})

beforeEach(async () => {
  notifySubmitterMock.mockClear()
  notifyAdminMock.mockClear()
  notifyMerchCustomerMock.mockClear()
  createPrintfulOrderMock.mockClear()
  mockedLineItems = []

  if (!fx) return
  await db.stripeWebhookEvent.deleteMany({ where: { id: { startsWith: "evt_sec01_" } } })
  await db.registrationEntry.deleteMany({ where: { divisionId: fx.divisionId } })
  await db.registration.deleteMany({ where: { tournamentId: fx.tournamentId } })
  await db.programEnrollment.deleteMany({ where: { programId: fx.programId } })
  await db.merchOrder.deleteMany({
    where: { stripeCheckoutSessionId: { startsWith: "cs_sec01_" } },
  })
  const invoices = await db.invoice.findMany({
    where: { stripeCheckoutSessionId: { startsWith: "cs_sec01_" } },
    select: { id: true },
  })
  const invoiceIds = invoices.map(invoice => invoice.id)
  if (invoiceIds.length > 0) {
    await db.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } })
    await db.invoiceLineItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } })
    await db.invoice.deleteMany({ where: { id: { in: invoiceIds } } })
  }
  await db.userEntitlement.deleteMany({
    where: { userId: fx.userId, entitlementId: fx.entitlementId },
  })
})

afterAll(async () => {
  if (fx) {
    await db.stripeWebhookEvent.deleteMany({ where: { id: { startsWith: "evt_sec01_" } } })
    await db.registrationEntry.deleteMany({ where: { divisionId: fx.divisionId } })
    await db.registration.deleteMany({ where: { tournamentId: fx.tournamentId } })
    await db.division.deleteMany({ where: { id: fx.divisionId } })
    await db.tournamentDiscipline.deleteMany({ where: { id: fx.tournamentDisciplineId } })
    await db.tournament.deleteMany({ where: { id: fx.tournamentId } })
    if (fx.createdRole) {
      await db.tournamentRole.deleteMany({ where: { id: fx.roleId } })
    }
    await db.programEnrollment.deleteMany({ where: { programId: fx.programId } })
    await db.merchOrder.deleteMany({
      where: { stripeCheckoutSessionId: { startsWith: "cs_sec01_" } },
    })
    const invoices = await db.invoice.findMany({
      where: { stripeCheckoutSessionId: { startsWith: "cs_sec01_" } },
      select: { id: true },
    })
    const invoiceIds = invoices.map(invoice => invoice.id)
    if (invoiceIds.length > 0) {
      await db.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } })
      await db.invoiceLineItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } })
      await db.invoice.deleteMany({ where: { id: { in: invoiceIds } } })
    }
    await db.userEntitlement.deleteMany({ where: { entitlementId: fx.entitlementId } })
    await db.entitlementGrant.deleteMany({
      where: { pricingPlanId: { in: [fx.planId, fx.merchPlanId] } },
    })
    await db.pricingPlan.deleteMany({ where: { id: { in: [fx.planId, fx.merchPlanId] } } })
    await db.entitlement.deleteMany({ where: { id: fx.entitlementId } })
    await db.program.deleteMany({ where: { id: fx.programId } })
    await db.tool.deleteMany({ where: { id: fx.toolId } })
    await db.membership.deleteMany({ where: { organizationId: fx.organizationId } })
    await db.organizationDiscipline.deleteMany({ where: { organizationId: fx.organizationId } })
    await db.organization.deleteMany({ where: { id: fx.organizationId } })
    await db.discipline.deleteMany({ where: { id: fx.disciplineId } })
    await db.user.deleteMany({ where: { id: fx.userId } })
  }

  await db.$disconnect()
})

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const setMockedLineItems = (
  ...items: Array<{ priceId: string; unitAmount?: number; quantity?: number }>
) => {
  mockedLineItems = items.map(item => {
    return {
      object: "item",
      price: {
        id: item.priceId,
        object: "price",
        ...(typeof item.unitAmount === "number" ? { unit_amount: item.unitAmount } : {}),
      },
      quantity: item.quantity ?? 1,
    } as unknown as Stripe.LineItem
  })
}

let sessionCounter = 0

const makePaymentSession = ({
  amountSubtotalCents,
  amountTotalCents,
  metadata,
  customerEmail,
  shipping,
}: {
  amountSubtotalCents: number
  amountTotalCents?: number
  metadata: Record<string, string>
  customerEmail?: string
  shipping?: Record<string, unknown>
}): Stripe.Checkout.Session => {
  sessionCounter += 1
  return {
    id: `cs_sec01_${TS}_${sessionCounter}`,
    object: "checkout.session",
    mode: "payment",
    payment_status: "paid",
    payment_intent: `pi_sec01_${TS}_${sessionCounter}`,
    amount_subtotal: amountSubtotalCents,
    amount_total: amountTotalCents ?? amountSubtotalCents,
    currency: "usd",
    customer: null,
    subscription: null,
    invoice: null,
    customer_details: customerEmail ? { email: customerEmail, name: "SEC Test" } : null,
    shipping_details: shipping ?? null,
    metadata,
  } as unknown as Stripe.Checkout.Session
}

const postCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
  const event = {
    id: `evt_sec01_${session.id}`,
    object: "event",
    type: "checkout.session.completed",
    api_version: "2025-08-27.basil",
    created: Math.floor(Date.now() / 1000),
    data: { object: session },
    livemode: false,
    pending_webhooks: 0,
    request: { id: null, idempotency_key: null },
  } as unknown as Stripe.Event

  const req = new Request("http://localhost/api/stripe/webhooks", {
    method: "POST",
    body: JSON.stringify(event),
    headers: { "stripe-signature": "sig-bypassed-by-stub" },
  })

  const response = await processStripeWebhook(req, stripeClient, WEBHOOK_SECRET)
  return { response, eventId: event.id as string }
}

const getEventRow = (eventId: string) =>
  db.stripeWebhookEvent.findUnique({ where: { id: eventId } })

// Let inline `after()` callbacks flush.
const flushAfter = () => new Promise(resolve => setTimeout(resolve, 10))

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("SEC-01 — program enrollment amount verification", () => {
  it("skips fulfillment and flags the event when the paid amount is below the plan price", async () => {
    setMockedLineItems({ priceId: fx.priceId, unitAmount: PLAN_CENTS })

    const session = makePaymentSession({
      amountSubtotalCents: 100, // forged: canonical plan is 9900
      metadata: { type: "program_enrollment", programId: fx.programId, userId: fx.userId },
    })

    const { response, eventId } = await postCheckoutCompleted(session)

    expect(response.status).toBe(200)

    const enrollment = await db.programEnrollment.findFirst({
      where: { programId: fx.programId, userId: fx.userId },
    })
    expect(enrollment).toBeNull()

    const grants = await db.userEntitlement.findMany({
      where: { userId: fx.userId, entitlementId: fx.entitlementId },
    })
    expect(grants).toHaveLength(0)

    const invoice = await db.invoice.findUnique({
      where: { stripeCheckoutSessionId: session.id },
    })
    expect(invoice).toBeNull()

    const eventRow = await getEventRow(eventId)
    expect(eventRow?.status).toBe("PROCESSED")
    expect(eventRow?.lastError).toContain("AMOUNT_MISMATCH")
  })

  it("skips fulfillment when forged metadata has no mapped pricing plan", async () => {
    // No line items → no canonical plan to verify against.
    const session = makePaymentSession({
      amountSubtotalCents: PLAN_CENTS,
      metadata: { type: "program_enrollment", programId: fx.programId, userId: fx.userId },
    })

    const { response, eventId } = await postCheckoutCompleted(session)

    expect(response.status).toBe(200)
    const enrollment = await db.programEnrollment.findFirst({
      where: { programId: fx.programId, userId: fx.userId },
    })
    expect(enrollment).toBeNull()

    const eventRow = await getEventRow(eventId)
    expect(eventRow?.status).toBe("PROCESSED")
    expect(eventRow?.lastError).toContain("AMOUNT_MISMATCH")
  })

  it("fulfills enrollment, entitlement, and ledger when the amount matches the plan", async () => {
    setMockedLineItems({ priceId: fx.priceId, unitAmount: PLAN_CENTS })

    const session = makePaymentSession({
      amountSubtotalCents: PLAN_CENTS,
      metadata: { type: "program_enrollment", programId: fx.programId, userId: fx.userId },
    })

    const { response, eventId } = await postCheckoutCompleted(session)

    expect(response.status).toBe(200)

    const enrollment = await db.programEnrollment.findFirst({
      where: { programId: fx.programId, userId: fx.userId },
    })
    expect(enrollment?.status).toBe("ACTIVE")

    const grant = await db.userEntitlement.findFirst({
      where: { userId: fx.userId, entitlementId: fx.entitlementId, sourceId: session.id },
    })
    expect(grant?.status).toBe("ACTIVE")

    const eventRow = await getEventRow(eventId)
    expect(eventRow?.status).toBe("PROCESSED")
    expect(eventRow?.lastError).toBeNull()
  })
})

describe("SEC-01 — tournament registration amount verification", () => {
  it("skips registration and flags the event when paid below the division fee", async () => {
    const session = makePaymentSession({
      amountSubtotalCents: 100, // forged: canonical division fee is 5000
      metadata: {
        type: "tournament_registration",
        tournamentId: fx.tournamentId,
        userId: fx.userId,
        divisionIds: JSON.stringify([fx.divisionId]),
        roleId: fx.roleId,
        representingMembershipId: "",
      },
    })

    const { response, eventId } = await postCheckoutCompleted(session)

    expect(response.status).toBe(200)
    const registration = await db.registration.findFirst({
      where: { tournamentId: fx.tournamentId, recipientKey: fx.userId },
    })
    expect(registration).toBeNull()

    const eventRow = await getEventRow(eventId)
    expect(eventRow?.status).toBe("PROCESSED")
    expect(eventRow?.lastError).toContain("AMOUNT_MISMATCH tournament_registration")
  })

  it("skips registration when metadata references unknown divisions", async () => {
    const session = makePaymentSession({
      amountSubtotalCents: DIVISION_FEE_CENTS,
      metadata: {
        type: "tournament_registration",
        tournamentId: fx.tournamentId,
        userId: fx.userId,
        divisionIds: JSON.stringify(["forged-division-id"]),
        roleId: fx.roleId,
        representingMembershipId: "",
      },
    })

    const { response, eventId } = await postCheckoutCompleted(session)

    expect(response.status).toBe(200)
    const registration = await db.registration.findFirst({
      where: { tournamentId: fx.tournamentId, recipientKey: fx.userId },
    })
    expect(registration).toBeNull()

    const eventRow = await getEventRow(eventId)
    expect(eventRow?.lastError).toContain("unknown division ids")
  })

  it("registers when the paid amount covers the canonical division fee", async () => {
    const session = makePaymentSession({
      amountSubtotalCents: DIVISION_FEE_CENTS,
      metadata: {
        type: "tournament_registration",
        tournamentId: fx.tournamentId,
        userId: fx.userId,
        divisionIds: JSON.stringify([fx.divisionId]),
        roleId: fx.roleId,
        representingMembershipId: "",
      },
    })

    const { response, eventId } = await postCheckoutCompleted(session)

    expect(response.status).toBe(200)
    const registration = await db.registration.findFirst({
      where: { tournamentId: fx.tournamentId, recipientKey: fx.userId },
    })
    expect(registration?.paymentStatus).toBe("PAID")
    expect(registration?.totalFeeCents).toBe(DIVISION_FEE_CENTS)

    const eventRow = await getEventRow(eventId)
    expect(eventRow?.lastError).toBeNull()
  })
})

describe("SEC-01 — merch purchase amount verification", () => {
  const shipping = {
    name: "SEC Test",
    address: {
      line1: "1 Test St",
      line2: null,
      city: "Testville",
      state: "CA",
      postal_code: "90000",
      country: "US",
    },
  }

  it("skips MerchOrder + Printful when paid below the canonical plan amount", async () => {
    setMockedLineItems({ priceId: fx.merchPriceId, unitAmount: MERCH_CENTS })

    const session = makePaymentSession({
      amountSubtotalCents: 50, // forged: canonical merch plan is 2500
      metadata: {
        type: "merch_purchase",
        userId: fx.userId,
        pricingPlanId: fx.merchPlanId,
        brand: requestBrand,
        size: "L",
      },
      customerEmail: "sec01-merch@test.local",
      shipping,
    })

    const { response, eventId } = await postCheckoutCompleted(session)
    await flushAfter()

    expect(response.status).toBe(200)
    const order = await db.merchOrder.findUnique({
      where: { stripeCheckoutSessionId: session.id },
    })
    expect(order).toBeNull()
    expect(createPrintfulOrderMock).not.toHaveBeenCalled()
    expect(notifyMerchCustomerMock).not.toHaveBeenCalled()

    const eventRow = await getEventRow(eventId)
    expect(eventRow?.lastError).toContain("AMOUNT_MISMATCH merch_purchase")
  })

  it("skips fulfillment when metadata references an unknown pricing plan", async () => {
    const session = makePaymentSession({
      amountSubtotalCents: MERCH_CENTS,
      metadata: {
        type: "merch_purchase",
        userId: fx.userId,
        pricingPlanId: "forged-plan-id",
        brand: requestBrand,
      },
      customerEmail: "sec01-merch@test.local",
      shipping,
    })

    const { response, eventId } = await postCheckoutCompleted(session)
    await flushAfter()

    expect(response.status).toBe(200)
    const order = await db.merchOrder.findUnique({
      where: { stripeCheckoutSessionId: session.id },
    })
    expect(order).toBeNull()
    expect(createPrintfulOrderMock).not.toHaveBeenCalled()

    const eventRow = await getEventRow(eventId)
    expect(eventRow?.lastError).toContain("unknown pricing plan")
  })

  it("creates the MerchOrder when the paid amount covers the plan", async () => {
    setMockedLineItems({ priceId: fx.merchPriceId, unitAmount: MERCH_CENTS })

    const session = makePaymentSession({
      amountSubtotalCents: MERCH_CENTS,
      amountTotalCents: MERCH_CENTS + 499,
      metadata: {
        type: "merch_purchase",
        userId: fx.userId,
        pricingPlanId: fx.merchPlanId,
        brand: requestBrand,
        size: "L",
      },
      customerEmail: "sec01-merch@test.local",
      shipping,
    })

    const { response, eventId } = await postCheckoutCompleted(session)
    await flushAfter()

    expect(response.status).toBe(200)
    const order = await db.merchOrder.findUnique({
      where: { stripeCheckoutSessionId: session.id },
    })
    expect(order?.fulfillmentStatus).toBe("PAID")
    expect(order?.amountCents).toBe(MERCH_CENTS)

    const eventRow = await getEventRow(eventId)
    expect(eventRow?.lastError).toBeNull()
  })
})

describe("SEC-01 — premium tool amount verification", () => {
  it("skips the premium tool notifications when paid below the Stripe line-item amount", async () => {
    setMockedLineItems({ priceId: `price_sec01_tool_${TS}`, unitAmount: 9900 })

    const session = makePaymentSession({
      amountSubtotalCents: 100, // forged: line item says 9900
      metadata: { tool: fx.toolSlug },
    })

    const { response, eventId } = await postCheckoutCompleted(session)
    await flushAfter()

    expect(response.status).toBe(200)
    expect(notifySubmitterMock).not.toHaveBeenCalled()
    expect(notifyAdminMock).not.toHaveBeenCalled()

    const eventRow = await getEventRow(eventId)
    expect(eventRow?.lastError).toContain("AMOUNT_MISMATCH premium_tool")
  })

  it("notifies when the paid amount matches the Stripe line-item amount", async () => {
    setMockedLineItems({ priceId: `price_sec01_tool_${TS}`, unitAmount: 9900 })

    const session = makePaymentSession({
      amountSubtotalCents: 9900,
      metadata: { tool: fx.toolSlug },
    })

    const { response, eventId } = await postCheckoutCompleted(session)
    await flushAfter()

    expect(response.status).toBe(200)
    expect(notifySubmitterMock).toHaveBeenCalledTimes(1)
    expect(notifyAdminMock).toHaveBeenCalledTimes(1)

    const eventRow = await getEventRow(eventId)
    expect(eventRow?.lastError).toBeNull()
  })
})
