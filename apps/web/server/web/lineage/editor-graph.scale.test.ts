/**
 * Lineage editor graph scale tests.
 *
 * Run: cd apps/web && bun test server/web/lineage/editor-graph.scale.test.ts
 *
 * Pure tests only. These guard against accidental O(infinite) behavior in the
 * branch/cycle helpers before large public lineage trees become normal.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  isLineageMemberInBranch,
  type LineageEditorGraphMember,
  wouldCreateLineageParentCycle,
} from "~/server/web/lineage/editor-graph"

function makeChain(count: number): LineageEditorGraphMember[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `member-${index}`,
    primaryVisualParentMemberId: index === 0 ? null : `member-${index - 1}`,
  }))
}

function makeForest({ roots, childrenPerRoot }: { roots: number; childrenPerRoot: number }) {
  const members: LineageEditorGraphMember[] = []

  for (let rootIndex = 0; rootIndex < roots; rootIndex++) {
    const rootId = `root-${rootIndex}`
    members.push({ id: rootId, primaryVisualParentMemberId: null })

    for (let childIndex = 0; childIndex < childrenPerRoot; childIndex++) {
      members.push({
        id: `${rootId}-child-${childIndex}`,
        primaryVisualParentMemberId: rootId,
      })
    }
  }

  return members
}

describe("lineage editor graph scale guards", () => {
  it("detects descendants in a 1,000-member chain", () => {
    const members = makeChain(1000)

    expect(
      isLineageMemberInBranch({
        memberId: "member-999",
        rootMemberId: "member-0",
        members,
      }),
    ).toBe(true)

    expect(
      isLineageMemberInBranch({
        memberId: "member-999",
        rootMemberId: "member-500",
        members,
      }),
    ).toBe(true)

    expect(
      isLineageMemberInBranch({
        memberId: "member-100",
        rootMemberId: "member-500",
        members,
      }),
    ).toBe(false)
  })

  it("blocks moving a chain root under its deepest descendant", () => {
    const members = makeChain(1000)

    expect(
      wouldCreateLineageParentCycle({
        memberId: "member-0",
        candidateParentMemberId: "member-999",
        members,
      }),
    ).toBe(true)
  })

  it("allows moving a leaf to an unrelated forest root", () => {
    const members = makeForest({ roots: 50, childrenPerRoot: 20 })

    expect(members.length).toBe(1050)
    expect(
      wouldCreateLineageParentCycle({
        memberId: "root-0-child-19",
        candidateParentMemberId: "root-49",
        members,
      }),
    ).toBe(false)
  })

  it("does not loop forever on malformed cyclic existing data", () => {
    const members: LineageEditorGraphMember[] = [
      { id: "a", primaryVisualParentMemberId: "c" },
      { id: "b", primaryVisualParentMemberId: "a" },
      { id: "c", primaryVisualParentMemberId: "b" },
    ]

    expect(
      isLineageMemberInBranch({
        memberId: "b",
        rootMemberId: "missing-root",
        members,
      }),
    ).toBe(false)

    expect(
      wouldCreateLineageParentCycle({
        memberId: "a",
        candidateParentMemberId: "b",
        members,
      }),
    ).toBe(true)
  })
})
