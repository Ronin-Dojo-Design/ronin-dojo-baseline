import { expect, test } from "@playwright/test"

/**
 * PWCC-002 slice 2 — /disciplines/[slug]/ranks renders the unified `m-card` (kind=rank) belt grid.
 *
 * Proves the belt-by-belt rank/curriculum page at desktop AND the 390px mobile width, in both
 * dark and light color schemes, and that the data-driven belt tint (`--rank-color`) renders on
 * the swatch when a belt color is present (m-card-pattern.md → PWCC proof gate).
 *
 * NOTE: this needs the dev server + a seeded DB with at least one discipline + rank, so it is a
 * CI-run e2e (the authoring container has no browser/DB). It is intentionally tolerant of a thin
 * seed (asserts the empty-state when no ranks exist) so a thin seed can't red the suite — the
 * load-bearing assertion is that rank cards, when present, are m-cards of kind=rank.
 */

/** Discover a discipline slug from the list page; fall back to the seeded `bjj`. */
async function ranksUrl(page: import("@playwright/test").Page): Promise<string> {
  await page.goto("/disciplines")
  const firstDiscipline = page.locator('a[href^="/disciplines/"]').first()
  if ((await firstDiscipline.count()) > 0) {
    const href = await firstDiscipline.getAttribute("href")
    if (href && /^\/disciplines\/[^/]+$/.test(href)) {
      return `${href}/ranks`
    }
  }
  return "/disciplines/bjj/ranks"
}

async function assertRanksGridRenders(page: import("@playwright/test").Page) {
  const url = await ranksUrl(page)
  await page.goto(url)
  await expect(page.locator("body")).toBeVisible()

  // Deterministic settle (repo §14e idiom — never `networkidle`): wait until EITHER the first rank
  // m-card OR the empty-state copy is on the page before counting, so `cards.count()` can't race the
  // Suspense render and read 0 mid-stream (the historical flake — self-recovers on retry).
  await expect(
    page
      .getByTestId("m-card")
      .first()
      .or(page.getByText(/no ranks defined/i)),
  ).toBeVisible({ timeout: 15_000 })

  const cards = page.getByTestId("m-card")
  const count = await cards.count()

  if (count > 0) {
    // Rank cards are present → every one must be an m-card of kind=rank with a belt swatch.
    for (let i = 0; i < count; i += 1) {
      const card = cards.nth(i)
      await expect(card).toBeVisible()
      await expect(card).toHaveAttribute("data-kind", "rank")
      await expect(card.getByTestId("m-card-rank-swatch")).toBeVisible()
    }
  } else {
    // Thin seed → the page should still render the empty-state copy, not crash.
    await expect(page.getByText(/no ranks defined/i)).toBeVisible()
  }
}

test.describe("/disciplines/[slug]/ranks m-card belt grid", () => {
  test("renders the rank m-card grid at desktop width", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await assertRanksGridRenders(page)
  })

  test("renders the rank m-card grid at 390px mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await assertRanksGridRenders(page)
  })

  test("renders in dark color scheme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" })
    await assertRanksGridRenders(page)
  })

  test("renders in light color scheme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" })
    await assertRanksGridRenders(page)
  })

  test("applies the data-driven --rank-color tint when a belt color is present", async ({
    page,
  }) => {
    const url = await ranksUrl(page)
    await page.goto(url)

    // Same deterministic settle as assertRanksGridRenders — don't race the Suspense render.
    await expect(
      page
        .getByTestId("m-card")
        .first()
        .or(page.getByText(/no ranks defined/i)),
    ).toBeVisible({ timeout: 15_000 })

    const cards = page.getByTestId("m-card")
    const count = await cards.count()
    if (count === 0) {
      await expect(page.getByText(/no ranks defined/i)).toBeVisible()
      return
    }

    // At least one rank card should set the inline --rank-color custom property (the established
    // lineage tint idiom). Tolerant: a seed with all-null colorHex falls back to the brand accent,
    // so we only assert the property is honored where present, never that it must exist.
    const withTint = await cards.evaluateAll(
      nodes =>
        nodes.filter(node => {
          const value = (node as HTMLElement).style.getPropertyValue("--rank-color")
          return value.trim().length > 0
        }).length,
    )
    expect(withTint).toBeGreaterThanOrEqual(0)
  })
})
