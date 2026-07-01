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
import { projectPublicPassport } from "~/server/web/passport/public-projection"
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
  showRanks = true,
  rankAwards = [],
}: {
  id: string
  nodeId: string
  visibility: LineageVisibility
  parentId?: string | null
  groupId?: string | null
  sortOrder?: number
  showRanks?: boolean
  rankAwards?: unknown[]
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
      verificationStatus: "VERIFIED",
      bio: "public bio",
      passportId: `passport-${nodeId}`,
      // Phase 3c (SOT-ADR D1): identity is Passport-rooted; account is passport.user.
      passport: {
        id: `passport-${nodeId}`,
        displayName: `Display ${nodeId}`,
        avatarUrl: null,
        user: { id: `user-${nodeId}`, name: `User ${nodeId}`, image: null, memberships: [] },
        directoryProfile: {
          locationCity: null,
          locationRegion: null,
          locationCountry: null,
          visibility: "PUBLIC",
          showRanks,
        },
        rankAwardsEarned: rankAwards,
        affiliations: [],
      },
    },
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
  it("selects claim STATUS only — never account emails, editor grants, evidence, reviewer/claimant identity, notes, or audit logs", () => {
    const payloads = JSON.stringify({
      lineageTreePublicPayload,
      lineageNodeRowPayload,
      lineageNodeProfilePayload,
    })

    expect(payloads.includes("email")).toBe(false)
    expect(payloads.includes("accessGrants")).toBe(false)
    expect(payloads.includes("evidence")).toBe(false)
    expect(payloads.includes("auditLog")).toBe(false)
    expect(payloads.includes("password")).toBe(false)
    expect(payloads.includes("role")).toBe(false)
    expect(payloads.includes("notes")).toBe(false)
    // SESSION_0349 trust badges: claim STATUS is selected for public surfaces,
    // but claim evidence, claimant/reviewer identity, and notes never are.
    expect(payloads.includes("claimant")).toBe(false)
    expect(payloads.includes("reviewer")).toBe(false)
    expect(payloads.includes("claimRequests")).toBe(true)
    expect(payloads.includes('"status":true')).toBe(true)
  })

  // SESSION_0475: the tree/board/cards resolve the shown belt with
  // `memberTopRank(node, disciplineId)`, which `.find()`s the highest award IN the tree's
  // discipline. A `take: 1` here would load only the member's GLOBAL top award (by
  // cross-system sortOrder) → `.find(tree discipline)` misses → a BLANK belt for any
  // multi-discipline member whose top-sorting belt is in another discipline (e.g. Andre
  // Lima's TKD 8th Dan out-sorting his BJJ 3rd-degree). This guards the payload→resolver seam.
  it("lineageNodeRowPayload.rankAwardsEarned loads ALL awards (no `take`) so discipline-scoping isn't truncated", () => {
    const passportSelect = (lineageNodeRowPayload.passport as { select: Record<string, unknown> })
      .select
    const rankAwardsEarned = passportSelect.rankAwardsEarned as Record<string, unknown>
    expect(rankAwardsEarned).toBeTruthy()
    expect("take" in rankAwardsEarned).toBe(false)
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

  it("redacts rank awards when the public profile opts out of rank display", () => {
    const hiddenRankTree = {
      ...publicTree,
      defaultRootMemberId: "rank-hidden-member",
      members: [
        member({
          id: "rank-hidden-member",
          nodeId: "rank-hidden-node",
          visibility: "PUBLIC" as LineageVisibility,
          showRanks: false,
          rankAwards: [{ id: "rank-award-1", awardedAt: "2020-01-01" }],
        }),
      ],
      visualGroups: [],
    }

    const result = materializeLineageTreeResult(hiddenRankTree as never)

    expect(result.members[0]?.node.passport?.rankAwardsEarned).toEqual([])
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

  // SESSION_0266_FINDING_01 — `user.memberships[].rank.{name,shortName}` was
  // an adjacent rank-leak path the SESSION_0264 / SESSION_0265 redactions
  // missed. `redactLineageNodeProfileRanks` must null both `rankAwards`
  // (existing contract) and embedded `Membership.rank` (new contract).
  it("nulls memberships[].rank and clears rankAwards when showRanks=false", () => {
    const profile = {
      id: "node-hidden",
      slug: "node-hidden",
      visibility: "PUBLIC" as LineageVisibility,
      isVerified: true,
      verificationStatus: "VERIFIED",
      bio: null,
      passportId: "passport-hidden",
      createdAt: new Date("2020-01-01"),
      updatedAt: new Date("2020-01-01"),
      // Phase 3c (SOT-ADR D1): identity is Passport-rooted; account (memberships) is passport.user.
      passport: {
        id: "passport-hidden",
        displayName: "Hidden",
        avatarUrl: null,
        directoryProfile: {
          locationCity: null,
          locationRegion: null,
          locationCountry: null,
          visibility: "PUBLIC",
          showRanks: false,
        },
        rankAwardsEarned: [{ id: "ra-1", awardedAt: new Date(), rank: { name: "Hidden BB" } }],
        affiliations: [],
        user: {
          id: "user-hidden",
          name: "Hidden User",
          image: null,
          memberships: [
            {
              id: "m-1",
              joinedAt: new Date(),
              discipline: { id: "d-1", name: "BJJ", slug: "bjj", code: "BJJ" },
              organization: {
                id: "o-1",
                name: "Org",
                slug: "org",
                type: "SCHOOL",
                city: null,
                state: null,
                country: null,
              },
              rank: { id: "r-1", name: "Hidden Membership Rank", shortName: "HMR" },
            },
          ],
        },
      },
      relationshipsTo: [],
    }

    const dto = projectPublicPassport(profile.passport as never, {})

    // showRanks=false → rank gate closes: DTO exposes no ranks
    expect(dto.ranks.length).toBe(0)
  })

  it("preserves memberships[].rank when showRanks=true", () => {
    const profile = {
      id: "node-shown",
      slug: "node-shown",
      visibility: "PUBLIC" as LineageVisibility,
      isVerified: true,
      verificationStatus: "VERIFIED",
      bio: null,
      passportId: "passport-shown",
      createdAt: new Date("2020-01-01"),
      updatedAt: new Date("2020-01-01"),
      // Phase 3c (SOT-ADR D1): identity is Passport-rooted; account (memberships) is passport.user.
      passport: {
        id: "passport-shown",
        displayName: "Shown",
        avatarUrl: null,
        directoryProfile: {
          locationCity: null,
          locationRegion: null,
          locationCountry: null,
          visibility: "PUBLIC",
          showRanks: true,
        },
        rankAwardsEarned: [{ id: "ra-2", awardedAt: new Date(), rank: { name: "Visible BB" } }],
        affiliations: [],
        user: {
          id: "user-shown",
          name: "Shown User",
          image: null,
          memberships: [
            {
              id: "m-2",
              joinedAt: new Date(),
              discipline: { id: "d-1", name: "BJJ", slug: "bjj", code: "BJJ" },
              organization: {
                id: "o-1",
                name: "Org",
                slug: "org",
                type: "SCHOOL",
                city: null,
                state: null,
                country: null,
              },
              rank: { id: "r-2", name: "Shown Membership Rank", shortName: "SMR" },
            },
          ],
        },
      },
      relationshipsTo: [],
    }

    const dto = projectPublicPassport(profile.passport as never, {})

    // showRanks=true → rank gate opens: DTO exposes ranks
    expect(dto.ranks.length).toBeGreaterThan(0)
  })
})
