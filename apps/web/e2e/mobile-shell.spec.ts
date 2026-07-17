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
 * Local/manual aid (skipped in CI). Run against the guarded E2E server on :3502:
 *   cd apps/web
 *   PORT=3502 bun run dev:e2e  # terminal 1
 *   PW_BASE_URL=http://localhost:3502 bun run test:e2e:local -- e2e/mobile-shell.spec.ts --project=chromium  # terminal 2
 */
import { expect, test } from "@playwright/test"
import { cleanupTestUser, createAuthenticatedUser, grantTestEntitlement } from "./helpers/auth"

test.beforeEach(async ({ page }) => {
  test.skip(Boolean(process.env.CI), "mobile-shell e2e is a local/manual screenshot aid")
  // The Next DEV overlay badge (<nextjs-portal>) floats bottom-left and intercepts taps on the
  // mobile-viewport fixed chrome (a pre-existing /lineage BottomNav hydration warning trips it —
  // see SESSION_0529 notes; not a shell regression). This spec only ever runs against dev
  // servers, so keep removing the overlay element (an injected <style> gets wiped when React
  // regenerates the document tree after the hydration mismatch; the portal itself is not
  // React-owned, so removal sticks until the overlay re-appends it).
  await page.addInitScript(() => {
    setInterval(() => {
      for (const portal of Array.from(document.querySelectorAll("nextjs-portal"))) {
        portal.remove()
      }
    }, 250)
  })
})

const MOBILE = { width: 390, height: 844 }
const DESKTOP = { width: 1280, height: 900 }
const SHOTS = "test-results/mobile-shell"

const MAB_TRIGGER = 'button[aria-label="Open create menu"]'

test.describe("Epic B mobile shell", () => {
  test("admin: 4-tab nav, always-on into /app, MAB drag/persist/toggle + bottom-sheet", async ({
    page,
  }) => {
    // SESSION_0529: the technique-action deep-link detour adds a dev-mode compile of /app/profile;
    // the default 30s budget was already tight for this long multi-step local aid.
    test.setTimeout(120_000)
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

      // Fan opens; 5 admin actions present (SESSION_0529 3B added "Add a technique"). NO in-fan
      // disable control (SESSION_0501: the EyeOff item masqueraded as an action — on/off lives on
      // the More drawer toggle).
      await mab.click()
      await expect(page.getByRole("button", { name: /create post/i })).toBeVisible()
      await expect(page.getByRole("button", { name: /upload photo or media/i })).toBeVisible()
      await expect(page.getByRole("button", { name: /log a promotion/i })).toBeVisible()
      await expect(page.getByRole("button", { name: /claim or verify/i })).toBeVisible()
      await expect(page.getByRole("button", { name: /add a technique/i })).toBeVisible()
      await expect(page.getByRole("button", { name: /hide the quick actions/i })).toHaveCount(0)
      // 5-item fan geometry (SESSION_0529): the count-scaled radius must keep every fan item fully
      // inside the viewport AND non-overlapping (adjacent centers ≥ 44px apart). Let the staggered
      // fan-out springs settle first — boundingBox mid-flight reads converging (smaller) distances.
      await page.waitForTimeout(900)
      {
        const names = [
          /claim or verify/i,
          /create post/i,
          /upload photo or media/i,
          /log a promotion/i,
          /add a technique/i,
        ]
        const centers: { x: number; y: number }[] = []
        for (const name of names) {
          const box = (await page.getByRole("button", { name }).boundingBox())!
          expect(box.x).toBeGreaterThanOrEqual(0)
          expect(box.y).toBeGreaterThanOrEqual(0)
          expect(box.x + box.width).toBeLessThanOrEqual(MOBILE.width)
          expect(box.y + box.height).toBeLessThanOrEqual(MOBILE.height)
          centers.push({ x: box.x + box.width / 2, y: box.y + box.height / 2 })
        }
        for (let i = 1; i < centers.length; i++) {
          const dx = centers[i].x - centers[i - 1].x
          const dy = centers[i].y - centers[i - 1].y
          expect(Math.hypot(dx, dy)).toBeGreaterThanOrEqual(44)
        }
      }
      await page.screenshot({ path: `${SHOTS}/admin-03-fan-open.png` })

      // The technique action deep-links to the profile Techniques tab with the authored-create
      // sheet auto-open (?tab=techniques&create=technique).
      await page.getByRole("button", { name: /add a technique/i }).click()
      await page.waitForURL(/\/app\/profile\?tab=techniques&create=technique/)
      await expect(page.getByRole("heading", { name: /^add a technique$/i })).toBeVisible()
      await page.screenshot({ path: `${SHOTS}/admin-03b-technique-sheet.png` })
      await page.keyboard.press("Escape")
      await page.goto("/lineage")
      await mab.click()

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

      // Toggle OFF via the "More" drawer switch (SESSION_0501: disable AND re-enable both
      // live on the drawer's MabToggle) → MAB gone → persists across reload. The "More"
      // tab's accessible name is its aria-label ("Open menu"), not its visible "More" text.
      const nav2 = page.getByRole("navigation", { name: /browse/i }).last()
      await nav2.getByRole("button", { name: /open menu/i }).click()
      await page.getByRole("switch", { name: /quick actions button/i }).click()
      await page.keyboard.press("Escape")
      await expect(page.locator(MAB_TRIGGER)).toHaveCount(0)
      const enabled = await page.evaluate(() => localStorage.getItem("bbl.mab.enabled"))
      expect(enabled).toBe("0")
      await page.reload()
      await expect(page.locator(MAB_TRIGGER)).toHaveCount(0)
      await page.screenshot({ path: `${SHOTS}/admin-06-toggled-off.png` })

      // Re-enable via the same drawer toggle → MAB returns.
      const nav3 = page.getByRole("navigation", { name: /browse/i }).last()
      await nav3.getByRole("button", { name: /open menu/i }).click()
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

  test("elite non-admin: MAB two-action fan (post + technique) + full authored create round-trip (SESSION_0529 3B, FI-028)", async ({
    page,
  }) => {
    // The round-trip compiles /app/profile + fires several server actions on a dev server.
    test.setTimeout(120_000)
    page.setViewportSize(MOBILE)
    const elite = await createAuthenticatedUser(page, { role: "user", name: "MAB Elite" })

    try {
      // Elite entitlement (LINEAGE_ELITE) passes BOTH `canCreateTechniqueForUser` (AUTHOR techniques)
      // and — SESSION_0535 FI-028 — `canCreateCommunityPostForUser` (any lineage tier CREATEs posts),
      // so the MAB mounts for this NON-admin with a TWO-action fan (post + technique). The three
      // remaining B1 actions (upload / promotion / claim) stay admin-gated.
      grantTestEntitlement(elite.userId, "LINEAGE_ELITE", "BBL")

      await page.goto("/lineage")
      const mab = page.locator(MAB_TRIGGER)
      await expect(mab).toBeVisible()
      await mab.click()

      await expect(page.getByRole("button", { name: /add a technique/i })).toBeVisible()
      // FI-028: an Elite member is now post-capable, so "create post" IS in the fan (it was
      // admin-only before this session).
      await expect(page.getByRole("button", { name: /create post/i })).toBeVisible()
      await expect(page.getByRole("button", { name: /upload photo or media/i })).toHaveCount(0)
      await expect(page.getByRole("button", { name: /log a promotion/i })).toHaveCount(0)
      await expect(page.getByRole("button", { name: /claim or verify/i })).toHaveCount(0)
      await page.screenshot({ path: `${SHOTS}/elite-01-two-action-fan.png` })

      // Deep-link lands on the Techniques tab with the authored-create sheet open.
      await page.getByRole("button", { name: /add a technique/i }).click()
      await page.waitForURL(/\/app\/profile\?tab=techniques&create=technique/)
      await expect(page.getByRole("heading", { name: /^add a technique$/i })).toBeVisible()
      await page.screenshot({ path: `${SHOTS}/elite-02-technique-sheet.png` })

      // Round-trip step 1 — details: fill the authored form (no organization field involved).
      await page.getByPlaceholder("Arm Bar").fill("Flying Triangle E2E")
      await page.getByPlaceholder("arm-bar").fill(`flying-triangle-e2e-${Date.now()}`)
      await page.getByText("Select discipline").click()
      await page.getByRole("option").first().click()
      await page.getByRole("button", { name: /create technique/i }).click()

      // Step 2 — media: the sheet advances IN PLACE to the clip manager. No R2 upload row for
      // members (URL-paste only).
      await expect(
        page.getByRole("heading", { name: /add videos — flying triangle e2e/i }),
      ).toBeVisible()
      await expect(page.getByRole("button", { name: /^upload$/i })).toHaveCount(0)
      await page
        .getByPlaceholder("Paste a YouTube link")
        .fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
      await page.getByRole("button", { name: /add video/i }).click()

      // The clip tile lands FREE by default; flip it premium via the per-clip toggle.
      const freeToggle = page.getByRole("button", { name: /^free$/i })
      await expect(freeToggle).toBeVisible()
      await page.screenshot({ path: `${SHOTS}/elite-03-clip-added-free.png` })
      await freeToggle.click()
      await expect(page.getByRole("button", { name: /^premium$/i })).toBeVisible()
      await page.screenshot({ path: `${SHOTS}/elite-04-clip-premium.png` })

      // Done → the sheet closes and the techniques list shows the new authored row. Programmatic
      // click: the Next DEV overlay badge (<nextjs-portal>, tripped by the pre-existing /lineage
      // BottomNav hydration warning) overlaps this corner and intercepts the pointer hit-test.
      await page
        .getByRole("button", { name: /^done$/i })
        .evaluate(el => (el as HTMLElement).click())
      await expect(page.getByRole("heading", { name: /add videos/i })).toHaveCount(0)
      await expect(page.getByRole("link", { name: "Flying Triangle E2E" })).toBeVisible()
      await page.screenshot({ path: `${SHOTS}/elite-05-technique-in-list.png` })

      // SESSION_0529 review fix (Doug P2-3): the community feed's mobile create-post FAB hides
      // whenever the MAB mounts for the viewer — this Elite member has the MAB, so /posts must
      // show exactly ONE floating create affordance (the MAB), never the buried twin. The FAB is
      // the ONLY button with aria-label "New post" (the header + empty-state CTAs are visible-text
      // buttons and legitimately remain).
      await page.goto("/posts")
      await expect(page.locator(MAB_TRIGGER)).toBeVisible()
      await expect(page.locator('button[aria-label="New post"]')).toHaveCount(0)
      await page.screenshot({ path: `${SHOTS}/elite-06-posts-single-fab.png` })
    } finally {
      await cleanupTestUser(elite.userId)
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
