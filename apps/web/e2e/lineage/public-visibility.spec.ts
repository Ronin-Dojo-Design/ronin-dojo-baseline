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

async function expectFreeTierPathControl(page: Page, displayName: string) {
  const pathButton = page.getByRole("button", {
    name: new RegExp(`Highlight lineage path for ${escapeRegExp(displayName)}`),
  })

  await expect(pathButton).toBeVisible({ timeout: 30_000 })
  await expect(
    page.getByRole("button", {
      name: new RegExp(`Open lineage profile for ${escapeRegExp(displayName)}`),
    }),
  ).toHaveCount(0)

  await pathButton.click()
  await expect(page.getByRole("dialog", { name: displayName })).toHaveCount(0)
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

  test("anonymous detail renders free-tier public members without profile drawer", async ({
    page,
  }) => {
    await page.goto(`/lineage/${fixture.treeSlug}`)

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

    await expectFreeTierPathControl(page, fixture.publicName)

    for (const hiddenValue of hiddenText) {
      await expect(body).not.toContainText(hiddenValue)
    }
    await expectNoHiddenText(await page.content(), hiddenText)
  })
})
