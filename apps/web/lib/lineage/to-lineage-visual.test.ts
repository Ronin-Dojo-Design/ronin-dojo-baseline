import assert from "node:assert/strict"
import { describe, test } from "node:test"
import type { LineageTreeMemberRow } from "~/server/web/lineage/payloads"
import { toLineageVisual } from "~/lib/lineage/to-lineage-visual"

function makeMember({
  id,
  nodeId = `node-${id}`,
  name = id,
  displayName = null,
  avatarUrl = null,
  parentId = null,
  groupId = null,
  isVerified = false,
  verificationStatus = "UNVERIFIED" as const,
  isPlaceholder = false,
  isClaimable = false,
  claimRequests = [] as Array<{
    status: "APPROVED" | "PENDING" | "NEEDS_INFO" | "REJECTED" | "WITHDRAWN"
  }>,
  colorHex = null as string | null,
  rankName = "Black Belt",
  disciplineName = null as string | null,
}: {
  id: string
  nodeId?: string
  name?: string
  displayName?: string | null
  avatarUrl?: string | null
  parentId?: string | null
  groupId?: string | null
  isVerified?: boolean
  verificationStatus?: "VERIFIED" | "DISPUTED" | "UNVERIFIED" | "UNDER_REVIEW"
  isPlaceholder?: boolean
  isClaimable?: boolean
  claimRequests?: Array<{
    status: "APPROVED" | "PENDING" | "NEEDS_INFO" | "REJECTED" | "WITHDRAWN"
  }>
  colorHex?: string | null
  rankName?: string
  disciplineName?: string | null
}): LineageTreeMemberRow {
  return {
    id,
    nodeId,
    primaryVisualParentMemberId: parentId,
    visualGroupId: groupId,
    isClaimable,
    node: {
      id: nodeId,
      slug: id,
      visibility: "PUBLIC",
      isVerified,
      verificationStatus,
      bio: null,
      passportId: `passport-${id}`,
      claimRequests,
      // Phase 3c (SOT-ADR D1): identity is Passport-rooted; placeholder = accountless (user null).
      passport: {
        id: `passport-${id}`,
        displayName,
        avatarUrl,
        user: isPlaceholder ? null : { id: `user-${id}`, name, image: null, memberships: [] },
        directoryProfile: null,
        rankAwardsEarned: colorHex
          ? [
              {
                id: `ra-${id}`,
                awardedAt: new Date(),
                location: null,
                rank: {
                  id: `rank-${id}`,
                  name: rankName,
                  shortName: null,
                  colorHex,
                  sortOrder: 10,
                  rankSystem: {
                    id: "rs-1",
                    name: "BJJ",
                    discipline: disciplineName
                      ? { id: "d-1", name: disciplineName, slug: "bjj", code: "BJJ" }
                      : null,
                  },
                },
                awardedBy: null,
                awardedByPassport: null,
              },
            ]
          : [],
        affiliations: [],
      },
    },
  } as unknown as LineageTreeMemberRow
}

describe("toLineageVisual", () => {
  test("maps basic node fields from member", () => {
    const m = makeMember({ id: "m1", nodeId: "node-1", name: "Alice" })
    const { nodes } = toLineageVisual([m])
    assert.equal(nodes.length, 1)
    const n = nodes[0]!
    assert.equal(n.id, "m1")
    assert.equal(n.nodeId, "node-1")
    assert.equal(n.displayName, "Alice")
    assert.equal(n.slug, "m1")
    assert.equal(n.avatar, null)
    assert.equal(n.colorHex, null)
    assert.equal(n.rankLabel, null)
    assert.equal(n.primaryVisualParentMemberId, null)
    assert.equal(n.visualGroupId, null)
  })

  test("prefers passport displayName over user.name", () => {
    const m = makeMember({ id: "m1", name: "User Name", displayName: "Passport Name" })
    const { nodes } = toLineageVisual([m])
    assert.equal(nodes[0]!.displayName, "Passport Name")
  })

  test("maps colorHex and rankLabel from the highest awarded rank", () => {
    const m = makeMember({
      id: "m1",
      colorHex: "#1a1a1a",
      rankName: "Black Belt",
      disciplineName: "BJJ",
    })
    const { nodes } = toLineageVisual([m])
    const n = nodes[0]!
    assert.equal(n.colorHex, "#1a1a1a")
    assert.equal(n.rankLabel, "Black Belt · BJJ")
  })

  test("resolves trustStatus via resolveLineageTrustStatus", () => {
    const verified = makeMember({ id: "m1", isVerified: true })
    const disputed = makeMember({ id: "m2", verificationStatus: "DISPUTED" })
    const pending = makeMember({
      id: "m3",
      claimRequests: [{ status: "PENDING" }],
    })
    const imported = makeMember({ id: "m4", isPlaceholder: true })

    const { nodes } = toLineageVisual([verified, disputed, pending, imported])
    assert.equal(nodes[0]!.trustStatus, "verified")
    assert.equal(nodes[1]!.trustStatus, "disputed")
    assert.equal(nodes[2]!.trustStatus, "claim-pending")
    assert.equal(nodes[3]!.trustStatus, "imported")
  })

  test("isFocal is true only for mainMemberId", () => {
    const a = makeMember({ id: "m1" })
    const b = makeMember({ id: "m2" })
    const c = makeMember({ id: "m3" })
    const { nodes } = toLineageVisual([a, b, c], { mainMemberId: "m2" })
    assert.equal(nodes[0]!.isFocal, false)
    assert.equal(nodes[1]!.isFocal, true)
    assert.equal(nodes[2]!.isFocal, false)
  })

  test("isFocal defaults to false when mainMemberId is not set", () => {
    const m = makeMember({ id: "m1" })
    const { nodes } = toLineageVisual([m])
    assert.equal(nodes[0]!.isFocal, false)
  })

  test("claimable is true when isClaimable=true and no approved claim", () => {
    const claimable = makeMember({ id: "m1", isClaimable: true })
    const notClaimable = makeMember({ id: "m2", isClaimable: false })
    const claimed = makeMember({
      id: "m3",
      isClaimable: true,
      claimRequests: [{ status: "APPROVED" }],
    })
    const { nodes } = toLineageVisual([claimable, notClaimable, claimed])
    assert.equal(nodes[0]!.claimable, true)
    assert.equal(nodes[1]!.claimable, false)
    assert.equal(nodes[2]!.claimable, false)
  })

  test("secondaryLinks is empty when no relationships provided", () => {
    const a = makeMember({ id: "m1" })
    const b = makeMember({ id: "m2", parentId: "m1" })
    const { secondaryLinks } = toLineageVisual([a, b])
    assert.equal(secondaryLinks.length, 0)
  })

  test("secondaryLinks skips relationship that matches primaryVisualParentMemberId", () => {
    const a = makeMember({ id: "m1", nodeId: "node-1" })
    const b = makeMember({ id: "m2", nodeId: "node-2", parentId: "m1" })
    const { secondaryLinks } = toLineageVisual([a, b], {
      relationships: [{ fromNodeId: "node-1", toNodeId: "node-2", type: "INSTRUCTOR_STUDENT" }],
    })
    assert.equal(secondaryLinks.length, 0)
  })

  test("secondaryLinks includes genuine secondary relationship", () => {
    const root = makeMember({
      id: "m1",
      nodeId: "node-1",
      colorHex: "#1a1a1a",
      rankName: "Black Belt",
    })
    const secondary = makeMember({
      id: "m2",
      nodeId: "node-2",
      colorHex: "#6f4e37",
      rankName: "Brown Belt",
    })
    const student = makeMember({ id: "m3", nodeId: "node-3", parentId: "m1" })
    const { secondaryLinks } = toLineageVisual([root, secondary, student], {
      relationships: [
        { fromNodeId: "node-1", toNodeId: "node-3", type: "INSTRUCTOR_STUDENT" },
        { fromNodeId: "node-2", toNodeId: "node-3", type: "INSTRUCTOR_STUDENT" },
      ],
    })
    assert.equal(secondaryLinks.length, 1)
    assert.equal(secondaryLinks[0]!.fromMemberId, "m2")
    assert.equal(secondaryLinks[0]!.toMemberId, "m3")
    assert.equal(secondaryLinks[0]!.colorHex, "#6f4e37")
  })

  test("secondaryLinks colorHex is null when from-member has no rank", () => {
    const instructor = makeMember({ id: "m1", nodeId: "node-1" })
    const primary = makeMember({ id: "m2", nodeId: "node-2" })
    const student = makeMember({ id: "m3", nodeId: "node-3", parentId: "m2" })
    const { secondaryLinks } = toLineageVisual([instructor, primary, student], {
      relationships: [{ fromNodeId: "node-1", toNodeId: "node-3", type: "INSTRUCTOR_STUDENT" }],
    })
    assert.equal(secondaryLinks.length, 1)
    assert.equal(secondaryLinks[0]!.colorHex, null)
  })

  test("secondaryLinks ignores relationships where endpoint is not in tree", () => {
    const a = makeMember({ id: "m1", nodeId: "node-1" })
    const { secondaryLinks } = toLineageVisual([a], {
      relationships: [
        { fromNodeId: "node-1", toNodeId: "node-MISSING", type: "INSTRUCTOR_STUDENT" },
      ],
    })
    assert.equal(secondaryLinks.length, 0)
  })

  test("empty members returns empty result", () => {
    const { nodes, secondaryLinks } = toLineageVisual([])
    assert.equal(nodes.length, 0)
    assert.equal(secondaryLinks.length, 0)
  })
})
