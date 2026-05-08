/**
 * SESSION_0098 - payment and entitlement drift audit proof.
 *
 * Run: cd apps/web && bun test server/web/billing/drift-audit.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { afterAll, afterEach, describe, expect, it } from "bun:test"
import { runPaymentEntitlementDriftAudit } from "~/server/web/billing/drift-audit"
import { db } from "~/services/db"

const TS = Date.now()
const BRAND = "BASELINE_MARTIAL_ARTS"
const prefixes = new Set<string>()
const now = new Date("2026-05-08T12:00:00.000Z")

const prefixFor = (name: string) => {
  const prefix = `session-0098-audit-${TS}-${name}`
  prefixes.add(prefix)
  return prefix
}

const cleanupPrefix = async (prefix: string) => {
  await db.stripeWebhookEvent.deleteMany({ where: { id: { startsWith: prefix } } })

  const invoices = await db.invoice.findMany({
    where: { invoiceNumber: { startsWith: prefix } },
    select: { id: true },
  })
  const invoiceIds = invoices.map(invoice => invoice.id)
  if (invoiceIds.length > 0) {
    await db.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } })
    await db.invoiceLineItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } })
    await db.invoice.deleteMany({ where: { id: { in: invoiceIds } } })
  }

  await db.programEnrollment.deleteMany({
    where: { program: { name: { startsWith: prefix } } },
  })
  await db.userEntitlement.deleteMany({
    where: {
      OR: [{ sourceId: { startsWith: prefix } }, { entitlement: { key: { startsWith: prefix } } }],
    },
  })
  await db.entitlementGrant.deleteMany({
    where: {
      OR: [
        { pricingPlan: { name: { startsWith: prefix } } },
        { entitlement: { key: { startsWith: prefix } } },
      ],
    },
  })
  await db.pricingPlan.deleteMany({ where: { name: { startsWith: prefix } } })
  await db.certificateTemplate.deleteMany({ where: { name: { startsWith: prefix } } })
  await db.entitlement.deleteMany({ where: { key: { startsWith: prefix } } })
  await db.program.deleteMany({ where: { name: { startsWith: prefix } } })
  await db.organization.deleteMany({ where: { slug: { startsWith: prefix } } })
  await db.user.deleteMany({ where: { email: { startsWith: prefix } } })
}

const createUserOrgProgram = async (prefix: string) => {
  const user = await db.user.create({
    data: { name: `${prefix}-user`, email: `${prefix}@test.local` },
  })
  const organization = await db.organization.create({
    data: {
      brand: BRAND,
      name: `${prefix}-org`,
      slug: `${prefix}-org`,
      type: "DOJO",
      ownerId: user.id,
    },
  })
  const program = await db.program.create({
    data: {
      brand: BRAND,
      name: `${prefix}-program`,
      slug: `${prefix}-program`,
      status: "ACTIVE",
      organizationId: organization.id,
    },
  })

  return { user, organization, program }
}

const createEntitlement = async (prefix: string, name: string) => {
  return db.entitlement.create({
    data: {
      brand: BRAND,
      key: `${prefix}-${name}`,
      name: `${prefix}-${name}`,
    },
  })
}

const createPlan = async ({
  prefix,
  organizationId,
  programId,
  entitlementId,
  name,
  priceId,
}: {
  prefix: string
  organizationId: string
  programId: string
  entitlementId?: string
  name: string
  priceId: string
}) => {
  const plan = await db.pricingPlan.create({
    data: {
      brand: BRAND,
      name: `${prefix}-${name}`,
      organizationId,
      programId,
      pricingModel: "DROP_IN",
      amountCents: 9900,
      stripeProductId: `${prefix}-prod-${name}`,
      stripePriceId: priceId,
    },
  })

  if (entitlementId) {
    await db.entitlementGrant.create({
      data: { pricingPlanId: plan.id, entitlementId },
    })
  }

  return plan
}

afterEach(async () => {
  for (const prefix of prefixes) {
    await cleanupPrefix(prefix)
  }
  prefixes.clear()
})

afterAll(async () => {
  await db.$disconnect()
})

describe("runPaymentEntitlementDriftAudit", () => {
  it("passes clean when paid invoice, entitlement, and enrollment sources match", async () => {
    const prefix = prefixFor("clean")
    const { user, organization, program } = await createUserOrgProgram(prefix)
    const entitlement = await createEntitlement(prefix, "access")
    const plan = await createPlan({
      prefix,
      organizationId: organization.id,
      programId: program.id,
      entitlementId: entitlement.id,
      name: "plan",
      priceId: `${prefix}-price`,
    })
    const checkoutSessionId = `${prefix}-cs-clean`

    await db.invoice.create({
      data: {
        brand: BRAND,
        organizationId: organization.id,
        userId: user.id,
        status: "PAID",
        invoiceNumber: `${prefix}-invoice-clean`,
        stripeCheckoutSessionId: checkoutSessionId,
        subtotalCents: 9900,
        totalCents: 9900,
        currency: "USD",
        paidAt: now,
        lineItems: {
          create: {
            description: plan.name,
            amountCents: 9900,
            quantity: 1,
            pricingPlanId: plan.id,
          },
        },
        payments: {
          create: {
            amountCents: 9900,
            currency: "USD",
            method: "CARD",
            stripeCheckoutSessionId: checkoutSessionId,
            stripePaymentIntentId: `${prefix}-pi-clean`,
            paidAt: now,
          },
        },
      },
    })
    await db.userEntitlement.create({
      data: {
        userId: user.id,
        entitlementId: entitlement.id,
        sourceType: "PURCHASE",
        sourceId: checkoutSessionId,
        startsAt: now,
      },
    })
    await db.programEnrollment.create({
      data: { userId: user.id, programId: program.id, status: "ACTIVE", enrolledAt: now },
    })

    const report = await runPaymentEntitlementDriftAudit({
      now,
      brand: BRAND,
      scopePrefix: prefix,
    })

    expect(report.launchReady).toBe(true)
    expect(report.blockingIssueCount).toBe(0)
    expect(report.warningIssueCount).toBe(0)
  })

  it("reports every SESSION_0098 drift class with deterministic issue codes", async () => {
    const prefix = prefixFor("drift")
    const { user, organization, program } = await createUserOrgProgram(prefix)
    const accessEntitlement = await createEntitlement(prefix, "access")
    const orphanEntitlement = await createEntitlement(prefix, "orphan")
    const duplicatePriceId = `${prefix}-price-duplicate`
    const invoiceSourceId = `${prefix}-cs-missing-entitlement`

    await createPlan({
      prefix,
      organizationId: organization.id,
      programId: program.id,
      entitlementId: accessEntitlement.id,
      name: "duplicate-a",
      priceId: duplicatePriceId,
    })
    await createPlan({
      prefix,
      organizationId: organization.id,
      programId: program.id,
      entitlementId: accessEntitlement.id,
      name: "duplicate-b",
      priceId: duplicatePriceId,
    })
    await createPlan({
      prefix,
      organizationId: organization.id,
      programId: program.id,
      name: "no-grant",
      priceId: `${prefix}-price-no-grant`,
    })
    const invoicePlan = await createPlan({
      prefix,
      organizationId: organization.id,
      programId: program.id,
      entitlementId: accessEntitlement.id,
      name: "invoice-plan",
      priceId: `${prefix}-price-invoice`,
    })

    await db.invoice.create({
      data: {
        brand: BRAND,
        organizationId: organization.id,
        userId: user.id,
        status: "PAID",
        invoiceNumber: `${prefix}-invoice-missing-entitlement`,
        stripeCheckoutSessionId: invoiceSourceId,
        subtotalCents: 9900,
        totalCents: 9900,
        currency: "USD",
        paidAt: now,
        lineItems: {
          create: {
            description: invoicePlan.name,
            amountCents: 9900,
            quantity: 1,
            pricingPlanId: invoicePlan.id,
          },
        },
        payments: {
          create: {
            amountCents: 9900,
            currency: "USD",
            method: "CARD",
            stripeCheckoutSessionId: invoiceSourceId,
            stripePaymentIntentId: `${prefix}-pi-missing-entitlement`,
            paidAt: now,
          },
        },
      },
    })
    await db.userEntitlement.create({
      data: {
        userId: user.id,
        entitlementId: orphanEntitlement.id,
        sourceType: "PURCHASE",
        sourceId: `${prefix}-cs-orphan`,
        startsAt: now,
      },
    })
    await db.programEnrollment.create({
      data: { userId: user.id, programId: program.id, status: "ACTIVE", enrolledAt: now },
    })
    await db.stripeWebhookEvent.createMany({
      data: [
        {
          id: `${prefix}-evt-failed`,
          type: "invoice.payment_failed",
          objectId: `${prefix}-invoice`,
          status: "FAILED",
          attempts: 1,
          createdAt: new Date(now.getTime() - 60 * 60 * 1000),
        },
        {
          id: `${prefix}-evt-stale`,
          type: "checkout.session.completed",
          objectId: `${prefix}-checkout`,
          status: "PROCESSING",
          attempts: 1,
          createdAt: new Date(now.getTime() - 20 * 60 * 1000),
        },
      ],
    })
    await db.certificateTemplate.create({
      data: {
        brand: BRAND,
        name: `${prefix}-certificate`,
        type: "BELT_RANK",
        deliveryMethod: "DIGITAL",
        priceCents: 2500,
        organizationId: organization.id,
      },
    })

    const report = await runPaymentEntitlementDriftAudit({
      now,
      brand: BRAND,
      scopePrefix: prefix,
    })
    const issuesByCode = new Map(
      report.checks.map(check => [check.code, check.issues.length] as const),
    )

    expect(report.launchReady).toBe(false)
    expect(issuesByCode.get("DUPLICATE_ACTIVE_STRIPE_PRICE_MAPPING")).toBe(1)
    expect(issuesByCode.get("ACTIVE_PAID_PLAN_MISSING_ENTITLEMENT_GRANT")).toBe(1)
    expect(issuesByCode.get("PAID_INVOICE_MISSING_ACTIVE_ENTITLEMENT")).toBe(1)
    expect(issuesByCode.get("STRIPE_SOURCED_ENTITLEMENT_MISSING_PAID_INVOICE")).toBe(1)
    expect(issuesByCode.get("PAID_PROGRAM_ENROLLMENT_MISSING_STRIPE_ENTITLEMENT")).toBe(1)
    expect(issuesByCode.get("STRIPE_WEBHOOK_FAILED_OR_STALE")).toBe(2)
    expect(issuesByCode.get("PAID_CERTIFICATE_TEMPLATE_PRICING_BRIDGE")).toBe(1)
    expect(report.blockingIssueCount).toBe(7)
    expect(report.warningIssueCount).toBe(1)
  })
})
