import { expect, test } from "@playwright/test"
import {
  cleanupTestUser,
  createAuthenticatedUser,
  createTestPost,
  deleteTestPost,
} from "../helpers/auth"

// WL-P2-34 (ADR 0045): /app/claims, /app/organizations, /app/media, /app/blog migrated onto the ONE
// AdminCollection frame. FI-027 (SESSION_0530): /app/techniques is a SIBLING AdminCollection
// (staff-only, `techniques.manage` — the admin role's `"*"` wildcard passes the inline guard).
// Temporary conformance smoke — asserts each migrated route renders the shared DataTable frame
// (a <table>) under an admin session rather than crashing.
// Every test mints its own admin user; collect ALL ids so afterAll cleans up each one
// (a single shared `let` only ever teardowns the last, leaking the rest into the shared DB).
const createdUserIds: string[] = []

test.describe("AdminCollection conformance smoke", () => {
  test.afterAll(async () => {
    for (const id of createdUserIds) await cleanupTestUser(id)
  })

  for (const path of [
    "/app/claims",
    "/app/organizations",
    "/app/media",
    "/app/techniques",
    "/app/blog",
  ]) {
    test(`admin sees the AdminCollection table at ${path}`, async ({ page }) => {
      const { userId } = await createAuthenticatedUser(page, { role: "admin" })
      createdUserIds.push(userId)

      await page.goto(path)

      await expect(page.locator("table").first()).toBeVisible({
        timeout: 30_000,
      })
      await expect(page.locator("body")).not.toContainText("404")
    })
  }

  test("Posts opens on the visible Draft editorial queue", async ({ page }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    createdUserIds.push(userId)

    await page.goto("/app/blog")
    await expect(page.locator("table").first()).toBeVisible({ timeout: 30_000 })

    // The surface opens on the Drafts editorial queue: the Status facet chip shows the `Draft`
    // default (30s — the real table loads behind a Suspense skeleton). The columns themselves are
    // already covered by the conformance-loop + clear-to-All tests; asserting them here by
    // column-header name is unreliable (a sortable `DataTableColumnHeader` sets an `aria-label` =
    // the sort-state sentence, which OVERRIDES the accessible name), so we assert the Drafts default
    // — this test's actual contract — via the same facet selector the clear-to-All test proves works.
    const statusFilter = page.getByRole("button", { name: /status.*draft/i })
    await expect(statusFilter).toBeVisible({ timeout: 30_000 })
    await statusFilter.click()

    for (const status of ["Draft", "Scheduled", "Published"]) {
      await expect(page.getByRole("option", { name: new RegExp(status, "i") })).toBeVisible()
    }
  })

  // SESSION_0531 review-wave (P1): the "Clear filters" affordance on the Drafts-DEFAULTED Status
  // facet must reach the genuinely-unfiltered (All) view, not snap back to Drafts. The fix writes
  // an explicit-empty `?status=` sentinel (distinct from an absent param, which hydrates to the
  // default). With published posts seeded, clearing the (0-draft) default view reveals them.
  test("Posts: clearing the defaulted Status facet reaches the All (unfiltered) view", async ({
    page,
  }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    createdUserIds.push(userId)

    await page.goto("/app/blog")
    await expect(page.locator("table").first()).toBeVisible({ timeout: 30_000 })

    // Open the Drafts-default facet and Clear it.
    await page.getByRole("button", { name: /status.*draft/i }).click()
    await page.getByRole("option", { name: /clear filters/i }).click()

    // The clear encodes "cleared to All" as an explicit-empty param, NOT a return-to-default.
    await expect(page).toHaveURL(/[?&]status=(&|$)/)
    // All view: seeded published posts are now visible (the Drafts default showed none).
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 30_000 })
  })

  // Companion: a NON-defaulted collection (/app/tools passes no `columnFilters` default) must keep
  // the base-kit behavior — clearing a facet REMOVES the param entirely (no empty sentinel).
  test("Tools: clearing a non-defaulted Status facet removes the status param", async ({
    page,
  }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    createdUserIds.push(userId)

    await page.goto("/app/tools")
    await expect(page.locator("table").first()).toBeVisible({ timeout: 30_000 })

    // Select a value so the param is written (the facet trigger's exact name is "Status" when
    // unselected — disambiguates it from the sortable "Status" column header button).
    await page.getByRole("button", { name: "Status", exact: true }).click()
    await page.getByRole("option", { name: /published/i }).click()
    await expect(page).toHaveURL(/status=Published/)

    // Clear from the still-open popover: a non-defaulted facet clears to null (param removed).
    await page.getByRole("option", { name: /clear filters/i }).click()
    await expect(page).not.toHaveURL(/status=/)
  })

  // SESSION_0533 WL-P2-54 (A1 guard): the row-action shell is being refactored onto the shared
  // `RowActionsMenu` + `RowDeleteButton` primitives. Pin the destructive path this rewires — the
  // kebab exposes Edit/View, and the trailing red trash opens the shared `DeleteDialog` confirm
  // (its confirm control is `aria-label="Delete post"`), with Cancel dismissing without navigating.
  test("Posts row actions: kebab exposes Edit/View and the trash opens a cancellable confirm", async ({
    page,
  }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    createdUserIds.push(userId)

    // Seed a Draft post authored by this admin so the Drafts-first `/app/blog` default has a real row
    // to act on — CI's e2e DB has ZERO posts (migrate + tournament fixture only), so relying on a
    // seeded post reddened `main` (FS-0031/LR-0009: the local `ronindojo_e2e` seed is richer than
    // CI's). Seeding in-test makes the guard seed-independent. `cleanupTestUser` also removes it.
    const post = await createTestPost(userId, { status: "Draft" })
    try {
      await page.goto("/app/blog")
      await expect(page.locator("table").first()).toBeVisible({ timeout: 30_000 })
      // The seeded Draft is the row: wait for it by name so we don't act on the Suspense skeleton.
      await expect(page.getByRole("cell", { name: "E2E A1 Row-Action Post" })).toBeVisible({
        timeout: 30_000,
      })

      // Open the row's kebab: Edit + View menu items render.
      await page.getByRole("button", { name: "Open menu" }).first().click()
      await expect(page.getByRole("menuitem", { name: "Edit" })).toBeVisible()
      await expect(page.getByRole("menuitem", { name: "View" })).toBeVisible()
      // Dismiss the menu so its positioner doesn't intercept the trash click.
      await page.keyboard.press("Escape")

      // The trailing red trash (aria-label="Delete") opens the shared DeleteDialog confirm.
      await page.getByRole("button", { name: "Delete", exact: true }).first().click()
      await expect(page.getByText("Are you sure?")).toBeVisible()
      await expect(page.getByRole("button", { name: "Delete post" })).toBeVisible()

      // Cancel dismisses the confirm without navigating away from /app/blog.
      await page.getByRole("button", { name: "Cancel" }).click()
      await expect(page.getByText("Are you sure?")).toBeHidden()
      await expect(page).toHaveURL(/\/app\/blog(\?|$)/)
    } finally {
      deleteTestPost(post.id)
    }
  })

  // SESSION_0515 (Giddy MED): the claims/orgs `sort` param was a dead wire — the header rendered
  // sortable but the query hard-coded `orderBy`. Sort is now threaded through the query, so a
  // header sort must (a) write the `sort` param to the URL and (b) re-order rows server-side.
  test("sorting the Organizations table by name desc changes row order", async ({ page }) => {
    const { userId } = await createAuthenticatedUser(page, { role: "admin" })
    createdUserIds.push(userId)

    await page.goto("/app/organizations")
    await expect(page.locator("table").first()).toBeVisible({
      timeout: 30_000,
    })

    const firstCell = page.locator("tbody tr td:first-child").first()
    const bodyRows = page.locator("tbody tr")
    const rowCount = await bodyRows.count()

    const beforeFirst = await firstCell.innerText()

    // Open the "Organization" column header menu (the trigger's a11y name is the sort-state
    // sentence, so target the button carrying the visible column title) and choose Descending.
    await page.getByRole("button").filter({ hasText: "Organization" }).first().click()
    await page.getByRole("menuitem", { name: /sort descending/i }).click()

    // (a) the sort param is now in the URL, encoding a `name` desc sort.
    await expect(page).toHaveURL(/sort=.*name/)
    await expect(page).toHaveURL(/desc/)

    // (b) with ≥2 orgs the server re-orders, so the first row flips from the default `name asc`.
    if (rowCount >= 2) {
      await expect(firstCell).not.toHaveText(beforeFirst)
    }
  })
})
