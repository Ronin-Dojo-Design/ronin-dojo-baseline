import { cacheLife, cacheTag } from "next/cache"
import { cache } from "react"
import { type Brand, LineageVisibility, type Prisma } from "~/.generated/prisma/client"
import { parseSort } from "~/server/web/_shared/sortable"
import {
  type LineageNodeProfile,
  type LineageNodeRow,
  type LineageRelationshipRow,
  type LineageTreePublicResult,
  type LineageTreePublicRow,
  type LineageTreeResult,
  type LineageTreeSummary,
  lineageNodeProfilePayload,
  lineageNodeRowPayload,
  lineageRelationshipPayload,
  lineageTreePublicPayload,
} from "~/server/web/lineage/payloads"
import {
  LINEAGE_DEFAULT_PER_PAGE,
  type LineageFilterParams,
  normalizeLineageSearchParams,
} from "~/server/web/lineage/schema"
import { buildPublishedLineageTreeWhere } from "~/server/web/lineage/tree-where"
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
 * The unauthenticated default scope used by every cached public read.
 *
 * Authenticated, viewer-aware callers use `resolveLineageVisibilityScope`
 * instead; PRIVATE is reserved for explicit owner-only reads (separate
 * helper, future session) and is never returned here.
 */
const PUBLIC_VISIBILITY_SCOPE: LineageVisibility[] = [LineageVisibility.PUBLIC]

const shouldShowPublicRanks = (node: LineageNodeRow | LineageNodeProfile) =>
  node.passport?.directoryProfile?.showRanks !== false

const redactLineageNodeRowRanks = (node: LineageNodeRow): LineageNodeRow => {
  if (shouldShowPublicRanks(node) || !node.passport) {
    return node
  }
  return { ...node, passport: { ...node.passport, rankAwardsEarned: [] } }
}

export const redactLineageNodeProfileRanks = (profile: LineageNodeProfile): LineageNodeProfile => {
  if (shouldShowPublicRanks(profile) || !profile.passport) {
    return profile
  }
  // SESSION_0266_FINDING_01 — `passport.user.memberships[].rank.{name,shortName}`
  // was an adjacent rank-leak path the SESSION_0264/0265 redactions
  // missed. Null out the embedded `Membership.rank` (nullable in schema)
  // for `showRanks=false` viewers alongside the existing `rankAwards` blank.
  // (Phase 3c: ranks earned are now Passport-rooted; memberships stay account-side.)
  return {
    ...profile,
    passport: {
      ...profile.passport,
      rankAwardsEarned: [],
      user: profile.passport.user
        ? {
            ...profile.passport.user,
            memberships: profile.passport.user.memberships.map(membership => ({
              ...membership,
              rank: null,
            })),
          }
        : null,
    },
  }
}

/**
 * Resolve the visibility scope for a viewer.
 *
 * Pure helper — no DB. The caller is expected to have already determined
 * whether the viewer is the tree owner (typically by resolving their
 * `LineageNode.id` and comparing to `LineageTree.ownerNodeId`).
 *
 *   - No viewer (unauthenticated) → `[PUBLIC]`
 *   - Authenticated, not owner    → `[PUBLIC, UNLISTED]`
 *   - Authenticated, owner        → `[PUBLIC, UNLISTED, RESTRICTED]`
 *
 * `PRIVATE` is never returned here — it is owner-only and unlocked through
 * a separate read path so it never enters a shared cache key.
 *
 * Author: Cody / SESSION_0180 TASK_03.
 */
export const resolveLineageVisibilityScope = ({
  authenticated,
  isOwner,
}: {
  authenticated: boolean
  isOwner: boolean
}): LineageVisibility[] => {
  if (!authenticated) return [LineageVisibility.PUBLIC]
  if (isOwner) {
    return [LineageVisibility.PUBLIC, LineageVisibility.UNLISTED, LineageVisibility.RESTRICTED]
  }
  return [LineageVisibility.PUBLIC, LineageVisibility.UNLISTED]
}

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
export const getLineageRootForUser = async (userId: string): Promise<LineageNodeRow | null> => {
  "use cache"

  cacheTag("lineage", `lineage-root-${userId}`)
  cacheLife("minutes")

  const node = await db.lineageNode.findFirst({
    where: {
      passport: { userId },
      visibility: { in: PUBLIC_VISIBILITY_SCOPE },
    },
    select: lineageNodeRowPayload,
  })
  return node ? redactLineageNodeRowRanks(node) : null
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
  depth = 2,
): Promise<LineageTreeResult | null> => {
  "use cache"

  cacheTag("lineage", `lineage-tree-${userId}`, `lineage-tree-${userId}-d${depth}`)
  cacheLife("minutes")

  const root = await db.lineageNode.findFirst({
    where: {
      passport: { userId },
      visibility: { in: PUBLIC_VISIBILITY_SCOPE },
    },
    select: lineageNodeRowPayload,
  })

  if (!root) {
    return null
  }

  const nodeMap = new Map<string, LineageNodeRow>()
  const edgeMap = new Map<string, LineageRelationshipRow>()
  nodeMap.set(root.id, redactLineageNodeRowRanks(root))

  let frontier: string[] = [root.id]

  for (let level = 0; level < depth && frontier.length > 0; level++) {
    // Pull all INSTRUCTOR_STUDENT edges touching the current frontier in one
    // round-trip per level. We filter by edge endpoint, then visibility-
    // filter the neighbour nodes before adding them.
    const edges = await db.lineageRelationship.findMany({
      where: {
        type: "INSTRUCTOR_STUDENT",
        OR: [{ fromNodeId: { in: frontier } }, { toNodeId: { in: frontier } }],
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

    const visibleNeighbourIds = new Set<string>()
    if (neighbourIds.size > 0) {
      const neighbours = await db.lineageNode.findMany({
        where: {
          id: { in: Array.from(neighbourIds) },
          visibility: { in: PUBLIC_VISIBILITY_SCOPE },
        },
        select: lineageNodeRowPayload,
      })
      for (const n of neighbours) {
        nodeMap.set(n.id, redactLineageNodeRowRanks(n))
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
    const profile = await db.lineageNode.findFirst({
      where: {
        id: nodeId,
        visibility: { in: PUBLIC_VISIBILITY_SCOPE },
      },
      select: lineageNodeProfilePayload,
    })
    return profile ? redactLineageNodeProfileRanks(profile) : null
  },
)

/**
 * Fetch drawer profile payloads for a batch of visible nodes.
 *
 * The public route already materializes visible tree members before calling
 * this helper. Keep the PUBLIC filter here anyway so the profile payload cannot
 * be widened accidentally by a caller passing unfiltered ids.
 */
export const getLineageProfilesByIds = cache(
  async (nodeIds: readonly string[]): Promise<Record<string, LineageNodeProfile>> => {
    const uniqueNodeIds = Array.from(new Set(nodeIds))

    if (uniqueNodeIds.length === 0) {
      return {}
    }

    const profiles = await db.lineageNode.findMany({
      where: {
        id: { in: uniqueNodeIds },
        visibility: { in: PUBLIC_VISIBILITY_SCOPE },
      },
      select: lineageNodeProfilePayload,
    })

    return Object.fromEntries(
      profiles.map(profile => {
        const publicProfile = redactLineageNodeProfileRanks(profile)
        return [publicProfile.id, publicProfile]
      }),
    )
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
 * `node.visibility` is outside the supplied scope), then visual groups are
 * pruned if every member that referenced them was just dropped. Reversing
 * the order would leak empty groups for filtered-out rows.
 *
 * Reference hardening (SESSION_0180 TASK_01): after pruning, every id that
 * could point at a dropped member is normalized so the UI never dereferences
 * a missing id:
 *  - `member.primaryVisualParentMemberId` → null when parent was dropped.
 *  - `group.parentMemberId` → null when the referenced member was dropped.
 *  - `defaultRootMemberId` → null when the chosen root was dropped.
 *
 * The `scope` arg defaults to `PUBLIC_VISIBILITY_SCOPE` so existing PUBLIC
 * callers keep working unchanged; viewer-aware callers pass the scope
 * returned by `resolveLineageVisibilityScope(viewer)`.
 */
export const materializeLineageTreeResult = (
  tree: LineageTreePublicRow,
  scope: readonly LineageVisibility[] = PUBLIC_VISIBILITY_SCOPE,
): LineageTreePublicResult => {
  const visibleMembers = tree.members.filter(member => scope.includes(member.node.visibility))

  const survivingMemberIds = new Set(visibleMembers.map(m => m.id))

  const referencedGroupIds = new Set<string>()
  for (const member of visibleMembers) {
    if (member.visualGroupId) {
      referencedGroupIds.add(member.visualGroupId)
    }
  }

  const normalizedMembers = visibleMembers.map(member => {
    const normalizedMember =
      member.primaryVisualParentMemberId &&
      !survivingMemberIds.has(member.primaryVisualParentMemberId)
        ? { ...member, primaryVisualParentMemberId: null }
        : member
    const redactedNode = redactLineageNodeRowRanks(normalizedMember.node)
    const selectedRankAward = shouldShowPublicRanks(normalizedMember.node)
      ? normalizedMember.selectedRankAward
      : null
    return { ...normalizedMember, node: redactedNode, selectedRankAward }
  })

  const normalizedGroups = tree.visualGroups
    .filter(group => referencedGroupIds.has(group.id))
    .map(group =>
      group.parentMemberId && !survivingMemberIds.has(group.parentMemberId)
        ? { ...group, parentMemberId: null }
        : group,
    )

  const defaultRootMemberId =
    tree.defaultRootMemberId && survivingMemberIds.has(tree.defaultRootMemberId)
      ? tree.defaultRootMemberId
      : null

  const { members: _members, visualGroups: _visualGroups, ...summary } = tree

  return {
    tree: { ...summary, defaultRootMemberId },
    members: normalizedMembers,
    visualGroups: normalizedGroups,
    defaultRootMemberId,
  }
}

/**
 * Public, unauthenticated tree-by-slug read.
 *
 * Uses Next.js `"use cache"` so the response is shareable across requests.
 * The PUBLIC-only scope is implicit — never accept a viewer here, otherwise
 * viewer-scoped data would enter a shared cache key (ADR 0010).
 */
const getLineageTreeBySlugPublic = async ({
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

  if (!PUBLIC_VISIBILITY_SCOPE.includes(tree.visibility) || !tree.isPublished) {
    return null
  }

  return materializeLineageTreeResult(tree, PUBLIC_VISIBILITY_SCOPE)
}

/**
 * Viewer-scoped tree-by-slug read.
 *
 * Uses React `cache()` (request-scoped) so the response keys on viewer
 * identity without contaminating the shared `"use cache"` store. Ownership
 * is resolved by matching the viewer's `LineageNode.id` against
 * `LineageTree.ownerNodeId`.
 *
 * UNLISTED trees are returned to any authenticated viewer; RESTRICTED trees
 * are returned only to the owner; PRIVATE trees never surface through this
 * read path (separate owner-only helper, future session).
 */
const getLineageTreeBySlugForViewer = cache(
  async ({
    brand,
    slug,
    viewerUserId,
  }: {
    brand: Brand
    slug: string
    viewerUserId: string
  }): Promise<LineageTreePublicResult | null> => {
    const tree = await db.lineageTree.findUnique({
      where: { brand_slug: { brand, slug } },
      select: lineageTreePublicPayload,
    })

    if (!tree?.isPublished) {
      return null
    }

    const viewerNode = await db.lineageNode.findFirst({
      where: { passport: { userId: viewerUserId } },
      select: { id: true },
    })

    const isOwner = Boolean(
      tree.ownerNodeId && viewerNode?.id && viewerNode.id === tree.ownerNodeId,
    )

    const scope = resolveLineageVisibilityScope({
      authenticated: true,
      isOwner,
    })

    if (!scope.includes(tree.visibility)) {
      return null
    }

    return materializeLineageTreeResult(tree, scope)
  },
)

/**
 * Fetch a published `LineageTree` by `brand` + `slug` and return the
 * visibility-filtered visual tree.
 *
 * - No `viewer` (default) → PUBLIC-only, shared-cache fast path.
 * - `viewer` present     → viewer-scoped, request-cached path; UNLISTED
 *   trees visible to any signed-in viewer, RESTRICTED visible only to
 *   the owner.
 *
 * Returns null when the tree doesn't exist, isn't published, or is outside
 * the resolved scope.
 */
export const getLineageTreeBySlug = async ({
  brand,
  slug,
  viewer,
}: {
  brand: Brand
  slug: string
  viewer?: { userId: string } | null
}): Promise<LineageTreePublicResult | null> => {
  if (!viewer?.userId) {
    return getLineageTreeBySlugPublic({ brand, slug })
  }
  return getLineageTreeBySlugForViewer({
    brand,
    slug,
    viewerUserId: viewer.userId,
  })
}

export type LineageTreeMetadataSummary = Pick<
  LineageTreeSummary,
  "id" | "brand" | "slug" | "name" | "description"
>

/**
 * Lightweight public summary for page metadata.
 *
 * Do not call `getLineageTreeBySlug` from `generateMetadata` just to build a
 * title/description; that query selects members and visual groups for the full
 * public viewer payload.
 */
export const findPublishedLineageTreeSummaryBySlug = async ({
  brand,
  slug,
}: {
  brand: Brand
  slug: string
}): Promise<LineageTreeMetadataSummary | null> => {
  "use cache"

  cacheTag("lineage", `lineage-tree-summary-${brand}-${slug}`)
  cacheLife("minutes")

  return db.lineageTree.findFirst({
    where: {
      brand,
      slug,
      isPublished: true,
      visibility: { in: PUBLIC_VISIBILITY_SCOPE },
    },
    select: {
      id: true,
      brand: true,
      slug: true,
      name: true,
      description: true,
    },
  })
}

// ---------------------------------------------------------------------------
// findPublishedLineageTreeSlugs — SSG params for /lineage/[treeSlug].
// Public read path; cached.
//
// Author: Cody / SESSION_0241 TASK_01.
// ---------------------------------------------------------------------------

/**
 * Return `{ slug, brand }[]` for all published, publicly visible lineage
 * trees. Used by `generateStaticParams` on `/lineage/[treeSlug]`.
 */
export const findPublishedLineageTreeSlugs = async (): Promise<
  Array<{ slug: string; brand: Brand }>
> => {
  "use cache"

  cacheTag("lineage", "lineage-tree-slugs")
  cacheLife("hours")

  return db.lineageTree.findMany({
    where: {
      isPublished: true,
      visibility: { in: PUBLIC_VISIBILITY_SCOPE },
    },
    select: { slug: true, brand: true },
  })
}

// ---------------------------------------------------------------------------
// findPublishedLineageTrees — lightweight card/list query for /lineage index.
// Public read path; cached.
//
// Author: Cody / SESSION_0241 TASK_01.
// ---------------------------------------------------------------------------

/** Lightweight tree summary for cards/listing — no members or visual groups. */
export type LineageTreeCardRow = {
  id: string
  brand: Brand
  slug: string
  name: string
  description: string | null
  memberCount: number
  discipline: { id: string; name: string; slug: string } | null
  organization: { id: string; name: string; slug: string } | null
  isClaimable: boolean
}

const SORTABLE_LINEAGE_COLUMNS = ["name", "createdAt", "updatedAt"] as const

const getLineageOrderBy = (sort: string): Prisma.LineageTreeOrderByWithRelationInput[] => {
  const { sortBy, sortOrder } = parseSort(sort, SORTABLE_LINEAGE_COLUMNS)

  switch (sortBy) {
    case "createdAt":
      return [{ createdAt: sortOrder }, { id: "asc" }]
    case "updatedAt":
      return [{ updatedAt: sortOrder }, { id: "asc" }]
    default:
      return [{ name: sortOrder }, { id: "asc" }]
  }
}

export type LineageTreeSearchResult = {
  trees: LineageTreeCardRow[]
  total: number
  page: number
  perPage: number
}

/**
 * Search published, publicly visible lineage trees for a brand with summary
 * data suitable for cards/listing.
 *
 * Privacy rule: search fields are limited to tree/listing fields plus public
 * discipline and organization names. Member names are intentionally excluded.
 * Member count only counts PUBLIC-node members.
 */
export const searchPublishedLineageTrees = async ({
  brand,
  search = {
    q: "",
    sort: "name.asc",
    page: 1,
    perPage: LINEAGE_DEFAULT_PER_PAGE,
    discipline: "",
    organization: "",
    kind: "",
  },
}: {
  brand: Brand
  search?: LineageFilterParams
}): Promise<LineageTreeSearchResult> => {
  "use cache"

  cacheTag("lineage", `lineage-trees-${brand}`)
  cacheLife("minutes")

  const normalized = normalizeLineageSearchParams(search)
  const skip = (normalized.page - 1) * normalized.perPage

  // Privacy/brand/publish scope + the kind (scopeType) facet live in the pure, unit-tested
  // builder (SESSION_0401). `brand`, `isPublished`, and the PUBLIC visibility scope are pinned
  // there; the URL-supplied filters can only narrow.
  const where = buildPublishedLineageTreeWhere(
    {
      q: normalized.q,
      discipline: normalized.discipline,
      organization: normalized.organization,
      kind: normalized.kind,
    },
    brand,
  )

  const trees = await db.lineageTree.findMany({
    where,
    select: {
      id: true,
      brand: true,
      slug: true,
      name: true,
      description: true,
      discipline: { select: { id: true, name: true, slug: true } },
      organization: { select: { id: true, name: true, slug: true } },
      isClaimable: true,
      _count: {
        select: {
          members: {
            where: {
              node: { visibility: { in: PUBLIC_VISIBILITY_SCOPE } },
            },
          },
        },
      },
    },
    orderBy: getLineageOrderBy(normalized.sort),
    take: normalized.perPage,
    skip,
  })
  const total = await db.lineageTree.count({ where })

  return {
    trees: trees.map(t => ({
      id: t.id,
      brand: t.brand,
      slug: t.slug,
      name: t.name,
      description: t.description,
      memberCount: t._count.members,
      discipline: t.discipline,
      organization: t.organization,
      isClaimable: t.isClaimable,
    })),
    total,
    page: normalized.page,
    perPage: normalized.perPage,
  }
}

/**
 * Back-compat helper for callers that still need the unpaginated lightweight
 * list. New listing pages should call `searchPublishedLineageTrees`.
 */
export const findPublishedLineageTrees = async ({
  brand,
  take = 50,
}: {
  brand: Brand
  take?: number
}): Promise<LineageTreeCardRow[]> => {
  const { trees } = await searchPublishedLineageTrees({
    brand,
    search: {
      q: "",
      sort: "name.asc",
      page: 1,
      perPage: take,
      discipline: "",
      organization: "",
      kind: "",
    },
  })
  return trees
}
