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
    // SESSION_0719: removed the SESSION_0418 `test.slow()`. It tripled the timeout only to absorb
    // the admin tournament-detail route's ~50s cold Turbopack JIT compile under the dev server; CI
    // now serves a PRODUCTION build (`next start`, SESSION_0717/0718 P1) so the route is precompiled
    // — the 30s default is ample, and the deterministic first-render anchor below drives the wait.
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    testUserId = userId
    const fixture = getFixture()

    await page.goto(`/app/tournaments/${fixture.tournamentId}`)

    // SESSION_0266: `waitForLoadState("networkidle")` flakes under full-suite
    // load because Next dev-server background traffic from sibling specs keeps
    // the request stream busy past the 30s timeout. Gate on a deterministic
    // first-render element instead.
    await expect(page.getByText(/edit/i).first()).toBeVisible({ timeout: 20_000 })
  })

  test("admin can navigate to bracket viewer from tournament detail", async ({ page }) => {
    // SESSION_0719: removed `test.slow()` (was: heavy admin tournament route, slow JIT compile
    // under the dev server) — CI serves a PRODUCTION build now, so no JIT compile to absorb.
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    testUserId = userId
    const fixture = getFixture()

    await page.goto(`/app/tournaments/${fixture.tournamentId}/brackets/${fixture.bracketId}`)

    // SESSION_0266: replaced `waitForLoadState("networkidle")` with the
    // bracket page's stable first-render heading (`<h2>Bracket: …</h2>` at
    // `app/app/tournaments/[id]/brackets/[bracketId]/page.tsx:57`).
    await expect(page.getByRole("heading", { name: /^Bracket:/i, level: 2 })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.locator("body")).not.toContainText("404 Not Found")
  })
})
