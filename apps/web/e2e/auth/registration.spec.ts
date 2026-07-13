import { expect, test } from "@playwright/test"
import {
  cleanupTestUserByEmail,
  getMagicLinkToken,
  type RegisteredUserShell,
  readRegisteredUserByEmail,
} from "../helpers/auth"

test.describe("Registration E2E (magic-link member front door)", () => {
  test.setTimeout(90_000)

  test("new visitor can request a magic link, verify it, and land on Passport", async ({
    page,
  }) => {
    const email = `e2e-registration-${Date.now()}-${test.info().workerIndex}@example.com`
    let registeredUser: RegisteredUserShell | null = null

    await cleanupTestUserByEmail(email)

    try {
      // A freshly-registered user has an incomplete Passport, so /app/profile auto-opens the
      // profile-enhancement wizard — a MODAL that covers the "My Passport" landmark this test asserts
      // below (a historical flake: the dialog raced the landing assertion). Pre-seed the same
      // "onboarding seen" localStorage flags the authenticated helper sets (auth.ts `setSessionCookie`)
      // so the dialog never ambushes the assertion. `addInitScript` runs before every navigation, so it
      // is in place when /app/profile loads. Behavior-preserving — a returning user wouldn't see it.
      await page.addInitScript(() => {
        try {
          window.localStorage.setItem("bbl:onboarding:dashboard:v1", "done")
          window.localStorage.setItem("bbl:onboarding:profile:v1", "done")
        } catch {
          // Storage unavailable on the very first about:blank paint — the next navigation re-runs this.
        }
      })

      await page.goto("/auth/login")

      await expect(page.getByRole("heading", { name: /sign in/i, level: 3 })).toBeVisible({
        timeout: 30_000,
      })

      const emailInput = page.locator('input[name="email"]')
      await expect(emailInput).toBeVisible()
      await emailInput.fill(email)

      const submit = page.getByRole("button", { name: /send me a magic link/i })
      await submit.click()

      // The submit is a CLIENT handler (RHF → `router.push` on success). The historical flake: a COLD
      // magic-link mutation resolves slower than the default 5s expect budget, so the assertion timed
      // out before the client nav landed (self-recovers on retry once warm). Wait up to 45s for the nav
      // to /auth/verify — a deterministic wait that resolves the instant the URL changes, not a blind
      // sleep. (The mutation always fires: the earlier failure snapshots all show /auth/verify reached.)
      await expect(page).toHaveURL(/\/auth\/verify(\?|$)/, { timeout: 45_000 })

      // The verify page echoes the address the link was sent to — confirms the right email flowed.
      await expect(page.getByRole("heading", { name: /check your inbox/i })).toBeVisible()
      await expect(page.getByText(email).first()).toBeVisible()

      let token: string | null = null
      await expect(async () => {
        token = getMagicLinkToken(email)
        expect(token).toBeTruthy()
      }).toPass({ timeout: 30_000 })

      await page.goto(`/api/auth/magic-link/verify?token=${token}&callbackURL=/app/profile`)
      await expect(page).toHaveURL(url => url.pathname === "/app/profile", { timeout: 30_000 })
      // SESSION_0522 step 5: `/me` is retired; the canonical authenticated member workspace is
      // `/app/profile`. Confirm arrival via the stable "My Passport" Quick Links landmark (the
      // page Intro title is dynamic), which is unique on that page.
      await expect(page.getByRole("link", { name: "My Passport" })).toBeVisible({
        timeout: 30_000,
      })

      await expect(async () => {
        registeredUser = readRegisteredUserByEmail(email)
        expect(registeredUser).toMatchObject({
          email,
          emailVerified: true,
        })
        expect(registeredUser?.directorySlug).toBeTruthy()
        expect(registeredUser?.sessionCount).toBeGreaterThan(0)
      }).toPass({ timeout: 30_000 })
    } finally {
      await cleanupTestUserByEmail(email)
    }
  })
})
