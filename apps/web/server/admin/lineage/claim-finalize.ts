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
 * Shared APPROVED-branch side-effects for lineage claims (SESSION_0412 FIX #3).
 *
 * Both the admin review path (`applyLineageClaimReview`) and the BBL one-click
 * token-accept path (`acceptLineageClaimByToken`) need the SAME identity merge +
 * access + comp wiring when a claim is approved. This is the single source of
 * that truth so the two callers can never drift:
 *
 *   1. resolve the node's tree member (it must be a member of the tree),
 *   2. guard against another claimant already approved for the node,
 *   3. guard against the claimant already owning a *different* node,
 *   4. attach the claimant account to the node's Passport (deleting the
 *      claimant's empty signup Passport so the unique account link is free),
 *   5. grant / repair the NODE_EDITOR access row,
 *   6. grant the comp (a manual `compOverride` wins for any brand; otherwise BBL
 *      auto-comps the Elite tier — Dirty Dozen for life, everyone else 1yr).
 *
 * It does NOT mutate the claim row's status or write the `lineage.claim.reviewed`
 * audit log — the caller owns those (the admin path records the reviewer note /
 * timestamp; the token path records the email-token bypass), so each can stamp
 * its own actor + before/after snapshot.
 */

/** Prisma transaction client surface (callers pass `tx`). */
type Tx = any

/** The minimal claim shape the finalize needs — caller fetches it inside the tx. */
export type FinalizeClaimInput = {
  id: string
  treeId: string
  nodeId: string
  claimantUserId: string
  node: {
    passportId: string
    passport: { userId: string | null }
  }
}

export type FinalizeLineageNodeClaimResult = {
  accessGrantId: string | null
  compGrantIds: string[]
  ownershipTransferred: boolean
  passportAccountAttached: boolean
}

export const finalizeLineageNodeClaim = async (
  tx: Tx,
  {
    claim,
    brand,
    actorUserId,
    compOverride,
    now = new Date(),
  }: {
    claim: FinalizeClaimInput
    brand: Brand
    actorUserId: string
    /** Admin-supplied manual comp override; takes precedence over the BBL auto-grant. */
    compOverride?: LineageCompGrantSpec | null
    now?: Date
  },
): Promise<FinalizeLineageNodeClaimResult> => {
  let accessGrantId: string | null = null
  let compGrantIds: string[] = []
  let ownershipTransferred = false
  let passportAccountAttached = false

  const member = await tx.lineageTreeMember.findUnique({
    where: { treeId_nodeId: { treeId: claim.treeId, nodeId: claim.nodeId } },
    select: { id: true },
  })

  if (!member) {
    throw new Error(CLAIM_REVIEW_ERROR.NODE_NOT_IN_TREE)
  }

  const alreadyApproved = await tx.lineageClaimRequest.findFirst({
    where: {
      treeId: claim.treeId,
      nodeId: claim.nodeId,
      status: "APPROVED",
      NOT: { id: claim.id },
    },
    select: { id: true, claimantUserId: true },
  })

  if (alreadyApproved && alreadyApproved.claimantUserId !== claim.claimantUserId) {
    throw new Error(CLAIM_REVIEW_ERROR.NODE_ALREADY_APPROVED)
  }

  const claimantExistingNode = await tx.lineageNode.findFirst({
    where: {
      passport: { userId: claim.claimantUserId },
      NOT: { id: claim.nodeId },
    },
    select: { id: true },
  })

  if (claimantExistingNode) {
    throw new Error(CLAIM_REVIEW_ERROR.CLAIMANT_HAS_NODE)
  }

  // D1: attach the claimant account to the node's Passport (the node never moves). One attach
  // lights up every satellite (profile + node + ranks + affiliations) at once.
  if (claim.node.passport.userId !== claim.claimantUserId) {
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
    if (claimantPassport && claimantPassport.id !== claim.node.passportId) {
      await tx.passport.delete({ where: { id: claimantPassport.id } })
    }

    await attachAccount({ passportId: claim.node.passportId, userId: claim.claimantUserId }, tx)
    ownershipTransferred = true
    passportAccountAttached = true
  }

  const existingGrant = await tx.lineageTreeAccess.findFirst({
    where: {
      treeId: claim.treeId,
      userId: claim.claimantUserId,
      role: "NODE_EDITOR",
      revokedAt: null,
      OR: [{ nodeId: claim.nodeId }, { memberId: member.id }],
    },
    select: { id: true, nodeId: true, memberId: true },
  })

  if (existingGrant) {
    const repairedGrant =
      existingGrant.nodeId === claim.nodeId && existingGrant.memberId === member.id
        ? existingGrant
        : await tx.lineageTreeAccess.update({
            where: { id: existingGrant.id },
            data: {
              nodeId: claim.nodeId,
              memberId: member.id,
            },
            select: { id: true },
          })

    accessGrantId = repairedGrant.id
  } else {
    const grant = await tx.lineageTreeAccess.create({
      data: {
        treeId: claim.treeId,
        userId: claim.claimantUserId,
        grantedById: actorUserId,
        role: "NODE_EDITOR",
        nodeId: claim.nodeId,
        memberId: member.id,
      },
      select: { id: true },
    })

    accessGrantId = grant.id
  }

  if (compOverride) {
    // Manual admin comp override (any brand) — takes precedence over the BBL auto-grant.
    const compResult = await grantComp({
      db: tx,
      brand,
      grantorUserId: actorUserId,
      granteeUserId: claim.claimantUserId,
      entitlementKeys: getLineageCompEntitlementKeys(compOverride.tier),
      term: compOverride.termDays ? { days: compOverride.termDays } : null,
      reason: `lineage-claim-${claim.id}`,
      now,
    })
    compGrantIds = compResult.grants.map((grant: { id: string }) => grant.id)
  } else if (brand === Brand.BBL) {
    // BBL "comp gift" epic (SESSION_0403): claiming an imported placeholder
    // Passport comps the Elite tier — Dirty Dozen cohort for life, everyone
    // else for one year. Detected off the claimed node's visual-group cohort.
    const cohortMember = await tx.lineageTreeMember.findUnique({
      where: { treeId_nodeId: { treeId: claim.treeId, nodeId: claim.nodeId } },
      select: { visualGroup: { select: { label: true } } },
    })
    const isDirtyDozen = cohortMember?.visualGroup?.label === DIRTY_DOZEN_LABEL

    const compResult = await grantComp({
      db: tx,
      brand,
      grantorUserId: actorUserId,
      granteeUserId: claim.claimantUserId,
      entitlementKeys: getLineageCompEntitlementKeys(LINEAGE_ELITE_ENTITLEMENT_KEY),
      term: (() => {
        const days = bblClaimCompTermDays(isDirtyDozen)
        return days ? { days } : null
      })(),
      reason: `lineage-claim-${claim.id}`,
      now,
    })
    compGrantIds = compResult.grants.map((grant: { id: string }) => grant.id)
  }

  return { accessGrantId, compGrantIds, ownershipTransferred, passportAccountAttached }
}
