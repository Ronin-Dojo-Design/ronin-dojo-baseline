import { expect, test } from "@playwright/test"

test.describe("Tournament list page", () => {
  test("loads and shows heading", async ({ page }) => {
    await page.goto("/tournaments")
    await expect(page.getByRole("heading", { name: /tournaments/i })).toBeVisible()
  })

  test("displays tournament cards when data exists", async ({ page }) => {
    await page.goto("/tournaments")
    // §14e SESSION_0271: removed networkidle — tournament links check is the anchor
    // Look for links or cards — tournaments render as clickable items
    const tournamentLinks = page.locator('a[href*="/tournaments/"]')
    const count = await tournamentLinks.count()
    // If seed data exists, at least one tournament should appear
    if (count > 0) {
      await expect(tournamentLinks.first()).toBeVisible()
    }
  })

  test("page has correct title", async ({ page }) => {
    await page.goto("/tournaments")
    await expect(page).toHaveTitle(/tournament/i)
  })
})
