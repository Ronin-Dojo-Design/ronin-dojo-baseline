import { expect, test } from "@playwright/test"
import {
  type AuthenticatedUser,
  cleanupTestUser,
  createAuthenticatedSession,
  createTestUser,
} from "../helpers/auth"
import {
  cleanupLineageMembershipCheckoutFixture,
  completeLineageCheckout,
  deleteLineageSubscription,
  type LineageMembershipCheckoutFixture,
  readLineageCheckoutState,
  seedLineageMembershipCheckoutFixture,
} from "../helpers/stripe-checkout"

test.skip(process.env.E2E_STRIPE_MOCK !== "1", "Requires E2E_STRIPE_MOCK=1")

test.describe("Lineage membership Checkout E2E", () => {
  test.describe.configure({ mode: "serial" })
  test.setTimeout(120_000)

  let authUser: AuthenticatedUser
  let fixture: LineageMembershipCheckoutFixture

  test.beforeAll(() => {
    authUser = createTestUser()
    fixture = seedLineageMembershipCheckoutFixture(authUser.userId)
  })

  test.afterAll(() => {
    try {
      if (fixture) {
        cleanupLineageMembershipCheckoutFixture(fixture)
      }
    } finally {
      if (authUser) {
        cleanupTestUser(authUser.userId)
      }
    }
  })

  test.beforeEach(async ({ page }) => {
    await createAuthenticatedSession(page, authUser.userId)
  })

  test("cancel return keeps lineage access ungranted", async ({ page }) => {
    await page.goto("/lineage/join?cancelled=true")

    await expect(page.getByTestId("lineage-checkout-cancelled")).toBeVisible()
    // SESSION_0418: the join landing hero h1 is now "Build Your Legacy" ("Join the
    // Legacy" became a button). Match the level-1 Legacy heading robustly.
    await expect(page.getByRole("heading", { name: /legacy/i, level: 1 })).toBeVisible()
    await expect(page.getByTestId(`lineage-membership-plan-${fixture.oneTimePlanId}`)).toBeVisible()

    const state = readLineageCheckoutState(fixture)
    expect(state.activePurchaseGrantCount).toBe(0)
    expect(state.activeSubscriptionGrantCount).toBe(0)
    expect(state.membershipCount).toBe(0)
    expect(state.programEnrollmentCount).toBe(0)
  })

  test("one-time checkout returns to success and grants purchase entitlement", async ({ page }) => {
    await page.goto("/lineage/join")

    const plan = page.getByTestId(`lineage-membership-plan-${fixture.oneTimePlanId}`)
    await expect(plan.getByRole("heading", { name: fixture.oneTimePlanName })).toBeVisible()
    await plan.getByRole("button", { name: "Join Legacy" }).click()

    await expect(page).toHaveURL(
      url => url.pathname === "/lineage/join/success" && Boolean(url.searchParams.get("sessionId")),
      { timeout: 30_000 },
    )
    await expect(page.getByRole("heading", { name: "Lineage Membership Confirmed" })).toBeVisible()

    const sessionId = new URL(page.url()).searchParams.get("sessionId")
    expect(sessionId).toBeTruthy()

    const result = completeLineageCheckout({
      fixture,
      mode: "payment",
      sessionId: sessionId!,
    })

    expect(result.status).toBe(200)
    expect(result.state.activePurchaseGrantCount).toBe(1)
    expect(result.state.activeSubscriptionGrantCount).toBe(0)
    expect(result.state.paidInvoiceCount).toBe(1)
    expect(result.state.stripeCustomerCount).toBeGreaterThanOrEqual(1)
    expect(result.state.membershipCount).toBe(0)
    expect(result.state.programEnrollmentCount).toBe(0)
  })

  test("subscription checkout grants then revokes subscription entitlement", async ({ page }) => {
    const subscriptionId = `sub_e2e_lineage_${fixture.suffix}_browser`

    await page.goto("/lineage/join")

    const plan = page.getByTestId(`lineage-membership-plan-${fixture.subscriptionPlanId}`)
    await expect(plan.getByRole("heading", { name: fixture.subscriptionPlanName })).toBeVisible()
    await plan.getByRole("button", { name: "Start Monthly" }).click()

    await expect(page).toHaveURL(
      url => url.pathname === "/lineage/join/success" && Boolean(url.searchParams.get("sessionId")),
      { timeout: 30_000 },
    )

    const sessionId = new URL(page.url()).searchParams.get("sessionId")
    expect(sessionId).toBeTruthy()

    const completed = completeLineageCheckout({
      fixture,
      mode: "subscription",
      sessionId: sessionId!,
      subscriptionId,
    })

    expect(completed.status).toBe(200)
    expect(completed.state.activePurchaseGrantCount).toBe(1)
    expect(completed.state.activeSubscriptionGrantCount).toBe(1)
    expect(completed.state.revokedSubscriptionGrantCount).toBe(0)
    expect(completed.state.membershipCount).toBe(0)
    expect(completed.state.programEnrollmentCount).toBe(0)

    const deleted = deleteLineageSubscription({ fixture, subscriptionId })

    expect(deleted.status).toBe(200)
    expect(deleted.state.activePurchaseGrantCount).toBe(1)
    expect(deleted.state.activeSubscriptionGrantCount).toBe(0)
    expect(deleted.state.revokedSubscriptionGrantCount).toBe(1)
    expect(deleted.state.membershipCount).toBe(0)
    expect(deleted.state.programEnrollmentCount).toBe(0)
    expect(deleted.state.processedWebhookCount).toBeGreaterThanOrEqual(3)
  })
})
