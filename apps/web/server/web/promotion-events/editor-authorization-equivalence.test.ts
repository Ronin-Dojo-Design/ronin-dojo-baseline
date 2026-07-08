/**
 * SESSION_0511 item-5 Stage 1 — dev-only lineage-axis EQUIVALENCE HARNESS test
 * (`server/web/promotion-events/editor-authorization-equivalence.ts`).
 *
 * The harness runs the canonical `canForResource` lineage-grant decision ALONGSIDE
 * the authoritative hand-rolled node-set decision and reports divergence. These tests
 * prove:
 *   - AGREE: a real TREE_ADMIN grant → hand-rolled full-tree scope AND canonical
 *     `claim.review` both allow → NO divergence reported.
 *   - DISAGREE: a hand-rolled scope that allows a node with NO backing
 *     `LineageTreeAccess` grant → canonical denies → the harness DETECTS the
 *     divergence (handRolled=true, canonical=false).
 *   - SCOPE DISCIPLINE: admin / self-award / org short-circuits are EXCLUDED from the
 *     comparison (no divergence emitted even when the paths would differ).
 *
 * Real Postgres inside an always-rolled-back transaction (SOP §5d): the canonical path
 * issues real `lineageTreeAccess` / `lineageTreeMember` reads, so a hand-emulated fake
 * would be its own source of error.
 *
 * Run: cd apps/web && bun run test server/web/promotion-events/editor-authorization-equivalence.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"

import type { AuthzUser } from "~/lib/authz"
import {
  assertLineageAxisEquivalence,
  computeLineageAxisDivergence,
} from "~/server/web/promotion-events/editor-authorization-equivalence"
import type {
  AuthorizableRankAward,
  PromotionEventAuthoringScope,
} from "~/server/web/promotion-events/editor-authorization"
import { db } from "~/services/db"

// biome-ignore lint/suspicious/noExplicitAny: tx client surface.
type Tx = any

const TS = Date.now()
let seq = 0
const uid = (name: string) => `eq-${TS}-${seq++}-${name}`

class Rollback extends Error {}

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

async function makeUser(tx: Tx): Promise<AuthzUser> {
  const user = await tx.user.create({
    data: { id: uid("user"), name: uid("User"), email: `${uid("user")}@test.local` },
    select: { id: true },
  })
  return { id: user.id, role: "user" }
}

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

const scopeOf = (
  overrides: Partial<PromotionEventAuthoringScope> = {},
): PromotionEventAuthoringScope => ({
  isGlobalAdmin: false,
  organizationIds: new Set(),
  fullTreeNodeIds: new Set(),
  scopedNodeIds: new Set(),
  canAuthorHostlessEvents: false,
  ...overrides,
})

const awardOf = (overrides: Partial<AuthorizableRankAward> = {}): AuthorizableRankAward => ({
  id: uid("award"),
  awardedById: "someone-else",
  organizationId: null,
  promotionEventId: null,
  passport: { lineageNode: { id: "node-x" } },
  ...overrides,
})

describe("editor-authorization equivalence harness (item-5 Stage 1)", () => {
  it("AGREE: TREE_ADMIN grant → hand-rolled full-tree AND canonical both allow → no divergence", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)
      const treeId = await makeTree(tx)
      const target = await makeNode(tx)
      await makeMember(tx, { treeId, nodeId: target.nodeId })
      await grant(tx, { userId: user.id, treeId, role: "TREE_ADMIN" })

      // Hand-rolled scope: the tree-admin materializes the node into fullTreeNodeIds.
      const scope = scopeOf({ fullTreeNodeIds: new Set([target.nodeId]) })
      const award = awardOf({ passport: { lineageNode: { id: target.nodeId } } })

      const divergence = await computeLineageAxisDivergence({
        db: tx,
        user,
        scope,
        award,
        userId: user.id,
      })

      // Both paths allow → agree → null.
      expect(divergence).toBeNull()

      const collected = await assertLineageAxisEquivalence({
        db: tx,
        user,
        scope,
        awards: [award],
      })
      expect(collected).toHaveLength(0)
    })
  })

  it("DISAGREE: hand-rolled allows a node with NO backing grant → canonical denies → divergence detected", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)
      const treeId = await makeTree(tx)
      const target = await makeNode(tx)
      await makeMember(tx, { treeId, nodeId: target.nodeId })
      // NO LineageTreeAccess grant for this user → canonical `canForResource` denies.

      // But the hand-rolled scope (constructed) claims the node is authorized.
      const scope = scopeOf({ scopedNodeIds: new Set([target.nodeId]) })
      const award = awardOf({ passport: { lineageNode: { id: target.nodeId } } })

      const divergence = await computeLineageAxisDivergence({
        db: tx,
        user,
        scope,
        award,
        userId: user.id,
      })

      expect(divergence).not.toBeNull()
      expect(divergence!.awardId).toBe(award.id)
      expect(divergence!.nodeId).toBe(target.nodeId)
      expect(divergence!.treeIds).toEqual([treeId])
      expect(divergence!.handRolled).toBe(true)
      expect(divergence!.canonical).toBe(false)

      const collected = await assertLineageAxisEquivalence({
        db: tx,
        user,
        scope,
        awards: [award],
      })
      expect(collected).toHaveLength(1)
      expect(collected[0]!.handRolled).toBe(true)
      expect(collected[0]!.canonical).toBe(false)
    })
  })

  it("DISAGREE (other direction): canonical grant exists but hand-rolled scope missed the node", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)
      const treeId = await makeTree(tx)
      const target = await makeNode(tx)
      const memberId = await makeMember(tx, { treeId, nodeId: target.nodeId })
      // A real NODE_EDITOR grant → canonical ALLOWS.
      await grant(tx, { userId: user.id, treeId, role: "NODE_EDITOR", memberId })

      // Hand-rolled scope forgot to include the node → hand-rolled DENIES.
      const scope = scopeOf()
      const award = awardOf({ passport: { lineageNode: { id: target.nodeId } } })

      const divergence = await computeLineageAxisDivergence({
        db: tx,
        user,
        scope,
        award,
        userId: user.id,
      })

      expect(divergence).not.toBeNull()
      expect(divergence!.handRolled).toBe(false)
      expect(divergence!.canonical).toBe(true)
    })
  })

  it("SCOPE DISCIPLINE: self-award is excluded from comparison (never a divergence)", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)
      const treeId = await makeTree(tx)
      const target = await makeNode(tx)
      await makeMember(tx, { treeId, nodeId: target.nodeId })
      // No grant → canonical would deny; but hand-rolled short-circuits on self-award.

      const scope = scopeOf({ scopedNodeIds: new Set([target.nodeId]) })
      const award = awardOf({
        awardedById: user.id,
        passport: { lineageNode: { id: target.nodeId } },
      })

      const divergence = await computeLineageAxisDivergence({
        db: tx,
        user,
        scope,
        award,
        userId: user.id,
      })
      expect(divergence).toBeNull()
    })
  })

  it("SCOPE DISCIPLINE: org-match is excluded from comparison", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)
      const treeId = await makeTree(tx)
      const target = await makeNode(tx)
      await makeMember(tx, { treeId, nodeId: target.nodeId })

      const scope = scopeOf({
        organizationIds: new Set(["org-1"]),
        scopedNodeIds: new Set([target.nodeId]),
      })
      const award = awardOf({
        organizationId: "org-1",
        passport: { lineageNode: { id: target.nodeId } },
      })

      const divergence = await computeLineageAxisDivergence({
        db: tx,
        user,
        scope,
        award,
        userId: user.id,
      })
      expect(divergence).toBeNull()
    })
  })

  it("SCOPE DISCIPLINE: an award with no lineage node is excluded (nothing to compare)", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)
      const scope = scopeOf()
      const award = awardOf({ passport: { lineageNode: null } })

      const divergence = await computeLineageAxisDivergence({
        db: tx,
        user,
        scope,
        award,
        userId: user.id,
      })
      expect(divergence).toBeNull()
    })
  })

  it("global admin scope is excluded (admin axis has no canonical resource equivalent)", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)
      const treeId = await makeTree(tx)
      const target = await makeNode(tx)
      await makeMember(tx, { treeId, nodeId: target.nodeId })

      const scope = scopeOf({ isGlobalAdmin: true })
      const award = awardOf({ passport: { lineageNode: { id: target.nodeId } } })

      const divergence = await computeLineageAxisDivergence({
        db: tx,
        user,
        scope,
        award,
        userId: user.id,
      })
      expect(divergence).toBeNull()
    })
  })
})
