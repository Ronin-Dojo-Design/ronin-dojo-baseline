import assert from "node:assert/strict"
import { describe, test } from "node:test"
import type { LineageNodeRow, LineageRelationshipRow } from "~/server/web/lineage/payloads"
import { bucketByDepth, depthLabel } from "./tree-layout"

/**
 * Minimal node fixture — only the fields tree-layout reads.
 * Cast through unknown so we don't have to construct the full payload.
 */
function makeNode(id: string, name: string): LineageNodeRow {
  return {
    id,
    slug: id,
    visibility: "PUBLIC",
    isVerified: false,
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

function makeEdge(fromNodeId: string, toNodeId: string, id?: string): LineageRelationshipRow {
  return {
    id: id ?? `edge-${fromNodeId}-${toNodeId}`,
    type: "INSTRUCTOR_STUDENT",
    description: null,
    isVerified: false,
    startedAt: null,
    endedAt: null,
    fromNodeId,
    toNodeId,
  } as unknown as LineageRelationshipRow
}

describe("bucketByDepth", () => {
  test("places root at depth 0, instructor at -1, student at +1", () => {
    const root = makeNode("brian", "Brian Scott")
    const instructor = makeNode("bob", "Bob Bass")
    const student = makeNode("zoe", "Zoe Smith")

    const rows = bucketByDepth(
      root,
      [root, instructor, student],
      [
        makeEdge("bob", "brian"), // bob instructs brian
        makeEdge("brian", "zoe"), // brian instructs zoe
      ],
    )

    const byDepth = new Map(rows.map(r => [r.depth, r.nodes.map(n => n.id)]))
    assert.deepEqual(byDepth.get(-1), ["bob"], "instructor goes to depth -1")
    assert.deepEqual(byDepth.get(0), ["brian"], "root stays at depth 0")
    assert.deepEqual(byDepth.get(1), ["zoe"], "student goes to depth +1")
  })

  test("walks instructor-of-instructor up to depth -2 and sorts within bucket", () => {
    const root = makeNode("brian", "Brian Scott")
    const bob = makeNode("bob", "Bob Bass")
    const rigan = makeNode("rigan", "Rigan Machado")
    const wolk = makeNode("wolk", "Steve Wolk")

    const rows = bucketByDepth(
      root,
      [root, bob, rigan, wolk],
      [makeEdge("bob", "brian"), makeEdge("wolk", "brian"), makeEdge("rigan", "bob")],
    )

    const minus1 = rows.find(r => r.depth === -1)
    const minus2 = rows.find(r => r.depth === -2)
    assert.ok(minus1, "depth -1 row exists")
    assert.ok(minus2, "depth -2 row exists")
    // Two instructors of Brian, alphabetically sorted by name: Bob Bass < Steve Wolk
    assert.deepEqual(
      minus1!.nodes.map(n => n.id),
      ["bob", "wolk"],
    )
    assert.deepEqual(
      minus2!.nodes.map(n => n.id),
      ["rigan"],
    )
  })
})

describe("depthLabel", () => {
  test("returns sensible per-row labels", () => {
    assert.equal(depthLabel(0), "Root")
    assert.equal(depthLabel(-1), "Instructor")
    assert.equal(depthLabel(1), "Student")
    assert.equal(depthLabel(-2), "Generation -2")
    assert.equal(depthLabel(2), "Generation +2")
  })
})
