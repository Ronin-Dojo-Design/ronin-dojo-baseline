/**
 * Lineage editor graph guard tests.
 *
 * Run: cd apps/web && bun test server/web/lineage/editor-graph.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
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
