"use client"

import {
  CalendarDaysIcon,
  Maximize2Icon,
  MinusIcon,
  PlusIcon,
  RotateCcwIcon,
  SparklesIcon,
  TreePineIcon,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { H6 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import type { LineageRow } from "~/lib/lineage/tree-layout"
import { cx } from "~/lib/utils"
import type {
  LineageNodeRow,
  LineageRelationshipRow,
  LineageTreeMemberRow,
  LineageVisualGroupRow,
} from "~/server/web/lineage/payloads"
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
 * This is intentionally not an editor yet. Drag/drop should not rewrite lineage
 * in v1. Editor mode comes later through explicit modals and audited actions.
 */

type CanvasMember = {
  id: string
  nodeId: string
  node: LineageNodeRow
  visualSortOrder: number
  primaryVisualParentMemberId: string | null
  visualGroupId: string | null
}

type ChildGroup = {
  id: string
  group: LineageVisualGroupRow | null
  members: CanvasMember[]
}

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
}

const MIN_SCALE = 0.7
const MAX_SCALE = 1.35
const SCALE_STEP = 0.1

function clampScale(value: number) {
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, Number(value.toFixed(2))))
}

function nodeDisplayName(node: LineageNodeRow): string {
  return node.user.passport?.displayName ?? node.user.name ?? node.slug ?? node.id
}

function sortMembers(a: CanvasMember, b: CanvasMember): number {
  if (a.visualSortOrder !== b.visualSortOrder) {
    return a.visualSortOrder - b.visualSortOrder
  }

  return nodeDisplayName(a.node).localeCompare(nodeDisplayName(b.node))
}

function normalizeMembers(members: LineageTreeMemberRow[] | undefined): CanvasMember[] {
  return (members ?? []).map(member => ({
    id: member.id,
    nodeId: member.nodeId,
    node: member.node,
    visualSortOrder: member.visualSortOrder,
    primaryVisualParentMemberId: member.primaryVisualParentMemberId,
    visualGroupId: member.visualGroupId,
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

function buildChildGroups({
  children,
  visualGroupById,
}: {
  children: CanvasMember[]
  visualGroupById: Map<string, LineageVisualGroupRow>
}): ChildGroup[] {
  const groupsByKey = new Map<string, ChildGroup>()

  for (const child of children) {
    const group = child.visualGroupId ? (visualGroupById.get(child.visualGroupId) ?? null) : null
    const key = group?.id ?? `ungrouped-${child.primaryVisualParentMemberId ?? "root"}`

    const existing = groupsByKey.get(key) ?? {
      id: key,
      group,
      members: [],
    }

    existing.members.push(child)
    groupsByKey.set(key, existing)
  }

  const groups = Array.from(groupsByKey.values())

  for (const group of groups) {
    group.members.sort(sortMembers)
  }

  groups.sort((a, b) => {
    const aSort = a.group?.sortOrder ?? Number.MAX_SAFE_INTEGER
    const bSort = b.group?.sortOrder ?? Number.MAX_SAFE_INTEGER

    if (aSort !== bSort) return aSort - bSort

    const aLabel = a.group?.label ?? ""
    const bLabel = b.group?.label ?? ""

    return aLabel.localeCompare(bLabel)
  })

  return groups
}

function buildSelectedPathMemberIds({
  members,
  selectedNodeId,
}: {
  members: CanvasMember[]
  selectedNodeId: string | null | undefined
}) {
  const path = new Set<string>()
  if (!selectedNodeId) return path

  const selectedMember = members.find(member => member.nodeId === selectedNodeId)
  if (!selectedMember) return path

  const parentById = new Map(members.map(member => [member.id, member.primaryVisualParentMemberId]))
  const visited = new Set<string>()
  let cursor: string | null = selectedMember.id

  while (cursor && !visited.has(cursor)) {
    path.add(cursor)
    visited.add(cursor)
    cursor = parentById.get(cursor) ?? null
  }

  return path
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

function GroupLabel({
  group,
  isHighlighted,
}: {
  group: LineageVisualGroupRow | null
  isHighlighted: boolean
}) {
  if (!group?.showPublicLabel) return null

  const promotionDate = formatPromotionDate(group.promotionDate)

  return (
    <div
      className={cx(
        "mb-1 rounded-full border bg-background/90 px-3 py-1 shadow-sm transition-all duration-300",
        isHighlighted && "border-primary/50 bg-primary/5 shadow-primary/10",
      )}
    >
      <Stack size="xs" className="items-center" wrap>
        <Badge variant={isHighlighted ? "primary" : "soft"} size="sm" prefix={<CalendarDaysIcon />}>
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
  selectedMemberId,
  selectedPathMemberIds,
  hasSelection,
  onSelect,
  visited,
}: {
  member: CanvasMember
  childrenByParentId: Map<string | null, CanvasMember[]>
  visualGroupById: Map<string, LineageVisualGroupRow>
  defaultRootMemberId: string | null | undefined
  rootId: string | undefined
  selectedMemberId: string | null
  selectedPathMemberIds: Set<string>
  hasSelection: boolean
  onSelect: (nodeId: string) => void
  visited: Set<string>
}) {
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

  return (
    <div className="flex min-w-fit flex-col items-center">
      <div
        className={cx(
          "rounded-2xl transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg",
          isSelected && "ring-2 ring-primary shadow-lg shadow-primary/25",
          !isSelected && isInSelectedPath && "ring-1 ring-primary/40 shadow-md shadow-primary/10",
          isDimmed && "opacity-45 grayscale-[15%] hover:opacity-100 hover:grayscale-0",
        )}
      >
        <LineageNodeCard node={member.node} isRoot={isRoot} onSelect={onSelect} />
      </div>

      {childGroups.length > 0 && (
        <>
          <div className={cx("h-6 w-px transition-colors duration-300", connectorClassName)} />

          <div className="relative flex items-start justify-center gap-8">
            {childGroups.length > 1 && (
              <div
                className={cx(
                  "absolute top-0 right-8 left-8 h-px transition-colors duration-300",
                  isInSelectedPath ? "bg-primary/30" : "bg-border",
                )}
              />
            )}

            {childGroups.map(group => {
              const groupIsHighlighted = group.members.some(child =>
                selectedPathMemberIds.has(child.id),
              )

              return (
                <div key={group.id} className="flex min-w-fit flex-col items-center">
                  <div
                    className={cx(
                      "h-4 w-px transition-colors duration-300",
                      groupIsHighlighted ? "bg-primary/60" : "bg-border",
                    )}
                  />

                  <GroupLabel group={group.group} isHighlighted={groupIsHighlighted} />

                  <div
                    className={cx(
                      "rounded-3xl px-3 py-2 transition-all duration-300",
                      group.group?.showPublicLabel &&
                        "border border-dashed border-border/70 bg-muted/20",
                      groupIsHighlighted &&
                        "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10",
                    )}
                  >
                    <div
                      className={cx(
                        "flex min-w-fit items-start justify-center gap-6",
                        group.group?.showPublicLabel ? "mt-1" : "mt-0",
                      )}
                    >
                      {group.members.map(child => (
                        <LineageBranch
                          key={child.id}
                          member={child}
                          childrenByParentId={childrenByParentId}
                          visualGroupById={visualGroupById}
                          defaultRootMemberId={defaultRootMemberId}
                          rootId={rootId}
                          selectedMemberId={selectedMemberId}
                          selectedPathMemberIds={selectedPathMemberIds}
                          hasSelection={hasSelection}
                          onSelect={onSelect}
                          visited={nextVisited}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
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
}: LineageTreeCanvasProps) {
  const [scale, setScale] = useState(1)

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

  const rootMembers = useMemo(() => {
    return buildRootMembers({
      members: normalizedMembers,
      childrenByParentId,
      defaultRootMemberId,
      rootId,
    })
  }, [normalizedMembers, childrenByParentId, defaultRootMemberId, rootId])

  const selectedPathMemberIds = useMemo(() => {
    return buildSelectedPathMemberIds({ members: normalizedMembers, selectedNodeId })
  }, [normalizedMembers, selectedNodeId])

  const selectedMemberId = useMemo(() => {
    return normalizedMembers.find(member => member.nodeId === selectedNodeId)?.id ?? null
  }, [normalizedMembers, selectedNodeId])

  const publicGroupCount = (visualGroups ?? []).filter(group => group.showPublicLabel).length
  const memberCount = normalizedMembers.length
  const rootCount = rootMembers.length
  const hasSelection = Boolean(selectedMemberId)

  if (memberCount === 0) {
    return <Note>This lineage has no recorded practitioners yet.</Note>
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card/40 p-4 shadow-sm">
      <Stack size="sm" wrap className="mb-4 items-center justify-between gap-3" direction="row">
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
        </Stack>

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
      </Stack>

      <div className="relative overflow-auto rounded-xl border bg-background">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--muted))_0,_transparent_32rem)] opacity-70" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />

        <div
          className="relative min-w-max p-8 transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          <Stack size="xs" direction="column" className="mb-8 items-center text-center">
            <Badge variant="outline" size="sm" prefix={<Maximize2Icon />}>
              Scroll to explore
            </Badge>
            <H6 as="h2" className="text-muted-foreground">
              Click a practitioner to trace their path to the root
            </H6>
          </Stack>

          <div className="flex min-w-fit items-start justify-center gap-12">
            {rootMembers.map(rootMember => (
              <LineageBranch
                key={rootMember.id}
                member={rootMember}
                childrenByParentId={childrenByParentId}
                visualGroupById={visualGroupById}
                defaultRootMemberId={defaultRootMemberId}
                rootId={rootId}
                selectedMemberId={selectedMemberId}
                selectedPathMemberIds={selectedPathMemberIds}
                hasSelection={hasSelection}
                onSelect={onSelect}
                visited={new Set()}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
