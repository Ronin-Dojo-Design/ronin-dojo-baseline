import { expect, test } from "@playwright/test"
import { cleanupTestUser, createAuthenticatedUser } from "../helpers/auth"
import {
  cleanupMembershipFixture,
  type MembershipFixture,
  seedMembership,
} from "../helpers/seed-membership"

let testUserId: string
let fixture: MembershipFixture

test.describe("Admin membership detail E2E", () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    testUserId = userId
    fixture = await seedMembership(userId)
    await page.close()
  })

  test.afterAll(async () => {
    if (fixture) await cleanupMembershipFixture(fixture)
    if (testUserId) await cleanupTestUser(testUserId)
  })

  test("detail page renders member info and status badge", async ({ page }) => {
    await createAuthenticatedUser(page, { role: "admin" })
    await page.goto(`/admin/memberships/${fixture.membershipId}`)

    // §14e SESSION_0270: replaced networkidle with deterministic heading anchor
    await expect(page.getByRole("heading", { name: /Membership\s—/i, level: 3 })).toBeVisible({
      timeout: 30_000,
    })

    // Should show the membership detail page, not 404
    await expect(page.locator("body")).not.toContainText("404")

    // Status badge should show PENDING (seeded status)
    await expect(page.locator("text=PENDING").first()).toBeVisible()

    // Organization name should be visible
    await expect(page.locator("body")).toContainText("E2E Org")

    // Discipline should be visible
    await expect(page.locator("body")).toContainText("E2E Discipline")
  })

  test("status transition buttons are visible for PENDING membership", async ({ page }) => {
    await createAuthenticatedUser(page, { role: "admin" })
    await page.goto(`/admin/memberships/${fixture.membershipId}`)

    // §14e SESSION_0270: replaced networkidle with deterministic heading anchor
    await expect(page.getByRole("heading", { name: /Membership\s—/i, level: 3 })).toBeVisible({
      timeout: 30_000,
    })

    // PENDING → ACTIVE is a valid transition — button should exist
    await expect(page.locator("button", { hasText: "→ ACTIVE" })).toBeVisible()
  })

  test("clicking transition button updates status badge", async ({ page }) => {
    await createAuthenticatedUser(page, { role: "admin" })
    await page.goto(`/admin/memberships/${fixture.membershipId}`)

    // §14e SESSION_0270: replaced networkidle with deterministic heading anchor
    await expect(page.getByRole("heading", { name: /Membership\s—/i, level: 3 })).toBeVisible({
      timeout: 30_000,
    })

    // Click PENDING → ACTIVE
    await page.locator("button", { hasText: "→ ACTIVE" }).click()

    // Wait for the page to refresh and show ACTIVE
    await expect(page.locator("text=ACTIVE").first()).toBeVisible({ timeout: 10_000 })
  })

  test("role assignment panel renders", async ({ page }) => {
    await createAuthenticatedUser(page, { role: "admin" })
    await page.goto(`/admin/memberships/${fixture.membershipId}`)

    // §14e SESSION_0270: replaced networkidle with deterministic heading anchor
    await expect(page.getByRole("heading", { name: /Membership\s—/i, level: 3 })).toBeVisible({
      timeout: 30_000,
    })

    // Role assignment panel heading
    await expect(page.locator("text=Roles").first()).toBeVisible()
  })
})
