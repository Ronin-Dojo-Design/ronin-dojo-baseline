"use server"

import { z } from "zod"
import { adminActionClient } from "~/lib/safe-actions"
import { verifyRankEntryInTransaction } from "~/server/belt/verify-rank-entry-core"

const verifyRankEntrySchema = z.object({
  rankEntryId: z.string().min(1),
})

/**
 * Steward "Verify" affordance (SESSION_0522) — flip a member's RankEntry
 * UNVERIFIED → VERIFIED. This is the ONLY reachable path to verify a self-submit belt:
 * a join-signup's declared belt lands UNVERIFIED (see `place-lead-core.ts`), and the
 * `RankEntryReview` workflow is unwired.
 *
 * Authorization: `adminActionClient`. A platform admin holds `belt.admin` via the `*`
 * grant (repo rule: reuse the existing role system, never a 5th authz — the admin
 * client IS the `belt.admin` gate).
 *
 * Durability: for a NON-IMPORTED underlying award we promote
 * `RankAward.verificationStatus → VERIFIED` so the derived entry stays VERIFIED across
 * future syncs. IMPORTED awards keep their provenance (belt-gate still treats them as
 * authority-owned / read-only, and `rankEntryStatusForAward` already derives them to
 * VERIFIED). Idempotent: re-verifying a VERIFIED entry is a no-op end-state. Audited.
 */
export const verifyRankEntry = adminActionClient
  .inputSchema(verifyRankEntrySchema)
  .action(async ({ parsedInput: { rankEntryId }, ctx: { db, revalidate, brand, user } }) => {
    const result = await db.$transaction(tx =>
      verifyRankEntryInTransaction(tx, rankEntryId, { brand, userId: user.id }),
    )

    revalidate({ paths: ["/lineage", "/app/profile"], tags: ["lineage"] })
    return result
  })
