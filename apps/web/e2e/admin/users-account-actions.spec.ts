import { expect, test } from "@playwright/test"
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
  test.afterAll(async () => {
    for (const id of createdUserIds) await cleanupTestUser(id)
  })

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
    await page.goto(`/app/users?displayName=${encodeURIComponent(nonAdmin.name)}`)
    const nonAdminRow = page.getByRole("row").filter({ hasText: nonAdmin.name }).first()
    await expect(nonAdminRow).toBeVisible({ timeout: 60_000 })
    await nonAdminRow.getByRole("button", { name: "Open menu" }).click()
    await expect(page.getByRole("menuitem", { name: "Ban" })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole("menuitem", { name: "Revoke Sessions" })).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(nonAdminRow.getByRole("button", { name: "Delete" })).toBeVisible()

    // ---- admin target (non-self): Role + Revoke, but NO Ban and NO Delete ----
    await page.goto(`/app/users?displayName=${encodeURIComponent(adminTarget.name)}`)
    const adminRow = page.getByRole("row").filter({ hasText: adminTarget.name }).first()
    await expect(adminRow).toBeVisible({ timeout: 60_000 })
    await adminRow.getByRole("button", { name: "Open menu" }).click()
    await expect(page.getByRole("menuitem", { name: "Role" })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole("menuitem", { name: "Revoke Sessions" })).toBeVisible()
    await expect(page.getByRole("menuitem", { name: "Ban" })).toHaveCount(0)
    await page.keyboard.press("Escape")
    await expect(adminRow.getByRole("button", { name: "Delete" })).toHaveCount(0)
  })
})
