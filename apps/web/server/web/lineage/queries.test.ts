/**
 * SESSION_0179 TASK_02 — getLineageTreeBySlug + materializeLineageTreeResult.
 *
 * Run: cd apps/web && bun test server/web/lineage/queries.test.ts
 *
 * Author: Cody / SESSION_0179 TASK_02.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidateTag: () => {},
}))

import type { Brand } from "~/.generated/prisma/client"
import type {
  LineageTreeMemberRow,
  LineageTreePublicRow,
  LineageVisualGroupRow,
} from "~/server/web/lineage/payloads"
import {
  getLineageTreeBySlug,
  materializeLineageTreeResult,
  resolveLineageVisibilityScope,
} from "~/server/web/lineage/queries"
import { db } from "~/services/db"

const TS = Date.now()
const TAG_PREFIX = "session-0179-lineage-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`
const TEST_BRAND: Brand = "BASELINE_MARTIAL_ARTS"

type Fixtures = {
  publishedTreeId: string
  privateTreeId: string
  publishedTreeSlug: string
  privateTreeSlug: string
  publicMemberAId: string
  publicMemberBId: string
  restrictedMemberId: string
  unlistedMemberId: string
  visualGroupAId: string
  visualGroupBId: string
  emptyGroupId: string
  userIds: string[]
  nodeIds: string[]
  ownerUserId: string
  ownerNodeId: string
  nonOwnerUserId: string
}

let fx: Fixtures | null = null

beforeAll(async () => {
  // Three users → three LineageNodes (two PUBLIC, one RESTRICTED) so the
  // visibility-prune branch has something to drop.
  const userA = await db.user.create({
    data: { name: tag("user-a"), email: `${tag("user-a")}@test.local` },
  })
  const userB = await db.user.create({
    data: { name: tag("user-b"), email: `${tag("user-b")}@test.local` },
  })
  const userC = await db.user.create({
    data: { name: tag("user-c"), email: `${tag("user-c")}@test.local` },
  })

  const nodeA = await db.lineageNode.create({
    data: { userId: userA.id, slug: tag("node-a"), visibility: "PUBLIC" },
  })
  const nodeB = await db.lineageNode.create({
    data: { userId: userB.id, slug: tag("node-b"), visibility: "PUBLIC" },
  })
  const nodeC = await db.lineageNode.create({
    data: { userId: userC.id, slug: tag("node-c"), visibility: "RESTRICTED" },
  })

  // userD — UNLISTED node for viewer-scope testing (SESSION_0181 TASK_02).
  const userD = await db.user.create({
    data: { name: tag("user-d"), email: `${tag("user-d")}@test.local` },
  })
  const nodeD = await db.lineageNode.create({
    data: { userId: userD.id, slug: tag("node-d"), visibility: "UNLISTED" },
  })

  const publishedTree = await db.lineageTree.create({
    data: {
      brand: TEST_BRAND,
      slug: tag("tree-published"),
      name: tag("tree-published"),
      visibility: "PUBLIC",
      isPublished: true,
      ownerNodeId: nodeA.id,
    },
  })

  // Two visual groups + a third "empty" group that no remaining member will
  // reference once nodeC is pruned — this proves the empty-group prune.
  // Visual-group unique is (treeId, parentMemberId, groupType, promotionDate).
  // Give each row a distinct promotionDate so they don't collide on the
  // null-COALESCE side of the index.
  const groupA = await db.lineageVisualGroup.create({
    data: {
      treeId: publishedTree.id,
      label: tag("group-a"),
      sortOrder: 10,
      promotionDate: new Date(Date.UTC(2020, 0, 1)),
    },
  })
  const groupB = await db.lineageVisualGroup.create({
    data: {
      treeId: publishedTree.id,
      label: tag("group-b"),
      sortOrder: 20,
      promotionDate: new Date(Date.UTC(2021, 0, 1)),
    },
  })
  const emptyGroup = await db.lineageVisualGroup.create({
    data: {
      treeId: publishedTree.id,
      label: tag("group-empty"),
      sortOrder: 30,
      promotionDate: new Date(Date.UTC(2022, 0, 1)),
    },
  })

  // memberA — visualSortOrder 10, in groupA.
  const memberA = await db.lineageTreeMember.create({
    data: {
      treeId: publishedTree.id,
      nodeId: nodeA.id,
      visualSortOrder: 10,
      visualGroupId: groupA.id,
    },
  })
  // memberB — visualSortOrder 20, in groupB; parent ref points back at memberA
  // to exercise the PROMOTED_BY / primaryVisualParentMemberId orientation.
  const memberB = await db.lineageTreeMember.create({
    data: {
      treeId: publishedTree.id,
      nodeId: nodeB.id,
      visualSortOrder: 20,
      visualGroupId: groupB.id,
      primaryVisualParentMemberId: memberA.id,
    },
  })
  // memberC — RESTRICTED node, lives in emptyGroup. Should be filtered out
  // and emptyGroup pruned with it.
  const memberC = await db.lineageTreeMember.create({
    data: {
      treeId: publishedTree.id,
      nodeId: nodeC.id,
      visualSortOrder: 30,
      visualGroupId: emptyGroup.id,
    },
  })

  // memberD — UNLISTED node (SESSION_0181 TASK_02). Visible to authenticated
  // viewers but not to unauthenticated ones.
  const memberD = await db.lineageTreeMember.create({
    data: {
      treeId: publishedTree.id,
      nodeId: nodeD.id,
      visualSortOrder: 40,
      visualGroupId: groupB.id,
    },
  })

  await db.lineageTree.update({
    where: { id: publishedTree.id },
    data: { defaultRootMemberId: memberA.id },
  })

  // Second tree — PUBLIC but NOT published → must return null.
  const privateTree = await db.lineageTree.create({
    data: {
      brand: TEST_BRAND,
      slug: tag("tree-unpublished"),
      name: tag("tree-unpublished"),
      visibility: "PUBLIC",
      isPublished: false,
    },
  })

  fx = {
    publishedTreeId: publishedTree.id,
    privateTreeId: privateTree.id,
    publishedTreeSlug: publishedTree.slug,
    privateTreeSlug: privateTree.slug,
    publicMemberAId: memberA.id,
    publicMemberBId: memberB.id,
    restrictedMemberId: memberC.id,
    unlistedMemberId: memberD.id,
    visualGroupAId: groupA.id,
    visualGroupBId: groupB.id,
    emptyGroupId: emptyGroup.id,
    userIds: [userA.id, userB.id, userC.id, userD.id],
    nodeIds: [nodeA.id, nodeB.id, nodeC.id, nodeD.id],
    ownerUserId: userA.id,
    ownerNodeId: nodeA.id,
    nonOwnerUserId: userB.id,
  }
})

afterAll(async () => {
  if (!fx) return

  await db.lineageTreeMember.deleteMany({
    where: { treeId: { in: [fx.publishedTreeId, fx.privateTreeId] } },
  })
  await db.lineageVisualGroup.deleteMany({
    where: { treeId: { in: [fx.publishedTreeId, fx.privateTreeId] } },
  })
  await db.lineageTree.deleteMany({
    where: { id: { in: [fx.publishedTreeId, fx.privateTreeId] } },
  })
  await db.lineageNode.deleteMany({ where: { id: { in: fx.nodeIds } } })
  await db.user.deleteMany({ where: { id: { in: fx.userIds } } })

  await db.$disconnect()
})

describe("getLineageTreeBySlug", () => {
  it("returns null when no tree matches the brand+slug", async () => {
    const result = await getLineageTreeBySlug({
      brand: TEST_BRAND,
      slug: `${TAG_PREFIX}does-not-exist-${TS}`,
    })
    expect(result).toBeNull()
  })

  it("returns null when the tree exists but is not published", async () => {
    const result = await getLineageTreeBySlug({
      brand: TEST_BRAND,
      slug: fx!.privateTreeSlug,
    })
    expect(result).toBeNull()
  })

  it("materializes ordered members and prunes RESTRICTED nodes + empty groups", async () => {
    const result = await getLineageTreeBySlug({
      brand: TEST_BRAND,
      slug: fx!.publishedTreeSlug,
    })

    expect(result).not.toBeNull()
    expect(result!.tree.id).toBe(fx!.publishedTreeId)
    expect(result!.defaultRootMemberId).toBe(fx!.publicMemberAId)

    // memberC (RESTRICTED) dropped; A then B by visualSortOrder asc.
    const memberIds = result!.members.map(m => m.id)
    expect(memberIds).toEqual([fx!.publicMemberAId, fx!.publicMemberBId])

    // Empty group dropped; A then B by sortOrder asc.
    const groupIds = result!.visualGroups.map(g => g.id)
    expect(groupIds).toEqual([fx!.visualGroupAId, fx!.visualGroupBId])
    expect(groupIds).not.toContain(fx!.emptyGroupId)
  })

  it("preserves primaryVisualParentMemberId when the parent member survives the scope filter", async () => {
    const result = await getLineageTreeBySlug({
      brand: TEST_BRAND,
      slug: fx!.publishedTreeSlug,
    })

    const memberB = result!.members.find(m => m.id === fx!.publicMemberBId)
    expect(memberB?.primaryVisualParentMemberId).toBe(fx!.publicMemberAId)
  })

  // --- SESSION_0181 TASK_02 — viewer-scoped integration tests. ---------------
  // Closes SESSION_0180_FINDING_03.

  it("viewer-scoped: unauthenticated sees only PUBLIC members", async () => {
    const result = await getLineageTreeBySlug({
      brand: TEST_BRAND,
      slug: fx!.publishedTreeSlug,
      // no viewer — unauthenticated
    })

    expect(result).not.toBeNull()
    const memberIds = result!.members.map(m => m.id)
    expect(memberIds).toContain(fx!.publicMemberAId)
    expect(memberIds).toContain(fx!.publicMemberBId)
    expect(memberIds).not.toContain(fx!.unlistedMemberId)
    expect(memberIds).not.toContain(fx!.restrictedMemberId)
  })

  it("viewer-scoped: authenticated non-owner sees PUBLIC + UNLISTED members", async () => {
    const result = await getLineageTreeBySlug({
      brand: TEST_BRAND,
      slug: fx!.publishedTreeSlug,
      viewer: { userId: fx!.nonOwnerUserId },
    })

    expect(result).not.toBeNull()
    const memberIds = result!.members.map(m => m.id)
    expect(memberIds).toContain(fx!.publicMemberAId)
    expect(memberIds).toContain(fx!.publicMemberBId)
    expect(memberIds).toContain(fx!.unlistedMemberId)
    expect(memberIds).not.toContain(fx!.restrictedMemberId)
  })

  it("viewer-scoped: authenticated owner sees PUBLIC + UNLISTED + RESTRICTED members", async () => {
    const result = await getLineageTreeBySlug({
      brand: TEST_BRAND,
      slug: fx!.publishedTreeSlug,
      viewer: { userId: fx!.ownerUserId },
    })

    expect(result).not.toBeNull()
    const memberIds = result!.members.map(m => m.id)
    expect(memberIds).toContain(fx!.publicMemberAId)
    expect(memberIds).toContain(fx!.publicMemberBId)
    expect(memberIds).toContain(fx!.unlistedMemberId)
    expect(memberIds).toContain(fx!.restrictedMemberId)
  })

  it("viewer-scoped: non-published tree returns null for all callers", async () => {
    const noViewer = await getLineageTreeBySlug({
      brand: TEST_BRAND,
      slug: fx!.privateTreeSlug,
    })
    const withViewer = await getLineageTreeBySlug({
      brand: TEST_BRAND,
      slug: fx!.privateTreeSlug,
      viewer: { userId: fx!.ownerUserId },
    })
    expect(noViewer).toBeNull()
    expect(withViewer).toBeNull()
  })
})

// --- Pure helper tests — no DB. ----------------------------------------------

function makeMember(overrides: {
  id: string
  visualSortOrder?: number
  visualGroupId?: string | null
  visibility?: "PUBLIC" | "RESTRICTED" | "PRIVATE" | "UNLISTED"
  primaryVisualParentMemberId?: string | null
}): LineageTreeMemberRow {
  return {
    id: overrides.id,
    visualSortOrder: overrides.visualSortOrder ?? 0,
    showPromotionDatePublic: true,
    showRankPublic: true,
    isCollapsedDefault: false,
    primaryVisualParentMemberId: overrides.primaryVisualParentMemberId ?? null,
    visualGroupId: overrides.visualGroupId ?? null,
    treeId: "tree-1",
    nodeId: `node-${overrides.id}`,
    node: {
      id: `node-${overrides.id}`,
      visibility: overrides.visibility ?? "PUBLIC",
    },
    selectedRankAward: null,
  } as unknown as LineageTreeMemberRow
}

function makeGroup(
  id: string,
  sortOrder: number,
  overrides: { parentMemberId?: string | null } = {},
): LineageVisualGroupRow {
  return {
    id,
    label: `group-${id}`,
    groupType: "PROMOTION_DATE",
    promotionDate: null,
    sortOrder,
    showPublicLabel: false,
    isCollapsedDefault: false,
    parentMemberId: overrides.parentMemberId ?? null,
    treeId: "tree-1",
  } as unknown as LineageVisualGroupRow
}

function makeTree(
  members: LineageTreeMemberRow[],
  visualGroups: LineageVisualGroupRow[],
  overrides: { defaultRootMemberId?: string | null } = {},
): LineageTreePublicRow {
  return {
    id: "tree-1",
    brand: "BASELINE_MARTIAL_ARTS",
    scopeType: "BRAND",
    slug: "tree-1",
    name: "Tree 1",
    description: null,
    visibility: "PUBLIC",
    isPublished: true,
    defaultRootMemberId: overrides.defaultRootMemberId ?? null,
    organizationId: null,
    disciplineId: null,
    styleId: null,
    ownerNodeId: null,
    members,
    visualGroups,
  } as unknown as LineageTreePublicRow
}

describe("materializeLineageTreeResult", () => {
  it("drops members whose node visibility is not PUBLIC", () => {
    const tree = makeTree(
      [
        makeMember({ id: "m1", visibility: "PUBLIC" }),
        makeMember({ id: "m2", visibility: "RESTRICTED" }),
        makeMember({ id: "m3", visibility: "PRIVATE" }),
      ],
      [],
    )

    const result = materializeLineageTreeResult(tree)
    expect(result.members.map(m => m.id)).toEqual(["m1"])
  })

  it("prunes visual groups no longer referenced after member filtering", () => {
    const tree = makeTree(
      [
        makeMember({ id: "m1", visualGroupId: "g1", visibility: "PUBLIC" }),
        makeMember({ id: "m2", visualGroupId: "g2", visibility: "RESTRICTED" }),
      ],
      [makeGroup("g1", 10), makeGroup("g2", 20)],
    )

    const result = materializeLineageTreeResult(tree)
    expect(result.visualGroups.map(g => g.id)).toEqual(["g1"])
  })

  it("returns the bare tree summary without members/visualGroups", () => {
    const tree = makeTree([makeMember({ id: "m1", visibility: "PUBLIC" })], [])

    const result = materializeLineageTreeResult(tree)
    expect(result.tree).not.toHaveProperty("members")
    expect(result.tree).not.toHaveProperty("visualGroups")
    expect(result.tree.id).toBe("tree-1")
  })

  // --- SESSION_0180 TASK_02 — dangling-reference hardening. ------------------

  it("nulls primaryVisualParentMemberId when the referenced parent is dropped", () => {
    const tree = makeTree(
      [
        makeMember({ id: "mA", visibility: "RESTRICTED" }),
        makeMember({
          id: "mB",
          visibility: "PUBLIC",
          primaryVisualParentMemberId: "mA",
        }),
      ],
      [],
    )

    const result = materializeLineageTreeResult(tree)
    expect(result.members.map(m => m.id)).toEqual(["mB"])
    const memberB = result.members.find(m => m.id === "mB")
    expect(memberB?.primaryVisualParentMemberId).toBeNull()
  })

  it("nulls visualGroup.parentMemberId when the referenced member is dropped", () => {
    const tree = makeTree(
      [
        makeMember({ id: "mA", visibility: "RESTRICTED" }),
        makeMember({
          id: "mB",
          visualGroupId: "g1",
          visibility: "PUBLIC",
        }),
      ],
      [makeGroup("g1", 10, { parentMemberId: "mA" })],
    )

    const result = materializeLineageTreeResult(tree)
    const group = result.visualGroups.find(g => g.id === "g1")
    expect(group).toBeDefined()
    expect(group?.parentMemberId).toBeNull()
  })

  it("nulls defaultRootMemberId when the chosen root is dropped by the scope filter", () => {
    const tree = makeTree(
      [
        makeMember({ id: "mA", visibility: "RESTRICTED" }),
        makeMember({ id: "mB", visibility: "PUBLIC" }),
      ],
      [],
      { defaultRootMemberId: "mA" },
    )

    const result = materializeLineageTreeResult(tree)
    expect(result.defaultRootMemberId).toBeNull()
    expect(result.tree.defaultRootMemberId).toBeNull()
  })

  it("preserves defaultRootMemberId when the chosen root survives", () => {
    const tree = makeTree(
      [
        makeMember({ id: "mA", visibility: "PUBLIC" }),
        makeMember({ id: "mB", visibility: "RESTRICTED" }),
      ],
      [],
      { defaultRootMemberId: "mA" },
    )

    const result = materializeLineageTreeResult(tree)
    expect(result.defaultRootMemberId).toBe("mA")
    expect(result.tree.defaultRootMemberId).toBe("mA")
  })

  it("applies a custom scope so authenticated callers can surface UNLISTED", () => {
    const tree = makeTree(
      [
        makeMember({ id: "mA", visibility: "UNLISTED" }),
        makeMember({ id: "mB", visibility: "RESTRICTED" }),
      ],
      [],
    )

    const result = materializeLineageTreeResult(tree, ["PUBLIC", "UNLISTED"] as const)
    expect(result.members.map(m => m.id)).toEqual(["mA"])
  })
})

// --- SESSION_0180 TASK_03 — resolveLineageVisibilityScope. -------------------

describe("resolveLineageVisibilityScope", () => {
  it("returns [PUBLIC] for unauthenticated callers", () => {
    expect(resolveLineageVisibilityScope({ authenticated: false, isOwner: false })).toEqual([
      "PUBLIC",
    ])
  })

  it("returns [PUBLIC, UNLISTED] for authenticated non-owners", () => {
    expect(resolveLineageVisibilityScope({ authenticated: true, isOwner: false })).toEqual([
      "PUBLIC",
      "UNLISTED",
    ])
  })

  it("returns [PUBLIC, UNLISTED, RESTRICTED] for owners", () => {
    expect(resolveLineageVisibilityScope({ authenticated: true, isOwner: true })).toEqual([
      "PUBLIC",
      "UNLISTED",
      "RESTRICTED",
    ])
  })

  it("never returns PRIVATE", () => {
    for (const authenticated of [false, true]) {
      for (const isOwner of [false, true]) {
        expect(resolveLineageVisibilityScope({ authenticated, isOwner })).not.toContain("PRIVATE")
      }
    }
  })

  it("ignores isOwner when the viewer is unauthenticated", () => {
    expect(resolveLineageVisibilityScope({ authenticated: false, isOwner: true })).toEqual([
      "PUBLIC",
    ])
  })
})
