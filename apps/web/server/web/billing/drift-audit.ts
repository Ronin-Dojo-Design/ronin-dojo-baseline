import type { Brand, EntitlementSourceType, Prisma } from "~/.generated/prisma/client"
import {
  getWebhookMonitoringWindows,
  WEBHOOK_LAUNCH_WINDOW_DAYS,
  WEBHOOK_STALE_PROCESSING_MINUTES,
} from "~/server/web/billing/monitoring-thresholds"
import { db } from "~/services/db"

export type PaymentEntitlementAuditSeverity = "blocking" | "warning"

export type PaymentEntitlementAuditIssueCode =
  | "DUPLICATE_ACTIVE_STRIPE_PRICE_MAPPING"
  | "ACTIVE_PAID_PLAN_MISSING_ENTITLEMENT_GRANT"
  | "PAID_INVOICE_MISSING_ACTIVE_ENTITLEMENT"
  | "STRIPE_SOURCED_ENTITLEMENT_MISSING_PAID_INVOICE"
  | "PAID_PROGRAM_ENROLLMENT_MISSING_STRIPE_ENTITLEMENT"
  | "STRIPE_WEBHOOK_FAILED_OR_STALE"
  | "PAID_CERTIFICATE_TEMPLATE_PRICING_BRIDGE"

export type PaymentEntitlementAuditIssue = {
  code: PaymentEntitlementAuditIssueCode
  severity: PaymentEntitlementAuditSeverity
  message: string
  entity: Record<string, string | number | boolean | null | string[]>
}

export type PaymentEntitlementAuditCheck = {
  code: PaymentEntitlementAuditIssueCode
  severity: PaymentEntitlementAuditSeverity
  title: string
  issues: PaymentEntitlementAuditIssue[]
}

export type PaymentEntitlementDriftAuditReport = {
  generatedAt: string
  launchReady: boolean
  blockingIssueCount: number
  warningIssueCount: number
  thresholds: {
    webhookLaunchWindowDays: number
    webhookStaleProcessingMinutes: number
  }
  scope: {
    brand: Brand | null
    scopePrefix: string | null
  }
  checks: PaymentEntitlementAuditCheck[]
}

export type RunPaymentEntitlementDriftAuditOptions = {
  now?: Date
  brand?: Brand
  scopePrefix?: string
}

const STRIPE_ENTITLEMENT_SOURCE_TYPES: EntitlementSourceType[] = ["PURCHASE", "SUBSCRIPTION"]

const isPhysicalMerchPlan = (plan: { metadata: Prisma.JsonValue | null }) => {
  if (!plan.metadata || typeof plan.metadata !== "object" || Array.isArray(plan.metadata)) {
    return false
  }

  return (plan.metadata as Record<string, unknown>).source === "tuffbuffs-merch"
}

const activeEntitlementWindowWhere = (now: Date) =>
  ({
    startsAt: { lte: now },
    OR: [{ endsAt: null }, { endsAt: { gt: now } }],
  }) satisfies Prisma.UserEntitlementWhereInput

const addIssue = (issues: PaymentEntitlementAuditIssue[], issue: PaymentEntitlementAuditIssue) => {
  issues.push(issue)
}

const buildCheck = (
  code: PaymentEntitlementAuditIssueCode,
  severity: PaymentEntitlementAuditSeverity,
  title: string,
  issues: PaymentEntitlementAuditIssue[],
): PaymentEntitlementAuditCheck => ({ code, severity, title, issues })

const getSourceForInvoice = (invoice: {
  stripeCheckoutSessionId: string | null
  stripeSubscriptionId: string | null
}) => {
  if (invoice.stripeSubscriptionId) {
    return { sourceType: "SUBSCRIPTION" as const, sourceId: invoice.stripeSubscriptionId }
  }

  if (invoice.stripeCheckoutSessionId) {
    return { sourceType: "PURCHASE" as const, sourceId: invoice.stripeCheckoutSessionId }
  }

  return null
}

const hasActiveEntitlement = async ({
  now,
  userId,
  entitlementId,
  sourceType,
  sourceId,
}: {
  now: Date
  userId: string
  entitlementId: string
  sourceType?: EntitlementSourceType
  sourceId?: string
}) => {
  const entitlement = await db.userEntitlement.findFirst({
    where: {
      userId,
      entitlementId,
      status: "ACTIVE",
      ...(sourceType ? { sourceType } : {}),
      ...(sourceId ? { sourceId } : {}),
      ...activeEntitlementWindowWhere(now),
    },
    select: { id: true },
  })

  return Boolean(entitlement)
}

const findMatchingPaidInvoiceForEntitlement = async ({
  userId,
  entitlementId,
  sourceType,
  sourceId,
}: {
  userId: string
  entitlementId: string
  sourceType: EntitlementSourceType
  sourceId: string
}) => {
  const sourceWhere =
    sourceType === "SUBSCRIPTION"
      ? { stripeSubscriptionId: sourceId }
      : { stripeCheckoutSessionId: sourceId }

  return db.invoice.findFirst({
    where: {
      status: "PAID",
      userId,
      ...sourceWhere,
      lineItems: {
        some: {
          pricingPlan: {
            entitlementGrants: { some: { entitlementId } },
          },
        },
      },
    },
    select: { id: true },
  })
}

export const runPaymentEntitlementDriftAudit = async ({
  now = new Date(),
  brand,
  scopePrefix,
}: RunPaymentEntitlementDriftAuditOptions = {}): Promise<PaymentEntitlementDriftAuditReport> => {
  const pricingPlanScope: Prisma.PricingPlanWhereInput = {
    ...(brand ? { brand } : {}),
    ...(scopePrefix ? { name: { startsWith: scopePrefix } } : {}),
  }
  const invoiceScope: Prisma.InvoiceWhereInput = {
    ...(brand ? { brand } : {}),
    ...(scopePrefix ? { invoiceNumber: { startsWith: scopePrefix } } : {}),
  }
  const programEnrollmentScope: Prisma.ProgramEnrollmentWhereInput = {
    ...(scopePrefix ? { program: { name: { startsWith: scopePrefix } } } : {}),
  }
  const webhookScope: Prisma.StripeWebhookEventWhereInput = scopePrefix
    ? { id: { startsWith: scopePrefix } }
    : {}
  const certificateScope: Prisma.CertificateTemplateWhereInput = {
    ...(brand ? { brand } : {}),
    ...(scopePrefix ? { name: { startsWith: scopePrefix } } : {}),
  }

  const duplicateMappingIssues: PaymentEntitlementAuditIssue[] = []
  const planGrantIssues: PaymentEntitlementAuditIssue[] = []
  const paidInvoiceIssues: PaymentEntitlementAuditIssue[] = []
  const orphanEntitlementIssues: PaymentEntitlementAuditIssue[] = []
  const enrollmentIssues: PaymentEntitlementAuditIssue[] = []
  const webhookIssues: PaymentEntitlementAuditIssue[] = []
  const certificateIssues: PaymentEntitlementAuditIssue[] = []

  const activeStripePlans = await db.pricingPlan.findMany({
    where: {
      ...pricingPlanScope,
      isActive: true,
      stripePriceId: { not: null },
    },
    select: {
      id: true,
      brand: true,
      name: true,
      programId: true,
      stripePriceId: true,
      amountCents: true,
      metadata: true,
      organizationId: true,
      _count: { select: { entitlementGrants: true } },
      program: { select: { id: true, name: true } },
      organization: { select: { id: true, name: true } },
    },
    orderBy: [{ brand: "asc" }, { programId: "asc" }, { stripePriceId: "asc" }],
  })

  const planGroups = new Map<string, typeof activeStripePlans>()
  for (const plan of activeStripePlans) {
    if (!plan.stripePriceId) continue

    const groupKey = [plan.brand, plan.programId ?? "none", plan.stripePriceId].join("::")
    const group = planGroups.get(groupKey) ?? []
    group.push(plan)
    planGroups.set(groupKey, group)
  }

  for (const plans of planGroups.values()) {
    if (plans.length < 2) continue

    const firstPlan = plans[0]!
    addIssue(duplicateMappingIssues, {
      code: "DUPLICATE_ACTIVE_STRIPE_PRICE_MAPPING",
      severity: "blocking",
      message: `Stripe Price ${firstPlan.stripePriceId} maps to ${plans.length} active plan(s) for the same brand/program.`,
      entity: {
        brand: firstPlan.brand,
        programId: firstPlan.programId,
        programName: firstPlan.program?.name ?? null,
        stripePriceId: firstPlan.stripePriceId,
        pricingPlanIds: plans.map(plan => plan.id),
      },
    })
  }

  for (const plan of activeStripePlans) {
    if (plan.amountCents <= 0 || plan._count.entitlementGrants > 0 || isPhysicalMerchPlan(plan))
      continue

    addIssue(planGrantIssues, {
      code: "ACTIVE_PAID_PLAN_MISSING_ENTITLEMENT_GRANT",
      severity: "blocking",
      message: `Active paid plan ${plan.name} has a Stripe Price but grants no entitlements.`,
      entity: {
        brand: plan.brand,
        pricingPlanId: plan.id,
        pricingPlanName: plan.name,
        organizationId: plan.organizationId,
        programId: plan.programId,
        stripePriceId: plan.stripePriceId,
      },
    })
  }

  const paidStripeInvoices = await db.invoice.findMany({
    where: {
      ...invoiceScope,
      status: "PAID",
      OR: [{ stripeCheckoutSessionId: { not: null } }, { stripeSubscriptionId: { not: null } }],
    },
    include: {
      lineItems: {
        include: {
          pricingPlan: {
            include: {
              entitlementGrants: {
                include: { entitlement: { select: { id: true, key: true } } },
              },
            },
          },
        },
      },
    },
  })

  for (const invoice of paidStripeInvoices) {
    const source = getSourceForInvoice(invoice)
    if (!source) continue

    for (const lineItem of invoice.lineItems) {
      const plan = lineItem.pricingPlan
      if (!plan) continue

      for (const grant of plan.entitlementGrants) {
        const entitlementIsActive = await hasActiveEntitlement({
          now,
          userId: invoice.userId,
          entitlementId: grant.entitlementId,
          sourceType: source.sourceType,
          sourceId: source.sourceId,
        })

        if (entitlementIsActive) continue

        addIssue(paidInvoiceIssues, {
          code: "PAID_INVOICE_MISSING_ACTIVE_ENTITLEMENT",
          severity: "blocking",
          message: `Paid invoice ${invoice.invoiceNumber ?? invoice.id} is missing an active ${source.sourceType} entitlement for plan ${plan.name}.`,
          entity: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            userId: invoice.userId,
            pricingPlanId: plan.id,
            pricingPlanName: plan.name,
            entitlementId: grant.entitlementId,
            entitlementKey: grant.entitlement.key,
            sourceType: source.sourceType,
            sourceId: source.sourceId,
          },
        })
      }
    }
  }

  const activeStripeEntitlements = await db.userEntitlement.findMany({
    where: {
      status: "ACTIVE",
      sourceType: { in: STRIPE_ENTITLEMENT_SOURCE_TYPES },
      sourceId: scopePrefix ? { startsWith: scopePrefix } : { not: null },
      ...(brand ? { entitlement: { brand } } : {}),
      ...activeEntitlementWindowWhere(now),
    },
    include: {
      entitlement: { select: { id: true, key: true, brand: true } },
    },
  })

  for (const entitlement of activeStripeEntitlements) {
    if (!entitlement.sourceId) continue

    const matchingInvoice = await findMatchingPaidInvoiceForEntitlement({
      userId: entitlement.userId,
      entitlementId: entitlement.entitlementId,
      sourceType: entitlement.sourceType,
      sourceId: entitlement.sourceId,
    })

    if (matchingInvoice) continue

    addIssue(orphanEntitlementIssues, {
      code: "STRIPE_SOURCED_ENTITLEMENT_MISSING_PAID_INVOICE",
      severity: "blocking",
      message: `Active ${entitlement.sourceType} entitlement ${entitlement.entitlement.key} has no matching paid invoice source.`,
      entity: {
        userEntitlementId: entitlement.id,
        userId: entitlement.userId,
        entitlementId: entitlement.entitlementId,
        entitlementKey: entitlement.entitlement.key,
        brand: entitlement.entitlement.brand,
        sourceType: entitlement.sourceType,
        sourceId: entitlement.sourceId,
      },
    })
  }

  const activePaidEnrollments = await db.programEnrollment.findMany({
    where: {
      ...programEnrollmentScope,
      status: "ACTIVE",
      program: {
        ...(brand ? { brand } : {}),
        pricingPlans: {
          some: {
            isActive: true,
            amountCents: { gt: 0 },
            stripePriceId: { not: null },
            entitlementGrants: { some: {} },
          },
        },
      },
    },
    include: {
      program: {
        include: {
          pricingPlans: {
            where: {
              isActive: true,
              amountCents: { gt: 0 },
              stripePriceId: { not: null },
              entitlementGrants: { some: {} },
            },
            include: { entitlementGrants: true },
          },
        },
      },
    },
  })

  for (const enrollment of activePaidEnrollments) {
    const entitlementIds = [
      ...new Set(
        enrollment.program.pricingPlans.flatMap(plan =>
          plan.entitlementGrants.map(grant => grant.entitlementId),
        ),
      ),
    ]

    const activeStripeEntitlement = await db.userEntitlement.findFirst({
      where: {
        userId: enrollment.userId,
        entitlementId: { in: entitlementIds },
        status: "ACTIVE",
        sourceType: { in: STRIPE_ENTITLEMENT_SOURCE_TYPES },
        sourceId: { not: null },
        ...activeEntitlementWindowWhere(now),
      },
      select: { id: true },
    })

    if (activeStripeEntitlement) continue

    addIssue(enrollmentIssues, {
      code: "PAID_PROGRAM_ENROLLMENT_MISSING_STRIPE_ENTITLEMENT",
      severity: "blocking",
      message: `Active paid program enrollment for ${enrollment.program.name} has no active Stripe-sourced mapped entitlement.`,
      entity: {
        programEnrollmentId: enrollment.id,
        userId: enrollment.userId,
        programId: enrollment.programId,
        programName: enrollment.program.name,
        brand: enrollment.program.brand,
        expectedEntitlementIds: entitlementIds,
      },
    })
  }

  const windows = getWebhookMonitoringWindows(now)
  const [failedWebhookEvents, staleWebhookEvents] = await db.$transaction([
    db.stripeWebhookEvent.findMany({
      where: {
        ...webhookScope,
        status: "FAILED",
        createdAt: { gte: windows.last7Days },
      },
      select: {
        id: true,
        type: true,
        objectId: true,
        status: true,
        attempts: true,
        createdAt: true,
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 50,
    }),
    db.stripeWebhookEvent.findMany({
      where: {
        ...webhookScope,
        status: "PROCESSING",
        createdAt: { lte: windows.staleProcessingBefore },
      },
      select: {
        id: true,
        type: true,
        objectId: true,
        status: true,
        attempts: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "asc" }],
      take: 50,
    }),
  ])

  for (const event of failedWebhookEvents) {
    addIssue(webhookIssues, {
      code: "STRIPE_WEBHOOK_FAILED_OR_STALE",
      severity: "blocking",
      message: `Stripe webhook event ${event.id} failed inside the ${WEBHOOK_LAUNCH_WINDOW_DAYS}-day launch window.`,
      entity: {
        stripeEventId: event.id,
        type: event.type,
        objectId: event.objectId,
        status: event.status,
        attempts: event.attempts,
        createdAt: event.createdAt.toISOString(),
      },
    })
  }

  for (const event of staleWebhookEvents) {
    addIssue(webhookIssues, {
      code: "STRIPE_WEBHOOK_FAILED_OR_STALE",
      severity: "blocking",
      message: `Stripe webhook event ${event.id} is still PROCESSING after ${WEBHOOK_STALE_PROCESSING_MINUTES} minutes.`,
      entity: {
        stripeEventId: event.id,
        type: event.type,
        objectId: event.objectId,
        status: event.status,
        attempts: event.attempts,
        createdAt: event.createdAt.toISOString(),
      },
    })
  }

  const paidCertificateTemplates = await db.certificateTemplate.findMany({
    where: {
      ...certificateScope,
      isActive: true,
      priceCents: { gt: 0 },
    },
    select: {
      id: true,
      brand: true,
      name: true,
      organizationId: true,
      priceCents: true,
      currency: true,
    },
    orderBy: [{ brand: "asc" }, { name: "asc" }],
  })

  for (const template of paidCertificateTemplates) {
    addIssue(certificateIssues, {
      code: "PAID_CERTIFICATE_TEMPLATE_PRICING_BRIDGE",
      severity: "warning",
      message: `Paid certificate template ${template.name} still uses CertificateTemplate.priceCents instead of PricingPlan.`,
      entity: {
        certificateTemplateId: template.id,
        brand: template.brand,
        organizationId: template.organizationId,
        priceCents: template.priceCents,
        currency: template.currency,
      },
    })
  }

  const checks = [
    buildCheck(
      "DUPLICATE_ACTIVE_STRIPE_PRICE_MAPPING",
      "blocking",
      "Duplicate active same-brand/program Stripe Price mappings",
      duplicateMappingIssues,
    ),
    buildCheck(
      "ACTIVE_PAID_PLAN_MISSING_ENTITLEMENT_GRANT",
      "blocking",
      "Active paid Stripe plans without entitlement grants",
      planGrantIssues,
    ),
    buildCheck(
      "PAID_INVOICE_MISSING_ACTIVE_ENTITLEMENT",
      "blocking",
      "Paid Stripe invoices missing expected active entitlements",
      paidInvoiceIssues,
    ),
    buildCheck(
      "STRIPE_SOURCED_ENTITLEMENT_MISSING_PAID_INVOICE",
      "blocking",
      "Active Stripe-sourced entitlements without paid invoice source",
      orphanEntitlementIssues,
    ),
    buildCheck(
      "PAID_PROGRAM_ENROLLMENT_MISSING_STRIPE_ENTITLEMENT",
      "blocking",
      "Active paid program enrollments without Stripe-sourced entitlement",
      enrollmentIssues,
    ),
    buildCheck(
      "STRIPE_WEBHOOK_FAILED_OR_STALE",
      "blocking",
      "Failed or stale Stripe webhook events",
      webhookIssues,
    ),
    buildCheck(
      "PAID_CERTIFICATE_TEMPLATE_PRICING_BRIDGE",
      "warning",
      "Paid certificate templates still using certificate pricing bridge",
      certificateIssues,
    ),
  ]

  const blockingIssueCount = checks
    .filter(check => check.severity === "blocking")
    .reduce((sum, check) => sum + check.issues.length, 0)
  const warningIssueCount = checks
    .filter(check => check.severity === "warning")
    .reduce((sum, check) => sum + check.issues.length, 0)

  return {
    generatedAt: now.toISOString(),
    launchReady: blockingIssueCount === 0,
    blockingIssueCount,
    warningIssueCount,
    thresholds: {
      webhookLaunchWindowDays: WEBHOOK_LAUNCH_WINDOW_DAYS,
      webhookStaleProcessingMinutes: WEBHOOK_STALE_PROCESSING_MINUTES,
    },
    scope: {
      brand: brand ?? null,
      scopePrefix: scopePrefix ?? null,
    },
    checks,
  }
}

export const formatPaymentEntitlementDriftAudit = (report: PaymentEntitlementDriftAuditReport) => {
  const lines = [
    "Payment and entitlement drift audit",
    `Generated: ${report.generatedAt}`,
    `Launch readiness: ${report.launchReady ? "READY" : "BLOCKED"}`,
    `Blocking issues: ${report.blockingIssueCount}`,
    `Warnings: ${report.warningIssueCount}`,
    "",
  ]

  for (const check of report.checks) {
    lines.push(`[${check.severity.toUpperCase()}] ${check.title}: ${check.issues.length}`)
    for (const issue of check.issues) {
      lines.push(`- ${issue.message}`)
    }
    lines.push("")
  }

  return lines.join("\n").trimEnd()
}
