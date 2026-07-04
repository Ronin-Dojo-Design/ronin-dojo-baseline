import { cacheLife, cacheTag } from "next/cache"
import type { Prisma } from "~/.generated/prisma/client"
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
 * ONE `findMany({ id: { in: chain } })` for all display data + ONE
 * `findMany({ passportId: { in: chain } })` for enabled story scenes (Epic A,
 * SESSION_0498 — a real extra query, so the budget moved L+3 → L+4). A chain of
 * length L costs L + 4 queries, hard-capped by `ANCESTRY_MAX_DEPTH`.
 *
 * Author: Cody / SESSION_0493 TASK_05. Story projection: SESSION_0498 TASK_01.
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

/**
 * Story-scene projection for one ancestry entry (Epic A — Lineage Journey,
 * SESSION_0498). Additive narrative copy/media over the walk; carries NO rank,
 * visibility, or verification authority.
 */
export type LineageStorySceneView = {
  quote: string | null
  /** Display attribution under the quote; null = render the entry's displayName. */
  quoteAttribution: string | null
  storyBio: string | null
  heroImageUrl: string | null
  heroVideoUrl: string | null
  posterUrl: string | null
  sceneOrder: number | null
  /** Bob / dirty-dozen bridge scene (A6 conditional render — out of 0498). */
  isBridge: boolean
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
  /** Enabled story scene for this person (Epic A); undefined when none exists. */
  story?: LineageStorySceneView
}

/** One step of the member-up walk: the node + the description of its edge UP. */
type AncestryWalkStep = {
  nodeId: string
  narrative: string | null
}

/**
 * Story-scene batch select/where — exported so the unit tests can pin the query
 * boundary invariants (enabled-only; keyed strictly by the PUBLIC-filtered
 * chain's passportIds — never a visibility widener).
 */
export const ancestryStorySceneSelect = {
  passportId: true,
  quote: true,
  quoteAttribution: true,
  storyBio: true,
  heroImageUrl: true,
  heroVideoUrl: true,
  posterUrl: true,
  sceneOrder: true,
  isBridge: true,
} satisfies Prisma.LineageStorySceneSelect

export const ancestryStorySceneWhere = (passportIds: string[]) =>
  ({
    passportId: { in: passportIds },
    enabled: true,
  }) satisfies Prisma.LineageStorySceneWhereInput

/** One fetched scene row — the view fields plus the passportId map key. */
export type AncestryStorySceneRow = Prisma.LineageStorySceneGetPayload<{
  select: typeof ancestryStorySceneSelect
}>

/**
 * Project the walked chain into ordered entries — [founder … member], the profile
 * owner LAST by contract.
 *
 * Pure (exported for unit tests). `walk` is in member-up order; `nodesById` holds the
 * PUBLIC-filtered batch fetch. If a walked node is missing from the batch (visibility
 * changed between queries), the chain is TRUNCATED at the gap rather than spliced —
 * a false adjacency would fabricate a promotion link.
 *
 * `scenesByPassportId` (Epic A, SESSION_0498) holds the enabled story scenes keyed
 * by passportId — attached only to entries whose node survived the PUBLIC batch, so
 * a scene can never resurrect or widen a hidden node.
 */
export const assembleAncestryEntries = (
  walk: AncestryWalkStep[],
  nodesById: ReadonlyMap<string, LineageNodeRow>,
  scenesByPassportId: ReadonlyMap<string, AncestryStorySceneRow> = new Map(),
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
    const scene = scenesByPassportId.get(node.passportId)

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
      story: scene
        ? {
            quote: scene.quote,
            quoteAttribution: scene.quoteAttribution,
            storyBio: scene.storyBio,
            heroImageUrl: scene.heroImageUrl,
            heroVideoUrl: scene.heroVideoUrl,
            posterUrl: scene.posterUrl,
            sceneOrder: scene.sceneOrder,
            isBridge: scene.isBridge,
          }
        : undefined,
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

  // ONE batch fetch for the chain's enabled story scenes (Epic A, SESSION_0498) —
  // keyed by the passportIds the PUBLIC-filtered batch above returned, so a hidden
  // node can never leak its scene. The one real budget addition: L+3 → L+4.
  const scenes =
    nodes.length === 0
      ? []
      : await db.lineageStoryScene.findMany({
          where: ancestryStorySceneWhere(nodes.map(node => node.passportId)),
          select: ancestryStorySceneSelect,
        })

  return assembleAncestryEntries(
    walk,
    new Map(nodes.map(node => [node.id, node])),
    new Map(scenes.map(scene => [scene.passportId, scene])),
  )
}
