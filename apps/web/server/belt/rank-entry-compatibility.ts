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
  // Immutable origin axis (#375): IMPORTED legacy truth vs EARNED in-app award. Derived on BOTH
  // branches on purpose: `verificationStatus` never crosses the IMPORTED boundary after creation
  // (importers set it at create; `verifyRankEntryInTransaction` skips IMPORTED), so the re-derive
  // is a no-op for a correctly-set row and HEALS a row created outside this seam with the column
  // default (the migration-mirror fixture/backfill case — dropping the update write silently made
  // such IMPORTED awards member-editable). "Immutable" = no path may write a non-derived value.
  // Kept separate from `status`, which stays mutable and collapses IMPORTED → VERIFIED.
  const provenance = award.verificationStatus === "IMPORTED" ? "IMPORTED" : "EARNED"

  await dbClient.rankEntry.upsert({
    where: { rankAwardId },
    create: { rankAwardId, passportId: award.passportId, rankId: award.rankId, status, provenance },
    update: { passportId: award.passportId, rankId: award.rankId, status, provenance },
  })
}
