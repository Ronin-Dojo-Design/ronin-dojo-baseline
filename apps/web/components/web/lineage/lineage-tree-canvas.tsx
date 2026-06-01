"use client"

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useReducedMotion } from "@mantine/hooks"
import {
  CalendarDaysIcon,
  ListTreeIcon,
  Maximize2Icon,
  MinusIcon,
  NetworkIcon,
  PlusIcon,
  RotateCcwIcon,
  SparklesIcon,
  TreePineIcon,
} from "lucide-react"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { H6 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import {
  buildChildGroups,
  buildDescendantCounts,
  type CanvasMember,
  type ChildGroup,
  nodeDisplayName,
  sortMembers,
} from "~/lib/lineage/canvas-model"
import type { LineageRow } from "~/lib/lineage/tree-layout"
import { cx } from "~/lib/utils"
import { updateLineageMemberPlacement } from "~/server/web/lineage/editor-actions"
import type {
  LineageNodeRow,
  LineageRelationshipRow,
  LineageTreeMemberRow,
  LineageVisualGroupRow,
} from "~/server/web/lineage/payloads"
import { LineageCompactChildList } from "./lineage-compact-child-list"
import { LineageGroupHeaderForm } from "./lineage-group-header-form"
import { LineageHonorStrip } from "./lineage-honor-strip"
import { LineageNodeCard } from "./lineage-node-card"

/**
 * React-first lineage tree canvas.
 *
 * Replaces the old d3-org-chart viewer with a Dirstarter/Ronin-native visual
 * tree that can render:
 *
 * - multiple roots / forest fragments
 * - v1 LineageTreeMember parent pointers
 * - LineageVisualGroup rows
 * - legacy row+edge data from the discipline-page MVP
 * - existing LineageNodeCard + profile drawer selection flow
 *
 * Editor mode is opt-in from the dashboard route. Drag/drop calls audited
 * server actions; the public viewer path renders read-only.
 */

type DragMemberData = {
  memberId: string
  parentMemberId: string | null
  visualGroupId: string | null
  visualSortOrder: number
}

type DropTargetData = {
  targetType: "member" | "group"
  parentMemberId: string | null
  visualGroupId: string | null
  visualSortOrder: number
}

/**
 * Visual layout for the canvas:
 * - `tree`: the standard top-down vertical org chart (default).
 * - `board`: the Org Chart Board — root cards with inline, expandable compact
 *   child lists (Phase 3a). Mobile-friendly; reuses the same normalization.
 */
export type LineageLayout = "tree" | "board"

type LineageTreeCanvasProps = {
  /**
   * Preferred v1 source. This preserves visual parent + group-row semantics.
   */
  members?: LineageTreeMemberRow[]
  visualGroups?: LineageVisualGroupRow[]
  defaultRootMemberId?: string | null

  /**
   * Legacy fallback source used by the discipline detail section.
   */
  rows?: LineageRow[]
  rootId?: string
  edges?: LineageRelationshipRow[]

  selectedNodeId?: string | null
  onSelect: (nodeId: string) => void
  treeId?: string
  editMode?: boolean
  canEditPlacement?: boolean
  canManageGroups?: boolean

  /**
   * Initial layout. Viewers can switch between tree/board in the toolbar;
   * this only seeds the first render.
   */
  defaultLayout?: LineageLayout
}

const MIN_SCALE = 0.5
const MAX_SCALE = 1.35
const SCALE_STEP = 0.1

// Phase 2 entrance stagger (motion-system tokens — see docs/runbooks/design/motion-system.md).
// Per-tier head start compounds with per-sibling 60ms (stagger-base), clamped so a deep/wide tree
// never feels draggy. Easing is the entrance `ease-out` token.
const ENTRANCE_DURATION = 0.25
const ENTRANCE_EASE = [0.16, 1, 0.3, 1] as const
const GENERATION_STAGGER = 0.12
const SIBLING_STAGGER = 0.06
const ENTRANCE_DELAY_CAP = 0.9

function entranceDelay(generation: number, siblingIndex: number) {
  return Math.min(
    generation * GENERATION_STAGGER + siblingIndex * SIBLING_STAGGER,
    ENTRANCE_DELAY_CAP,
  )
}

// Phase 2 animated path trace — connector + ring highlight rises from the tapped node to the root
// one ancestor edge at a time. The per-connector transition is `base` 200ms (Tailwind
// `transition-colors duration-200`). Total delay budget is 1.0s of step delays + 0.2s for the
// final connector's transition → ≤1.2s end-to-end, matching the spec cap. Per-step delay scales
// inversely with depth and is floored so even deep trees keep a perceivable cascade.
const TRACE_TOTAL_BUDGET = 1.0
const TRACE_MIN_STEP = 0.05
const TRACE_MAX_STEP = 0.2

function tracePerStepDelay(maxDistance: number) {
  if (maxDistance <= 0) return 0
  return Math.max(TRACE_MIN_STEP, Math.min(TRACE_MAX_STEP, TRACE_TOTAL_BUDGET / maxDistance))
}

function traceStepDelay(step: number, perStepDelay: number) {
  if (step <= 0 || perStepDelay <= 0) return 0
  return (step - 1) * perStepDelay
}

// Phase 2 connector grow-in (motion-system, `--ease-snappy`). On initial render each connector
// segment scales from 0 → 1 along its axis with a generation-tier stagger; all three pieces of one
// edge (parent-below `h-6 w-px`, sibling `h-px` bar, child-above `h-4 w-px`) share the same
// per-edge delay so the edge fills cohesively. The cap keeps deep trees inside a 1.0s envelope on
// top of the 0.25s per-connector animation. Reduced-motion users get no animation at all.
const CONNECTOR_GROW_DURATION = 0.25
const CONNECTOR_GROW_STEP = 0.1
const CONNECTOR_GROW_DELAY_CAP = 1.0

function connectorGrowDelay(generation: number) {
  if (generation <= 0) return 0
  return Math.min(generation * CONNECTOR_GROW_STEP, CONNECTOR_GROW_DELAY_CAP)
}

function connectorGrowStyleY(
  growDelay: number,
  reduceMotion: boolean,
): { animation: string; transformOrigin: string } | undefined {
  if (reduceMotion) return undefined
  return {
    animation: `connector-grow-y ${CONNECTOR_GROW_DURATION}s var(--ease-snappy) ${growDelay}s both`,
    transformOrigin: "top",
  }
}

function connectorGrowStyleX(
  growDelay: number,
  reduceMotion: boolean,
): { animation: string; transformOrigin: string } | undefined {
  if (reduceMotion) return undefined
  return {
    animation: `connector-grow-x ${CONNECTOR_GROW_DURATION}s var(--ease-snappy) ${growDelay}s both`,
    transformOrigin: "center",
  }
}

function clampScale(value: number) {
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, Number(value.toFixed(2))))
}

function offsetLeftWithin(element: HTMLElement, ancestor: HTMLElement) {
  let offset = 0
  let node: HTMLElement | null = element

  while (node && node !== ancestor) {
    offset += node.offsetLeft
    node = node.offsetParent as HTMLElement | null
  }

  return offset
}

function normalizeMembers(members: LineageTreeMemberRow[] | undefined): CanvasMember[] {
  return (members ?? []).map(member => ({
    id: member.id,
    nodeId: member.nodeId,
    node: member.node,
    visualSortOrder: member.visualSortOrder,
    primaryVisualParentMemberId: member.primaryVisualParentMemberId,
    visualGroupId: member.visualGroupId,
    isClaimable: member.isClaimable,
    isCollapsedDefault: member.isCollapsedDefault,
    selectedRank: member.selectedRankAward?.rank
      ? {
          id: member.selectedRankAward.rank.id,
          name: member.selectedRankAward.rank.name,
          shortName: member.selectedRankAward.rank.shortName,
          colorHex: member.selectedRankAward.rank.colorHex,
          sortOrder: member.selectedRankAward.rank.sortOrder,
          disciplineName: member.selectedRankAward.rank.rankSystem?.discipline?.name ?? null,
        }
      : null,
  }))
}

function normalizeLegacyRows({
  rows,
  rootId,
  edges,
}: {
  rows: LineageRow[] | undefined
  rootId: string | undefined
  edges: LineageRelationshipRow[] | undefined
}): CanvasMember[] {
  const orderByNodeId = new Map<string, number>()
  const nodesById = new Map<string, LineageNodeRow>()

  let order = 0
  for (const row of rows ?? []) {
    for (const node of row.nodes) {
      if (!nodesById.has(node.id)) {
        nodesById.set(node.id, node)
        orderByNodeId.set(node.id, order++)
      }
    }
  }

  const parentByNodeId = new Map<string, string>()

  for (const edge of edges ?? []) {
    if (edge.type !== "INSTRUCTOR_STUDENT") continue

    /**
     * Legacy edge contract:
     * - fromNodeId = instructor / parent
     * - toNodeId = student / child
     *
     * First parent wins to match the old D3 wrapper behavior, but this
     * normalization keeps the rule local to legacy fallback rendering only.
     */
    if (!parentByNodeId.has(edge.toNodeId)) {
      parentByNodeId.set(edge.toNodeId, edge.fromNodeId)
    }
  }

  return Array.from(nodesById.values()).map(node => ({
    id: node.id,
    nodeId: node.id,
    node,
    visualSortOrder: orderByNodeId.get(node.id) ?? 0,
    primaryVisualParentMemberId: node.id === rootId ? null : (parentByNodeId.get(node.id) ?? null),
    visualGroupId: null,
    isClaimable: undefined,
    isCollapsedDefault: false,
  }))
}

function buildChildrenByParentId(members: CanvasMember[]) {
  const memberIds = new Set(members.map(member => member.id))
  const childrenByParentId = new Map<string | null, CanvasMember[]>()

  for (const member of members) {
    const parentId =
      member.primaryVisualParentMemberId &&
      member.primaryVisualParentMemberId !== member.id &&
      memberIds.has(member.primaryVisualParentMemberId)
        ? member.primaryVisualParentMemberId
        : null

    const children = childrenByParentId.get(parentId) ?? []
    children.push(member)
    childrenByParentId.set(parentId, children)
  }

  for (const [parentId, children] of childrenByParentId) {
    children.sort(sortMembers)
    childrenByParentId.set(parentId, children)
  }

  return childrenByParentId
}

function buildRootMembers({
  members,
  childrenByParentId,
  defaultRootMemberId,
  rootId,
}: {
  members: CanvasMember[]
  childrenByParentId: Map<string | null, CanvasMember[]>
  defaultRootMemberId: string | null | undefined
  rootId: string | undefined
}) {
  const roots = [...(childrenByParentId.get(null) ?? [])]

  /**
   * If all members had valid parents because of malformed/cyclic data, keep
   * the view alive by falling back to the configured root or first member.
   */
  if (roots.length === 0 && members.length > 0) {
    const fallback =
      members.find(member => member.id === defaultRootMemberId) ??
      members.find(member => member.nodeId === rootId) ??
      members[0]

    if (fallback) roots.push(fallback)
  }

  roots.sort((a, b) => {
    if (defaultRootMemberId) {
      if (a.id === defaultRootMemberId) return -1
      if (b.id === defaultRootMemberId) return 1
    }

    if (rootId) {
      if (a.nodeId === rootId) return -1
      if (b.nodeId === rootId) return 1
    }

    return sortMembers(a, b)
  })

  return roots
}

function nextSortOrder(members: CanvasMember[]): number {
  const maxSort = members.reduce(
    (max, member) => Math.max(max, member.visualSortOrder),
    members.length,
  )
  return maxSort + 1
}

function isDragMemberData(value: unknown): value is DragMemberData {
  return Boolean(value && typeof value === "object" && "memberId" in value)
}

function isDropTargetData(value: unknown): value is DropTargetData {
  return Boolean(value && typeof value === "object" && "targetType" in value)
}

function buildSelectedPathTrace({
  members,
  selectedNodeId,
}: {
  members: CanvasMember[]
  selectedNodeId: string | null | undefined
}): {
  pathMemberIds: Set<string>
  pathDistanceById: Map<string, number>
  maxDistance: number
} {
  const pathMemberIds = new Set<string>()
  const pathDistanceById = new Map<string, number>()

  if (!selectedNodeId) {
    return { pathMemberIds, pathDistanceById, maxDistance: 0 }
  }

  const selectedMember = members.find(member => member.nodeId === selectedNodeId)
  if (!selectedMember) {
    return { pathMemberIds, pathDistanceById, maxDistance: 0 }
  }

  const parentById = new Map(members.map(member => [member.id, member.primaryVisualParentMemberId]))
  const visited = new Set<string>()
  let cursor: string | null = selectedMember.id
  let distance = 0
  let maxDistance = 0

  while (cursor && !visited.has(cursor)) {
    pathMemberIds.add(cursor)
    pathDistanceById.set(cursor, distance)
    visited.add(cursor)
    maxDistance = distance
    cursor = parentById.get(cursor) ?? null
    distance += 1
  }

  return { pathMemberIds, pathDistanceById, maxDistance }
}

function formatPromotionDate(value: Date | string | null) {
  if (!value) return null
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

function GroupHeader({
  group,
  isHighlighted,
  treeId,
  editMode,
  canManageGroups,
}: {
  group: LineageVisualGroupRow | null
  isHighlighted: boolean
  treeId: string | undefined
  editMode: boolean
  canManageGroups: boolean
}) {
  if (group && treeId && editMode && canManageGroups) {
    return <LineageGroupHeaderForm treeId={treeId} group={group} />
  }

  if (!group?.showPublicLabel) return null

  const promotionDate = formatPromotionDate(group.promotionDate)
  const eventHref = group.promotionEvent?.slug ? `/events/${group.promotionEvent.slug}` : null

  return (
    <div
      className={cx(
        "mb-1 rounded-full border bg-background/90 px-3 py-1 shadow-sm transition-all duration-300",
        isHighlighted && "border-primary/50 bg-primary/5 shadow-primary/10",
      )}
    >
      <Stack size="xs" className="items-center" wrap>
        <Badge
          variant={isHighlighted ? "primary" : "soft"}
          size="sm"
          prefix={<CalendarDaysIcon />}
          render={eventHref ? <Link href={eventHref} /> : undefined}
        >
          {group.label}
        </Badge>
        {promotionDate && (
          <span className="text-[0.65rem] text-muted-foreground">{promotionDate}</span>
        )}
      </Stack>
    </div>
  )
}

function LineageBranch({
  member,
  childrenByParentId,
  visualGroupById,
  defaultRootMemberId,
  rootId,
  treeId,
  editMode,
  canEditPlacement,
  canManageGroups,
  selectedMemberId,
  selectedPathMemberIds,
  pathDistanceById,
  perStepDelay,
  hasSelection,
  onSelect,
  visited,
  generation,
  siblingIndex,
  reduceMotion,
}: {
  member: CanvasMember
  childrenByParentId: Map<string | null, CanvasMember[]>
  visualGroupById: Map<string, LineageVisualGroupRow>
  defaultRootMemberId: string | null | undefined
  rootId: string | undefined
  treeId: string | undefined
  editMode: boolean
  canEditPlacement: boolean
  canManageGroups: boolean
  selectedMemberId: string | null
  selectedPathMemberIds: Set<string>
  pathDistanceById: Map<string, number>
  perStepDelay: number
  hasSelection: boolean
  onSelect: (nodeId: string) => void
  visited: Set<string>
  generation: number
  siblingIndex: number
  reduceMotion: boolean
}) {
  const dndDisabled = !treeId || !editMode || !canEditPlacement
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: member.id,
    disabled: dndDisabled,
    data: {
      memberId: member.id,
      parentMemberId: member.primaryVisualParentMemberId,
      visualGroupId: member.visualGroupId,
      visualSortOrder: member.visualSortOrder,
    } satisfies DragMemberData,
  })
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `member-drop-${member.id}`,
    disabled: dndDisabled,
    data: {
      targetType: "member",
      parentMemberId: member.primaryVisualParentMemberId,
      visualGroupId: member.visualGroupId,
      visualSortOrder: member.visualSortOrder,
    } satisfies DropTargetData,
  })

  if (visited.has(member.id)) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
        Cycle guard: {nodeDisplayName(member.node)}
      </div>
    )
  }

  const nextVisited = new Set(visited)
  nextVisited.add(member.id)

  const children = childrenByParentId.get(member.id) ?? []
  const childGroups = buildChildGroups({ children, visualGroupById })
  const isRoot = member.id === defaultRootMemberId || member.nodeId === rootId
  const isSelected = member.id === selectedMemberId
  const isInSelectedPath = selectedPathMemberIds.has(member.id)
  const isDimmed = hasSelection && !isInSelectedPath
  const connectorClassName = isInSelectedPath ? "bg-primary/60" : "bg-border"
  const dragAttributes = dndDisabled ? {} : attributes
  const dragListeners = dndDisabled ? {} : listeners

  const delay = entranceDelay(generation, siblingIndex)

  // Animated path trace (motion-system, ≤1.2s end-to-end). Distance is measured from the tapped
  // node; tapped = 0, parent = 1, etc. The connector below this member is the upper half of the
  // edge from its highlighted child up to this member, so its step index equals `distance`. The
  // ring on this member appears as that edge completes — `ringDelay = distance * perStepDelay`
  // so it lights as the next ancestor edge begins (the tapped node's ring is instant at delay 0).
  const traceDistance = isInSelectedPath ? (pathDistanceById.get(member.id) ?? 0) : 0
  const ringDelay = isInSelectedPath ? traceDistance * perStepDelay : 0
  const connectorDelay = isInSelectedPath ? traceStepDelay(traceDistance, perStepDelay) : 0

  // Connector grow-in on initial render. The `h-6 w-px` below this member and the `h-px` sibling
  // bar are the upper pieces of the edges from this member down to its child groups; both share
  // the parent's generation tier as the delay step.
  const connectorGrowDelaySec = connectorGrowDelay(generation)
  const connectorGrowY = connectorGrowStyleY(connectorGrowDelaySec, reduceMotion)
  const connectorGrowX = connectorGrowStyleX(connectorGrowDelaySec, reduceMotion)

  // Phase 2 hover lift refinement — belt-color tint feeds a hover-only `--belt-tint` CSS variable
  // so the inner draggable's hover box-shadow casts a glow in the practitioner's belt color. The
  // arbitrary-value class baked into the hover cluster supplies the `--color-primary` fallback via
  // `var(--belt-tint, var(--color-primary))`, so rankless members get the brand primary glow with
  // no inline-style work needed here.
  const beltTintColor = member.selectedRank?.colorHex ?? null

  return (
    <div
      id={`lineage-member-${member.id}`}
      ref={setDroppableRef}
      className="flex min-w-fit scroll-m-8 flex-col items-center"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: ENTRANCE_DURATION, delay, ease: ENTRANCE_EASE }
        }
      >
        <div
          className={cx(
            "rounded-2xl transition-all duration-200 ease-out",
            isSelected && "ring-2 ring-primary shadow-lg shadow-primary/25",
            !isSelected && isInSelectedPath && "ring-1 ring-primary/40 shadow-md shadow-primary/10",
          )}
          style={ringDelay > 0 ? { transitionDelay: `${ringDelay}s` } : undefined}
        >
          <div
            ref={setDraggableRef}
            style={{
              transform: CSS.Translate.toString(transform),
              zIndex: isDragging ? 20 : undefined,
              ...(beltTintColor ? ({ "--belt-tint": beltTintColor } as CSSProperties) : null),
            }}
            {...dragAttributes}
            {...dragListeners}
            className={cx(
              "rounded-2xl transition-all duration-300 ease-out hover:-translate-y-1",
              reduceMotion
                ? "hover:shadow-lg"
                : "hover:scale-[1.02] hover:shadow-[0_10px_25px_-5px_var(--belt-tint,var(--color-primary))]",
              editMode && canEditPlacement && "cursor-grab active:cursor-grabbing",
              isDimmed && "opacity-45 grayscale-[15%] hover:opacity-100 hover:grayscale-0",
              isOver && "ring-2 ring-primary/70",
              isDragging && "opacity-60 shadow-xl",
            )}
          >
            <LineageNodeCard
              node={member.node}
              isRoot={isRoot}
              isClaimable={member.isClaimable}
              selectedRank={member.selectedRank}
              onSelect={onSelect}
              canChangePromoter={editMode && canEditPlacement}
            />
          </div>
        </div>
      </motion.div>

      {childGroups.length > 0 && (
        <>
          <div
            className={cx("h-6 w-px transition-colors duration-200", connectorClassName)}
            style={{
              ...connectorGrowY,
              ...(connectorDelay > 0 ? { transitionDelay: `${connectorDelay}s` } : null),
            }}
          />

          <div className="relative flex items-start justify-center gap-4 md:gap-8">
            {childGroups.length > 1 && (
              <div
                className={cx(
                  "absolute top-0 right-8 left-8 h-px transition-colors duration-200",
                  isInSelectedPath ? "bg-primary/30" : "bg-border",
                )}
                style={{
                  ...connectorGrowX,
                  ...(connectorDelay > 0 ? { transitionDelay: `${connectorDelay}s` } : null),
                }}
              />
            )}

            {childGroups.map(group => (
              <LineageChildGroupColumn
                key={group.id}
                group={group}
                parentMemberId={member.id}
                childrenByParentId={childrenByParentId}
                visualGroupById={visualGroupById}
                defaultRootMemberId={defaultRootMemberId}
                rootId={rootId}
                treeId={treeId}
                editMode={editMode}
                canEditPlacement={canEditPlacement}
                canManageGroups={canManageGroups}
                selectedMemberId={selectedMemberId}
                selectedPathMemberIds={selectedPathMemberIds}
                pathDistanceById={pathDistanceById}
                perStepDelay={perStepDelay}
                hasSelection={hasSelection}
                onSelect={onSelect}
                visited={nextVisited}
                generation={generation + 1}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function LineageChildGroupColumn({
  group,
  parentMemberId,
  childrenByParentId,
  visualGroupById,
  defaultRootMemberId,
  rootId,
  treeId,
  editMode,
  canEditPlacement,
  canManageGroups,
  selectedMemberId,
  selectedPathMemberIds,
  pathDistanceById,
  perStepDelay,
  hasSelection,
  onSelect,
  visited,
  generation,
  reduceMotion,
}: {
  group: ChildGroup
  parentMemberId: string
  childrenByParentId: Map<string | null, CanvasMember[]>
  visualGroupById: Map<string, LineageVisualGroupRow>
  defaultRootMemberId: string | null | undefined
  rootId: string | undefined
  treeId: string | undefined
  editMode: boolean
  canEditPlacement: boolean
  canManageGroups: boolean
  selectedMemberId: string | null
  selectedPathMemberIds: Set<string>
  pathDistanceById: Map<string, number>
  perStepDelay: number
  hasSelection: boolean
  onSelect: (nodeId: string) => void
  visited: Set<string>
  generation: number
  reduceMotion: boolean
}) {
  const groupIsHighlighted = group.members.some(child => selectedPathMemberIds.has(child.id))
  const { setNodeRef, isOver } = useDroppable({
    id: `group-drop-${group.id}`,
    disabled: !treeId || !editMode || !canEditPlacement,
    data: {
      targetType: "group",
      parentMemberId,
      visualGroupId: group.group?.id ?? null,
      visualSortOrder: nextSortOrder(group.members),
    } satisfies DropTargetData,
  })

  // The `h-4 w-px` above each child group is the lower half of the edge whose upper half is the
  // `h-6 w-px` below the parent. Both belong to the same animated step; the step index equals the
  // parent's distance from the tapped node, so delay = `(parentDistance - 1) * perStepDelay`.
  const parentDistance = groupIsHighlighted ? pathDistanceById.get(parentMemberId) : undefined
  const groupConnectorDelay =
    parentDistance !== undefined ? traceStepDelay(parentDistance, perStepDelay) : 0

  // Connector grow-in on initial render. The `h-4 w-px` above each child group is the lower piece
  // of the edge whose upper piece is the `h-6 w-px` below the parent — same generation tier.
  const groupConnectorGrowDelaySec = connectorGrowDelay(generation - 1)
  const groupConnectorGrowY = connectorGrowStyleY(groupConnectorGrowDelaySec, reduceMotion)

  return (
    <div ref={setNodeRef} className="flex min-w-fit flex-col items-center">
      <div
        className={cx(
          "h-4 w-px transition-colors duration-200",
          groupIsHighlighted ? "bg-primary/60" : "bg-border",
        )}
        style={{
          ...groupConnectorGrowY,
          ...(groupConnectorDelay > 0 ? { transitionDelay: `${groupConnectorDelay}s` } : null),
        }}
      />

      <GroupHeader
        group={group.group}
        isHighlighted={groupIsHighlighted}
        treeId={treeId}
        editMode={editMode}
        canManageGroups={canManageGroups}
      />

      <div
        className={cx(
          "rounded-3xl px-3 py-2 transition-all duration-300",
          group.group?.showPublicLabel && "border border-dashed border-border/70 bg-muted/20",
          groupIsHighlighted && "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10",
          isOver && "ring-2 ring-primary/60",
        )}
      >
        <div
          className={cx(
            "flex min-w-fit items-start justify-center gap-4 md:gap-6",
            group.group?.showPublicLabel || (group.group && editMode && canManageGroups)
              ? "mt-1"
              : "mt-0",
          )}
        >
          {group.members.map((child, index) => (
            <LineageBranch
              key={child.id}
              member={child}
              childrenByParentId={childrenByParentId}
              visualGroupById={visualGroupById}
              defaultRootMemberId={defaultRootMemberId}
              rootId={rootId}
              treeId={treeId}
              editMode={editMode}
              canEditPlacement={canEditPlacement}
              canManageGroups={canManageGroups}
              selectedMemberId={selectedMemberId}
              selectedPathMemberIds={selectedPathMemberIds}
              pathDistanceById={pathDistanceById}
              perStepDelay={perStepDelay}
              hasSelection={hasSelection}
              onSelect={onSelect}
              visited={visited}
              generation={generation}
              siblingIndex={index}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Org Chart Board root card (Phase 3a).
 *
 * The composite root: the featured practitioner's full `LineageNodeCard` plus
 * an optional bio blurb, with their direct reports rendered inline beneath via
 * `LineageCompactChildList` (expandable rows, not separate full cards). Read-only
 * navigation — selection drives the same path-highlight + drawer flow as the tree.
 */
function LineageBoardCard({
  member,
  childrenByParentId,
  descendantCountById,
  visualGroupById,
  defaultRootMemberId,
  rootId,
  selectedMemberId,
  selectedPathMemberIds,
  onSelect,
  canChangePromoter,
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
  canChangePromoter: boolean
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
        selectedRank={member.selectedRank}
        onSelect={onSelect}
        canChangePromoter={canChangePromoter}
      />

      {bio && <Note className="mt-2 line-clamp-3 text-xs">{bio}</Note>}

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
          />
        </div>
      )}
    </div>
  )
}

export function LineageTreeCanvas({
  members,
  visualGroups,
  defaultRootMemberId,
  rows,
  rootId,
  edges,
  selectedNodeId,
  onSelect,
  treeId,
  editMode = false,
  canEditPlacement = false,
  canManageGroups = false,
  defaultLayout = "tree",
}: LineageTreeCanvasProps) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [layout, setLayout] = useState<LineageLayout>(defaultLayout)
  const [scale, setScale] = useState(1)
  const [autoFitPass, setAutoFitPass] = useState(0)
  const [isPinching, setIsPinching] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const scaleRef = useRef(scale)
  const autoFittedRef = useRef(false)
  const autoPannedRef = useRef(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Mirror scale into a ref so the pinch listener can read it without re-binding.
  useEffect(() => {
    scaleRef.current = scale
  }, [scale])

  // Detect a coarse pointer (touch) to swap the explore hint label.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    setIsTouch(window.matchMedia("(pointer: coarse)").matches)
  }, [])

  // Auto-fit the tree to the viewport width once when tree mode is active.
  // Only ever shrinks to fit (never enlarges past 1.0), and does not run while
  // board mode is active so board's compact layout cannot seed tree zoom.
  // CSS transforms don't affect layout, so contentRef.scrollWidth is the
  // unscaled natural tree width.
  useEffect(() => {
    if (layout !== "tree") return

    const scrollEl = scrollRef.current
    const contentEl = contentRef.current
    if (!scrollEl || !contentEl) return

    function autoFit() {
      if (autoFittedRef.current || !scrollEl || !contentEl) return
      const containerWidth = scrollEl.clientWidth
      const naturalWidth = contentEl.scrollWidth
      if (!containerWidth || !naturalWidth) return
      autoFittedRef.current = true
      setScale(clampScale(Math.min(1, containerWidth / naturalWidth)))
      setAutoFitPass(pass => pass + 1)
    }

    const raf = requestAnimationFrame(autoFit)
    const observer = new ResizeObserver(() => {
      if (!autoFittedRef.current) autoFit()
    })
    observer.observe(scrollEl)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [layout])

  // Two-finger pinch-to-zoom (touch only). Disabled in edit mode so it never
  // fights the @dnd-kit drag editor or drag-scroll. Single-finger touch falls
  // through to native scroll for panning.
  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl || editMode) return

    let startDistance = 0
    let startScale = 1
    let active = false

    function touchDistance(touches: TouchList) {
      const a = touches[0]
      const b = touches[1]
      if (!a || !b) return 0
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
    }

    function onTouchStart(event: TouchEvent) {
      if (event.touches.length !== 2) return
      active = true
      startDistance = touchDistance(event.touches)
      startScale = scaleRef.current
      setIsPinching(true)
    }

    function onTouchMove(event: TouchEvent) {
      if (!active || event.touches.length !== 2) return
      event.preventDefault()
      const ratio = touchDistance(event.touches) / (startDistance || 1)
      setScale(clampScale(startScale * ratio))
    }

    function endPinch(event: TouchEvent) {
      if (active && event.touches.length < 2) {
        active = false
        setIsPinching(false)
      }
    }

    scrollEl.addEventListener("touchstart", onTouchStart, { passive: false })
    scrollEl.addEventListener("touchmove", onTouchMove, { passive: false })
    scrollEl.addEventListener("touchend", endPinch)
    scrollEl.addEventListener("touchcancel", endPinch)

    return () => {
      scrollEl.removeEventListener("touchstart", onTouchStart)
      scrollEl.removeEventListener("touchmove", onTouchMove)
      scrollEl.removeEventListener("touchend", endPinch)
      scrollEl.removeEventListener("touchcancel", endPinch)
    }
  }, [editMode])
  const { execute: executePlacementUpdate, isExecuting: isPlacementSaving } = useAction(
    updateLineageMemberPlacement,
    {
      onSuccess: () => {
        toast.success("Lineage placement updated.")
        router.refresh()
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Failed to update lineage placement.")
      },
    },
  )

  const normalizedMembers = useMemo(() => {
    if (members && members.length > 0) return normalizeMembers(members)

    return normalizeLegacyRows({ rows, rootId, edges })
  }, [members, rows, rootId, edges])

  const visualGroupById = useMemo(() => {
    return new Map((visualGroups ?? []).map(group => [group.id, group]))
  }, [visualGroups])

  const childrenByParentId = useMemo(() => {
    return buildChildrenByParentId(normalizedMembers)
  }, [normalizedMembers])

  const descendantCountById = useMemo(() => {
    return buildDescendantCounts(childrenByParentId)
  }, [childrenByParentId])

  const rootMembers = useMemo(() => {
    return buildRootMembers({
      members: normalizedMembers,
      childrenByParentId,
      defaultRootMemberId,
      rootId,
    })
  }, [normalizedMembers, childrenByParentId, defaultRootMemberId, rootId])

  // After auto-fit, horizontally pan the scroll container so the configured
  // root chain starts in view. This is especially important on narrow mobile
  // viewports where the wide Dirty Dozen branch can otherwise put the root
  // card off-screen at scrollLeft=0.
  useEffect(() => {
    if (layout !== "tree" || autoFitPass === 0 || autoPannedRef.current) return

    const scrollEl = scrollRef.current
    const contentEl = contentRef.current
    const rootMember = rootMembers[0]
    if (!scrollEl || !contentEl || !rootMember) return

    const raf = requestAnimationFrame(() => {
      const rootEl = document.getElementById(`lineage-member-${rootMember.id}`)
      const targetEl =
        rootEl?.querySelector<HTMLElement>('button[aria-label^="Open lineage profile"]') ?? rootEl
      if (!targetEl) return

      const scaleValue = scaleRef.current || 1
      const targetCenter =
        (offsetLeftWithin(targetEl, contentEl) + targetEl.offsetWidth / 2) * scaleValue
      const targetScrollLeft = targetCenter - scrollEl.clientWidth / 2
      const maxScrollLeft = scrollEl.scrollWidth - scrollEl.clientWidth

      scrollEl.scrollLeft = Math.max(0, Math.min(maxScrollLeft, targetScrollLeft))
      autoPannedRef.current = true
    })

    return () => cancelAnimationFrame(raf)
  }, [layout, autoFitPass, rootMembers])

  const {
    pathMemberIds: selectedPathMemberIds,
    pathDistanceById,
    maxDistance,
  } = useMemo(() => {
    return buildSelectedPathTrace({ members: normalizedMembers, selectedNodeId })
  }, [normalizedMembers, selectedNodeId])

  const perStepDelay = useMemo(() => {
    if (reduceMotion) return 0
    return tracePerStepDelay(maxDistance)
  }, [reduceMotion, maxDistance])

  const selectedMemberId = useMemo(() => {
    return normalizedMembers.find(member => member.nodeId === selectedNodeId)?.id ?? null
  }, [normalizedMembers, selectedNodeId])

  const publicGroupCount = (visualGroups ?? []).filter(group => group.showPublicLabel).length
  const memberCount = normalizedMembers.length
  const rootCount = rootMembers.length
  const hasSelection = Boolean(selectedMemberId)

  function handleDragEnd(event: DragEndEvent) {
    if (!treeId || !editMode || !canEditPlacement) return

    const activeData = event.active.data.current
    const targetData = event.over?.data.current

    if (!isDragMemberData(activeData) || !isDropTargetData(targetData)) return
    if (activeData.memberId === event.over?.id) return
    if (activeData.parentMemberId !== targetData.parentMemberId) return

    const isSamePlacement =
      activeData.parentMemberId === targetData.parentMemberId &&
      activeData.visualGroupId === targetData.visualGroupId &&
      activeData.visualSortOrder === targetData.visualSortOrder

    if (isSamePlacement) return

    executePlacementUpdate({
      treeId,
      memberId: activeData.memberId,
      parentMemberId: activeData.parentMemberId,
      visualGroupId: targetData.visualGroupId,
      visualSortOrder: targetData.visualSortOrder,
      auditNote: "Drag placement update from lineage editor canvas.",
    })
  }

  if (memberCount === 0) {
    return <Note>This lineage has no recorded practitioners yet.</Note>
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="rounded-2xl border bg-card/40 p-3 shadow-sm md:p-4">
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
            <Stack size="xs">
              <Button
                type="button"
                variant={layout === "tree" ? "primary" : "secondary"}
                size="sm"
                aria-label="Tree layout"
                aria-pressed={layout === "tree"}
                prefix={<NetworkIcon />}
                onClick={() => {
                  autoFittedRef.current = false
                  autoPannedRef.current = false
                  setLayout("tree")
                }}
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
                onClick={() => setLayout("board")}
              >
                Board
              </Button>
            </Stack>

            {layout === "tree" && (
              <Stack size="xs">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  aria-label="Zoom lineage tree out"
                  prefix={<MinusIcon />}
                  onClick={() => setScale(current => clampScale(current - SCALE_STEP))}
                >
                  Zoom
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  aria-label="Reset lineage tree zoom"
                  prefix={<RotateCcwIcon />}
                  onClick={() => setScale(1)}
                >
                  Reset
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  aria-label="Zoom lineage tree in"
                  prefix={<PlusIcon />}
                  onClick={() => setScale(current => clampScale(current + SCALE_STEP))}
                >
                  Zoom
                </Button>
              </Stack>
            )}
          </Stack>
        </Stack>

        <LineageHonorStrip
          members={normalizedMembers}
          selectedMemberId={selectedMemberId}
          onSelect={onSelect}
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
              "relative p-8",
              layout === "tree" && "min-w-max",
              layout === "tree" &&
                !isPinching &&
                !reduceMotion &&
                "transition-transform duration-300 ease-out",
            )}
            style={
              layout === "tree"
                ? { transform: `scale(${scale})`, transformOrigin: "top left" }
                : undefined
            }
          >
            <Stack size="xs" direction="column" className="mb-8 items-center text-center">
              {layout === "tree" && (
                <Badge variant="outline" size="sm" prefix={<Maximize2Icon />}>
                  {isTouch ? "Pinch to explore" : "Scroll to explore"}
                </Badge>
              )}
              <H6 className="text-muted-foreground">
                {layout === "board"
                  ? "Tap any practitioner to open their profile"
                  : "Click a practitioner to trace their path to the root"}
              </H6>
            </Stack>

            {layout === "board" ? (
              <Stack size="lg" direction="column" className="mx-auto w-full max-w-2xl md:max-w-4xl">
                {rootMembers.map(rootMember => (
                  <LineageBoardCard
                    key={rootMember.id}
                    member={rootMember}
                    childrenByParentId={childrenByParentId}
                    descendantCountById={descendantCountById}
                    visualGroupById={visualGroupById}
                    defaultRootMemberId={defaultRootMemberId}
                    rootId={rootId}
                    selectedMemberId={selectedMemberId}
                    selectedPathMemberIds={selectedPathMemberIds}
                    onSelect={onSelect}
                    canChangePromoter={editMode && canEditPlacement}
                  />
                ))}
              </Stack>
            ) : (
              <div className="flex min-w-fit items-start justify-center gap-6 md:gap-12">
                {rootMembers.map((rootMember, index) => (
                  <LineageBranch
                    key={rootMember.id}
                    member={rootMember}
                    childrenByParentId={childrenByParentId}
                    visualGroupById={visualGroupById}
                    defaultRootMemberId={defaultRootMemberId}
                    rootId={rootId}
                    treeId={treeId}
                    editMode={editMode}
                    canEditPlacement={canEditPlacement}
                    canManageGroups={canManageGroups}
                    selectedMemberId={selectedMemberId}
                    selectedPathMemberIds={selectedPathMemberIds}
                    pathDistanceById={pathDistanceById}
                    perStepDelay={perStepDelay}
                    hasSelection={hasSelection}
                    onSelect={onSelect}
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
