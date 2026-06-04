import type { CanvasMember, ChildGroup } from "./canvas-model"

const TRACE_TOTAL_BUDGET = 1.0
const TRACE_MIN_STEP = 0.05
const TRACE_MAX_STEP = 0.2

const CONNECTOR_GROW_STEP = 0.1
const CONNECTOR_GROW_DELAY_CAP = 1.0

export type SelectedPathTrace = {
  pathMemberIds: Set<string>
  pathDistanceById: Map<string, number>
  maxDistance: number
}

export type ConnectorEdge = {
  // Stable id of the child column this edge points to (matches the rendered child-group order).
  id: string
  // Whether this exact edge lies on the selected path (parent on path AND this child on path).
  highlighted: boolean
  // Path-trace cascade delay for this edge when highlighted.
  traceDelaySec: number
}

export function tracePerStepDelay(maxDistance: number): number {
  if (maxDistance <= 0) return 0
  return Math.max(TRACE_MIN_STEP, Math.min(TRACE_MAX_STEP, TRACE_TOTAL_BUDGET / maxDistance))
}

export function traceStepDelay(step: number, perStepDelay: number): number {
  if (step <= 0 || perStepDelay <= 0) return 0
  return (step - 1) * perStepDelay
}

export function connectorGrowDelay(generation: number): number {
  if (generation <= 0) return 0
  return Math.min(generation * CONNECTOR_GROW_STEP, CONNECTOR_GROW_DELAY_CAP)
}

export function buildSelectedPathTrace({
  members,
  selectedNodeId,
}: {
  members: CanvasMember[]
  selectedNodeId: string | null | undefined
}): SelectedPathTrace {
  const pathMemberIds = new Set<string>()
  const pathDistanceById = new Map<string, number>()

  if (!selectedNodeId) {
    return { pathMemberIds, pathDistanceById, maxDistance: 0 }
  }

  const selectedMember = members.find(member => member.nodeId === selectedNodeId)
  if (!selectedMember) {
    return { pathMemberIds, pathDistanceById, maxDistance: 0 }
  }

  const parentById = new Map(members.map(member => [member.id, member.primaryVisualParentMemberId]))
  const visited = new Set<string>()
  let cursor: string | null = selectedMember.id
  let distance = 0
  let maxDistance = 0

  while (cursor && !visited.has(cursor)) {
    pathMemberIds.add(cursor)
    pathDistanceById.set(cursor, distance)
    visited.add(cursor)
    maxDistance = distance
    cursor = parentById.get(cursor) ?? null
    distance += 1
  }

  return { pathMemberIds, pathDistanceById, maxDistance }
}

export function buildConnectorEdges({
  childGroups,
  isInSelectedPath,
  selectedPathMemberIds,
  traceDistance,
  perStepDelay,
}: {
  childGroups: ChildGroup[]
  isInSelectedPath: boolean
  selectedPathMemberIds: Set<string>
  traceDistance: number
  perStepDelay: number
}): ConnectorEdge[] {
  return childGroups.map(group => {
    const onPath =
      isInSelectedPath && group.members.some(child => selectedPathMemberIds.has(child.id))

    return {
      id: group.id,
      highlighted: onPath,
      traceDelaySec: onPath ? traceStepDelay(traceDistance, perStepDelay) : 0,
    }
  })
}
