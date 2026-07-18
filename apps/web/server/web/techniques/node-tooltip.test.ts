// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, test } from "bun:test"
import type { BjjTechniqueGraphNode } from "./graph-query"
import { deriveNodeTooltip } from "./node-tooltip"

const makeCurriculumItem = (
  overrides: Partial<BjjTechniqueGraphNode["curriculumItems"][number]> = {},
): BjjTechniqueGraphNode["curriculumItems"][number] => ({
  id: "item_1",
  title: "Armbar from guard",
  courseTitle: "BJJ Level 1",
  courseSlug: "bjj-level-1",
  keyPoints: [],
  ...overrides,
})

const makeNode = (overrides: Partial<BjjTechniqueGraphNode> = {}): BjjTechniqueGraphNode => ({
  id: "armbar",
  techniqueId: "tech_1",
  slug: "armbar",
  label: "Armbar",
  description: "A fundamental submission attacking the elbow joint. Keep the knees pinched.",
  type: "submission",
  x: 0,
  y: 0,
  href: "/techniques/armbar",
  isFoundational: true,
  difficultyLevel: null,
  position: null,
  category: null,
  beltLevelMin: null,
  teachingCues: [],
  curriculumItems: [],
  ...overrides,
})

describe("deriveNodeTooltip", () => {
  test("returns EXACTLY the closed text-only key set — no media key can ever ride along", () => {
    const tooltip = deriveNodeTooltip(makeNode())

    expect(Object.keys(tooltip).sort()).toEqual(["definition", "heading", "keyPoints", "typeLabel"])

    for (const bannedKey of ["url", "thumbnailUrl", "posterUrl", "mediaId", "media"]) {
      expect(bannedKey in tooltip).toBe(false)
    }
  })

  test("heading is the node label and typeLabel is the humanized node type", () => {
    const tooltip = deriveNodeTooltip(makeNode())

    expect(tooltip.heading).toBe("Armbar")
    expect(tooltip.typeLabel).toBe("Submission")
  })

  test("definition is only the first sentence of the description", () => {
    expect(deriveNodeTooltip(makeNode()).definition).toBe(
      "A fundamental submission attacking the elbow joint.",
    )
  })

  test("a long first sentence clamps to at most 140 chars ending in a real ellipsis", () => {
    const definition = deriveNodeTooltip(
      makeNode({ description: `${"grip ".repeat(60).trim()}. Second sentence.` }),
    ).definition

    expect(definition).not.toBeNull()
    expect(definition!.length).toBeLessThanOrEqual(140)
    expect(definition!.endsWith("…")).toBe(true)
  })

  test("a missing or blank description derives a null definition", () => {
    expect(deriveNodeTooltip(makeNode({ description: null })).definition).toBeNull()
    expect(deriveNodeTooltip(makeNode({ description: "   " })).definition).toBeNull()
  })

  test("teaching cues win over curriculum key points and cap at 3", () => {
    const tooltip = deriveNodeTooltip(
      makeNode({
        teachingCues: ["Pinch the knees", "Hips high", "Thumb up", "Slow extension"],
        curriculumItems: [makeCurriculumItem({ keyPoints: ["from notes"] })],
      }),
    )

    expect(tooltip.keyPoints).toEqual(["Pinch the knees", "Hips high", "Thumb up"])
  })

  test("without teaching cues, parsed curriculum key points flatten across items and cap at 3", () => {
    const tooltip = deriveNodeTooltip(
      makeNode({
        teachingCues: [],
        curriculumItems: [
          makeCurriculumItem({ id: "item_1", keyPoints: ["one", "two"] }),
          makeCurriculumItem({ id: "item_2", keyPoints: ["three", "four"] }),
        ],
      }),
    )

    expect(tooltip.keyPoints).toEqual(["one", "two", "three"])
  })

  test("no cue source at all derives an empty key point list", () => {
    expect(deriveNodeTooltip(makeNode()).keyPoints).toEqual([])
  })
})
