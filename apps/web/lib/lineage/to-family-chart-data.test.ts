import assert from "node:assert/strict"
import { describe, test } from "node:test"
import type { LineageVisualNode } from "~/lib/lineage/to-lineage-visual"
import { toFamilyChartData } from "~/lib/lineage/to-family-chart-data"

function makeNode(
  id: string,
  parentId: string | null = null,
  overrides: Partial<LineageVisualNode> = {},
): LineageVisualNode {
  return {
    id,
    nodeId: `node-${id}`,
    displayName: id,
    slug: id,
    avatar: null,
    colorHex: null,
    rankLabel: null,
    trustStatus: "unverified",
    isFocal: false,
    claimable: false,
    primaryVisualParentMemberId: parentId,
    visualGroupId: null,
    ...overrides,
  }
}

describe("toFamilyChartData", () => {
  test("empty input returns empty array", () => {
    assert.deepEqual(toFamilyChartData([]), [])
  })

  test("maps id and data fields from LineageVisualNode", () => {
    const node = makeNode("m1", null, {
      displayName: "Alice",
      slug: "alice",
      avatar: "https://example.com/a.jpg",
      colorHex: "#1a1a1a",
      rankLabel: "Black Belt · BJJ",
      trustStatus: "verified",
      isFocal: true,
      claimable: false,
    })
    const [datum] = toFamilyChartData([node])
    assert.equal(datum!.id, "m1")
    assert.equal(datum!.data.displayName, "Alice")
    assert.equal(datum!.data.slug, "alice")
    assert.equal(datum!.data.avatar, "https://example.com/a.jpg")
    assert.equal(datum!.data.colorHex, "#1a1a1a")
    assert.equal(datum!.data.rankLabel, "Black Belt · BJJ")
    assert.equal(datum!.data.trustStatus, "verified")
    assert.equal(datum!.data.isFocal, true)
    assert.equal(datum!.data.claimable, false)
    assert.equal(datum!.data.gender, "M")
  })

  test("root node has no parents and empty children before second pass", () => {
    const root = makeNode("root", null)
    const [datum] = toFamilyChartData([root])
    assert.deepEqual(datum!.rels.parents, [])
    assert.deepEqual(datum!.rels.spouses, [])
  })

  test("second pass builds rels.children from rels.parents", () => {
    const root = makeNode("root", null)
    const child = makeNode("child", "root")
    const datums = toFamilyChartData([root, child])
    const rootDatum = datums.find(d => d.id === "root")!
    const childDatum = datums.find(d => d.id === "child")!
    assert.deepEqual(childDatum.rels.parents, ["root"])
    assert.deepEqual(rootDatum.rels.children, ["child"])
  })

  test("second pass: multiple children populate parent.rels.children", () => {
    const root = makeNode("root", null)
    const c1 = makeNode("c1", "root")
    const c2 = makeNode("c2", "root")
    const c3 = makeNode("c3", "root")
    const datums = toFamilyChartData([root, c1, c2, c3])
    const rootDatum = datums.find(d => d.id === "root")!
    assert.equal(rootDatum.rels.children.length, 3)
    assert.ok(rootDatum.rels.children.includes("c1"))
    assert.ok(rootDatum.rels.children.includes("c2"))
    assert.ok(rootDatum.rels.children.includes("c3"))
  })

  test("chain A→B→C: each node has correct parent and child", () => {
    const a = makeNode("a", null)
    const b = makeNode("b", "a")
    const c = makeNode("c", "b")
    const datums = toFamilyChartData([a, b, c])
    const da = datums.find(d => d.id === "a")!
    const db = datums.find(d => d.id === "b")!
    const dc = datums.find(d => d.id === "c")!
    assert.deepEqual(da.rels.parents, [])
    assert.deepEqual(da.rels.children, ["b"])
    assert.deepEqual(db.rels.parents, ["a"])
    assert.deepEqual(db.rels.children, ["c"])
    assert.deepEqual(dc.rels.parents, ["b"])
    assert.deepEqual(dc.rels.children, [])
  })

  test("missing parent id is silently ignored in second pass", () => {
    const orphan = makeNode("orphan", "nonexistent-parent")
    const [datum] = toFamilyChartData([orphan])
    assert.deepEqual(datum!.rels.parents, ["nonexistent-parent"])
    assert.deepEqual(datum!.rels.children, [])
  })

  test("spouses array is always empty (unused in v1)", () => {
    const m = makeNode("m1")
    const [datum] = toFamilyChartData([m])
    assert.deepEqual(datum!.rels.spouses, [])
  })
})
