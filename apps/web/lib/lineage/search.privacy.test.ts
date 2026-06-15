/**
 * Lineage public-search privacy test (WL-P1-4, SESSION_0334).
 *
 * Run: cd apps/web && bun test lib/lineage/search.privacy.test.ts
 *
 * Proves the public lineage search bar cannot surface non-PUBLIC members. The
 * search is a pure client-side projection over the `members` array the canvas
 * holds — and that array is the *visibility-materialized* set, where
 * `materializeLineageTreeResult` has already dropped PRIVATE/RESTRICTED members.
 * So a private member's name is unsearchable not because the matcher hides it,
 * but because it never reaches the matcher. This test wires the real materializer
 * to the real matcher to lock that pipeline.
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
import type { CanvasMember } from "~/lib/lineage/canvas-model"
import { findLineageMatches } from "~/lib/lineage/search"
import { materializeLineageTreeResult } from "~/server/web/lineage/queries"

function member({
  id,
  nodeId,
  displayName,
  visibility,
  parentId = null,
}: {
  id: string
  nodeId: string
  displayName: string
  visibility: LineageVisibility
  parentId?: string | null
}) {
  return {
    id,
    visualSortOrder: 0,
    showPromotionDatePublic: true,
    showRankPublic: true,
    isCollapsedDefault: false,
    primaryVisualParentMemberId: parentId,
    visualGroupId: null,
    treeId: "tree-1",
    nodeId,
    selectedRankAward: null,
    node: {
      id: nodeId,
      slug: nodeId,
      visibility,
      isVerified: true,
      verificationStatus: "VERIFIED",
      bio: "public bio",
      passportId: `passport-${nodeId}`,
      // Phase 3c (SOT-ADR D1): identity is Passport-rooted; account is passport.user.
      passport: {
        id: `passport-${nodeId}`,
        displayName,
        avatarUrl: null,
        user: { id: `user-${nodeId}`, name: `Name ${nodeId}`, image: null, memberships: [] },
        directoryProfile: {
          locationCity: null,
          locationRegion: null,
          locationCountry: null,
          visibility: "PUBLIC",
          showRanks: true,
        },
        rankAwardsEarned: [],
        affiliations: [],
      },
    },
  }
}

const mixedVisibilityTree = {
  id: "tree-1",
  brand: "BASELINE_MARTIAL_ARTS",
  scopeType: "DISCIPLINE",
  slug: "test-tree",
  name: "Test Tree",
  description: null,
  visibility: "PUBLIC",
  isPublished: true,
  defaultRootMemberId: "public-root-member",
  organizationId: null,
  disciplineId: null,
  styleId: null,
  ownerNodeId: null,
  members: [
    member({
      id: "public-root-member",
      nodeId: "public-root-node",
      displayName: "Helio Gracie",
      visibility: "PUBLIC" as LineageVisibility,
    }),
    member({
      id: "private-member",
      nodeId: "private-node",
      displayName: "Secret Student",
      visibility: "PRIVATE" as LineageVisibility,
      parentId: "public-root-member",
    }),
    member({
      id: "restricted-member",
      nodeId: "restricted-node",
      displayName: "Restricted Rosa",
      visibility: "RESTRICTED" as LineageVisibility,
      parentId: "public-root-member",
    }),
  ],
  visualGroups: [],
}

describe("public lineage search cannot surface non-PUBLIC members", () => {
  const result = materializeLineageTreeResult(mixedVisibilityTree as never)
  // The canvas feeds the search bar exactly the materialized member set.
  const searchInput = result.members as unknown as CanvasMember[]

  it("the materializer already dropped PRIVATE/RESTRICTED before search runs", () => {
    expect(searchInput.map(m => m.id)).toEqual(["public-root-member"])
  })

  it("searching a PRIVATE member's display name yields no match", () => {
    expect(findLineageMatches(searchInput, "Secret Student")).toHaveLength(0)
    expect(findLineageMatches(searchInput, "secret")).toHaveLength(0)
  })

  it("searching a RESTRICTED member's display name yields no match", () => {
    expect(findLineageMatches(searchInput, "Restricted Rosa")).toHaveLength(0)
    expect(findLineageMatches(searchInput, "rosa")).toHaveLength(0)
  })

  it("searching the surviving PUBLIC member still works", () => {
    const matches = findLineageMatches(searchInput, "Helio")
    expect(matches).toHaveLength(1)
    expect(matches[0]?.member.id).toBe("public-root-member")
  })

  it("is a pure projection — every match comes from the input set", () => {
    const inputIds = new Set(searchInput.map(m => m.id))
    for (const match of findLineageMatches(searchInput, "a")) {
      expect(inputIds.has(match.member.id)).toBe(true)
    }
  })
})
