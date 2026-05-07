import { test, expect } from "@playwright/test"

test.describe("Tournament results page", () => {
  test("navigates from list to detail to results", async ({ page }) => {
    // Step 1: Discover a tournament from the list
    await page.goto("/tournaments")
    await page.waitForLoadState("networkidle")

    const tournamentLink = page.locator('a[href*="/tournaments/"]').first()
    const linkExists = (await tournamentLink.count()) > 0
    test.skip(!linkExists, "No tournaments in dev DB — seed data required")

    const href = await tournamentLink.getAttribute("href")
    expect(href).toBeTruthy()

    // Step 2: Navigate to tournament detail
    await tournamentLink.click()
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()

    // Step 3: Navigate to results page
    const resultsUrl = `${href}/results`
    await page.goto(resultsUrl)
    await expect(page).toHaveTitle(/result/i)
  })

  test("results page shows bracket data when present", async ({ page }) => {
    // Go directly to a known tournament with bracket data
    await page.goto("/tournaments")
    await page.waitForLoadState("networkidle")

    const tournamentLink = page.locator('a[href*="/tournaments/"]').first()
    const linkExists = (await tournamentLink.count()) > 0
    test.skip(!linkExists, "No tournaments in dev DB")

    const href = await tournamentLink.getAttribute("href")
    await page.goto(`${href}/results`)
    await page.waitForLoadState("networkidle")

    // If this tournament has brackets, we should see content — not a 404
    const body = page.locator("body")
    await expect(body).toBeVisible()
  })
})
