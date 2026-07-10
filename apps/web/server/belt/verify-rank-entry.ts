"use server"

import { z } from "zod"
import { adminActionClient } from "~/lib/safe-actions"
import { syncRankEntryFromAward } from "~/server/belt/rank-entry-compatibility"

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
    const result = await db.$transaction(async tx => {
      const entry = await tx.rankEntry.findUnique({
        where: { id: rankEntryId },
        select: { id: true, status: true, rankAwardId: true, passportId: true, rankId: true },
      })
      if (!entry) throw new Error("Rank entry not found.")

      const award = await tx.rankAward.findUnique({
        where: { id: entry.rankAwardId },
        select: { id: true, verificationStatus: true },
      })
      if (!award) throw new Error("Underlying rank award not found.")

      // Promote a non-IMPORTED award so its VERIFIED status is durable; IMPORTED keeps
      // its provenance (the mapping already derives it to a VERIFIED entry).
      if (award.verificationStatus !== "IMPORTED" && award.verificationStatus !== "VERIFIED") {
        await tx.rankAward.update({
          where: { id: award.id },
          data: { verificationStatus: "VERIFIED" },
        })
      }

      // Derive the canonical entry from the (now durable) award → VERIFIED.
      await syncRankEntryFromAward(tx, entry.rankAwardId)

      await tx.auditLog.create({
        data: {
          brand,
          action: "belt.entry.verified",
          entityType: "RankEntry",
          entityId: entry.id,
          userId: user.id,
          before: { status: entry.status, awardVerificationStatus: award.verificationStatus },
          after: { status: "VERIFIED" },
        },
      })

      return { rankEntryId: entry.id, passportId: entry.passportId, rankId: entry.rankId }
    })

    revalidate({ paths: ["/lineage", "/app/profile"], tags: ["lineage"] })
    return result
  })
