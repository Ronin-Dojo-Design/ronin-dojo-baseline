/**
 * @added   SESSION_0541 (2026-07-15)
 * @why     Expose steward-authorized promoter-review decisions through the existing safe-action boundary
 * @wired   app/app/belt-reviews/[reviewId]/page.tsx
 */
"use server"

import { z } from "zod"
import { Brand } from "~/.generated/prisma/client"
import { userActionClient } from "~/lib/safe-actions"
import { databaseIdSchema } from "~/lib/validation/id"
import {
  approveCapturedPromoterReview,
  denyCapturedPromoterReview,
} from "~/server/belt/promoter-proposal-core"
import { can } from "~/server/orpc/permissions"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

const reviewIdSchema = z.object({ reviewId: databaseIdSchema })

const REVIEW_QUEUE_PATH = "/app/belt-reviews"

/** Keep the mutation door identical to the queue layout's `requirePermission` gate. */
const beltReviewActionClient = userActionClient.use(async ({ next, ctx }) => {
  if (!can(ctx.user, APP_AREA_PERMISSIONS.beltReviews)) {
    throw new Error("User not authorized")
  }

  return next({ ctx: { brand: Brand.BBL } })
})

/**
 * Apply the exact captured promoter proposal and verify the entry in one transaction.
 * The expected active identity/name is a compare-and-swap guard: if accepted provenance
 * changed after capture, approval fails before any write.
 */
export const approveRankEntryReview = beltReviewActionClient
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
export const denyRankEntryReview = beltReviewActionClient
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
