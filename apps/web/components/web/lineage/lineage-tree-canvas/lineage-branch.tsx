"use client"

import { useDraggable, useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { motion } from "motion/react"
import type { CSSProperties } from "react"
import type { LineageListingRenderPolicy } from "~/lib/entitlements/lineage-tier-policy"
import {
  buildChildGroups,
  type CanvasMember,
  type ChildGroup,
  memberBeltColor,
  nodeDisplayName,
} from "~/lib/lineage/canvas-model"
import {
  buildConnectorEdges,
  type ConnectorEdge,
  connectorGrowDelay,
} from "~/lib/lineage/connector-geometry"
import { cx } from "~/lib/utils"
import type { LineageVisualGroupRow } from "~/server/web/lineage/payloads"
import { LineageNodeCard } from "../lineage-node-card"
import { nextSortOrder } from "./canvas-data"
import { GroupHeader } from "./group-header"
import { entranceDelay, ENTRANCE_DURATION, ENTRANCE_EASE } from "./lineage-tree-canvas-constants"
import type { DragMemberData, DropTargetData } from "./lineage-tree-canvas-types"
import { LineageConnectorLayer } from "./lineage-connector-layer"

export function LineageBranch({
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
  onChangePromoter,
  renderPolicy,
  disciplineId,
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
  onChangePromoter?: (nodeId: string) => void
  renderPolicy: LineageListingRenderPolicy
  disciplineId?: string | null
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
  // dnd-kit marks the draggable wrapper `role="button"`, but this wrapper now
  // contains the card's own ⋯ actions menu + profile buttons (Phase 3c). A button
  // role there nests interactive buttons and shadowed the "Change promoter..."
  // trigger in the accessibility tree — the wrapper absorbed the inner buttons'
  // names ("Open lineage actions for X Open lineage profile for X"), so it matched
  // `getByRole("button", { name: /Open lineage actions/ })` first and the real
  // trigger was never clicked (SESSION_0329 Phase 3c regression). Expose the
  // wrapper as a draggable group instead: mouse drag (listeners) and the
  // `[aria-roledescription="draggable"]` drag-test hook are unaffected; keyboard
  // drag-to-reorder (which relies on the button role) is dropped — mouse is primary.
  const dragAttributes = dndDisabled
    ? {}
    : { ...attributes, role: "group", "aria-pressed": undefined, tabIndex: undefined }
  const dragListeners = dndDisabled ? {} : listeners

  const delay = entranceDelay(generation, siblingIndex)

  // Animated path trace (motion-system, ≤1.2s end-to-end). Distance is measured from the tapped
  // node; tapped = 0, parent = 1, etc. The ring on this member appears as the edge below it
  // completes — `ringDelay = distance * perStepDelay` so it lights as the next ancestor edge begins
  // (the tapped node's ring is instant at delay 0).
  const traceDistance = isInSelectedPath ? (pathDistanceById.get(member.id) ?? 0) : 0
  const ringDelay = isInSelectedPath ? traceDistance * perStepDelay : 0

  // Connector grow-in on initial render shares this member's generation tier as the delay step.
  const connectorGrowDelaySec = connectorGrowDelay(generation)

  // Phase 3e: one SVG path per child edge. An edge is on the selected path only when this member
  // AND that child are both on it; its trace-cascade delay mirrors the old per-edge stub delay
  // (`traceStepDelay(thisMemberDistance, perStepDelay)`), so the highlight still rises one ancestor
  // edge at a time from the tapped node to the root.
  const connectorEdges: ConnectorEdge[] = buildConnectorEdges({
    childGroups,
    isInSelectedPath,
    selectedPathMemberIds,
    traceDistance,
    perStepDelay,
  })

  // Phase 2 hover lift refinement — belt-color tint feeds a hover-only `--belt-tint` CSS variable
  // so the inner draggable's hover box-shadow casts a glow in the practitioner's belt color. The
  // arbitrary-value class baked into the hover cluster supplies the `--color-primary` fallback via
  // `var(--belt-tint, var(--color-primary))`, so rankless members get the brand primary glow with
  // no inline-style work needed here.
  // Awarded truth (ADR 0035) — the highest awarded RankAward in the tree's discipline.
  const beltTintColor = memberBeltColor(member.node, disciplineId)

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
              onSelect={onSelect}
              canChangePromoter={editMode && canEditPlacement}
              onChangePromoter={
                onChangePromoter ? () => onChangePromoter(member.nodeId) : undefined
              }
              renderPolicy={renderPolicy}
              disciplineId={disciplineId}
            />
          </div>
        </div>
      </motion.div>

      {childGroups.length > 0 && (
        <div className="relative mt-10 flex items-start justify-center gap-4 md:gap-8">
          <LineageConnectorLayer
            edges={connectorEdges}
            growDelaySec={connectorGrowDelaySec}
            reduceMotion={reduceMotion}
          />

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
              onChangePromoter={onChangePromoter}
              renderPolicy={renderPolicy}
              disciplineId={disciplineId}
              visited={nextVisited}
              generation={generation + 1}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * One child-group column under a parent branch: an optional group header (label /
 * promotion date, or the editor form) plus the group's members, each rendered as a
 * nested `LineageBranch`. Colocated with `LineageBranch` because the two are a single
 * mutually-recursive rendering unit — splitting them into separate modules creates an
 * import cycle (fallow `circular-dependency`); keeping them together is the clean module.
 * Private to this file — only `LineageBranch` above renders it.
 */
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
  onChangePromoter,
  renderPolicy,
  disciplineId,
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
  onChangePromoter?: (nodeId: string) => void
  renderPolicy: LineageListingRenderPolicy
  disciplineId?: string | null
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

  // Phase 3e: the per-child connector (formerly an `h-4 w-px` stub) is now drawn by the parent's
  // SVG LineageConnectorLayer; the column root is tagged so that layer can measure its centre.
  return (
    <div ref={setNodeRef} data-lineage-conn-col className="flex min-w-fit flex-col items-center">
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
              onChangePromoter={onChangePromoter}
              renderPolicy={renderPolicy}
              disciplineId={disciplineId}
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
