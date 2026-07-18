export type GraphBeltLevel = {
  colorHex: string | null
  name: string | null
}

type LinkedCourseRank = GraphBeltLevel & {
  sortOrder: number
}

/**
 * Resolves the graph's belt tint without inventing rank authority:
 *
 * 1. An explicit Technique.beltLevelMin tag always wins.
 * 2. Otherwise, use the lowest-sort-order Rank among linked curriculum Courses.
 * 3. Techniques with neither source remain unranked.
 *
 * The returned graph DTO intentionally stays display-only (color + label); sortOrder is
 * query-local derivation data and never reaches the client payload.
 */
export const deriveGraphBeltLevel = (
  directBelt: GraphBeltLevel | null,
  linkedCourseRanks: Array<LinkedCourseRank | null>,
): GraphBeltLevel | null => {
  if (directBelt) return directBelt

  let lowestRank: LinkedCourseRank | null = null
  for (const rank of linkedCourseRanks) {
    if (!rank) continue
    if (!lowestRank || rank.sortOrder < lowestRank.sortOrder) lowestRank = rank
  }

  return lowestRank ? { colorHex: lowestRank.colorHex, name: lowestRank.name } : null
}
