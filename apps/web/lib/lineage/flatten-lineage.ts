import { type CanvasMember, sortMembers } from "~/lib/lineage/canvas-model"

export type FlattenedLineageMember = {
  member: CanvasMember
  depth: number
}

type FlattenLineageOptions = {
  roots?: CanvasMember[]
}

function validParentId(member: CanvasMember, memberIds: Set<string>): string | null {
  const parentId = member.primaryVisualParentMemberId
  if (!parentId || parentId === member.id || !memberIds.has(parentId)) return null
  return parentId
}

/**
 * Flatten a visual lineage forest into stable DFS display order.
 *
 * The helper is deliberately presentation-agnostic: it consumes the normalized
 * canvas model, guards malformed parent links/cycles, and returns depth only.
 */
export function flattenLineage(
  members: CanvasMember[],
  options: FlattenLineageOptions = {},
): FlattenedLineageMember[] {
  if (members.length === 0) return []

  const sortedMembers = [...members].sort(sortMembers)
  const memberIds = new Set(sortedMembers.map(member => member.id))
  const memberById = new Map(sortedMembers.map(member => [member.id, member]))
  const childrenByParentId = new Map<string | null, CanvasMember[]>()

  for (const member of sortedMembers) {
    const parentId = validParentId(member, memberIds)
    const children = childrenByParentId.get(parentId) ?? []
    children.push(member)
    childrenByParentId.set(parentId, children)
  }

  for (const [parentId, children] of childrenByParentId) {
    children.sort(sortMembers)
    childrenByParentId.set(parentId, children)
  }

  const optionRoots = (options.roots ?? [])
    .map(root => memberById.get(root.id))
    .filter((root): root is CanvasMember => Boolean(root))

  const defaultRoots = childrenByParentId.get(null) ?? []
  const rootIds = new Set<string>()
  const roots: CanvasMember[] = []

  for (const root of [...optionRoots, ...defaultRoots]) {
    if (rootIds.has(root.id)) continue
    roots.push(root)
    rootIds.add(root.id)
  }

  if (roots.length === 0) {
    roots.push(...sortedMembers)
  }

  const flattened: FlattenedLineageMember[] = []
  const visited = new Set<string>()

  function visit(member: CanvasMember, depth: number, activePath: Set<string>) {
    if (visited.has(member.id) || activePath.has(member.id)) return

    visited.add(member.id)
    flattened.push({ member, depth })

    const nextActivePath = new Set(activePath).add(member.id)
    const children = childrenByParentId.get(member.id) ?? []
    for (const child of children) {
      visit(child, depth + 1, nextActivePath)
    }
  }

  for (const root of roots) {
    visit(root, 0, new Set())
  }

  for (const member of sortedMembers) {
    visit(member, 0, new Set())
  }

  return flattened
}
