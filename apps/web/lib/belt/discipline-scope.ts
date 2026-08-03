/**
 * @added   SESSION_0738 (2026-08-03)
 * @why     One shared "first-in-discipline-else-top" tie-break behind every top-rank-in-discipline accessor
 * @wired   server/belt/belt-gate.ts, server/belt/member-ranks.ts, lib/lineage/canvas-model.ts
 */

/**
 * The top item scoped to a discipline in a list **pre-ordered by rank sortOrder desc**:
 * the FIRST item whose discipline matches `disciplineId`, or — when no discipline is given
 * (null / undefined / empty) — the global top (`items[0]`). Null when the (matching) list
 * is empty.
 *
 * This is the ONE shared tie-break the "top rank in discipline" accessors all share
 * (belt-gate `ceilingSortOrder` / `isTopAward`, member-ranks `memberTopRankView`, lineage
 * `memberTopRankEntry`). Each call site nests the discipline id differently, so
 * `disciplineIdOf` reads it off an item; the branch + `?? null` fallbacks are identical to
 * the four inlined copies this replaces (behavior-preserving, D-062).
 */
export function topInDiscipline<T>(
  items: readonly T[],
  disciplineId: string | null | undefined,
  disciplineIdOf: (item: T) => string | null | undefined,
): T | null {
  if (!disciplineId) return items[0] ?? null
  return items.find(item => disciplineIdOf(item) === disciplineId) ?? null
}
