import { test, expect } from "@playwright/test"
import { createAuthenticatedUser, cleanupTestUser } from "../helpers/auth"

let testUserId: string

test.describe("Admin tournament list E2E", () => {
  test.afterAll(async () => {
    if (testUserId) {
      await cleanupTestUser(testUserId)
    }
  })

  test("admin can access tournament list page", async ({ page }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    testUserId = userId

    await page.goto("/admin/tournaments")
    await page.waitForLoadState("networkidle")

    // Should not get a 404 — admin role grants access
    await expect(page.locator("body")).not.toContainText("404")
    // Page should render (heading or table)
    await expect(page.locator("body")).toBeVisible()
  })

  test("non-admin gets redirected away from admin tournament page", async ({ page }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "user" })
    testUserId = userId

    await page.goto("/admin/tournaments")
    await page.waitForLoadState("networkidle")

    // Auth HOC calls notFound() for non-admins — they should NOT see admin tournament content
    // The not-found page renders without any admin table/heading
    await expect(page.locator("body")).toBeVisible()
    await expect(page.locator("body")).not.toContainText("Edit")
    // Should not see any admin tournament management UI
    const adminTable = page.locator("table").first()
    expect(await adminTable.count()).toBe(0)
  })
})
