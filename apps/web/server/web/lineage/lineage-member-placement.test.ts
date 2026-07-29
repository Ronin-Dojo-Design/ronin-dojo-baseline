/**
 * SESSION_0718 (lane 3) — unit coverage for `applyLineageMemberPlacementUpdate`,
 * the placement core behind the lineage editor's drag/reorder.
 *
 * Replaces the two `test.fixme`-papered assertions in
 * `e2e/lineage/editor-drag-reorder.spec.ts` (SESSION_0266 — dnd-kit headless drag was
 * chronically flaky, so the e2e marked itself fixme when a drag didn't persist and
 * proved nothing). The dnd-kit DOM layer is a browser concern; the INVARIANTS the e2e
 * cared about are pure placement logic and are exercised here directly against the DB —
 * deterministic, no browser, no flake:
 *   1. an intra-group reorder persists `visualSortOrder` without changing the visual
 *      group or the lineage parentage;
 *   2. a cross-group move changes `visualGroupId` but PRESERVES
 *      `primaryVisualParentMemberId` — a visual move must never rewrite lineage parentage.
 *
 * Reuses the lineage-lifecycle fixture (parent + 3 siblings in group A, plus group B
 * under the same parent), the same fixture the deleted e2e used.
 *
 * Run: cd apps/web && bun run test server/web/lineage/lineage-member-placement.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { Brand } from "~/.generated/prisma/client"
import {
  cleanupLineageLifecycleFixture,
  type LineageLifecycleFixture,
  readLineageLifecycleState,
  seedLineageLifecycleFixture,
} from "~/e2e/helpers/seed-lineage-lifecycle"
import { applyLineageMemberPlacementUpdate } from "~/server/web/lineage/editor-actions"
import { db } from "~/services/db"

describe("applyLineageMemberPlacementUpdate", () => {
  let fixture: LineageLifecycleFixture

  beforeAll(async () => {
    fixture = await seedLineageLifecycleFixture()
  }, 60_000)

  afterAll(async () => {
    if (fixture) await cleanupLineageLifecycleFixture(fixture)
  }, 60_000)

  it("intra-group reorder persists visualSortOrder, keeping group + lineage parentage", async () => {
    const memberB = fixture.siblingMemberIds[1]
    const initialSortOrder = fixture.siblingInitialSortOrders[1]
    // A distinct target so the change is unambiguous (move B past the last sibling).
    const targetSortOrder = fixture.siblingInitialSortOrders[2] + 5

    await applyLineageMemberPlacementUpdate({
      db,
      brand: Brand.BBL,
      userId: fixture.treeEditorUserId,
      isGlobalAdmin: false,
      input: {
        treeId: fixture.treeId,
        memberId: memberB,
        parentMemberId: fixture.siblingParentMemberId,
        visualGroupId: fixture.siblingGroupAId,
        visualSortOrder: targetSortOrder,
        auditNote: "SESSION_0718 unit test — intra-group reorder",
      },
    })

    const state = await readLineageLifecycleState(fixture)
    const reorderedB = state.siblings.find(s => s.id === memberB)
    expect(reorderedB).toBeDefined()
    expect(reorderedB?.visualSortOrder).not.toBe(initialSortOrder)
    expect(reorderedB?.visualGroupId).toBe(fixture.siblingGroupAId)
    expect(reorderedB?.primaryVisualParentMemberId).toBe(fixture.siblingParentMemberId)
  }, 30_000)

  it("cross-group move changes visualGroupId but PRESERVES lineage parentage", async () => {
    const memberB = fixture.siblingMemberIds[1]

    await applyLineageMemberPlacementUpdate({
      db,
      brand: Brand.BBL,
      userId: fixture.treeEditorUserId,
      isGlobalAdmin: false,
      input: {
        treeId: fixture.treeId,
        memberId: memberB,
        parentMemberId: fixture.siblingParentMemberId,
        visualGroupId: fixture.siblingGroupBId,
        visualSortOrder: 0,
        auditNote: "SESSION_0718 unit test — cross-group move",
      },
    })

    const state = await readLineageLifecycleState(fixture)
    const movedB = state.siblings.find(s => s.id === memberB)
    expect(movedB).toBeDefined()
    expect(movedB?.visualGroupId).toBe(fixture.siblingGroupBId)
    // The critical invariant: a VISUAL move must not rewrite lineage parentage.
    expect(movedB?.primaryVisualParentMemberId).toBe(fixture.siblingParentMemberId)
  }, 30_000)
})
