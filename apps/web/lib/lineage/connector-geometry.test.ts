import assert from "node:assert/strict"
import { describe, test } from "node:test"
import type { CanvasMember, ChildGroup } from "~/lib/lineage/canvas-model"
import type { LineageNodeRow } from "~/server/web/lineage/payloads"
import {
  buildConnectorEdges,
  buildSelectedPathTrace,
  connectorGrowDelay,
  tracePerStepDelay,
  traceStepDelay,
} from "./connector-geometry"

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

function makeMember(id: string, parentId: string | null = null): CanvasMember {
  return {
    id,
    nodeId: `node-${id}`,
    node: makeNode(`node-${id}`, id),
    visualSortOrder: 0,
    primaryVisualParentMemberId: parentId,
    visualGroupId: null,
    isCollapsedDefault: false,
  }
}

function makeGroup(id: string, members: CanvasMember[]): ChildGroup {
  return {
    id,
    group: null,
    members,
  }
}

describe("trace delays", () => {
  test("keeps selected-path trace inside the configured timing envelope", () => {
    assert.equal(tracePerStepDelay(0), 0)
    assert.equal(tracePerStepDelay(1), 0.2)
    assert.equal(tracePerStepDelay(5), 0.2)
    assert.equal(tracePerStepDelay(20), 0.05)
    assert.equal(tracePerStepDelay(40), 0.05)

    assert.equal(traceStepDelay(0, 0.2), 0)
    assert.equal(traceStepDelay(1, 0.2), 0)
    assert.equal(traceStepDelay(3, 0.2), 0.4)
    assert.equal(traceStepDelay(3, 0), 0)
  })

  test("staggered connector grow-in is generation-based and capped", () => {
    assert.equal(connectorGrowDelay(0), 0)
    assert.equal(Number(connectorGrowDelay(3).toFixed(1)), 0.3)
    assert.equal(connectorGrowDelay(20), 1)
  })
})

describe("buildSelectedPathTrace", () => {
  test("walks from selected member to root and records distances", () => {
    const root = makeMember("root")
    const child = makeMember("child", "root")
    const grandchild = makeMember("grandchild", "child")

    const trace = buildSelectedPathTrace({
      members: [root, child, grandchild],
      selectedNodeId: "node-grandchild",
    })

    assert.deepEqual([...trace.pathMemberIds], ["grandchild", "child", "root"])
    assert.deepEqual(
      [...trace.pathDistanceById],
      [
        ["grandchild", 0],
        ["child", 1],
        ["root", 2],
      ],
    )
    assert.equal(trace.maxDistance, 2)
  })

  test("returns an empty trace for missing selections and guards cycles", () => {
    assert.deepEqual(
      buildSelectedPathTrace({ members: [makeMember("root")], selectedNodeId: "missing" }),
      { pathMemberIds: new Set(), pathDistanceById: new Map(), maxDistance: 0 },
    )

    const cycleA = makeMember("cycle-a", "cycle-b")
    const cycleB = makeMember("cycle-b", "cycle-a")
    const trace = buildSelectedPathTrace({
      members: [cycleA, cycleB],
      selectedNodeId: "node-cycle-a",
    })

    assert.deepEqual([...trace.pathMemberIds], ["cycle-a", "cycle-b"])
    assert.equal(trace.maxDistance, 1)
  })
})

describe("buildConnectorEdges", () => {
  test("marks only child-group edges on the selected path", () => {
    const selectedChild = makeMember("selected-child")
    const unrelatedChild = makeMember("unrelated-child")
    const edges = buildConnectorEdges({
      childGroups: [
        makeGroup("selected-group", [selectedChild]),
        makeGroup("other-group", [unrelatedChild]),
      ],
      isInSelectedPath: true,
      selectedPathMemberIds: new Set(["parent", "selected-child"]),
      traceDistance: 2,
      perStepDelay: 0.2,
    })

    assert.deepEqual(edges, [
      { id: "selected-group", highlighted: true, traceDelaySec: 0.2 },
      { id: "other-group", highlighted: false, traceDelaySec: 0 },
    ])
  })

  test("does not highlight child groups when the parent is off the selected path", () => {
    const selectedChild = makeMember("selected-child")
    const edges = buildConnectorEdges({
      childGroups: [makeGroup("selected-group", [selectedChild])],
      isInSelectedPath: false,
      selectedPathMemberIds: new Set(["selected-child"]),
      traceDistance: 1,
      perStepDelay: 0.2,
    })

    assert.deepEqual(edges, [{ id: "selected-group", highlighted: false, traceDelaySec: 0 }])
  })
})
