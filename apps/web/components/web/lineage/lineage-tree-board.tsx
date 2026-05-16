"use client"

import { useState } from "react"
import type { LineageRow } from "~/lib/lineage/tree-layout"
import type { LineageNodeProfile, LineageRelationshipRow } from "~/server/web/lineage/payloads"
import { LineageOrgChart } from "./lineage-org-chart"
import { LineageProfileDrawer } from "./lineage-profile-drawer"

/**
 * Client island that owns drawer state + selected node id, and renders the
 * tree alongside the drawer.
 *
 * Profile data for every visible node is pre-fetched on the server and
 * passed in via `profilesById` (small tree, ≤10 nodes — eager-load is the
 * lightest path that doesn't introduce a new data layer).
 *
 * Author: Cody / SESSION_0175 TASK_03.
 */

type LineageTreeBoardProps = {
  rows: LineageRow[]
  rootId: string
  profilesById: Record<string, LineageNodeProfile>
  edges: LineageRelationshipRow[]
}

export function LineageTreeBoard({ rows, rootId, profilesById, edges }: LineageTreeBoardProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const selectedProfile = selectedNodeId ? (profilesById[selectedNodeId] ?? null) : null

  return (
    <>
      <LineageOrgChart rows={rows} rootId={rootId} edges={edges} onSelect={setSelectedNodeId} />
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
