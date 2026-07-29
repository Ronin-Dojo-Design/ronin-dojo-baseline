import { expect, test } from "@playwright/test"
import {
  type AuthenticatedUser,
  cleanupTestUser,
  createAuthenticatedSession,
  createTestOrg,
  createTestUser,
  deleteTestOrg,
} from "../helpers/auth"
import { readOrgClaimState } from "../helpers/org-claim"

/**
 * WL-P2-13 — the full org-claim loop, end to end (SESSION_0696).
 *
 * The BBL claim loop is the north star; this spec proves the owner-less-org arm
 * of it through the REAL surfaces (no server-action shortcuts):
 *
 *   1. Signed-out teaser — the "Claim this organization" CTA renders on BOTH
 *      public lenses (`/organizations/[slug]` + `/schools/[slug]`, an org of
 *      type DOJO serves both) with the funnel-first "Sign in to claim" door.
 *   2. Claim — a signed-in member submits the generic profile-claim form
 *      (`ProfileClaimForm` → `submitProfileClaimRequest` → `ProfileClaimRequest`,
 *      ADR 0036 §5: org claims stay in ProfileClaimRequest).
 *   3. Admin approve — through the real `/app/claims` AdminCollection queue and
 *      the `[id]` review surface (`reviewProfileClaim`).
 *   4. DB truth — approval grants ownership: `Organization.ownerId` = claimant.
 *   5. Fulfilled — the CTA no longer renders for a fresh visitor.
 *
 * Fixture rows are seeded through the shared auth helpers (FS-0031: never
 * assume base-seed data) with test-unique slugs/names; `ProfileClaimRequest`
 * cascades from both the org and the claimant, so teardown is org-first then
 * users. Auth = the session-cookie helper (the repo's canonical Playwright
 * auth), which drives the same auth-gated surfaces the dev-login route serves
 * in a hand-driven browser.
 */

const uid = crypto.randomUUID().slice(0, 8)
const ORG_NAME = `E2E 0696 Ownerless Dojo ${uid}`
const ORG_SLUG = `e2e-0696-org-claim-${uid}`

let claimant: AuthenticatedUser
let admin: AuthenticatedUser
let org: { id: string; slug: string }

test.describe("Org-claim loop (WL-P2-13)", () => {
  test.setTimeout(120_000)

  test.beforeAll(() => {
    claimant = createTestUser({ name: `e2e-0696-claimant-${uid}` })
    admin = createTestUser({ name: `e2e-0696-admin-${uid}`, role: "admin" })
    org = createTestOrg(ORG_NAME, ORG_SLUG)
  })

  test.afterAll(() => {
    // Org first: ProfileClaimRequest cascades from it, and the approved claim
    // has set org.ownerId to the claimant we delete next.
    if (org) deleteTestOrg(org.id)
    if (claimant) cleanupTestUser(claimant.userId)
    if (admin) cleanupTestUser(admin.userId)
  })

  test("teaser → claim → admin approve → ownerId set → CTA gone", async ({ page }) => {
    // 1. Signed-out teaser on the org lens: claim headline + funnel-first sign-in door.
    await page.goto(`/organizations/${org.slug}`)
    // ListingDetail mounts the claim CTA in a responsive dup (desktop + mobile slot, one
    // CSS-hidden), so the bare text matches 2 nodes under the prod build's SSR DOM — scope
    // to the visible one (SESSION_0717 P1 down-sync).
    await expect(page.getByText(`Claim ${ORG_NAME}`).filter({ visible: true })).toBeVisible({
      timeout: 30_000,
    })
    const signInCta = page.getByRole("link", { name: "Sign in to claim" })
    await expect(signInCta).toBeVisible()
    await expect(signInCta).toHaveAttribute("href", new RegExp(`/auth/login\\?next=.*${org.slug}`))

    // 1b. The same org (type DOJO) serves the school lens with the same teaser.
    await page.goto(`/schools/${org.slug}`)
    // ListingDetail mounts the claim CTA in a responsive dup (desktop + mobile slot, one
    // CSS-hidden), so the bare text matches 2 nodes under the prod build's SSR DOM — scope
    // to the visible one (SESSION_0717 P1 down-sync).
    await expect(page.getByText(`Claim ${ORG_NAME}`).filter({ visible: true })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByRole("link", { name: "Sign in to claim" })).toBeVisible()

    // 2. The claimant signs in — the CTA now renders the claim form.
    await createAuthenticatedSession(page, claimant.userId)
    await page.goto(`/organizations/${org.slug}`)
    await page.getByRole("combobox", { name: /your relationship to/i }).click()
    await page.getByRole("option", { name: "I own / run this" }).click()
    await page.getByRole("button", { name: "Submit claim" }).click()
    await expect(page.getByText("Claim submitted — an admin will review it shortly.")).toBeVisible({
      timeout: 30_000,
    })

    const afterSubmit = readOrgClaimState(org.id, claimant.userId)
    expect(afterSubmit.claim?.status).toBe("PENDING")
    expect(afterSubmit.orgOwnerId).toBeNull()

    // 3. The admin approves through the real queue: list row → detail → Approve.
    await page.context().clearCookies()
    await createAuthenticatedSession(page, admin.userId)
    await page.goto("/app/claims")
    const rowLink = page.getByRole("link", { name: claimant.name, exact: true })
    await expect(rowLink).toBeVisible({ timeout: 30_000 })
    await rowLink.click()

    await expect(page.getByRole("heading", { name: `Claim: ${ORG_NAME}`, level: 1 })).toBeVisible({
      timeout: 30_000,
    })
    await page.getByRole("button", { name: "Approve", exact: true }).click()
    await expect(page.getByText("Approved — ownership granted to the claimant.")).toBeVisible({
      timeout: 30_000,
    })

    // 4. DB truth: the approval side-effect granted ownership to the claimant.
    const afterApprove = readOrgClaimState(org.id, claimant.userId)
    expect(afterApprove.claim?.status).toBe("APPROVED")
    expect(afterApprove.orgOwnerId).toBe(claimant.userId)

    // 5. The claim is fulfilled — a fresh signed-out visitor no longer sees the CTA.
    await page.context().clearCookies()
    await page.goto(`/organizations/${org.slug}`)
    await expect(page.getByRole("heading", { name: ORG_NAME }).first()).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByText(`Claim ${ORG_NAME}`)).toHaveCount(0)
  })
})
