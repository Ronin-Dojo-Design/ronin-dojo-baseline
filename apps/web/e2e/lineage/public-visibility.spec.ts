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
    await page.waitForLoadState("networkidle")

    await expect(page.getByRole("heading", { name: "Lineage Trees", exact: true })).toBeVisible()
    await expect(page.getByText("1 lineage tree")).toBeVisible()
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
    await page.waitForLoadState("networkidle")

    await expect(page.getByText("0 lineage trees")).toBeVisible()
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

  test("anonymous detail renders only public members and drawer profiles", async ({ page }) => {
    await page.goto(`/lineage/${fixture.treeSlug}`)
    await page.waitForLoadState("networkidle")

    await expect(page.getByRole("heading", { name: fixture.treeName })).toBeVisible()
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

    await page
      .getByRole("button", {
        name: new RegExp(`Open lineage profile for ${escapeRegExp(fixture.publicName)}`),
      })
      .click()

    await expect(page.getByRole("heading", { name: fixture.publicName })).toBeVisible()
    await expect(page.getByText("Current Rank")).toBeVisible()

    for (const hiddenValue of hiddenText) {
      await expect(body).not.toContainText(hiddenValue)
    }
    await expectNoHiddenText(await page.content(), hiddenText)
  })
})
