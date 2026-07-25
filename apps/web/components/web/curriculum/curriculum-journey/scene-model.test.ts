// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import type { BjjCurriculumItemView, BjjCurriculumLevelView } from "~/server/web/curriculum/queries"
import {
  MAX_JOURNEY_ITEMS_PER_SCENE,
  deriveCurriculumJourneyScenes,
  journeyItemsForLevel,
} from "./scene-model"

/**
 * E1 CurriculumJourney (SESSION_0546 grill F1/F2/F3; G-022 Wave 3, SESSION_0649) —
 * pins the pure scene model: representative-item ranking (key-pointed items first,
 * then curriculum order) and the per-level scene derivation (skip levels with no
 * items, belt color sourced from `rank.colorHex`).
 */

const item = (overrides: Partial<BjjCurriculumItemView> = {}): BjjCurriculumItemView => ({
  id: `item-${Math.random().toString(36).slice(2, 10)}`,
  order: 0,
  title: "Item",
  description: "",
  section: "",
  category: "",
  access: "public",
  isRequired: false,
  keyPoints: [],
  techniqueLinks: [],
  ...overrides,
})

const level = (overrides: Partial<BjjCurriculumLevelView> = {}): BjjCurriculumLevelView => ({
  id: `level-${Math.random().toString(36).slice(2, 10)}`,
  title: "BJJ White Belt",
  slug: "bjj-level-1-white",
  description: "The foundation level.",
  rank: { name: "White Belt", shortName: "White", colorHex: "#F5F5F5" },
  items: [],
  ...overrides,
})

describe("journeyItemsForLevel — representative-item ranking", () => {
  it("ranks key-pointed items ahead of items without key points", () => {
    const withPoints = item({ id: "b", order: 2, keyPoints: ["grip", "base"] })
    const withoutPoints = item({ id: "a", order: 1, keyPoints: [] })

    const result = journeyItemsForLevel(level({ items: [withoutPoints, withPoints] }))
    expect(result.map(i => i.id)).toEqual(["b", "a"])
  })

  it("keeps curriculum order within the same key-points tier", () => {
    const first = item({ id: "first", order: 1, keyPoints: ["a"] })
    const second = item({ id: "second", order: 2, keyPoints: ["b"] })
    const third = item({ id: "third", order: 3, keyPoints: ["c"] })

    const result = journeyItemsForLevel(level({ items: [third, first, second] }))
    expect(result.map(i => i.id)).toEqual(["first", "second", "third"])
  })

  it("caps at MAX_JOURNEY_ITEMS_PER_SCENE by default", () => {
    const items = Array.from({ length: 6 }, (_, index) =>
      item({ id: `item-${index}`, order: index, keyPoints: ["point"] }),
    )
    const result = journeyItemsForLevel(level({ items }))
    expect(result).toHaveLength(MAX_JOURNEY_ITEMS_PER_SCENE)
    expect(result.map(i => i.id)).toEqual(["item-0", "item-1", "item-2"])
  })

  it("still surfaces items when NONE carry key points (never an empty scene on content-only levels)", () => {
    const items = [
      item({ id: "a", order: 2, keyPoints: [] }),
      item({ id: "b", order: 1, keyPoints: [] }),
    ]
    const result = journeyItemsForLevel(level({ items }))
    expect(result.map(i => i.id)).toEqual(["b", "a"])
  })

  it("respects a custom limit", () => {
    const items = Array.from({ length: 5 }, (_, index) =>
      item({ id: `item-${index}`, order: index }),
    )
    expect(journeyItemsForLevel(level({ items }), 1)).toHaveLength(1)
  })

  it("returns an empty array for a level with no items", () => {
    expect(journeyItemsForLevel(level({ items: [] }))).toEqual([])
  })
})

describe("deriveCurriculumJourneyScenes — one scene per belt level", () => {
  it("skips levels with zero curriculum items", () => {
    const withItems = level({ id: "with-items", items: [item()] })
    const empty = level({ id: "empty", items: [] })

    const scenes = deriveCurriculumJourneyScenes([empty, withItems])
    expect(scenes.map(s => s.id)).toEqual(["with-items"])
  })

  it("preserves the input level order (the library's existing white→black order)", () => {
    const white = level({ id: "white", items: [item()] })
    const blue = level({ id: "blue", items: [item()] })

    const scenes = deriveCurriculumJourneyScenes([white, blue])
    expect(scenes.map(s => s.id)).toEqual(["white", "blue"])
  })

  it("sources belt color from rank.colorHex, and falls back to null when rank is absent", () => {
    const withRank = level({
      id: "with-rank",
      items: [item()],
      rank: { name: "Blue Belt", shortName: "Blue", colorHex: "#1D4ED8" },
    })
    const withoutRank = level({ id: "without-rank", items: [item()], rank: null })

    const scenes = deriveCurriculumJourneyScenes([withRank, withoutRank])
    expect(scenes.find(s => s.id === "with-rank")?.beltColorHex).toBe("#1D4ED8")
    expect(scenes.find(s => s.id === "without-rank")?.beltColorHex).toBeNull()
  })

  it("carries the level title/description through as beltName/description", () => {
    const single = level({
      id: "single",
      title: "BJJ Purple Belt",
      description: "Advanced principles.",
      items: [item()],
    })

    const [scene] = deriveCurriculumJourneyScenes([single])
    expect(scene?.beltName).toBe("BJJ Purple Belt")
    expect(scene?.description).toBe("Advanced principles.")
  })

  it("returns an empty array for an empty library", () => {
    expect(deriveCurriculumJourneyScenes([])).toEqual([])
  })
})
