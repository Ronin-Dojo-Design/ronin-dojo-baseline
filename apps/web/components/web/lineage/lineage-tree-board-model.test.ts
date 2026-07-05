// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  ELITE_LINEAGE_LISTING_RENDER_POLICY,
  FREE_LINEAGE_LISTING_RENDER_POLICY,
  type LineageListingRenderPolicy,
} from "~/lib/entitlements/lineage-tier-policy"
import type { LineageEditorCapability } from "~/server/web/lineage/editor-queries"
import type { LineageNodeProfile, LineageTreeMemberRow } from "~/server/web/lineage/payloads"
import {
  buildPromoterChangeContext,
  descendantMemberIds,
  displayNameForMember,
  findMemberByNodeId,
  resolveEffectiveRenderPolicy,
} from "./lineage-tree-board-model"

/**
 * WL-P2-22: pins the pure derivation helpers extracted from `LineageTreeBoard`
 * during the behavior-preserving refactor. Fixtures cast partial shapes — the
 * helpers only read `id`, `nodeId`, `primaryVisualParentMemberId`, and
 * `node.passport` (for the display name), so a full Prisma payload is unneeded.
 */

function member(
  id: string,
  parentId: string | null,
  opts: { nodeId?: string; displayName?: string | null } = {},
): LineageTreeMemberRow {
  const displayName = "displayName" in opts ? opts.displayName : `Member ${id}`
  return {
    id,
    primaryVisualParentMemberId: parentId,
    nodeId: opts.nodeId ?? `node-${id}`,
    node: { passport: { displayName } },
  } as unknown as LineageTreeMemberRow
}

// root -> a, b ; a -> a1 ; a1 -> a1x ; b -> b1
const members: LineageTreeMemberRow[] = [
  member("root", null),
  member("a", "root"),
  member("b", "root"),
  member("a1", "a"),
  member("a1x", "a1"),
  member("b1", "b"),
]

const profile = {
  passport: { rankAwardsEarned: [{ id: "award-top" }, { id: "award-old" }] },
} as unknown as LineageNodeProfile

const editorCap = { canEditTree: true, canManageGroups: false } as LineageEditorCapability

describe("displayNameForMember", () => {
  it("returns the passport display name", () => {
    expect(displayNameForMember(member("x", null, { displayName: "Rigan Machado" }))).toBe(
      "Rigan Machado",
    )
  })

  it("falls back to Unnamed when there is no display name", () => {
    expect(displayNameForMember(member("x", null, { displayName: null }))).toBe("Unnamed")
  })
})

describe("descendantMemberIds", () => {
  it("collects all transitive descendants", () => {
    expect([...descendantMemberIds(members, "root")].sort()).toEqual(
      ["a", "a1", "a1x", "b", "b1"].sort(),
    )
  })

  it("collects a deep subtree from a non-root member", () => {
    expect([...descendantMemberIds(members, "a")].sort()).toEqual(["a1", "a1x"].sort())
  })

  it("returns an empty set for a leaf", () => {
    expect(descendantMemberIds(members, "a1x").size).toBe(0)
  })

  it("returns an empty set for an unknown member id", () => {
    expect(descendantMemberIds(members, "ghost").size).toBe(0)
  })
})

describe("findMemberByNodeId", () => {
  it("finds a member by its node id", () => {
    expect(findMemberByNodeId(members, "node-a")?.id).toBe("a")
  })

  it("returns null for a null node id", () => {
    expect(findMemberByNodeId(members, null)).toBeNull()
  })

  it("returns null when members is undefined", () => {
    expect(findMemberByNodeId(undefined, "node-a")).toBeNull()
  })

  it("returns null when no member matches", () => {
    expect(findMemberByNodeId(members, "node-missing")).toBeNull()
  })
})

describe("resolveEffectiveRenderPolicy", () => {
  it("returns ELITE when the viewer can edit the tree", () => {
    expect(resolveEffectiveRenderPolicy({ capability: editorCap })).toBe(
      ELITE_LINEAGE_LISTING_RENDER_POLICY,
    )
  })

  it("returns ELITE when the viewer can manage groups", () => {
    const cap = { canEditTree: false, canManageGroups: true } as LineageEditorCapability
    expect(resolveEffectiveRenderPolicy({ capability: cap })).toBe(
      ELITE_LINEAGE_LISTING_RENDER_POLICY,
    )
  })

  it("passes through an explicit render policy for non-editors", () => {
    const custom = { foo: "bar" } as unknown as LineageListingRenderPolicy
    expect(resolveEffectiveRenderPolicy({ renderPolicy: custom })).toBe(custom)
  })

  it("defaults to FREE when there is no capability and no render policy", () => {
    expect(resolveEffectiveRenderPolicy({})).toBe(FREE_LINEAGE_LISTING_RENDER_POLICY)
  })
})

describe("buildPromoterChangeContext", () => {
  const selectedMember = member("a", "root")

  it("returns null without a treeId", () => {
    expect(
      buildPromoterChangeContext({
        capability: editorCap,
        selectedProfile: profile,
        selectedMember,
        members,
      }),
    ).toBeNull()
  })

  it("returns null when the viewer cannot edit the tree", () => {
    expect(
      buildPromoterChangeContext({
        treeId: "tree-1",
        capability: { canEditTree: false } as LineageEditorCapability,
        selectedProfile: profile,
        selectedMember,
        members,
      }),
    ).toBeNull()
  })

  it("returns null with no selected profile or member", () => {
    expect(
      buildPromoterChangeContext({
        treeId: "tree-1",
        capability: editorCap,
        selectedProfile: null,
        selectedMember,
        members,
      }),
    ).toBeNull()
    expect(
      buildPromoterChangeContext({
        treeId: "tree-1",
        capability: editorCap,
        selectedProfile: profile,
        selectedMember: null,
        members,
      }),
    ).toBeNull()
  })

  it("builds the context, defaulting to the top awarded rank and excluding self + descendants", () => {
    const ctx = buildPromoterChangeContext({
      treeId: "tree-1",
      capability: editorCap,
      selectedProfile: profile,
      selectedMember,
      members,
    })
    expect(ctx).not.toBeNull()
    expect(ctx?.treeId).toBe("tree-1")
    expect(ctx?.memberId).toBe("a")
    // Awarded truth: defaults to the first (top) awarded rank id.
    expect(ctx?.currentRankAwardId).toBe("award-top")
    expect(ctx?.rankAwards).toHaveLength(2)
    // Candidates exclude the member itself ("a") and its descendants ("a1", "a1x").
    const candidateIds = ctx?.candidates.map(c => c.memberId).sort()
    expect(candidateIds).toEqual(["b", "b1", "root"].sort())
  })

  it("defaults currentRankAwardId to null when there are no awards", () => {
    const noAwards = { passport: { rankAwardsEarned: [] } } as unknown as LineageNodeProfile
    const ctx = buildPromoterChangeContext({
      treeId: "tree-1",
      capability: editorCap,
      selectedProfile: noAwards,
      selectedMember,
      members,
    })
    expect(ctx?.currentRankAwardId).toBeNull()
    expect(ctx?.rankAwards).toEqual([])
  })
})
