import { cacheLife, cacheTag } from "next/cache"
import { memberTopRankAward } from "~/lib/lineage/canvas-model"
import { type LineageNodeRow, lineageNodeRowPayload } from "~/server/web/lineage/payloads"
import { projectPublicPassport } from "~/server/web/passport/public-projection"
import { db } from "~/services/db"

/**
 * Ancestry walk — the member's promotion chain UP to the founder.
 *
 * `/directory/[slug]` renders a vertical ancestry timeline (founder → … → member).
 * No recursive walk existed before this: `lineageNodeProfilePayload` loads exactly ONE
 * level up, and the cohort-timeline walk is a client-side traversal of the VISUAL tree
 * (a different structure). This is the server-side promotion-lineage walk.
 *
 * Public read path (funnel-first — logged-out must render): viewer-agnostic
 * `"use cache"`, hard-coded PUBLIC visibility on the base node, on every traversed
 * edge's `fromNode`, and on the final batch fetch — the `getLineageTreeForUser`
 * precedent. Per-node rank redaction goes through `projectPublicPassport`
 * (`showRanks === false` → rank withheld, SESSION_0266 idiom).
 *
 * Query budget (no N+1 per node): 1 base-node lookup + ONE edge lookup per level
 * (a chain step depends on the previous level, so level-by-level is the batch) +
 * ONE `findMany({ id: { in: chain } })` for all display data. A chain of length L
 * costs L + 3 queries, hard-capped by `ANCESTRY_MAX_DEPTH`.
 *
 * Author: Cody / SESSION_0493 TASK_05.
 */

/** Generational depth cap for the up-walk (member → founder). */
const ANCESTRY_MAX_DEPTH = 12

export type LineageAncestryRank = {
  id: string
  name: string
  colorHex: string | null
  /** Second panel color for alternating belts (coral red/black · red/white); null = solid. */
  secondaryColorHex: string | null
  sortOrder: number
  /**
   * Black-belt degree for the flat-bar stripe rendering — `Rank.degree` (additive
   * `Int?`, landed SESSION_0493 TASK_01). Null = no degree stripes.
   */
  degree: number | null
}

export type LineageAncestryEntry = {
  nodeId: string
  /** LineageNode slug (deep-link seam; may be null for imported placeholders). */
  slug: string | null
  displayName: string
  /** Canonical public avatar — `passport.avatarUrl ?? user.image` via `resolveDisplayAvatar`. */
  avatarUrl: string | null
  /** Highest awarded rank overall (ADR 0035 awarded truth); null when none/hidden. */
  rank: LineageAncestryRank | null
  /** Discipline of the shown rank ("Brazilian Jiu-Jitsu"); null when no rank shows. */
  disciplineLabel: string | null
  /**
   * The connecting edge's `description` between this node and its instructor ABOVE it
   * (rendered as a narrative caption between the two). Null for the founder (no edge
   * above) and for edges without a description.
   */
  narrative: string | null
}

/** One step of the member-up walk: the node + the description of its edge UP. */
type AncestryWalkStep = {
  nodeId: string
  narrative: string | null
}

/**
 * Project the walked chain into ordered entries — [founder … member], the profile
 * owner LAST by contract.
 *
 * Pure (exported for unit tests). `walk` is in member-up order; `nodesById` holds the
 * PUBLIC-filtered batch fetch. If a walked node is missing from the batch (visibility
 * changed between queries), the chain is TRUNCATED at the gap rather than spliced —
 * a false adjacency would fabricate a promotion link.
 */
export const assembleAncestryEntries = (
  walk: AncestryWalkStep[],
  nodesById: ReadonlyMap<string, LineageNodeRow>,
): LineageAncestryEntry[] => {
  const memberUp: LineageAncestryEntry[] = []

  for (const step of walk) {
    const node = nodesById.get(step.nodeId)
    if (!node?.passport) break // truncate above the gap — never bridge a hidden node

    // The ONE public redaction audit point: empty dto.ranks (showRanks === false or no
    // awards) → no rank shown. Otherwise the shown rank is the top awarded belt overall
    // (multi-discipline surface → no disciplineId, per memberTopRankAward).
    const dto = projectPublicPassport(node.passport, {})
    const award = dto.ranks.length === 0 ? null : memberTopRankAward(node)

    memberUp.push({
      nodeId: node.id,
      slug: node.slug,
      displayName: dto.displayName,
      avatarUrl: dto.avatarUrl,
      rank: award
        ? {
            id: award.rank.id,
            name: award.rank.name,
            colorHex: award.rank.colorHex,
            secondaryColorHex: award.rank.secondaryColorHex ?? null,
            sortOrder: award.rank.sortOrder,
            degree: award.rank.degree ?? null,
          }
        : null,
      disciplineLabel: award?.rank.rankSystem?.discipline?.name ?? null,
      narrative: step.narrative,
    })
  }

  // No PUBLIC up-chain (member alone, or truncated to one) → the section renders nothing.
  if (memberUp.length < 2) return []

  return memberUp.reverse()
}

/**
 * Walk the promotion chain UP from a Passport's lineage node — via
 * `relationshipsTo` (`INSTRUCTOR_STUDENT`, this node = student, `fromNode` =
 * instructor) — and return ordered entries [founder … member].
 *
 * Multiple-instructor rule (deterministic primary pick): when a node has more than
 * one PUBLIC instructor edge, take the first ordered by `isVerified desc` (a verified
 * promoter edge outranks an unverified one), then `createdAt asc` (the original
 * import edge outranks later additions), then `id asc` as the final tiebreak.
 *
 * Cycle guard: a seen-set of node ids stops the walk if an edge points back into the
 * chain. Depth is hard-capped at {@link ANCESTRY_MAX_DEPTH}.
 *
 * Returns `[]` when the Passport has no PUBLIC lineage node or no PUBLIC up-chain.
 */
export const getLineageAncestryForPassport = async (
  passportId: string,
): Promise<LineageAncestryEntry[]> => {
  "use cache"

  cacheTag("lineage", `lineage-ancestry-${passportId}`)
  cacheLife("minutes")

  const baseNode = await db.lineageNode.findFirst({
    where: { passportId, visibility: "PUBLIC" },
    select: { id: true },
  })

  if (!baseNode) return []

  const seen = new Set<string>([baseNode.id])
  const walk: AncestryWalkStep[] = [{ nodeId: baseNode.id, narrative: null }]
  let currentNodeId = baseNode.id

  for (let level = 0; level < ANCESTRY_MAX_DEPTH; level++) {
    const edge = await db.lineageRelationship.findFirst({
      where: {
        toNodeId: currentNodeId,
        type: "INSTRUCTOR_STUDENT",
        fromNode: { visibility: "PUBLIC" },
      },
      // The deterministic primary-instructor rule (see the function doc).
      orderBy: [{ isVerified: "desc" }, { createdAt: "asc" }, { id: "asc" }],
      select: { fromNodeId: true, description: true },
    })

    if (!edge) break
    if (seen.has(edge.fromNodeId)) break // cycle guard

    // The edge's description narrates the link between the CURRENT node (student)
    // and the instructor above it — attach it to the student step.
    walk[walk.length - 1].narrative = edge.description

    seen.add(edge.fromNodeId)
    walk.push({ nodeId: edge.fromNodeId, narrative: null })
    currentNodeId = edge.fromNodeId
  }

  if (walk.length < 2) return []

  // ONE batch fetch for every chain node's display data (identity + rank awards).
  const nodes = await db.lineageNode.findMany({
    where: {
      id: { in: walk.map(step => step.nodeId) },
      visibility: "PUBLIC",
    },
    select: lineageNodeRowPayload,
  })

  return assembleAncestryEntries(walk, new Map(nodes.map(node => [node.id, node])))
}
