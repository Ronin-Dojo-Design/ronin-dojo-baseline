import type { BjjCurriculumItemView, BjjCurriculumLevelView } from "~/server/web/curriculum/queries"

/**
 * Pure model for the CurriculumJourney scroll scenes (E1, SESSION_0546 grill F1/F2/F3;
 * G-022 Wave 3, SESSION_0649).
 *
 * No React, no "use client" — deriving scenes from the curriculum library is a pure
 * function of the query result, so the client sequence/scene components AND the unit
 * tests consume it without pulling the motion slice. Same shape as the Lineage
 * Journey's `lineage-story/scene-model.ts`.
 *
 * Content is derive-only: every field here reads straight off `getBjjCurriculumLibrary`
 * (levels → courses/items exposing `description` + `keyPoints` via `keyPointsFromNotes`)
 * — no new server code, no schema change. Belt color comes from `level.rank.colorHex`
 * (the DB), never a hardcoded palette and never the Brand enum.
 */

/** Representative items per scene — enough to read as a walk through the belt's
 *  material, not the full grid (that's what `BjjCurriculumBrowser` below is for). */
export const MAX_JOURNEY_ITEMS_PER_SCENE = 3

export type CurriculumJourneyItem = {
  id: string
  title: string
  description: string
  keyPoints: string[]
}

export type CurriculumJourneyScene = {
  id: string
  slug: string
  beltName: string
  beltShortName: string | null
  beltColorHex: string | null
  description: string | null
  items: CurriculumJourneyItem[]
}

const toJourneyItem = (item: BjjCurriculumItemView): CurriculumJourneyItem => ({
  id: item.id,
  title: item.title,
  description: item.description,
  keyPoints: item.keyPoints,
})

/**
 * Representative items for one level: items carrying key points sort first (the
 * material that actually reads as a "beat" in the walk) — items without any land at
 * the tail, sorted by curriculum `order`. This way a level whose content hasn't been
 * annotated with a `Key points:` block yet still gets a scene instead of an empty one,
 * and levels that DO have key-pointed items never surface an unannotated item ahead of
 * one that does.
 */
export const journeyItemsForLevel = (
  level: BjjCurriculumLevelView,
  limit: number = MAX_JOURNEY_ITEMS_PER_SCENE,
): CurriculumJourneyItem[] => {
  const ranked = [...level.items].sort((a, b) => {
    const aHasKeyPoints = a.keyPoints.length > 0 ? 1 : 0
    const bHasKeyPoints = b.keyPoints.length > 0 ? 1 : 0
    if (aHasKeyPoints !== bHasKeyPoints) return bHasKeyPoints - aHasKeyPoints
    return a.order - b.order
  })

  return ranked.slice(0, limit).map(toJourneyItem)
}

/**
 * Derives one scene per belt level, in the library's existing order (already sorted
 * white → black by `getBjjCurriculumLibrary`). Levels with zero curriculum items are
 * skipped — nothing to walk through yet.
 */
export const deriveCurriculumJourneyScenes = (
  levels: readonly BjjCurriculumLevelView[],
): CurriculumJourneyScene[] =>
  levels
    .filter(level => level.items.length > 0)
    .map(level => ({
      id: level.id,
      slug: level.slug,
      beltName: level.title,
      beltShortName: level.rank?.shortName ?? null,
      beltColorHex: level.rank?.colorHex ?? null,
      description: level.description,
      items: journeyItemsForLevel(level),
    }))
