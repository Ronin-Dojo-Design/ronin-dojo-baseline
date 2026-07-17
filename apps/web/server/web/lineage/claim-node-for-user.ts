import type { Brand } from "~/.generated/prisma/client"
import {
  cancelSiblingPassportClaims,
  finalizePassportClaim,
} from "~/server/admin/lineage/claim-finalize"
import {
  lockPromoterIdentityMergeScope,
  type PromoterIdentityMergeTx,
} from "~/server/identity/repoint-promoter-identity"
import { CLAIM_ACCEPT_ERROR } from "./claim-accept-errors"

/**
 * Core token-bound lineage claim — "attach node N to user U in brand B" — the SINGLE
 * source of truth shared by every email-proven claim entry point (SESSION_0419).
 *
 * This is the SECURITY BOUNDARY for the emailed claim flow. Possession of the invited
 * email (proven by a verified session OR a consumed magic link) is the identity proof;
 * the node id is never trusted from the URL alone, so this re-validates it server-side.
 *
 * Callers (both run it inside their own `db.$transaction`, Serializable):
 *   - `acceptLineageClaimByToken` — the magic-link callbackURL → `/lineage/claim/accept`
 *     route. The session is the proof; the node id rides the URL.
 *   - `reconcilePendingLineageClaims` — fires from `lib/auth.ts` `hooks.after` on EVERY
 *     successful auth (Google OAuth + magic-link + email sign-up), so a founder who signs
 *     in with Google (the email's *recommended* method, which never carries the node in a
 *     callbackURL) still claims their node. The persisted email→node binding is the proof.
 *
 * Guards (ALL required, mirroring the admin-approve path):
 *   (b) the node is a claimable member (`isClaimable`) of a published, claimable BBL tree.
 *   (c) the node's Passport is still accountless (`passport.userId == null`).
 *   (d) the claimant owns no OTHER lineage node (CLAIMANT_HAS_NODE).
 * (Guard (a) — a signed-in/identified user — is the caller's responsibility.)
 *
 * On success it auto-approves: records a `PassportClaimRequest { status: APPROVED,
 * bypassReason: "email-token" }` (the unified identity-keyed claim, ADR 0036), runs the same
 * `finalizePassportClaim` side-effects + audit log the admin path writes, and Gap-2 auto-cancels
 * any sibling open claims on that Passport. Idempotent: a replay after a successful claim is a
 * no-op success (the node's Passport now belongs to the claimant; `attachAccount` is idempotent).
 */

export const CLAIM_NODE_RESULT = {
  CLAIMED: "claimed",
  ALREADY_CLAIMED: "already-claimed",
} as const

export type ClaimNodeOutcome = (typeof CLAIM_NODE_RESULT)[keyof typeof CLAIM_NODE_RESULT]

export type ClaimNodeResult = {
  outcome: ClaimNodeOutcome
  nodeId: string
  claimId: string
}

type ClaimIdentityNode = {
  id: string
  passportId: string
}

type ClaimIdentityPreflightTx = PromoterIdentityMergeTx & {
  passport: {
    findUnique(args: {
      where: { id?: string; userId?: string }
      select: { id: true; userId?: true }
    }): Promise<{ id: string; userId?: string | null } | null>
  }
}

/** Lock Passport graph before claim writes acquire User FK locks. */
async function preflightClaimIdentityMerge(
  tx: ClaimIdentityPreflightTx,
  { userId, node }: { userId: string; node: ClaimIdentityNode },
): Promise<"continue" | "already-claimed"> {
  const claimantPassport = await tx.passport.findUnique({
    where: { userId },
    select: { id: true },
  })
  if (!claimantPassport || claimantPassport.id === node.passportId) return "continue"

  await lockPromoterIdentityMergeScope(tx, claimantPassport.id, node.passportId)

  // Reads before lock wait can stale. Revalidate both identity roots while full scope stays held.
  const currentClaimantPassport = await tx.passport.findUnique({
    where: { userId },
    select: { id: true },
  })
  const currentClaimedPassport = await tx.passport.findUnique({
    where: { id: node.passportId },
    select: { id: true, userId: true },
  })
  if (!currentClaimedPassport) throw new Error(CLAIM_ACCEPT_ERROR.NODE_NOT_CLAIMABLE)
  if (currentClaimedPassport.userId === userId) return "already-claimed"
  if (currentClaimedPassport.userId) throw new Error(CLAIM_ACCEPT_ERROR.ALREADY_OWNED_BY_OTHER)
  if (currentClaimantPassport?.id !== claimantPassport.id) {
    throw new Error("Account identity changed during claim acceptance. Retry the operation.")
  }
  return "continue"
}

export async function claimNodeForUser(
  // biome-ignore lint/suspicious/noExplicitAny: Prisma `$transaction` tx client, matching the callers.
  tx: any,
  {
    userId,
    nodeId,
    brand,
    now = new Date(),
  }: { userId: string; nodeId: string; brand: Brand; now?: Date },
): Promise<ClaimNodeResult> {
  // (b) The node must be a claimable member of a published, claimable, brand-scoped tree.
  // Resolve it via the tree↔member↔node join so the bare `nodeId` is fully re-validated.
  const member = await tx.lineageTreeMember.findFirst({
    where: {
      nodeId,
      isClaimable: true,
      tree: { brand, isPublished: true, isClaimable: true },
    },
    select: {
      tree: { select: { id: true } },
      node: {
        select: {
          id: true,
          passportId: true,
          passport: { select: { userId: true } },
        },
      },
    },
  })

  if (!member) {
    throw new Error(CLAIM_ACCEPT_ERROR.NODE_NOT_CLAIMABLE)
  }

  const treeId = member.tree.id
  const node = member.node
  const alreadyClaimedResult = async (): Promise<ClaimNodeResult> => {
    const existing = await tx.passportClaimRequest.findFirst({
      where: { passportId: node.passportId, claimantUserId: userId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    })
    return {
      outcome: CLAIM_NODE_RESULT.ALREADY_CLAIMED,
      nodeId: node.id,
      claimId: existing?.id ?? "",
    }
  }

  // (c) Idempotency + accountless guard. If the node's Passport already belongs to THIS
  // claimant, a prior click already succeeded — return a no-op success. If it belongs to
  // someone ELSE, the node is taken.
  if (node.passport.userId) {
    if (node.passport.userId === userId) {
      return alreadyClaimedResult()
    }
    throw new Error(CLAIM_ACCEPT_ERROR.ALREADY_OWNED_BY_OTHER)
  }

  // (d) The claimant must not already own a DIFFERENT lineage node (mirror CLAIMANT_HAS_NODE).
  // `finalizeLineageNodeClaim` re-checks this too, but checking here surfaces the friendlier
  // accept-flow error before any writes.
  const claimantExistingNode = await tx.lineageNode.findFirst({
    where: { passport: { userId }, NOT: { id: node.id } },
    select: { id: true },
  })
  if (claimantExistingNode) {
    throw new Error(CLAIM_ACCEPT_ERROR.CLAIMANT_HAS_NODE)
  }

  // Reuse a non-terminal unified claim for (passport, claimant) if one exists; otherwise mint an
  // auto-approved `PassportClaimRequest`. The email is the identity proof, so we go straight to
  // APPROVED with a `bypassReason` for the audit trail (ADR 0036 — one identity-keyed record).
  const reusable = await tx.passportClaimRequest.findFirst({
    where: {
      passportId: node.passportId,
      claimantUserId: userId,
      status: { in: ["PENDING", "NEEDS_INFO"] },
    },
    orderBy: { createdAt: "desc" },
    // SESSION_0442: carry the wizard's registered lineage selections (if this reusable claim was
    // created via the join wizard) so the one-click accept materializes them like the admin path.
    select: {
      id: true,
      claimedSchoolId: true,
      trainedUnderNodeId: true,
      representTreeId: true,
    },
  })

  // The claim write below references User through both claimantUserId and reviewedById. PostgreSQL
  // holds FK KEY SHARE locks until this Serializable transaction ends, so acquire the canonical
  // Passport→Award→Review merge scope first. Otherwise account deletion can hold the signup
  // Passport while waiting for this User, as this transaction waits for that same Passport.
  const identityPreflight = await preflightClaimIdentityMerge(tx, { userId, node })
  if (identityPreflight === "already-claimed") return alreadyClaimedResult()

  const claim = reusable
    ? await tx.passportClaimRequest.update({
        where: { id: reusable.id },
        data: {
          status: "APPROVED",
          bypassReason: "email-token",
          nodeId: node.id,
          treeId,
          reviewedById: userId,
          reviewedAt: now,
        },
        select: { id: true },
      })
    : await tx.passportClaimRequest.create({
        data: {
          passportId: node.passportId,
          treeId,
          nodeId: node.id,
          claimantUserId: userId,
          brand,
          status: "APPROVED",
          bypassReason: "email-token",
          reviewedById: userId,
          reviewedAt: now,
        },
        select: { id: true },
      })

  const before = {
    claimId: claim.id,
    treeId,
    nodeId: node.id,
    passportId: node.passportId,
    claimantUserId: userId,
    status: "PENDING",
    evidenceCount: 0,
  }

  const finalized = await finalizePassportClaim(tx, {
    claim: {
      id: claim.id,
      claimantUserId: userId,
      passportId: node.passportId,
      passportUserId: node.passport.userId,
      claimedSchoolId: reusable?.claimedSchoolId ?? null,
      trainedUnderNodeId: reusable?.trainedUnderNodeId ?? null,
      representTreeId: reusable?.representTreeId ?? null,
      treeId,
      nodeId: node.id,
    },
    brand,
    actorUserId: userId,
    now,
  })

  // Gap 2 (ADR 0036): a won Passport auto-cancels any other open claim on it (e.g. a directory-door
  // claim filed before the email arrived).
  await cancelSiblingPassportClaims(tx, {
    passportId: node.passportId,
    winnerClaimId: claim.id,
    reviewerUserId: userId,
    now,
  })

  // Same audit shape the admin path writes — actor is the claimant (self-approve via token).
  await tx.auditLog.create({
    data: {
      brand,
      action: "lineage.claim.reviewed",
      entityType: "PassportClaimRequest",
      entityId: claim.id,
      userId,
      before,
      after: {
        ...before,
        status: "APPROVED",
        reviewerUserId: userId,
        bypassReason: "email-token",
        accessGrantId: finalized.accessGrantId,
        compGrantIds: finalized.compGrantIds,
        ownershipTransferred: finalized.ownershipTransferred,
        passportAccountAttached: finalized.passportAccountAttached,
      },
    },
  })

  return {
    outcome: CLAIM_NODE_RESULT.CLAIMED,
    nodeId: node.id,
    claimId: claim.id,
  }
}
