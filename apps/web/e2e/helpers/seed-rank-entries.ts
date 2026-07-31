import type { PrismaClient } from "../../.generated/prisma/client"

/**
 * Mirror `syncRankEntryFromAward` for e2e seeds (#376): the app's rank reads
 * resolve from `RankEntry`, so a seeded `RankAward` with no entry renders NO
 * belt at all (the exact firefox/webkit failure class this closes — a seed
 * predating the seam looked correct while the UI showed nothing).
 *
 * Same mapping as the app seam: status collapses IMPORTED → VERIFIED
 * (SESSION_0522), provenance records the origin (historical metadata only,
 * SESSION_0730). Idempotent upsert; teardown needs nothing extra — deleting
 * the award cascades the entry.
 */
export async function seedRankEntriesForAwards(
  prisma: PrismaClient,
  rankAwardIds: string[],
): Promise<void> {
  const awards = await prisma.rankAward.findMany({
    where: { id: { in: rankAwardIds } },
    select: { id: true, passportId: true, rankId: true, verificationStatus: true },
  })
  for (const award of awards) {
    const status =
      award.verificationStatus === "VERIFIED" || award.verificationStatus === "IMPORTED"
        ? ("VERIFIED" as const)
        : award.verificationStatus === "DISPUTED"
          ? ("DISPUTED" as const)
          : ("UNVERIFIED" as const)
    const provenance = award.verificationStatus === "IMPORTED" ? "IMPORTED" : "EARNED"
    await prisma.rankEntry.upsert({
      where: { rankAwardId: award.id },
      create: {
        rankAwardId: award.id,
        passportId: award.passportId,
        rankId: award.rankId,
        status,
        provenance,
      },
      update: { status, provenance },
    })
  }
}
