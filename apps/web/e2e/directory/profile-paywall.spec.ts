import { expect, test } from "@playwright/test"
import { createAuthenticatedSession } from "../helpers/auth"
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

/**
 * WL-P2-37 (SESSION_0515 TASK_03) — `/me` owner render through the ONE unified `ProfileView`
 * renderer. The free fixture user viewing their OWN Passport at `/me` gets the full owner arm
 * (bio + edit affordances), tier-independent (a member always sees their own profile in full).
 * Proves the consolidated renderer's owner branch renders the same surface it did pre-refactor.
 */
test.describe("/me owner render (unified ProfileView)", () => {
  test("free owner sees their full Passport at /me", async ({ page }) => {
    // fixture.userIds[0] is the FREE user — sign in as them so /me resolves the owner arm.
    await createAuthenticatedSession(page, fixture.userIds[0])
    await page.goto("/me")

    // Owner surface renders (the H1 is the member's own NAME, not a literal "My Passport" —
    // that string is only the null-name fallback). The name also repeats in the passport-card
    // H4, so scope to the H1 hero title.
    await expect(page.getByRole("heading", { level: 1, name: fixture.freeName })).toBeVisible()
    // The bio renders (tier-independent for the owner — a member always sees their own profile).
    await expect(page.getByText(fixture.bio)).toBeVisible()
    // Owner-only affordance (FI-024 H1): the "Edit profile" action opens the inline
    // `PassportEditor` drawer in-place — it is now a button, not a bounce to `/app/profile`.
    const editProfile = page.getByRole("button", { name: /edit profile/i })
    await expect(editProfile).toBeVisible()
    await editProfile.click()
    await expect(page.getByRole("heading", { name: /edit your passport/i })).toBeVisible()
  })
})
