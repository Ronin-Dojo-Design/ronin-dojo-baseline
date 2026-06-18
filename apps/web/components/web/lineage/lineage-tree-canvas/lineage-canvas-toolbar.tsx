"use client"

import {
  ListTreeIcon,
  MinusIcon,
  NetworkIcon,
  PlusIcon,
  RotateCcwIcon,
  SparklesIcon,
  TreePineIcon,
} from "lucide-react"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"
import type { LineageLayout } from "./lineage-tree-canvas-types"

/**
 * Sticky canvas toolbar: status badges (member/root/group counts, path + editor
 * state) on the left, the Tree/Board toggle + zoom controls on the right. Pure
 * presentation — the orchestrator owns the layout/zoom state and threads the
 * handlers, so this component holds no canvas logic.
 */
export function LineageCanvasToolbar({
  memberCount,
  rootCount,
  publicGroupCount,
  hasSelection,
  editMode,
  canEditPlacement,
  isPlacementSaving,
  isMobileListViewport,
  layout,
  onSelectTree,
  onSelectBoard,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: {
  memberCount: number
  rootCount: number
  publicGroupCount: number
  hasSelection: boolean
  editMode: boolean
  canEditPlacement: boolean
  isPlacementSaving: boolean
  isMobileListViewport: boolean
  layout: LineageLayout
  onSelectTree: () => void
  onSelectBoard: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
}) {
  return (
    <Stack
      size="sm"
      wrap
      className="sticky top-2 z-20 mb-4 items-center justify-between gap-3 rounded-xl border bg-card/95 p-2 shadow-sm backdrop-blur md:top-4"
      direction="row"
    >
      <Stack size="xs" wrap>
        <Badge variant="primary" size="sm" prefix={<TreePineIcon />}>
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </Badge>

        {rootCount > 1 && (
          <Badge variant="info" size="sm">
            {rootCount} roots
          </Badge>
        )}

        {publicGroupCount > 0 && (
          <Badge variant="soft" size="sm">
            {publicGroupCount} public groups
          </Badge>
        )}

        {hasSelection && (
          <Badge variant="outline" size="sm" prefix={<SparklesIcon />}>
            Path highlighted
          </Badge>
        )}

        {editMode && canEditPlacement && (
          <Badge variant="warning" size="sm">
            Drag editing
          </Badge>
        )}

        {isPlacementSaving && (
          <Badge variant="info" size="sm">
            Saving placement
          </Badge>
        )}
      </Stack>

      <Stack size="sm" wrap>
        {!isMobileListViewport && (
          <Stack size="xs">
            <Button
              type="button"
              variant={layout === "tree" ? "primary" : "secondary"}
              size="sm"
              aria-label="Tree layout"
              aria-pressed={layout === "tree"}
              prefix={<NetworkIcon />}
              onClick={onSelectTree}
            >
              Tree
            </Button>

            <Button
              type="button"
              variant={layout === "board" ? "primary" : "secondary"}
              size="sm"
              aria-label="Board layout"
              aria-pressed={layout === "board"}
              prefix={<ListTreeIcon />}
              onClick={onSelectBoard}
            >
              Board
            </Button>
          </Stack>
        )}

        {layout === "tree" && !isMobileListViewport && (
          <Stack size="xs">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-label="Zoom lineage tree out"
              prefix={<MinusIcon />}
              onClick={onZoomOut}
            >
              Zoom
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-label="Reset lineage tree zoom"
              prefix={<RotateCcwIcon />}
              onClick={onResetZoom}
            >
              Reset
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-label="Zoom lineage tree in"
              prefix={<PlusIcon />}
              onClick={onZoomIn}
            >
              Zoom
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
