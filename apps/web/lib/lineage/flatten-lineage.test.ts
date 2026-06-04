import assert from "node:assert/strict"
import { describe, test } from "node:test"
import type { CanvasMember } from "~/lib/lineage/canvas-model"
import type { LineageNodeRow } from "~/server/web/lineage/payloads"
import { flattenLineage } from "./flatten-lineage"

function makeNode(id: string, name: string): LineageNodeRow {
  return {
    id,
    slug: id,
    visibility: "PUBLIC",
    isVerified: false,
    verificationStatus: "UNVERIFIED",
    bio: null,
    userId: `user-${id}`,
    user: {
      id: `user-${id}`,
      name,
      image: null,
      passport: null,
      directoryProfile: null,
      rankAwards: [],
      memberships: [],
    },
  } as unknown as LineageNodeRow
}

function makeMember({
  id,
  name,
  parentId = null,
  sort = 0,
}: {
  id: string
  name: string
  parentId?: string | null
  sort?: number
}): CanvasMember {
  return {
    id,
    nodeId: `node-${id}`,
    node: makeNode(`node-${id}`, name),
    visualSortOrder: sort,
    primaryVisualParentMemberId: parentId,
    visualGroupId: null,
    isCollapsedDefault: false,
  }
}

function signature(members: CanvasMember[]) {
  return flattenLineage(members).map(({ member, depth }) => `${member.id}:${depth}`)
}

describe("flattenLineage", () => {
  test("flattens roots and descendants in stable DFS order", () => {
    const root = makeMember({ id: "root", name: "Root", sort: 0 })
    const secondRoot = makeMember({ id: "second-root", name: "Second Root", sort: 1 })
    const laterChild = makeMember({
      id: "later-child",
      name: "Later Child",
      parentId: "root",
      sort: 2,
    })
    const firstChild = makeMember({
      id: "first-child",
      name: "First Child",
      parentId: "root",
      sort: 1,
    })
    const grandchild = makeMember({
      id: "grandchild",
      name: "Grand Child",
      parentId: "first-child",
      sort: 0,
    })

    assert.deepEqual(signature([laterChild, secondRoot, grandchild, root, firstChild]), [
      "root:0",
      "first-child:1",
      "grandchild:2",
      "later-child:1",
      "second-root:0",
    ])
  })

  test("preserves explicit root ordering when roots are supplied", () => {
    const alpha = makeMember({ id: "alpha", name: "Alpha", sort: 0 })
    const beta = makeMember({ id: "beta", name: "Beta", sort: 1 })

    const flattened = flattenLineage([alpha, beta], { roots: [beta, alpha] })

    assert.deepEqual(
      flattened.map(({ member, depth }) => `${member.id}:${depth}`),
      ["beta:0", "alpha:0"],
    )
  })

  test("treats orphan and self-parent links as roots", () => {
    const orphan = makeMember({
      id: "orphan",
      name: "Orphan",
      parentId: "missing-parent",
      sort: 0,
    })
    const selfParent = makeMember({ id: "self", name: "Self", parentId: "self", sort: 1 })

    assert.deepEqual(signature([selfParent, orphan]), ["orphan:0", "self:0"])
  })

  test("guards cyclic parent chains without dropping reachable members", () => {
    const alpha = makeMember({ id: "alpha", name: "Alpha", parentId: "charlie", sort: 0 })
    const bravo = makeMember({ id: "bravo", name: "Bravo", parentId: "alpha", sort: 1 })
    const charlie = makeMember({ id: "charlie", name: "Charlie", parentId: "bravo", sort: 2 })

    assert.deepEqual(signature([alpha, bravo, charlie]), ["alpha:0", "bravo:1", "charlie:2"])
  })

  test("does not emit a member twice when an explicit root is also a child", () => {
    const root = makeMember({ id: "root", name: "Root", sort: 0 })
    const child = makeMember({ id: "child", name: "Child", parentId: "root", sort: 1 })

    const flattened = flattenLineage([child, root], { roots: [child, root] })

    assert.deepEqual(
      flattened.map(({ member, depth }) => `${member.id}:${depth}`),
      ["child:0", "root:0"],
    )
  })
})
