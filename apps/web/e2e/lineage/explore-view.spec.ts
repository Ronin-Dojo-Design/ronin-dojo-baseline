import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"
import {
  cleanupLineageVisibilityFixture,
  type LineageVisibilityFixture,
  seedLineageVisibilityFixture,
} from "../helpers/seed-lineage"

let fixture: LineageVisibilityFixture

test.describe.configure({ mode: "serial" })

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * The explore ("cinematic focal explorer") view is the DEFAULT public lineage
 * view (no `?view=`). It renders the `LineageViewAIsland` — the Focal lineage
 * heading + metric pills, per-member cards (`div#lineage-member-<id>`) whose
 * header button recenters focus (writes `?view=explore&focus=<id>` via
 * `history.replaceState`), a per-card ⋮ "Actions" menu (View profile / Copy
 * focus link / …), and the labeled filter-dropdown bar.
 *
 * SESSION_0504: this spec LOCKS the island's interaction surface before the
 * behavior-preserving 5-slice extraction. It asserts role/text contracts, not
 * class strings, so it survives the refactor unchanged.
 */

// The focal card's header button carries the member name; clicking it recenters.
function memberCardHeaderButton(page: Page, memberName: string) {
  return page.getByRole("button", { name: new RegExp(escapeRegExp(memberName)) })
}

test.describe("Lineage explore-view (island) E2E", () => {
  test.beforeAll(async () => {
    fixture = await seedLineageVisibilityFixture()
  })

  test.afterAll(async () => {
    if (fixture) await cleanupLineageVisibilityFixture(fixture)
  })

  test("explore is the default view — heading, metric pill, and a member card render", async ({
    page,
  }) => {
    await page.goto(`/lineage/${fixture.treeSlug}`)

    await expect(page.getByRole("heading", { name: fixture.treeName, level: 1 })).toBeVisible({
      timeout: 30_000,
    })

    // The island heading + the "Focal lineage view" badge mark the explore surface.
    await expect(page.getByRole("heading", { name: /Explore the living lineage/i })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByText("Focal lineage view")).toBeVisible()

    // At least one metric pill (Members) is visible. The label renders twice —
    // the mobile MetricStat strip (`sm:hidden`) and the desktop MetricPill grid
    // (`sm:grid`); at the default desktop viewport only the pill is visible, so
    // scope to the visible instance rather than the DOM-first (hidden) one.
    await expect(page.getByText("Members", { exact: true }).locator("visible=true")).toBeVisible()

    // The public member's focal card renders.
    await expect(page.locator(`[id^="lineage-member-"]`).first()).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText(fixture.publicName).first()).toBeVisible()
  })

  test("card ⋮ Actions → View profile opens the profile drawer", async ({ page }) => {
    await page.goto(`/lineage/${fixture.treeSlug}`)

    const card = page.locator(`[id^="lineage-member-"]`, { hasText: fixture.publicName }).first()
    await expect(card).toBeVisible({ timeout: 30_000 })

    // The ⋮ button is labeled "Actions" (aria-label). Open the card menu.
    await card.getByRole("button", { name: "Actions" }).click()

    // "View profile" menuitem opens the drawer dialog for the member.
    await page.getByRole("menuitem", { name: "View profile" }).click()
    await expect(page.getByRole("dialog", { name: fixture.publicName })).toBeVisible({
      timeout: 15_000,
    })

    // Close the drawer (Escape) — the dialog goes away.
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog", { name: fixture.publicName })).toBeHidden({
      timeout: 15_000,
    })
  })

  test("clicking a member card header recenters focus (?view=explore&focus=)", async ({ page }) => {
    await page.goto(`/lineage/${fixture.treeSlug}`)

    const header = memberCardHeaderButton(page, fixture.publicName).first()
    await expect(header).toBeVisible({ timeout: 30_000 })
    await header.click()

    // history.replaceState writes ?view=explore&focus=<id>.
    await expect(async () => {
      const url = page.url()
      expect(url).toContain("view=explore")
      expect(url).toContain("focus=")
    }).toPass({ timeout: 15_000 })
  })

  test("card ⋮ Actions → Copy focus link shows the transient confirmation", async ({ page }) => {
    await page.goto(`/lineage/${fixture.treeSlug}`)

    const card = page.locator(`[id^="lineage-member-"]`, { hasText: fixture.publicName }).first()
    await expect(card).toBeVisible({ timeout: 30_000 })

    await card.getByRole("button", { name: "Actions" }).click()
    await page.getByRole("menuitem", { name: "Copy focus link" }).click()

    await expect(page.getByText("Focus link copied")).toBeVisible({ timeout: 15_000 })
  })

  test("filter dropdown opens, its checkbox toggles, and the island stays rendered", async ({
    page,
  }) => {
    await page.goto(`/lineage/${fixture.treeSlug}`)

    await expect(page.getByRole("heading", { name: /Explore the living lineage/i })).toBeVisible({
      timeout: 30_000,
    })

    // The filter bar renders one labeled dropdown per available dimension
    // (Group/Belt/School/Year). Open the first available one.
    const filterLabels = ["Belt", "Group", "School", "Year"]
    let opened = false
    for (const label of filterLabels) {
      const trigger = page.getByRole("button", { name: new RegExp(`^${label}$`, "i") })
      if ((await trigger.count()) > 0) {
        await trigger.first().click()
        opened = true
        break
      }
    }
    expect(opened).toBe(true)

    // A checkbox menuitem is visible + clickable; toggling it must not crash the island.
    const checkboxItem = page.getByRole("menuitemcheckbox").first()
    await expect(checkboxItem).toBeVisible({ timeout: 15_000 })
    await checkboxItem.click()

    // Filters DIM (not hide) — the member card is still present after the toggle.
    await expect(page.locator(`[id^="lineage-member-"]`).first()).toBeVisible({ timeout: 15_000 })
  })
})
