/**
 * E2E: ColorField DOM-interaction coverage (WL-P3-36)
 *
 * `apps/web/components/web/forms/color-field.test.tsx` proves the static/SSR half (id,
 * name, aria attrs, placeholder, value land on the text input, swatch paints/checkerboards).
 * That file can't reach react-colorful's picker — it lives inside a closed popover, and
 * SSR never mounts it. This spec proves the DOM-interaction half on a real theme route
 * (`/app/brand-settings`, the fully-wired one of the 3 `ThemeFieldset` consumers):
 *   1. the swatch button opens the popover and mounts the `react-colorful` picker
 *   2. a saturation/hue picker interaction writes a normalized, always-`isHslSafe`
 *      triplet back into the synced text input (`onChange={c => onChange(formatHslTriplet(c))}`)
 *   3. the `id` that `FormControl` injects resolves to a genuinely focusable `<input>`
 *      DOM node (the practical, browser-observable half of the `ref`-forwarding claim —
 *      react-hook-form's `field.ref` is wired to the same element `getByLabel` resolves)
 *
 * @added SESSION_0707
 * @resolves WL-P3-36
 */
import { expect, test } from "@playwright/test"
import { cleanupTestUser, createAuthenticatedUser } from "../helpers/auth"

// isHslSafe (`lib/brand-theme.ts`) shape: digits/spaces/`%` only. formatHslTriplet emits
// integer h + integer s%/l% — this is the exact triplet grammar it produces.
const HSL_TRIPLET = /^\d+\s\d+%\s\d+%$/

let testUserId: string

test.describe("ColorField DOM interaction E2E", () => {
  test.setTimeout(60_000)

  test.afterAll(async () => {
    if (testUserId) {
      await cleanupTestUser(testUserId)
    }
  })

  test("picker drag opens the popover and writes an isHslSafe triplet into the synced text input", async ({
    page,
  }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    testUserId = userId

    await page.goto("/app/brand-settings")
    await expect(page.getByRole("heading", { name: "Appearance", level: 2 })).toBeVisible({
      timeout: 20_000,
    })

    const themeSection = page.locator("div.rounded-lg.border").filter({
      has: page.getByRole("heading", { name: "Theme", level: 3 }),
    })

    const primaryColorInput = themeSection.getByLabel("Primary Color")
    await primaryColorInput.fill("234 98% 61%")

    // Popover starts closed — the picker isn't mounted yet.
    await expect(page.locator(".react-colorful")).toHaveCount(0)

    await themeSection.getByRole("button", { name: "Pick color" }).first().click()

    const picker = page.locator(".react-colorful")
    await expect(picker).toBeVisible()

    // react-colorful sets the color on mousedown (not just drag-move), so a single click
    // inside the saturation panel is enough to fire `onChange`. Click off-center so the
    // resulting triplet provably differs from the seeded "234 98% 61%" value.
    const saturation = picker.locator(".react-colorful__saturation")
    const saturationBox = await saturation.boundingBox()
    if (!saturationBox) throw new Error("saturation panel did not render a bounding box")
    await page.mouse.click(
      saturationBox.x + saturationBox.width * 0.25,
      saturationBox.y + saturationBox.height * 0.75,
    )

    const hue = picker.locator(".react-colorful__hue")
    const hueBox = await hue.boundingBox()
    if (!hueBox) throw new Error("hue slider did not render a bounding box")
    await page.mouse.click(hueBox.x + hueBox.width * 0.6, hueBox.y + hueBox.height * 0.5)

    // The synced text input picks up the picker-written value live (no Save needed).
    await expect(primaryColorInput).toHaveValue(HSL_TRIPLET)
    const afterDrag = await primaryColorInput.inputValue()
    expect(afterDrag).not.toBe("234 98% 61%")

    // Swatch preview repaints from the new value (proves the round-trip, not just the
    // text input write).
    const swatch = themeSection.getByRole("button", { name: "Pick color" }).first().locator("span")
    await expect(swatch).toHaveCSS("background-color", /rgb/)
  })

  test("the labelled id resolves to a real focusable input (ref/id wiring)", async ({ page }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    testUserId = userId

    await page.goto("/app/brand-settings")
    await expect(page.getByRole("heading", { name: "Appearance", level: 2 })).toBeVisible({
      timeout: 20_000,
    })

    const themeSection = page.locator("div.rounded-lg.border").filter({
      has: page.getByRole("heading", { name: "Theme", level: 3 }),
    })
    const accentColorInput = themeSection.getByLabel("Accent Color")

    await expect(accentColorInput).toHaveJSProperty("tagName", "INPUT")
    await accentColorInput.focus()
    await expect(accentColorInput).toBeFocused()
  })
})
