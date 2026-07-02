import type { Brand } from "~/.generated/prisma/client"
import { resolveOwnedMedia } from "~/server/media/media-ownership"
import { pickTopAwardInDiscipline } from "~/server/web/lineage/node-profile-queries"

/**
 * Belt-promotion claim core (petey-plan-0477 Slice V2; ADR 0035 Amendment 1 / ADR 0036).
 *
 * The B1 (claim-record) on-ramp for a self-declared belt: an already-owned member
 * asserts a belt ABOVE their verified ceiling, and it lands as a `RANK_PROMOTION`
 * `PassportClaimRequest` — NOT as a `RankAward`. Approve (Slice V3) mints the VERIFIED
 * award via `finalizePassportClaim`; a pending belt never exists as an award, so it can
 * never leak onto the tree as awarded truth (ADR 0035 §4/§5 reaffirmed — no UNVERIFIED
 * awards, no per-belt display axis).
 *
 * Own-only by construction: the caller's Passport is derived from `claimantUserId`
 * (never a passed `passportId`), so a member can only ever file a promotion for
 * themselves. Enriching a belt AT/below the ceiling is backfill (Slice V4), not a
 * promotion — this core rejects it (`NOT_A_PROMOTION`) and the UI routes it there.
 */

export const SUBMIT_RANK_PROMOTION_CLAIM_ERROR = {
  PASSPORT_NOT_FOUND: "Finish setting up your profile before requesting a belt promotion.",
  RANK_NOT_FOUND: "That belt no longer exists.",
  NOT_A_PROMOTION:
    "That belt is at or below your verified rank — add its story from your Belt Journey instead.",
  DUPLICATE_OPEN_PROMOTION: "You already have a belt-promotion request awaiting review.",
  // SESSION_0492 FIX 2 (HIGH): the evidence `mediaId` must be a photo the claimant
  // uploaded themselves — never a foreign / private Media id, and never a stale/absent id.
  EVIDENCE_MEDIA_NOT_OWNED: "One of your evidence photos could not be found. Re-upload it.",
} as const

/** Prisma client / `$transaction` tx surface (callers pass `ctx.db` or `tx`). */
// biome-ignore lint/suspicious/noExplicitAny: Prisma client/tx surface, matching the submit-passport-claim convention.
type Db = any

export type SubmitRankPromotionClaimInput = {
  /** The caller. Their OWN Passport is derived from this — a promotion is never for someone else. */
  claimantUserId: string
  /** The belt being asserted; must sit ABOVE the member's verified ceiling in its discipline. */
  claimedRankId: string
  brand: Brand
  claimantNote?: string | null
  /**
   * Soft-gate: certificate / instructor photo. Encouraged, not required. A `mediaId`
   * carries an uploaded photo (materializes onto the milestone on approve, Slice V3);
   * label/url/text carry a link or note. Any subset may be present.
   */
  evidence?: {
    label?: string | null
    url?: string | null
    text?: string | null
    mediaId?: string | null
  }[]
}

/**
 * Resolve-guard-create. Throws on a missing Passport/rank, a non-promotion (claimed
 * belt not above the ceiling), or an already-open promotion. Returns the new claim id.
 */
export async function submitRankPromotionClaim(
  db: Db,
  input: SubmitRankPromotionClaimInput,
): Promise<{ claimId: string }> {
  // The caller's OWN Passport (identity SoT, ADR 0025) + their awarded belts, ordered
  // highest-first so `pickTopAwardInDiscipline` reads the discipline ceiling directly.
  const passport = await db.passport.findUnique({
    where: { userId: input.claimantUserId },
    select: {
      id: true,
      rankAwardsEarned: {
        select: {
          rank: {
            select: { sortOrder: true, rankSystem: { select: { disciplineId: true } } },
          },
        },
        orderBy: [{ rank: { sortOrder: "desc" } }, { awardedAt: "desc" }],
      },
    },
  })
  if (!passport) {
    throw new Error(SUBMIT_RANK_PROMOTION_CLAIM_ERROR.PASSPORT_NOT_FOUND)
  }

  const claimedRank = await db.rank.findUnique({
    where: { id: input.claimedRankId },
    select: { sortOrder: true, rankSystem: { select: { disciplineId: true } } },
  })
  if (!claimedRank) {
    throw new Error(SUBMIT_RANK_PROMOTION_CLAIM_ERROR.RANK_NOT_FOUND)
  }

  // Ceiling = the member's top AWARDED belt in the SAME discipline as the claimed belt
  // (discipline-scoped, BBL = BJJ — the 0475 fix). No award in that discipline → the
  // member has no ceiling there, so a first-belt claim is a valid promotion.
  const disciplineId = claimedRank.rankSystem?.disciplineId ?? null
  // `db` is the untyped Prisma/tx surface (convention), so type the awards at the call
  // site — otherwise `pickTopAwardInDiscipline`'s generic falls back to its constraint,
  // which omits `sortOrder`.
  const awards = passport.rankAwardsEarned as Array<{
    rank: { sortOrder: number; rankSystem: { disciplineId: string | null } | null }
  }>
  const topInDiscipline = pickTopAwardInDiscipline(awards, disciplineId)
  const ceiling = topInDiscipline?.rank.sortOrder ?? Number.NEGATIVE_INFINITY

  // A promotion is strictly ABOVE the ceiling. At/below = a belt they already hold →
  // that's Belt-Journey backfill (Slice V4), and self-promotion stays impossible: the
  // ceiling only rises through an approved promotion, never through this submit.
  if (claimedRank.sortOrder <= ceiling) {
    throw new Error(SUBMIT_RANK_PROMOTION_CLAIM_ERROR.NOT_A_PROMOTION)
  }

  // FIX 2 (HIGH): every evidence row carrying a `mediaId` must reference a photo the
  // CLAIMANT uploaded (`Media.uploadedById === claimantUserId`). Without this, a caller
  // could attach a foreign / private Media id as "evidence" — disclosing it to reviewers
  // — or a nonexistent id that would only surface as a raw Prisma P2003 500 on create.
  // (Media owner is immutable, so this may run inside the tx below without a TOCTOU risk.)
  for (const item of input.evidence ?? []) {
    if (!item.mediaId) continue
    const owned = await resolveOwnedMedia(db, item.mediaId, input.claimantUserId)
    if (!owned) {
      throw new Error(SUBMIT_RANK_PROMOTION_CLAIM_ERROR.EVIDENCE_MEDIA_NOT_OWNED)
    }
  }

  // FIX 5 (LOW): the "one open promotion" check + create run in ONE transaction so two
  // concurrent submits can't both pass the check and both create — the check-then-create
  // race is closed atomically.
  const claim = await db.$transaction(async (tx: Db) => {
    const existingOpen = await tx.passportClaimRequest.findFirst({
      where: {
        passportId: passport.id,
        type: "RANK_PROMOTION",
        status: { in: ["PENDING", "NEEDS_INFO"] },
      },
      select: { id: true },
    })
    if (existingOpen) {
      throw new Error(SUBMIT_RANK_PROMOTION_CLAIM_ERROR.DUPLICATE_OPEN_PROMOTION)
    }

    return tx.passportClaimRequest.create({
      data: {
        type: "RANK_PROMOTION",
        passportId: passport.id,
        claimantUserId: input.claimantUserId,
        brand: input.brand,
        claimedRankId: input.claimedRankId,
        claimantNote: input.claimantNote ?? null,
        ...(input.evidence?.length
          ? {
              evidence: {
                create: input.evidence.map(item => ({
                  label: item.label ?? null,
                  url: item.url ?? null,
                  text: item.text ?? null,
                  mediaId: item.mediaId ?? null,
                })),
              },
            }
          : {}),
      },
      select: { id: true },
    })
  })

  return { claimId: claim.id }
}
