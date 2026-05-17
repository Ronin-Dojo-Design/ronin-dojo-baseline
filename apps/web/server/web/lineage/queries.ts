import { cacheLife, cacheTag } from "next/cache"
import { cache } from "react"
import { type Brand, LineageVisibility } from "~/.generated/prisma/client"
import {
  type LineageNodeProfile,
  type LineageNodeRow,
  type LineageRelationshipRow,
  type LineageTreePublicResult,
  type LineageTreePublicRow,
  type LineageTreeResult,
  lineageNodeProfilePayload,
  lineageNodeRowPayload,
  lineageRelationshipPayload,
  lineageTreePublicPayload,
} from "~/server/web/lineage/payloads"
import { db } from "~/services/db"

/**
 * Lineage read queries — public surface for the discipline-page lineage
 * section (TASK_03) + the profile drawer.
 *
 * Cache strategy (per SESSION_0175 hard rule 3 / D-005 resolution):
 *  - Public, unauthenticated-safe reads ("anyone can see PUBLIC nodes")
 *    use Next.js `"use cache"` + `cacheTag` + `cacheLife`.
 *  - Auth-scoped reads (visibility may include UNLISTED if the viewer is
 *    authenticated; RESTRICTED/PRIVATE require explicit ACL) use React
 *    `cache()` so the request-scoped result respects the viewer.
 *
 * Visibility filtering: every query hard-codes the conservative default
 * (PUBLIC only). When SESSION_0176 lands an ACL helper, swap the constant
 * for a viewer-aware predicate.
 *
 * Author: Cody / SESSION_0175 TASK_02.
 */

// ---------------------------------------------------------------------------
// Visibility scope
// ---------------------------------------------------------------------------

/**
 * TODO: visibility ACL (SESSION_0176)
 *
 * Replace this constant with a viewer-scope helper that returns:
 *   - unauthenticated → `[PUBLIC]`
 *   - authenticated   → `[PUBLIC, UNLISTED]`
 *   - viewer w/ explicit ACL on the node → `[PUBLIC, UNLISTED, RESTRICTED]`
 *   - owner of the node                  → `[PUBLIC, UNLISTED, RESTRICTED, PRIVATE]`
 *
 * Until that helper exists, every read in this module returns PUBLIC-only.
 * RESTRICTED/PRIVATE rows are never surfaced.
 */
const PUBLIC_VISIBILITY_SCOPE: LineageVisibility[] = [LineageVisibility.PUBLIC]

// ---------------------------------------------------------------------------
// getLineageRootForUser — single LineageNode for a user.
// Public read path; cached.
// ---------------------------------------------------------------------------

/**
 * Find the lineage root node for the given user.
 *
 * Returns null if the user has no node OR the node's visibility is outside
 * the public scope. Used by the discipline-page lineage section to anchor
 * the tree on the discipline owner / brand owner.
 */
export const getLineageRootForUser = async (
  userId: string,
): Promise<LineageNodeRow | null> => {
  "use cache"

  cacheTag("lineage", `lineage-root-${userId}`)
  cacheLife("minutes")

  return db.lineageNode.findFirst({
    where: {
      userId,
      visibility: { in: PUBLIC_VISIBILITY_SCOPE },
    },
    select: lineageNodeRowPayload,
  })
}

// ---------------------------------------------------------------------------
// getLineageTreeForUser — BFS expansion to depth.
// Public read path; cached.
// ---------------------------------------------------------------------------

/**
 * Walk the user's lineage tree via `INSTRUCTOR_STUDENT` edges out to `depth`
 * levels. Returns flat arrays of nodes + edges; the UI does layout.
 *
 * Algorithm:
 *  1. Seed with the user's root LineageNode (visibility-filtered).
 *  2. For each level up to `depth`, expand:
 *     - `relationshipsTo` where this node is the student (fromNode = instructor),
 *     - `relationshipsFrom` where this node is the instructor (toNode = student).
 *  3. Collect unique node ids + edge ids; respect visibility scope on every
 *     traversed node so we never leak a RESTRICTED neighbour.
 *
 * The BFS visits each node at most once and is hard-capped at the schema-
 * validated `depth` arg (max 5). No recursion; iterative loop.
 */
export const getLineageTreeForUser = async (
  userId: string,
  depth: number = 2,
): Promise<LineageTreeResult | null> => {
  "use cache"

  cacheTag("lineage", `lineage-tree-${userId}`, `lineage-tree-${userId}-d${depth}`)
  cacheLife("minutes")

  const root = await db.lineageNode.findFirst({
    where: {
      userId,
      visibility: { in: PUBLIC_VISIBILITY_SCOPE },
    },
    select: lineageNodeRowPayload,
  })

  if (!root) {
    return null
  }

  const nodeMap = new Map<string, LineageNodeRow>()
  const edgeMap = new Map<string, LineageRelationshipRow>()
  nodeMap.set(root.id, root)

  let frontier: string[] = [root.id]

  for (let level = 0; level < depth && frontier.length > 0; level++) {
    // Pull all INSTRUCTOR_STUDENT edges touching the current frontier in one
    // round-trip per level. We filter by edge endpoint, then visibility-
    // filter the neighbour nodes before adding them.
    const edges = await db.lineageRelationship.findMany({
      where: {
        type: "INSTRUCTOR_STUDENT",
        OR: [
          { fromNodeId: { in: frontier } },
          { toNodeId: { in: frontier } },
        ],
      },
      select: lineageRelationshipPayload,
    })

    // Candidate neighbour node ids (anything on the far side of an edge
    // we haven't already visited).
    const neighbourIds = new Set<string>()
    for (const edge of edges) {
      if (frontier.includes(edge.fromNodeId) && !nodeMap.has(edge.toNodeId)) {
        neighbourIds.add(edge.toNodeId)
      }
      if (frontier.includes(edge.toNodeId) && !nodeMap.has(edge.fromNodeId)) {
        neighbourIds.add(edge.fromNodeId)
      }
    }

    let visibleNeighbourIds = new Set<string>()
    if (neighbourIds.size > 0) {
      const neighbours = await db.lineageNode.findMany({
        where: {
          id: { in: Array.from(neighbourIds) },
          visibility: { in: PUBLIC_VISIBILITY_SCOPE },
        },
        select: lineageNodeRowPayload,
      })
      for (const n of neighbours) {
        nodeMap.set(n.id, n)
        visibleNeighbourIds.add(n.id)
      }
    }

    // Only keep edges where BOTH endpoints are visible (root + visible
    // neighbour, OR two already-visited frontier nodes). Drop edges that
    // dangle into RESTRICTED/PRIVATE territory so the UI never references
    // a node it doesn't have.
    for (const edge of edges) {
      const fromVisible = nodeMap.has(edge.fromNodeId)
      const toVisible = nodeMap.has(edge.toNodeId)
      if (fromVisible && toVisible) {
        edgeMap.set(edge.id, edge)
      }
    }

    frontier = Array.from(visibleNeighbourIds)
  }

  return {
    rootId: root.id,
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values()),
  }
}

// ---------------------------------------------------------------------------
// getLineageProfile — single LineageNode, full Info-tab payload.
// Auth-scoped React cache() — drawer may expose UNLISTED rows in SESSION_0176.
// ---------------------------------------------------------------------------

/**
 * Fetch the full drawer-Info payload for a node.
 *
 * Uses React `cache()` (not `"use cache"`) because:
 *  - the drawer-open render path is per-request,
 *  - SESSION_0176 will widen the visibility scope based on viewer identity,
 *    and a persistent cache would have to be keyed on viewer + visibility,
 *    which is more complexity than the surface needs at MVP.
 *
 * Returns null if the node doesn't exist OR its visibility is outside the
 * current scope (treat as 404 in the UI per the port spec).
 */
export const getLineageProfile = cache(
  async (nodeId: string): Promise<LineageNodeProfile | null> => {
    return db.lineageNode.findFirst({
      where: {
        id: nodeId,
        visibility: { in: PUBLIC_VISIBILITY_SCOPE },
      },
      select: lineageNodeProfilePayload,
    })
  },
)

// ---------------------------------------------------------------------------
// getLineageTreeBySlug — Lineage Tree v1 read model.
// Public read path; cached.
//
// Author: Cody / SESSION_0179 TASK_01.
// ---------------------------------------------------------------------------

/**
 * Materialize a `LineageTreePublicRow` into the public-facing result.
 *
 * Pure helper — no DB or cache. Exported for unit testing the filtering /
 * pruning ordering without standing up a fixture tree.
 *
 * Visibility-filter order matters: members are dropped first (anything whose
 * `node.visibility` is outside the public scope), then visual groups are
 * pruned if every member that referenced them was just dropped. Reversing
 * the order would leak empty groups for RESTRICTED rows.
 */
export const materializeLineageTreeResult = (
  tree: LineageTreePublicRow,
): LineageTreePublicResult => {
  const visibleMembers = tree.members.filter((member) =>
    PUBLIC_VISIBILITY_SCOPE.includes(member.node.visibility),
  )

  const referencedGroupIds = new Set<string>()
  for (const member of visibleMembers) {
    if (member.visualGroupId) {
      referencedGroupIds.add(member.visualGroupId)
    }
  }

  const visibleGroups = tree.visualGroups.filter((group) =>
    referencedGroupIds.has(group.id),
  )

  const { members: _members, visualGroups: _visualGroups, ...summary } = tree

  return {
    tree: summary,
    members: visibleMembers,
    visualGroups: visibleGroups,
    defaultRootMemberId: tree.defaultRootMemberId,
  }
}

/**
 * Fetch a published, PUBLIC `LineageTree` by `brand` + `slug` and return the
 * visibility-filtered visual tree. Returns null when the tree doesn't exist,
 * isn't published, or isn't PUBLIC.
 */
export const getLineageTreeBySlug = async ({
  brand,
  slug,
}: {
  brand: Brand
  slug: string
}): Promise<LineageTreePublicResult | null> => {
  "use cache"

  cacheTag("lineage", `lineage-tree-${brand}-${slug}`)
  cacheLife("minutes")

  const tree = await db.lineageTree.findUnique({
    where: { brand_slug: { brand, slug } },
    select: lineageTreePublicPayload,
  })

  if (!tree) {
    return null
  }

  if (
    !PUBLIC_VISIBILITY_SCOPE.includes(tree.visibility) ||
    !tree.isPublished
  ) {
    return null
  }

  return materializeLineageTreeResult(tree)
}
