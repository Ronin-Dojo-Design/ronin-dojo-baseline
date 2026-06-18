"use client"

import { useEffect, useMemo } from "react"
import type { LineageVisualNode } from "~/lib/lineage/to-lineage-visual"
import type { LineageCohortTimelineProps, LineageTimelineHandlers } from "./cohort-timeline-types"

/**
 * Derivation + auto-center state for the LineageCohortTimeline orchestrator:
 * the parent→children index, the focal node, the ancestor spine chain (capped by
 * `ancestryDepth`, ordered root→focal), the memoized handler bag, and the
 * focus-change `scrollIntoView` that replaces family-chart's `tree_position`
 * (ADR 0027). Keeps the derivation logic out of the JSX orchestrator.
 */
export function useCohortTimeline({
  nodes,
  focusMemberId,
  ancestryDepth,
  reduceMotion,
  onFocus,
  onOpenMenu,
  onOpenProfile,
}: Pick<
  LineageCohortTimelineProps,
  | "nodes"
  | "focusMemberId"
  | "ancestryDepth"
  | "reduceMotion"
  | "onFocus"
  | "onOpenMenu"
  | "onOpenProfile"
>) {
  const nodeById = useMemo(() => new Map(nodes.map(node => [node.id, node])), [nodes])

  const childrenByParent = useMemo(() => {
    const map = new Map<string, LineageVisualNode[]>()
    for (const node of nodes) {
      const parentId = node.primaryVisualParentMemberId
      if (!parentId) continue
      const list = map.get(parentId) ?? []
      list.push(node)
      map.set(parentId, list)
    }
    return map
  }, [nodes])

  const focalNode = focusMemberId ? (nodeById.get(focusMemberId) ?? null) : (nodes[0] ?? null)

  // Ancestor spine: walk up from focal, capped by ancestryDepth, ordered root→focal.
  const ancestors = useMemo(() => {
    if (!focalNode) return []
    const chain: LineageVisualNode[] = []
    const seen = new Set<string>()
    let cursor = focalNode.primaryVisualParentMemberId
    while (cursor && !seen.has(cursor) && chain.length < ancestryDepth) {
      const parent = nodeById.get(cursor)
      if (!parent) break
      seen.add(cursor)
      chain.push(parent)
      cursor = parent.primaryVisualParentMemberId
    }
    return chain.reverse()
  }, [focalNode, nodeById, ancestryDepth])

  const handlers = useMemo<LineageTimelineHandlers>(
    () => ({ onFocus, onOpenMenu, onOpenProfile }),
    [onFocus, onOpenMenu, onOpenProfile],
  )

  // Auto-center the focal box on focus change (replaces family-chart's tree_position).
  useEffect(() => {
    if (!focusMemberId) return
    const el = document.getElementById(`lineage-member-${focusMemberId}`)
    el?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
      inline: "center",
    })
  }, [focusMemberId, reduceMotion])

  return { focalNode, ancestors, childrenByParent, handlers }
}
