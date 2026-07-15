import { cacheLife, cacheTag } from "next/cache"
import type { Prisma } from "~/.generated/prisma/client"
import type { BeltFamily } from "~/components/common/belt-swatch"
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
   * Black-belt degree for the `belt`-swatch degree-mark rendering — `Rank.degree` (additive
   * `Int?`, landed SESSION_0493 TASK_01). Null = no degree stripes.
   */
  degree: number | null
  /** Belt family driving the rank-bar treatment (SESSION_0539); null = neutral bar. */
  beltFamily: BeltFamily | null
}

/**
 * Story-scene projection for one ancestry entry (Epic A — Lineage Journey,
 * SESSION_0498). Additive narrative copy/media over the walk; carries NO rank,
 * visibility, or verification authority.
 *
 * Deliberately minimal (Giddy A0 review P3-1/P3-2): this is a PUBLIC RSC payload,
 * so it projects ONLY what the scene renderer consumes. `quoteAttribution` is
 * sourcing provenance (the scene renders NO attribution line — the once-per-card
 * name is the attribution, SESSION_0499 TASK_03),
 * `heroVideoUrl`/`posterUrl` are dormant until A5, `isBridge`/`bridgeCondition`
 * until A6, and `sceneOrder` is storyboard-only metadata — **walk order is the
 * authoritative entry order**; a consumer must never re-sort the chain by scene
 * metadata. Widen this view only when a renderer actually consumes the field.
 */
export type LineageStorySceneView = {
  quote: string | null
  storyBio: string | null
  heroImageUrl: string | null
  /**
   * Scene kill-switch state — consumed by the `/app/beta/lineage-journey`
   * preview's "disabled" marker chip (SESSION_0498 TASK_04). On the PUBLIC read
   * path this is `true` by construction (`ancestryStorySceneWhere` defaults to
   * enabled-only); only the beta preview's `includeDisabledScenes` read can
   * surface `false`.
   */
  enabled: boolean
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
 * Story-scene batch select — the unit tests pin the query boundary invariants
 * (enabled-only BY DEFAULT; keyed strictly by the PUBLIC-filtered chain's
 * passportIds — never a visibility widener) via the exported
 * `ancestryStorySceneWhere` + `AncestryStorySceneRow`; the select itself is
 * consumed in-file only (`typeof` needs no export).
 */
const ancestryStorySceneSelect = {
  passportId: true,
  quote: true,
  storyBio: true,
  heroImageUrl: true,
  enabled: true,
} satisfies Prisma.LineageStorySceneSelect

/**
 * Read options for the ancestry walk (SESSION_0498 TASK_04).
 *
 * `includeDisabledScenes` relaxes ONLY the scene batch's `enabled: true` filter
 * — node visibility gates are untouched. It exists for the admin-gated
 * `/app/beta/lineage-journey` preview; the PUBLIC caller (`AncestrySection` via
 * `loadDirectoryProfile`) must NEVER pass it. `getLineageAncestryForPassport`
 * is `"use cache"`, so the flag is part of the cache key — the preview read and
 * the public read are distinct cache entries by construction.
 */
export type LineageAncestryOptions = {
  includeDisabledScenes?: boolean
}

export const ancestryStorySceneWhere = (
  passportIds: string[],
  { includeDisabledScenes = false }: LineageAncestryOptions = {},
) =>
  ({
    passportId: { in: passportIds },
    // The public kill-switch gate. The beta preview is the ONLY reader allowed
    // to drop it (visibility stays PUBLIC-only either way).
    ...(includeDisabledScenes ? {} : { enabled: true }),
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
            beltFamily: award.rank.beltFamily ?? null,
          }
        : null,
      disciplineLabel: award?.rank.rankSystem?.discipline?.name ?? null,
      narrative: step.narrative,
      story: scene
        ? {
            quote: scene.quote,
            storyBio: scene.storyBio,
            heroImageUrl: scene.heroImageUrl,
            // Constant true on the public path (where-gated); false only via the
            // beta preview's includeDisabledScenes read (its "disabled" marker).
            enabled: scene.enabled,
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
 *
 * `options` (see {@link LineageAncestryOptions}): `includeDisabledScenes` is the
 * beta-preview read — `"use cache"` keys on the arguments, so the flagged read
 * caches separately from the public one; storyboard mutations revalidate the
 * shared `"lineage"` tag, flushing both.
 */
export const getLineageAncestryForPassport = async (
  passportId: string,
  options?: LineageAncestryOptions,
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

  // ONE batch fetch for the chain's story scenes (Epic A, SESSION_0498) — keyed
  // by the passportIds the PUBLIC-filtered batch above returned, so a hidden
  // node can never leak its scene. Enabled-only by default; the beta preview's
  // includeDisabledScenes relaxes ONLY that filter. Budget: L+3 → L+4.
  const scenes =
    nodes.length === 0
      ? []
      : await db.lineageStoryScene.findMany({
          where: ancestryStorySceneWhere(
            nodes.map(node => node.passportId),
            options,
          ),
          select: ancestryStorySceneSelect,
        })

  return assembleAncestryEntries(
    walk,
    new Map(nodes.map(node => [node.id, node])),
    new Map(scenes.map(scene => [scene.passportId, scene])),
  )
}
