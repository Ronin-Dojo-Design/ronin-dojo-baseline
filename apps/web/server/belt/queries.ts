import type { Prisma } from "~/.generated/prisma/client"
import { type GateAward, isFactEditable } from "~/server/belt/belt-gate"
import type { BeltCardOutput } from "~/server/belt/schemas"
import { db } from "~/services/db"

/**
 * Belt-journey read helpers (Slice 3 — Petey Plan 0477).
 *
 * BBL is a BJJ lineage product (Locked #5), so the belt ladder — and therefore
 * the self-promotion ceiling — is discipline-scoped to BJJ. The disciplineId is
 * resolved from the data (`rankSystem.discipline.code = "bjj"`), never hardcoded,
 * mirroring `getBjjRanksForClaimPicker` / `getBeltRanks`.
 */

type BeltDb = Pick<typeof db, "discipline" | "passport" | "rankAward">

/** Awards selected in the shape the gate + card view both consume. */
export const gateAwardSelect = {
  id: true,
  source: true,
  verificationStatus: true,
  awardedAt: true,
  notes: true,
  location: true,
  awardedById: true,
  awardedByPassportId: true,
  organizationId: true,
  rankId: true,
  rank: {
    select: {
      name: true,
      colorHex: true,
      sortOrder: true,
      rankSystem: { select: { disciplineId: true } },
    },
  },
  milestone: {
    select: {
      id: true,
      story: true,
      media: {
        select: { id: true, mediaId: true, purpose: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  },
} satisfies Prisma.RankAwardSelect

export type MemberAward = Prisma.RankAwardGetPayload<{ select: typeof gateAwardSelect }>

/** The gate only needs status + discipline-scoped sortOrder. */
export function toGateAward(
  award: Pick<MemberAward, "id" | "verificationStatus" | "rank">,
): GateAward {
  return {
    id: award.id,
    verificationStatus: award.verificationStatus,
    rank: {
      sortOrder: award.rank.sortOrder,
      rankSystem: award.rank.rankSystem,
    },
  }
}

/**
 * The BJJ disciplineId for this deploy. Cached per process — the discipline row
 * is static seed data. Throws if BJJ is absent (a broken seed, not a user error).
 */
let cachedBjjDisciplineId: string | null | undefined
export async function getBjjDisciplineId(dbClient: BeltDb = db): Promise<string> {
  if (cachedBjjDisciplineId !== undefined && cachedBjjDisciplineId !== null) {
    return cachedBjjDisciplineId
  }
  const discipline = await dbClient.discipline.findFirst({
    where: { code: "bjj" },
    select: { id: true },
  })
  if (!discipline) throw new Error("BJJ_DISCIPLINE_NOT_FOUND")
  cachedBjjDisciplineId = discipline.id
  return discipline.id
}

/** The signed-in user's own Passport id, or throw. Ownership root for every mutation. */
export async function getActingPassportId(userId: string, dbClient: BeltDb = db): Promise<string> {
  const passport = await dbClient.passport.findUnique({
    where: { userId },
    select: { id: true },
  })
  if (!passport) throw new Error("PASSPORT_NOT_FOUND")
  return passport.id
}

/**
 * The member's awards, pre-ordered by `rank.sortOrder desc` — the order
 * `pickTopAwardInDiscipline` / the gate rely on to read the ceiling as the
 * "first in discipline" row.
 */
export async function getMemberAwards(
  passportId: string,
  dbClient: BeltDb = db,
): Promise<MemberAward[]> {
  return dbClient.rankAward.findMany({
    where: { passportId },
    select: gateAwardSelect,
    orderBy: [{ rank: { sortOrder: "desc" } }, { awardedAt: "desc" }],
  })
}

/** Project one award row into the enriched belt card the mutations return. */
export function toBeltCard(award: MemberAward): BeltCardOutput {
  return {
    rankAwardId: award.id,
    rankId: award.rankId,
    rankName: award.rank.name,
    rankSortOrder: award.rank.sortOrder,
    colorHex: award.rank.colorHex,
    verificationStatus: award.verificationStatus,
    isFactEditable: isFactEditable({
      source: award.source,
      verificationStatus: award.verificationStatus,
      awardedById: award.awardedById,
    }),
    awardedAt: award.awardedAt,
    promoterName: award.notes,
    awardedByPassportId: award.awardedByPassportId,
    schoolName: award.location,
    organizationId: award.organizationId,
    milestone: award.milestone
      ? {
          id: award.milestone.id,
          story: award.milestone.story,
          media: award.milestone.media.map(m => ({
            attachmentId: m.id,
            mediaId: m.mediaId,
            purpose: m.purpose,
          })),
        }
      : null,
  }
}
