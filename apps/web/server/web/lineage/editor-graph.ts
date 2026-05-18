export type LineageEditorGraphMember = {
  id: string
  primaryVisualParentMemberId: string | null
}

/**
 * Build a child -> parent lookup from the visual member graph.
 */
export function buildLineageParentLookup(members: LineageEditorGraphMember[]) {
  return new Map(members.map(member => [member.id, member.primaryVisualParentMemberId]))
}

/**
 * True when `memberId` is the branch root or a descendant of it.
 *
 * Used for BRANCH_EDITOR grants. We walk upward from the edited member to the
 * root rather than expanding every descendant so a malformed branch stays
 * bounded by the guard set.
 */
export function isLineageMemberInBranch({
  memberId,
  rootMemberId,
  members,
}: {
  memberId: string
  rootMemberId: string
  members: LineageEditorGraphMember[]
}) {
  if (memberId === rootMemberId) return true

  const parentById = buildLineageParentLookup(members)
  const visited = new Set<string>()
  let cursor = parentById.get(memberId) ?? null

  while (cursor) {
    if (cursor === rootMemberId) return true
    if (visited.has(cursor)) return false
    visited.add(cursor)
    cursor = parentById.get(cursor) ?? null
  }

  return false
}

/**
 * True when assigning `candidateParentMemberId` as `memberId`'s parent would
 * create a visual-parent cycle.
 */
export function wouldCreateLineageParentCycle({
  memberId,
  candidateParentMemberId,
  members,
}: {
  memberId: string
  candidateParentMemberId: string | null
  members: LineageEditorGraphMember[]
}) {
  if (!candidateParentMemberId) return false
  if (memberId === candidateParentMemberId) return true

  const parentById = buildLineageParentLookup(members)
  const visited = new Set<string>()
  let cursor: string | null = candidateParentMemberId

  while (cursor) {
    if (cursor === memberId) return true
    if (visited.has(cursor)) return true
    visited.add(cursor)
    cursor = parentById.get(cursor) ?? null
  }

  return false
}
