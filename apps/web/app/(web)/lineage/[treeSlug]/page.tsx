import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { H4 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { LineageTreeBoard } from "~/components/web/lineage/lineage-tree-board"
import { getRequestBrand } from "~/lib/brand-context"
import { bucketByDepth } from "~/lib/lineage/tree-layout"
import type {
  LineageNodeProfile,
  LineageNodeRow,
  LineageRelationshipRow,
  LineageTreeMemberRow,
} from "~/server/web/lineage/payloads"
import { getLineageProfile, getLineageTreeBySlug } from "~/server/web/lineage/queries"

/**
 * Standalone public lineage tree viewer.
 *
 * Route: `/lineage/[treeSlug]`
 *
 * Renders a published PUBLIC tree via the materialized payload from
 * `getLineageTreeBySlug`. Non-published or non-PUBLIC trees return 404.
 *
 * Author: Cody / SESSION_0181 TASK_01.
 * Refs:
 *   - docs/architecture/lineage/lineage-public-viewer-editor-routes.md (Public Standalone Viewer)
 *   - docs/sprints/SESSION_0181.md
 */

interface Props {
  params: Promise<{ treeSlug: string }>
}

// ---------------------------------------------------------------------------
// Adapter: materializer payload → LineageTreeBoard props
// ---------------------------------------------------------------------------

/**
 * Convert `LineageTreeMemberRow[]` + `defaultRootMemberId` into the shape
 * `LineageTreeBoard` expects: `{ rows, rootId, edges }`.
 *
 * The materializer stores tree structure via `primaryVisualParentMemberId`
 * parent pointers. We derive:
 *   - `nodes`: extracted `member.node` for each member.
 *   - Synthetic `edges`: one INSTRUCTOR_STUDENT edge per parent pointer
 *     (parent = instructor, child = student) so `LineageOrgChart` can build
 *     its parent-child map unchanged.
 *   - `rows`: from `bucketByDepth` over the extracted nodes + edges.
 *
 * Passport drives display name: `member.node.user.passport.displayName`.
 */
function membersToBoardData(members: LineageTreeMemberRow[], defaultRootMemberId: string | null) {
  // Map memberId → nodeId for edge derivation.
  const memberIdToNodeId = new Map<string, string>()
  for (const m of members) {
    memberIdToNodeId.set(m.id, m.nodeId)
  }

  const nodes: LineageNodeRow[] = members.map(m => m.node)

  // Derive synthetic edges from parent pointers.
  // Only `type`, `fromNodeId`, `toNodeId` are used by LineageOrgChart;
  // remaining fields are filled with safe defaults to satisfy the type.
  const edges: LineageRelationshipRow[] = []
  for (const m of members) {
    if (m.primaryVisualParentMemberId) {
      const parentNodeId = memberIdToNodeId.get(m.primaryVisualParentMemberId)
      if (parentNodeId) {
        edges.push({
          id: `synth-${m.id}`,
          type: "INSTRUCTOR_STUDENT",
          fromNodeId: parentNodeId,
          toNodeId: m.nodeId,
          description: null,
          isVerified: false,
          startedAt: null,
          endedAt: null,
        } as LineageRelationshipRow)
      }
    }
  }

  // Determine root node.
  const rootMember = defaultRootMemberId
    ? members.find(m => m.id === defaultRootMemberId)
    : members[0]
  const rootNodeId = rootMember?.nodeId ?? nodes[0]?.id ?? ""

  const rootNode = nodes.find(n => n.id === rootNodeId) ?? null

  let rows: ReturnType<typeof bucketByDepth> = []
  if (rootNode && nodes.length > 0) {
    rows = bucketByDepth(rootNode, nodes, edges)
  }

  return { rows, rootId: rootNodeId, edges }
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { treeSlug } = await params
  const brand = await getRequestBrand()
  const result = await getLineageTreeBySlug({ brand, slug: treeSlug })

  if (!result) {
    return { title: "Lineage Tree Not Found" }
  }

  return {
    title: `${result.tree.name} — Lineage`,
    description: result.tree.description ?? `Lineage tree for ${result.tree.name}`,
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function LineageTreePage({ params }: Props) {
  const { treeSlug } = await params
  const brand = await getRequestBrand()
  const result = await getLineageTreeBySlug({ brand, slug: treeSlug })

  if (!result) {
    notFound()
  }

  const { rows, rootId, edges } = membersToBoardData(result.members, result.defaultRootMemberId)

  if (rows.length === 0) {
    return (
      <section className="py-8">
        <Stack size="xs" direction="column">
          <H4 as="h1">{result.tree.name}</H4>
          <Note>This lineage tree has no visible members.</Note>
        </Stack>
      </section>
    )
  }

  // Eager-load profiles for drawer (same pattern as lineage-tree-section.tsx).
  const visibleNodeIds = Array.from(new Set(rows.flatMap(row => row.nodes.map(n => n.id))))
  const profiles = await Promise.all(
    visibleNodeIds.map(async id => [id, await getLineageProfile(id)] as const),
  )
  const profilesById: Record<string, LineageNodeProfile> = {}
  for (const [id, profile] of profiles) {
    if (profile) profilesById[id] = profile
  }

  return (
    <section className="py-8">
      <Stack size="xs" direction="column" className="mb-4">
        <H4 as="h1">{result.tree.name}</H4>
        {result.tree.description && <Note>{result.tree.description}</Note>}
      </Stack>
      <LineageTreeBoard rows={rows} rootId={rootId} profilesById={profilesById} edges={edges} />
    </section>
  )
}
