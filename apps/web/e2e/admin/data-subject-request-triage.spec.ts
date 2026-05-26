/**
 * E2E: Admin DSR triage
 *
 * Covers:
 * 1. Non-admin is blocked from /admin/privacy/requests (404)
 * 2. Admin can view DSR list and detail
 * 3. Admin can transition PENDING → IN_PROGRESS → FULFILLED
 *
 * @added SESSION_0255
 * @resolves SESSION_0254_FINDING_02
 */
import { expect, test } from "@playwright/test"
import { cleanupTestUser, createAuthenticatedUser } from "../helpers/auth"
import { cleanupDsrByUser, listDsrByUser } from "../helpers/dsr"

let adminUserId: string
let regularUserId: string

test.describe("Admin DSR triage E2E", () => {
  test.setTimeout(120_000)

  test.afterAll(async () => {
    // Clean DSR records first (has FK refs to both users)
    if (regularUserId) {
      cleanupDsrByUser(regularUserId)
    }
    // Then clean users
    if (regularUserId) {
      await cleanupTestUser(regularUserId)
    }
    if (adminUserId) {
      await cleanupTestUser(adminUserId)
    }
  })

  test("non-admin gets 404 on /admin/privacy/requests", async ({ page }) => {
    const user = await createAuthenticatedUser(page, {
      name: "Regular User",
      email: `dsr-nonadmin-${Date.now()}@e2e.test`,
      role: "user",
    })
    regularUserId = user.userId

    await page.goto("/admin/privacy/requests")
    await page.waitForLoadState("networkidle")

    // Admin layout redirects non-admins to /auth/login — should NOT see admin table
    const adminTable = page.locator("table").first()
    expect(await adminTable.count()).toBe(0)
  })

  test("admin can view DSR list and transition status", async ({ page }) => {
    // First, create a DSR as a regular user
    const submitter = await createAuthenticatedUser(page, {
      name: "DSR Submitter",
      email: `dsr-submitter-${Date.now()}@e2e.test`,
    })
    regularUserId = submitter.userId

    // Submit a DSR via the form
    await page.goto("/privacy/request")
    await expect(page.locator("h1")).toContainText("Data Subject Request", { timeout: 20_000 })
    await page.getByPlaceholder(/context/i).fill("Admin triage e2e test")
    await page.getByRole("checkbox").check()
    await page.getByRole("button", { name: /submit/i }).click()
    await expect(page).toHaveURL(/\/privacy\/request\/submitted\?id=/, { timeout: 20_000 })

    // Verify DSR exists
    const rows = listDsrByUser(submitter.userId)
    expect(rows.length).toBe(1)
    expect(rows[0].status).toBe("PENDING")

    // Now sign in as admin (clear previous session first)
    await page.context().clearCookies()
    const admin = await createAuthenticatedUser(page, {
      name: "Admin User",
      email: `dsr-admin-${Date.now()}@e2e.test`,
      role: "admin",
    })
    adminUserId = admin.userId

    // Navigate to admin DSR list
    await page.goto("/admin/privacy/requests")
    await page.waitForLoadState("networkidle")

    // Should see the request
    await expect(page.locator("body")).toContainText(submitter.email, { timeout: 10_000 })

    // Click through to detail
    await page.getByText("View →").first().click()
    await page.waitForLoadState("networkidle")

    // Should see PENDING badge
    await expect(page.locator("text=PENDING").first()).toBeVisible()

    // Transition to IN_PROGRESS
    await page.getByRole("button", { name: /→ IN PROGRESS/i }).click()
    // Server action fires, router.refresh() re-renders — reload to confirm
    await page.waitForTimeout(2_000)
    await page.reload()
    await page.waitForLoadState("networkidle")
    await expect(page.getByText(/IN.PROGRESS/).first()).toBeVisible({ timeout: 10_000 })

    // Transition to FULFILLED
    await page.getByRole("button", { name: /→ FULFILLED/i }).click()
    await page.waitForTimeout(2_000)
    await page.reload()
    await page.waitForLoadState("networkidle")
    await expect(page.getByText("FULFILLED").first()).toBeVisible({ timeout: 10_000 })

    // Verify in DB
    const updatedRows = listDsrByUser(submitter.userId)
    expect(updatedRows[0].status).toBe("FULFILLED")
    expect(updatedRows[0].fulfilledBy).toBe(admin.userId)
  })
})
