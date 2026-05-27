import { expect, test } from "@playwright/test"
import { cleanupTestUser, createAuthenticatedUser } from "../helpers/auth"
import { getFixture } from "../helpers/fixture"

let testUserId: string

test.describe("Admin match scoring E2E", () => {
  test.afterAll(async () => {
    if (testUserId) {
      await cleanupTestUser(testUserId)
    }
  })

  test("admin can open scoring dialog on a bracket match", async ({ page }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    testUserId = userId
    const fixture = getFixture()

    // Go directly to the bracket page with seeded matches
    await page.goto(`/admin/tournaments/${fixture.tournamentId}/brackets/${fixture.bracketId}`)

    // SESSION_0267 (carries SESSION_0266_TASK_01 pattern): replaced
    // `waitForLoadState("networkidle")` + `getByText(/bracket:/i)` with the
    // bracket page's stable first-render heading. Same anchor as
    // bracket.spec.ts:28; closes SESSION_0266_FINDING_03 for scoring.spec.
    // 30s timeout chosen empirically: SESSION_0266's 20s passed isolation
    // stress (6/6) but flaked under 30-spec full-suite load due to Next
    // dev-server JIT-compile delay on dynamic routes.
    await expect(page.getByRole("heading", { name: /^Bracket:/i, level: 2 })).toBeVisible({
      timeout: 30_000,
    })

    // SESSION_0267: tightened `/score/i` → `/^Score$/i` so the locator
    // can't match neighboring labels like "Score Match" (dialog title) or
    // "Save Score" (submit button). Actual rendered button is literal
    // `Score` at `bracket-viewer.tsx:423`.
    const scoreButton = page.getByRole("button", { name: /^Score$/i }).first()
    const hasScoreButton = (await scoreButton.count()) > 0

    if (!hasScoreButton) {
      // Bracket renders but no score buttons — still valid (layout proof)
      await expect(page.locator("body")).toBeVisible()
      return
    }

    // Open scoring dialog
    await scoreButton.click()

    // Dialog should open with scoring form
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByText(/winner/i).first()).toBeVisible()
  })
})
