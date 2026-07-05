"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { LineageListingRenderPolicy } from "~/lib/entitlements/lineage-tier-policy"
import { bblPortalTypographyClass } from "~/lib/fonts"
import type { LineageRow } from "~/lib/lineage/tree-layout"
import type { ClaimViewerState } from "~/server/web/claims/resolve-viewer-claim-state"
import type { LineageEditorCapability } from "~/server/web/lineage/editor-queries"
import type {
  LineageNodeProfile,
  LineageRelationshipRow,
  LineageTreeMemberRow,
  LineageVisualGroupRow,
} from "~/server/web/lineage/payloads"
import { LineageEditorToolbar } from "./lineage-editor-toolbar"
import {
  buildPromoterChangeContext,
  findMemberByNodeId,
  resolveEffectiveRenderPolicy,
} from "./lineage-tree-board-model"
import { LineageProfileDrawer, type LineageProfileDrawerTab } from "./lineage-profile-drawer"
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
  /** Viewer claim state per node id (ADR 0036, SESSION_0440) — drives the drawer CTA. */
  claimStateByNodeId?: Record<string, ClaimViewerState>
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

  /** The tree's discipline — scopes the shown belt to this discipline (ADR 0035 §3). */
  disciplineId?: string | null

  /**
   * Optional explicit canvas layout (tree | board). When omitted, the canvas
   * chooses a responsive default: board below md, tree at/above md.
   */
  defaultLayout?: LineageLayout
  renderPolicy?: LineageListingRenderPolicy

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
  claimStateByNodeId,
  edges,
  members,
  visualGroups,
  defaultRootMemberId,
  disciplineId,
  defaultLayout,
  treeId,
  treeSlug,
  isTreeClaimable,
  capability,
  publicHref,
  renderPolicy,
}: LineageTreeBoardProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [drawerTab, setDrawerTab] = useState<LineageProfileDrawerTab>("info")
  const drawerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Delay drawer open so the path highlight animates first (~400ms).
   * Path highlighting is driven by `selectedNodeId` (set immediately);
   * the drawer is driven by `drawerOpen` (set after the delay).
   */
  const effectiveRenderPolicy = resolveEffectiveRenderPolicy({ capability, renderPolicy })

  const handleNodeSelect = useCallback((nodeId: string) => {
    // Clear any pending drawer open
    if (drawerTimerRef.current) clearTimeout(drawerTimerRef.current)

    // Set the path highlight immediately
    setSelectedNodeId(nodeId)
    setDrawerTab("info")

    // Open the drawer after a delay so the path lights up first.
    // The drawer opens for everyone; tier gates its *contents*
    // (LineageProfileDetailRenderPolicy), not whether it opens.
    drawerTimerRef.current = setTimeout(() => {
      setDrawerOpen(true)
    }, 400)
  }, [])

  /**
   * Phase 3c (descoped SESSION_0333): on-card / on-row "Change promoter..." path.
   * Selects the node (so the path highlight runs) and opens the profile drawer on
   * the Rank History tab — promotion history + the promoter editor entry — with the
   * same 400ms delay so the path trace still reads first. The editor changes the
   * promoter from the drawer's action menu. This replaces the fragile auto-opened
   * modal that depended on drawer mount timing and never reliably opened.
   */
  const handleChangePromoterIntent = useCallback((nodeId: string) => {
    if (drawerTimerRef.current) clearTimeout(drawerTimerRef.current)
    setSelectedNodeId(nodeId)
    setDrawerTab("rank-history")
    drawerTimerRef.current = setTimeout(() => {
      setDrawerOpen(true)
    }, 400)
  }, [])

  const handleDrawerClose = useCallback(() => {
    if (drawerTimerRef.current) clearTimeout(drawerTimerRef.current)
    setDrawerOpen(false)
    setSelectedNodeId(null)
    setDrawerTab("info")
  }, [])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (drawerTimerRef.current) clearTimeout(drawerTimerRef.current)
    }
  }, [])

  const selectedProfile = selectedNodeId ? (profilesById[selectedNodeId] ?? null) : null
  const selectedMember = findMemberByNodeId(members, selectedNodeId)
  const promoterChangeContext = buildPromoterChangeContext({
    treeId,
    capability,
    selectedProfile,
    selectedMember,
    members,
  })

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
        onChangePromoter={capability?.canEditTree ? handleChangePromoterIntent : undefined}
        treeId={treeId}
        editMode={editMode}
        canEditPlacement={capability?.canEditTree ?? false}
        canManageGroups={capability?.canManageGroups ?? false}
        renderPolicy={effectiveRenderPolicy}
        disciplineId={disciplineId}
      />

      <LineageProfileDrawer
        open={drawerOpen}
        onOpenChange={open => {
          if (!open) handleDrawerClose()
        }}
        profile={selectedProfile}
        promoterChangeContext={promoterChangeContext}
        disciplineId={disciplineId}
        isClaimable={selectedMember?.isClaimable}
        isTreeClaimable={isTreeClaimable}
        viewerClaimState={selectedNodeId ? claimStateByNodeId?.[selectedNodeId] : undefined}
        treeSlug={treeSlug}
        nodeId={selectedNodeId}
        isAdmin={!!capability?.canEditTree}
        activeTab={drawerTab}
        onTabChange={setDrawerTab}
        contentClassName={bblPortalTypographyClass}
      />
    </>
  )
}
