// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, test } from "bun:test"
import {
  buildGraphNodeTooltip,
  GRAPH_NODE_TOOLTIP_KEYS,
  labelForGraphNodeType,
} from "./technique-graph-tooltip"

const baseNode = {
  type: "submission" as const,
  beltLevelMin: { colorHex: "#0000ff", name: "Blue Belt" },
  difficultyLevel: "Intermediate",
  position: "Closed Guard",
  description: "A fundamental collar choke from closed guard.",
  teachingCues: ["Control the posture first", "Deep first grip"],
  isFoundational: true,
}

describe("buildGraphNodeTooltip", () => {
  test("payload carries exactly the whitelisted keys — no media field can leak", () => {
    const tooltip = buildGraphNodeTooltip(baseNode)

    expect(Object.keys(tooltip).sort()).toEqual([...GRAPH_NODE_TOOLTIP_KEYS].sort())

    const serialized = JSON.stringify(tooltip).toLowerCase()
    for (const forbidden of ["url", "poster", "thumbnail", "media", "video", "href", "src"]) {
      expect(serialized).not.toContain(`"${forbidden}`)
    }
  })

  test("projects display fields and prefers the description as summary", () => {
    expect(buildGraphNodeTooltip(baseNode)).toEqual({
      typeLabel: "Submission",
      beltName: "Blue Belt",
      difficultyLevel: "Intermediate",
      position: "Closed Guard",
      summary: "A fundamental collar choke from closed guard.",
      isFoundational: true,
    })
  })

  test("falls back to the first teaching cue when the description is empty", () => {
    expect(buildGraphNodeTooltip({ ...baseNode, description: "  " }).summary).toBe(
      "Control the posture first",
    )
    expect(buildGraphNodeTooltip({ ...baseNode, description: null }).summary).toBe(
      "Control the posture first",
    )
  })

  test("stays null-safe without description, cues, or belt", () => {
    expect(
      buildGraphNodeTooltip({
        ...baseNode,
        description: null,
        teachingCues: [],
        beltLevelMin: null,
        difficultyLevel: null,
        position: null,
        isFoundational: false,
      }),
    ).toEqual({
      typeLabel: "Submission",
      beltName: null,
      difficultyLevel: null,
      position: null,
      summary: null,
      isFoundational: false,
    })
  })

  test("truncates long summaries with a single ellipsis under the cap", () => {
    const summary = buildGraphNodeTooltip({ ...baseNode, description: "x".repeat(400) }).summary

    expect(summary?.length).toBeLessThanOrEqual(140)
    expect(summary?.endsWith("…")).toBe(true)
  })
})

describe("labelForGraphNodeType", () => {
  test("capitalizes each hyphen-separated word", () => {
    expect(labelForGraphNodeType("position")).toBe("Position")
    expect(labelForGraphNodeType("counter")).toBe("Counter")
  })
})
