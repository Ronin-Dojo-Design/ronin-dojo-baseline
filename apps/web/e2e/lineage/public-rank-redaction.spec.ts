/**
 * SESSION_0265_TASK_03 — Public DOM rank-redaction proof.
 *
 * SESSION_0264_TASK_04A landed payload-allowlist redaction so that a
 * DirectoryProfile.showRanks=false PUBLIC member's rankAwards are stripped
 * before they leave the server. The matching unit suite lives at
 * `apps/web/server/web/lineage/queries.visibility.test.ts`. This spec proves
 * the contract reaches the rendered DOM for an anonymous, unauthenticated
 * viewer of the public lineage drawer.
 *
 * Two members are seeded on the same public tree:
 *   - Member-A: showRanks=true   → positive control (rank text MUST render)
 *   - Member-B: showRanks=false  → case under test (rank text must NOT render)
 *
 * Run independently:
 *   cd apps/web && bunx playwright test \
 *     e2e/lineage/public-rank-redaction.spec.ts --project=chromium
 */
import { expect, test } from "@playwright/test"
import { createAuthenticatedSession } from "../helpers/auth"
import {
  cleanupLineageRankRedactionFixture,
  type LineageRankRedactionFixture,
  seedLineageRankRedactionFixture,
} from "../helpers/seed-lineage-rank-redaction"

let fixture: LineageRankRedactionFixture

test.describe.configure({ mode: "serial" })

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function memberBRankSecrets(f: LineageRankRedactionFixture): string[] {
  // Only assert on fields that are UNIQUE to member-B's rank.
  // rankSystemName and disciplineName are shared with member-A and would
  // legitimately appear in the page via member-A's positive-control rendering.
  // The production payload only selects {id, name, shortName, colorHex} on
  // selectedRankAward.rank (apps/web/server/web/lineage/payloads.ts:289), so
  // rankName + rankShortName are sufficient leak indicators.
  return [f.memberB.rankName, f.memberB.rankShortName].filter(Boolean)
}

test.describe("Lineage public rank-redaction E2E", () => {
  test.beforeAll(async () => {
    fixture = await seedLineageRankRedactionFixture()
  })

  test.afterAll(async () => {
    if (fixture) await cleanupLineageRankRedactionFixture(fixture)
  })

  // Fresh context for both flows; the fixture's premium viewer exercises the
  // entitlement-gated drawer surface while preserving anonymous/free coverage in
  // public-visibility.spec.ts.
  test.use({ storageState: { cookies: [], origins: [] } })

  test("public drawer for showRanks=false member contains no rank text or metadata", async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await context.newPage()

    try {
      await createAuthenticatedSession(page, fixture.viewerUserId)
      // SESSION_0393: explorer is the default view now; pin to the board surface this spec asserts.
      await page.goto(`/lineage/${fixture.treeSlug}?view=board`)

      await expect(page.getByRole("heading", { name: fixture.treeName })).toBeVisible({
        timeout: 30_000,
      })

      // Sanity: both PUBLIC members are listed in the tree. Target the node-card button
      // specifically — the name also renders in the board/compact-list + honor-strip now
      // (Phase 3), so a bare getByText is ambiguous (strict-mode violation).
      await expect(
        page.getByRole("button", {
          name: new RegExp(`Open lineage profile for ${escapeRegExp(fixture.memberA.displayName)}`),
        }),
      ).toBeVisible()
      await expect(
        page.getByRole("button", {
          name: new RegExp(`Open lineage profile for ${escapeRegExp(fixture.memberB.displayName)}`),
        }),
      ).toBeVisible()

      // Open Member-B's drawer (the redaction case).
      await page
        .getByRole("button", {
          name: new RegExp(`Open lineage profile for ${escapeRegExp(fixture.memberB.displayName)}`),
        })
        .click()

      // Drawer opens ~1.6s after the tap (400ms open delay + path-trace) — give firefox
      // headroom on the dev-server cold-compile path, matching the 30s page-load wait above.
      await expect(page.getByRole("heading", { name: fixture.memberB.displayName })).toBeVisible({
        timeout: 15_000,
      })

      const drawerDialog = page.getByRole("dialog")
      await expect(drawerDialog).toBeVisible()

      // 1. No rank text from member-B's rankAwards appears in the drawer DOM.
      const secrets = memberBRankSecrets(fixture)
      for (const secret of secrets) {
        await expect(drawerDialog).not.toContainText(secret)
      }

      // 2. Open the Rank History tab — it must be empty (no awards rendered).
      //    The redaction strips rankAwards entirely, so the tab renders the
      //    "No rank history yet" empty state, NOT any award rows.
      await page.getByRole("tab", { name: "Rank History" }).click()
      await expect(drawerDialog.getByText("No rank history yet")).toBeVisible()

      for (const secret of secrets) {
        await expect(drawerDialog).not.toContainText(secret)
      }

      // 3. Raw HTML check — catches data rendered but visually hidden
      //    (display:none, aria-hidden, sr-only, etc).
      const html = await page.content()
      for (const secret of secrets) {
        expect(html).not.toContain(secret)
      }
    } finally {
      await context.close()
    }
  })

  test("public drawer for showRanks=true member DOES render rank text (positive control)", async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await context.newPage()

    try {
      await createAuthenticatedSession(page, fixture.viewerUserId)
      // SESSION_0393: explorer is the default view now; pin to the board surface this spec asserts.
      await page.goto(`/lineage/${fixture.treeSlug}?view=board`)
      await expect(page.getByRole("heading", { name: fixture.treeName })).toBeVisible({
        timeout: 30_000,
      })

      await page
        .getByRole("button", {
          name: new RegExp(`Open lineage profile for ${escapeRegExp(fixture.memberA.displayName)}`),
        })
        .click()

      await expect(page.getByRole("heading", { name: fixture.memberA.displayName })).toBeVisible({
        timeout: 15_000,
      })
      const drawerDialog = page.getByRole("dialog")
      await expect(drawerDialog).toBeVisible()

      // Member-A's rank label MUST appear — proves the redaction is targeted
      // and not a blanket break of rank rendering.
      await expect(drawerDialog).toContainText(fixture.memberA.rankName)

      await page.getByRole("tab", { name: "Rank History" }).click()
      await expect(drawerDialog.getByText("No rank history yet")).toHaveCount(0)
      await expect(drawerDialog).toContainText(fixture.memberA.rankName)
    } finally {
      await context.close()
    }
  })
})
