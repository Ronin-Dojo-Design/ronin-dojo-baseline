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

  await dbClient.rankEntry.upsert({
    where: { rankAwardId },
    create: { rankAwardId, passportId: award.passportId, rankId: award.rankId, status },
    update: { passportId: award.passportId, rankId: award.rankId, status },
  })
}
