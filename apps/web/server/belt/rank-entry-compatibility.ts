import { rankEntryStatusForAward } from "~/server/belt/queries"
import type { db } from "~/services/db"

export type RankEntryCompatibilityDb = Pick<typeof db, "rankAward" | "rankEntry">

/**
 * Synchronize the canonical RankEntry aggregate from its temporary RankAward
 * compatibility anchor.
 *
 * Callers must pass their current Prisma transaction client. Requiring the
 * client keeps the legacy fact write and canonical aggregate update atomic;
 * this helper deliberately has no default connection that could escape the
 * caller's transaction.
 */
export async function syncRankEntryFromAward(
  dbClient: RankEntryCompatibilityDb,
  rankAwardId: string,
): Promise<void> {
  const award = await dbClient.rankAward.findUniqueOrThrow({
    where: { id: rankAwardId },
    select: { passportId: true, rankId: true, verificationStatus: true },
  })

  const status = rankEntryStatusForAward(award.verificationStatus)
  // Immutable origin axis (#375): IMPORTED legacy truth vs EARNED in-app award. Set the same way
  // on create and update — the value never changes for a given anchor, but keeping it on both
  // branches means an entry that predates this column is corrected the next time it syncs. Kept
  // separate from `status`, which collapses IMPORTED → VERIFIED for presentation trust.
  const provenance = award.verificationStatus === "IMPORTED" ? "IMPORTED" : "EARNED"

  await dbClient.rankEntry.upsert({
    where: { rankAwardId },
    create: { rankAwardId, passportId: award.passportId, rankId: award.rankId, status, provenance },
    update: { passportId: award.passportId, rankId: award.rankId, status, provenance },
  })
}
