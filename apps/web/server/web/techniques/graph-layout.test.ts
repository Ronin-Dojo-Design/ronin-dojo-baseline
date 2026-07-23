// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, test } from "bun:test"
import { NODE_HEIGHT, NODE_WIDTH } from "~/components/web/techniques/technique-graph"
import graph from "../../../prisma/data/bbl-bjj-graph.json"

describe("technique graph layout", () => {
  test("every node pair has zero AABB overlap at the rendered dimensions", () => {
    const overlaps: string[] = []

    for (let leftIndex = 0; leftIndex < graph.nodes.length; leftIndex += 1) {
      const left = graph.nodes[leftIndex]

      for (let rightIndex = leftIndex + 1; rightIndex < graph.nodes.length; rightIndex += 1) {
        const right = graph.nodes[rightIndex]
        const overlapsHorizontally = left.x < right.x + NODE_WIDTH && left.x + NODE_WIDTH > right.x
        const overlapsVertically = left.y < right.y + NODE_HEIGHT && left.y + NODE_HEIGHT > right.y

        if (overlapsHorizontally && overlapsVertically) {
          overlaps.push(`${left.id} × ${right.id}`)
        }
      }
    }

    expect(overlaps).toEqual([])
  })
})
