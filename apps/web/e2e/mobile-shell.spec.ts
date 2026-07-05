/**
 * SESSION_0500 (Epic B, v2) — mobile-viewport proof for the bottom nav + radial MAB.
 *
 * Verifies at a 390px mobile viewport:
 *  - Bottom nav is LOGGED-IN-only: a signed-in member sees it; a logged-out visitor does NOT.
 *  - 4 tabs — Lineage · Directory · Posts · Profile (no Dashboard tab; the "Posts" tab reads
 *    "Posts", not "Community"). Active-route highlight tracks the current section.
 *  - Always-on across layouts: the nav stays present walking from a `(web)` page INTO `/app`.
 *  - ADMIN sees the movable radial MAB; a NON-ADMIN does NOT.
 *  - MAB fan opens; drag repositions + snaps to a corner; the position + toggle-off persist
 *    across reload (localStorage). The Upload action opens the bottom-sheet.
 *  - Desktop viewport hides both the bottom nav and the MAB.
 *
 * Local/manual aid (skipped in CI). Run against the Epic B dev server on :3502:
 *   cd apps/web && PW_BASE_URL=http://localhost:3502 bunx playwright test mobile-shell.spec.ts --project=chromium
 */
import { expect, test } from "@playwright/test"
import { cleanupTestUser, createAuthenticatedUser } from "./helpers/auth"

test.beforeEach(() => {
  test.skip(Boolean(process.env.CI), "mobile-shell e2e is a local/manual screenshot aid")
})

const MOBILE = { width: 390, height: 844 }
const DESKTOP = { width: 1280, height: 900 }
const SHOTS = "test-results/mobile-shell"

const MAB_TRIGGER = 'button[aria-label="Open create menu"]'

test.describe("Epic B mobile shell", () => {
  test("admin: 4-tab nav, always-on into /app, MAB drag/persist/toggle + bottom-sheet", async ({
    page,
  }) => {
    page.setViewportSize(MOBILE)
    const admin = await createAuthenticatedUser(page, { role: "admin", name: "MAB Admin" })

    try {
      await page.goto("/lineage")
      // Bottom nav present (mobile, signed-in).
      const nav = page.getByRole("navigation", { name: /browse/i }).last()
      await expect(nav).toBeVisible()

      // Exactly 4 tabs — Lineage · Directory · Posts · Profile (no Dashboard) — plus "More".
      await expect(nav.getByRole("link", { name: /lineage/i })).toBeVisible()
      await expect(nav.getByRole("link", { name: /directory/i })).toBeVisible()
      await expect(nav.getByRole("link", { name: /^posts$/i })).toBeVisible()
      await expect(nav.getByRole("link", { name: /profile/i })).toBeVisible()
      await expect(nav.getByRole("link", { name: /dashboard/i })).toHaveCount(0)
      await expect(nav.getByRole("link")).toHaveCount(4)
      // The Posts tab reads "Posts", NOT "Community".
      await expect(nav.getByText(/community/i)).toHaveCount(0)
      // Active-route highlight: Lineage tab is aria-current on /lineage.
      await expect(nav.getByRole("link", { name: /lineage/i })).toHaveAttribute(
        "aria-current",
        "page",
      )

      // MAB present for admin.
      const mab = page.locator(MAB_TRIGGER)
      await expect(mab).toBeVisible()
      await page.screenshot({ path: `${SHOTS}/admin-01-nav-and-mab.png` })

      // Always-on across layouts: navigate into the `/app` console → nav is STILL present, and
      // the Profile tab now highlights. The `/app` icon rail is demoted (this is the ONE nav).
      await nav.getByRole("link", { name: /profile/i }).click()
      await page.waitForURL(/\/app\/profile/)
      const appNav = page.getByRole("navigation", { name: /browse/i }).last()
      await expect(appNav).toBeVisible()
      await expect(appNav.getByRole("link", { name: /profile/i })).toHaveAttribute(
        "aria-current",
        "page",
      )
      await page.screenshot({ path: `${SHOTS}/admin-02-nav-persists-in-app.png` })

      // Back to a `(web)` page for the MAB interaction proof.
      await page.goto("/lineage")

      // Fan opens; 4 admin actions present.
      await mab.click()
      await expect(page.getByRole("button", { name: /create post/i })).toBeVisible()
      await expect(page.getByRole("button", { name: /upload photo or media/i })).toBeVisible()
      await expect(page.getByRole("button", { name: /log a promotion/i })).toBeVisible()
      await expect(page.getByRole("button", { name: /claim or verify/i })).toBeVisible()
      await page.screenshot({ path: `${SHOTS}/admin-03-fan-open.png` })

      // Upload → bottom-sheet.
      await page.getByRole("button", { name: /upload photo or media/i }).click()
      await expect(page.getByRole("button", { name: /^upload media$/i })).toBeVisible()
      await page.screenshot({ path: `${SHOTS}/admin-04-upload-sheet.png` })
      await page.keyboard.press("Escape")

      // Drag the FAB from bottom-right toward the top-left, then reload → corner persists.
      // motion's `drag` listens on Pointer Events, so drive an explicit pointer sequence
      // (mouse.* alone doesn't cross motion's drag threshold reliably headless).
      const box = (await mab.boundingBox())!
      const startX = box.x + box.width / 2
      const startY = box.y + box.height / 2
      await page.mouse.move(startX, startY)
      await page.dispatchEvent(MAB_TRIGGER, "pointerdown", {
        pointerId: 1,
        button: 0,
        clientX: startX,
        clientY: startY,
        isPrimary: true,
      })
      await page.mouse.down()
      for (let i = 1; i <= 16; i++) {
        const x = startX + (60 - startX) * (i / 16)
        const y = startY + (120 - startY) * (i / 16)
        await page.mouse.move(x, y)
        await page.waitForTimeout(12)
      }
      await page.mouse.up()
      await page.waitForTimeout(500)
      const corner = await page.evaluate(() => localStorage.getItem("bbl.mab.corner"))
      expect(corner).toBe("top-left")
      await page.reload()
      await expect(page.locator(MAB_TRIGGER)).toBeVisible()
      await page.screenshot({ path: `${SHOTS}/admin-05-dragged-topleft-persist.png` })

      // Toggle OFF via the FAB's disable affordance → MAB gone → persists across reload.
      await page.locator(MAB_TRIGGER).click()
      await page.getByRole("button", { name: /hide the quick actions button/i }).click()
      await expect(page.locator(MAB_TRIGGER)).toHaveCount(0)
      const enabled = await page.evaluate(() => localStorage.getItem("bbl.mab.enabled"))
      expect(enabled).toBe("0")
      await page.reload()
      await expect(page.locator(MAB_TRIGGER)).toHaveCount(0)
      await page.screenshot({ path: `${SHOTS}/admin-06-toggled-off.png` })

      // Re-enable via the "More" drawer toggle → MAB returns. The "More" tab's accessible
      // name is its aria-label ("Open menu"), not its visible "More" text.
      const nav2 = page.getByRole("navigation", { name: /browse/i }).last()
      await nav2.getByRole("button", { name: /open menu/i }).click()
      await page.getByRole("switch", { name: /quick actions button/i }).click()
      await page.keyboard.press("Escape")
      await expect(page.locator(MAB_TRIGGER)).toBeVisible()

      // Desktop hides both.
      page.setViewportSize(DESKTOP)
      await page.goto("/lineage")
      await expect(page.locator(MAB_TRIGGER)).toBeHidden()
      await expect(page.getByRole("navigation", { name: /browse/i }).last()).toBeHidden()
      await page.screenshot({ path: `${SHOTS}/admin-07-desktop-hidden.png` })
    } finally {
      await cleanupTestUser(admin.userId)
    }
  })

  test("non-admin: 4-tab nav but NO MAB", async ({ page }) => {
    page.setViewportSize(MOBILE)
    const member = await createAuthenticatedUser(page, { role: "user", name: "MAB Member" })

    try {
      await page.goto("/directory")
      const nav = page.getByRole("navigation", { name: /browse/i }).last()
      await expect(nav).toBeVisible()
      // Signed-in member gets the 4-tab set. Active Directory tab is highlighted.
      await expect(nav.getByRole("link")).toHaveCount(4)
      await expect(nav.getByRole("link", { name: /^posts$/i })).toBeVisible()
      await expect(nav.getByRole("link", { name: /profile/i })).toBeVisible()
      await expect(nav.getByRole("link", { name: /dashboard/i })).toHaveCount(0)
      await expect(nav.getByRole("link", { name: /directory/i })).toHaveAttribute(
        "aria-current",
        "page",
      )
      // But NO MAB (member is not an admin).
      await expect(page.locator(MAB_TRIGGER)).toHaveCount(0)
      await page.screenshot({ path: `${SHOTS}/member-01-nav-no-mab.png` })
    } finally {
      await cleanupTestUser(member.userId)
    }
  })

  test("logged-out: NO bottom nav (member chrome)", async ({ page }) => {
    page.setViewportSize(MOBILE)

    // No auth cookie — a guest. The bottom nav is member chrome; it must not render.
    await page.goto("/lineage")
    // Give useSession a beat to resolve to signed-out.
    await page.waitForTimeout(500)
    await expect(page.getByRole("navigation", { name: /browse/i })).toHaveCount(0)
    // The MAB (admin-only) is likewise absent.
    await expect(page.locator(MAB_TRIGGER)).toHaveCount(0)
    await page.screenshot({ path: `${SHOTS}/guest-01-no-nav.png` })
  })
})
