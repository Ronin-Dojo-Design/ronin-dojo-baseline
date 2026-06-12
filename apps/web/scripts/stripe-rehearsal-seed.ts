/**
 * Stripe CLI live test-mode rehearsal bridge (SESSION_0369; procedure:
 * docs/runbooks/integrations/stripe-setup-runbook.md §"Stripe CLI live
 * test-mode rehearsal").
 *
 * Unlike e2e/helpers/stripe-checkout-db.ts (mocked SDK + bypassed signature),
 * this seeds a fixture bound to REAL test-mode Stripe price ids so the real
 * signed webhook → entitlement path can be rehearsed end-to-end off prod.
 *
 * Usage (from apps/web; payloads are base64 JSON, same as the e2e bridge):
 *   bun scripts/stripe-rehearsal-seed.ts seed <payload>
 *     payload: { suffix, brand, email, name, oneTimeProductId, oneTimePriceId,
 *                subscriptionProductId, subscriptionPriceId }
 *   bun scripts/stripe-rehearsal-seed.ts read-state <payload>   payload: { fixture }
 *   bun scripts/stripe-rehearsal-seed.ts cleanup <payload>      payload: { fixture }
 *
 * Never point DATABASE_URL at shared prod. Clean up by id afterward.
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const prisma = new PrismaClient({ adapter })

type SeedPayload = {
  suffix: string
  brand: "BBL" | "BASELINE_MARTIAL_ARTS" | "RONIN_DOJO_DESIGN" | "WEKAF"
  email: string
  name: string
  oneTimeProductId: string
  oneTimePriceId: string
  subscriptionProductId: string
  subscriptionPriceId: string
}

type RehearsalFixture = SeedPayload & {
  userId: string
  organizationId: string
  planIds: string[]
  entitlementIds: string[]
  oneTimePlanId: string
  subscriptionPlanId: string
  seededAt: string
}

const decodePayload = <T>() => {
  const encoded = process.argv[3]
  if (!encoded) return undefined as T | undefined
  return JSON.parse(Buffer.from(encoded, "base64").toString("utf-8")) as T
}

const tag = (suffix: string, name: string) => `rehearsal-${suffix}-${name}`

async function seed(payload: SeedPayload): Promise<RehearsalFixture> {
  const { suffix, brand } = payload

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      emailVerified: true,
      role: "user",
    },
  })
  await Promise.all([
    prisma.passport.create({ data: { userId: user.id, displayName: payload.name } }),
    prisma.directoryProfile.create({ data: { userId: user.id, slug: tag(suffix, "user") } }),
  ])

  const organization = await prisma.organization.create({
    data: {
      brand,
      name: tag(suffix, "org"),
      slug: tag(suffix, "org"),
      type: "DOJO",
      ownerId: user.id,
    },
  })

  const [oneTimeEntitlement, subscriptionEntitlement] = await Promise.all([
    prisma.entitlement.create({
      data: { brand, key: tag(suffix, "legacy-access"), name: tag(suffix, "Legacy Access") },
    }),
    prisma.entitlement.create({
      data: {
        brand,
        key: tag(suffix, "legacy-subscription"),
        name: tag(suffix, "Legacy Subscription"),
      },
    }),
  ])

  const metadata = {
    surface: "lineage_membership",
    summary: "Rehearsal — live test-mode webhook proof",
    features: ["Real signed webhook", "Entitlement lifecycle proof"],
    ctaLabel: "Join Legacy (rehearsal)",
  }

  const [oneTimePlan, subscriptionPlan] = await Promise.all([
    prisma.pricingPlan.create({
      data: {
        brand,
        organizationId: organization.id,
        name: tag(suffix, "Legacy One-Time"),
        pricingModel: "CUSTOM",
        amountCents: 9900,
        stripeProductId: payload.oneTimeProductId,
        stripePriceId: payload.oneTimePriceId,
        metadata,
        sortOrder: 9001,
      },
    }),
    prisma.pricingPlan.create({
      data: {
        brand,
        organizationId: organization.id,
        name: tag(suffix, "Legacy Monthly"),
        pricingModel: "MONTHLY",
        amountCents: 2900,
        intervalMonths: 1,
        stripeProductId: payload.subscriptionProductId,
        stripePriceId: payload.subscriptionPriceId,
        metadata: { ...metadata, ctaLabel: "Start Monthly (rehearsal)" },
        sortOrder: 9002,
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
    ...payload,
    userId: user.id,
    organizationId: organization.id,
    planIds: [oneTimePlan.id, subscriptionPlan.id],
    entitlementIds: [oneTimeEntitlement.id, subscriptionEntitlement.id],
    oneTimePlanId: oneTimePlan.id,
    subscriptionPlanId: subscriptionPlan.id,
    seededAt: new Date().toISOString(),
  }
}

async function readState(fixture: RehearsalFixture) {
  const seededAt = new Date(fixture.seededAt)
  const [entitlements, membershipCount, programEnrollmentCount, paidInvoiceCount, webhookEvents] =
    await Promise.all([
      prisma.userEntitlement.findMany({
        where: { userId: fixture.userId, entitlementId: { in: fixture.entitlementIds } },
        orderBy: [{ sourceType: "asc" }, { sourceId: "asc" }],
        select: { entitlementId: true, sourceType: true, sourceId: true, status: true },
      }),
      prisma.membership.count({
        where: { userId: fixture.userId, organizationId: fixture.organizationId },
      }),
      prisma.programEnrollment.count({ where: { userId: fixture.userId } }),
      prisma.invoice.count({
        where: { userId: fixture.userId, organizationId: fixture.organizationId, status: "PAID" },
      }),
      prisma.stripeWebhookEvent.findMany({
        where: { createdAt: { gte: seededAt } },
        orderBy: { createdAt: "asc" },
        select: { id: true, type: true, status: true },
      }),
    ])

  return {
    entitlements,
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
    webhookEventsSinceSeed: webhookEvents,
  }
}

async function cleanup(fixture: RehearsalFixture) {
  const invoices = await prisma.invoice.findMany({
    where: {
      OR: [
        { userId: fixture.userId },
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
    where: { createdAt: { gte: new Date(fixture.seededAt) } },
  })
  await prisma.stripeCustomer.deleteMany({ where: { userId: fixture.userId } })
  await prisma.userEntitlement.deleteMany({ where: { userId: fixture.userId } })
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
  await prisma.organization.deleteMany({ where: { id: fixture.organizationId } })
  await prisma.directoryProfile.deleteMany({ where: { userId: fixture.userId } })
  await prisma.passport.deleteMany({ where: { userId: fixture.userId } })
  await prisma.session.deleteMany({ where: { userId: fixture.userId } })
  await prisma.account.deleteMany({ where: { userId: fixture.userId } })
  await prisma.user.deleteMany({ where: { id: fixture.userId } })
}

const command = process.argv[2]

try {
  if (command === "seed") {
    const payload = decodePayload<SeedPayload>()
    if (!payload?.suffix || !payload.brand || !payload.oneTimePriceId) {
      throw new Error("Missing seed payload fields")
    }
    process.stdout.write(JSON.stringify(await seed(payload)))
  } else if (command === "read-state") {
    const payload = decodePayload<{ fixture: RehearsalFixture }>()
    if (!payload?.fixture) throw new Error("Missing fixture")
    process.stdout.write(JSON.stringify(await readState(payload.fixture), null, 2))
  } else if (command === "cleanup") {
    const payload = decodePayload<{ fixture: RehearsalFixture }>()
    if (!payload?.fixture) throw new Error("Missing fixture")
    await cleanup(payload.fixture)
    process.stdout.write("cleaned")
  } else {
    throw new Error(`Unknown stripe-rehearsal-seed command: ${command ?? "<missing>"}`)
  }
} finally {
  await prisma.$disconnect()
}
