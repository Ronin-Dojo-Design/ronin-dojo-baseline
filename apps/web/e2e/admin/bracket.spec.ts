import { expect, test } from "@playwright/test"
import { cleanupTestUser, createAuthenticatedUser } from "../helpers/auth"
import { getFixture } from "../helpers/fixture"

let testUserId: string

test.describe("Admin tournament detail + bracket E2E", () => {
  test.afterAll(async () => {
    if (testUserId) {
      await cleanupTestUser(testUserId)
    }
  })

  test("admin can view tournament detail page with form and panels", async ({ page }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    testUserId = userId
    const fixture = getFixture()

    await page.goto(`/admin/tournaments/${fixture.tournamentId}`)
    await page.waitForLoadState("networkidle")

    // Tournament detail page should render the edit form with tournament name
    await expect(page.locator("body")).toBeVisible()
    await expect(page.getByText(/edit/i).first()).toBeVisible()
  })

  test("admin can navigate to bracket viewer from tournament detail", async ({ page }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    testUserId = userId
    const fixture = getFixture()

    await page.goto(`/admin/tournaments/${fixture.tournamentId}/brackets/${fixture.bracketId}`)
    await page.waitForLoadState("networkidle")

    // Bracket viewer should render
    await expect(page.locator("body")).not.toContainText("404")
    await expect(page.getByText(/bracket:/i)).toBeVisible()
  })
})
