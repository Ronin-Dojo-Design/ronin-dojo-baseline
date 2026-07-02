/**
 * petey-plan-0477 Slice V5 (SESSION_0491) + grants-first inversion (SESSION_0492) —
 * resolvePromotionClaimResources unit test (SOP §5d).
 *
 * The helper derives the lineage resource(s) a RANK_PROMOTION claim is reviewed
 * against, FOR A SPECIFIC REVIEWER (the claim itself carries no tree/node): Passport
 * → its @unique LineageNode → each LineageTreeMember row → { treeId, nodeId, memberId,
 * branchRootMemberIds }.
 *
 * Grants-first (SESSION_0492): the reviewer's active `LineageTreeAccess` grants are
 * fetched up front. A tree the reviewer holds NO grant on is dropped (it could never
 * authorize). The ancestor walk that populates `branchRootMemberIds` runs ONLY when
 * the reviewer holds a `BRANCH_EDITOR` grant on that tree (the only role that consults
 * it) — for other roles an empty set is authz-identical. These tests pin both the
 * shape AND authz-equivalence: the returned set must feed `canForResource` to the same
 * verdict a full whole-tree load did.
 *
 * Pure DB reads on a tx surface → rolled-back-tx pattern: fixtures + call + asserts all
 * inside a transaction that never commits. Zero persistence, zero teardown, no mocks.
 *
 * Run: cd apps/web && bun run test server/admin/claims/promotion-claim-resource.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"

import { resolvePromotionClaimResources } from "~/server/admin/claims/promotion-claim-resource"
import { canWithGrants } from "~/server/orpc/resource-permissions"
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

/** A reviewer User to hang grants off. */
async function makeReviewer(tx: Tx): Promise<string> {
  const user = await tx.user.create({
    data: { id: uid("reviewer"), name: uid("Reviewer"), email: `${uid("reviewer")}@test.local` },
    select: { id: true },
  })
  return user.id
}

/** Grant `role` on `treeId` to the reviewer (optional branch/node scope). */
async function grant(
  tx: Tx,
  {
    userId,
    treeId,
    role,
    rootMemberId,
    nodeId,
    memberId,
  }: {
    userId: string
    treeId: string
    role: string
    rootMemberId?: string
    nodeId?: string
    memberId?: string
  },
): Promise<void> {
  await tx.lineageTreeAccess.create({
    data: {
      id: uid("grant"),
      userId,
      treeId,
      role,
      rootMemberId: rootMemberId ?? null,
      nodeId: nodeId ?? null,
      memberId: memberId ?? null,
    },
  })
}

describe("resolvePromotionClaimResources (Slice V5 + grants-first, SESSION_0492)", () => {
  it("walks the full ancestor chain ONLY for a BRANCH_EDITOR reviewer", async () => {
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

      // A BRANCH_EDITOR rooted at the tree root — its grant consults branchRootMemberIds.
      const reviewerUserId = await makeReviewer(tx)
      await grant(tx, {
        userId: reviewerUserId,
        treeId,
        role: "BRANCH_EDITOR",
        rootMemberId,
      })

      const resources = await resolvePromotionClaimResources(tx, leaf.passportId, reviewerUserId)

      expect(resources).not.toBeNull()
      expect(resources).toHaveLength(1)
      const resource = resources![0]!
      expect(resource.treeId).toBe(treeId)
      expect(resource.nodeId).toBe(leaf.nodeId)
      expect(resource.memberId).toBe(leafMemberId)
      // Own member id + every ancestor up to the tree root — a BRANCH_EDITOR grant
      // rooted at ANY of these covers the member.
      expect(resource.branchRootMemberIds).toEqual([leafMemberId, midMemberId, rootMemberId])

      // Authz-equivalence: the branch grant (rooted at the tree root) authorizes.
      expect(
        canWithGrants(
          { id: reviewerUserId, role: "tournament_director" } as never,
          "claim.review",
          resource,
          [{ role: "BRANCH_EDITOR", treeId, rootMemberId }],
        ),
      ).toBe(true)
    })
  })

  it("returns the resource WITHOUT walking ancestors for a TREE_ADMIN reviewer", async () => {
    await inRolledBackTx(async tx => {
      const treeId = await makeTree(tx)
      const root = await makeNode(tx)
      const leaf = await makeNode(tx)
      const rootMemberId = await makeMember(tx, { treeId, nodeId: root.nodeId })
      const leafMemberId = await makeMember(tx, {
        treeId,
        nodeId: leaf.nodeId,
        parentMemberId: rootMemberId,
      })

      const reviewerUserId = await makeReviewer(tx)
      await grant(tx, { userId: reviewerUserId, treeId, role: "TREE_ADMIN" })

      const resources = await resolvePromotionClaimResources(tx, leaf.passportId, reviewerUserId)

      expect(resources).toHaveLength(1)
      const resource = resources![0]!
      expect(resource.memberId).toBe(leafMemberId)
      // No ancestor walk — TREE_ADMIN is tree-wide, never consults branchRootMemberIds.
      // The set is just the member's own id (an empty-for-authz-purposes placeholder).
      expect(resource.branchRootMemberIds).toEqual([leafMemberId])

      // Authz-equivalence: TREE_ADMIN authorizes tree-wide regardless of the branch set.
      expect(
        canWithGrants(
          { id: reviewerUserId, role: "tournament_director" } as never,
          "claim.review",
          resource,
          [{ role: "TREE_ADMIN", treeId }],
        ),
      ).toBe(true)
    })
  })

  it("returns null when the reviewer holds NO grant on the member's tree", async () => {
    await inRolledBackTx(async tx => {
      const treeId = await makeTree(tx)
      const member = await makeNode(tx)
      await makeMember(tx, { treeId, nodeId: member.nodeId })

      // Reviewer exists but has no grant anywhere → nothing to scope against.
      const reviewerUserId = await makeReviewer(tx)

      const resources = await resolvePromotionClaimResources(tx, member.passportId, reviewerUserId)

      expect(resources).toBeNull()
    })
  })

  it("drops trees the reviewer cannot review, keeps the one they can (multi-tree)", async () => {
    await inRolledBackTx(async tx => {
      const treeA = await makeTree(tx)
      const treeB = await makeTree(tx)
      const member = await makeNode(tx)
      const memberInA = await makeMember(tx, { treeId: treeA, nodeId: member.nodeId })
      await makeMember(tx, { treeId: treeB, nodeId: member.nodeId })

      // The reviewer can review only tree A.
      const reviewerUserId = await makeReviewer(tx)
      await grant(tx, { userId: reviewerUserId, treeId: treeA, role: "TREE_EDITOR" })

      const resources = await resolvePromotionClaimResources(tx, member.passportId, reviewerUserId)

      expect(resources).toHaveLength(1)
      expect(resources![0]!.treeId).toBe(treeA)
      expect(resources![0]!.memberId).toBe(memberInA)
    })
  })

  it("returns null when the member has no lineage node", async () => {
    await inRolledBackTx(async tx => {
      const passport = await tx.passport.create({
        data: { id: uid("nodeless"), displayName: uid("Nodeless") },
        select: { id: true },
      })
      const reviewerUserId = await makeReviewer(tx)

      const resources = await resolvePromotionClaimResources(tx, passport.id, reviewerUserId)

      expect(resources).toBeNull()
    })
  })

  it("returns null when the node has no tree membership (nothing to scope against)", async () => {
    await inRolledBackTx(async tx => {
      const member = await makeNode(tx)
      const reviewerUserId = await makeReviewer(tx)

      const resources = await resolvePromotionClaimResources(tx, member.passportId, reviewerUserId)

      expect(resources).toBeNull()
    })
  })
})
