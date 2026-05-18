/**
 * Lineage public payload / visibility hardening tests.
 *
 * Run: cd apps/web && bun test server/web/lineage/queries.visibility.test.ts
 *
 * These are intentionally mostly pure tests. They protect the public read-model
 * allowlist and materializer from leaking private members/groups/root pointers.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it, mock } from "bun:test"

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidatePath: () => {},
  revalidateTag: () => {},
  updateTag: () => {},
}))

import type { LineageVisibility } from "~/.generated/prisma/client"
import {
  lineageNodeProfilePayload,
  lineageNodeRowPayload,
  lineageTreePublicPayload,
} from "~/server/web/lineage/payloads"
import {
  materializeLineageTreeResult,
  resolveLineageVisibilityScope,
} from "~/server/web/lineage/queries"

function member({
  id,
  nodeId,
  visibility,
  parentId = null,
  groupId = null,
  sortOrder = 0,
}: {
  id: string
  nodeId: string
  visibility: LineageVisibility
  parentId?: string | null
  groupId?: string | null
  sortOrder?: number
}) {
  return {
    id,
    visualSortOrder: sortOrder,
    showPromotionDatePublic: true,
    showRankPublic: true,
    isCollapsedDefault: false,
    primaryVisualParentMemberId: parentId,
    visualGroupId: groupId,
    treeId: "tree-1",
    nodeId,
    node: {
      id: nodeId,
      slug: nodeId,
      visibility,
      isVerified: true,
      bio: "public bio",
      userId: `user-${nodeId}`,
      user: {
        id: `user-${nodeId}`,
        name: `User ${nodeId}`,
        image: null,
        passport: { displayName: `Display ${nodeId}` },
        directoryProfile: null,
        rankAwards: [],
        memberships: [],
      },
    },
    selectedRankAward: null,
  }
}

const publicTree = {
  id: "tree-1",
  brand: "BASELINE_MARTIAL_ARTS",
  scopeType: "DISCIPLINE",
  slug: "test-tree",
  name: "Test Tree",
  description: null,
  visibility: "PUBLIC",
  isPublished: true,
  defaultRootMemberId: "private-root-member",
  organizationId: null,
  disciplineId: null,
  styleId: null,
  ownerNodeId: null,
  members: [
    member({
      id: "private-root-member",
      nodeId: "private-root-node",
      visibility: "PRIVATE" as LineageVisibility,
      groupId: "private-group",
    }),
    member({
      id: "public-child-member",
      nodeId: "public-child-node",
      visibility: "PUBLIC" as LineageVisibility,
      parentId: "private-root-member",
      groupId: "public-group",
    }),
    member({
      id: "restricted-member",
      nodeId: "restricted-node",
      visibility: "RESTRICTED" as LineageVisibility,
      parentId: "private-root-member",
      groupId: "restricted-group",
    }),
  ],
  visualGroups: [
    {
      id: "private-group",
      label: "Private Group",
      groupType: "CUSTOM",
      promotionDate: null,
      sortOrder: 1,
      showPublicLabel: true,
      isCollapsedDefault: false,
      parentMemberId: "private-root-member",
      treeId: "tree-1",
    },
    {
      id: "public-group",
      label: "Public Group",
      groupType: "CUSTOM",
      promotionDate: null,
      sortOrder: 2,
      showPublicLabel: true,
      isCollapsedDefault: false,
      parentMemberId: "private-root-member",
      treeId: "tree-1",
    },
    {
      id: "restricted-group",
      label: "Restricted Group",
      groupType: "CUSTOM",
      promotionDate: null,
      sortOrder: 3,
      showPublicLabel: true,
      isCollapsedDefault: false,
      parentMemberId: "restricted-member",
      treeId: "tree-1",
    },
  ],
}

describe("lineage public payload allowlists", () => {
  it("does not select account emails, editor grants, claims, evidence, or audit logs", () => {
    const payloads = JSON.stringify({
      lineageTreePublicPayload,
      lineageNodeRowPayload,
      lineageNodeProfilePayload,
    })

    expect(payloads.includes("email")).toBe(false)
    expect(payloads.includes("accessGrants")).toBe(false)
    expect(payloads.includes("claimRequests")).toBe(false)
    expect(payloads.includes("evidence")).toBe(false)
    expect(payloads.includes("auditLog")).toBe(false)
    expect(payloads.includes("password")).toBe(false)
    expect(payloads.includes("role")).toBe(false)
  })
})

describe("lineage tree visibility materialization", () => {
  it("public materializer drops private/restricted members", () => {
    const result = materializeLineageTreeResult(publicTree as never)

    expect(result.members.map(member => member.id)).toEqual(["public-child-member"])
    expect(result.defaultRootMemberId).toBeNull()
    expect(result.tree.defaultRootMemberId).toBeNull()
  })

  it("normalizes parent pointers that reference filtered-out members", () => {
    const result = materializeLineageTreeResult(publicTree as never)
    expect(result.members[0]?.primaryVisualParentMemberId).toBeNull()
  })

  it("keeps only visual groups referenced by surviving visible members", () => {
    const result = materializeLineageTreeResult(publicTree as never)
    expect(result.visualGroups.map(group => group.id)).toEqual(["public-group"])
    expect(result.visualGroups[0]?.parentMemberId).toBeNull()
  })

  it("widens viewer scope without ever including PRIVATE in shared public paths", () => {
    expect(resolveLineageVisibilityScope({ authenticated: false, isOwner: false })).toEqual([
      "PUBLIC",
    ])
    expect(resolveLineageVisibilityScope({ authenticated: true, isOwner: false })).toEqual([
      "PUBLIC",
      "UNLISTED",
    ])
    expect(resolveLineageVisibilityScope({ authenticated: true, isOwner: true })).toEqual([
      "PUBLIC",
      "UNLISTED",
      "RESTRICTED",
    ])

    expect(
      resolveLineageVisibilityScope({ authenticated: true, isOwner: true }).includes(
        "PRIVATE" as LineageVisibility,
      ),
    ).toBe(false)
  })
})
