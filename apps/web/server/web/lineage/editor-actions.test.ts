/**
 * Lineage editor action tests.
 *
 * Tests exercise applyLineageMemberPlacementUpdate and
 * applyLineagePromotionRelationshipUpdate directly (bypassing the
 * safe-action wrapper) by injecting a mock db.
 *
 * Run: cd apps/web && bun test server/web/lineage/editor-actions.test.ts
 */

// Install mocks BEFORE any import that touches ~/lib/auth, ~/lib/brand-context,
// next/headers, or ~/lib/safe-actions (required for "use server" modules).
import { installSafeActionMocks } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BASELINE_MARTIAL_ARTS" })

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  applyLineageMemberPlacementUpdate,
  applyLineagePromotionRelationshipUpdate,
  LINEAGE_EDITOR_ERROR,
} from "~/server/web/lineage/editor-actions"

// ---------------------------------------------------------------------------
// Types (mirrors the internal shapes used by the actions)
// ---------------------------------------------------------------------------

type MockMember = {
  id: string
  nodeId: string
  primaryVisualParentMemberId: string | null
  visualGroupId: string | null
  visualSortOrder: number
  rankAwardId: string | null
}

type MockGroup = {
  id: string
  parentMemberId: string | null
}

type MockGrant = {
  role: "TREE_ADMIN" | "TREE_EDITOR" | "BRANCH_EDITOR" | "NODE_EDITOR"
  rootMemberId: string | null
}

// ---------------------------------------------------------------------------
// Mock DB factories
// ---------------------------------------------------------------------------

function makeMockRelationship(overrides: Partial<{
  id: string
  fromNodeId: string
  toNodeId: string
  rankAwardId: string | null
  startedAt: Date | null
  endedAt: Date | null
  isVerified: boolean
  verificationStatus: string
}> = {}) {
  return {
    id: "rel-existing",
    fromNodeId: "node-promoter",
    toNodeId: "node-member",
    rankAwardId: null,
    startedAt: null,
    endedAt: null,
    isVerified: true,
    verificationStatus: "VERIFIED",
    ...overrides,
  }
}

function makeMockTx({
  tree,
  grants,
  updatedMember,
  currentRelationship = null,
  createdRelationship = { id: "rel-new" },
  updatedRelationship = { id: "rel-existing" },
}: {
  tree: { id: string; slug: string; members: MockMember[]; visualGroups: MockGroup[] } | null
  grants: MockGrant[]
  updatedMember?: MockMember
  currentRelationship?: ReturnType<typeof makeMockRelationship> | null
  createdRelationship?: { id: string }
  updatedRelationship?: { id: string }
}) {
  return {
    lineageTree: {
      findFirst: async () => tree,
    },
    lineageTreeAccess: {
      findMany: async () => grants,
    },
    lineageTreeMember: {
      update: async () =>
        updatedMember ?? {
          id: "member-1",
          nodeId: "node-1",
          primaryVisualParentMemberId: null,
          visualGroupId: null,
          visualSortOrder: 0,
        },
    },
    auditLog: {
      create: async () => {},
    },
    lineageRelationship: {
      findFirst: async () => currentRelationship,
      create: async () => createdRelationship,
      update: async () => updatedRelationship,
      delete: async () => {},
    },
  }
}

function makeMockDb(txOverrides: Parameters<typeof makeMockTx>[0]) {
  const tx = makeMockTx(txOverrides)
  return {
    $transaction: async (fn: (tx: typeof tx) => Promise<unknown>) => fn(tx),
  }
}

// ---------------------------------------------------------------------------
// Default fixtures
// ---------------------------------------------------------------------------

const BRAND = "BASELINE_MARTIAL_ARTS" as const
const USER_ID = "user-1"

const rootMember: MockMember = {
  id: "member-root",
  nodeId: "node-root",
  primaryVisualParentMemberId: null,
  visualGroupId: null,
  visualSortOrder: 0,
  rankAwardId: null,
}

const childMember: MockMember = {
  id: "member-child",
  nodeId: "node-child",
  primaryVisualParentMemberId: "member-root",
  visualGroupId: null,
  visualSortOrder: 1,
  rankAwardId: null,
}

const grandchildMember: MockMember = {
  id: "member-grandchild",
  nodeId: "node-grandchild",
  primaryVisualParentMemberId: "member-child",
  visualGroupId: null,
  visualSortOrder: 0,
  rankAwardId: null,
}

const defaultTree = {
  id: "tree-1",
  slug: "tree-slug",
  members: [rootMember, childMember, grandchildMember],
  visualGroups: [] as MockGroup[],
}

const treeAdminGrant: MockGrant = { role: "TREE_ADMIN", rootMemberId: null }
const treeEditorGrant: MockGrant = { role: "TREE_EDITOR", rootMemberId: null }
const branchEditorGrant: MockGrant = { role: "BRANCH_EDITOR", rootMemberId: "member-root" }
const nodeEditorGrant: MockGrant = { role: "NODE_EDITOR", rootMemberId: null }

const validPlacementInput = {
  treeId: "tree-1",
  memberId: "member-child",
  parentMemberId: "member-root" as string | null,
  visualGroupId: null as string | null,
  visualSortOrder: 5,
  auditNote: "Adjusting sort order within the same branch.",
}

const validPromotionInput = {
  treeId: "tree-1",
  memberId: "member-child",
  promoterMemberId: "member-root" as string | null,
  auditNote: "Correcting promoter to match historical records.",
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function expectRejectsWithMessage(promise: Promise<unknown>, message: string) {
  try {
    await promise
    throw new Error("Expected promise to reject but it resolved")
  } catch (error) {
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe(message)
  }
}

// ---------------------------------------------------------------------------
// applyLineageMemberPlacementUpdate
// ---------------------------------------------------------------------------

describe("applyLineageMemberPlacementUpdate", () => {
  it("returns the correct shape on success", async () => {
    const db = makeMockDb({ tree: defaultTree, grants: [treeAdminGrant] })
    const result = await applyLineageMemberPlacementUpdate({
      db: db as never,
      brand: BRAND,
      userId: USER_ID,
      input: validPlacementInput,
    })

    expect(result.treeId).toBe("tree-1")
    expect(result.treeSlug).toBe("tree-slug")
    expect(typeof result.memberId).toBe("string")
    expect(typeof result.nodeId).toBe("string")
  })

  it("throws TREE_NOT_FOUND when the tree does not exist", async () => {
    const db = makeMockDb({ tree: null, grants: [treeAdminGrant] })
    await expectRejectsWithMessage(
      applyLineageMemberPlacementUpdate({
        db: db as never,
        brand: BRAND,
        userId: USER_ID,
        input: validPlacementInput,
      }),
      LINEAGE_EDITOR_ERROR.TREE_NOT_FOUND,
    )
  })

  it("throws MEMBER_NOT_FOUND when memberId is not in the tree", async () => {
    const db = makeMockDb({ tree: defaultTree, grants: [treeAdminGrant] })
    await expectRejectsWithMessage(
      applyLineageMemberPlacementUpdate({
        db: db as never,
        brand: BRAND,
        userId: USER_ID,
        input: { ...validPlacementInput, memberId: "does-not-exist" },
      }),
      LINEAGE_EDITOR_ERROR.MEMBER_NOT_FOUND,
    )
  })

  it("throws PARENT_NOT_FOUND when parentMemberId is not in the tree", async () => {
    const db = makeMockDb({ tree: defaultTree, grants: [treeAdminGrant] })
    await expectRejectsWithMessage(
      applyLineageMemberPlacementUpdate({
        db: db as never,
        brand: BRAND,
        userId: USER_ID,
        input: { ...validPlacementInput, parentMemberId: "unknown-parent" },
      }),
      LINEAGE_EDITOR_ERROR.PARENT_NOT_FOUND,
    )
  })

  it("throws GROUP_NOT_FOUND when visualGroupId is not in the tree", async () => {
    const db = makeMockDb({ tree: defaultTree, grants: [treeAdminGrant] })
    await expectRejectsWithMessage(
      applyLineageMemberPlacementUpdate({
        db: db as never,
        brand: BRAND,
        userId: USER_ID,
        input: { ...validPlacementInput, visualGroupId: "nonexistent-group" },
      }),
      LINEAGE_EDITOR_ERROR.GROUP_NOT_FOUND,
    )
  })

  it("throws GROUP_PARENT_MISMATCH when group's parentMemberId differs from input parentMemberId", async () => {
    const treeWithGroup = {
      ...defaultTree,
      visualGroups: [{ id: "group-1", parentMemberId: "member-root" }],
    }
    const db = makeMockDb({ tree: treeWithGroup, grants: [treeAdminGrant] })
    await expectRejectsWithMessage(
      applyLineageMemberPlacementUpdate({
        db: db as never,
        brand: BRAND,
        userId: USER_ID,
        // visualGroupId belongs to member-root but we say parent is member-grandchild
        input: {
          ...validPlacementInput,
          visualGroupId: "group-1",
          parentMemberId: "member-grandchild",
        },
      }),
      LINEAGE_EDITOR_ERROR.GROUP_PARENT_MISMATCH,
    )
  })

  it("throws PARENT_CYCLE when the new parent would create a cycle", async () => {
    const db = makeMockDb({ tree: defaultTree, grants: [treeAdminGrant] })
    // making root a child of grandchild creates a cycle
    await expectRejectsWithMessage(
      applyLineageMemberPlacementUpdate({
        db: db as never,
        brand: BRAND,
        userId: USER_ID,
        input: {
          ...validPlacementInput,
          memberId: "member-root",
          parentMemberId: "member-grandchild",
        },
      }),
      LINEAGE_EDITOR_ERROR.PARENT_CYCLE,
    )
  })

  it("throws EDITOR_ACCESS_REQUIRED when the user has no grants", async () => {
    const db = makeMockDb({ tree: defaultTree, grants: [] })
    await expectRejectsWithMessage(
      applyLineageMemberPlacementUpdate({
        db: db as never,
        brand: BRAND,
        userId: USER_ID,
        input: validPlacementInput,
      }),
      LINEAGE_EDITOR_ERROR.EDITOR_ACCESS_REQUIRED,
    )
  })

  it("throws NODE_EDITOR_CANNOT_REPARENT for a NODE_EDITOR grant", async () => {
    const db = makeMockDb({ tree: defaultTree, grants: [nodeEditorGrant] })
    await expectRejectsWithMessage(
      applyLineageMemberPlacementUpdate({
        db: db as never,
        brand: BRAND,
        userId: USER_ID,
        input: validPlacementInput,
      }),
      LINEAGE_EDITOR_ERROR.NODE_EDITOR_CANNOT_REPARENT,
    )
  })

  it("throws BRANCH_EDITOR_CANNOT_DETACH when branch editor tries to clear a parent", async () => {
    const db = makeMockDb({ tree: defaultTree, grants: [branchEditorGrant] })
    // childMember currently has a parent; trying to detach (null) should be blocked
    await expectRejectsWithMessage(
      applyLineageMemberPlacementUpdate({
        db: db as never,
        brand: BRAND,
        userId: USER_ID,
        input: { ...validPlacementInput, parentMemberId: null },
      }),
      LINEAGE_EDITOR_ERROR.BRANCH_EDITOR_CANNOT_DETACH,
    )
  })

  it("throws BRANCH_SCOPE_REQUIRED when branch editor moves member outside granted branch", async () => {
    // Grant scoped to child member only; moving it to grandchild (outside branch root) is blocked
    const narrowGrant: MockGrant = { role: "BRANCH_EDITOR", rootMemberId: "member-grandchild" }
    const db = makeMockDb({ tree: defaultTree, grants: [narrowGrant] })
    await expectRejectsWithMessage(
      applyLineageMemberPlacementUpdate({
        db: db as never,
        brand: BRAND,
        userId: USER_ID,
        // member-child's parent is member-root; neither child nor root is under grandchild
        input: validPlacementInput,
      }),
      LINEAGE_EDITOR_ERROR.BRANCH_SCOPE_REQUIRED,
    )
  })

  it("succeeds with TREE_EDITOR grant (non-admin tree editor)", async () => {
    const db = makeMockDb({ tree: defaultTree, grants: [treeEditorGrant] })
    const result = await applyLineageMemberPlacementUpdate({
      db: db as never,
      brand: BRAND,
      userId: USER_ID,
      input: validPlacementInput,
    })
    expect(result.treeId).toBe("tree-1")
  })

  it("succeeds when a BRANCH_EDITOR moves a member within their granted branch", async () => {
    const db = makeMockDb({ tree: defaultTree, grants: [branchEditorGrant] })
    // Move grandchild under root — both grandchild and root are in the root branch
    const result = await applyLineageMemberPlacementUpdate({
      db: db as never,
      brand: BRAND,
      userId: USER_ID,
      input: {
        ...validPlacementInput,
        memberId: "member-grandchild",
        parentMemberId: "member-root",
      },
    })
    expect(result.treeId).toBe("tree-1")
  })

  it("passes group parentMemberId into the branch scope check", async () => {
    const treeWithGroup = {
      ...defaultTree,
      visualGroups: [{ id: "group-root", parentMemberId: "member-root" }],
    }
    const db = makeMockDb({ tree: treeWithGroup, grants: [branchEditorGrant] })
    // grandchild moved to root via a group that also belongs to root
    const result = await applyLineageMemberPlacementUpdate({
      db: db as never,
      brand: BRAND,
      userId: USER_ID,
      input: {
        ...validPlacementInput,
        memberId: "member-grandchild",
        parentMemberId: "member-root",
        visualGroupId: "group-root",
      },
    })
    expect(result.treeId).toBe("tree-1")
  })
})

// ---------------------------------------------------------------------------
// applyLineagePromotionRelationshipUpdate
// ---------------------------------------------------------------------------

describe("applyLineagePromotionRelationshipUpdate", () => {
  it("creates a new relationship when none exists", async () => {
    const db = makeMockDb({
      tree: defaultTree,
      grants: [treeAdminGrant],
      currentRelationship: null,
      createdRelationship: { id: "rel-new" },
    })
    const result = await applyLineagePromotionRelationshipUpdate({
      db: db as never,
      brand: BRAND,
      userId: USER_ID,
      input: validPromotionInput,
    })
    expect(result.relationshipId).toBe("rel-new")
    expect(result.memberId).toBe("member-child")
    expect(result.treeId).toBe("tree-1")
  })

  it("updates an existing relationship when one already exists", async () => {
    const existing = makeMockRelationship()
    const db = makeMockDb({
      tree: defaultTree,
      grants: [treeAdminGrant],
      currentRelationship: existing,
      updatedRelationship: { id: "rel-existing" },
    })
    const result = await applyLineagePromotionRelationshipUpdate({
      db: db as never,
      brand: BRAND,
      userId: USER_ID,
      input: validPromotionInput,
    })
    expect(result.relationshipId).toBe("rel-existing")
  })

  it("clears the promoter (deletes relationship) when promoterMemberId is null and user has tree editor grant", async () => {
    const existing = makeMockRelationship()
    const db = makeMockDb({
      tree: defaultTree,
      grants: [treeAdminGrant],
      currentRelationship: existing,
    })
    const result = await applyLineagePromotionRelationshipUpdate({
      db: db as never,
      brand: BRAND,
      userId: USER_ID,
      input: { ...validPromotionInput, promoterMemberId: null },
    })
    expect(result.relationshipId).toBeNull()
  })

  it("returns null relationshipId when clearing a promoter that had no prior relationship", async () => {
    const db = makeMockDb({
      tree: defaultTree,
      grants: [treeAdminGrant],
      currentRelationship: null,
    })
    const result = await applyLineagePromotionRelationshipUpdate({
      db: db as never,
      brand: BRAND,
      userId: USER_ID,
      input: { ...validPromotionInput, promoterMemberId: null },
    })
    expect(result.relationshipId).toBeNull()
  })

  it("throws TREE_NOT_FOUND when the tree does not exist", async () => {
    const db = makeMockDb({ tree: null, grants: [treeAdminGrant] })
    await expectRejectsWithMessage(
      applyLineagePromotionRelationshipUpdate({
        db: db as never,
        brand: BRAND,
        userId: USER_ID,
        input: validPromotionInput,
      }),
      LINEAGE_EDITOR_ERROR.TREE_NOT_FOUND,
    )
  })

  it("throws MEMBER_NOT_FOUND when memberId is not in the tree", async () => {
    const db = makeMockDb({ tree: defaultTree, grants: [treeAdminGrant] })
    await expectRejectsWithMessage(
      applyLineagePromotionRelationshipUpdate({
        db: db as never,
        brand: BRAND,
        userId: USER_ID,
        input: { ...validPromotionInput, memberId: "does-not-exist" },
      }),
      LINEAGE_EDITOR_ERROR.MEMBER_NOT_FOUND,
    )
  })

  it("throws PROMOTER_NOT_FOUND when promoterMemberId is not in the tree", async () => {
    const db = makeMockDb({ tree: defaultTree, grants: [treeAdminGrant] })
    await expectRejectsWithMessage(
      applyLineagePromotionRelationshipUpdate({
        db: db as never,
        brand: BRAND,
        userId: USER_ID,
        input: { ...validPromotionInput, promoterMemberId: "not-in-tree" },
      }),
      LINEAGE_EDITOR_ERROR.PROMOTER_NOT_FOUND,
    )
  })

  it("throws SELF_PROMOTION when promoter and member are the same", async () => {
    const db = makeMockDb({ tree: defaultTree, grants: [treeAdminGrant] })
    await expectRejectsWithMessage(
      applyLineagePromotionRelationshipUpdate({
        db: db as never,
        brand: BRAND,
        userId: USER_ID,
        input: { ...validPromotionInput, promoterMemberId: "member-child" },
      }),
      LINEAGE_EDITOR_ERROR.SELF_PROMOTION,
    )
  })

  it("throws CLEAR_PROMOTER_REQUIRES_TREE_EDITOR when clearing without tree editor grant", async () => {
    const db = makeMockDb({ tree: defaultTree, grants: [nodeEditorGrant] })
    await expectRejectsWithMessage(
      applyLineagePromotionRelationshipUpdate({
        db: db as never,
        brand: BRAND,
        userId: USER_ID,
        input: { ...validPromotionInput, promoterMemberId: null },
      }),
      LINEAGE_EDITOR_ERROR.CLEAR_PROMOTER_REQUIRES_TREE_EDITOR,
    )
  })

  it("throws EDITOR_ACCESS_REQUIRED when the user has no grants", async () => {
    const db = makeMockDb({ tree: defaultTree, grants: [] })
    await expectRejectsWithMessage(
      applyLineagePromotionRelationshipUpdate({
        db: db as never,
        brand: BRAND,
        userId: USER_ID,
        input: validPromotionInput,
      }),
      LINEAGE_EDITOR_ERROR.EDITOR_ACCESS_REQUIRED,
    )
  })

  it("throws NODE_EDITOR_CANNOT_REPARENT for a NODE_EDITOR grant", async () => {
    const db = makeMockDb({ tree: defaultTree, grants: [nodeEditorGrant] })
    await expectRejectsWithMessage(
      applyLineagePromotionRelationshipUpdate({
        db: db as never,
        brand: BRAND,
        userId: USER_ID,
        // need a promoter so we don't hit CLEAR_PROMOTER_REQUIRES_TREE_EDITOR first
        input: validPromotionInput,
      }),
      LINEAGE_EDITOR_ERROR.NODE_EDITOR_CANNOT_REPARENT,
    )
  })

  it("throws BRANCH_SCOPE_REQUIRED when branch editor acts outside their scope", async () => {
    // Grant scoped to grandchild; member-child and member-root are outside that sub-tree
    const narrowGrant: MockGrant = { role: "BRANCH_EDITOR", rootMemberId: "member-grandchild" }
    const db = makeMockDb({ tree: defaultTree, grants: [narrowGrant] })
    await expectRejectsWithMessage(
      applyLineagePromotionRelationshipUpdate({
        db: db as never,
        brand: BRAND,
        userId: USER_ID,
        input: validPromotionInput,
      }),
      LINEAGE_EDITOR_ERROR.BRANCH_SCOPE_REQUIRED,
    )
  })

  it("includes the correct node id in the returned result", async () => {
    const db = makeMockDb({
      tree: defaultTree,
      grants: [treeAdminGrant],
      currentRelationship: null,
      createdRelationship: { id: "rel-abc" },
    })
    const result = await applyLineagePromotionRelationshipUpdate({
      db: db as never,
      brand: BRAND,
      userId: USER_ID,
      input: validPromotionInput,
    })
    expect(result.nodeId).toBe(childMember.nodeId)
    expect(result.treeSlug).toBe("tree-slug")
  })

  it("handles a rankAwardId on the member when querying the relationship", async () => {
    const memberWithRank: MockMember = {
      ...childMember,
      rankAwardId: "rank-award-1",
    }
    const treeWithRank = { ...defaultTree, members: [rootMember, memberWithRank, grandchildMember] }
    const db = makeMockDb({
      tree: treeWithRank,
      grants: [treeAdminGrant],
      currentRelationship: null,
      createdRelationship: { id: "rel-ranked" },
    })
    const result = await applyLineagePromotionRelationshipUpdate({
      db: db as never,
      brand: BRAND,
      userId: USER_ID,
      input: validPromotionInput,
    })
    expect(result.relationshipId).toBe("rel-ranked")
  })
})

// ---------------------------------------------------------------------------
// LINEAGE_EDITOR_ERROR constant shape
// ---------------------------------------------------------------------------

describe("LINEAGE_EDITOR_ERROR", () => {
  it("exposes all expected error keys", () => {
    const keys = [
      "TREE_NOT_FOUND",
      "MEMBER_NOT_FOUND",
      "PARENT_NOT_FOUND",
      "PROMOTER_NOT_FOUND",
      "GROUP_NOT_FOUND",
      "GROUP_PARENT_MISMATCH",
      "EDITOR_ACCESS_REQUIRED",
      "NODE_EDITOR_CANNOT_REPARENT",
      "BRANCH_EDITOR_CANNOT_DETACH",
      "BRANCH_SCOPE_REQUIRED",
      "PARENT_CYCLE",
      "SELF_PROMOTION",
      "CLEAR_PROMOTER_REQUIRES_TREE_EDITOR",
    ] as const

    for (const key of keys) {
      expect(typeof LINEAGE_EDITOR_ERROR[key]).toBe("string")
      expect(LINEAGE_EDITOR_ERROR[key].length).toBeGreaterThan(0)
    }
  })
})