/**
 * Belt oRPC procedures — HARD invariant integration test (Slice 3, Petey Plan 0477).
 *
 * Real Postgres fixtures against the SEEDED BJJ ladder (the procedures resolve
 * the real BJJ disciplineId from `rankSystem.discipline.code = "bjj"`, so the
 * test rides the same ranks the app does — never a parallel discipline). Only
 * the member/other Passports + their awards/milestones are fixtures; the seed
 * ranks are read, never mutated or deleted.
 *
 * Procedures are invoked through the live oRPC pipeline (`createRouterClient`
 * with an injected session context, `source: "rsc"` so the rate-limit middleware
 * is skipped — the same seam RSC uses). Proves the four non-negotiable invariants
 * end-to-end:
 *
 *   1. a member CANNOT create/enrich a rank ABOVE their ceiling (no self-promotion);
 *      a backfill at/below the ceiling mints VERIFIED-by-implication, never UNVERIFIED (B1)
 *   2. a member CANNOT edit an authority-owned award's fact (IMPORTED / promotion-minted);
 *      a self-added backfill's fact IS editable
 *   3. a member CANNOT delete their TOP award
 *   4. a member edits ONLY their own Passport (no cross-Passport reach)
 *   + rankId is never changed by an update (the fact edit has no rankId input)
 *
 * Run: cd apps/web && bun run test server/belt/router.integration.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"
import { createRouterClient, ORPCError } from "@orpc/server"

mock.module("next/cache", () => ({
  revalidatePath: () => {},
  updateTag: () => {},
  revalidateTag: () => {},
  cacheLife: () => {},
  cacheTag: () => {},
}))

import { Brand } from "~/.generated/prisma/client"
import { appRouter } from "~/server/router"
import { projectProfileBeltEntries } from "~/server/belt/profile-projection"
import { gateAwardSelect, getMemberAwards, toGateAward } from "~/server/belt/queries"
import { db } from "~/services/db"

const TS = Date.now()
const TAG_PREFIX = "belt-router-test-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`

type SessionUser = { id: string; role: string | null }

/** Invoke the belt router as a specific signed-in member (rsc source → no rate limit). */
const asMember = (user: SessionUser) =>
  createRouterClient(appRouter, {
    context: { user: user as never, source: "rsc" as const, brand: Brand.BBL },
  }).belt

/** Resolve a seeded BJJ rank id by exact name. */
async function bjjRankId(name: string): Promise<string> {
  const rank = await db.rank.findFirstOrThrow({
    where: { name, rankSystem: { discipline: { code: "bjj" } } },
    select: { id: true },
  })
  return rank.id
}

type Fixtures = {
  memberUserId: string
  memberPassportId: string
  otherUserId: string
  otherPassportId: string
  // seeded BJJ ladder points (sortOrder asc): white(1) < blue(6) < purple(11) < brown(16)
  whiteRankId: string
  blueRankId: string
  purpleRankId: string
  brownRankId: string
  // member awards
  whiteAwardId: string // VERIFIED-by-implication self-backfill (fact EDITABLE, B1)
  blueAwardId: string // IMPORTED awarded truth = member's BJJ top (the ceiling; fact READ-ONLY)
  // another passport's award + milestone (ownership boundary)
  otherAwardId: string
  otherMilestoneId: string
}

let fx: Fixtures

beforeAll(async () => {
  const memberUser = await db.user.create({
    data: { name: tag("member"), email: `${tag("member")}@test.local` },
  })
  const otherUser = await db.user.create({
    data: { name: tag("other"), email: `${tag("other")}@test.local` },
  })

  const memberPassport = await db.passport.create({
    data: { displayName: tag("member-pp"), userId: memberUser.id },
  })
  const otherPassport = await db.passport.create({
    data: { displayName: tag("other-pp"), userId: otherUser.id },
  })

  const whiteRankId = await bjjRankId("White Belt")
  const blueRankId = await bjjRankId("Blue Belt")
  const purpleRankId = await bjjRankId("Purple Belt")
  const brownRankId = await bjjRankId("Brown Belt")

  // Member's belts (B1): blue is the IMPORTED awarded-truth ceiling (read-only);
  // white is a self-added VERIFIED-by-implication backfill below it (fact editable).
  // No `awardedById` on white → self-added; the IMPORTED status alone locks blue.
  const whiteAward = await db.rankAward.create({
    data: {
      passportId: memberPassport.id,
      rankId: whiteRankId,
      source: "STATED",
      verificationStatus: "VERIFIED",
    },
    select: { id: true },
  })
  const blueAward = await db.rankAward.create({
    data: {
      passportId: memberPassport.id,
      rankId: blueRankId,
      source: "STATED",
      verificationStatus: "IMPORTED",
    },
    select: { id: true },
  })

  // Another passport's award + milestone — the ownership boundary target.
  const otherAward = await db.rankAward.create({
    data: {
      passportId: otherPassport.id,
      rankId: purpleRankId,
      source: "STATED",
      verificationStatus: "VERIFIED",
    },
    select: { id: true },
  })
  const otherMilestone = await db.rankMilestone.create({
    data: { rankAwardId: otherAward.id, story: "other member's story" },
    select: { id: true },
  })

  // Match the committed RankEntry backfill for post-migration test rows. The
  // profile loader must use these canonical rows as its query root.
  await db.rankEntry.createMany({
    data: [
      {
        passportId: memberPassport.id,
        rankId: whiteRankId,
        rankAwardId: whiteAward.id,
        status: "VERIFIED",
      },
      {
        passportId: memberPassport.id,
        rankId: blueRankId,
        rankAwardId: blueAward.id,
        // IMPORTED award → VERIFIED entry (SESSION_0522): the backfill this fixture
        // mirrors now derives an IMPORTED award to a VERIFIED member-facing RankEntry.
        status: "VERIFIED",
      },
      {
        passportId: otherPassport.id,
        rankId: purpleRankId,
        rankAwardId: otherAward.id,
        status: "VERIFIED",
      },
    ],
  })

  fx = {
    memberUserId: memberUser.id,
    memberPassportId: memberPassport.id,
    otherUserId: otherUser.id,
    otherPassportId: otherPassport.id,
    whiteRankId,
    blueRankId,
    purpleRankId,
    brownRankId,
    whiteAwardId: whiteAward.id,
    blueAwardId: blueAward.id,
    otherAwardId: otherAward.id,
    otherMilestoneId: otherMilestone.id,
  }
})

afterAll(async () => {
  if (!fx) return
  const passportIds = [fx.memberPassportId, fx.otherPassportId]
  // Cascade-aware: MediaAttachment has no cascade from RankMilestone, so drop
  // attachments first; RankMilestone cascades from RankAward.
  await db.mediaAttachment.deleteMany({
    where: { rankMilestone: { rankAward: { passportId: { in: passportIds } } } },
  })
  await db.mediaAttachment.deleteMany({ where: { rankAward: { passportId: { in: passportIds } } } })
  await db.rankAward.deleteMany({ where: { passportId: { in: passportIds } } })
  await db.passport.deleteMany({ where: { id: { in: passportIds } } })
  // Freetext-promoter placeholder Passports minted by the belt path (SESSION_0540): accountless,
  // tag-named. Swept after the member awards (their promoter FK) are gone.
  await db.passport.deleteMany({
    where: { userId: null, displayName: { startsWith: TAG_PREFIX } },
  })
  // The backfill-verification decision (`applyBackfillTrustDecision`) audits status changes with
  // the acting member's userId → drop those before the User RESTRICT-FK delete.
  await db.auditLog.deleteMany({ where: { userId: { in: [fx.memberUserId, fx.otherUserId] } } })
  await db.user.deleteMany({ where: { id: { in: [fx.memberUserId, fx.otherUserId] } } })

  // Sweep the school-outreach lead/org the freetext-school test emits (tag-scoped).
  await db.leadFollowUp.deleteMany({
    where: { lead: { organization: { name: { startsWith: TAG_PREFIX } } } },
  })
  await db.lead.deleteMany({ where: { organization: { name: { startsWith: TAG_PREFIX } } } })
  await db.organization.deleteMany({ where: { name: { startsWith: TAG_PREFIX } } })

  // Sweep the promoter-outreach leads the freetext-promoter tests emit (coach = tag-named
  // firstName), then remove the SHARED coach-outreach bucket org only if this run left it empty.
  await db.leadFollowUp.deleteMany({ where: { lead: { firstName: { startsWith: TAG_PREFIX } } } })
  await db.lead.deleteMany({ where: { firstName: { startsWith: TAG_PREFIX } } })
  await db.organization.deleteMany({
    where: { slug: "bbl-coach-outreach", leads: { none: {} } },
  })
})

const member = () => asMember({ id: fx.memberUserId, role: "user" })
const other = () => asMember({ id: fx.otherUserId, role: "user" })

const expectCode = async (
  promise: Promise<unknown>,
  code: "FORBIDDEN" | "NOT_FOUND" | "BAD_REQUEST",
) => {
  try {
    await promise
    throw new Error(`expected the call to reject with ${code}`)
  } catch (error) {
    expect(error).toBeInstanceOf(ORPCError)
    expect((error as ORPCError<string, unknown>).code).toBe(code)
  }
}

describe("belt.upsertBeltMilestone — ceiling gate (cannot self-promote)", () => {
  it("loads the /app/profile belt projection from RankEntry status", async () => {
    const [entries, ladder, awards] = await Promise.all([
      db.rankEntry.findMany({
        where: { passportId: fx.memberPassportId, status: { not: "PENDING" } },
        select: { rankId: true, status: true, rankAward: { select: gateAwardSelect } },
      }),
      db.rank.findMany({
        where: { id: { in: [fx.whiteRankId, fx.blueRankId] } },
        select: {
          id: true,
          name: true,
          colorHex: true,
          sortOrder: true,
          secondaryColorHex: true,
          degree: true,
          beltFamily: true,
        },
      }),
      getMemberAwards(fx.memberPassportId),
    ])
    const data = projectProfileBeltEntries({
      ladder,
      entries: entries.map(entry => ({ ...entry, hasPendingReview: false })),
      awards: awards.map(toGateAward),
      disciplineId: entries[0]!.rankAward.rank.rankSystem.disciplineId!,
    })
    const blue = data.ranks.find(rank => rank.rank.id === fx.blueRankId)

    // The legacy Award retains IMPORTED provenance, but the profile's member-facing
    // status comes from its RankEntry compatibility anchor — and IMPORTED derives to
    // VERIFIED (SESSION_0522: BBL's established lineage is verified truth).
    expect(blue?.card?.verificationStatus).toBe("VERIFIED")
  })

  it("ALLOWS enriching the IMPORTED ceiling belt (blue) — milestone editable, award stays read-only", async () => {
    const card = await member().upsertBeltMilestone({
      rankId: fx.blueRankId,
      story: "my blue journey",
    })
    expect(card.rankId).toBe(fx.blueRankId)
    // The award retains IMPORTED provenance (fact stays read-only), while the
    // canonical member-facing RankEntry status derives to VERIFIED (SESSION_0522
    // IMPORTED→VERIFIED mapping); enriching a milestone changes neither.
    expect(card.verificationStatus).toBe("VERIFIED")
    expect(card.isFactEditable).toBe(false)
    expect(card.milestone?.story).toBe("my blue journey")
    expect(
      await db.rankEntry.findUniqueOrThrow({
        where: { rankAwardId: fx.blueAwardId },
        select: { status: true },
      }),
    ).toEqual({ status: "VERIFIED" })
  })

  it("enriches a self-added backfill BELOW the ceiling (white) — VERIFIED-by-implication, fact editable (B1)", async () => {
    const card = await member().upsertBeltMilestone({ rankId: fx.whiteRankId, story: "day one" })
    expect(card.rankId).toBe(fx.whiteRankId)
    // B1: a backfill at/below the ceiling is VERIFIED-by-implication, never UNVERIFIED,
    // and — being self-added (no approver) — its facts remain member-editable.
    expect(card.verificationStatus).toBe("VERIFIED")
    expect(card.isFactEditable).toBe(true)
    expect(card.milestone?.story).toBe("day one")
  })

  it("DENIES creating a belt ABOVE the ceiling (purple → FORBIDDEN) and writes no phantom award", async () => {
    await expectCode(
      member().upsertBeltMilestone({ rankId: fx.purpleRankId, story: "nope" }),
      "FORBIDDEN",
    )
    const leaked = await db.rankAward.findFirst({
      where: { passportId: fx.memberPassportId, rankId: fx.purpleRankId },
    })
    expect(leaked).toBeNull()
  })

  it("DENIES creating a belt WAY above the ceiling (brown → FORBIDDEN)", async () => {
    await expectCode(member().upsertBeltMilestone({ rankId: fx.brownRankId }), "FORBIDDEN")
  })
})

describe("profile belt read ceiling — RankAward-sourced, orphan-RankEntry regression (FI-021)", () => {
  // A member whose TOP award (purple) has NO synced RankEntry — the exact shape
  // that collapsed the entry-sourced read ceiling while the RankAward-sourced
  // WRITE gate still allowed edits (belts falsely rendered locked). The read
  // ceiling must come from getMemberAwards + ceilingSortOrder — the SAME pair
  // the write gate uses — so it includes the orphan award. (PENDING promotions
  // live as claims, never RankAwards, so they still cannot raise this ceiling.)
  let orphanUserId: string
  let orphanPassportId: string

  beforeAll(async () => {
    const user = await db.user.create({
      data: { name: tag("orphan"), email: `${tag("orphan")}@test.local` },
    })
    const passport = await db.passport.create({
      data: { displayName: tag("orphan-pp"), userId: user.id },
      select: { id: true },
    })
    // White: the normal cutover shape — award WITH its synced RankEntry.
    const white = await db.rankAward.create({
      data: {
        passportId: passport.id,
        rankId: fx.whiteRankId,
        source: "STATED",
        verificationStatus: "VERIFIED",
      },
      select: { id: true },
    })
    await db.rankEntry.create({
      data: {
        passportId: passport.id,
        rankId: fx.whiteRankId,
        rankAwardId: white.id,
        status: "VERIFIED",
      },
    })
    // Purple: the member's TOP award, deliberately WITHOUT a RankEntry (unsynced).
    await db.rankAward.create({
      data: {
        passportId: passport.id,
        rankId: fx.purpleRankId,
        source: "STATED",
        verificationStatus: "VERIFIED",
      },
    })
    orphanUserId = user.id
    orphanPassportId = passport.id
  })

  afterAll(async () => {
    await db.rankAward.deleteMany({ where: { passportId: orphanPassportId } })
    await db.passport.deleteMany({ where: { id: orphanPassportId } })
    await db.user.deleteMany({ where: { id: orphanUserId } })
  })

  it("a RankAward with NO RankEntry still sets the read ceiling (read gate == write gate)", async () => {
    // Mirror the loader's exact read seam (belt-tab-loader.ts): RankEntries for
    // cards, getMemberAwards for the ceiling.
    const [entries, ladder, awards] = await Promise.all([
      db.rankEntry.findMany({
        where: { passportId: orphanPassportId, status: { not: "PENDING" } },
        select: { rankId: true, status: true, rankAward: { select: gateAwardSelect } },
        orderBy: { rank: { sortOrder: "desc" } },
      }),
      db.rank.findMany({
        where: { id: { in: [fx.whiteRankId, fx.blueRankId, fx.purpleRankId] } },
        select: {
          id: true,
          name: true,
          colorHex: true,
          sortOrder: true,
          secondaryColorHex: true,
          degree: true,
          beltFamily: true,
        },
        orderBy: { sortOrder: "asc" },
      }),
      getMemberAwards(orphanPassportId),
    ])
    const purple = ladder.find(rank => rank.id === fx.purpleRankId)!
    const white = ladder.find(rank => rank.id === fx.whiteRankId)!

    const data = projectProfileBeltEntries({
      ladder,
      entries: entries.map(entry => ({ ...entry, hasPendingReview: false })),
      awards: awards.map(toGateAward),
      disciplineId: awards[0]!.rank.rankSystem!.disciplineId!,
    })

    // The orphan (entry-less) purple award IS the ceiling — not the white entry.
    expect(entries.some(entry => entry.rankId === fx.purpleRankId)).toBe(false)
    expect(data.ceiling).toBe(purple.sortOrder)
    expect(data.ceiling).toBeGreaterThan(white.sortOrder)

    // And the WRITE gate agrees: enriching blue (below the orphan ceiling) is
    // ALLOWED — the read model can never render a belt locked that the write
    // path accepts.
    const card = await asMember({ id: orphanUserId, role: "user" }).upsertBeltMilestone({
      rankId: fx.blueRankId,
      story: "orphan-ceiling blue journey",
    })
    expect(card.rankId).toBe(fx.blueRankId)
    expect(card.milestone?.story).toBe("orphan-ceiling blue journey")
  })
})

describe("belt.updateRankAwardFact — self-backfill-only + never-changes-rankId + ownership", () => {
  it("a freetext promoter mints a placeholder Passport FK + a linked recruitment Lead, keeps the backfill UNVERIFIED (recruiting), NEVER changing rankId", async () => {
    const before = await db.rankAward.findUniqueOrThrow({
      where: { id: fx.whiteAwardId },
      select: { rankId: true },
    })
    const promoterName = tag("Prof Freetext")
    const card = await member().updateRankAwardFact({
      rankAwardId: fx.whiteAwardId,
      awardedAt: new Date("2022-06-01"),
      promoter: { name: promoterName },
      school: { name: tag("Freetext BJJ Academy") },
    })
    expect(card.rankId).toBe(before.rankId) // rankId untouched in the read model
    expect(card.promoterName).toBe(promoterName)
    expect(card.schoolName).toBe(tag("Freetext BJJ Academy"))

    // SESSION_0540 rework: the free-typed coach is now a PERSON, not a name in `notes` — the
    // FK points at a fresh, accountless, off-tree (hidden) placeholder Passport the coach can
    // later claim. The typed label rides `notes` too (card + editor prefill).
    expect(card.awardedByPassportId).not.toBeNull()
    const promoterPassport = await db.passport.findUniqueOrThrow({
      where: { id: card.awardedByPassportId! },
      select: { userId: true, displayName: true, lineageNode: { select: { id: true } } },
    })
    expect(promoterPassport.userId).toBeNull() // claimable placeholder (no account)
    expect(promoterPassport.lineageNode).toBeNull() // off-tree → surfaced nowhere public
    expect(promoterPassport.displayName).toBe(promoterName)

    // The SECOND artifact (operator model): a recruitment Lead on the shared coach-outreach
    // bucket org, LINKED to the placeholder Passport via `meta.passportId`.
    const lead = await db.lead.findFirst({
      where: { firstName: promoterName, organization: { slug: "bbl-coach-outreach" } },
      select: { meta: true },
    })
    expect(lead).not.toBeNull()
    expect((lead!.meta as Record<string, unknown>).passportId).toBe(card.awardedByPassportId)

    const after = await db.rankAward.findUniqueOrThrow({
      where: { id: fx.whiteAwardId },
      select: { rankId: true },
    })
    expect(after.rankId).toBe(before.rankId) // and at the DB layer

    // SESSION_0518: the existing profile editor is the first RankEntry write
    // seam. Its compatibility mirror must move in the same transaction as the
    // legacy fact so the new aggregate is ready for the next read-model slice.
    // SESSION_0540: a fresh free-typed coach is a recruited placeholder awaiting their own
    // claim + confirm (phase 2) → the backfill stays UNVERIFIED, with NO instructor review.
    const rankEntry = await db.rankEntry.findUniqueOrThrow({
      where: { rankAwardId: fx.whiteAwardId },
      select: { passportId: true, rankId: true, status: true },
    })
    expect(rankEntry).toEqual({
      passportId: fx.memberPassportId,
      rankId: before.rankId,
      status: "UNVERIFIED",
    })
  })

  it("links a REGISTERED promoter by Passport id + resolves its name (SESSION_0497 — P2003 regression)", async () => {
    const card = await member().updateRankAwardFact({
      rankAwardId: fx.whiteAwardId,
      promoter: { awardedByPassportId: fx.otherPassportId },
    })
    // The picker now sends a Passport id → the FK stores it verbatim (no node→passport
    // mismatch, so no P2003 → no swallowed 500). This is the case with ZERO prior coverage.
    expect(card.awardedByPassportId).toBe(fx.otherPassportId)
    // …and the read model resolves the registered promoter's name (`notes` stays null).
    expect(card.promoterName).toBe(tag("other-pp"))

    const row = await db.rankAward.findUniqueOrThrow({
      where: { id: fx.whiteAwardId },
      select: { awardedByPassportId: true, notes: true },
    })
    expect(row.awardedByPassportId).toBe(fx.otherPassportId)
    expect(row.notes).toBeNull()
  })

  it("REJECTS a promoter id that is not a real Passport with BAD_REQUEST (not a swallowed 500)", async () => {
    await expectCode(
      member().updateRankAwardFact({
        rankAwardId: fx.whiteAwardId,
        promoter: { awardedByPassportId: "not-a-real-passport-id" },
      }),
      "BAD_REQUEST",
    )
  })

  it("emits a deduped school-outreach placeholder org + lead for the freetext school (flywheel, no send)", async () => {
    const org = await db.organization.findFirst({
      where: { name: { startsWith: TAG_PREFIX }, ownerId: null },
      select: { id: true },
    })
    expect(org).not.toBeNull()
    const lead = await db.lead.findFirst({ where: { organizationId: org?.id } })
    expect(lead).not.toBeNull()
  })

  // SESSION_0501 ratified policy (fill-blanks): the OWNER may SET a currently-EMPTY
  // fact on their own award of ANY source — including IMPORTED — but may NEVER
  // modify a fact that already has a value on an authority-owned award.
  it("ALLOWS the owner FILLING the EMPTY date on their own IMPORTED award (fill-blanks — SESSION_0501)", async () => {
    const card = await member().updateRankAwardFact({
      rankAwardId: fx.blueAwardId,
      awardedAt: new Date("2020-01-01"),
    })
    expect(card.awardedAt?.toISOString().slice(0, 10)).toBe("2020-01-01")
    // Still authority-owned: never flips into the full-edit (self-backfill) class,
    // and the date fact is now FILLED → locked for the member.
    expect(card.isFactEditable).toBe(false)
    expect(card.factEditability.awardedAt).toBe(false)
    expect(
      await db.rankEntry.findUniqueOrThrow({
        where: { rankAwardId: fx.blueAwardId },
        select: { status: true },
      }),
      // IMPORTED award derives to a VERIFIED entry (SESSION_0522); the fill-blanks
      // fact edit re-syncs the entry but leaves the award's IMPORTED provenance intact.
    ).toEqual({ status: "VERIFIED" })
  })

  it("DENIES the owner CHANGING the now-FILLED date on the IMPORTED award (no overwrite → FORBIDDEN)", async () => {
    await expectCode(
      member().updateRankAwardFact({
        rankAwardId: fx.blueAwardId,
        awardedAt: new Date("2021-12-31"),
      }),
      "FORBIDDEN",
    )
    const row = await db.rankAward.findUniqueOrThrow({
      where: { id: fx.blueAwardId },
      select: { awardedAt: true },
    })
    expect(row.awardedAt?.toISOString().slice(0, 10)).toBe("2020-01-01")
  })

  it("ALLOWS the owner filling the EMPTY promoter on the IMPORTED award with a REGISTERED passport (semantics preserved)", async () => {
    const card = await member().updateRankAwardFact({
      rankAwardId: fx.blueAwardId,
      promoter: { awardedByPassportId: fx.otherPassportId },
    })
    expect(card.awardedByPassportId).toBe(fx.otherPassportId)
    expect(card.promoterName).toBe(tag("other-pp"))
    expect(card.factEditability.promoter).toBe(false) // filled → locked
    const row = await db.rankAward.findUniqueOrThrow({
      where: { id: fx.blueAwardId },
      select: { notes: true },
    })
    expect(row.notes).toBeNull()
  })

  it("DENIES a fact edit on ANOTHER member's award (ownership → NOT_FOUND)", async () => {
    await expectCode(
      member().updateRankAwardFact({
        rankAwardId: fx.otherAwardId,
        awardedAt: new Date("2020-01-01"),
      }),
      "NOT_FOUND",
    )
  })
})

describe("belt backfill trust rework (SESSION_0540) — mint UNVERIFIED + promoter decision tree", () => {
  // A member with an IMPORTED anchor whose promoter IS set (`anchorCoach`), so the anchor promoter
  // is comparable. white is NOT pre-created → it is MINTED via upsertBeltMilestone (proving the
  // UNVERIFIED mint) and then re-pointed at different promoters to exercise every branch.
  let trustUserId: string
  let trustPassportId: string
  let anchorCoachPassportId: string // registered person (has a User) = the anchor's promoter
  let otherCoachPassportId: string // a DIFFERENT registered person ≠ anchor
  let anchorCoachUserId: string
  let otherCoachUserId: string
  let whiteAwardId: string

  const trust = () => asMember({ id: trustUserId, role: "user" })

  beforeAll(async () => {
    const trustUser = await db.user.create({
      data: { name: tag("trust"), email: `${tag("trust")}@test.local` },
    })
    const trustPassport = await db.passport.create({
      data: { displayName: tag("trust-pp"), userId: trustUser.id },
      select: { id: true },
    })
    const anchorCoachUser = await db.user.create({
      data: { name: tag("anchor-coach"), email: `${tag("anchor-coach")}@test.local` },
    })
    const anchorCoach = await db.passport.create({
      data: { displayName: tag("anchor-coach-pp"), userId: anchorCoachUser.id },
      select: { id: true },
    })
    const otherCoachUser = await db.user.create({
      data: { name: tag("other-coach"), email: `${tag("other-coach")}@test.local` },
    })
    const otherCoach = await db.passport.create({
      data: { displayName: tag("other-coach-pp"), userId: otherCoachUser.id },
      select: { id: true },
    })

    // Anchor: an IMPORTED blue whose promoter is the anchor coach. This makes blue the ceiling
    // (6) and the resolved anchor, so a white(1) backfill is at/below the ceiling and comparable.
    await db.rankAward.create({
      data: {
        passportId: trustPassport.id,
        rankId: fx.blueRankId,
        source: "STATED",
        verificationStatus: "IMPORTED",
        awardedByPassportId: anchorCoach.id,
      },
    })

    trustUserId = trustUser.id
    trustPassportId = trustPassport.id
    anchorCoachPassportId = anchorCoach.id
    otherCoachPassportId = otherCoach.id
    anchorCoachUserId = anchorCoachUser.id
    otherCoachUserId = otherCoachUser.id
  })

  afterAll(async () => {
    await db.rankEntryReview.deleteMany({ where: { rankEntry: { passportId: trustPassportId } } })
    await db.rankAward.deleteMany({ where: { passportId: trustPassportId } })
    await db.auditLog.deleteMany({ where: { userId: trustUserId } })
    // The freetext-recruit placeholder (accountless, tag-named).
    await db.passport.deleteMany({
      where: { userId: null, displayName: { startsWith: TAG_PREFIX } },
    })
    await db.passport.deleteMany({
      where: { id: { in: [trustPassportId, anchorCoachPassportId, otherCoachPassportId] } },
    })
    await db.user.deleteMany({
      where: { id: { in: [trustUserId, anchorCoachUserId, otherCoachUserId] } },
    })
  })

  it("MINTS a self-added backfill UNVERIFIED (no more VERIFIED-by-implication), fact editable", async () => {
    const card = await trust().upsertBeltMilestone({ rankId: fx.whiteRankId, story: "day one" })
    expect(card.rankId).toBe(fx.whiteRankId)
    expect(card.verificationStatus).toBe("UNVERIFIED")
    expect(card.isFactEditable).toBe(true) // self-added STATED, no approver → still editable
    whiteAwardId = card.rankAwardId
    const row = await db.rankAward.findUniqueOrThrow({
      where: { id: whiteAwardId },
      select: { verificationStatus: true, awardedById: true },
    })
    expect(row.verificationStatus).toBe("UNVERIFIED")
    expect(row.awardedById).toBeNull()
  })

  it("PROMOTES the backfill to VERIFIED when its promoter equals the anchor's promoter (same coach)", async () => {
    const card = await trust().updateRankAwardFact({
      rankAwardId: whiteAwardId,
      promoter: { awardedByPassportId: anchorCoachPassportId },
    })
    expect(card.awardedByPassportId).toBe(anchorCoachPassportId)
    expect(card.verificationStatus).toBe("VERIFIED")
    expect(
      await db.rankAward.findUniqueOrThrow({
        where: { id: whiteAwardId },
        select: { verificationStatus: true },
      }),
    ).toEqual({ verificationStatus: "VERIFIED" })
  })

  it("RECRUITS a fresh free-typed coach — placeholder FK, stays UNVERIFIED, NO instructor review", async () => {
    const card = await trust().updateRankAwardFact({
      rankAwardId: whiteAwardId,
      promoter: { name: tag("Fresh Recruit Coach") },
    })
    // Downgraded from the prior VERIFIED (the coach changed) but NO review — recruiting.
    expect(card.verificationStatus).toBe("UNVERIFIED")
    const promoter = await db.passport.findUniqueOrThrow({
      where: { id: card.awardedByPassportId! },
      select: { userId: true, lineageNode: { select: { id: true } } },
    })
    expect(promoter.userId).toBeNull() // a claimable placeholder → recruiting, not a promoter-change
    expect(promoter.lineageNode).toBeNull()

    const entry = await db.rankEntry.findUniqueOrThrow({
      where: { rankAwardId: whiteAwardId },
      select: { id: true },
    })
    const review = await db.rankEntryReview.findFirst({
      where: { rankEntryId: entry.id, status: "PENDING", reason: "PROMOTER_CHANGED" },
    })
    expect(review).toBeNull()
  })

  it("FLAGS an established different coach — UNVERIFIED + one idempotent PENDING PROMOTER_CHANGED review", async () => {
    const card = await trust().updateRankAwardFact({
      rankAwardId: whiteAwardId,
      promoter: { awardedByPassportId: otherCoachPassportId },
    })
    expect(card.awardedByPassportId).toBe(otherCoachPassportId)
    expect(card.verificationStatus).toBe("UNVERIFIED")

    const entry = await db.rankEntry.findUniqueOrThrow({
      where: { rankAwardId: whiteAwardId },
      select: { id: true },
    })
    const reviews = await db.rankEntryReview.findMany({
      where: { rankEntryId: entry.id, status: "PENDING", reason: "PROMOTER_CHANGED" },
    })
    expect(reviews).toHaveLength(1) // one review, and re-saving would not duplicate it
  })
})

describe("belt fill-blanks + admin fact CRUD — SESSION_0501 ratified policy", () => {
  // Dedicated fixtures: a member whose IMPORTED award has FILLED date + freetext
  // promoter (school left EMPTY — per-fact granularity target), plus an admin user
  // deliberately created WITHOUT a Passport (the admin path must not require one).
  let filledUserId: string
  let filledPassportId: string
  let filledAwardId: string
  let adminUserId: string

  const FILLED_DATE = "2018-04-04"

  beforeAll(async () => {
    const filledUser = await db.user.create({
      data: { name: tag("filled"), email: `${tag("filled")}@test.local` },
    })
    const filledPassport = await db.passport.create({
      data: { displayName: tag("filled-pp"), userId: filledUser.id },
      select: { id: true },
    })
    // Brown self-backfill = the ceiling (keeps the IMPORTED blue off the top-award guard).
    await db.rankAward.create({
      data: {
        passportId: filledPassport.id,
        rankId: fx.brownRankId,
        source: "STATED",
        verificationStatus: "VERIFIED",
      },
    })
    const filledAward = await db.rankAward.create({
      data: {
        passportId: filledPassport.id,
        rankId: fx.blueRankId,
        source: "STATED",
        verificationStatus: "IMPORTED",
        awardedAt: new Date(FILLED_DATE),
        notes: "Prof. Legacy", // FILLED freetext promoter
        // organizationId + location left null → school EMPTY (fillable)
      },
      select: { id: true },
    })
    const adminUser = await db.user.create({
      data: { name: tag("admin"), email: `${tag("admin")}@test.local`, role: "admin" },
    })

    filledUserId = filledUser.id
    filledPassportId = filledPassport.id
    filledAwardId = filledAward.id
    adminUserId = adminUser.id
  })

  afterAll(async () => {
    await db.auditLog.deleteMany({ where: { userId: adminUserId } })
    await db.rankAward.deleteMany({ where: { passportId: filledPassportId } })
    await db.passport.deleteMany({ where: { id: filledPassportId } })
    await db.user.deleteMany({ where: { id: { in: [filledUserId, adminUserId] } } })
  })

  const filledOwner = () => asMember({ id: filledUserId, role: "user" })
  const admin = () => asMember({ id: adminUserId, role: "admin" })

  it("(a) DENIES the owner OVERWRITING the FILLED date on an authority-owned award (→ FORBIDDEN)", async () => {
    await expectCode(
      filledOwner().updateRankAwardFact({
        rankAwardId: filledAwardId,
        awardedAt: new Date("2011-11-11"),
      }),
      "FORBIDDEN",
    )
    const row = await db.rankAward.findUniqueOrThrow({
      where: { id: filledAwardId },
      select: { awardedAt: true },
    })
    expect(row.awardedAt?.toISOString().slice(0, 10)).toBe(FILLED_DATE)
  })

  it("(a) DENIES the owner OVERWRITING or CLEARING the FILLED promoter (→ FORBIDDEN, value intact)", async () => {
    await expectCode(
      filledOwner().updateRankAwardFact({
        rankAwardId: filledAwardId,
        promoter: { name: "Impostor Prof" },
      }),
      "FORBIDDEN",
    )
    // Clearing (explicit null) is a modification too.
    await expectCode(
      filledOwner().updateRankAwardFact({ rankAwardId: filledAwardId, promoter: null }),
      "FORBIDDEN",
    )
    const row = await db.rankAward.findUniqueOrThrow({
      where: { id: filledAwardId },
      select: { notes: true },
    })
    expect(row.notes).toBe("Prof. Legacy")
  })

  it("(b) ALLOWS the owner filling the still-EMPTY school on the SAME award (per-fact granularity; freetext → lead)", async () => {
    const schoolName = tag("Fill Blank Academy")
    const card = await filledOwner().updateRankAwardFact({
      rankAwardId: filledAwardId,
      school: { name: schoolName, country: "US" },
    })
    expect(card.schoolName).toBe(schoolName)
    // All three facts now filled on an authority award → fully locked for the member.
    expect(card.factEditability).toEqual({ awardedAt: false, promoter: false, school: false })
    expect(card.editabilityReason).toBe("AUTHORITY_LOCKED")
    // Freetext school semantics preserved on the fill-blanks path: outreach lead emitted.
    const org = await db.organization.findFirst({
      where: { name: schoolName, ownerId: null },
      select: { id: true },
    })
    expect(org).not.toBeNull()
    expect(await db.lead.findFirst({ where: { organizationId: org?.id } })).not.toBeNull()
  })

  it("(d) DENIES a non-admin invoking the admin path (→ FORBIDDEN, nothing written)", async () => {
    await expectCode(
      filledOwner().updateRankAwardFactAsAdmin({
        rankAwardId: filledAwardId,
        awardedAt: new Date("2010-10-10"),
      }),
      "FORBIDDEN",
    )
    const row = await db.rankAward.findUniqueOrThrow({
      where: { id: filledAwardId },
      select: { awardedAt: true },
    })
    expect(row.awardedAt?.toISOString().slice(0, 10)).toBe(FILLED_DATE)
  })

  it("(e) ALLOWS an admin OVERWRITING filled facts on ANOTHER member's IMPORTED award (+ audit row)", async () => {
    const card = await admin().updateRankAwardFactAsAdmin({
      rankAwardId: filledAwardId,
      awardedAt: new Date("2019-03-03"),
      // (f) registered-promoter semantics preserved on the admin path: FK set, notes nulled.
      promoter: { awardedByPassportId: fx.otherPassportId },
    })
    expect(card.awardedAt?.toISOString().slice(0, 10)).toBe("2019-03-03")
    expect(card.awardedByPassportId).toBe(fx.otherPassportId)
    expect(card.promoterName).toBe(tag("other-pp"))
    const row = await db.rankAward.findUniqueOrThrow({
      where: { id: filledAwardId },
      select: { awardedAt: true, awardedByPassportId: true, notes: true },
    })
    expect(row.awardedAt?.toISOString().slice(0, 10)).toBe("2019-03-03")
    expect(row.awardedByPassportId).toBe(fx.otherPassportId)
    expect(row.notes).toBeNull()
    expect(
      await db.rankEntry.findUniqueOrThrow({
        where: { rankAwardId: filledAwardId },
        select: { status: true },
      }),
      // IMPORTED award → VERIFIED entry (SESSION_0522); the admin fact write re-syncs it.
    ).toEqual({ status: "VERIFIED" })

    // Established admin-mutation pattern: audit-log the write.
    const audit = await db.auditLog.findFirst({
      where: { entityType: "RankAward", entityId: filledAwardId, userId: adminUserId },
      orderBy: { createdAt: "desc" },
    })
    expect(audit).not.toBeNull()
    expect(audit?.action).toBe("belt.fact.updated")
  })

  it("(f) admin FREETEXT school overwrite keeps the lead-emitting semantics (same helper, no fork)", async () => {
    const schoolName = tag("Admin Freetext Academy")
    const card = await admin().updateRankAwardFactAsAdmin({
      rankAwardId: filledAwardId,
      school: { name: schoolName, country: "BR" },
    })
    expect(card.schoolName).toBe(schoolName)
    expect(card.organizationId).toBeNull()
    const org = await db.organization.findFirst({
      where: { name: schoolName, ownerId: null },
      select: { id: true },
    })
    expect(org).not.toBeNull()
    expect(await db.lead.findFirst({ where: { organizationId: org?.id } })).not.toBeNull()
  })

  it("REJECTS a stale promoter id on the admin path with BAD_REQUEST (same guard as the member path)", async () => {
    await expectCode(
      admin().updateRankAwardFactAsAdmin({
        rankAwardId: filledAwardId,
        promoter: { awardedByPassportId: "not-a-real-passport-id" },
      }),
      "BAD_REQUEST",
    )
  })

  it("admin path on a NONEXISTENT award → NOT_FOUND (no raw 500)", async () => {
    await expectCode(
      admin().updateRankAwardFactAsAdmin({
        rankAwardId: "award-does-not-exist",
        awardedAt: new Date("2019-03-03"),
      }),
      "NOT_FOUND",
    )
  })
})

describe("belt.deleteRankAward — top-award protection + ownership", () => {
  it("DENIES deleting the member's current TOP award (blue → FORBIDDEN), ceiling preserved", async () => {
    await expectCode(member().deleteRankAward({ rankAwardId: fx.blueAwardId }), "FORBIDDEN")
    const still = await db.rankAward.findUnique({ where: { id: fx.blueAwardId } })
    expect(still).not.toBeNull()
  })

  it("DENIES deleting ANOTHER member's award (ownership → NOT_FOUND)", async () => {
    await expectCode(member().deleteRankAward({ rankAwardId: fx.otherAwardId }), "NOT_FOUND")
    const still = await db.rankAward.findUnique({ where: { id: fx.otherAwardId } })
    expect(still).not.toBeNull()
  })

  it("ALLOWS deleting a NON-top award (white, below ceiling) and CASCADES its milestone", async () => {
    const milestone = await db.rankMilestone.findUnique({ where: { rankAwardId: fx.whiteAwardId } })
    const result = await member().deleteRankAward({ rankAwardId: fx.whiteAwardId })
    expect(result.deleted).toBe(true)
    expect(await db.rankAward.findUnique({ where: { id: fx.whiteAwardId } })).toBeNull()
    if (milestone) {
      expect(await db.rankMilestone.findUnique({ where: { id: milestone.id } })).toBeNull()
    }
  })

  // SESSION_0492 FIX 3 (MED): delete must not exceed edit. A promotion-minted award
  // (awardedById stamped) that is NOT the top award was previously deletable — a
  // member could erase an instructor-verified belt. Uses a dedicated member so the
  // fact-editable guard is what fires, independent of the top-award guard.
  it("DENIES deleting a promotion-minted award (awardedById stamped, non-top → FORBIDDEN)", async () => {
    const u = await db.user.create({
      data: { name: tag("fix3"), email: `${tag("fix3")}@test.local` },
    })
    const pp = await db.passport.create({
      data: { displayName: tag("fix3-pp"), userId: u.id },
      select: { id: true },
    })
    // Top award: brown, a self-added editable award (keeps it OFF the fact-editable guard).
    const topAward = await db.rankAward.create({
      data: {
        passportId: pp.id,
        rankId: fx.brownRankId,
        source: "STATED",
        verificationStatus: "VERIFIED",
      },
      select: { id: true },
    })
    // Non-top: blue, PROMOTION-MINTED (awardedById stamped by an approver) → authority-owned.
    const mintedAward = await db.rankAward.create({
      data: {
        passportId: pp.id,
        rankId: fx.blueRankId,
        source: "STATED",
        verificationStatus: "VERIFIED",
        awardedById: fx.otherUserId, // any approver id → stamped → not fact-editable
      },
      select: { id: true },
    })

    const asFix3 = asMember({ id: u.id, role: "user" })
    await expectCode(asFix3.deleteRankAward({ rankAwardId: mintedAward.id }), "FORBIDDEN")
    expect(await db.rankAward.findUnique({ where: { id: mintedAward.id } })).not.toBeNull()

    // Control: the top self-backfill is fact-editable, so only the TOP-award guard blocks it
    // (proves FIX 3 didn't over-lock); the minted non-top is blocked by FIX 3.
    await expectCode(asFix3.deleteRankAward({ rankAwardId: topAward.id }), "FORBIDDEN")

    await db.rankAward.deleteMany({ where: { passportId: pp.id } })
    await db.passport.delete({ where: { id: pp.id } })
    await db.user.delete({ where: { id: u.id } })
  })
})

describe("belt.attachMilestoneMedia / detachMilestoneMedia — ownership", () => {
  it("DENIES attaching media to ANOTHER member's milestone (ownership → NOT_FOUND)", async () => {
    await expectCode(
      member().attachMilestoneMedia({
        rankMilestoneId: fx.otherMilestoneId,
        mediaId: "any-media-id",
        purpose: "belt",
      }),
      "NOT_FOUND",
    )
  })

  it("DENIES detaching media from ANOTHER member's milestone (ownership → NOT_FOUND)", async () => {
    await expectCode(
      member().detachMilestoneMedia({
        rankMilestoneId: fx.otherMilestoneId,
        mediaId: "any-media-id",
      }),
      "NOT_FOUND",
    )
  })

  it("the OWNER CAN attach media to their OWN milestone (positive ownership control)", async () => {
    const media = await db.media.create({
      data: {
        brand: Brand.BBL,
        url: `https://example.test/${tag("m")}.jpg`,
        type: "IMAGE",
        uploadedById: fx.otherUserId,
      },
      select: { id: true },
    })
    const card = await other().attachMilestoneMedia({
      rankMilestoneId: fx.otherMilestoneId,
      mediaId: media.id,
      purpose: "certificate",
    })
    expect(card.milestone?.media.some(m => m.mediaId === media.id)).toBe(true)

    await db.mediaAttachment.deleteMany({ where: { mediaId: media.id } })
    await db.media.deleteMany({ where: { id: media.id } })
  })

  // SESSION_0492 FIX 2 (HIGH): a caller-supplied mediaId must be a photo THIS user
  // uploaded. Even when the milestone IS the caller's own, a foreign/nonexistent
  // mediaId is refused with a clean NOT_FOUND (never a raw Prisma P2003 500).
  it("DENIES attaching a FOREIGN mediaId (owned by another user) to an OWN milestone (→ NOT_FOUND)", async () => {
    // `other()` owns `otherMilestoneId`, so the milestone-ownership check passes and the
    // media-ownership check is what fires. This media belongs to the MEMBER, not `other`.
    const foreignMedia = await db.media.create({
      data: {
        brand: Brand.BBL,
        url: `https://example.test/${tag("foreign")}.jpg`,
        type: "IMAGE",
        uploadedById: fx.memberUserId,
      },
      select: { id: true },
    })
    await expectCode(
      other().attachMilestoneMedia({
        rankMilestoneId: fx.otherMilestoneId,
        mediaId: foreignMedia.id,
        purpose: "certificate",
      }),
      "NOT_FOUND",
    )
    // Nothing was attached.
    const attached = await db.mediaAttachment.findFirst({ where: { mediaId: foreignMedia.id } })
    expect(attached).toBeNull()

    await db.media.deleteMany({ where: { id: foreignMedia.id } })
  })

  it("DENIES attaching a NONEXISTENT mediaId to an OWN milestone cleanly (→ NOT_FOUND, no 500)", async () => {
    await expectCode(
      other().attachMilestoneMedia({
        rankMilestoneId: fx.otherMilestoneId,
        mediaId: "media-does-not-exist",
        purpose: "certificate",
      }),
      "NOT_FOUND",
    )
  })
})
