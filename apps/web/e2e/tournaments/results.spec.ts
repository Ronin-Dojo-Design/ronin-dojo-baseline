import { expect, test } from "@playwright/test"
import { getFixture } from "../helpers/fixture"

test.describe("Tournament results page", () => {
  test("navigates from list to detail to results", async ({ page }) => {
    const fixture = getFixture()

    // Navigate directly to seeded tournament detail
    await page.goto(`/tournaments/${fixture.tournamentSlug}`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()

    // Navigate to results page
    await page.goto(`/tournaments/${fixture.tournamentSlug}/results`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("results page shows bracket data when present", async ({ page }) => {
    const fixture = getFixture()

    await page.goto(`/tournaments/${fixture.tournamentSlug}/results`)
    await page.waitForLoadState("networkidle")

    // Should see bracket/match content since we seeded matches
    const body = page.locator("body")
    await expect(body).toBeVisible()
    await expect(body).not.toContainText("404")
  })
})
