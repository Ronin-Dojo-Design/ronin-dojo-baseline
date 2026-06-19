"use server"

import { z } from "zod"
import { getRequestBrand } from "~/lib/brand-context"
import { userActionClient } from "~/lib/safe-actions"
import { databaseIdSchema } from "~/lib/validation/id"
import { finalizeLineageNodeClaim } from "~/server/admin/lineage/claim-finalize"
import { CLAIM_ACCEPT_ERROR } from "./claim-accept-errors"

/**
 * BBL one-click token-bound claim accept (SESSION_0412 FIX #3).
 *
 * This is the SECURITY BOUNDARY for the emailed magic-link claim flow. The magic
 * link proves the recipient controls the email address we sent the claim to, so
 * arriving here with a valid session means "the email owner is signed in". The
 * node id rides the magic-link `callbackURL` (binding design A1 — no token
 * table), so it MUST be re-validated server-side; never trust the URL alone.
 *
 * Guards (ALL required, mirroring the admin-approve path):
 *   (a) a signed-in session — enforced by `userActionClient`.
 *   (b) the node is a claimable member (`isClaimable`) of a published, claimable
 *       BBL `LineageTree`.
 *   (c) the node's Passport is still accountless (`passport.userId == null`).
 *   (d) the claimant owns no OTHER lineage node (the CLAIMANT_HAS_NODE guard).
 *
 * On success it auto-approves: the magic link is the proof of identity, so we
 * record a `LineageClaimRequest { status: APPROVED, bypassReason: "email-token" }`
 * for audit parity and run the same finalize side-effects + audit log the admin
 * path writes. Idempotent: a replay after a successful claim is a no-op success
 * (the node's Passport now belongs to the claimant; `attachAccount` is idempotent).
 */

const CLAIM_ACCEPT_RESULT = {
  CLAIMED: "claimed",
  ALREADY_CLAIMED: "already-claimed",
} as const

type ClaimAcceptOutcome = (typeof CLAIM_ACCEPT_RESULT)[keyof typeof CLAIM_ACCEPT_RESULT]

const acceptLineageClaimSchema = z.object({
  nodeId: databaseIdSchema,
})

type AcceptLineageClaimResult = {
  outcome: ClaimAcceptOutcome
  nodeId: string
  claimId: string
}

export const acceptLineageClaimByToken = userActionClient
  .inputSchema(acceptLineageClaimSchema)
  .action(async ({ parsedInput, ctx: { user, db } }): Promise<AcceptLineageClaimResult> => {
    const brand = await getRequestBrand()

    return db.$transaction(
      async (tx: any): Promise<AcceptLineageClaimResult> => {
        // (b) The node must be a claimable member of a published, claimable, brand-scoped tree.
        // Resolve it via the tree↔member↔node join so the URL's bare `nodeId` is fully re-validated.
        const member = await tx.lineageTreeMember.findFirst({
          where: {
            nodeId: parsedInput.nodeId,
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

        // (c) Idempotency + accountless guard. If the node's Passport already belongs to THIS
        // claimant, a prior click already succeeded — return a no-op success. If it belongs to
        // someone ELSE, the node is taken.
        if (node.passport.userId) {
          if (node.passport.userId === user.id) {
            const existing = await tx.lineageClaimRequest.findFirst({
              where: {
                treeId,
                nodeId: node.id,
                claimantUserId: user.id,
                status: "APPROVED",
              },
              orderBy: { createdAt: "desc" },
              select: { id: true },
            })
            return {
              outcome: CLAIM_ACCEPT_RESULT.ALREADY_CLAIMED,
              nodeId: node.id,
              claimId: existing?.id ?? "",
            }
          }
          throw new Error(CLAIM_ACCEPT_ERROR.ALREADY_OWNED_BY_OTHER)
        }

        // (d) The claimant must not already own a DIFFERENT lineage node (mirror CLAIMANT_HAS_NODE).
        // `finalizeLineageNodeClaim` re-checks this too, but checking here lets us surface the
        // friendlier accept-flow error before doing any writes.
        const claimantExistingNode = await tx.lineageNode.findFirst({
          where: {
            passport: { userId: user.id },
            NOT: { id: node.id },
          },
          select: { id: true },
        })
        if (claimantExistingNode) {
          throw new Error(CLAIM_ACCEPT_ERROR.CLAIMANT_HAS_NODE)
        }

        // Reuse a non-terminal claim for (node, claimant) if one exists (e.g. the user already
        // started the form flow); otherwise mint an auto-approved one. The magic link is the
        // identity proof, so we go straight to APPROVED with a `bypassReason` for the audit trail.
        const reusable = await tx.lineageClaimRequest.findFirst({
          where: {
            treeId,
            nodeId: node.id,
            claimantUserId: user.id,
            status: { in: ["PENDING", "NEEDS_INFO"] },
          },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        })

        const now = new Date()

        const claim = reusable
          ? await tx.lineageClaimRequest.update({
              where: { id: reusable.id },
              data: {
                status: "APPROVED",
                bypassReason: "email-token",
                reviewedById: user.id,
                reviewedAt: now,
              },
              select: { id: true },
            })
          : await tx.lineageClaimRequest.create({
              data: {
                treeId,
                nodeId: node.id,
                claimantUserId: user.id,
                status: "APPROVED",
                bypassReason: "email-token",
                reviewedById: user.id,
                reviewedAt: now,
              },
              select: { id: true },
            })

        const before = {
          claimId: claim.id,
          treeId,
          nodeId: node.id,
          claimantUserId: user.id,
          status: "PENDING",
          evidenceCount: 0,
        }

        const finalized = await finalizeLineageNodeClaim(tx, {
          claim: {
            id: claim.id,
            treeId,
            nodeId: node.id,
            claimantUserId: user.id,
            node: { passportId: node.passportId, passport: { userId: node.passport.userId } },
          },
          brand,
          actorUserId: user.id,
          now,
        })

        // Same audit shape the admin path writes — actor is the claimant (self-approve via token).
        await tx.auditLog.create({
          data: {
            brand,
            action: "lineage.claim.reviewed",
            entityType: "LineageClaimRequest",
            entityId: claim.id,
            userId: user.id,
            before,
            after: {
              ...before,
              status: "APPROVED",
              reviewerUserId: user.id,
              bypassReason: "email-token",
              accessGrantId: finalized.accessGrantId,
              compGrantIds: finalized.compGrantIds,
              ownershipTransferred: finalized.ownershipTransferred,
              passportAccountAttached: finalized.passportAccountAttached,
            },
          },
        })

        return {
          outcome: CLAIM_ACCEPT_RESULT.CLAIMED,
          nodeId: node.id,
          claimId: claim.id,
        }
      },
      { isolationLevel: "Serializable", maxWait: 30000, timeout: 30000 },
    )
  })
