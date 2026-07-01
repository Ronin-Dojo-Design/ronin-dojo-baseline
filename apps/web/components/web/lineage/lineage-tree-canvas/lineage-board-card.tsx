"use client"

import { Note } from "~/components/common/note"
import type { LineageListingRenderPolicy } from "~/lib/entitlements/lineage-tier-policy"
import type { CanvasMember } from "~/lib/lineage/canvas-model"
import type { LineageVisualGroupRow } from "~/server/web/lineage/payloads"
import { LineageCompactChildList } from "../lineage-compact-child-list"
import { LineageNodeCard } from "../lineage-node-card"

/**
 * Org Chart Board root card (Phase 3a).
 *
 * The composite root: the featured practitioner's full `LineageNodeCard` plus
 * an optional bio blurb, with their direct reports rendered inline beneath via
 * `LineageCompactChildList` (expandable rows, not separate full cards). Read-only
 * navigation — selection drives the same path-highlight + drawer flow as the tree.
 */
export function LineageBoardCard({
  member,
  childrenByParentId,
  descendantCountById,
  visualGroupById,
  defaultRootMemberId,
  rootId,
  selectedMemberId,
  selectedPathMemberIds,
  onSelect,
  onChangePromoter,
  canChangePromoter,
  renderPolicy,
  disciplineId,
}: {
  member: CanvasMember
  childrenByParentId: Map<string | null, CanvasMember[]>
  descendantCountById: Map<string, number>
  visualGroupById: Map<string, LineageVisualGroupRow>
  defaultRootMemberId: string | null | undefined
  rootId: string | undefined
  selectedMemberId: string | null
  selectedPathMemberIds: Set<string>
  onSelect: (nodeId: string) => void
  onChangePromoter?: (nodeId: string) => void
  canChangePromoter: boolean
  renderPolicy: LineageListingRenderPolicy
  disciplineId?: string | null
}) {
  const isRoot = member.id === defaultRootMemberId || member.nodeId === rootId
  const hasChildren = (childrenByParentId.get(member.id) ?? []).length > 0
  const bio = member.node.bio?.trim()

  return (
    <div
      id={`lineage-member-${member.id}`}
      className="w-full scroll-m-8 rounded-2xl border bg-card/60 p-3 shadow-sm md:p-4"
    >
      <LineageNodeCard
        node={member.node}
        isRoot={isRoot}
        isClaimable={member.isClaimable}
        onSelect={onSelect}
        canChangePromoter={canChangePromoter}
        onChangePromoter={onChangePromoter ? () => onChangePromoter(member.nodeId) : undefined}
        renderPolicy={renderPolicy}
        disciplineId={disciplineId}
      />

      {renderPolicy.features.bioPreview && bio && (
        <Note className="mt-2 line-clamp-3 text-xs">{bio}</Note>
      )}

      {hasChildren && (
        <div className="mt-3 border-border/60 border-t pt-3">
          <LineageCompactChildList
            parentMemberId={member.id}
            depth={0}
            visited={new Set([member.id])}
            childrenByParentId={childrenByParentId}
            descendantCountById={descendantCountById}
            visualGroupById={visualGroupById}
            selectedMemberId={selectedMemberId}
            selectedPathMemberIds={selectedPathMemberIds}
            onSelect={onSelect}
            canChangePromoter={canChangePromoter}
            onChangePromoter={onChangePromoter}
            renderPolicy={renderPolicy}
            disciplineId={disciplineId}
          />
        </div>
      )}
    </div>
  )
}
