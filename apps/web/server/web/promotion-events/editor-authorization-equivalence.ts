import type { AuthzUser } from "~/lib/authz"
import type { SessionUser } from "~/server/orpc/context"
import { type LineageResource, canForResource } from "~/server/orpc/resource-permissions"
import { buildLineageParentLookup } from "~/server/web/lineage/editor-graph"
import type {
  AuthorizableRankAward,
  PromotionEventAuthoringScope,
} from "~/server/web/promotion-events/editor-authorization"
import type { db as appDb } from "~/services/db"

/**
 * Stage 1 dev-only EQUIVALENCE HARNESS for the lineage-grant axis of the
 * promotion-event editor authorization (item-5, migration proposal §7 Stage 1).
 *
 * ⚠ SHIPS NOTHING USER-VISIBLE. This runs the hand-rolled node-set decision
 * ALONGSIDE the canonical `canForResource` decision and logs when the two
 * DISAGREE on an award's LINEAGE-GRANT authority. It NEVER changes the actual
 * authorization outcome, never throws in a request path, and is guarded to run
 * only outside production. The hand-rolled decision remains authoritative in
 * Stage 1 — this only collects divergence signal.
 *
 * SCOPE DISCIPLINE (proposal §3): we compare ONLY the lineage-grant axis
 * (`TREE_*` / `BRANCH_` / `NODE_`). The admin `*`, self-award
 * (`award.awardedById === userId`) and org-role axes have NO canonical
 * equivalent, so an award whose hand-rolled decision was short-circuited by any
 * of those is EXCLUDED — we compare only the residual case where authority came
 * down to node-id-set membership.
 *
 * CANONICAL PERMISSION KEY: `claim.review`. It is the ONLY permission every one
 * of the four editor roles carries in `LINEAGE_RESOURCE_GRANTS` (TREE_ADMIN,
 * TREE_EDITOR, BRANCH_EDITOR, NODE_EDITOR). The hand-rolled resolver grants
 * node-set membership UNIFORMLY to all four roles, so `claim.review` is the
 * faithful equivalent; keying on `lineage.member.edit` (which NODE_EDITOR lacks)
 * would fabricate divergence.
 */

type AppDb = typeof appDb

const CANONICAL_PERMISSION = "claim.review" as const

/** Is the equivalence harness allowed to run? Dev-only — NEVER in production. */
const isEquivalenceHarnessEnabled = () => process.env.NODE_ENV !== "production"

/**
 * The lineage-grant axis is only decided when the hand-rolled `canAuthorRankAward`
 * fell through admin / self / org to the node-id-set membership check. Mirror those
 * short-circuits so we compare ONLY that residual case (proposal §3).
 */
const isLineageAxisDecision = ({
  scope,
  award,
  userId,
}: {
  scope: PromotionEventAuthoringScope
  award: AuthorizableRankAward
  userId: string
}): boolean => {
  if (scope.isGlobalAdmin) return false
  if (award.awardedById === userId) return false
  if (award.organizationId && scope.organizationIds.has(award.organizationId)) return false
  // No node → the hand-rolled path returns false without consulting the node set;
  // there is no lineage resource to compare against.
  return Boolean(award.passport.lineageNode?.id)
}

/** The hand-rolled node-set membership verdict (the lineage-grant axis tail). */
const handRolledLineageVerdict = ({
  scope,
  nodeId,
}: {
  scope: PromotionEventAuthoringScope
  nodeId: string
}): boolean => scope.fullTreeNodeIds.has(nodeId) || scope.scopedNodeIds.has(nodeId)

/**
 * Resolve the canonical lineage resource(s) for an award's node — one per tree the
 * node is a member of. Mirrors `resolvePromotionClaimResources`' ancestor walk (the
 * proposal mandates REUSING that shape, not re-deriving): `branchRootMemberIds` is the
 * member's own id plus its ancestor chain up the visual-parent graph, so a
 * `BRANCH_EDITOR` grant rooted at any of them covers the member. Keyed off `nodeId`
 * (what the editor award carries) rather than `passportId`.
 */
const resolveAwardResources = async (db: AppDb, nodeId: string): Promise<LineageResource[]> => {
  const memberships = await db.lineageTreeMember.findMany({
    where: { nodeId },
    select: { id: true, treeId: true },
  })

  const resources: LineageResource[] = []
  for (const membership of memberships) {
    const members = await db.lineageTreeMember.findMany({
      where: { treeId: membership.treeId },
      select: { id: true, primaryVisualParentMemberId: true },
    })
    const parentById = buildLineageParentLookup(members)

    const branchRootMemberIds: string[] = [membership.id]
    const visited = new Set<string>([membership.id])
    let cursor = parentById.get(membership.id) ?? null
    while (cursor && !visited.has(cursor)) {
      branchRootMemberIds.push(cursor)
      visited.add(cursor)
      cursor = parentById.get(cursor) ?? null
    }

    resources.push({
      treeId: membership.treeId,
      nodeId,
      memberId: membership.id,
      branchRootMemberIds,
    })
  }

  return resources
}

/**
 * The canonical verdict for an award: does the user hold canonical `claim.review`
 * authority on ANY tree the award's node belongs to? (Matches the hand-rolled
 * union over every grant on every tree.)
 */
const canonicalLineageVerdict = async ({
  db,
  user,
  nodeId,
}: {
  db: AppDb
  user: SessionUser
  nodeId: string
}): Promise<boolean> => {
  const resources = await resolveAwardResources(db, nodeId)
  for (const resource of resources) {
    if (await canForResource(db, user, CANONICAL_PERMISSION, resource)) {
      return true
    }
  }
  return false
}

export type LineageAxisDivergence = {
  awardId: string
  nodeId: string
  treeIds: string[]
  handRolled: boolean
  canonical: boolean
}

/**
 * Compute the divergence record for a single award WITHOUT logging — the pure,
 * testable core. Returns `null` when the award is not a lineage-axis decision
 * (excluded from comparison) or when the two paths AGREE.
 *
 * PURE of side effects; still async because the canonical path needs the DB.
 * Never throws to a caller that wraps it — see `assertLineageAxisEquivalence`.
 */
export const computeLineageAxisDivergence = async ({
  db,
  user,
  scope,
  award,
  userId,
}: {
  db: AppDb
  user: AuthzUser
  scope: PromotionEventAuthoringScope
  award: AuthorizableRankAward
  userId: string
}): Promise<LineageAxisDivergence | null> => {
  if (!isLineageAxisDecision({ scope, award, userId })) {
    return null
  }

  const nodeId = award.passport.lineageNode!.id
  const handRolled = handRolledLineageVerdict({ scope, nodeId })

  // `canForResource` consumes a `SessionUser`; the editor path holds an `AuthzUser`.
  // For the LINEAGE axis the canonical resolver only reads `user.id` (grants are
  // loaded by id) and `can()` (role/extraGrants). Since this residual case has
  // already excluded the admin short-circuit, a minimal id+role user is sufficient
  // and faithful. Dev-only; never used to make a real authorization decision.
  const canonicalUser = { id: userId, role: user.role ?? "user" } as SessionUser

  const resources = await resolveAwardResources(db, nodeId)
  let canonical = false
  for (const resource of resources) {
    if (await canForResource(db, canonicalUser, CANONICAL_PERMISSION, resource)) {
      canonical = true
      break
    }
  }

  if (handRolled === canonical) {
    return null
  }

  return {
    awardId: award.id,
    nodeId,
    treeIds: resources.map(resource => resource.treeId),
    handRolled,
    canonical,
  }
}

/**
 * DEV-ONLY equivalence assertion for a batch of awards. Logs a structured
 * divergence record for every award where the hand-rolled lineage-grant verdict
 * and the canonical `canForResource` verdict DISAGREE. Guarded to run only
 * outside production, and swallows its own errors so it can NEVER affect the
 * request that hosts it.
 *
 * Returns the collected divergences (for tests / telemetry); the request path
 * ignores the return value.
 */
export const assertLineageAxisEquivalence = async ({
  db,
  user,
  scope,
  awards,
}: {
  db: AppDb
  user: AuthzUser
  scope: PromotionEventAuthoringScope
  awards: AuthorizableRankAward[]
}): Promise<LineageAxisDivergence[]> => {
  if (!isEquivalenceHarnessEnabled()) {
    return []
  }

  const divergences: LineageAxisDivergence[] = []
  try {
    for (const award of awards) {
      const divergence = await computeLineageAxisDivergence({
        db,
        user,
        scope,
        award,
        userId: user.id,
      })
      if (divergence) {
        divergences.push(divergence)
        console.warn(
          "[promotion-event-editor][lineage-axis-divergence]",
          JSON.stringify({
            userId: user.id,
            ...divergence,
            note: "hand-rolled decision is authoritative (Stage 1); canonical is shadow-only",
          }),
        )
      }
    }
  } catch (error) {
    // The harness must never break the request it observes. Log and move on.
    console.warn(
      "[promotion-event-editor][lineage-axis-divergence] harness error (ignored)",
      error instanceof Error ? error.message : String(error),
    )
  }

  return divergences
}

// Exposed for unit tests only.
export const __equivalenceInternals = {
  CANONICAL_PERMISSION,
  isEquivalenceHarnessEnabled,
  isLineageAxisDecision,
  handRolledLineageVerdict,
  canonicalLineageVerdict,
  resolveAwardResources,
}
