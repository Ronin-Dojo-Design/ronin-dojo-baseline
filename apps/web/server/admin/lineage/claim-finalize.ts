import { Brand } from "~/.generated/prisma/client"
import {
  bblClaimCompTermDays,
  getLineageCompEntitlementKeys,
  LINEAGE_ELITE_ENTITLEMENT_KEY,
} from "~/lib/entitlements/lineage-comp"
import type { LineageCompGrantSpec } from "~/lib/entitlements/lineage-comp"
import { DIRTY_DOZEN_LABEL } from "~/lib/lineage/dirty-dozen"
import { CLAIM_REVIEW_ERROR } from "~/server/admin/lineage/claim-review-errors"
import { grantComp } from "~/server/entitlements/comp-grants"
import { attachAccount } from "~/server/identity/person-service"

/**
 * Shared APPROVED-branch side-effects for person claims — `finalizePassportClaim`
 * (SESSION_0412 FIX #3; generalized to node-optional at SESSION_0437 / ADR 0036).
 *
 * Every approved person claim (admin review, BBL one-click token-accept, the new
 * unified `reviewPassportClaim`) needs the SAME identity merge + access + comp
 * wiring. This is the single source of that truth so the callers can never drift.
 * The claim is keyed on a **Passport** (identity SoT, ADR 0025); lineage node/tree
 * context is OPTIONAL:
 *
 *   ALWAYS (identity):
 *   - guard the claimant owns no OTHER lineage node (protects the signup-Passport delete),
 *   - attach the claimant account to the claimed Passport (deleting the claimant's
 *     empty signup Passport so the unique account link is free),
 *   - mint the asserted RankAward (FI-006), and
 *   - grant the comp (manual `compOverride` wins for any brand; else BBL auto-comps Elite).
 *
 *   ONLY WHEN node context is present (a lineage claim):
 *   - resolve + require the tree member,
 *   - guard against another claimant already approved for the node,
 *   - grant / repair the NODE_EDITOR access row, and
 *   - detect the Dirty-Dozen cohort for the comp term.
 *
 * A directory-only person (Passport with no LineageNode) therefore gets a REAL
 * identity attach + brand entitlement — this is what un-stubs the old person
 * ProfileClaimRequest approval (ADR 0036 §3).
 *
 * It does NOT mutate the claim row's status, auto-cancel sibling claims, or write
 * the audit log — the caller owns those (see `cancelSiblingPassportClaims` for Gap 2).
 */

/** Prisma transaction client surface (callers pass `tx`). */
type Tx = any

/**
 * The minimal claim shape the finalize needs — caller fetches it inside the tx.
 * Keyed on the Passport; node/tree are optional door context (ADR 0036).
 */
export type FinalizePassportClaimInput = {
  id: string
  claimantUserId: string
  /** Identity key — the Passport being claimed. */
  passportId: string
  /** Current owner of that Passport (null = claimable placeholder). */
  passportUserId: string | null
  // FI-006: rank asserted at claim time; if set, approval creates an awarded RankAward.
  claimedRankId?: string | null
  // Door context — present for a lineage claim, null for a directory-only person.
  treeId?: string | null
  nodeId?: string | null
  /**
   * When the lineage ADMIN path approves a legacy `LineageClaimRequest`, pass its id
   * here so the "another claimant already approved this node" guard (which still reads
   * the legacy table until P5) excludes the row being approved. Unified callers leave
   * this undefined.
   */
  excludeLineageClaimId?: string | null
}

export type FinalizePassportClaimResult = {
  accessGrantId: string | null
  compGrantIds: string[]
  ownershipTransferred: boolean
  passportAccountAttached: boolean
  // FI-006: id of the RankAward created from the claimed rank on approval, or null.
  rankAwardId: string | null
}

/** NODE_EDITOR access grant for a node claim — creates the access row or repairs an existing one. */
const grantNodeEditorAccess = async (
  tx: Tx,
  {
    treeId,
    nodeId,
    memberId,
    claimantUserId,
    actorUserId,
  }: {
    treeId: string
    nodeId: string
    memberId: string
    claimantUserId: string
    actorUserId: string
  },
): Promise<string> => {
  const existingGrant = await tx.lineageTreeAccess.findFirst({
    where: {
      treeId,
      userId: claimantUserId,
      role: "NODE_EDITOR",
      revokedAt: null,
      OR: [{ nodeId }, { memberId }],
    },
    select: { id: true, nodeId: true, memberId: true },
  })

  if (!existingGrant) {
    const grant = await tx.lineageTreeAccess.create({
      data: {
        treeId,
        userId: claimantUserId,
        grantedById: actorUserId,
        role: "NODE_EDITOR",
        nodeId,
        memberId,
      },
      select: { id: true },
    })
    return grant.id
  }

  if (existingGrant.nodeId === nodeId && existingGrant.memberId === memberId) {
    return existingGrant.id
  }

  const repaired = await tx.lineageTreeAccess.update({
    where: { id: existingGrant.id },
    data: { nodeId, memberId },
    select: { id: true },
  })
  return repaired.id
}

/**
 * FI-006 (ADR 0035 §4): mint the claimant's asserted RankAward on the claimed Passport. Idempotent —
 * an existing award for that rank is returned untouched. STATED source + VERIFIED (admin vouched).
 */
const mintAssertedRankAward = async (
  tx: Tx,
  {
    passportId,
    claimedRankId,
    actorUserId,
  }: { passportId: string; claimedRankId: string; actorUserId: string },
): Promise<string> => {
  const existing = await tx.rankAward.findFirst({
    where: { passportId, rankId: claimedRankId },
    select: { id: true },
  })
  if (existing) return existing.id

  const created = await tx.rankAward.create({
    data: {
      passportId,
      rankId: claimedRankId,
      source: "STATED",
      verificationStatus: "VERIFIED",
      awardedById: actorUserId,
    },
    select: { id: true },
  })
  return created.id
}

/**
 * Comp grant: a manual `compOverride` wins for any brand; otherwise BBL auto-comps the Elite tier
 * (Dirty Dozen cohort for life, everyone else one year). No grant for non-BBL without an override.
 */
const grantClaimComp = async (
  tx: Tx,
  {
    brand,
    claimId,
    claimantUserId,
    actorUserId,
    compOverride,
    dirtyDozen,
    now,
  }: {
    brand: Brand
    claimId: string
    claimantUserId: string
    actorUserId: string
    compOverride?: LineageCompGrantSpec | null
    dirtyDozen: boolean
    now: Date
  },
): Promise<string[]> => {
  if (!compOverride && brand !== Brand.BBL) return []

  const entitlementKeys = getLineageCompEntitlementKeys(
    compOverride ? compOverride.tier : LINEAGE_ELITE_ENTITLEMENT_KEY,
  )
  const term = compOverride
    ? compOverride.termDays
      ? { days: compOverride.termDays }
      : null
    : (() => {
        const days = bblClaimCompTermDays(dirtyDozen)
        return days ? { days } : null
      })()

  const compResult = await grantComp({
    db: tx,
    brand,
    grantorUserId: actorUserId,
    granteeUserId: claimantUserId,
    entitlementKeys,
    term,
    reason: `lineage-claim-${claimId}`,
    now,
  })
  return compResult.grants.map((grant: { id: string }) => grant.id)
}

export const finalizePassportClaim = async (
  tx: Tx,
  {
    claim,
    brand,
    actorUserId,
    compOverride,
    now = new Date(),
  }: {
    claim: FinalizePassportClaimInput
    brand: Brand
    actorUserId: string
    /** Admin-supplied manual comp override; takes precedence over the BBL auto-grant. */
    compOverride?: LineageCompGrantSpec | null
    now?: Date
  },
): Promise<FinalizePassportClaimResult> => {
  let accessGrantId: string | null = null
  let compGrantIds: string[] = []
  let ownershipTransferred = false
  let passportAccountAttached = false
  let rankAwardId: string | null = null

  const hasNode = claim.nodeId != null && claim.treeId != null
  const treeId = claim.treeId ?? null
  const nodeId = claim.nodeId ?? null

  // --- Node-only guards + member resolution ------------------------------------------------
  let member: { id: string } | null = null
  if (hasNode) {
    member = await tx.lineageTreeMember.findUnique({
      where: { treeId_nodeId: { treeId: treeId as string, nodeId: nodeId as string } },
      select: { id: true },
    })

    if (!member) {
      throw new Error(CLAIM_REVIEW_ERROR.NODE_NOT_IN_TREE)
    }

    const alreadyApproved = await tx.lineageClaimRequest.findFirst({
      where: {
        treeId: treeId as string,
        nodeId: nodeId as string,
        status: "APPROVED",
        ...(claim.excludeLineageClaimId ? { NOT: { id: claim.excludeLineageClaimId } } : {}),
      },
      select: { id: true, claimantUserId: true },
    })

    if (alreadyApproved && alreadyApproved.claimantUserId !== claim.claimantUserId) {
      throw new Error(CLAIM_REVIEW_ERROR.NODE_ALREADY_APPROVED)
    }
  }

  // The claimant must not already own a DIFFERENT lineage node — ALWAYS checked (a
  // directory-only claim still deletes the claimant's signup Passport below, which would
  // cascade-delete any node that Passport owns). For a node claim, exclude the claimed node.
  const claimantExistingNode = await tx.lineageNode.findFirst({
    where: {
      passport: { userId: claim.claimantUserId },
      ...(nodeId ? { NOT: { id: nodeId } } : {}),
    },
    select: { id: true },
  })

  if (claimantExistingNode) {
    throw new Error(CLAIM_REVIEW_ERROR.CLAIMANT_HAS_NODE)
  }

  // --- Identity attach (ALWAYS) ------------------------------------------------------------
  // D1: attach the claimant account to the claimed Passport. One attach lights up every
  // satellite (profile + node + ranks + affiliations) at once.
  if (claim.passportUserId !== claim.claimantUserId) {
    // Claim merge (SESSION_0392): every signed-up user has a Passport (signup's identity shell).
    // Claiming means "I AM this imported person", so the claimant's own signup Passport is
    // superseded by the richer claimed identity. The CLAIMANT_HAS_NODE guard above already
    // ensured that Passport owns no lineage node; delete it (its empty signup directory profile
    // cascades) so the account is free to bind to the claimed Passport. The claimant User and
    // all account-side CARRY rows (memberships, entitlements, …) are untouched.
    const claimantPassport = await tx.passport.findUnique({
      where: { userId: claim.claimantUserId },
      select: { id: true },
    })
    if (claimantPassport && claimantPassport.id !== claim.passportId) {
      await tx.passport.delete({ where: { id: claimantPassport.id } })
    }

    await attachAccount({ passportId: claim.passportId, userId: claim.claimantUserId }, tx)
    ownershipTransferred = true
    passportAccountAttached = true
  }

  // --- NODE_EDITOR access grant (node claims only) -----------------------------------------
  if (hasNode && member) {
    accessGrantId = await grantNodeEditorAccess(tx, {
      treeId: treeId as string,
      nodeId: nodeId as string,
      memberId: member.id,
      claimantUserId: claim.claimantUserId,
      actorUserId,
    })
  }

  // --- Asserted RankAward (FI-006, ADR 0035 §4) — ALWAYS (keyed on the claimed Passport) ----
  if (claim.claimedRankId) {
    rankAwardId = await mintAssertedRankAward(tx, {
      passportId: claim.passportId,
      claimedRankId: claim.claimedRankId,
      actorUserId,
    })
  }

  // --- Comp grant --------------------------------------------------------------------------
  // Dirty-Dozen cohort drives the BBL comp term; the signal is the claimed node's visual group
  // (a directory-only person with no node defaults to non-DD).
  const dirtyDozen =
    hasNode && member
      ? (
          await tx.lineageTreeMember.findUnique({
            where: { treeId_nodeId: { treeId: treeId as string, nodeId: nodeId as string } },
            select: { visualGroup: { select: { label: true } } },
          })
        )?.visualGroup?.label === DIRTY_DOZEN_LABEL
      : false

  compGrantIds = await grantClaimComp(tx, {
    brand,
    claimId: claim.id,
    claimantUserId: claim.claimantUserId,
    actorUserId,
    compOverride,
    dirtyDozen,
    now,
  })

  return { accessGrantId, compGrantIds, ownershipTransferred, passportAccountAttached, rankAwardId }
}

/**
 * Gap 2 (ADR 0036 §3): when a claim on a Passport is finalized as the winner, auto-cancel every
 * OTHER claimant's open claim (PENDING / NEEDS_INFO) on the same Passport so a won identity can no
 * longer be double-claimed through a second door. Returns the cancelled claim ids. The caller is
 * responsible for the surrounding tx + audit; this only flips status.
 */
export const cancelSiblingPassportClaims = async (
  tx: Tx,
  {
    passportId,
    winnerClaimId,
    reviewerUserId,
    now = new Date(),
  }: { passportId: string; winnerClaimId: string; reviewerUserId: string; now?: Date },
): Promise<string[]> => {
  const siblings = await tx.passportClaimRequest.findMany({
    where: {
      passportId,
      status: { in: ["PENDING", "NEEDS_INFO"] },
      NOT: { id: winnerClaimId },
    },
    select: { id: true },
  })
  if (siblings.length === 0) return []

  await tx.passportClaimRequest.updateMany({
    where: { id: { in: siblings.map((s: { id: string }) => s.id) } },
    data: {
      status: "CANCELLED",
      reviewerNote: `Auto-cancelled: this person was claimed via another request (${winnerClaimId}).`,
      reviewedById: reviewerUserId,
      reviewedAt: now,
    },
  })

  return siblings.map((s: { id: string }) => s.id)
}
