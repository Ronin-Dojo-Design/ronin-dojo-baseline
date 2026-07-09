import { ORPCError } from "@orpc/server"
import { Brand } from "~/.generated/prisma/client"
import {
  ceilingSortOrder,
  type FactKey,
  isFactEditable,
  isTopAward,
  isWithinCeiling,
  memberFactEditability,
} from "~/server/belt/belt-gate"
import {
  gateAwardSelect,
  getActingPassportId,
  getBjjDisciplineId,
  getMemberAwards,
  rankEntryStatusForAward,
  toBeltCard,
  toGateAward,
} from "~/server/belt/queries"
import {
  attachMilestoneMediaInput,
  type BeltCardOutput,
  deleteRankAwardInput,
  detachMilestoneMediaInput,
  updateRankAwardFactInput,
  type UpdateRankAwardFactInput,
  upsertBeltMilestoneInput,
} from "~/server/belt/schemas"
import { resolveOwnedMedia } from "~/server/media/media-ownership"
import { authedProcedure } from "~/server/orpc/procedure"
import { emitSchoolLead } from "~/server/web/school-lead/emit-school-lead"
import { db } from "~/services/db"

/**
 * Member belt-journey mutations (Slice 3 — Petey Plan 0477 §Slice 3).
 *
 * Own-Passport only, all gated to `rank.sortOrder <= ceiling` where the ceiling =
 * the member's highest AWARDED belt IN the BJJ discipline (Locked #5). The
 * self-promotion / verified-fact / top-award invariants live as pure predicates
 * in `./belt-gate.ts`; these handlers resolve the member's awards, then delegate
 * every gate decision there so nothing here can drift from the tested rules.
 *
 * Authorization is TWO layers: `meta.permission = "belt.manage"` (a signed-in
 * member — role grant, `server/orpc/roles.ts`) plus the per-call ownership root
 * `getActingPassportId(user.id)` (the acting account's OWN Passport). A flat role
 * grant cannot express "your own row", so ownership is asserted in-handler and
 * every write is scoped to that passportId.
 */

const beltProcedure = authedProcedure.meta({
  permission: "belt.manage",
  rateLimit: { points: 120, duration: 60 * 60 },
})

const REVALIDATE_PATHS = ["/app/profile"]

type RankEntryDb = Pick<typeof db, "rankAward" | "rankEntry">

/**
 * Keep the additive RankEntry compatibility anchor aligned with the legacy award
 * while the profile workspace is still rendered from its established RankAward
 * view model. This is intentionally called in the same transaction as every
 * member-owned fact write: a successful edit cannot leave two rank records out
 * of sync.
 */
async function syncRankEntryFromAward(rankAwardId: string, dbClient: RankEntryDb = db) {
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

/**
 * Re-read the single enriched card for `rankAwardId`. Scoped to the acting
 * member's `passportId` (the ownership root) so it never returns another member's
 * award — a caller cannot enrich a card they do not own. One row via `findFirst`
 * with `gateAwardSelect`, not the whole award list (we only need this one).
 */
async function enrichedCard(passportId: string, rankAwardId: string): Promise<BeltCardOutput> {
  const award = await db.rankAward.findFirst({
    where: { id: rankAwardId, passportId },
    select: gateAwardSelect,
  })
  if (!award) throw new ORPCError("NOT_FOUND", { message: "Belt award not found" })
  return toBeltCard(award)
}

/**
 * `upsertBeltMilestone(rankId, { story })` — ensure the member's backfill
 * `RankAward` for `rankId` exists, then upsert its 1:1 `RankMilestone`. Returns
 * the enriched card.
 *
 * B1 (ADR 0035 Amendment 1 — C-implied mint): the ensured award is **VERIFIED**
 * by implication, NOT `UNVERIFIED`. This path is hard-gated to `sortOrder <=`
 * the member's verified ceiling (below), so the member demonstrably already holds
 * an equal-or-higher awarded belt — a lower belt is implied-true, not a
 * self-declaration awaiting review. A belt ABOVE the ceiling cannot reach this
 * path (it throws FORBIDDEN below); the UI routes those to `promotion.submit`
 * (the V2 spine oRPC). No belt-journey path ever mints an `UNVERIFIED` award, so
 * there is no display axis and nothing can leak onto the tree (ADR 0035 §5).
 */
const upsertBeltMilestone = beltProcedure
  .input(upsertBeltMilestoneInput)
  .handler(async ({ input, context }) => {
    const passportId = await getActingPassportId(context.user.id)
    const disciplineId = await getBjjDisciplineId()

    // Gate the TARGET rank against the member's current ceiling BEFORE any write.
    const rank = await db.rank.findUnique({
      where: { id: input.rankId },
      select: { sortOrder: true, rankSystem: { select: { disciplineId: true } } },
    })
    if (!rank) throw new ORPCError("NOT_FOUND", { message: "Rank not found" })
    if (rank.rankSystem?.disciplineId !== disciplineId) {
      throw new ORPCError("BAD_REQUEST", { message: "Rank is not in the belt discipline" })
    }

    const awards = await getMemberAwards(passportId)
    const ceiling = ceilingSortOrder(awards.map(toGateAward), disciplineId)
    if (!isWithinCeiling(rank.sortOrder, ceiling)) {
      throw new ORPCError("FORBIDDEN", {
        message: "You can only enrich belts at or below your awarded rank",
      })
    }

    const rankAwardId = await db.$transaction(async tx => {
      const award = await tx.rankAward.upsert({
        where: { passportId_rankId: { passportId, rankId: input.rankId } },
        create: {
          passportId,
          rankId: input.rankId,
          source: "STATED",
          // VERIFIED-by-implication: gated `<= ceiling`, so a higher/equal awarded
          // belt already vouches for this one. `awardedById` stays null → this is a
          // self-added backfill (fact-editable; see `isFactEditable`).
          verificationStatus: "VERIFIED",
        },
        update: {},
        select: { id: true, passportId: true, rankId: true, verificationStatus: true },
      })

      await tx.rankEntry.upsert({
        where: { rankAwardId: award.id },
        create: {
          rankAwardId: award.id,
          passportId: award.passportId,
          rankId: award.rankId,
          status: rankEntryStatusForAward(award.verificationStatus),
        },
        update: {
          passportId: award.passportId,
          rankId: award.rankId,
          status: rankEntryStatusForAward(award.verificationStatus),
        },
      })

      await tx.rankMilestone.upsert({
        where: { rankAwardId: award.id },
        create: { rankAwardId: award.id, story: input.story?.trim() || null },
        update: { story: input.story?.trim() ?? null },
      })

      return award.id
    })

    context.revalidate({ paths: REVALIDATE_PATHS })
    return enrichedCard(passportId, rankAwardId)
  })

/** The select both fact-edit paths need: authorship + current fact values. */
const factEditSelect = {
  id: true,
  passportId: true,
  source: true,
  verificationStatus: true,
  awardedById: true,
  awardedAt: true,
  awardedByPassportId: true,
  notes: true,
  organizationId: true,
  location: true,
} as const

type FactUpdateInput = Pick<UpdateRankAwardFactInput, "awardedAt" | "promoter" | "school">

type FactUpdateData = {
  awardedAt?: Date | null
  notes?: string | null
  awardedByPassportId?: string | null
  location?: string | null
  organizationId?: string | null
}

/**
 * Resolve a fact-edit input into a partial `RankAward` update — undefined keys
 * leave the column untouched; `rankId` is deliberately never in this object. The
 * ONE persistence seam for BOTH the member and the admin fact paths (SESSION_0501
 * — the ref semantics must never fork): promoter/school each accept a typed FK OR
 * freetext; a freetext school additionally emits a deduped school-outreach lead.
 */
async function buildFactUpdateData(input: FactUpdateInput): Promise<FactUpdateData> {
  const data: FactUpdateData = {}

  if (input.awardedAt !== undefined) data.awardedAt = input.awardedAt

  if (input.promoter !== undefined) {
    if (input.promoter?.awardedByPassportId) {
      // The picker sends a Passport id (belt-tab-loader.getBeltPromoterOptions is keyed
      // by passport). Verify it still exists — the option list is cached, so a stale or
      // invalid id would otherwise P2003 into a swallowed 500 (SESSION_0497). Missing →
      // BAD_REQUEST so the client shows a real message, not the blanket "couldn't save".
      const promoterPassport = await db.passport.findUnique({
        where: { id: input.promoter.awardedByPassportId },
        select: { id: true },
      })
      if (!promoterPassport) {
        throw new ORPCError("BAD_REQUEST", {
          message:
            "That instructor can't be linked — pick another from the list or type their name.",
        })
      }
      data.awardedByPassportId = promoterPassport.id
      data.notes = null
    } else {
      const name = input.promoter?.name?.trim() || null
      data.awardedByPassportId = null
      data.notes = name
    }
  }

  if (input.school !== undefined) {
    if (input.school?.organizationId) {
      // Same guard as the promoter: the school option list is cached too, so a school
      // deleted inside that window would P2003 here (SESSION_0497). Missing → BAD_REQUEST.
      const org = await db.organization.findUnique({
        where: { id: input.school.organizationId },
        select: { id: true },
      })
      if (!org) {
        throw new ORPCError("BAD_REQUEST", {
          message:
            "That school is no longer available — pick another from the list or type its name.",
        })
      }
      data.organizationId = org.id
      data.location = null
    } else {
      const schoolName = input.school?.name?.trim() || null
      data.organizationId = null
      data.location = schoolName
      // Freetext school → capture the demand as a deduped school-outreach lead
      // (Slice 1). Never sends outreach — the invite is an operator click. The
      // country (Locked #7) belongs to the school, so it rides here → sets the
      // placeholder Organization.country (ignored on a registered-org pick).
      if (schoolName) {
        await emitSchoolLead({
          schoolName,
          source: "belt-journey",
          country: input.school?.country ?? null,
        })
      }
    }
  }

  return data
}

/** Which of the three facts a fact-edit input is trying to write. */
function requestedFactKeys(input: FactUpdateInput): FactKey[] {
  const keys: FactKey[] = []
  if (input.awardedAt !== undefined) keys.push("awardedAt")
  if (input.promoter !== undefined) keys.push("promoter")
  if (input.school !== undefined) keys.push("school")
  return keys
}

const FACT_LABEL: Record<FactKey, string> = {
  awardedAt: "promotion date",
  promoter: "promoter",
  school: "school",
}

/**
 * `updateRankAwardFact(rankAwardId, { awardedAt, promoter, school })` — edit the
 * promotion FACT of an OWN award. NEVER changes `rankId` (not an input).
 *
 * SESSION_0501 ratified policy (per-fact, `memberFactEditability`):
 * - self-added STATED backfill → every fact fully editable (unchanged B1 behavior);
 * - authority-owned award (promotion-minted / IMPORTED) → the owner may FILL a fact
 *   that is currently EMPTY but may never modify or clear a filled one → FORBIDDEN
 *   naming the locked fact(s);
 * - DISPUTED → fully locked for the owner.
 *
 * Promoter/school ref semantics live in `buildFactUpdateData` (shared with the
 * admin path): typed FK OR freetext; freetext school → `emitSchoolLead` + `location`;
 * freetext promoter → `notes`.
 */
const updateRankAwardFact = beltProcedure
  .input(updateRankAwardFactInput)
  .handler(async ({ input, context }) => {
    const passportId = await getActingPassportId(context.user.id)

    const award = await db.rankAward.findUnique({
      where: { id: input.rankAwardId },
      select: factEditSelect,
    })
    if (!award || award.passportId !== passportId) {
      throw new ORPCError("NOT_FOUND", { message: "Belt award not found" })
    }

    // Per-fact gate: every fact the input tries to write must be editable for the
    // OWNER. Surface the REAL reason naming the locked fact(s), never a blanket error.
    const { facts, reason } = memberFactEditability(award)
    const locked = requestedFactKeys(input).filter(key => !facts[key])
    if (locked.length > 0) {
      throw new ORPCError("FORBIDDEN", {
        message: `The ${locked.map(key => FACT_LABEL[key]).join(", ")} on this belt was recorded by an instructor or admin and can't be changed`,
      })
    }

    const data = await buildFactUpdateData(input)
    if (reason === "SELF_BACKFILL") {
      // Self-added backfill: full overwrite is the ratified semantics — the owner
      // racing themselves is harmless, so the unconditional write stands.
      await db.$transaction(async tx => {
        await tx.rankAward.update({ where: { id: award.id }, data })
        await syncRankEntryFromAward(award.id, tx)
      })
    } else {
      // Fill-once must be race-proof (Doug SESSION_0501 MED — TOCTOU): the gate above
      // read-checked emptiness, but a concurrent fill (or an admin write landing in the
      // read→write window) could otherwise be overwritten. The write itself re-asserts
      // per-fact emptiness atomically — a raced fill matches 0 rows and fails CLOSED.
      // (Prisma can't express the gate's trim() blank-check, so whitespace-only
      // freetext also fails closed here — the safe direction, and unreachable via our
      // own writers, which always trim-or-null.)
      const stillEmpty = requestedFactKeys(input).map(key =>
        key === "awardedAt"
          ? { awardedAt: null }
          : key === "promoter"
            ? { awardedByPassportId: null, OR: [{ notes: null }, { notes: "" }] }
            : { organizationId: null, OR: [{ location: null }, { location: "" }] },
      )
      const written = await db.$transaction(async tx => {
        const result = await tx.rankAward.updateMany({
          where: { id: award.id, passportId, AND: stillEmpty },
          data,
        })
        if (result.count === 1) await syncRankEntryFromAward(award.id, tx)
        return result
      })
      if (written.count !== 1) {
        throw new ORPCError("FORBIDDEN", {
          message:
            "This belt's details were just updated elsewhere — refresh to see the latest record.",
        })
      }
    }

    context.revalidate({ paths: REVALIDATE_PATHS })
    return enrichedCard(passportId, award.id)
  })

/**
 * `updateRankAwardFactAsAdmin(rankAwardId, { awardedAt, promoter, school })` —
 * admin CRUD on ANY member's award facts, any source (SESSION_0501 ratified
 * policy). Same input + persistence seam as the member path (`buildFactUpdateData`
 * — the ref semantics never fork); no ownership root and no per-fact gate.
 *
 * Authorization reuses the existing role system (repo rule: 4 authz systems, never
 * a 5th): `meta.permission = "belt.admin"` — a NEW permission KEY on the existing
 * `can()` gate, granted only via the admin `"*"` wildcard (the `beta.view` / FI-019
 * precedent: a new authz need = a new key, never a new system). Every write is
 * audit-logged with the fact before/after, matching the established admin-mutation
 * pattern (`server/admin/users/actions.ts`, `server/admin/lineage/actions.ts`).
 */
const updateRankAwardFactAsAdmin = authedProcedure
  .meta({ permission: "belt.admin", rateLimit: { points: 120, duration: 60 * 60 } })
  .input(updateRankAwardFactInput)
  .handler(async ({ input, context }) => {
    const award = await db.rankAward.findUnique({
      where: { id: input.rankAwardId },
      select: factEditSelect,
    })
    if (!award) {
      throw new ORPCError("NOT_FOUND", { message: "Belt award not found" })
    }

    const data = await buildFactUpdateData(input)
    const factSnapshot = (row: {
      awardedAt: Date | null
      awardedByPassportId: string | null
      notes: string | null
      organizationId: string | null
      location: string | null
    }) => ({
      awardedAt: row.awardedAt?.toISOString() ?? null,
      awardedByPassportId: row.awardedByPassportId,
      notes: row.notes,
      organizationId: row.organizationId,
      location: row.location,
    })

    await db.$transaction(async tx => {
      // Race-proof before-image (Doug SESSION_0501 P3): re-read inside the tx — the
      // outer read is only the NOT_FOUND guard and could be ms-stale by write time.
      const before = await tx.rankAward.findUniqueOrThrow({
        where: { id: award.id },
        select: factEditSelect,
      })
      const updated = await tx.rankAward.update({
        where: { id: award.id },
        data,
        select: factEditSelect,
      })
      await syncRankEntryFromAward(award.id, tx)
      await tx.auditLog.create({
        data: {
          brand: Brand.BBL,
          action: "belt.fact.updated",
          entityType: "RankAward",
          entityId: award.id,
          userId: context.user.id,
          before: factSnapshot(before),
          after: factSnapshot(updated),
        },
      })
    })

    context.revalidate({ paths: REVALIDATE_PATHS })
    return enrichedCard(award.passportId, award.id)
  })

/**
 * `attachMilestoneMedia(rankMilestoneId, mediaId, purpose)` — link a Media row to
 * an OWN milestone via `MediaAttachment.rankMilestoneId` (Slice 2 column). Idempotent.
 */
const attachMilestoneMedia = beltProcedure
  .input(attachMilestoneMediaInput)
  .handler(async ({ input, context }) => {
    const passportId = await getActingPassportId(context.user.id)

    const milestone = await db.rankMilestone.findUnique({
      where: { id: input.rankMilestoneId },
      select: { id: true, rankAward: { select: { id: true, passportId: true } } },
    })
    if (!milestone || milestone.rankAward.passportId !== passportId) {
      throw new ORPCError("NOT_FOUND", { message: "Belt milestone not found" })
    }

    // FIX 2 (HIGH): the caller-supplied `mediaId` must be a photo THIS user uploaded
    // (`Media.uploadedById === user.id`). Without it, a member could attach a foreign /
    // private Media row to their own milestone (disclosure), or a nonexistent id would
    // surface as a raw Prisma P2003 500. A friendly NOT_FOUND covers both cases.
    const ownedMedia = await resolveOwnedMedia(db, input.mediaId, context.user.id)
    if (!ownedMedia) {
      throw new ORPCError("NOT_FOUND", { message: "Media not found" })
    }

    const existing = await db.mediaAttachment.findFirst({
      where: { rankMilestoneId: milestone.id, mediaId: input.mediaId },
      select: { id: true },
    })
    if (existing) {
      await db.mediaAttachment.update({
        where: { id: existing.id },
        data: { purpose: input.purpose },
      })
    } else {
      await db.mediaAttachment.create({
        data: {
          rankMilestoneId: milestone.id,
          mediaId: input.mediaId,
          purpose: input.purpose,
        },
      })
    }

    context.revalidate({ paths: REVALIDATE_PATHS })
    return enrichedCard(passportId, milestone.rankAward.id)
  })

/**
 * `detachMilestoneMedia(rankMilestoneId, mediaId)` — unlink a Media row from an
 * OWN milestone. The `Media` row itself is untouched.
 */
const detachMilestoneMedia = beltProcedure
  .input(detachMilestoneMediaInput)
  .handler(async ({ input, context }) => {
    const passportId = await getActingPassportId(context.user.id)

    const milestone = await db.rankMilestone.findUnique({
      where: { id: input.rankMilestoneId },
      select: { id: true, rankAward: { select: { id: true, passportId: true } } },
    })
    if (!milestone || milestone.rankAward.passportId !== passportId) {
      throw new ORPCError("NOT_FOUND", { message: "Belt milestone not found" })
    }

    await db.mediaAttachment.deleteMany({
      where: { rankMilestoneId: milestone.id, mediaId: input.mediaId },
    })

    context.revalidate({ paths: REVALIDATE_PATHS })
    return enrichedCard(passportId, milestone.rankAward.id)
  })

/**
 * `deleteRankAward(rankAwardId)` — delete an OWN award (cascades its milestone +
 * media attachments). FORBIDDEN if it is the member's current TOP award, since
 * removing it would drop the self-promotion ceiling (Locked #5).
 */
const deleteRankAward = beltProcedure
  .input(deleteRankAwardInput)
  .handler(async ({ input, context }) => {
    const passportId = await getActingPassportId(context.user.id)
    const disciplineId = await getBjjDisciplineId()

    const awards = await getMemberAwards(passportId)
    const target = awards.find(a => a.id === input.rankAwardId)
    if (!target) throw new ORPCError("NOT_FOUND", { message: "Belt award not found" })

    // FIX 3 (MED): delete must not exceed edit. Only a self-added, fact-editable award
    // (STATED, no approver stamp, not IMPORTED/DISPUTED) may be removed — a
    // promotion-minted / IMPORTED / DISPUTED award is authority-owned truth, so
    // erasing it would let a member drop an instructor-verified belt (reuses the SAME
    // `isFactEditable` predicate the fact-edit path uses).
    if (!isFactEditable(target)) {
      throw new ORPCError("FORBIDDEN", {
        message: "This belt was verified by an instructor and cannot be deleted",
      })
    }

    if (isTopAward(input.rankAwardId, awards.map(toGateAward), disciplineId)) {
      throw new ORPCError("FORBIDDEN", {
        message: "You cannot delete your current top belt",
      })
    }

    await db.rankAward.delete({ where: { id: input.rankAwardId } })

    context.revalidate({ paths: REVALIDATE_PATHS })
    return { deleted: true as const, rankAwardId: input.rankAwardId }
  })

export const belt = {
  upsertBeltMilestone,
  updateRankAwardFact,
  updateRankAwardFactAsAdmin,
  attachMilestoneMedia,
  detachMilestoneMedia,
  deleteRankAward,
}
