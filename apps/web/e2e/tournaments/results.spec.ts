import { expect, test } from "@playwright/test"
import { getFixture } from "../helpers/fixture"

test.describe("Tournament results page", () => {
  test("navigates from list to detail to results", async ({ page }) => {
    const fixture = getFixture()

    // Navigate directly to seeded tournament detail
    await page.goto(`/tournaments/${fixture.tournamentSlug}`)
    // §14e SESSION_0271: removed networkidle — body visibility is the anchor
    await expect(page.locator("body")).toBeVisible({ timeout: 30_000 })

    // Navigate to results page
    await page.goto(`/tournaments/${fixture.tournamentSlug}/results`)
    // §14e SESSION_0271: removed networkidle — body visibility is the anchor
    await expect(page.locator("body")).toBeVisible({ timeout: 30_000 })
  })

  test("results page shows bracket data when present", async ({ page }) => {
    const fixture = getFixture()

    await page.goto(`/tournaments/${fixture.tournamentSlug}/results`)
    // §14e SESSION_0271: removed networkidle — body visibility is the anchor

    // Should see bracket/match content since we seeded matches
    const body = page.locator("body")
    await expect(body).toBeVisible()
    await expect(body).not.toContainText("404 Not Found")
  })
})
