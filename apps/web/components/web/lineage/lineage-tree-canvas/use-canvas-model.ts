"use client"

import { useMemo } from "react"
import { buildDescendantCounts } from "~/lib/lineage/canvas-model"
import { buildSelectedPathTrace, tracePerStepDelay } from "~/lib/lineage/connector-geometry"
import type { LineageRow } from "~/lib/lineage/tree-layout"
import type {
  LineageRelationshipRow,
  LineageTreeMemberRow,
  LineageVisualGroupRow,
} from "~/server/web/lineage/payloads"
import {
  buildChildrenByParentId,
  buildRootMembers,
  normalizeLegacyRows,
  normalizeMembers,
} from "./canvas-data"

/**
 * Derive every memoized view-model value the canvas renders from the raw props.
 *
 * Pure derivation pulled out of the orchestrator: normalization (v1 members vs.
 * legacy rows), the children/forest index, descendant counts, root resolution,
 * the selected-path trace, the per-step trace delay, and the toolbar counts.
 */
export function useCanvasModel({
  members,
  visualGroups,
  defaultRootMemberId,
  rows,
  rootId,
  edges,
  selectedNodeId,
  reduceMotion,
}: {
  members?: LineageTreeMemberRow[]
  visualGroups?: LineageVisualGroupRow[]
  defaultRootMemberId?: string | null
  rows?: LineageRow[]
  rootId?: string
  edges?: LineageRelationshipRow[]
  selectedNodeId?: string | null
  reduceMotion?: boolean
}) {
  const normalizedMembers = useMemo(() => {
    if (members && members.length > 0) return normalizeMembers(members)

    return normalizeLegacyRows({ rows, rootId, edges })
  }, [members, rows, rootId, edges])

  const visualGroupById = useMemo(() => {
    return new Map((visualGroups ?? []).map(group => [group.id, group]))
  }, [visualGroups])

  const childrenByParentId = useMemo(() => {
    return buildChildrenByParentId(normalizedMembers)
  }, [normalizedMembers])

  const descendantCountById = useMemo(() => {
    return buildDescendantCounts(childrenByParentId)
  }, [childrenByParentId])

  const rootMembers = useMemo(() => {
    return buildRootMembers({
      members: normalizedMembers,
      childrenByParentId,
      defaultRootMemberId,
      rootId,
    })
  }, [normalizedMembers, childrenByParentId, defaultRootMemberId, rootId])

  const {
    pathMemberIds: selectedPathMemberIds,
    pathDistanceById,
    maxDistance,
  } = useMemo(() => {
    return buildSelectedPathTrace({ members: normalizedMembers, selectedNodeId })
  }, [normalizedMembers, selectedNodeId])

  const perStepDelay = useMemo(() => {
    if (reduceMotion) return 0
    return tracePerStepDelay(maxDistance)
  }, [reduceMotion, maxDistance])

  const selectedMemberId = useMemo(() => {
    return normalizedMembers.find(member => member.nodeId === selectedNodeId)?.id ?? null
  }, [normalizedMembers, selectedNodeId])

  const publicGroupCount = (visualGroups ?? []).filter(group => group.showPublicLabel).length
  const memberCount = normalizedMembers.length
  const rootCount = rootMembers.length
  const hasSelection = Boolean(selectedMemberId)

  return {
    normalizedMembers,
    visualGroupById,
    childrenByParentId,
    descendantCountById,
    rootMembers,
    selectedPathMemberIds,
    pathDistanceById,
    perStepDelay,
    selectedMemberId,
    publicGroupCount,
    memberCount,
    rootCount,
    hasSelection,
  }
}
