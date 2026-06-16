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

// SESSION_0362 update: SESSION_0356 removed the drawer tier-gate (`canOpenProfileDrawer`
// deleted) — the profile drawer opens for EVERYONE, including anonymous viewers (operator
// decision D-022: funnel-first full public view with claim CTA). The old free-tier
// "Highlight lineage path" fallback control no longer exists; anonymous public members now
// expose "Open lineage profile" and the drawer must open.
async function expectPublicProfileDrawerOpens(page: Page, displayName: string) {
  const profileButton = page.getByRole("button", {
    name: new RegExp(`Open lineage profile for ${escapeRegExp(displayName)}`),
  })

  await expect(profileButton.first()).toBeVisible({ timeout: 30_000 })
  await profileButton.first().click()
  await expect(page.getByRole("dialog", { name: displayName })).toBeVisible({ timeout: 15_000 })
}

async function expectNoHiddenText(pageContent: string, hiddenText: string[]) {
  for (const hiddenValue of hiddenText) {
    expect(pageContent).not.toContain(hiddenValue)
  }
}

test.describe("Lineage public visibility E2E", () => {
  test.beforeAll(async () => {
    fixture = await seedLineageVisibilityFixture()
  })

  test.afterAll(async () => {
    if (fixture) await cleanupLineageVisibilityFixture(fixture)
  })

  test("anonymous listing shows only public member counts and no hidden names", async ({
    page,
  }) => {
    await page.goto(`/lineage?q=${encodeURIComponent(fixture.searchToken)}`)

    await expect(
      page.getByRole("heading", { name: "Lineage Trees", exact: true, level: 1 }),
    ).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText("1 lineage tree")).toBeVisible({ timeout: 30_000 })
    await expect(
      page.getByRole("link", { name: new RegExp(escapeRegExp(fixture.treeName)) }),
    ).toBeVisible()
    await expect(page.getByText("1 member")).toBeVisible()
    await expect(page.getByText("4 members")).toHaveCount(0)

    const body = page.locator("body")
    const hiddenText = [
      ...Object.values(fixture.hiddenNames),
      ...Object.values(fixture.hiddenGroupLabels),
    ]
    for (const hiddenValue of hiddenText) {
      await expect(body).not.toContainText(hiddenValue)
    }

    await expectNoHiddenText(await page.content(), hiddenText)
  })

  test("anonymous listing search does not match hidden member names", async ({ page }) => {
    await page.goto(`/lineage?q=${encodeURIComponent(fixture.hiddenNames.unlisted)}`)

    await expect(
      page.getByRole("heading", { name: "Lineage Trees", exact: true, level: 1 }),
    ).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText("0 lineage trees")).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText(fixture.treeName)).toHaveCount(0)

    const body = page.locator("body")
    for (const hiddenValue of Object.values(fixture.hiddenNames)) {
      await expect(body).not.toContainText(hiddenValue)
    }

    // The searched hidden name is expected to be echoed in the search input,
    // so serialized HTML assertions exclude that one query value.
    await expectNoHiddenText(await page.content(), [
      fixture.hiddenNames.restricted,
      fixture.hiddenNames.private,
      ...Object.values(fixture.hiddenGroupLabels),
    ])
  })

  test("anonymous detail renders public members and opens the profile drawer without hidden leakage", async ({
    page,
  }) => {
    // SESSION_0393: the cinematic explorer is now the default lineage view; this spec
    // asserts the board/tree surface + its node-card buttons, so pin it to ?view=board.
    // (Privacy is enforced server-side on the shared payload, so it holds in both views.)
    await page.goto(`/lineage/${fixture.treeSlug}?view=board`)

    await expect(page.getByRole("heading", { name: fixture.treeName, level: 1 })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByText("1 member")).toBeVisible()
    await expect(page.getByText("4 members")).toHaveCount(0)
    await expect(page.getByText(fixture.publicName)).toBeVisible()

    const hiddenText = [
      ...Object.values(fixture.hiddenNames),
      ...Object.values(fixture.hiddenGroupLabels),
    ]
    const body = page.locator("body")
    for (const hiddenValue of hiddenText) {
      await expect(body).not.toContainText(hiddenValue)
    }
    await expectNoHiddenText(await page.content(), hiddenText)

    await expectPublicProfileDrawerOpens(page, fixture.publicName)

    // Privacy boundary holds WITH the drawer open — hidden members/groups stay
    // out of the DOM even in the drawer payload.
    for (const hiddenValue of hiddenText) {
      await expect(body).not.toContainText(hiddenValue)
    }
    await expectNoHiddenText(await page.content(), hiddenText)
  })
})
