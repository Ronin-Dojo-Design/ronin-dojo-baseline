import { expect, test } from "@playwright/test"
import {
  cleanupDirectoryPaywallFixture,
  type DirectoryPaywallSeedFixture,
  seedDirectoryPaywallFixture,
} from "../helpers/seed-directory-paywall"

/**
 * SESSION_0502 (TASK_03) — `/directory/[slug]` free/paid FIELD-boundary proof.
 *
 * Operator-ratified boundary: a FREE claimed profile renders the FULL BASIC public profile
 * (bio, school/organizations, ranks, ancestry) and does NOT render rich media (cover banner,
 * video intro, social links, location). A PREMIUM profile renders all. The seed sets the rich
 * fields on BOTH profiles, so the free page hiding them proves the paywall non-vacuously.
 *
 * Live-page proof (not a source assertion): both profiles are seeded as claimed PUBLIC BBL
 * directory profiles under a published claimable BBL tree so they resolve on `/directory/[slug]`.
 * Needs the dev server + dev DB (CI-run, like the other directory e2e).
 */

let fixture: DirectoryPaywallSeedFixture

test.beforeAll(async () => {
  fixture = await seedDirectoryPaywallFixture()
})

test.afterAll(async () => {
  if (fixture) {
    await cleanupDirectoryPaywallFixture(fixture)
  }
})

test.describe("/directory/[slug] paywall field boundary", () => {
  test("free claimed profile renders BASIC and hides rich media", async ({ page }) => {
    await page.goto(`/directory/${fixture.freeSlug}`)

    // BASIC — always published for a claimed profile.
    await expect(page.getByText(fixture.bio)).toBeVisible()
    // Ranks section present (the seeded black belt).
    await expect(page.getByRole("heading", { name: /rank/i })).toBeVisible()
    // Schools & Organizations present (the seeded membership). Scoped to the org-section LINK —
    // the passport card also renders the org name as a plain-text school label (×mobile/desktop),
    // so an unscoped getByText resolves to multiple elements and trips strict mode.
    await expect(page.getByRole("link", { name: fixture.orgName })).toBeVisible()

    // RICH — gated on the free tier even though every field is set in the DB.
    await expect(page.getByRole("img", { name: /profile cover photo/i })).toHaveCount(0)
    await expect(page.getByRole("heading", { name: fixture.videoIntroTitle })).toHaveCount(0)
    await expect(page.getByRole("heading", { name: "Social" })).toHaveCount(0)
    await expect(page.getByText(fixture.locationCity)).toHaveCount(0)
    // The media-locked upgrade badge is present on the gated (free) profile.
    await expect(page.getByText(/media locked/i)).toBeVisible()
  })

  test("premium claimed profile renders rich media", async ({ page }) => {
    await page.goto(`/directory/${fixture.premiumSlug}`)

    // BASIC still present.
    await expect(page.getByText(fixture.bio)).toBeVisible()

    // RICH unlocked for the paid tier.
    await expect(page.getByRole("img", { name: /profile cover photo/i })).toBeVisible()
    await expect(page.getByRole("heading", { name: fixture.videoIntroTitle })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Social" })).toBeVisible()
    await expect(page.getByText(fixture.locationCity).first()).toBeVisible()
    // Paid profile does NOT show the media-locked badge.
    await expect(page.getByText(/media locked/i)).toHaveCount(0)
  })
})
