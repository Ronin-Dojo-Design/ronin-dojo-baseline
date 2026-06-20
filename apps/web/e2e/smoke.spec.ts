import { expect, test } from "@playwright/test"

test("homepage loads", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveTitle(/.+/)
  await expect(page.locator("body")).toBeVisible()
})

test("right slide-in nav opens, navigates, and closes", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Open menu" }).click()

  const sheet = page.locator('[data-slot="sheet-content"][data-side="right"]')
  await expect(sheet).toBeVisible()
  await expect(sheet.getByRole("link", { name: "Lineage", exact: true })).toBeVisible()
  // SESSION_0418: the right-nav auth refactor made "Sign In" a button that opens the
  // LoginDialog modal (nav-sheet.tsx), not a link. Assert the button now.
  await expect(sheet.getByRole("button", { name: "Sign In" })).toBeVisible()

  await page.keyboard.press("Escape")
  await expect(sheet).not.toBeVisible()
})

test("directory filter sheet opens from the left", async ({ page }) => {
  await page.goto("/directory")
  await page.getByRole("button", { name: "Filters" }).click()

  const sheet = page.locator('[data-slot="sheet-content"][data-side="left"]')
  await expect(sheet).toBeVisible()

  await page.keyboard.press("Escape")
  await expect(sheet).not.toBeVisible()
})
