/**
 * petey-plan-0477 Slice V5 (SESSION_0491) — resolvePromotionClaimResources unit test (SOP §5d).
 *
 * The helper derives the lineage resource(s) a RANK_PROMOTION claim is reviewed against
 * (the claim itself carries no tree/node): Passport → its @unique LineageNode → each
 * LineageTreeMember row → { treeId, nodeId, memberId, branchRootMemberIds }, where the
 * branch-root set = the member's own id + its visual-parent ancestor chain (mirrors
 * editor-graph.isLineageMemberInBranch's upward walk).
 *
 * Pure DB reads on a tx surface → rolled-back-tx pattern: fixtures + call + asserts all
 * inside a transaction that never commits. Zero persistence, zero teardown, no mocks.
 *
 * Run: cd apps/web && bun run test server/admin/claims/promotion-claim-resource.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"

import { resolvePromotionClaimResources } from "~/server/admin/claims/promotion-claim-resource"
import { db } from "~/services/db"

const TS = Date.now()
let seq = 0
const uid = (name: string) => `pcr-${TS}-${seq++}-${name}`

// biome-ignore lint/suspicious/noExplicitAny: tx client surface.
type Tx = any

class Rollback extends Error {}

/** Run `body` inside a transaction that is ALWAYS rolled back — zero persistence, zero teardown. */
async function inRolledBackTx(body: (tx: Tx) => Promise<void>): Promise<void> {
  try {
    await db.$transaction(async (tx: Tx) => {
      await body(tx)
      throw new Rollback()
    })
  } catch (error) {
    if (!(error instanceof Rollback)) throw error
  }
}

/** A Passport + LineageNode pair. */
async function makeNode(tx: Tx): Promise<{ passportId: string; nodeId: string }> {
  const passport = await tx.passport.create({
    data: { id: uid("passport"), displayName: uid("Person") },
    select: { id: true },
  })
  const node = await tx.lineageNode.create({
    data: { id: uid("node"), passportId: passport.id, visibility: "PUBLIC" },
    select: { id: true },
  })
  return { passportId: passport.id, nodeId: node.id }
}

async function makeTree(tx: Tx): Promise<string> {
  const tree = await tx.lineageTree.create({
    data: {
      id: uid("tree"),
      brand: "BBL",
      slug: uid("tree"),
      name: uid("Tree"),
      visibility: "PUBLIC",
      isPublished: true,
      scopeType: "DISCIPLINE",
    },
    select: { id: true },
  })
  return tree.id
}

async function makeMember(
  tx: Tx,
  { treeId, nodeId, parentMemberId }: { treeId: string; nodeId: string; parentMemberId?: string },
): Promise<string> {
  const member = await tx.lineageTreeMember.create({
    data: {
      id: uid("member"),
      treeId,
      nodeId,
      primaryVisualParentMemberId: parentMemberId ?? null,
    },
    select: { id: true },
  })
  return member.id
}

describe("resolvePromotionClaimResources (Slice V5)", () => {
  it("derives treeId + nodeId + memberId + the full ancestor branch-root chain", async () => {
    await inRolledBackTx(async tx => {
      const treeId = await makeTree(tx)
      // root ← mid ← leaf (visual-parent chain)
      const root = await makeNode(tx)
      const mid = await makeNode(tx)
      const leaf = await makeNode(tx)
      const rootMemberId = await makeMember(tx, { treeId, nodeId: root.nodeId })
      const midMemberId = await makeMember(tx, {
        treeId,
        nodeId: mid.nodeId,
        parentMemberId: rootMemberId,
      })
      const leafMemberId = await makeMember(tx, {
        treeId,
        nodeId: leaf.nodeId,
        parentMemberId: midMemberId,
      })

      const resources = await resolvePromotionClaimResources(tx, leaf.passportId)

      expect(resources).not.toBeNull()
      expect(resources).toHaveLength(1)
      const resource = resources![0]!
      expect(resource.treeId).toBe(treeId)
      expect(resource.nodeId).toBe(leaf.nodeId)
      expect(resource.memberId).toBe(leafMemberId)
      // Own member id + every ancestor up to the tree root — a BRANCH_EDITOR grant
      // rooted at ANY of these covers the member.
      expect(resource.branchRootMemberIds).toEqual([leafMemberId, midMemberId, rootMemberId])
    })
  })

  it("returns one resource per tree membership when the node sits in multiple trees", async () => {
    await inRolledBackTx(async tx => {
      const treeA = await makeTree(tx)
      const treeB = await makeTree(tx)
      const member = await makeNode(tx)
      const memberInA = await makeMember(tx, { treeId: treeA, nodeId: member.nodeId })
      const memberInB = await makeMember(tx, { treeId: treeB, nodeId: member.nodeId })

      const resources = await resolvePromotionClaimResources(tx, member.passportId)

      expect(resources).toHaveLength(2)
      const byTree = new Map(resources!.map(r => [r.treeId, r]))
      expect(byTree.get(treeA)?.memberId).toBe(memberInA)
      expect(byTree.get(treeB)?.memberId).toBe(memberInB)
    })
  })

  it("returns null when the member has no lineage node", async () => {
    await inRolledBackTx(async tx => {
      const passport = await tx.passport.create({
        data: { id: uid("nodeless"), displayName: uid("Nodeless") },
        select: { id: true },
      })

      const resources = await resolvePromotionClaimResources(tx, passport.id)

      expect(resources).toBeNull()
    })
  })

  it("returns null when the node has no tree membership (nothing to scope against)", async () => {
    await inRolledBackTx(async tx => {
      const member = await makeNode(tx)

      const resources = await resolvePromotionClaimResources(tx, member.passportId)

      expect(resources).toBeNull()
    })
  })
})
