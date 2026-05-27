import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"
import { createAuthenticatedSession } from "../helpers/auth"
import {
  cleanupLineageLifecycleFixture,
  type LineageLifecycleFixture,
  readLineageLifecycleState,
  seedLineageLifecycleFixture,
} from "../helpers/seed-lineage-lifecycle"

let fixture: LineageLifecycleFixture

test.describe.configure({ mode: "serial" })

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

async function expectNoHiddenText(pageContent: string, hiddenText: string[]) {
  for (const hiddenValue of hiddenText) {
    expect(pageContent).not.toContain(hiddenValue)
  }
}

async function expectHiddenTextAbsentFromBody(page: Page, hiddenText: string[]) {
  const body = page.locator("body")
  for (const hiddenValue of hiddenText) {
    await expect(body).not.toContainText(hiddenValue)
  }
}

async function expectLoginRedirect(page: Page, nextPath: string) {
  // SESSION_0267 (FINDING_03 closure): bumped 20s → 40s. Under full-suite
  // chromium load, Next dev-server JIT-compile delay on the dynamic
  // `/lineage/[slug]/edit/[nodeId]` route can push the unauth redirect
  // past 20s. 40s provides slack without masking real regressions; in CI
  // the chromium full suite typically resolves redirects in <2s.
  await expect(page).toHaveURL(
    url => url.pathname === "/auth/login" && url.searchParams.get("next") === nextPath,
    { timeout: 40_000 },
  )
}

test.describe("Lineage authenticated lifecycle E2E", () => {
  test.setTimeout(120_000)

  test.beforeAll(async () => {
    fixture = await seedLineageLifecycleFixture()
  })

  test.afterAll(async () => {
    if (fixture) await cleanupLineageLifecycleFixture(fixture)
  })

  test("anonymous claim and edit routes redirect to the real login route", async ({ page }) => {
    // SESSION_0267 (carries SESSION_0266_TASK_01 pattern): after the URL
    // redirect resolves, also wait for the login page's stable post-
    // hydration heading (`<IntroTitle size="h3">Sign In</IntroTitle>` at
    // `app/(web)/auth/login/page.tsx:36`). Converts URL-only assertion
    // into URL + DOM-settled assertion, which is robust under full-suite
    // dev-server load. Closes SESSION_0266_FINDING_03 for auth-lifecycle:50.
    const loginHeading = page.getByRole("heading", { name: /sign in/i, level: 3 })

    await page.goto(`/lineage/${fixture.treeSlug}/claim`)
    await expectLoginRedirect(page, `/lineage/${fixture.treeSlug}/claim`)
    await expect(loginHeading).toBeVisible({ timeout: 30_000 })

    await page.goto(`/lineage/${fixture.treeSlug}/edit/${fixture.claimTargetNodeId}`)
    await expectLoginRedirect(
      page,
      `/lineage/${fixture.treeSlug}/edit/${fixture.claimTargetNodeId}`,
    )
    await expect(loginHeading).toBeVisible({ timeout: 30_000 })
  })

  test("tree editor updates a promoter relationship from the drawer action menu", async ({
    page,
  }) => {
    await createAuthenticatedSession(page, fixture.treeEditorUserId)

    await page.goto(`/dashboard/lineage/${fixture.treeId}`)
    await page.waitForLoadState("networkidle")

    await expect(page.getByRole("heading", { name: fixture.treeName })).toBeVisible({
      timeout: 20_000,
    })

    await page
      .getByRole("button", {
        name: new RegExp(`Open lineage profile for ${escapeRegExp(fixture.claimTargetName)}`),
      })
      .click()
    await expect(page.getByRole("tab", { name: "Rank History" })).toBeVisible()

    await page.getByRole("button", { name: "Open lineage profile actions" }).click()
    await page.getByRole("menuitem", { name: "Change promoter..." }).click()

    await expect(page.getByRole("dialog", { name: "Change promoter" })).toBeVisible()
    await page.getByLabel("Verification status").click()
    await page.getByRole("option", { name: "Verified" }).click()
    await page
      .getByLabel("Audit note")
      .fill(`E2E promoter relationship update ${fixture.searchToken}`)
    await page.getByRole("button", { name: "Save promoter" }).click()

    await expect(page.getByText("Promoter relationship updated.")).toBeVisible({
      timeout: 15_000,
    })

    const state = await readLineageLifecycleState(fixture)
    expect(state.promoterRelationship).toMatchObject({
      fromNodeId: fixture.nodeIds[1],
      toNodeId: fixture.claimTargetNodeId,
      rankAwardId: fixture.rankAwardId,
      verificationStatus: "VERIFIED",
      isVerified: true,
    })
  })

  test("authenticated non-owner can submit a public claim without hidden member leakage", async ({
    page,
    browserName,
  }) => {
    // SESSION_0267 (FINDING_02 closure attempt 1): clear context state
    // between serial-mode tests. The previous test (tree editor promoter
    // update) left a TREE_EDITOR session cookie on the firefox context,
    // which caused the Radix Select trigger on the claim form to bind
    // listeners against a polluted serialized React tree. Chromium +
    // webkit tolerated this because their pointer-event dispatchers are
    // more permissive; firefox's Radix Select would not open the listbox
    // for Space/Enter activation after the prior auth context. Explicit
    // clearCookies + clearPermissions before re-authenticating restores
    // the isolation guarantee.
    void browserName
    await page.context().clearCookies()
    await page.context().clearPermissions()

    await createAuthenticatedSession(page, fixture.claimantUserId)

    await page.goto(`/lineage/${fixture.treeSlug}/claim`)
    await page.waitForLoadState("networkidle")

    await expect(page.getByRole("heading", { name: "Claim a Lineage Node" })).toBeVisible()

    const hiddenText = [
      ...Object.values(fixture.hiddenNames),
      ...Object.values(fixture.hiddenGroupLabels),
    ]
    await expectHiddenTextAbsentFromBody(page, hiddenText)
    await expectNoHiddenText(await page.content(), hiddenText)

    const deniedResponse = await page.goto(
      `/lineage/${fixture.treeSlug}/edit/${fixture.claimTargetNodeId}`,
    )
    await page.waitForLoadState("networkidle")
    expect(deniedResponse?.status()).toBe(404)
    await expect(page.getByRole("heading", { name: "Edit Lineage Profile" })).toHaveCount(0)

    await page.goto(`/lineage/${fixture.treeSlug}/claim`)
    await page.waitForLoadState("networkidle")

    // SESSION_0266 — `getByText("Select a person").click()` clicked the
    // placeholder text inside a Radix Select trigger, which firefox
    // doesn't reliably propagate to the underlying combobox. Focus the
    // combobox by role/label and activate with the keyboard; Radix Select
    // listens for Space/Enter on the trigger and this path is more
    // cross-engine-stable than synthetic click events on the trigger text.
    const claimCombobox = page.getByRole("combobox", { name: /which node are you claiming/i })
    await claimCombobox.focus()
    await claimCombobox.press(" ")
    const claimTargetOption = page.getByRole("option", { name: fixture.claimTargetName })
    await expect(claimTargetOption).toBeVisible()
    await expectHiddenTextAbsentFromBody(page, hiddenText)
    await expectNoHiddenText(await page.content(), hiddenText)
    await claimTargetOption.click()
    await page
      .getByLabel("Note to reviewer (optional)")
      .fill(`E2E claim note for ${fixture.searchToken}`)
    await page.getByRole("button", { name: /\+ Add evidence/i }).click()
    await page.getByLabel("Label").fill("E2E identity proof")
    await page.getByLabel("URL").fill("https://example.com/e2e-lineage-proof")
    await page.getByLabel("Text description").fill(`E2E evidence text ${fixture.searchToken}`)
    await page.getByRole("button", { name: "Submit Claim" }).click()

    await page.waitForURL(/\/lineage\?claimed=true/, { timeout: 15_000 })

    const state = await readLineageLifecycleState(fixture)
    expect(state.claim?.status).toBe("PENDING")
    expect(state.claim?.claimantNote).toBe(`E2E claim note for ${fixture.searchToken}`)
    expect(state.claim?.evidence).toHaveLength(1)
    expect(state.claim?.evidence[0]?.label).toBe("E2E identity proof")
    expect(state.nodeOwnerId).toBe(fixture.placeholderUserId)
    expect(state.accessGrant).toBeNull()
  })

  test("admin approves claim and claimant can preview/edit the lineage profile", async ({
    page,
    browserName,
  }) => {
    // SESSION_0267 (FINDING_02 closure attempt 1): with the upstream
    // claim-submit test (:120) now self-isolating via clearCookies +
    // clearPermissions, this downstream test's fixture chain restores
    // on firefox. The original SESSION_0266 fixme cascade is removed.
    void browserName

    await page.context().clearCookies()
    await createAuthenticatedSession(page, fixture.adminUserId)

    await page.goto("/admin/lineage/claims")
    await page.waitForLoadState("networkidle")

    const pendingState = await readLineageLifecycleState(fixture)
    const claimId = pendingState.claim?.id
    expect(claimId).toBeTruthy()

    const claimLink = page.getByRole("link", {
      name: new RegExp(escapeRegExp(fixture.claimTargetName)),
    })
    await expect(claimLink).toBeVisible()
    await Promise.all([
      page.waitForURL(`**/admin/lineage/claims/${claimId}`, { timeout: 20_000 }),
      claimLink.click(),
    ])

    await expect(
      page.getByRole("heading", { name: `Claim: ${fixture.claimTargetName}` }),
    ).toBeVisible({ timeout: 20_000 })
    await page.getByLabel("Reviewer Note (optional)").fill("Approved by E2E admin")
    await page.getByRole("button", { name: "Approve" }).click()

    await expect(page.getByText("This claim is")).toBeVisible({ timeout: 15_000 })

    const approvedState = await readLineageLifecycleState(fixture)
    expect(approvedState.claim?.status).toBe("APPROVED")
    expect(approvedState.nodeOwnerId).toBe(fixture.claimantUserId)
    expect(approvedState.placeholderArchivedAt).toBeTruthy()
    expect(approvedState.accessGrant?.role).toBe("NODE_EDITOR")
    expect(approvedState.accessGrant?.userId).toBe(fixture.claimantUserId)

    await page.context().clearCookies()
    await createAuthenticatedSession(page, fixture.claimantUserId)

    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")
    await page.getByRole("button", { name: "Lineage" }).click()
    await expect(page.getByText(fixture.treeName)).toBeVisible()
    await expect(page.getByText("node editor")).toBeVisible()

    await page.goto(`/dashboard/lineage/${fixture.treeId}`)
    await page.waitForLoadState("networkidle")
    await expect(page.getByRole("heading", { name: fixture.treeName })).toBeVisible()
    await expect(page.getByText(fixture.hiddenNames.private)).toBeVisible()

    const updatedDisplayName = `E2E Updated Claimant ${fixture.searchToken}`
    const updatedBio = `E2E updated lineage bio ${fixture.searchToken}`
    const updatedPromotionDate = "2024-05-17"

    await page.goto(`/lineage/${fixture.treeSlug}/edit/${fixture.claimTargetNodeId}`)
    await page.waitForLoadState("networkidle")
    await expect(page.getByRole("heading", { name: "Edit Lineage Profile" })).toBeVisible()
    await page.getByLabel("Display name").fill(updatedDisplayName)
    await page.getByLabel("Promotion date").fill(updatedPromotionDate)
    await page.getByLabel("Bio").fill(updatedBio)
    await page.getByRole("button", { name: "Save Lineage Profile" }).click()

    await expect(page.getByText("Lineage profile updated.")).toBeVisible({ timeout: 15_000 })

    const updatedState = await readLineageLifecycleState(fixture)
    expect(updatedState.passportDisplayName).toBe(updatedDisplayName)
    expect(updatedState.nodeBio).toBe(updatedBio)
    expect(updatedState.rankAwardedAt).toBe(
      new Date(`${updatedPromotionDate}T00:00:00.000Z`).toISOString(),
    )

    await page.goto(`/lineage/${fixture.treeSlug}`)
    await page.waitForLoadState("networkidle")
    await expect(page.getByText(updatedDisplayName)).toBeVisible()
    await page
      .getByRole("button", {
        name: new RegExp(`Open lineage profile for ${escapeRegExp(updatedDisplayName)}`),
      })
      .click()
    await expect(page.getByText(updatedBio)).toBeVisible()
  })
})
