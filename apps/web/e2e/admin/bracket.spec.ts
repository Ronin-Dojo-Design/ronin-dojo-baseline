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

    // SESSION_0266: `waitForLoadState("networkidle")` flakes under full-suite
    // load because Next dev-server background traffic from sibling specs keeps
    // the request stream busy past the 30s timeout. Gate on a deterministic
    // first-render element instead.
    await expect(page.getByText(/edit/i).first()).toBeVisible({ timeout: 20_000 })
  })

  test("admin can navigate to bracket viewer from tournament detail", async ({ page }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    testUserId = userId
    const fixture = getFixture()

    await page.goto(`/admin/tournaments/${fixture.tournamentId}/brackets/${fixture.bracketId}`)

    // SESSION_0266: replaced `waitForLoadState("networkidle")` with the
    // bracket page's stable first-render heading (`<h2>Bracket: …</h2>` at
    // `app/admin/tournaments/[id]/brackets/[bracketId]/page.tsx:57`).
    await expect(page.getByRole("heading", { name: /^Bracket:/i, level: 2 })).toBeVisible({
      timeout: 20_000,
    })
    await expect(page.locator("body")).not.toContainText("404")
  })
})
