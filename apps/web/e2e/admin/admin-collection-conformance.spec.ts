import { expect, test } from "@playwright/test"
import { cleanupTestUser, createAuthenticatedUser } from "../helpers/auth"

// WL-P2-34 (ADR 0045): /app/claims, /app/organizations, /app/media migrated onto the ONE
// AdminCollection frame. Temporary conformance smoke — asserts each migrated route renders
// the shared DataTable frame (a <table>) under an admin session rather than crashing.
let testUserId: string

test.describe("AdminCollection conformance smoke", () => {
  test.afterAll(async () => {
    if (testUserId) await cleanupTestUser(testUserId)
  })

  for (const path of ["/app/claims", "/app/organizations", "/app/media"]) {
    test(`admin sees the AdminCollection table at ${path}`, async ({ page }) => {
      const { userId } = await createAuthenticatedUser(page, { role: "admin" })
      testUserId = userId

      await page.goto(path)

      await expect(page.locator("table").first()).toBeVisible({ timeout: 30_000 })
      await expect(page.locator("body")).not.toContainText("404")
    })
  }
})
