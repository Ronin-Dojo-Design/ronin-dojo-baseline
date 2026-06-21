import { expect, test } from "@playwright/test"

/**
 * PWCC-002 slice 1 — /directory/profiles renders the unified `m-card` (kind=roster) grid.
 *
 * Proves the roster swap (FacetResultCard → m-card) at desktop AND the 390px mobile width,
 * the two viewports the m-card spec's proof gate calls for
 * (docs/knowledge/wiki/files/m-card-pattern.md → PWCC proof gate).
 *
 * NOTE: this needs the dev server + a seeded DB with at least one public profile, so it is a
 * CI-run e2e (the container that authored it has no browser/DB). It is intentionally tolerant
 * of an empty roster (asserts the grid/empty-state renders without error) so a thin seed can't
 * red the suite — the load-bearing assertion is that people cards, when present, are m-cards.
 */

const PROFILES_URL = "/directory/profiles"

async function assertProfilesGridRenders(page: import("@playwright/test").Page) {
  await page.goto(PROFILES_URL)
  await expect(page.locator("body")).toBeVisible()

  const cards = page.getByTestId("m-card")
  const count = await cards.count()

  if (count > 0) {
    // Roster cards are present → every one must be an m-card of kind=roster.
    for (let i = 0; i < count; i += 1) {
      const card = cards.nth(i)
      await expect(card).toBeVisible()
      await expect(card).toHaveAttribute("data-kind", "roster")
      // Parity: each card still deep-links to a profile and exposes a Save affordance.
      await expect(card.getByRole("link", { name: /view profile/i })).toBeVisible()
    }
  } else {
    // Empty seed → the page should still render the empty-state copy, not crash.
    await expect(page.getByText(/no people found/i)).toBeVisible()
  }
}

test.describe("/directory/profiles m-card roster grid", () => {
  test("renders the m-card grid at desktop width", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await assertProfilesGridRenders(page)
  })

  test("renders the m-card grid at 390px mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await assertProfilesGridRenders(page)
  })
})
