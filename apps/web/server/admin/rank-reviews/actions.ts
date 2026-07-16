"use server"

import { z } from "zod"
import { adminActionClient } from "~/lib/safe-actions"
import {
  approveCapturedPromoterReview,
  denyCapturedPromoterReview,
} from "~/server/belt/promoter-proposal-core"

const reviewIdSchema = z.object({ reviewId: z.string().min(1) })

const REVIEW_QUEUE_PATH = "/app/belt-reviews"

/**
 * Apply the exact captured promoter proposal and verify the entry in one transaction.
 * The expected active identity/name is a compare-and-swap guard: if accepted provenance
 * changed after capture, approval fails before any write.
 */
export const approveRankEntryReview = adminActionClient
  .inputSchema(reviewIdSchema)
  .action(async ({ parsedInput: { reviewId }, ctx: { db, revalidate, brand, user } }) => {
    const result = await db.$transaction(tx =>
      approveCapturedPromoterReview(tx, reviewId, { brand, userId: user.id }),
    )

    revalidate({
      paths: [REVIEW_QUEUE_PATH, `${REVIEW_QUEUE_PATH}/${reviewId}`, "/lineage", "/app/profile"],
      tags: ["lineage"],
    })
    return result
  })

/**
 * Deny the captured proposal without touching accepted promoter provenance or the entry's
 * prior trust status. The decision and audit are atomic and use the same conditional claim.
 */
export const denyRankEntryReview = adminActionClient
  .inputSchema(reviewIdSchema)
  .action(async ({ parsedInput: { reviewId }, ctx: { db, revalidate, brand, user } }) => {
    const result = await db.$transaction(tx =>
      denyCapturedPromoterReview(tx, reviewId, { brand, userId: user.id }),
    )

    revalidate({
      paths: [REVIEW_QUEUE_PATH, `${REVIEW_QUEUE_PATH}/${reviewId}`, "/app/profile"],
    })
    return result
  })
