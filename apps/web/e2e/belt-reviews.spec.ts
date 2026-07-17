import { expect, test } from "@playwright/test"
import { createAuthenticatedSession } from "./helpers/auth"
import {
  type BeltReviewFixture,
  cleanupBeltReviewFixture,
  readBeltReviewFixtureState,
  seedBeltReviewFixture,
} from "./helpers/seed-belt-review"

let fixture: BeltReviewFixture

test.describe("Belt-review moderation lifecycle", () => {
  test.setTimeout(90_000)

  test.beforeAll(() => {
    fixture = seedBeltReviewFixture()
  })

  test.afterAll(() => {
    if (fixture) cleanupBeltReviewFixture(fixture)
  })

  test("inspect, cancel, and approve the immutable promoter proposal", async ({ page }) => {
    await createAuthenticatedSession(page, fixture.adminUserId)
    await page.goto("/app/belt-reviews")

    const reviewLink = page.getByRole("link", { name: fixture.memberName, exact: true }).first()
    await expect(reviewLink).toBeVisible({ timeout: 30_000 })
    await reviewLink.click()

    await expect(
      page.getByRole("heading", { name: `Belt review: ${fixture.memberName}`, level: 1 }),
    ).toBeVisible({ timeout: 30_000 })
    await expect(
      page.getByText(fixture.acceptedPromoterName, { exact: true }).first(),
    ).toBeVisible()
    await expect(page.getByText(fixture.proposedPromoterName, { exact: true })).toBeVisible()

    await page.getByRole("button", { name: "Approve", exact: true }).click()
    const confirmation = page.getByRole("dialog")
    await expect(
      confirmation.getByRole("heading", { name: "Approve promoter change?" }),
    ).toBeVisible()

    await confirmation.getByRole("button", { name: "Cancel", exact: true }).click()
    await expect(confirmation).not.toBeVisible()
    expect(readBeltReviewFixtureState(fixture)).toEqual({
      reviewStatus: "PROPOSAL_PENDING",
      awardPromoterPassportId: fixture.acceptedPromoterPassportId,
      awardVerificationStatus: "UNVERIFIED",
      entryStatus: "UNVERIFIED",
      auditActions: [],
    })

    await page.getByRole("button", { name: "Approve", exact: true }).click()
    await page.getByRole("dialog").getByRole("button", { name: "Approve and verify" }).click()

    await expect(page.getByText("Promoter change approved — belt verified.")).toBeVisible({
      timeout: 30_000,
    })
    await expect(
      page.getByText("This promoter-change review is APPROVED and can no longer be actioned."),
    ).toBeVisible({ timeout: 30_000 })
    await expect(page.getByRole("button", { name: "Approve", exact: true })).toHaveCount(0)
    await expect(
      page.getByText(fixture.proposedPromoterName, { exact: true }).first(),
    ).toBeVisible()

    const state = readBeltReviewFixtureState(fixture)
    expect(state.reviewStatus).toBe("APPROVED")
    expect(state.awardPromoterPassportId).toBe(fixture.proposedPromoterPassportId)
    expect(state.awardVerificationStatus).toBe("VERIFIED")
    expect(state.entryStatus).toBe("VERIFIED")
    expect(state.auditActions).toEqual(
      expect.arrayContaining([
        "belt.entry.verified",
        "belt.review.approved",
        "belt.fact.promoter_applied",
      ]),
    )
  })
})
