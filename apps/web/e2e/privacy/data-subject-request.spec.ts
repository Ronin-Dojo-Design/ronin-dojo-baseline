/**
 * E2E: Data Subject Request flow
 *
 * Covers:
 * 1. Anonymous → login redirect
 * 2. Authenticated submit creates a PENDING row
 * 3. Confirm-checkbox guard prevents submit
 *
 * @added SESSION_0255
 * @resolves SESSION_0254_FINDING_01
 */
import { expect, test } from "@playwright/test"
import { cleanupTestUser, createAuthenticatedSession, createAuthenticatedUser } from "../helpers/auth"
import { cleanupDsrByUser, listDsrByUser } from "../helpers/dsr"

test.describe.configure({ mode: "serial" })

test.describe("Data Subject Request flow", () => {
  test.setTimeout(60_000)

  let userId: string

  test.afterAll(async () => {
    if (userId) {
      cleanupDsrByUser(userId)
      await cleanupTestUser(userId)
    }
  })

  test("anonymous visit redirects to login", async ({ page }) => {
    await page.goto("/privacy/request")
    await expect(page).toHaveURL(
      url => url.pathname === "/auth/login" && url.searchParams.get("next") === "/privacy/request",
      { timeout: 20_000 },
    )
  })

  test("authenticated submit creates a PENDING DSR row", async ({ page }) => {
    const user = await createAuthenticatedUser(page, {
      name: "DSR Test User",
      email: `dsr-test-${Date.now()}@e2e.test`,
    })
    userId = user.userId

    await page.goto("/privacy/request")
    await expect(page.locator("h1")).toContainText("Data Subject Request", { timeout: 20_000 })

    // Select EXPORT type (default)
    // Fill optional reason
    await page.getByPlaceholder(/context/i).fill("E2E test export request")

    // Check confirm box
    await page.getByRole("checkbox").check()

    // Submit
    await page.getByRole("button", { name: /submit/i }).click()

    // Should land on confirmation page
    await expect(page).toHaveURL(/\/privacy\/request\/submitted\?id=/, { timeout: 20_000 })

    // Verify DB row
    const rows = listDsrByUser(userId)
    expect(rows.length).toBeGreaterThanOrEqual(1)

    const latest = rows[0]
    expect(latest.type).toBe("EXPORT")
    expect(latest.status).toBe("PENDING")
    expect(latest.reason).toBe("E2E test export request")
  })

  test("submit without confirm checkbox shows validation error", async ({ page }) => {
    if (!userId) {
      const user = await createAuthenticatedUser(page, {
        name: "DSR Confirm Test",
        email: `dsr-confirm-${Date.now()}@e2e.test`,
      })
      userId = user.userId
    } else {
      await createAuthenticatedSession(page, userId)
    }

    const rowsBefore = listDsrByUser(userId).length

    await page.goto("/privacy/request")
    await expect(page.locator("h1")).toContainText("Data Subject Request", { timeout: 20_000 })

    // Do NOT check the confirm checkbox
    // Try to submit
    await page.getByRole("button", { name: /submit/i }).click()

    // Expect the validation message
    await expect(page.getByText("Please confirm before submitting")).toBeVisible({
      timeout: 5_000,
    })

    const rowsAfter = listDsrByUser(userId)
    expect(rowsAfter).toHaveLength(rowsBefore)
  })
})
