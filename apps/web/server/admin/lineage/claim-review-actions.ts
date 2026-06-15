"use server"

import type { Brand, LineageClaimStatus } from "~/.generated/prisma/client"
import { getLineageCompEntitlementKeys } from "~/lib/entitlements/lineage-comp"
import { adminActionClient } from "~/lib/safe-actions"
import { CLAIM_REVIEW_ERROR } from "~/server/admin/lineage/claim-review-errors"
import type { ReviewLineageClaimInput } from "~/server/admin/lineage/claim-review-schemas"
import { reviewLineageClaimSchema } from "~/server/admin/lineage/claim-review-schemas"
import { grantComp } from "~/server/entitlements/comp-grants"
import { attachAccount } from "~/server/identity/person-service"
import type { db as appDb } from "~/services/db"

/**
 * Admin lineage claim review server action.
 *
 * State machine: PENDING | NEEDS_INFO → APPROVED | DENIED | NEEDS_INFO.
 * Terminal states (APPROVED, DENIED, CANCELLED) cannot be re-reviewed.
 *
 * Author: Cody / SESSION_0183 TASK_01.
 */

const REVIEWABLE_STATUSES = ["PENDING", "NEEDS_INFO"] as const

type AppDb = typeof appDb

export type ReviewLineageClaimResult = {
  claimId: string
  status: LineageClaimStatus
  nodeId: string
  accessGrantId: string | null
  compGrantIds: string[]
  ownershipTransferred: boolean
  // Phase 3c (SOT-ADR D1): approving a PERSON claim attaches the claimant account to the node's
  // Passport (`Passport.userId`) rather than moving the node FK or archiving a synthetic placeholder
  // User. `placeholderArchived*` are retired (the placeholder is now an accountless Passport).
  passportAccountAttached: boolean
}

export const applyLineageClaimReview = async ({
  db,
  brand,
  reviewerUserId,
  input,
}: {
  db: AppDb
  brand: Brand
  reviewerUserId: string
  input: ReviewLineageClaimInput
}): Promise<ReviewLineageClaimResult> => {
  return db.$transaction(
    async (tx: any): Promise<ReviewLineageClaimResult> => {
      const claim = await tx.lineageClaimRequest.findFirst({
        where: {
          id: input.claimId,
          tree: { brand },
        },
        select: {
          id: true,
          status: true,
          treeId: true,
          nodeId: true,
          claimantUserId: true,
          node: {
            select: {
              passportId: true,
              passport: { select: { userId: true } },
            },
          },
          _count: { select: { evidence: true } },
        },
      })

      if (!claim) {
        throw new Error(CLAIM_REVIEW_ERROR.NOT_FOUND)
      }

      if (!REVIEWABLE_STATUSES.includes(claim.status as (typeof REVIEWABLE_STATUSES)[number])) {
        throw new Error(CLAIM_REVIEW_ERROR.NOT_REVIEWABLE)
      }

      const before = {
        claimId: claim.id,
        treeId: claim.treeId,
        nodeId: claim.nodeId,
        claimantUserId: claim.claimantUserId,
        status: claim.status,
        evidenceCount: claim._count.evidence,
      }

      let accessGrantId: string | null = null
      let compGrantIds: string[] = []
      let ownershipTransferred = false
      let passportAccountAttached = false
      const reviewTimestamp = new Date()

      if (input.decision === "APPROVED") {
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
          await attachAccount(
            { passportId: claim.node.passportId, userId: claim.claimantUserId },
            tx,
          )
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
              grantedById: reviewerUserId,
              role: "NODE_EDITOR",
              nodeId: claim.nodeId,
              memberId: member.id,
            },
            select: { id: true },
          })

          accessGrantId = grant.id
        }

        if (input.comp) {
          const compResult = await grantComp({
            db: tx,
            brand,
            grantorUserId: reviewerUserId,
            granteeUserId: claim.claimantUserId,
            entitlementKeys: getLineageCompEntitlementKeys(input.comp.tier),
            term: input.comp.termDays ? { days: input.comp.termDays } : null,
            reason: `lineage-claim-${claim.id}`,
            now: reviewTimestamp,
          })
          compGrantIds = compResult.grants.map(grant => grant.id)
        }
      }

      const updated = await tx.lineageClaimRequest.update({
        where: { id: claim.id },
        data: {
          status: input.decision,
          reviewerNote: input.reviewerNote ?? null,
          reviewedById: reviewerUserId,
          reviewedAt: reviewTimestamp,
        },
        select: { id: true, status: true },
      })

      await tx.auditLog.create({
        data: {
          brand,
          action: "lineage.claim.reviewed",
          entityType: "LineageClaimRequest",
          entityId: claim.id,
          userId: reviewerUserId,
          before,
          after: {
            ...before,
            status: updated.status,
            reviewerUserId,
            accessGrantId,
            compGrantIds,
            ownershipTransferred,
            passportAccountAttached,
          },
        },
      })

      return {
        claimId: updated.id,
        status: updated.status,
        nodeId: claim.nodeId,
        accessGrantId,
        compGrantIds,
        ownershipTransferred,
        passportAccountAttached,
      }
    },
    { isolationLevel: "Serializable", maxWait: 30000, timeout: 30000 },
  )
}

export const reviewLineageClaim = adminActionClient
  .inputSchema(reviewLineageClaimSchema)
  .action(async ({ parsedInput, ctx: { user, db, brand } }) => {
    return applyLineageClaimReview({
      db,
      brand,
      reviewerUserId: user.id,
      input: parsedInput,
    })
  })
