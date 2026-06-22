"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  ELITE_LINEAGE_LISTING_RENDER_POLICY,
  FREE_LINEAGE_LISTING_RENDER_POLICY,
  type LineageListingRenderPolicy,
} from "~/lib/entitlements/lineage-tier-policy"
import { bblPortalTypographyClass } from "~/lib/fonts"
import { passportDisplayName } from "~/lib/identity/passport-display"
import type { LineageRow } from "~/lib/lineage/tree-layout"
import type { LineageEditorCapability } from "~/server/web/lineage/editor-queries"
import type {
  LineageNodeProfile,
  LineageRelationshipRow,
  LineageTreeMemberRow,
  LineageVisualGroupRow,
} from "~/server/web/lineage/payloads"
import { LineageEditorToolbar } from "./lineage-editor-toolbar"
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

function displayNameForMember(member: LineageTreeMemberRow): string {
  return passportDisplayName(member.node.passport) ?? "Unnamed"
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
  const effectiveRenderPolicy =
    capability?.canEditTree || capability?.canManageGroups
      ? ELITE_LINEAGE_LISTING_RENDER_POLICY
      : (renderPolicy ?? FREE_LINEAGE_LISTING_RENDER_POLICY)

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
          rankAwards: selectedProfile.passport?.rankAwardsEarned ?? [],
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
        onChangePromoter={capability?.canEditTree ? handleChangePromoterIntent : undefined}
        treeId={treeId}
        editMode={editMode}
        canEditPlacement={capability?.canEditTree ?? false}
        canManageGroups={capability?.canManageGroups ?? false}
        renderPolicy={effectiveRenderPolicy}
      />

      <LineageProfileDrawer
        open={drawerOpen}
        onOpenChange={open => {
          if (!open) handleDrawerClose()
        }}
        profile={selectedProfile}
        promoterChangeContext={promoterChangeContext}
        // SESSION_0430: the drawer header/history must reflect awarded truth (highest
        // RankAward), NOT the LineageTreeMember.selectedRankAward pointer — that FK is
        // being repurposed as a pending *claim* (set at registration/claim, awarded on
        // admin-verify) and must not drive display. Pass null so the header defaults to
        // the highest awarded belt. Admin promoter-change still reads selectedMember
        // .selectedRankAward directly (above), so the editorial path is unaffected.
        selectedRankAward={null}
        isClaimable={selectedMember?.isClaimable}
        isTreeClaimable={isTreeClaimable}
        treeSlug={treeSlug}
        treeId={treeId}
        nodeId={selectedNodeId}
        isAdmin={!!capability?.canEditTree}
        activeTab={drawerTab}
        onTabChange={setDrawerTab}
        contentClassName={bblPortalTypographyClass}
      />
    </>
  )
}
