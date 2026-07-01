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
 *   1. a member CANNOT create/enrich a rank ABOVE their ceiling (no self-promotion)
 *   2. a member CANNOT edit a VERIFIED award's fact
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
  whiteAwardId: string // VERIFIED (fact read-only)
  blueAwardId: string // UNVERIFIED, = member's BJJ top (the ceiling)
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

  // Member's AWARDED belts: white (VERIFIED) + blue (UNVERIFIED) → ceiling = blue.
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
      verificationStatus: "UNVERIFIED",
    },
    select: { id: true },
  })

  // Another passport's award + milestone — the ownership boundary target.
  const otherAward = await db.rankAward.create({
    data: {
      passportId: otherPassport.id,
      rankId: purpleRankId,
      source: "STATED",
      verificationStatus: "UNVERIFIED",
    },
    select: { id: true },
  })
  const otherMilestone = await db.rankMilestone.create({
    data: { rankAwardId: otherAward.id, story: "other member's story" },
    select: { id: true },
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
  await db.user.deleteMany({ where: { id: { in: [fx.memberUserId, fx.otherUserId] } } })

  // Sweep the school-outreach lead/org the freetext-school test emits (tag-scoped).
  await db.leadFollowUp.deleteMany({
    where: { lead: { organization: { name: { startsWith: TAG_PREFIX } } } },
  })
  await db.lead.deleteMany({ where: { organization: { name: { startsWith: TAG_PREFIX } } } })
  await db.organization.deleteMany({ where: { name: { startsWith: TAG_PREFIX } } })
})

const member = () => asMember({ id: fx.memberUserId, role: "user" })
const other = () => asMember({ id: fx.otherUserId, role: "user" })

const expectCode = async (promise: Promise<unknown>, code: "FORBIDDEN" | "NOT_FOUND") => {
  try {
    await promise
    throw new Error(`expected the call to reject with ${code}`)
  } catch (error) {
    expect(error).toBeInstanceOf(ORPCError)
    expect((error as ORPCError<string, unknown>).code).toBe(code)
  }
}

describe("belt.upsertBeltMilestone — ceiling gate (cannot self-promote)", () => {
  it("ALLOWS enriching a belt AT the ceiling (blue)", async () => {
    const card = await member().upsertBeltMilestone({
      rankId: fx.blueRankId,
      story: "my blue journey",
    })
    expect(card.rankId).toBe(fx.blueRankId)
    expect(card.verificationStatus).toBe("UNVERIFIED")
    expect(card.milestone?.story).toBe("my blue journey")
  })

  it("ALLOWS enriching a belt BELOW the ceiling (white — award already exists, no promotion)", async () => {
    const card = await member().upsertBeltMilestone({ rankId: fx.whiteRankId, story: "day one" })
    expect(card.rankId).toBe(fx.whiteRankId)
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

describe("belt.updateRankAwardFact — verified-only + never-changes-rankId + ownership", () => {
  it("ALLOWS a fact edit on an UNVERIFIED own award (blue) and NEVER changes rankId", async () => {
    const before = await db.rankAward.findUniqueOrThrow({
      where: { id: fx.blueAwardId },
      select: { rankId: true },
    })
    const card = await member().updateRankAwardFact({
      rankAwardId: fx.blueAwardId,
      awardedAt: new Date("2022-06-01"),
      promoter: { name: "Prof. Freetext" },
      school: { name: tag("Freetext BJJ Academy") },
    })
    expect(card.rankId).toBe(before.rankId) // rankId untouched in the read model
    expect(card.promoterName).toBe("Prof. Freetext")
    expect(card.schoolName).toBe(tag("Freetext BJJ Academy"))

    const after = await db.rankAward.findUniqueOrThrow({
      where: { id: fx.blueAwardId },
      select: { rankId: true },
    })
    expect(after.rankId).toBe(before.rankId) // and at the DB layer
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

  it("DENIES a fact edit on a VERIFIED award (white → FORBIDDEN)", async () => {
    await expectCode(
      member().updateRankAwardFact({
        rankAwardId: fx.whiteAwardId,
        awardedAt: new Date("2020-01-01"),
      }),
      "FORBIDDEN",
    )
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
})
