/**
 * SESSION_0097 — protected program enrollment Checkout proof.
 *
 * Run: cd apps/web && bun test server/web/billing/checkout-actions.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test"
import type { Prisma } from "~/.generated/prisma/client"

const sessionUserState = { id: "" }
const requestBrand = "BBL"
const otherBrand = "RONIN_DOJO_DESIGN"
const checkoutSessionCreateMock = mock(async () => ({
  url: "https://checkout.stripe.test/session_0097",
}))
const redirectState = { url: "" }

mock.module("next/headers", () => ({
  headers: async () => ({
    get: (key: string) => {
      const k = key.toLowerCase()
      if (k === "x-brand") return requestBrand
      if (k === "host") return "baseline.local"
      return null
    },
  }),
}))

mock.module("next/cache", () => ({
  revalidatePath: () => {},
  updateTag: () => {},
  revalidateTag: () => {},
}))

mock.module("next/navigation", () => ({
  redirect: (url: string) => {
    redirectState.url = url
  },
}))

mock.module("~/lib/auth", () => ({
  getServerSession: async () => ({
    user: {
      id: sessionUserState.id,
      role: "user",
      lastActiveBrandId: null,
    },
    session: { id: "session-0097-checkout-actions-test-session" },
  }),
  auth: {},
}))

mock.module("~/services/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: checkoutSessionCreateMock,
      },
    },
  },
}))

import {
  createLineageMembershipCheckout,
  createProgramEnrollmentCheckout,
} from "~/server/web/billing/actions"
import { LINEAGE_MEMBERSHIP_SURFACE } from "~/server/web/billing/lineage-membership"
import { db } from "~/services/db"

const TS = Date.now()
const TAG_PREFIX = "session-0097-checkout-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`

type FixtureState = {
  userId: string
  orgIds: string[]
  programId: string
  otherProgramId: string
  inactiveProgramId: string
  crossBrandProgramId: string
  entitlementIds: string[]
  planIds: string[]
  validPriceId: string
  subscriptionPriceId: string
  wrongProgramPriceId: string
  inactivePriceId: string
  inactiveProgramPriceId: string
  noEntitlementPriceId: string
  crossBrandPriceId: string
  duplicatePriceId: string
  validPlanId: string
  lineagePlanId: string
  lineageSubscriptionPlanId: string
  lineageProgramPlanId: string
  lineageInactivePlanId: string
  lineageNoEntitlementPlanId: string
  lineageUnmarkedPlanId: string
  crossBrandLineagePlanId: string
  lineagePriceId: string
  lineageSubscriptionPriceId: string
}

let fx: FixtureState

const createOrganization = async (
  brand: typeof requestBrand | typeof otherBrand,
  ownerId: string,
) => {
  return db.organization.create({
    data: {
      brand,
      name: tag(`org-${brand}`),
      slug: tag(`org-${brand}`),
      type: "DOJO",
      ownerId,
    },
  })
}

const createProgram = async ({
  brand,
  organizationId,
  name,
  status = "ACTIVE",
}: {
  brand: typeof requestBrand | typeof otherBrand
  organizationId: string
  name: string
  status?: "ACTIVE" | "DRAFT"
}) => {
  return db.program.create({
    data: {
      brand,
      name: tag(name),
      slug: tag(name),
      status,
      organizationId,
    },
  })
}

const createEntitlement = async (brand: typeof requestBrand | typeof otherBrand, name: string) => {
  return db.entitlement.create({
    data: {
      brand,
      key: tag(name),
      name: tag(name),
    },
  })
}

const createPlan = async ({
  brand = requestBrand,
  organizationId,
  programId,
  priceId,
  entitlementId,
  name,
  isActive = true,
  intervalMonths = null,
  pricingModel = "DROP_IN",
  metadata,
}: {
  brand?: typeof requestBrand | typeof otherBrand
  organizationId: string
  programId: string | null
  priceId: string
  entitlementId?: string
  name: string
  isActive?: boolean
  intervalMonths?: number | null
  pricingModel?: "CUSTOM" | "DROP_IN" | "MONTHLY"
  metadata?: Prisma.InputJsonValue
}) => {
  const plan = await db.pricingPlan.create({
    data: {
      brand,
      organizationId,
      programId,
      name: tag(name),
      pricingModel,
      amountCents: 9900,
      intervalMonths,
      stripeProductId: `prod_${tag(name)}`,
      stripePriceId: priceId,
      isActive,
      metadata,
    },
  })

  if (entitlementId) {
    await db.entitlementGrant.create({
      data: {
        pricingPlanId: plan.id,
        entitlementId,
      },
    })
  }

  return plan
}

beforeAll(async () => {
  const user = await db.user.create({
    data: { name: tag("user"), email: `${tag("user")}@test.local` },
  })
  sessionUserState.id = user.id

  const org = await createOrganization(requestBrand, user.id)
  const crossBrandOrg = await createOrganization(otherBrand, user.id)
  const program = await createProgram({
    brand: requestBrand,
    organizationId: org.id,
    name: "program",
  })
  const otherProgram = await createProgram({
    brand: requestBrand,
    organizationId: org.id,
    name: "other-program",
  })
  const inactiveProgram = await createProgram({
    brand: requestBrand,
    organizationId: org.id,
    name: "inactive-program",
    status: "DRAFT",
  })
  const crossBrandProgram = await createProgram({
    brand: otherBrand,
    organizationId: crossBrandOrg.id,
    name: "cross-brand-program",
  })
  const entitlement = await createEntitlement(requestBrand, "access")
  const subscriptionEntitlement = await createEntitlement(requestBrand, "subscription-access")
  const lineageEntitlement = await createEntitlement(requestBrand, "lineage-access")
  const lineageSubscriptionEntitlement = await createEntitlement(
    requestBrand,
    "lineage-subscription-access",
  )
  const crossBrandEntitlement = await createEntitlement(otherBrand, "cross-access")

  const validPriceId = `price_test_checkout_valid_${TS}`
  const subscriptionPriceId = `price_test_checkout_subscription_${TS}`
  const wrongProgramPriceId = `price_test_checkout_wrong_program_${TS}`
  const inactivePriceId = `price_test_checkout_inactive_${TS}`
  const inactiveProgramPriceId = `price_test_checkout_inactive_program_${TS}`
  const noEntitlementPriceId = `price_test_checkout_no_entitlement_${TS}`
  const crossBrandPriceId = `price_test_checkout_cross_brand_${TS}`
  const duplicatePriceId = `price_test_checkout_duplicate_${TS}`
  const lineagePriceId = `price_test_checkout_lineage_${TS}`
  const lineageSubscriptionPriceId = `price_test_checkout_lineage_subscription_${TS}`
  const lineageProgramPriceId = `price_test_checkout_lineage_program_${TS}`
  const lineageInactivePriceId = `price_test_checkout_lineage_inactive_${TS}`
  const lineageNoEntitlementPriceId = `price_test_checkout_lineage_no_entitlement_${TS}`
  const lineageUnmarkedPriceId = `price_test_checkout_lineage_unmarked_${TS}`
  const crossBrandLineagePriceId = `price_test_checkout_lineage_cross_brand_${TS}`
  const lineageMetadata = {
    surface: LINEAGE_MEMBERSHIP_SURFACE,
    summary: "E2E lineage membership",
    features: ["Profile claim support", "Legacy access"],
    ctaLabel: "Join Legacy",
  }

  const validPlan = await createPlan({
    organizationId: org.id,
    programId: program.id,
    priceId: validPriceId,
    entitlementId: entitlement.id,
    name: "valid-plan",
  })
  const subscriptionPlan = await createPlan({
    organizationId: org.id,
    programId: program.id,
    priceId: subscriptionPriceId,
    entitlementId: subscriptionEntitlement.id,
    name: "subscription-plan",
    intervalMonths: 1,
    pricingModel: "MONTHLY",
  })
  const wrongProgramPlan = await createPlan({
    organizationId: org.id,
    programId: otherProgram.id,
    priceId: wrongProgramPriceId,
    entitlementId: entitlement.id,
    name: "wrong-program-plan",
  })
  const inactivePlan = await createPlan({
    organizationId: org.id,
    programId: program.id,
    priceId: inactivePriceId,
    entitlementId: entitlement.id,
    name: "inactive-plan",
    isActive: false,
  })
  const inactiveProgramPlan = await createPlan({
    organizationId: org.id,
    programId: inactiveProgram.id,
    priceId: inactiveProgramPriceId,
    entitlementId: entitlement.id,
    name: "inactive-program-plan",
  })
  const noEntitlementPlan = await createPlan({
    organizationId: org.id,
    programId: program.id,
    priceId: noEntitlementPriceId,
    name: "no-entitlement-plan",
  })
  const crossBrandPlan = await createPlan({
    brand: otherBrand,
    organizationId: crossBrandOrg.id,
    programId: crossBrandProgram.id,
    priceId: crossBrandPriceId,
    entitlementId: crossBrandEntitlement.id,
    name: "cross-brand-plan",
  })
  const duplicatePlanA = await createPlan({
    organizationId: org.id,
    programId: program.id,
    priceId: duplicatePriceId,
    entitlementId: entitlement.id,
    name: "duplicate-plan-a",
  })
  const duplicatePlanB = await createPlan({
    organizationId: org.id,
    programId: program.id,
    priceId: duplicatePriceId,
    entitlementId: entitlement.id,
    name: "duplicate-plan-b",
  })
  const lineagePlan = await createPlan({
    organizationId: org.id,
    programId: null,
    priceId: lineagePriceId,
    entitlementId: lineageEntitlement.id,
    name: "lineage-plan",
    pricingModel: "CUSTOM",
    metadata: lineageMetadata,
  })
  const lineageSubscriptionPlan = await createPlan({
    organizationId: org.id,
    programId: null,
    priceId: lineageSubscriptionPriceId,
    entitlementId: lineageSubscriptionEntitlement.id,
    name: "lineage-subscription-plan",
    intervalMonths: 1,
    pricingModel: "MONTHLY",
    metadata: lineageMetadata,
  })
  const lineageProgramPlan = await createPlan({
    organizationId: org.id,
    programId: program.id,
    priceId: lineageProgramPriceId,
    entitlementId: lineageEntitlement.id,
    name: "lineage-program-plan",
    pricingModel: "CUSTOM",
    metadata: lineageMetadata,
  })
  const lineageInactivePlan = await createPlan({
    organizationId: org.id,
    programId: null,
    priceId: lineageInactivePriceId,
    entitlementId: lineageEntitlement.id,
    name: "lineage-inactive-plan",
    pricingModel: "CUSTOM",
    isActive: false,
    metadata: lineageMetadata,
  })
  const lineageNoEntitlementPlan = await createPlan({
    organizationId: org.id,
    programId: null,
    priceId: lineageNoEntitlementPriceId,
    name: "lineage-no-entitlement-plan",
    pricingModel: "CUSTOM",
    metadata: lineageMetadata,
  })
  const lineageUnmarkedPlan = await createPlan({
    organizationId: org.id,
    programId: null,
    priceId: lineageUnmarkedPriceId,
    entitlementId: lineageEntitlement.id,
    name: "lineage-unmarked-plan",
    pricingModel: "CUSTOM",
    metadata: { surface: "listing_upgrade" },
  })
  const crossBrandLineagePlan = await createPlan({
    brand: otherBrand,
    organizationId: crossBrandOrg.id,
    programId: null,
    priceId: crossBrandLineagePriceId,
    entitlementId: crossBrandEntitlement.id,
    name: "cross-brand-lineage-plan",
    pricingModel: "CUSTOM",
    metadata: lineageMetadata,
  })

  fx = {
    userId: user.id,
    orgIds: [org.id, crossBrandOrg.id],
    programId: program.id,
    otherProgramId: otherProgram.id,
    inactiveProgramId: inactiveProgram.id,
    crossBrandProgramId: crossBrandProgram.id,
    entitlementIds: [
      entitlement.id,
      subscriptionEntitlement.id,
      lineageEntitlement.id,
      lineageSubscriptionEntitlement.id,
      crossBrandEntitlement.id,
    ],
    planIds: [
      validPlan.id,
      subscriptionPlan.id,
      wrongProgramPlan.id,
      inactivePlan.id,
      inactiveProgramPlan.id,
      noEntitlementPlan.id,
      crossBrandPlan.id,
      duplicatePlanA.id,
      duplicatePlanB.id,
      lineagePlan.id,
      lineageSubscriptionPlan.id,
      lineageProgramPlan.id,
      lineageInactivePlan.id,
      lineageNoEntitlementPlan.id,
      lineageUnmarkedPlan.id,
      crossBrandLineagePlan.id,
    ],
    validPriceId,
    subscriptionPriceId,
    wrongProgramPriceId,
    inactivePriceId,
    inactiveProgramPriceId,
    noEntitlementPriceId,
    crossBrandPriceId,
    duplicatePriceId,
    validPlanId: validPlan.id,
    lineagePlanId: lineagePlan.id,
    lineageSubscriptionPlanId: lineageSubscriptionPlan.id,
    lineageProgramPlanId: lineageProgramPlan.id,
    lineageInactivePlanId: lineageInactivePlan.id,
    lineageNoEntitlementPlanId: lineageNoEntitlementPlan.id,
    lineageUnmarkedPlanId: lineageUnmarkedPlan.id,
    crossBrandLineagePlanId: crossBrandLineagePlan.id,
    lineagePriceId,
    lineageSubscriptionPriceId,
  }
})

beforeEach(async () => {
  checkoutSessionCreateMock.mockClear()
  redirectState.url = ""
  await db.stripeCustomer.deleteMany({ where: { userId: fx.userId } })
})

afterAll(async () => {
  if (fx) {
    await db.stripeCustomer.deleteMany({
      where: {
        OR: [{ userId: fx.userId }, { stripeCustomerId: { startsWith: "cus_test_checkout_0097" } }],
      },
    })
    await db.programEnrollment.deleteMany({
      where: { programId: { in: [fx.programId, fx.otherProgramId, fx.inactiveProgramId] } },
    })
    await db.entitlementGrant.deleteMany({
      where: {
        OR: [{ pricingPlanId: { in: fx.planIds } }, { entitlementId: { in: fx.entitlementIds } }],
      },
    })
    await db.pricingPlan.deleteMany({ where: { id: { in: fx.planIds } } })
    await db.userEntitlement.deleteMany({ where: { entitlementId: { in: fx.entitlementIds } } })
    await db.entitlement.deleteMany({ where: { id: { in: fx.entitlementIds } } })
    await db.program.deleteMany({
      where: {
        id: {
          in: [fx.programId, fx.otherProgramId, fx.inactiveProgramId, fx.crossBrandProgramId],
        },
      },
    })
    await db.membership.deleteMany({ where: { organizationId: { in: fx.orgIds } } })
    await db.organizationDiscipline.deleteMany({ where: { organizationId: { in: fx.orgIds } } })
    await db.organization.deleteMany({ where: { id: { in: fx.orgIds } } })
    await db.user.deleteMany({ where: { id: fx.userId } })
  }

  await db.$disconnect()
})

describe("createProgramEnrollmentCheckout", () => {
  it("creates Checkout with DB-derived line item, metadata, coupon, and current-brand customer", async () => {
    await db.stripeCustomer.create({
      data: {
        userId: fx.userId,
        brand: requestBrand,
        stripeCustomerId: "cus_test_checkout_0097_existing",
      },
    })

    const result = await createProgramEnrollmentCheckout({
      programId: fx.programId,
      stripePriceId: fx.validPriceId,
      coupon: "coupon_test_0097",
    })

    expect(result?.serverError).toBeUndefined()
    expect(checkoutSessionCreateMock).toHaveBeenCalledTimes(1)

    const checkoutArgs = checkoutSessionCreateMock.mock.calls[0]?.[0] as any
    expect(checkoutArgs.mode).toBe("payment")
    expect(checkoutArgs.line_items).toEqual([{ price: fx.validPriceId, quantity: 1 }])
    expect(checkoutArgs.customer).toBe("cus_test_checkout_0097_existing")
    expect(checkoutArgs.customer_creation).toBeUndefined()
    // SESSION_0345: reusing an existing customer with automatic_tax + tax_id_collection
    // requires customer_update or Stripe rejects the session (returning-customer bug).
    expect(checkoutArgs.customer_update).toEqual({ name: "auto", address: "auto" })
    expect(checkoutArgs.discounts).toEqual([{ coupon: "coupon_test_0097" }])
    expect(checkoutArgs.metadata).toEqual({
      type: "program_enrollment",
      userId: fx.userId,
      programId: fx.programId,
      pricingPlanId: fx.validPlanId,
      organizationId: fx.orgIds[0],
      brand: requestBrand,
    })
    expect(checkoutArgs.success_url).toContain(`/programs/${fx.programId}/enroll/success`)
    expect(checkoutArgs.cancel_url).toContain(`/programs/${fx.programId}/enroll?cancelled=true`)
    expect(redirectState.url).toBe("https://checkout.stripe.test/session_0097")
  })

  it("ignores forged caller checkout fields and requests a new payment customer when absent", async () => {
    const result = await createProgramEnrollmentCheckout({
      programId: fx.programId,
      stripePriceId: fx.validPriceId,
      lineItems: [{ price: "price_attacker" }],
      metadata: {
        userId: "attacker-user",
        programId: fx.otherProgramId,
        type: "program_enrollment",
      },
      successUrl: "https://attacker.test/success",
      cancelUrl: "https://attacker.test/cancel",
    } as any)

    expect(result?.serverError).toBeUndefined()
    expect(checkoutSessionCreateMock).toHaveBeenCalledTimes(1)

    const checkoutArgs = checkoutSessionCreateMock.mock.calls[0]?.[0] as any
    expect(checkoutArgs.line_items).toEqual([{ price: fx.validPriceId, quantity: 1 }])
    expect(checkoutArgs.customer).toBeUndefined()
    expect(checkoutArgs.customer_creation).toBe("always")
    // No existing customer → no customer_update (would error against a fresh customer).
    expect(checkoutArgs.customer_update).toBeUndefined()
    expect(checkoutArgs.metadata.userId).toBe(fx.userId)
    expect(checkoutArgs.metadata.programId).toBe(fx.programId)
    expect(checkoutArgs.success_url).toContain(`/programs/${fx.programId}/enroll/success`)
    expect(checkoutArgs.cancel_url).toContain(`/programs/${fx.programId}/enroll?cancelled=true`)
  })

  it("creates subscription Checkout from trusted plan recurrence fields", async () => {
    const result = await createProgramEnrollmentCheckout({
      programId: fx.programId,
      stripePriceId: fx.subscriptionPriceId,
    })

    expect(result?.serverError).toBeUndefined()
    expect(checkoutSessionCreateMock).toHaveBeenCalledTimes(1)

    const checkoutArgs = checkoutSessionCreateMock.mock.calls[0]?.[0] as any
    expect(checkoutArgs.mode).toBe("subscription")
    expect(checkoutArgs.metadata).toBeUndefined()
    expect(checkoutArgs.subscription_data.metadata).toMatchObject({
      type: "program_enrollment",
      userId: fx.userId,
      programId: fx.programId,
      brand: requestBrand,
    })
    expect(checkoutArgs.customer_creation).toBeUndefined()
    expect(checkoutArgs.invoice_creation).toBeUndefined()
  })

  it("rejects cross-brand, wrong-program, inactive, unmapped, no-entitlement, and ambiguous plans", async () => {
    const cases = [
      { programId: fx.crossBrandProgramId, stripePriceId: fx.crossBrandPriceId },
      { programId: fx.programId, stripePriceId: fx.wrongProgramPriceId },
      { programId: fx.programId, stripePriceId: fx.inactivePriceId },
      { programId: fx.inactiveProgramId, stripePriceId: fx.inactiveProgramPriceId },
      { programId: fx.programId, stripePriceId: `price_test_checkout_unmapped_${TS}` },
      { programId: fx.programId, stripePriceId: fx.noEntitlementPriceId },
      { programId: fx.programId, stripePriceId: fx.duplicatePriceId },
    ]

    for (const input of cases) {
      const result = await createProgramEnrollmentCheckout(input)
      expect(result?.serverError).toBe("Selected program plan is not available.")
    }

    expect(checkoutSessionCreateMock).not.toHaveBeenCalled()
  })
})

describe("createLineageMembershipCheckout", () => {
  it("creates Checkout with a DB-derived lineage membership plan and current-brand customer", async () => {
    await db.stripeCustomer.create({
      data: {
        userId: fx.userId,
        brand: requestBrand,
        stripeCustomerId: "cus_test_checkout_0097_lineage_existing",
      },
    })

    const result = await createLineageMembershipCheckout({
      pricingPlanId: fx.lineagePlanId,
      coupon: "coupon_test_lineage_0097",
    })

    expect(result?.serverError).toBeUndefined()
    expect(checkoutSessionCreateMock).toHaveBeenCalledTimes(1)

    const checkoutArgs = checkoutSessionCreateMock.mock.calls[0]?.[0] as any
    expect(checkoutArgs.mode).toBe("payment")
    expect(checkoutArgs.line_items).toEqual([{ price: fx.lineagePriceId, quantity: 1 }])
    expect(checkoutArgs.customer).toBe("cus_test_checkout_0097_lineage_existing")
    expect(checkoutArgs.customer_creation).toBeUndefined()
    // SESSION_0345 returning-customer fix also covers the lineage membership action.
    expect(checkoutArgs.customer_update).toEqual({ name: "auto", address: "auto" })
    expect(checkoutArgs.discounts).toEqual([{ coupon: "coupon_test_lineage_0097" }])
    expect(checkoutArgs.metadata).toEqual({
      type: LINEAGE_MEMBERSHIP_SURFACE,
      userId: fx.userId,
      pricingPlanId: fx.lineagePlanId,
      organizationId: fx.orgIds[0],
      brand: requestBrand,
    })
    expect(checkoutArgs.success_url).toContain("/lineage/join/success")
    expect(checkoutArgs.cancel_url).toContain("/lineage/join?cancelled=true")
    expect(redirectState.url).toBe("https://checkout.stripe.test/session_0097")
  })

  it("creates subscription Checkout from lineage membership recurrence fields", async () => {
    const result = await createLineageMembershipCheckout({
      pricingPlanId: fx.lineageSubscriptionPlanId,
    })

    expect(result?.serverError).toBeUndefined()
    expect(checkoutSessionCreateMock).toHaveBeenCalledTimes(1)

    const checkoutArgs = checkoutSessionCreateMock.mock.calls[0]?.[0] as any
    expect(checkoutArgs.mode).toBe("subscription")
    expect(checkoutArgs.line_items).toEqual([{ price: fx.lineageSubscriptionPriceId, quantity: 1 }])
    expect(checkoutArgs.metadata).toBeUndefined()
    expect(checkoutArgs.subscription_data.metadata).toMatchObject({
      type: LINEAGE_MEMBERSHIP_SURFACE,
      userId: fx.userId,
      pricingPlanId: fx.lineageSubscriptionPlanId,
      brand: requestBrand,
    })
    expect(checkoutArgs.customer_creation).toBeUndefined()
    expect(checkoutArgs.invoice_creation).toBeUndefined()
    expect(checkoutArgs.allow_promotion_codes).toBe(true)
  })

  it("rejects cross-brand, program-scoped, inactive, no-entitlement, unmarked, and unmapped plans", async () => {
    const cases = [
      fx.crossBrandLineagePlanId,
      fx.lineageProgramPlanId,
      fx.lineageInactivePlanId,
      fx.lineageNoEntitlementPlanId,
      fx.lineageUnmarkedPlanId,
      `plan_test_checkout_unmapped_${TS}`,
    ]

    for (const pricingPlanId of cases) {
      const result = await createLineageMembershipCheckout({ pricingPlanId })
      expect(result?.serverError).toBe("Selected lineage membership plan is not available.")
    }

    expect(checkoutSessionCreateMock).not.toHaveBeenCalled()
  })
})
