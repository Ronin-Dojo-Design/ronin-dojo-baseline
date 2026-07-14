import { expect, type Page, test } from "@playwright/test"
import { cleanupTestUser, createAuthenticatedUser, createTestUser } from "../helpers/auth"

/**
 * WL-P2-62 — the durable authz net for the extracted `AccountActionItems` fragment
 * (AC-ECOSYSTEM-2, SESSION_0534). The `/app/users` list row kebab (`person-actions.tsx`) and the
 * detail account panel (`user-actions.tsx`) both render the SAME shared fragment, so pinning the
 * LIST surface pins the fragment — the detail panel needs no separate coverage.
 *
 * The contract under test is the `!isAdmin(user)` gate that survived the extraction:
 *   · a non-admin account  → Ban + Revoke Sessions in the kebab, and a sibling Delete button.
 *   · an admin account (non-self) → Role + Revoke only; NEVER Ban, NEVER a Delete button
 *     ("Admin rows are never bannable").
 *
 * Hermetic (FS-0031): mints its own acting admin + two targets (Passport/DirectoryProfile-linked so
 * they render on the Passport-keyed list), finds each row by the seeded name (never by position),
 * and tears down every seeded row in `afterAll`.
 */
const createdUserIds: string[] = []

test.describe("/app/users account row-actions — isAdmin gating", () => {
  // `/app/users` is a heavy admin route that NO sibling spec warms, so on CI's cold, slower runner its
  // first Turbopack compile can outlast the row-visibility wait — the intermittent red that bit
  // SESSION_0534 (line-42/47 timeouts, different points across retries = a timing race, not a logic
  // bug). Give the whole test a generous ceiling; the per-step budgets below do the real work.
  test.setTimeout(180_000)

  test.afterAll(async () => {
    for (const id of createdUserIds) await cleanupTestUser(id)
  })

  /**
   * Open the Passport-keyed list filtered to a seeded row and return that row. `waitUntil: "commit"`
   * resolves as soon as the document response starts, so a cold `/app/users` compile is absorbed by
   * the goto's own 120s budget instead of racing the row wait; then poll for the seeded row (found by
   * its unique name, never by position) with a generous deterministic timeout.
   */
  const openSeededRow = async (page: Page, name: string) => {
    await page.goto(`/app/users?displayName=${encodeURIComponent(name)}`, {
      waitUntil: "commit",
      timeout: 120_000,
    })
    const row = page.getByRole("row").filter({ hasText: name }).first()
    await expect(row).toBeVisible({ timeout: 90_000 })
    return row
  }

  test("non-admin target is bannable + deletable; admin target is neither", async ({ page }) => {
    // Acting admin — the repo-standard fixture sets the Better-Auth session cookie on this context.
    const admin = await createAuthenticatedUser(page, { role: "admin" })
    createdUserIds.push(admin.userId)

    // Distinct `wl-p2-62-` names → each row is found by a unique cell, and the hermeticity check can
    // count exactly these rows. `createTestUser` seeds User + Passport + DirectoryProfile.
    const tag = Date.now().toString(36)
    const nonAdmin = await createTestUser({ role: "user", name: `wl-p2-62-nonadmin-${tag}` })
    createdUserIds.push(nonAdmin.userId)
    const adminTarget = await createTestUser({ role: "admin", name: `wl-p2-62-admin-${tag}` })
    createdUserIds.push(adminTarget.userId)

    // ---- non-admin target: kebab exposes Ban + Revoke; sibling Delete button present ----
    // Every visibility assertion carries an explicit generous timeout — the default expect budget is
    // 5s (playwright.config sets no `expect.timeout`), which is what raced the Delete render on CI.
    const nonAdminRow = await openSeededRow(page, nonAdmin.name)
    await nonAdminRow.getByRole("button", { name: "Open menu" }).click()
    await expect(page.getByRole("menuitem", { name: "Ban" })).toBeVisible({ timeout: 30_000 })
    await expect(page.getByRole("menuitem", { name: "Revoke Sessions" })).toBeVisible({
      timeout: 30_000,
    })
    await page.keyboard.press("Escape")
    await expect(nonAdminRow.getByRole("button", { name: "Delete" })).toBeVisible({
      timeout: 30_000,
    })

    // ---- admin target (non-self): Role + Revoke, but NO Ban and NO Delete ----
    const adminRow = await openSeededRow(page, adminTarget.name)
    await adminRow.getByRole("button", { name: "Open menu" }).click()
    // Confirm the menu actually rendered (Role visible) BEFORE asserting Ban's absence, so `toHaveCount(0)`
    // can't pass merely because the menu hasn't painted yet.
    await expect(page.getByRole("menuitem", { name: "Role" })).toBeVisible({ timeout: 30_000 })
    await expect(page.getByRole("menuitem", { name: "Revoke Sessions" })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByRole("menuitem", { name: "Ban" })).toHaveCount(0)
    await page.keyboard.press("Escape")
    await expect(adminRow.getByRole("button", { name: "Delete" })).toHaveCount(0)
  })
})
