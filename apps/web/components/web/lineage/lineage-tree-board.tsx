"use client"

import { useState } from "react"
import type { LineageRow } from "~/lib/lineage/tree-layout"
import type {
  LineageNodeProfile,
  LineageRelationshipRow,
  LineageTreeMemberRow,
  LineageVisualGroupRow,
} from "~/server/web/lineage/payloads"
import { LineageProfileDrawer } from "./lineage-profile-drawer"
import { LineageTreeCanvas } from "./lineage-tree-canvas"

/**
 * Client island that owns drawer state + selected node id.
 *
 * v1 renders through `LineageTreeCanvas`, not d3-org-chart.
 *
 * Supports two data paths:
 * - preferred v1 path: LineageTreeMember + LineageVisualGroup payloads
 * - legacy discipline-page path: bucketed rows + relationship edges
 */

type LineageTreeBoardProps = {
  profilesById: Record<string, LineageNodeProfile>

  /**
   * Preferred v1 source for `/lineage/[treeSlug]`.
   */
  members?: LineageTreeMemberRow[]
  visualGroups?: LineageVisualGroupRow[]
  defaultRootMemberId?: string | null

  /**
   * Legacy fallback source for discipline detail page.
   */
  rows?: LineageRow[]
  rootId?: string
  edges?: LineageRelationshipRow[]
}

export function LineageTreeBoard({
  rows,
  rootId,
  profilesById,
  edges,
  members,
  visualGroups,
  defaultRootMemberId,
}: LineageTreeBoardProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const selectedProfile = selectedNodeId ? (profilesById[selectedNodeId] ?? null) : null

  return (
    <>
      <LineageTreeCanvas
        rows={rows}
        rootId={rootId}
        edges={edges}
        members={members}
        visualGroups={visualGroups}
        defaultRootMemberId={defaultRootMemberId}
        selectedNodeId={selectedNodeId}
        onSelect={setSelectedNodeId}
      />

      <LineageProfileDrawer
        open={selectedNodeId !== null}
        onOpenChange={open => {
          if (!open) setSelectedNodeId(null)
        }}
        profile={selectedProfile}
      />
    </>
  )
}
