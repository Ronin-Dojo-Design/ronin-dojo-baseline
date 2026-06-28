/**
 * SESSION_0458 — one-shot render proof for /app/loop-board (Phase A read projection + carousel).
 * Not part of the standing suite intent (it hits live GitHub `main`); run on demand to prove an
 * admin sees the shared ledger board and the mobile carousel pager renders.
 */
import { expect, test } from "@playwright/test"
import { cleanupTestUser, createAuthenticatedUser } from "./helpers/auth"

// Local-only: this proof fetches the live `main` ledgers from GitHub, so it's not a
// deterministic CI gate. Run on demand (`bunx playwright test e2e/loop-board.proof.spec.ts`).
test.skip(!!process.env.CI, "render proof hits live GitHub main — local-only")

test("admin sees the shared ledger board (desktop + mobile carousel)", async ({ page }) => {
  test.setTimeout(120_000) // first route compile + live GitHub fetch
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  page.on("console", m => {
    if (m.type() === "error" || m.type() === "warning")
      consoleErrors.push(`[${m.type()}] ${m.text()}`)
  })
  page.on("pageerror", e => pageErrors.push(String(e)))

  const admin = await createAuthenticatedUser(page, {
    role: "admin",
    name: "Loop Board Proof Admin",
    email: `loop-board-proof+${Date.now()}@test.local`,
  })

  try {
    // Desktop
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto("/app/loop-board", { waitUntil: "domcontentloaded" })

    // Health strip + projected cards + workflow pager render.
    await expect(page.getByText(/\d+ open/).first()).toBeVisible({ timeout: 30_000 })
    await expect(page.getByRole("tab", { name: /Backlog/ })).toBeVisible()
    await expect(page.getByText("WL-P2-21").first()).toBeVisible()
    await page.screenshot({ path: "/tmp/loop-board-desktop.png", fullPage: false })

    // Mobile — the carousel: one column + peek, tappable pager, arrows.
    await page.setViewportSize({ width: 390, height: 844 })
    await page.reload({ waitUntil: "domcontentloaded" })
    await expect(page.getByRole("tab", { name: /In Progress/ })).toBeVisible({ timeout: 30_000 })
    // Wait for the client board to hydrate (a real card paints) before capturing.
    await expect(page.getByText("WL-P2-21").first()).toBeVisible({ timeout: 15_000 })
    await page.screenshot({ path: "/tmp/loop-board-mobile.png", fullPage: false })

    // Tap a pager chip → scrolls the rail to In Progress (FI-001 Brian Truelson card).
    await page.getByRole("tab", { name: /In Progress/ }).click()
    await expect(page.getByText(/Brian Truelson/).first()).toBeVisible({ timeout: 10_000 })
    await page.waitForTimeout(500)
    await page.screenshot({ path: "/tmp/loop-board-mobile-inprogress.png", fullPage: false })

    console.log("PAGE_ERRORS:", JSON.stringify(pageErrors))
    console.log("CONSOLE_ERRORS:", JSON.stringify(consoleErrors.slice(0, 15)))
  } finally {
    await cleanupTestUser(admin.userId)
  }
})
