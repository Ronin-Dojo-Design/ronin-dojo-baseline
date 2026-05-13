import { test, expect } from "@playwright/test"
import { createAuthenticatedUser, cleanupTestUser } from "../helpers/auth"
import { seedMembership, cleanupMembershipFixture, type MembershipFixture } from "../helpers/seed-membership"

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
    await page.waitForLoadState("networkidle")

    // Should not get 404 — admin role grants access
    await expect(page.locator("body")).not.toContainText("404")
    // Table or data-table skeleton should render
    await expect(page.locator("table").first()).toBeVisible()
  })

  test("non-admin is blocked from membership list page", async ({ page }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "user" })
    testUserId = userId

    await page.goto("/admin/memberships")
    await page.waitForLoadState("networkidle")

    // Auth HOC calls notFound() for non-admins — should NOT see admin table
    const adminTable = page.locator("table").first()
    expect(await adminTable.count()).toBe(0)
  })
})
