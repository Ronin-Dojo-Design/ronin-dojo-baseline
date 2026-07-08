/**
 * E2E: Admin Appearance editor (brand-settings) + runtime CSS injection
 *
 * Covers:
 * 1. Admin can navigate to /app/brand-settings (the single-brand "Appearance" editor)
 * 2. Admin can save BBL brand colors
 * 3. Runtime CSS injection applies saved colors on homepage
 *
 * @added SESSION_0292
 * @resolves D9
 * @updated SESSION_0511 — brand-settings was reframed to the single-brand "Appearance" editor
 *   (SESSION_0510): route /admin→/app, page heading "Brand Settings"→"Appearance", the per-brand
 *   "Black Belt Legacy" card collapsed to one "Theme" fieldset, toast "…settings saved"→"Appearance saved".
 */
import { expect, test } from "@playwright/test"
import { cleanupTestUser, createAuthenticatedUser } from "../helpers/auth"

let testUserId: string

test.describe("Admin brand-settings E2E", () => {
  test.setTimeout(120_000)

  test.afterAll(async () => {
    if (testUserId) {
      await cleanupTestUser(testUserId)
    }
  })

  test("admin can view the Appearance page (single BBL editor)", async ({ page }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    testUserId = userId

    await page.goto("/app/brand-settings")

    await expect(page.getByRole("heading", { name: "Appearance", level: 2 })).toBeVisible({
      timeout: 20_000,
    })

    // Single-brand collapse (SESSION_0447/0510): the 4-brand picker is now one BBL "Theme"
    // fieldset — the only section heading is "Theme", with a single Save button. The former
    // per-brand section headings (incl. Black Belt Legacy) are gone.
    await expect(page.getByRole("heading", { name: "Theme", level: 3 })).toBeVisible()
    for (const goneBrand of [
      "Baseline Martial Arts",
      "Ronin Dojo Design",
      "WEKAF USA",
      "Black Belt Legacy",
    ]) {
      await expect(page.getByRole("heading", { name: goneBrand, level: 3 })).toHaveCount(0)
    }

    const saveButtons = page.getByRole("button", { name: /save settings/i })
    await expect(saveButtons).toHaveCount(1)
  })

  test("admin can save BBL colors and see toast confirmation", async ({ page }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    testUserId = userId

    await page.goto("/app/brand-settings")
    await expect(page.getByRole("heading", { name: "Appearance", level: 2 })).toBeVisible({
      timeout: 20_000,
    })

    // The single "Theme" fieldset (single-brand collapse — no per-brand cards).
    const themeSection = page.locator("div.rounded-lg.border").filter({
      has: page.getByRole("heading", { name: "Theme", level: 3 }),
    })

    // Fill in primary color
    const primaryColorInput = themeSection.getByLabel("Primary Color")
    await primaryColorInput.fill("1 79% 51%")

    // Fill in accent color
    const accentColorInput = themeSection.getByLabel("Accent Color")
    await accentColorInput.fill("51 100% 50%")

    // Submit the form
    await themeSection.getByRole("button", { name: /save settings/i }).click()

    // Verify toast confirmation
    await expect(page.getByText("Appearance saved")).toBeVisible({
      timeout: 10_000,
    })
  })

  test("runtime CSS injection applies DB-driven brand colors", async ({ page }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    testUserId = userId

    // First, save a distinctive color via the Appearance editor
    await page.goto("/app/brand-settings")
    await expect(page.getByRole("heading", { name: "Appearance", level: 2 })).toBeVisible({
      timeout: 20_000,
    })

    const themeSection = page.locator("div.rounded-lg.border").filter({
      has: page.getByRole("heading", { name: "Theme", level: 3 }),
    })

    await themeSection.getByLabel("Primary Color").fill("120 50% 40%")
    await themeSection.getByRole("button", { name: /save settings/i }).click()
    await expect(page.getByText("Appearance saved")).toBeVisible({
      timeout: 10_000,
    })

    // Navigate to homepage — CSS injection should apply
    await page.goto("/")
    await page.waitForLoadState("domcontentloaded")

    // Check for injected <style> tag with our color
    const styleTag = page.locator("style")
    const styleCount = await styleTag.count()

    // At least one style tag should contain our injected color
    let foundInjectedColor = false
    for (let i = 0; i < styleCount; i++) {
      const content = await styleTag.nth(i).innerHTML()
      if (content.includes("120 50% 40%")) {
        foundInjectedColor = true
        break
      }
    }

    expect(foundInjectedColor).toBe(true)

    // Clean up — clear the color we set
    await page.goto("/app/brand-settings")
    await expect(page.getByRole("heading", { name: "Appearance", level: 2 })).toBeVisible({
      timeout: 20_000,
    })

    const cleanupSection = page.locator("div.rounded-lg.border").filter({
      has: page.getByRole("heading", { name: "Theme", level: 3 }),
    })
    await cleanupSection.getByLabel("Primary Color").fill("")
    await cleanupSection.getByRole("button", { name: /save settings/i }).click()
    await expect(page.getByText("Appearance saved")).toBeVisible({
      timeout: 10_000,
    })
  })
})
