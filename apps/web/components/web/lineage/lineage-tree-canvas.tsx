"use client"

import { Maximize2Icon, MinusIcon, PlusIcon, RotateCcwIcon, TreePineIcon } from "lucide-react"
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

function GroupLabel({ group }: { group: LineageVisualGroupRow | null }) {
  if (!group?.showPublicLabel) return null

  return (
    <Badge variant="soft" size="sm">
      {group.label}
    </Badge>
  )
}

function LineageBranch({
  member,
  childrenByParentId,
  visualGroupById,
  defaultRootMemberId,
  rootId,
  onSelect,
  visited,
}: {
  member: CanvasMember
  childrenByParentId: Map<string | null, CanvasMember[]>
  visualGroupById: Map<string, LineageVisualGroupRow>
  defaultRootMemberId: string | null | undefined
  rootId: string | undefined
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

  return (
    <div className="flex min-w-fit flex-col items-center">
      <LineageNodeCard node={member.node} isRoot={isRoot} onSelect={onSelect} />

      {childGroups.length > 0 && (
        <>
          <div className="h-6 w-px bg-border" />

          <div className="relative flex items-start justify-center gap-8">
            {childGroups.length > 1 && (
              <div className="absolute top-0 right-8 left-8 h-px bg-border" />
            )}

            {childGroups.map(group => (
              <div key={group.id} className="flex min-w-fit flex-col items-center">
                <div className="h-4 w-px bg-border" />

                <GroupLabel group={group.group} />

                <div
                  className={cx(
                    "flex min-w-fit items-start justify-center gap-6",
                    group.group?.showPublicLabel ? "mt-3" : "mt-1",
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
                      onSelect={onSelect}
                      visited={nextVisited}
                    />
                  ))}
                </div>
              </div>
            ))}
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

  const publicGroupCount = (visualGroups ?? []).filter(group => group.showPublicLabel).length
  const memberCount = normalizedMembers.length
  const rootCount = rootMembers.length

  if (memberCount === 0) {
    return <Note>This lineage has no recorded practitioners yet.</Note>
  }

  return (
    <div className="rounded-2xl border bg-card/40 p-4 shadow-sm">
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
        <div className="pointer-events-none absolute inset-0 bg-muted/20" />

        <div
          className="relative min-w-max p-8 transition-transform duration-200"
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
              Lineage Tree v1
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
