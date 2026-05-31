"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { LineageRow } from "~/lib/lineage/tree-layout"
import type { LineageEditorCapability } from "~/server/web/lineage/editor-queries"
import type {
  LineageNodeProfile,
  LineageRelationshipRow,
  LineageTreeMemberRow,
  LineageVisualGroupRow,
} from "~/server/web/lineage/payloads"
import { LineageEditorToolbar } from "./lineage-editor-toolbar"
import { LineageProfileDrawer } from "./lineage-profile-drawer"
import { type LineageLayout, LineageTreeCanvas } from "./lineage-tree-canvas"

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
  treeId?: string
  treeSlug?: string
  isTreeClaimable?: boolean
  capability?: LineageEditorCapability
  publicHref?: string | null

  /**
   * Preferred v1 source for `/lineage/[treeSlug]`.
   */
  members?: LineageTreeMemberRow[]
  visualGroups?: LineageVisualGroupRow[]
  defaultRootMemberId?: string | null

  /**
   * Initial canvas layout (tree | board). The discipline page passes "board"
   * because the vertical board layout has no horizontal overflow (the tree
   * layout's transform-scale fit never produced a usable horizontal scrollbar).
   */
  defaultLayout?: LineageLayout

  /**
   * Legacy fallback source for discipline detail page.
   */
  rows?: LineageRow[]
  rootId?: string
  edges?: LineageRelationshipRow[]
}

function displayNameForMember(member: LineageTreeMemberRow): string {
  return member.node.user.passport?.displayName ?? member.node.user.name ?? "Unnamed"
}

function descendantMemberIds(members: LineageTreeMemberRow[], rootMemberId: string): Set<string> {
  const childrenByParentId = new Map<string, string[]>()
  for (const member of members) {
    if (!member.primaryVisualParentMemberId) continue
    const children = childrenByParentId.get(member.primaryVisualParentMemberId) ?? []
    children.push(member.id)
    childrenByParentId.set(member.primaryVisualParentMemberId, children)
  }

  const descendants = new Set<string>()
  const stack = [...(childrenByParentId.get(rootMemberId) ?? [])]
  while (stack.length > 0) {
    const next = stack.pop()
    if (!next || descendants.has(next)) continue
    descendants.add(next)
    stack.push(...(childrenByParentId.get(next) ?? []))
  }
  return descendants
}

export function LineageTreeBoard({
  rows,
  rootId,
  profilesById,
  edges,
  members,
  visualGroups,
  defaultRootMemberId,
  defaultLayout,
  treeId,
  treeSlug,
  isTreeClaimable,
  capability,
  publicHref,
}: LineageTreeBoardProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const drawerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Delay drawer open so the path highlight animates first (~400ms).
   * Path highlighting is driven by `selectedNodeId` (set immediately);
   * the drawer is driven by `drawerOpen` (set after the delay).
   */
  const handleNodeSelect = useCallback((nodeId: string) => {
    // Clear any pending drawer open
    if (drawerTimerRef.current) clearTimeout(drawerTimerRef.current)

    // Set the path highlight immediately
    setSelectedNodeId(nodeId)

    // Open the drawer after a delay so the path lights up first
    drawerTimerRef.current = setTimeout(() => {
      setDrawerOpen(true)
    }, 400)
  }, [])

  const handleDrawerClose = useCallback(() => {
    if (drawerTimerRef.current) clearTimeout(drawerTimerRef.current)
    setDrawerOpen(false)
    setSelectedNodeId(null)
  }, [])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (drawerTimerRef.current) clearTimeout(drawerTimerRef.current)
    }
  }, [])

  const selectedProfile = selectedNodeId ? (profilesById[selectedNodeId] ?? null) : null
  const selectedMember =
    selectedNodeId && members ? members.find(member => member.nodeId === selectedNodeId) : null
  const selectedMemberDescendants =
    members && selectedMember ? descendantMemberIds(members, selectedMember.id) : new Set<string>()
  const promoterChangeContext =
    treeId && capability?.canEditTree && selectedProfile && selectedMember && members
      ? {
          treeId,
          memberId: selectedMember.id,
          currentRankAwardId: selectedMember.selectedRankAward?.id ?? null,
          rankAwards: selectedProfile.user.rankAwards,
          candidates: members
            .filter(
              member =>
                member.id !== selectedMember.id && !selectedMemberDescendants.has(member.id),
            )
            .map(member => ({ memberId: member.id, label: displayNameForMember(member) })),
        }
      : null

  return (
    <>
      {treeId && capability && (
        <LineageEditorToolbar
          editMode={editMode}
          onEditModeChange={setEditMode}
          canEditPlacement={capability.canEditTree}
          canManageGroups={capability.canManageGroups}
          canPublish={capability.canPublish}
          publicHref={publicHref}
        />
      )}

      <LineageTreeCanvas
        rows={rows}
        rootId={rootId}
        edges={edges}
        members={members}
        visualGroups={visualGroups}
        defaultRootMemberId={defaultRootMemberId}
        defaultLayout={defaultLayout}
        selectedNodeId={selectedNodeId}
        onSelect={handleNodeSelect}
        treeId={treeId}
        editMode={editMode}
        canEditPlacement={capability?.canEditTree ?? false}
        canManageGroups={capability?.canManageGroups ?? false}
      />

      <LineageProfileDrawer
        open={drawerOpen}
        onOpenChange={open => {
          if (!open) handleDrawerClose()
        }}
        profile={selectedProfile}
        promoterChangeContext={promoterChangeContext}
        selectedRankAward={selectedMember?.selectedRankAward ?? null}
        isClaimable={selectedMember?.isClaimable}
        isTreeClaimable={isTreeClaimable}
        treeSlug={treeSlug}
        treeId={treeId}
        nodeId={selectedNodeId}
        isAdmin={!!capability?.canEditTree}
      />
    </>
  )
}
