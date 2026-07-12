import { expect, test } from "@playwright/test"
import { cleanupTestUser, createAuthenticatedUser } from "../helpers/auth"

// WL-P2-34 (ADR 0045): /app/claims, /app/organizations, /app/media migrated onto the ONE
// AdminCollection frame. FI-027 (SESSION_0530): /app/techniques is a SIBLING AdminCollection
// (staff-only, `techniques.manage` — the admin role's `"*"` wildcard passes the inline guard).
// Temporary conformance smoke — asserts each migrated route renders the shared DataTable frame
// (a <table>) under an admin session rather than crashing.
// Every test mints its own admin user; collect ALL ids so afterAll cleans up each one
// (a single shared `let` only ever teardowns the last, leaking the rest into the shared DB).
const createdUserIds: string[] = []

test.describe("AdminCollection conformance smoke", () => {
  test.afterAll(async () => {
    for (const id of createdUserIds) await cleanupTestUser(id)
  })

  for (const path of ["/app/claims", "/app/organizations", "/app/media", "/app/techniques"]) {
    test(`admin sees the AdminCollection table at ${path}`, async ({ page }) => {
      const { userId } = await createAuthenticatedUser(page, { role: "admin" })
      createdUserIds.push(userId)

      await page.goto(path)

      await expect(page.locator("table").first()).toBeVisible({ timeout: 30_000 })
      await expect(page.locator("body")).not.toContainText("404")
    })
  }

  // SESSION_0515 (Giddy MED): the claims/orgs `sort` param was a dead wire — the header rendered
  // sortable but the query hard-coded `orderBy`. Sort is now threaded through the query, so a
  // header sort must (a) write the `sort` param to the URL and (b) re-order rows server-side.
  test("sorting the Organizations table by name desc changes row order", async ({ page }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    createdUserIds.push(userId)

    await page.goto("/app/organizations")
    await expect(page.locator("table").first()).toBeVisible({ timeout: 30_000 })

    const firstCell = page.locator("tbody tr td:first-child").first()
    const bodyRows = page.locator("tbody tr")
    const rowCount = await bodyRows.count()

    const beforeFirst = await firstCell.innerText()

    // Open the "Organization" column header menu (the trigger's a11y name is the sort-state
    // sentence, so target the button carrying the visible column title) and choose Descending.
    await page.getByRole("button").filter({ hasText: "Organization" }).first().click()
    await page.getByRole("menuitem", { name: /sort descending/i }).click()

    // (a) the sort param is now in the URL, encoding a `name` desc sort.
    await expect(page).toHaveURL(/sort=.*name/)
    await expect(page).toHaveURL(/desc/)

    // (b) with ≥2 orgs the server re-orders, so the first row flips from the default `name asc`.
    if (rowCount >= 2) {
      await expect(firstCell).not.toHaveText(beforeFirst)
    }
  })
})
