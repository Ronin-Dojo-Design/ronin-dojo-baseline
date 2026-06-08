import { type CanvasMember, nodeDisplayName } from "~/lib/lineage/canvas-model"

/**
 * Pure lineage search matching (SESSION_0331 search bar; extracted SESSION_0334).
 *
 * The public search is a **client-side projection over the `members` array the
 * canvas already holds** — it never issues its own query. That array is the
 * visibility-materialized public set (`materializeLineageTreeResult` drops
 * PRIVATE/RESTRICTED before render), so the search can only ever surface members
 * that survived server-side scoping. Keeping the matcher pure (no React, no
 * fetch) makes that contract directly testable — see `search.privacy.test.ts`.
 */

export const MIN_QUERY_LENGTH = 1

export type LineageSearchMatch = {
  member: CanvasMember
  index: number
  displayName: string
}

export function findLineageMatches(
  members: readonly CanvasMember[],
  query: string,
): LineageSearchMatch[] {
  const needle = query.trim().toLowerCase()
  if (needle.length < MIN_QUERY_LENGTH) return []

  const matches: LineageSearchMatch[] = []
  for (const member of members) {
    const displayName = nodeDisplayName(member.node)
    const index = displayName.toLowerCase().indexOf(needle)
    if (index < 0) continue
    matches.push({ member, index, displayName })
  }

  matches.sort((a, b) => {
    if (a.index !== b.index) return a.index - b.index
    return a.displayName.localeCompare(b.displayName)
  })

  return matches
}
