/**
 * @added   SESSION_0520 (2026-07-09)
 * @why     Mirror transitional RankAward writes into RankEntry while keeping trust axes distinct
 * @wired   server/belt/router.ts, server/belt/promoter-proposal-core.ts, server/belt/rank-entry-trust-axes.ts, e2e/helpers/seed-rank-entries.ts
 */
import { deriveRankEntryTrustAxesFromAwardStatus } from "~/server/belt/rank-entry-trust-axes"
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

  const { status, provenance } = deriveRankEntryTrustAxesFromAwardStatus(award.verificationStatus)
  // Immutable origin axis (#375): IMPORTED (one-time WP self-report migration) vs EARNED in-app.
  // Derived on BOTH branches on purpose: `verificationStatus` never crosses the IMPORTED boundary
  // after creation (importers set it at create; `verifyRankEntryInTransaction` skips IMPORTED;
  // member promoter transitions preserve IMPORTED — SESSION_0730), so the re-derive is a no-op for
  // a correctly-set row and HEALS a row created outside this seam with the column default.
  // "Immutable" = no path may write a non-derived value. Historical metadata only — it locks
  // nothing (SESSION_0730). Kept separate from `status` (mutable; collapses IMPORTED → VERIFIED).
  await dbClient.rankEntry.upsert({
    where: { rankAwardId },
    create: { rankAwardId, passportId: award.passportId, rankId: award.rankId, status, provenance },
    update: { passportId: award.passportId, rankId: award.rankId, status, provenance },
  })
}
