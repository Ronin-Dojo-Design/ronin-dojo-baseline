/**
 * SESSION_0461 (G-003) — loop-board Phase B proof: the board is now EDITABLE + DB-backed, and the
 * retired localStorage AdminTaskBoard migrates into it. Local-only (hits live GitHub `main` for the
 * ledger sync + writes `KanbanCard` rows to the local prodsnap); not a deterministic CI gate.
 * Run on demand: `PW_BASE_URL=http://localhost:PORT bunx playwright test e2e/loop-board.proof.spec.ts`.
 */
import { expect, test } from "@playwright/test"
import { cleanupTestUser, createAuthenticatedUser } from "./helpers/auth"

test.skip(!!process.env.CI, "proof hits live GitHub main + writes the local DB — local-only")

// Run serially (shared board / configId) so the two specs don't race on the same rows.
test.describe.configure({ mode: "serial" })

const STAMP = Date.now()

test("editable board: a quick-added card moves + persists across reload", async ({ page }) => {
  test.setTimeout(120_000) // first route compile + live GitHub fetch + DB sync
  const pageErrors: string[] = []
  page.on("pageerror", e => pageErrors.push(String(e)))

  const admin = await createAuthenticatedUser(page, {
    role: "admin",
    name: "Loop Board Phase B Admin",
    email: `loop-board-pb+${STAMP}@test.local`,
  })
  const title = `PHASE-B-PROOF ${STAMP}`

  try {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto("/app/loop-board", { waitUntil: "domcontentloaded" })

    // Board hydrated (a real ledger card painted) — and EDITABLE (quick-add affordance present).
    await expect(page.getByText("WL-P2-21").first()).toBeVisible({ timeout: 45_000 })
    const backlog = page.locator('[data-stage="backlog"]')
    await backlog.getByRole("button", { name: /quick add/i }).click()
    const input = backlog.getByRole("textbox", { name: /Quick add to Backlog/i })
    await input.fill(title)
    await input.press("Enter")
    // The fresh card is the newest in Backlog → top → its move-menu is the first select in the column.
    await expect(backlog.getByText(title)).toBeVisible({ timeout: 10_000 })

    // MOVE it to In Progress (before any reload, while it is reliably the top card).
    await backlog
      .locator('select[aria-label="Move card to stage"]')
      .first()
      .selectOption({ label: "In Progress" })
    const inProgress = page.locator('[data-stage="in-progress"]')
    await expect(inProgress.getByText(title)).toBeVisible({ timeout: 10_000 })

    // PERSISTS: flush the debounced save, reload → the card is STILL in In Progress (create + move stuck).
    await page.waitForTimeout(1200) // > the 400ms save debounce
    await page.reload({ waitUntil: "domcontentloaded" })
    await expect(page.getByText("WL-P2-21").first()).toBeVisible({ timeout: 45_000 }) // board rehydrated
    await expect(page.locator('[data-stage="in-progress"]').getByText(title)).toBeVisible({
      timeout: 15_000,
    })

    expect(pageErrors, `page errors: ${JSON.stringify(pageErrors)}`).toHaveLength(0)
  } finally {
    await cleanupTestUser(admin.userId)
  }
})

test("localStorage AdminTaskBoard tasks migrate into the board", async ({ page }) => {
  test.setTimeout(120_000)

  const admin = await createAuthenticatedUser(page, {
    role: "admin",
    name: "Loop Board Migration Admin",
    email: `loop-board-mig+${STAMP}@test.local`,
  })
  const migratedTitle = `MIGRATED-TASK ${STAMP}`
  const taskId = `mig-${STAMP}`

  try {
    await page.setViewportSize({ width: 1280, height: 900 })
    // First visit establishes the origin (and runs the migration once over empty storage → sets the flag).
    await page.goto("/app/loop-board", { waitUntil: "domcontentloaded" })
    await expect(page.getByText("WL-P2-21").first()).toBeVisible({ timeout: 45_000 })

    // Seed the retired board's localStorage ONCE and clear the one-time flag (a single fixed task id).
    await page.evaluate(
      ([key, flag, id, t]) => {
        window.localStorage.setItem(
          key,
          JSON.stringify({
            projects: [{ id: "inbox", name: "Inbox" }],
            tasks: [
              {
                id,
                project: "inbox",
                title: t,
                done: false,
                status: "active",
                createdAt: "2026-01-01T00:00:00.000Z",
              },
            ],
          }),
        )
        window.localStorage.removeItem(flag)
      },
      ["bbl_admin_taskboard_v1", "bbl_loopboard_tasks_imported_v1", taskId, migratedTitle],
    )

    // Reload → the client migration imports the task then reloads once; the migrated card surfaces.
    await page.reload({ waitUntil: "domcontentloaded" })
    await expect(page.getByText(migratedTitle).first()).toBeVisible({ timeout: 45_000 })

    // Persisted: a manual reload (flag now set → no re-import) still shows it.
    await page.reload({ waitUntil: "domcontentloaded" })
    await expect(page.getByText(migratedTitle).first()).toBeVisible({ timeout: 30_000 })
  } finally {
    await cleanupTestUser(admin.userId)
  }
})
