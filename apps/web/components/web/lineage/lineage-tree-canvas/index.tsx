"use client"

import { DndContext } from "@dnd-kit/core"
import { useReducedMotion } from "@mantine/hooks"
import { Maximize2Icon } from "lucide-react"
import dynamic from "next/dynamic"
import { Badge } from "~/components/common/badge"
import { H6 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { FREE_LINEAGE_LISTING_RENDER_POLICY } from "~/lib/entitlements/lineage-tier-policy"
import { cx } from "~/lib/utils"
import { LineageHonorStrip } from "../lineage-honor-strip"
import { LineageSearchBar } from "../lineage-search-bar"
import { LineageBranch } from "./lineage-branch"
import { LineageCanvasToolbar } from "./lineage-canvas-toolbar"
import { clampScale, SCALE_STEP } from "./lineage-tree-canvas-constants"
import type { LineageTreeCanvasProps } from "./lineage-tree-canvas-types"
import { useCanvasLayout } from "./use-canvas-layout"
import { useCanvasModel } from "./use-canvas-model"
import { useCanvasZoom } from "./use-canvas-zoom"
import { useLineagePlacementEditor } from "./use-lineage-placement-editor"

// Public type surface — consumers import `LineageLayout` from the barrel, not a private module file.
export type { LineageLayout } from "./lineage-tree-canvas-types"

/**
 * React-first lineage tree canvas (the folder module's public barrel).
 *
 * Replaces the old d3-org-chart viewer with a Dirstarter/Ronin-native visual
 * tree that can render multiple roots / forest fragments, v1 LineageTreeMember
 * parent pointers, LineageVisualGroup rows, and legacy row+edge data.
 *
 * Thin orchestrator: derivation lives in `use-canvas-*` hooks, drag/drop in
 * `use-lineage-placement-editor`, and every leaf (toolbar, branch, board card,
 * mobile list) is its own file. The orchestrator only wires those parts and
 * lazy-loads the branches that aren't the eager desktop default.
 *
 * Editor mode is opt-in from the dashboard route. Drag/drop calls audited server
 * actions; the public viewer path renders read-only.
 *
 * @see docs/runbooks/component-launch-sweep-recipe.md
 */

// Lazy boundaries: the board + mobile-list branches are mutually exclusive with the eager tree
// (one ternary arm mounts at a time, so the inactive arms genuinely unmount). Splitting them keeps
// the compact-child-list / mobile-list JS out of the default desktop-tree bundle until a viewer
// actually switches to board or drops below the mobile breakpoint.
const canvasBranchLoading = () => (
  <Note className="p-6 text-center text-sm text-muted-foreground">Loading…</Note>
)
const LineageBoardCard = dynamic(
  () => import("./lineage-board-card").then(m => m.LineageBoardCard),
  { loading: canvasBranchLoading },
)
const LineageMobileList = dynamic(
  () => import("../lineage-mobile-list").then(m => m.LineageMobileList),
  { loading: canvasBranchLoading },
)

export function LineageTreeCanvas({
  members,
  visualGroups,
  defaultRootMemberId,
  rows,
  rootId,
  edges,
  selectedNodeId,
  onSelect,
  onChangePromoter,
  treeId,
  editMode = false,
  canEditPlacement = false,
  canManageGroups = false,
  defaultLayout,
  renderPolicy = FREE_LINEAGE_LISTING_RENDER_POLICY,
}: LineageTreeCanvasProps) {
  const reduceMotion = useReducedMotion()
  const { layout, setLayout, isMobileListViewport, isTouch, layoutTouchedRef } =
    useCanvasLayout(defaultLayout)

  const model = useCanvasModel({
    members,
    visualGroups,
    defaultRootMemberId,
    rows,
    rootId,
    edges,
    selectedNodeId,
    reduceMotion,
  })

  const { scale, setScale, scrollRef, contentRef, isPinching, resetAutoFit } = useCanvasZoom({
    layout,
    isMobileListViewport,
    editMode,
    rootMembers: model.rootMembers,
  })

  const { sensors, handleDragEnd, isPlacementSaving } = useLineagePlacementEditor({
    treeId,
    editMode,
    canEditPlacement,
  })

  if (model.memberCount === 0) {
    return <Note>This lineage has no recorded practitioners yet.</Note>
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {/* `w-full min-w-0 max-w-full`: this card is a flex item in a `flex-col items-start`
          page-layout ancestor, so without an explicit width it shrink-wraps to the tree's
          intrinsic content width (~3.6kpx on a wide lineage) instead of the viewport. That
          blowout defeats the canvas's own `overflow-x-auto` (it never scrolls) and the app
          shell's `overflow-clip` then clips the right half — taking the right-justified
          Tree/Board + zoom controls off-screen. Bounding the card here re-engages the canvas
          horizontal scroll and keeps the toolbar within the viewport. (SESSION_0337) */}
      <div className="w-full min-w-0 max-w-full rounded-2xl border bg-card/40 p-3 shadow-sm md:p-4">
        <LineageCanvasToolbar
          memberCount={model.memberCount}
          rootCount={model.rootCount}
          publicGroupCount={model.publicGroupCount}
          hasSelection={model.hasSelection}
          editMode={editMode}
          canEditPlacement={canEditPlacement}
          isPlacementSaving={isPlacementSaving}
          isMobileListViewport={isMobileListViewport}
          layout={layout}
          onSelectTree={() => {
            layoutTouchedRef.current = true
            resetAutoFit()
            setLayout("tree")
          }}
          onSelectBoard={() => {
            layoutTouchedRef.current = true
            setLayout("board")
          }}
          onZoomIn={() => setScale(current => clampScale(current + SCALE_STEP))}
          onZoomOut={() => setScale(current => clampScale(current - SCALE_STEP))}
          onResetZoom={() => setScale(1)}
        />

        <LineageSearchBar
          members={model.normalizedMembers}
          selectedMemberId={model.selectedMemberId}
          onSelect={onSelect}
        />

        <LineageHonorStrip
          members={model.normalizedMembers}
          selectedMemberId={model.selectedMemberId}
          onSelect={onSelect}
          renderPolicy={renderPolicy}
        />

        <div
          ref={scrollRef}
          data-lineage-canvas-scroll
          className={cx(
            "relative max-w-full overflow-x-auto overflow-y-auto rounded-xl border bg-background",
            // Native one-finger scroll/pan stays; disable browser pinch so our
            // two-finger handler drives zoom. Edit mode keeps default for @dnd-kit.
            !editMode && "touch-pan-x touch-pan-y",
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--muted))_0,_transparent_32rem)] opacity-70" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />

          <div
            ref={contentRef}
            className={cx(
              "relative",
              isMobileListViewport ? "p-3" : "p-8",
              layout === "tree" && !isMobileListViewport && "min-w-max",
              layout === "tree" &&
                !isMobileListViewport &&
                !isPinching &&
                !reduceMotion &&
                "transition-transform duration-300 ease-out",
            )}
            style={
              layout === "tree" && !isMobileListViewport
                ? { transform: `scale(${scale})`, transformOrigin: "top left" }
                : undefined
            }
          >
            <Stack size="xs" direction="column" className="mb-8 items-center text-center">
              {layout === "tree" && !isMobileListViewport && (
                <Badge variant="outline" size="sm" prefix={<Maximize2Icon />}>
                  {isTouch ? "Pinch to explore" : "Scroll to explore"}
                </Badge>
              )}
              <H6 className="text-muted-foreground">
                {isMobileListViewport || layout === "board"
                  ? "Tap any practitioner to open their profile"
                  : "Click a practitioner to trace their path to the root"}
              </H6>
            </Stack>

            {isMobileListViewport ? (
              <LineageMobileList
                members={model.normalizedMembers}
                rootMembers={model.rootMembers}
                selectedMemberId={model.selectedMemberId}
                selectedPathMemberIds={model.selectedPathMemberIds}
                onSelect={onSelect}
                canChangePromoter={editMode && canEditPlacement}
                onChangePromoter={onChangePromoter}
                renderPolicy={renderPolicy}
              />
            ) : layout === "board" ? (
              <Stack size="lg" direction="column" className="mx-auto w-full max-w-2xl md:max-w-4xl">
                {model.rootMembers.map(rootMember => (
                  <LineageBoardCard
                    key={rootMember.id}
                    member={rootMember}
                    childrenByParentId={model.childrenByParentId}
                    descendantCountById={model.descendantCountById}
                    visualGroupById={model.visualGroupById}
                    defaultRootMemberId={defaultRootMemberId}
                    rootId={rootId}
                    selectedMemberId={model.selectedMemberId}
                    selectedPathMemberIds={model.selectedPathMemberIds}
                    onSelect={onSelect}
                    onChangePromoter={onChangePromoter}
                    canChangePromoter={editMode && canEditPlacement}
                    renderPolicy={renderPolicy}
                  />
                ))}
              </Stack>
            ) : (
              <div className="flex min-w-fit items-start justify-center gap-6 md:gap-12">
                {model.rootMembers.map((rootMember, index) => (
                  <LineageBranch
                    key={rootMember.id}
                    member={rootMember}
                    childrenByParentId={model.childrenByParentId}
                    visualGroupById={model.visualGroupById}
                    defaultRootMemberId={defaultRootMemberId}
                    rootId={rootId}
                    treeId={treeId}
                    editMode={editMode}
                    canEditPlacement={canEditPlacement}
                    canManageGroups={canManageGroups}
                    selectedMemberId={model.selectedMemberId}
                    selectedPathMemberIds={model.selectedPathMemberIds}
                    pathDistanceById={model.pathDistanceById}
                    perStepDelay={model.perStepDelay}
                    hasSelection={model.hasSelection}
                    onSelect={onSelect}
                    onChangePromoter={onChangePromoter}
                    renderPolicy={renderPolicy}
                    visited={new Set()}
                    generation={0}
                    siblingIndex={index}
                    reduceMotion={reduceMotion ?? false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DndContext>
  )
}
