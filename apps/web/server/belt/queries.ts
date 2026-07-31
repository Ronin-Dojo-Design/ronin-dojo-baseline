import type {
  Prisma,
  RankAwardVerificationStatus,
  RankEntryProvenance,
  RankEntryStatus,
} from "~/.generated/prisma/client"
import { type GateAward, memberFactEditability } from "~/server/belt/belt-gate"
import type { BeltCardOutput } from "~/server/belt/schemas"
import { isRecruitedCoachIdentity } from "~/server/identity/promoter-classification"
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
  // Join the promoter Passport so a REGISTERED promoter resolves to a display name.
  // `notes` only ever holds the FREETEXT promoter, so a registered pick used to read
  // back with `promoterName: null` — invisible on the card AND the editor prefill,
  // which is why the registered path looked broken (SESSION_0497).
  awardedByPassport: {
    select: {
      displayName: true,
      userId: true,
      user: { select: { name: true } },
      lineageNode: { select: { id: true } },
      directoryProfile: { select: { id: true } },
    },
  },
  organizationId: true,
  rankId: true,
  // @added SESSION_0729 (#376/#375) — the linked RankEntry's IMMUTABLE provenance, threaded into the
  // belt gate so "authority-owned / read-only" keys off provenance, not the mutable status. Nullable
  // (an award whose entry isn't synced yet) → `rankAwardProvenance` falls back to the legacy derive.
  rankEntry: { select: { provenance: true } },
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
        // Join the resolvable Media fields so the card carries render-ready
        // url/type (SESSION_0492 cleanup — subsumes the old `beltTabAwardSelect`
        // + `resolveMedia` in the belt-tab loader; ids alone forced a URL
        // reconciliation seam that no longer exists).
        select: {
          id: true,
          mediaId: true,
          purpose: true,
          media: { select: { url: true, type: true } },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  },
} satisfies Prisma.RankAwardSelect

export type MemberAward = Prisma.RankAwardGetPayload<{ select: typeof gateAwardSelect }>

/** Explicit bridge from legacy award provenance to canonical member status. */
export function rankEntryStatusForAward(
  verificationStatus: RankAwardVerificationStatus,
): RankEntryStatus {
  if (verificationStatus === "VERIFIED") return "VERIFIED"
  if (verificationStatus === "DISPUTED") return "DISPUTED"
  // IMPORTED = verified truth for BBL's established lineage (operator decision, SESSION_0522):
  // imported awards render as VERIFIED entries. Immutable origin remains separate on
  // RankEntry.provenance, which belt-gate reads for authority-owned / read-only behavior;
  // this function governs only the mutable member-facing RankEntry status.
  if (verificationStatus === "IMPORTED") return "VERIFIED"
  return "UNVERIFIED"
}

/**
 * The award's IMMUTABLE provenance (#375) — read from the linked RankEntry, or derived from the
 * legacy `verificationStatus` for an award whose entry isn't synced yet. The derive is
 * behaviour-identical to `syncRankEntryFromAward` (`IMPORTED → IMPORTED`, else `EARNED`) and
 * `verificationStatus` never crosses the IMPORTED boundary post-create, so this is a no-op for
 * synced rows and a safe bridge for the rest (SESSION_0501 fill-blanks stays owner-fillable on an
 * unsynced award). The fallback dies with the award table at #380 — the belt gate reads this, not
 * the mutable status, for "authority-owned / read-only".
 */
export function rankAwardProvenance(award: {
  verificationStatus: RankAwardVerificationStatus
  rankEntry?: { provenance: RankEntryProvenance } | null
}): RankEntryProvenance {
  return (
    award.rankEntry?.provenance ?? (award.verificationStatus === "IMPORTED" ? "IMPORTED" : "EARNED")
  )
}

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
 * The member's promoter-match ANCHOR — their highest-sortOrder **authority-verified**
 * award in the discipline (`awards` are pre-ordered by `rank.sortOrder desc`). Authority
 * = IMPORTED legacy truth, or an instructor-stamped VERIFIED (`awardedById` set). IMPORTED is
 * read off the award's own `verificationStatus` here — NOT the linked entry's provenance —
 * because the anchor award may not have been (re)synced yet and the two never disagree
 * (`verificationStatus` never crosses the IMPORTED boundary post-create); folding this read
 * onto provenance is a #380 move, once the entry is primary. A
 * self-minted backfill (now minted UNVERIFIED, SESSION_0540) is deliberately NOT an anchor —
 * its promoter is exactly what the backfill-verification decision validates.
 * Shared by the write path (`promoter-proposal-core.applyMemberPromoterTransition`) and read path
 * (`belt-tab-loader` → the promoter-picker feedback note) so they never diverge.
 */
export function resolveAnchorAward(
  awards: MemberAward[],
  disciplineId: string,
): MemberAward | null {
  return (
    awards.find(
      award =>
        award.rank.rankSystem?.disciplineId === disciplineId &&
        (award.verificationStatus === "IMPORTED" ||
          (award.verificationStatus === "VERIFIED" && award.awardedById !== null)),
    ) ?? null
  )
}

/**
 * The member's awards, pre-ordered by `rank.sortOrder desc` — the order
 * the discipline-scoped rank-entry resolver / the gate rely on to read the ceiling as the
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

/**
 * Project one award row into the enriched belt card the mutations return, mapping
 * legacy compatibility fields through the canonical RankEntry status.
 * Fact provenance/editability remains on RankAward during the additive cutover.
 */
export function toBeltCard(
  award: MemberAward,
  status: RankEntryStatus = rankEntryStatusForAward(award.verificationStatus),
): BeltCardOutput {
  // Per-fact owner editability (SESSION_0501 fill-blanks policy). The reason
  // `SELF_BACKFILL` is exactly the old `isFactEditable` predicate, so the derived
  // card-level boolean keeps its B1 meaning for existing consumers.
  const editability = memberFactEditability({
    source: award.source,
    // RankEntry owns presentation status; the IMMUTABLE provenance (#375) drives fact authority.
    verificationStatus: award.verificationStatus,
    provenance: rankAwardProvenance(award),
    awardedById: award.awardedById,
    awardedAt: award.awardedAt,
    awardedByPassportId: award.awardedByPassportId,
    notes: award.notes,
    organizationId: award.organizationId,
    location: award.location,
  })
  return {
    rankAwardId: award.id,
    rankId: award.rankId,
    rankName: award.rank.name,
    rankSortOrder: award.rank.sortOrder,
    colorHex: award.rank.colorHex,
    verificationStatus: status,
    isFactEditable: editability.reason === "SELF_BACKFILL",
    factEditability: editability.facts,
    editabilityReason: editability.reason,
    awardedAt: award.awardedAt,
    // FREETEXT promoter → `notes`; REGISTERED promoter → the joined Passport's name
    // (the handler nulls whichever side isn't picked, so these never collide).
    promoterName:
      award.notes ??
      award.awardedByPassport?.displayName ??
      award.awardedByPassport?.user?.name ??
      null,
    awardedByPassportId: award.awardedByPassportId,
    // A free-typed coach resolves to an accountless Passport with no public identity satellite. Return this
    // authoritative classification with every mutation card so a still-mounted client
    // does not keep treating the new placeholder as an established coach.
    promoterIsRecruited:
      award.awardedByPassportId !== null && isRecruitedCoachIdentity(award.awardedByPassport),
    schoolName: award.location,
    organizationId: award.organizationId,
    milestone: award.milestone
      ? {
          id: award.milestone.id,
          story: award.milestone.story,
          // Drop rows whose Media was SetNull-orphaned (no url to render), then
          // carry the resolved url/type — the card is render-ready, no separate
          // media-resolution pass (SESSION_0492 cleanup).
          media: award.milestone.media.flatMap(m =>
            m.media
              ? [
                  {
                    attachmentId: m.id,
                    mediaId: m.mediaId,
                    purpose: m.purpose,
                    url: m.media.url,
                    type: m.media.type,
                  },
                ]
              : [],
          ),
        }
      : null,
  }
}
