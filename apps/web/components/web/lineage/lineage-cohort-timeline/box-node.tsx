"use client"

import type { LineageVisualNode } from "~/lib/lineage/to-lineage-visual"
import { LineageBoxCard } from "./box-card"
import { ConnectorBand } from "./connector-band"
import type { LineageTimelineHandlers } from "./cohort-timeline-types"
import { promotionYear, sortByPromotion } from "./promotion-format"

/**
 * Recursive top-down box layout, rooted at the focal node (progeny direction).
 * A leaf child stays a row inside its parent card; a child who has students of
 * their own sprouts their own box below, joined by a measured-SVG ConnectorBand.
 * Branch recursion is capped by `maxDepth` (the progeny depth control).
 */
export function BoxNode({
  node,
  promoterName,
  childrenByParent,
  focusMemberId,
  generation,
  maxDepth,
  matchedMemberIds,
  reduceMotion,
  handlers,
}: {
  node: LineageVisualNode
  promoterName: string | null
  childrenByParent: Map<string, LineageVisualNode[]>
  focusMemberId: string | null
  generation: number
  maxDepth: number
  matchedMemberIds: Set<string> | null
  reduceMotion: boolean
  handlers: LineageTimelineHandlers
}) {
  // Chronological: earliest promotion first, undated last (reading down = forward in time).
  const children = [...(childrenByParent.get(node.id) ?? [])].sort(sortByPromotion)
  const leafChildren = children.filter(child => !childrenByParent.has(child.id))
  const branchChildren =
    generation < maxDepth ? children.filter(child => childrenByParent.has(child.id)) : []

  const dimmed = matchedMemberIds !== null && !matchedMemberIds.has(node.id)

  return (
    <div data-lineage-conn-col className="flex min-w-fit flex-col items-center">
      <LineageBoxCard
        node={node}
        promoterName={promoterName}
        leafChildren={leafChildren}
        branchCount={branchChildren.length}
        isFocal={node.id === focusMemberId}
        dimmed={dimmed}
        onFocus={handlers.onFocus}
        onOpenMenu={handlers.onOpenMenu}
        onOpenProfile={handlers.onOpenProfile}
      />

      {branchChildren.length > 0 && (
        <div className="relative mt-10 flex items-start justify-center gap-8">
          <ConnectorBand
            columns={branchChildren.map(child => ({
              id: child.id,
              year: promotionYear(child.promotionDate),
            }))}
            generation={generation}
            reduceMotion={reduceMotion}
          />
          {branchChildren.map(child => (
            <BoxNode
              key={child.id}
              node={child}
              promoterName={node.displayName}
              childrenByParent={childrenByParent}
              focusMemberId={focusMemberId}
              generation={generation + 1}
              maxDepth={maxDepth}
              matchedMemberIds={matchedMemberIds}
              reduceMotion={reduceMotion}
              handlers={handlers}
            />
          ))}
        </div>
      )}
    </div>
  )
}
