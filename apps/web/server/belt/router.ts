import { ORPCError } from "@orpc/server"
import { Brand } from "~/.generated/prisma/client"
import { deriveTrustState, OPEN_RANK_ENTRY_REVIEW_STATUSES } from "~/lib/belt/review-state"
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
  toBeltCard,
  toGateAward,
} from "~/server/belt/queries"
import { syncRankEntryFromAward } from "~/server/belt/rank-entry-compatibility"
import {
  applyMemberPromoterTransition,
  findAndLockPendingPromoterReview,
  hasLockedRankEntryReviewHistory,
  lockPromoterWorkflowScope,
  lockRankAward,
  overrideCapturedPromoterReview,
} from "~/server/belt/promoter-proposal-core"
import {
  attachMilestoneMediaInput,
  type BeltCardOutput,
  deleteRankAwardInput,
  detachMilestoneMediaInput,
  overrideRankAwardPromoterAsAdminInput,
  updateRankAwardFactInput,
  type UpdateRankAwardFactInput,
  upsertBeltMilestoneInput,
} from "~/server/belt/schemas"
import { ensurePromoterPlaceholder } from "~/server/identity/promoter-placeholder"
import { resolveOwnedMedia } from "~/server/media/media-ownership"
import { authedProcedure } from "~/server/orpc/procedure"
import { emitPromoterLead } from "~/server/web/promoter-lead/emit-promoter-lead"
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

/**
 * Re-read the single enriched card for `rankAwardId`. Scoped to the acting
 * member's `passportId` (the ownership root) so it never returns another member's
 * award — a caller cannot enrich a card they do not own. One row via `findFirst`
 * with `gateAwardSelect`, not the whole award list (we only need this one).
 */
async function enrichedCard(passportId: string, rankAwardId: string): Promise<BeltCardOutput> {
  // PrismaPg currently warns when one adapter client overlaps query calls. These two reads are
  // cheap and ordering-independent, so keep them sequential until the adapter supports overlap.
  const award = await db.rankAward.findFirst({
    where: { id: rankAwardId, passportId },
    select: gateAwardSelect,
  })
  const entry = await db.rankEntry.findUnique({
    where: { rankAwardId },
    select: {
      status: true,
      reviews: {
        where: { status: { in: [...OPEN_RANK_ENTRY_REVIEW_STATUSES] } },
        select: { id: true },
        take: 1,
      },
    },
  })
  if (!award) throw new ORPCError("NOT_FOUND", { message: "Belt award not found" })
  return {
    ...toBeltCard(award, entry?.status),
    trustState: entry
      ? deriveTrustState({
          verified: entry.status === "VERIFIED",
          hasPendingReview: entry.reviews.length > 0,
        })
      : undefined,
  }
}

/**
 * Find a milestone the acting member OWNS (its award's `passportId` === the ownership root), or
 * throw NOT_FOUND. The shared ownership gate for the attach / detach media handlers — a caller can
 * never reach another member's milestone.
 */
async function findOwnMilestone(passportId: string, rankMilestoneId: string) {
  const milestone = await db.rankMilestone.findUnique({
    where: { id: rankMilestoneId },
    select: { id: true, rankAward: { select: { id: true, passportId: true } } },
  })
  if (!milestone || milestone.rankAward.passportId !== passportId) {
    throw new ORPCError("NOT_FOUND", { message: "Belt milestone not found" })
  }
  return milestone
}

/**
 * `upsertBeltMilestone(rankId, { story })` — ensure the member's backfill
 * `RankAward` for `rankId` exists, then upsert its 1:1 `RankMilestone`. Returns
 * the enriched card.
 *
 * SESSION_0540 rework (supersedes the B1 VERIFIED-by-implication mint): the ensured
 * award is minted **UNVERIFIED**. A self-added backfill starts unverified and is
 * PROMOTED to VERIFIED only when its named promoter matches the member's anchor
 * promoter (`applyMemberPromoterTransition`, reached via `updateRankAwardFact`) — this
 * removes the transient mint-VERIFIED-then-downgrade. `awardedById` stays null → the
 * award is self-added (fact-editable; see `isFactEditable`), and being at/below the
 * ceiling it can never raise the member's shown belt above their awarded truth. A belt
 * ABOVE the ceiling cannot reach this path (it throws FORBIDDEN below); the UI routes
 * those to `promotion.submit` (the V2 spine oRPC).
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
          // Minted UNVERIFIED (SESSION_0540 rework): a self-added backfill starts unverified
          // and is promoted to VERIFIED only by the same-anchor-promoter branch of
          // `applyMemberPromoterTransition` (via `updateRankAwardFact`). `awardedById` stays null
          // → self-added backfill (fact-editable; see `isFactEditable`).
          verificationStatus: "UNVERIFIED",
        },
        update: {},
        select: { id: true, passportId: true, rankId: true, verificationStatus: true },
      })

      await syncRankEntryFromAward(tx, award.id)

      await tx.rankMilestone.upsert({
        where: { rankAwardId: award.id },
        create: { rankAwardId: award.id, story: input.story?.trim() || null },
        update: { story: input.story?.trim() ?? null },
      })

      return award.id
    })

    context.revalidate({ paths: [...REVALIDATE_PATHS, "/lineage"], tags: ["lineage"] })
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

function factSnapshot(row: {
  awardedAt: Date | null
  awardedByPassportId: string | null
  notes: string | null
  organizationId: string | null
  location: string | null
}) {
  return {
    awardedAt: row.awardedAt?.toISOString() ?? null,
    awardedByPassportId: row.awardedByPassportId,
    notes: row.notes,
    organizationId: row.organizationId,
    location: row.location,
  }
}

/** Prisma surface the capture needs — the award `$transaction` client threads through here. */
type FactCaptureTx = Pick<typeof db, "passport" | "organization" | "lead" | "leadFollowUp">

async function resolveRegisteredPromoterFact(
  tx: FactCaptureTx,
  promoterPassportId: string,
): Promise<Pick<FactUpdateData, "awardedByPassportId" | "notes">> {
  const promoterPassport = await tx.passport.findUnique({
    where: { id: promoterPassportId },
    select: { id: true },
  })
  if (!promoterPassport) {
    throw new ORPCError("BAD_REQUEST", {
      message: "That instructor can't be linked — pick another from the list or type their name.",
    })
  }
  return { awardedByPassportId: promoterPassport.id, notes: null }
}

async function resolveNamedPromoterFact(
  tx: FactCaptureTx,
  name: string | null,
): Promise<Pick<FactUpdateData, "awardedByPassportId" | "notes">> {
  if (!name) return { awardedByPassportId: null, notes: null }

  const placeholder = await ensurePromoterPlaceholder(name, tx)
  await emitPromoterLead(
    {
      promoterName: name,
      source: "belt-journey",
      passportId: placeholder?.passportId ?? null,
    },
    tx,
  )
  return { awardedByPassportId: placeholder?.passportId ?? null, notes: name }
}

async function resolvePromoterFactWithCapture(
  tx: FactCaptureTx,
  promoter: Exclude<FactUpdateInput["promoter"], undefined>,
): Promise<Pick<FactUpdateData, "awardedByPassportId" | "notes">> {
  if (promoter?.awardedByPassportId) {
    // The picker options are cached. Revalidate the Passport so a stale id becomes a useful
    // BAD_REQUEST instead of a swallowed P2003.
    return resolveRegisteredPromoterFact(tx, promoter.awardedByPassportId)
  }

  const name = promoter?.name?.trim() || null
  // Freetext promoter capture is identity + pipeline, kept inside the award transaction so later
  // validation failures roll both artifacts back with the fact write.
  return resolveNamedPromoterFact(tx, name)
}

async function resolveSchoolFactWithCapture(
  tx: FactCaptureTx,
  school: Exclude<FactUpdateInput["school"], undefined>,
): Promise<Pick<FactUpdateData, "organizationId" | "location">> {
  if (school?.organizationId) {
    const organization = await tx.organization.findUnique({
      where: { id: school.organizationId },
      select: { id: true },
    })
    if (!organization) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          "That school is no longer available — pick another from the list or type its name.",
      })
    }
    return { organizationId: organization.id, location: null }
  }

  const schoolName = school?.name?.trim() || null
  if (schoolName) {
    await emitSchoolLead(
      { schoolName, source: "belt-journey", country: school?.country ?? null },
      tx,
    )
  }
  return { organizationId: null, location: schoolName }
}

/**
 * Resolve a fact-edit input into a partial `RankAward` update AND capture the recruitment
 * side-effects (SESSION_0541 rename — was the misleadingly-named `buildFactUpdateData`; the
 * "capture" is now explicit in the name, FINDING_02). Undefined keys leave the column untouched;
 * `rankId` is deliberately never in this object. The ONE persistence seam for BOTH the member and
 * the admin fact paths (SESSION_0501 — the ref semantics must never fork).
 *
 * Runs on the caller's award `tx` (WL-P3-44): a freetext promoter/school mints its placeholder +
 * emits its deduped recruitment `Lead` INSIDE the award transaction, so a fill-once fail-closed
 * rolls the capture back with the award (no orphan stub). Identity resolution
 * (`ensurePromoterPlaceholder`) is split from the CRM emit (`emitPromoterLead`); both fire on the
 * member AND admin paths on FREETEXT only — a picked, registered promoter/school never recruits
 * (operator decision SESSION_0541: recruit broadly, but only on a genuinely new free-typed name).
 */
async function resolveFactUpdateWithCapture(
  tx: FactCaptureTx,
  input: FactUpdateInput,
): Promise<FactUpdateData> {
  const data: FactUpdateData = {}

  if (input.awardedAt !== undefined) data.awardedAt = input.awardedAt
  if (input.promoter !== undefined)
    Object.assign(data, await resolvePromoterFactWithCapture(tx, input.promoter))
  if (input.school !== undefined)
    Object.assign(data, await resolveSchoolFactWithCapture(tx, input.school))

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

/** Leave the accepted promoter columns untouched while applying any sibling fact edits. */
function withoutPromoterFact(data: FactUpdateData): FactUpdateData {
  const siblingFacts = { ...data }
  delete siblingFacts.awardedByPassportId
  delete siblingFacts.notes
  return siblingFacts
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
 * Promoter/school ref semantics live in `resolveFactUpdateWithCapture` (shared with the
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

    // D-046 did not ratify member-side removal. Reject it before capture so a VERIFIED award can
    // never become promoter-less while retaining its trust state; admins retain explicit correction.
    if (
      input.promoter !== undefined &&
      !input.promoter?.awardedByPassportId &&
      !input.promoter?.name?.trim()
    ) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          "Choose or enter a promoter. Removing accepted promoter provenance requires admin correction.",
      })
    }

    const disciplineId = await getBjjDisciplineId()
    await db.$transaction(
      async tx => {
        // Resolve capture first so a picked/reused promoter Passport can join the global sorted
        // Passport tier before any Award lock. A freshly-created placeholder is transaction-private
        // until commit and cannot participate in a competing merge. Any later gate failure rolls all
        // capture side effects back with this transaction.
        const capturedPromoterData =
          input.promoter !== undefined ? await resolveFactUpdateWithCapture(tx, input) : null

        // Promoter decisions depend on the member-wide authority anchor and every promoter FK, so
        // freeze Passport union→all member Awards→open Reviews before the target re-read. Other fact
        // edits remain award-local.
        if (input.promoter !== undefined) {
          await lockPromoterWorkflowScope({
            tx,
            rankAwardId: award.id,
            candidatePromoterPassportId: capturedPromoterData?.awardedByPassportId,
            lockMemberAuthorityAwards: true,
          })
        } else {
          await lockRankAward(tx, award.id)
        }
        const currentAward = await tx.rankAward.findUniqueOrThrow({
          where: { id: award.id },
          select: factEditSelect,
        })
        if (currentAward.passportId !== passportId) {
          throw new ORPCError("NOT_FOUND", { message: "Belt award not found" })
        }
        const { facts, reason } = memberFactEditability(currentAward)
        const locked = requestedFactKeys(input).filter(key => !facts[key])
        if (locked.length > 0) {
          throw new ORPCError("FORBIDDEN", {
            message: `The ${locked.map(key => FACT_LABEL[key]).join(", ")} on this belt was recorded by an instructor or admin and can't be changed`,
          })
        }

        // Non-promoter edits resolve after their award-local lock. Promoter edits reuse the capture
        // resolved before the global lock tiers above.
        const data = capturedPromoterData ?? (await resolveFactUpdateWithCapture(tx, input))

        if (reason === "SELF_BACKFILL") {
          if (input.promoter !== undefined) {
            await applyMemberPromoterTransition({
              tx,
              currentAward,
              disciplineId,
              promoterData: {
                awardedByPassportId: data.awardedByPassportId,
                notes: data.notes,
              },
              siblingFacts: withoutPromoterFact(data),
              actingUserId: context.user.id,
            })
            return
          }

          // Self-added backfill: full overwrite is the ratified semantics — the owner
          // racing themselves is harmless, so the unconditional write stands.
          await tx.rankAward.update({ where: { id: award.id }, data })
          await syncRankEntryFromAward(tx, award.id)
          return
        }

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
        const result = await tx.rankAward.updateMany({
          where: { id: award.id, passportId, AND: stillEmpty },
          data,
        })
        // Fail CLOSED and ROLL BACK the capture: throwing inside the tx aborts it, so the
        // placeholder + lead resolved above are discarded with the award write (no orphan stub).
        if (result.count !== 1) {
          throw new ORPCError("FORBIDDEN", {
            message:
              "This belt's details were just updated elsewhere — refresh to see the latest record.",
          })
        }
        await syncRankEntryFromAward(tx, award.id)
      },
      { maxWait: 10000, timeout: 20000 },
    )

    context.revalidate({ paths: [...REVALIDATE_PATHS, "/lineage"], tags: ["lineage"] })
    return enrichedCard(passportId, award.id)
  })

/**
 * `updateRankAwardFactAsAdmin(rankAwardId, { awardedAt, promoter, school })` —
 * admin CRUD on ANY member's award facts, any source (SESSION_0501 ratified
 * policy). Same input + persistence seam as the member path (`resolveFactUpdateWithCapture`
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

    await db.$transaction(
      async tx => {
        // Resolve a promoter candidate before locks so its Passport joins the global first tier.
        // A rollback still removes any freetext placeholder/lead capture atomically.
        const capturedPromoterData =
          input.promoter !== undefined ? await resolveFactUpdateWithCapture(tx, input) : null

        // Promoter writes share Passport→Award→Review with member proposals, decisions, override,
        // and identity merge. Non-promoter fact updates stay award-local.
        if (input.promoter !== undefined) {
          await lockPromoterWorkflowScope({
            tx,
            rankAwardId: award.id,
            candidatePromoterPassportId: capturedPromoterData?.awardedByPassportId,
            lockMemberAuthorityAwards: false,
          })
        } else {
          await lockRankAward(tx, award.id)
        }

        // Race-proof before-image (Doug SESSION_0501 P3): re-read inside the tx — the
        // outer read is only the NOT_FOUND guard and could be ms-stale by write time.
        const before = await tx.rankAward.findUniqueOrThrow({
          where: { id: award.id },
          select: factEditSelect,
        })
        if (input.promoter !== undefined) {
          const pendingProposal = await findAndLockPendingPromoterReview(tx, award.id)
          if (pendingProposal) {
            throw new ORPCError("CONFLICT", {
              message:
                "This belt has a promoter change awaiting review. Use the explicit admin override to correct it.",
            })
          }
        }
        // Reuse the pre-lock promoter capture or resolve a non-promoter edit now. Freetext capture
        // remains atomic with this write and rolls back on every conflict above.
        const data = capturedPromoterData ?? (await resolveFactUpdateWithCapture(tx, input))
        const updated = await tx.rankAward.update({
          where: { id: award.id },
          data,
          select: factEditSelect,
        })
        await syncRankEntryFromAward(tx, award.id)
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
      },
      { maxWait: 10000, timeout: 20000 },
    )

    context.revalidate({ paths: [...REVALIDATE_PATHS, "/lineage"], tags: ["lineage"] })
    return enrichedCard(award.passportId, award.id)
  })

/**
 * Explicit workflow override for a promoter proposal. Unlike the ordinary admin fact
 * editor, this command acknowledges and closes the pending proposal in the same
 * transaction that applies the correction, with a separate audit record for each fact.
 */
const overrideRankAwardPromoterAsAdmin = authedProcedure
  .meta({ permission: "belt.admin", rateLimit: { points: 120, duration: 60 * 60 } })
  .input(overrideRankAwardPromoterAsAdminInput)
  .handler(async ({ input, context }) => {
    const award = await db.rankAward.findUnique({
      where: { id: input.rankAwardId },
      select: factEditSelect,
    })
    if (!award) {
      throw new ORPCError("NOT_FOUND", { message: "Belt award not found" })
    }

    const result = await db.$transaction(
      tx =>
        overrideCapturedPromoterReview({
          tx,
          rankAwardId: award.id,
          actingUserId: context.user.id,
          resolvePromoterData: () => resolveFactUpdateWithCapture(tx, { promoter: input.promoter }),
        }),
      { maxWait: 10000, timeout: 20000 },
    )

    context.revalidate({
      paths: [
        "/app/belt-reviews",
        `/app/belt-reviews/${result.reviewId}`,
        ...REVALIDATE_PATHS,
        "/lineage",
      ],
      tags: ["lineage"],
    })
    return enrichedCard(result.passportId, award.id)
  })

/**
 * `attachMilestoneMedia(rankMilestoneId, mediaId, purpose)` — link a Media row to
 * an OWN milestone via `MediaAttachment.rankMilestoneId` (Slice 2 column). Idempotent.
 */
const attachMilestoneMedia = beltProcedure
  .input(attachMilestoneMediaInput)
  .handler(async ({ input, context }) => {
    const passportId = await getActingPassportId(context.user.id)

    const milestone = await findOwnMilestone(passportId, input.rankMilestoneId)

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

    const milestone = await findOwnMilestone(passportId, input.rankMilestoneId)

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

    await db.$transaction(async tx => {
      await lockRankAward(tx, input.rankAwardId)
      const awards = await getMemberAwards(passportId, tx)
      const target = awards.find(a => a.id === input.rankAwardId)
      if (!target) throw new ORPCError("NOT_FOUND", { message: "Belt award not found" })

      // Delete must not exceed edit. Re-evaluate under the same award lock used by approve,
      // override, and member proposals so no pending review can be cascade-erased in a race.
      if (!isFactEditable(target)) {
        throw new ORPCError("FORBIDDEN", {
          message: "This belt was verified by an instructor and cannot be deleted",
        })
      }
      if (isTopAward(input.rankAwardId, awards.map(toGateAward), disciplineId)) {
        throw new ORPCError("FORBIDDEN", { message: "You cannot delete your current top belt" })
      }
      if (await hasLockedRankEntryReviewHistory(tx, input.rankAwardId)) {
        throw new ORPCError("CONFLICT", {
          message: "This belt has promoter review history and cannot be deleted.",
        })
      }

      await tx.rankAward.delete({ where: { id: input.rankAwardId } })
    })

    context.revalidate({ paths: REVALIDATE_PATHS })
    return { deleted: true as const, rankAwardId: input.rankAwardId }
  })

export const belt = {
  upsertBeltMilestone,
  updateRankAwardFact,
  updateRankAwardFactAsAdmin,
  overrideRankAwardPromoterAsAdmin,
  attachMilestoneMedia,
  detachMilestoneMedia,
  deleteRankAward,
}
