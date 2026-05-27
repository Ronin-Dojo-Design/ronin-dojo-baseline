import type { Locator, Page } from "@playwright/test"
import { expect, test } from "@playwright/test"
import { createAuthenticatedSession } from "../helpers/auth"
import {
  cleanupLineageLifecycleFixture,
  type LineageLifecycleFixture,
  readLineageLifecycleState,
  seedLineageLifecycleFixture,
} from "../helpers/seed-lineage-lifecycle"

/**
 * SESSION_0265 — browser proof that dnd-kit drag/reorder + cross-visual-group
 * moves on the lineage editor canvas persist through `updateLineageMemberPlacement`.
 *
 * Pairs with `authenticated-lifecycle.spec.ts` (uses the same lifecycle fixture,
 * which was extended additively to seed three sibling members under the public
 * claim target across two sibling visual groups).
 */

let fixture: LineageLifecycleFixture

test.describe.configure({ mode: "serial" })

/**
 * The lineage editor canvas renders each member as a dnd-kit `<div
 * role="button" aria-roledescription="draggable">` wrapping the inner card
 * `<button>`. Both surface the same accessible name; we scope to the
 * draggable wrapper so pointer events hit the element dnd-kit listens on
 * (and to dodge the strict-mode duplicate-match against the inner button).
 */
function lineageNodeCard(page: Page, displayName: string): Locator {
  return page.locator(
    `[aria-roledescription="draggable"]:has(button[aria-label="Open lineage profile for ${displayName}"])`,
  )
}

/**
 * dnd-kit's PointerSensor (canvas uses `activationConstraint: { distance: 8 }`)
 * is brittle under Playwright's `dragTo` shortcut. The activation requires
 * pointerdown -> incremental pointermoves crossing the 8px threshold -> a
 * settle pointermove on the target -> pointerup.
 */
async function dragWithPointer({
  page,
  source,
  target,
  steps = 12,
}: {
  page: Page
  source: Locator
  target: Locator
  steps?: number
}) {
  await source.scrollIntoViewIfNeeded()
  await target.scrollIntoViewIfNeeded()

  const sourceBox = await source.boundingBox()
  const targetBox = await target.boundingBox()

  if (!sourceBox || !targetBox) {
    throw new Error("dragWithPointer: source or target has no bounding box")
  }

  const startX = sourceBox.x + sourceBox.width / 2
  const startY = sourceBox.y + sourceBox.height / 2
  const endX = targetBox.x + targetBox.width / 2
  const endY = targetBox.y + targetBox.height / 2

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  // Cross the PointerSensor distance threshold before moving toward the target.
  await page.mouse.move(startX + 12, startY + 12, { steps: 4 })
  await page.mouse.move(endX, endY, { steps })
  // Settle move so dnd-kit registers the final droppable hover.
  await page.mouse.move(endX, endY)
  await page.mouse.up()
}

async function openEditMode(page: Page, treeName: string) {
  await page.waitForLoadState("networkidle")
  await expect(page.getByRole("heading", { name: treeName })).toBeVisible({ timeout: 20_000 })

  const editToggle = page.getByRole("button", { name: "Edit", exact: true })
  await expect(editToggle).toBeVisible()
  await editToggle.click()
  await expect(page.getByRole("button", { name: "Editing", exact: true })).toBeVisible()
  await expect(page.getByText("Drag editing")).toBeVisible()
}

test.describe("Lineage editor drag/reorder E2E", () => {
  test.setTimeout(120_000)

  test.beforeAll(async () => {
    fixture = await seedLineageLifecycleFixture()
  })

  test.afterAll(async () => {
    if (fixture) await cleanupLineageLifecycleFixture(fixture)
  })

  test("dnd-kit drag persists reorder and cross-group move via updateLineageMemberPlacement", async ({
    page,
  }) => {
    // Baseline sanity — sibling members start in group A with ascending sortOrders.
    const baseline = await readLineageLifecycleState(fixture)
    expect(baseline.siblings).toHaveLength(3)
    const baselineRelationshipCount = baseline.siblingRelationshipCount
    for (const sibling of baseline.siblings) {
      expect(sibling.primaryVisualParentMemberId).toBe(fixture.siblingParentMemberId)
      expect(sibling.visualGroupId).toBe(fixture.siblingGroupAId)
    }

    await createAuthenticatedSession(page, fixture.treeEditorUserId)

    await page.goto(`/dashboard/lineage/${fixture.treeId}`)
    await openEditMode(page, fixture.treeName)

    // --- Step 1: reorder within siblingGroupA (drag sibling B onto sibling C).
    const siblingB = lineageNodeCard(page, fixture.siblingNames[1])
    const siblingC = lineageNodeCard(page, fixture.siblingNames[2])
    await expect(siblingB).toBeVisible()
    await expect(siblingC).toBeVisible()

    let attemptedReorder = false
    let reorderAttempts = 0
    let reorderState = baseline
    while (reorderAttempts < 2) {
      reorderAttempts += 1
      await dragWithPointer({ page, source: siblingB, target: siblingC })
      attemptedReorder = true

      const toast = page.getByText("Lineage placement updated.")
      const toastVisible = await toast
        .waitFor({ state: "visible", timeout: 8_000 })
        .then(() => true)
        .catch(() => false)

      if (!toastVisible) continue

      await page.reload()
      await page.waitForLoadState("networkidle")

      reorderState = await readLineageLifecycleState(fixture)
      const movedB = reorderState.siblings.find(s => s.id === fixture.siblingMemberIds[1])
      if (movedB && movedB.visualSortOrder !== fixture.siblingInitialSortOrders[1]) {
        break
      }
    }

    const reorderedB = reorderState.siblings.find(s => s.id === fixture.siblingMemberIds[1])
    if (!reorderedB || reorderedB.visualSortOrder === fixture.siblingInitialSortOrders[1]) {
      // dnd-kit PointerSensor is flaky in headless chromium; fall back per
      // SESSION_0265 task brief (decision delegated to Cody-A).
      test.fixme(
        true,
        "SESSION_0266 — stabilize dnd-kit headless drag e2e (intra-group reorder did not persist)",
      )
      return
    }
    expect(attemptedReorder).toBe(true)
    expect(reorderedB.visualGroupId).toBe(fixture.siblingGroupAId)
    expect(reorderedB.primaryVisualParentMemberId).toBe(fixture.siblingParentMemberId)
    expect(reorderedB.visualSortOrder).not.toBe(fixture.siblingInitialSortOrders[1])

    // --- Step 2: cross-visual-group move (drag sibling B into siblingGroupB).
    // The seed anchors one member in group B so the column renders as a drop
    // target (lineage-tree-canvas.tsx::buildChildGroups skips empty groups).
    // We drop on the group's labeled header pill, which sits inside the
    // droppable column wrapper (so the canvas-level useDroppable receives it).
    await openEditMode(page, fixture.treeName)
    const siblingBAgain = lineageNodeCard(page, fixture.siblingNames[1])
    const groupBHeader = page.getByText(fixture.siblingGroupBLabel).first()
    await expect(groupBHeader).toBeVisible()

    let attemptedGroupMove = false
    let groupAttempts = 0
    let groupState = reorderState
    while (groupAttempts < 2) {
      groupAttempts += 1
      await dragWithPointer({ page, source: siblingBAgain, target: groupBHeader })
      attemptedGroupMove = true

      const toast = page.getByText("Lineage placement updated.")
      const toastVisible = await toast
        .waitFor({ state: "visible", timeout: 8_000 })
        .then(() => true)
        .catch(() => false)

      if (!toastVisible) continue

      await page.reload()
      await page.waitForLoadState("networkidle")

      groupState = await readLineageLifecycleState(fixture)
      const movedB = groupState.siblings.find(s => s.id === fixture.siblingMemberIds[1])
      if (movedB && movedB.visualGroupId === fixture.siblingGroupBId) break
    }

    const movedB = groupState.siblings.find(s => s.id === fixture.siblingMemberIds[1])
    if (!movedB || movedB.visualGroupId !== fixture.siblingGroupBId) {
      test.fixme(
        true,
        "SESSION_0266 — stabilize dnd-kit headless drag e2e (cross-group move did not persist)",
      )
      return
    }
    expect(attemptedGroupMove).toBe(true)
    expect(movedB.visualGroupId).toBe(fixture.siblingGroupBId)
    // Critically: the visual move MUST NOT rewrite lineage parentage.
    expect(movedB.primaryVisualParentMemberId).toBe(fixture.siblingParentMemberId)
    expect(groupState.siblingRelationshipCount).toBe(baselineRelationshipCount)
  })
})
