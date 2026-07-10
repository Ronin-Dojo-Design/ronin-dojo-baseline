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
      await page.goto("/auth/login")

      await expect(page.getByRole("heading", { name: /sign in/i, level: 3 })).toBeVisible({
        timeout: 30_000,
      })
      await page.locator('input[name="email"]').fill(email)
      await page.getByRole("button", { name: /send me a magic link/i }).click()

      await expect(page).toHaveURL(url => {
        return url.pathname === "/auth/verify" && url.searchParams.get("email") === email
      })
      await expect(page.getByRole("heading", { name: /check your inbox/i })).toBeVisible()

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
