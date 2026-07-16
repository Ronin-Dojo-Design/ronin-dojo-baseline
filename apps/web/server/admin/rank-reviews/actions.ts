"use server"

import { z } from "zod"
import { RankEntryReviewStatus } from "~/.generated/prisma/client"
import { adminActionClient } from "~/lib/safe-actions"
import { verifyRankEntryInTransaction } from "~/server/belt/verify-rank-entry"
import type { db } from "~/services/db"

const reviewIdSchema = z.object({ reviewId: z.string().min(1) })

const REVIEW_QUEUE_PATH = "/app/belt-reviews"

/**
 * Load a PENDING review by id inside `tx`, or throw a friendly error. Guards against
 * double-actioning: a review already APPROVED/DENIED (e.g. superseded by a now-matching
 * promoter, or actioned in another tab) can't be re-decided. Typed on the `rankEntryReview`
 * slice so an interactive `$transaction` client satisfies it.
 */
async function loadPendingReview(tx: Pick<typeof db, "rankEntryReview">, reviewId: string) {
  const review = await tx.rankEntryReview.findUnique({
    where: { id: reviewId },
    select: { id: true, status: true, rankEntryId: true },
  })
  if (!review) throw new Error("Review not found.")
  if (review.status !== RankEntryReviewStatus.PENDING) {
    throw new Error("This review has already been actioned.")
  }
  return review
}

/**
 * APPROVE a PENDING `PROMOTER_CHANGED` review (G-010): verify the linked RankEntry via the
 * shared `verifyRankEntryInTransaction` seam (UNVERIFIED → VERIFIED, promoting a non-IMPORTED
 * award durably), then flip the review row → APPROVED. Both writes plus the audit ride ONE
 * transaction so a partial approve can't leave a verified entry beside a still-PENDING review.
 * Audited (`belt.review.approved`), mirroring the `belt.fact.updated` admin-mutation pattern.
 *
 * Authorization: `adminActionClient` — a platform admin holds `belt.admin` via the `"*"` grant
 * (repo rule: reuse the existing role system, never a 5th authz).
 */
export const approveRankEntryReview = adminActionClient
  .inputSchema(reviewIdSchema)
  .action(async ({ parsedInput: { reviewId }, ctx: { db, revalidate, brand, user } }) => {
    const result = await db.$transaction(async tx => {
      const review = await loadPendingReview(tx, reviewId)

      await verifyRankEntryInTransaction(tx, review.rankEntryId, { brand, userId: user.id })

      await tx.rankEntryReview.update({
        where: { id: review.id },
        data: { status: RankEntryReviewStatus.APPROVED },
      })

      await tx.auditLog.create({
        data: {
          brand,
          action: "belt.review.approved",
          entityType: "RankEntryReview",
          entityId: review.id,
          userId: user.id,
          before: { status: review.status },
          after: { status: RankEntryReviewStatus.APPROVED },
        },
      })

      return { reviewId: review.id }
    })

    // Queue path (drops the actioned row) plus the entry's public/member surfaces (now VERIFIED).
    revalidate({ paths: [REVIEW_QUEUE_PATH, "/lineage", "/app/profile"], tags: ["lineage"] })
    return result
  })

/**
 * DISMISS a PENDING `PROMOTER_CHANGED` review (G-010): set the review row → DENIED WITHOUT
 * touching the entry's verification (the changed promoter was reviewed and rejected — the belt
 * stays as-is). Audited (`belt.review.dismissed`). Same authz + audit shape as approve.
 */
export const dismissRankEntryReview = adminActionClient
  .inputSchema(reviewIdSchema)
  .action(async ({ parsedInput: { reviewId }, ctx: { db, revalidate, brand, user } }) => {
    const result = await db.$transaction(async tx => {
      const review = await loadPendingReview(tx, reviewId)

      await tx.rankEntryReview.update({
        where: { id: review.id },
        data: { status: RankEntryReviewStatus.DENIED },
      })

      await tx.auditLog.create({
        data: {
          brand,
          action: "belt.review.dismissed",
          entityType: "RankEntryReview",
          entityId: review.id,
          userId: user.id,
          before: { status: review.status },
          after: { status: RankEntryReviewStatus.DENIED },
        },
      })

      return { reviewId: review.id }
    })

    revalidate({ paths: [REVIEW_QUEUE_PATH] })
    return result
  })
