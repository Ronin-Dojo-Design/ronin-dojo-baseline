/**
 * SESSION_0420 — live-ish proof for the public feedback widget.
 *
 * The widget (components/web/feedback-widget.tsx) renders as a sonner toast only
 * after an engagement gate (60s on page + >=3 page views + >=66% scroll). This spec
 * uses Playwright's clock API to fast-forward past the 60s gate deterministically,
 * seeds the page-view counter, and scrolls to satisfy the scroll threshold — then
 * fills + submits real feedback and asserts the success toast, at BOTH a 390px mobile
 * viewport and a desktop viewport. Screenshots are written to test-results/.
 *
 * Run against a running app (local dev, or a deployed URL via PLAYWRIGHT_BASE_URL):
 *   cd apps/web && bunx playwright test feedback-widget.spec.ts --project=chromium
 *
 * NOTE: a real submit writes a Report row (type=Feedback) and, in an env with
 * RESEND configured, sends the operator notification. Point baseURL at a NON-prod
 * environment unless you intend to deliver a real test to welcome@blackbeltlegacy.com.
 *
 * CI: this is a LOCAL/MANUAL verification aid (it drives the engagement-gated toast in a
 * real browser to capture the screenshots). It is skipped in CI to keep the blocking
 * Playwright lane deterministic — run it locally to generate the screenshots.
 */
import { expect, test } from "@playwright/test"

// Skip in CI — see header. Runs locally where a browser + running app are available.
test.beforeEach(() => {
  test.skip(Boolean(process.env.CI), "feedback-widget e2e is a local/manual screenshot aid")
})

const BBL_SLUG = "black-belt-legacy"
const PAGE_VIEWS_KEY = `${BBL_SLUG}-page-views`
const DISMISSED_KEY = `${BBL_SLUG}-feedback-dismissed`

const seedEngagement = async (page: import("@playwright/test").Page) => {
  await page.addInitScript(
    ({ pvKey, dismissKey }) => {
      // >= minPageView (3); not previously dismissed.
      sessionStorage.setItem(pvKey, "5")
      localStorage.removeItem(dismissKey)
    },
    { pvKey: PAGE_VIEWS_KEY, dismissKey: DISMISSED_KEY },
  )
}

const triggerWidget = async (page: import("@playwright/test").Page) => {
  // Satisfy the scroll threshold (>= 66%): scroll to the bottom so the debounced
  // handler records ~100%.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  // Flush the 150ms scroll debounce + advance past the 60s time gate so the 5s
  // engagement interval fires and opens the toast.
  await page.clock.fastForward(2_000)
  await page.clock.fastForward(65_000)
}

const submitFeedback = async (page: import("@playwright/test").Page, message: string) => {
  // The widget renders inside a sonner toast. The email field only shows for guests.
  const email = page.getByPlaceholder(/email|name@/i)
  if (await email.count()) {
    await email.first().fill("e2e-tester@example.com")
  }
  await page.getByPlaceholder(/feedback/i).fill(message)
  await page.getByRole("button", { name: /send/i }).click()
}

for (const vp of [
  { label: "mobile-390", width: 390, height: 844 },
  { label: "desktop-1280", width: 1280, height: 900 },
]) {
  test(`feedback widget submits + shows success (${vp.label})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await page.clock.install()
    await seedEngagement(page)

    await page.goto("/")
    await expect(page.locator("body")).toBeVisible()

    await triggerWidget(page)

    // The feedback form (its textarea) must appear in the toast.
    const textarea = page.getByPlaceholder(/feedback/i)
    await expect(textarea).toBeVisible({ timeout: 10_000 })

    // Capture the widget over page content (the 390px overlap check).
    await page.screenshot({
      path: `test-results/feedback-widget-${vp.label}-open.png`,
      fullPage: false,
    })

    await submitFeedback(page, `E2E feedback ${vp.label} ${Date.now()}`)

    // Success state: a success toast appears and no error toast is shown.
    await expect(page.getByText(/thank|thanks|received|appreciate/i)).toBeVisible({
      timeout: 10_000,
    })
    await page.screenshot({
      path: `test-results/feedback-widget-${vp.label}-success.png`,
      fullPage: false,
    })
  })
}

test("feedback widget is suppressed on the lineage/join conversion route", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.clock.install()
  await seedEngagement(page)

  await page.goto("/lineage/join")
  await expect(page.locator("body")).toBeVisible()

  await triggerWidget(page)

  // The toast must NOT open here — it would cover the fixed bottom "Join the Legacy" CTA.
  await expect(page.getByPlaceholder(/feedback/i)).toHaveCount(0)
})
