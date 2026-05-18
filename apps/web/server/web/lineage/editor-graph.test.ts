/**
 * Lineage editor graph guard tests.
 *
 * Run: cd apps/web && bun test server/web/lineage/editor-graph.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  buildLineageParentLookup,
  isLineageMemberInBranch,
  wouldCreateLineageParentCycle,
  type LineageEditorGraphMember,
} from "~/server/web/lineage/editor-graph"

const members: LineageEditorGraphMember[] = [
  { id: "root", primaryVisualParentMemberId: null },
  { id: "child-a", primaryVisualParentMemberId: "root" },
  { id: "child-b", primaryVisualParentMemberId: "root" },
  { id: "grandchild-a", primaryVisualParentMemberId: "child-a" },
  { id: "external-root", primaryVisualParentMemberId: null },
]

describe("lineage editor graph guards", () => {
  it("detects whether a member is inside a granted branch", () => {
    expect(
      isLineageMemberInBranch({
        memberId: "root",
        rootMemberId: "root",
        members,
      }),
    ).toBe(true)

    expect(
      isLineageMemberInBranch({
        memberId: "grandchild-a",
        rootMemberId: "child-a",
        members,
      }),
    ).toBe(true)

    expect(
      isLineageMemberInBranch({
        memberId: "child-b",
        rootMemberId: "child-a",
        members,
      }),
    ).toBe(false)

    expect(
      isLineageMemberInBranch({
        memberId: "external-root",
        rootMemberId: "root",
        members,
      }),
    ).toBe(false)
  })

  it("blocks visual parent cycles", () => {
    expect(
      wouldCreateLineageParentCycle({
        memberId: "root",
        candidateParentMemberId: "grandchild-a",
        members,
      }),
    ).toBe(true)

    expect(
      wouldCreateLineageParentCycle({
        memberId: "child-a",
        candidateParentMemberId: "child-a",
        members,
      }),
    ).toBe(true)

    expect(
      wouldCreateLineageParentCycle({
        memberId: "child-b",
        candidateParentMemberId: "child-a",
        members,
      }),
    ).toBe(false)

    expect(
      wouldCreateLineageParentCycle({
        memberId: "child-a",
        candidateParentMemberId: null,
        members,
      }),
    ).toBe(false)
  })
})

describe("buildLineageParentLookup", () => {
  it("returns an empty map for an empty members list", () => {
    const lookup = buildLineageParentLookup([])
    expect(lookup.size).toBe(0)
  })

  it("maps each member id to its parent id", () => {
    const lookup = buildLineageParentLookup(members)
    expect(lookup.get("root")).toBeNull()
    expect(lookup.get("child-a")).toBe("root")
    expect(lookup.get("child-b")).toBe("root")
    expect(lookup.get("grandchild-a")).toBe("child-a")
    expect(lookup.get("external-root")).toBeNull()
  })

  it("last duplicate id wins (map semantics)", () => {
    const dupes: LineageEditorGraphMember[] = [
      { id: "x", primaryVisualParentMemberId: "a" },
      { id: "x", primaryVisualParentMemberId: "b" },
    ]
    const lookup = buildLineageParentLookup(dupes)
    expect(lookup.get("x")).toBe("b")
  })
})

describe("isLineageMemberInBranch — extra edge cases", () => {
  it("returns false when memberId is not in the members list at all", () => {
    expect(
      isLineageMemberInBranch({
        memberId: "unknown-member",
        rootMemberId: "root",
        members,
      }),
    ).toBe(false)
  })

  it("returns false when rootMemberId is not an ancestor and not equal", () => {
    expect(
      isLineageMemberInBranch({
        memberId: "child-a",
        rootMemberId: "child-b",
        members,
      }),
    ).toBe(false)
  })

  it("handles a pre-existing cycle in the graph without infinite loop", () => {
    // Build a malformed graph with a parent cycle: a -> b -> a
    const cyclic: LineageEditorGraphMember[] = [
      { id: "a", primaryVisualParentMemberId: "b" },
      { id: "b", primaryVisualParentMemberId: "a" },
      { id: "orphan", primaryVisualParentMemberId: null },
    ]
    // Neither a nor b can reach "orphan", so must return false without looping
    expect(
      isLineageMemberInBranch({
        memberId: "a",
        rootMemberId: "orphan",
        members: cyclic,
      }),
    ).toBe(false)
  })

  it("returns true for a deep descendant chain", () => {
    const deep: LineageEditorGraphMember[] = [
      { id: "l0", primaryVisualParentMemberId: null },
      { id: "l1", primaryVisualParentMemberId: "l0" },
      { id: "l2", primaryVisualParentMemberId: "l1" },
      { id: "l3", primaryVisualParentMemberId: "l2" },
      { id: "l4", primaryVisualParentMemberId: "l3" },
    ]
    expect(
      isLineageMemberInBranch({
        memberId: "l4",
        rootMemberId: "l0",
        members: deep,
      }),
    ).toBe(true)
  })
})

describe("wouldCreateLineageParentCycle — extra edge cases", () => {
  it("detects a cycle through a longer ancestor chain", () => {
    // root -> child-a -> grandchild-a; making root a child of grandchild-a is a cycle
    expect(
      wouldCreateLineageParentCycle({
        memberId: "child-a",
        candidateParentMemberId: "grandchild-a",
        members,
      }),
    ).toBe(true)
  })

  it("returns false when the candidate is a sibling (not an ancestor)", () => {
    expect(
      wouldCreateLineageParentCycle({
        memberId: "grandchild-a",
        candidateParentMemberId: "child-b",
        members,
      }),
    ).toBe(false)
  })

  it("returns false when members list is empty", () => {
    expect(
      wouldCreateLineageParentCycle({
        memberId: "x",
        candidateParentMemberId: "y",
        members: [],
      }),
    ).toBe(false)
  })

  it("handles a pre-existing cycle in the graph without infinite loop", () => {
    // a -> b -> a; trying to set a's parent to b should detect cycle via visited guard
    const cyclic: LineageEditorGraphMember[] = [
      { id: "a", primaryVisualParentMemberId: "b" },
      { id: "b", primaryVisualParentMemberId: "a" },
    ]
    expect(
      wouldCreateLineageParentCycle({
        memberId: "c",
        candidateParentMemberId: "b",
        members: cyclic,
      }),
    ).toBe(true) // visited guard fires on the cycle
  })
})
