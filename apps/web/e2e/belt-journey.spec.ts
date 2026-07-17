import { expect, test } from "@playwright/test"
import { createAuthenticatedSession } from "./helpers/auth"
import {
  type BeltJourneyFixture,
  cleanupBeltJourneyFixture,
  seedBeltJourneyFixture,
} from "./helpers/seed-belt-journey"

/**
 * Belt-journey behavior spec (Slice 5 — Petey Plan 0477 §Slice 5).
 *
 * Proves the four gating invariants of the member belt UI at `/app/profile?tab=belts`:
 *   1. enrich a belt AT/BELOW the ceiling (White, self-added) — editable;
 *   2. a belt ABOVE the ceiling (Purple, no award) — routes to the promotion flow;
 *   3. a VERIFIED belt's promotion FACTS (Blue, the top award) — READ-ONLY;
 *   4. deleting the TOP award (Blue) — BLOCKED.
 *
 * ⚠️ OPERATOR-SIDE SMOKE — this spec is NOT part of the standard `bun run test`
 * unit gate (that gate ignores `e2e/**`). It needs a running dev server AND writes
 * a real member+RankAward fixture to the local DB, which is an operator-driven
 * browser/device smoke step (Petey Plan 0477: "Operator-only browser/device smoke
 * is flagged + skipped, never faked"). Run it deliberately with:
 *
 *     bun --env-file=.env.e2e prisma/seed.ts  # this manual smoke needs the BJJ ladder
 *     bun run dev:e2e  # terminal 1
 *     RUN_BELT_E2E=1 bun run test:e2e:local -- e2e/belt-journey.spec.ts --project=chromium  # terminal 2
 *
 * Left `describe.skip` by default so it never runs (or blocks) in CI/agent runs.
 */

const RUN_BELT_E2E = process.env.RUN_BELT_E2E === "1"

let fixture: BeltJourneyFixture

const beltJourney = RUN_BELT_E2E ? test.describe : test.describe.skip

beltJourney("Belt journey — member gating (operator-side smoke)", () => {
  test.setTimeout(120_000)

  test.beforeAll(async () => {
    fixture = await seedBeltJourneyFixture()
  })

  test.afterAll(async () => {
    if (fixture) await cleanupBeltJourneyFixture(fixture)
  })

  test.beforeEach(async ({ page }) => {
    await createAuthenticatedSession(page, fixture.userId)
    await page.goto("/app/profile?tab=belts")
    // The Belts tab is the active DashboardTabs pane; the grid renders one card/rank.
    await expect(page.getByTestId("belt-edit-card").first()).toBeVisible({ timeout: 30_000 })
  })

  function cardForRank(page: import("@playwright/test").Page, rankId: string) {
    return page.locator(`[data-testid="belt-edit-card"][data-rank-id="${rankId}"]`)
  }

  test("a belt at/below the ceiling is enrichable (White, self-added)", async ({ page }) => {
    const white = cardForRank(page, fixture.whiteRankId)
    await expect(white).toBeVisible()
    // Below the ceiling → not locked; its action opens the edit surface.
    await expect(white).not.toHaveAttribute("data-status", "locked")
    await white.getByRole("button", { name: /Add your story|Edit/ }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible({ timeout: 15_000 })
    // White-belt special-case: date asks about training start; no promoter field.
    await expect(dialog.getByText(/when did you start training/i)).toBeVisible()

    const story = `E2E white-belt story ${Date.now()}`
    await dialog.getByLabel("Your story").fill(story)
    // ONE Save button (Desi P1-9) — story + editable facts in a single action.
    await dialog.getByRole("button", { name: "Save", exact: true }).click()
    await expect(page.getByText("Belt saved.")).toBeVisible({ timeout: 15_000 })
  })

  test("a belt above the ceiling routes to the promotion flow (Purple, no award)", async ({
    page,
  }) => {
    const purple = cardForRank(page, fixture.purpleRankId)
    await expect(purple).toBeVisible()
    await expect(purple).toHaveAttribute("data-status", "locked")
    // B1: an above-ceiling belt is NOT a dead disabled button — it exposes an ENABLED
    // "Request promotion" CTA that files a RANK_PROMOTION claim (never a self-mint).
    const requestCta = purple.getByRole("button", { name: "Request promotion" })
    await expect(requestCta).toBeEnabled()
    await requestCta.click()

    // Clicking it opens the promotion-request modal (not the fact-edit surface).
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible({ timeout: 15_000 })
    await expect(
      dialog.getByRole("heading", {
        name: new RegExp(`Request your ${fixture.purpleRankName}`, "i"),
      }),
    ).toBeVisible()
    await expect(dialog.getByRole("button", { name: "Submit request" })).toBeVisible()
  })

  test("a verified belt's FILLED facts are read-only, its EMPTY facts fillable (Blue, top award)", async ({
    page,
  }) => {
    const blue = cardForRank(page, fixture.blueRankId)
    await expect(blue).toBeVisible()
    // Verified but unlocked → still openable (the milestone story is always editable).
    await blue.getByRole("button", { name: /Add your story|Edit/ }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible({ timeout: 15_000 })
    // SESSION_0501 fill-blanks policy, per fact: the FILLED authority facts (date +
    // promoter, seeded on the fixture) collapse to plain value lines — no date input —
    // and the partial-lock hint LEADS the fact group (Desi P1-7).
    await expect(dialog.getByText(/recorded by an instructor or admin are locked/i)).toBeVisible()
    await expect(dialog.locator('input[type="date"]')).toHaveCount(0)
    await expect(dialog.getByText("Prof. Fixture")).toBeVisible()
    // Locked-filled facts expose the lightweight correction affordance (Desi P1-7).
    await expect(dialog.getByRole("link", { name: "Request a correction" })).toBeVisible()
    // …while the EMPTY school fact exposes a fill affordance (the combobox trigger —
    // a `role="combobox"` Button whose accessible name is the placeholder when empty).
    await expect(
      dialog.getByRole("combobox", { name: /select or type your school/i }),
    ).toBeVisible()
    // And the story textarea is present (milestone is always member-editable).
    await expect(dialog.getByLabel("Your story")).toBeVisible()
  })

  test("the top belt exposes no delete affordance (Blue)", async ({ page }) => {
    // The delete-top INVARIANT itself (a top-award delete → FORBIDDEN) is proven
    // server-side in `server/belt/router.integration.test.ts` +
    // `server/belt/belt-gate.test.ts` (`isTopAward`), which run in the unit gate and
    // do not need a browser. Here we assert the user-facing consequence: the top
    // belt's edit surface never offers a destructive delete control, so the member
    // has no UI path to drop their ceiling.
    const blue = cardForRank(page, fixture.blueRankId)
    await blue.getByRole("button", { name: /Add your story|Edit/ }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible({ timeout: 15_000 })
    await expect(dialog.getByRole("button", { name: /delete|remove belt/i })).toHaveCount(0)
  })
})
