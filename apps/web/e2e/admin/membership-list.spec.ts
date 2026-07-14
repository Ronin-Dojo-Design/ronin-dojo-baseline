import { expect, test } from "@playwright/test"
import { cleanupTestUser, createAuthenticatedUser } from "../helpers/auth"
import {
  cleanupMembershipFixture,
  type MembershipFixture,
  seedMembership,
} from "../helpers/seed-membership"

let testUserId: string
let fixture: MembershipFixture

test.describe("Admin membership list E2E", () => {
  test.afterAll(async () => {
    if (fixture) await cleanupMembershipFixture(fixture)
    if (testUserId) await cleanupTestUser(testUserId)
  })

  test("admin can access membership list page and sees table", async ({ page }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    testUserId = userId
    fixture = await seedMembership(userId)

    await page.goto("/admin/memberships")

    // §14e SESSION_0270: replaced networkidle with deterministic table anchor
    await expect(page.locator("table").first()).toBeVisible({ timeout: 30_000 })

    // Should not get 404 — admin role grants access
    await expect(page.locator("body")).not.toContainText("404 Not Found")
    // Table or data-table skeleton should render
    await expect(page.locator("table").first()).toBeVisible()
  })

  test("non-admin is blocked from membership list page", async ({ page }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "user" })
    testUserId = userId

    await page.goto("/admin/memberships")

    // §14e SESSION_0270: replaced networkidle with domcontentloaded (negative test)
    await page.waitForLoadState("domcontentloaded")

    // Auth HOC calls notFound() for non-admins — should NOT see admin table
    const adminTable = page.locator("table").first()
    expect(await adminTable.count()).toBe(0)
  })
})
