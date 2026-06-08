"use server"

import type { Brand, LineageClaimStatus } from "~/.generated/prisma/client"
import { getLineageCompEntitlementKeys } from "~/lib/entitlements/lineage-comp"
import { adminActionClient } from "~/lib/safe-actions"
import { CLAIM_REVIEW_ERROR } from "~/server/admin/lineage/claim-review-errors"
import type { ReviewLineageClaimInput } from "~/server/admin/lineage/claim-review-schemas"
import { reviewLineageClaimSchema } from "~/server/admin/lineage/claim-review-schemas"
import { grantComp } from "~/server/entitlements/comp-grants"
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
  placeholderArchivedUserId: string | null
  placeholderArchivedAt: Date | null
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
              userId: true,
              user: {
                select: {
                  id: true,
                  isPlaceholder: true,
                  archivedAt: true,
                },
              },
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
      let placeholderArchivedUserId: string | null = null
      let placeholderArchivedAt: Date | null = null
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
            userId: claim.claimantUserId,
            NOT: { id: claim.nodeId },
          },
          select: { id: true },
        })

        if (claimantExistingNode) {
          throw new Error(CLAIM_REVIEW_ERROR.CLAIMANT_HAS_NODE)
        }

        if (claim.node.userId !== claim.claimantUserId) {
          await tx.lineageNode.update({
            where: { id: claim.nodeId },
            data: { userId: claim.claimantUserId },
          })
          ownershipTransferred = true

          if (claim.node.user.isPlaceholder) {
            placeholderArchivedUserId = claim.node.userId

            if (claim.node.user.archivedAt) {
              placeholderArchivedAt = claim.node.user.archivedAt
            } else {
              const archivedUser = await tx.user.update({
                where: { id: claim.node.userId },
                data: { archivedAt: reviewTimestamp },
                select: { archivedAt: true },
              })
              placeholderArchivedAt = archivedUser.archivedAt
            }
          }
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
            placeholderArchivedUserId,
            placeholderArchivedAt: placeholderArchivedAt?.toISOString() ?? null,
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
        placeholderArchivedUserId,
        placeholderArchivedAt,
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
