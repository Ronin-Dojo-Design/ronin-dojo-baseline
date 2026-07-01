/**
 * petey-plan-0477 Slice V2 (ADR 0035 Amendment 1) — submitRankPromotionClaim core tests.
 *
 * Run: cd apps/web && bun run test server/web/claims/submit-rank-promotion-claim.test.ts
 *
 * The core runs its DB ops directly (no oRPC middleware), so we call it for real
 * against the dev DB with a seeded owned Passport + a RankAward at a mid BJJ belt
 * (the verified ceiling), using the real seeded BJJ rank ladder.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

// Mock next/cache (pulled in via the import chain).
mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidatePath: () => {},
  revalidateTag: () => {},
  updateTag: () => {},
}))

import { db } from "~/services/db"
import {
  SUBMIT_RANK_PROMOTION_CLAIM_ERROR,
  submitRankPromotionClaim,
} from "./submit-rank-promotion-claim"

const TEST_BRAND = "BBL" as const
const TS = Date.now()
const tag = (name: string) => `s0488-rp-${TS}-${name}`

type Fixtures = {
  memberUserId: string // owns a Passport with a mid-belt RankAward (the ceiling)
  memberPassportId: string
  noPassportUserId: string // signed-in user with no Passport
  lowRankId: string // below the ceiling
  midRankId: string // AT the ceiling (the member's awarded belt)
  highRankId: string // above the ceiling — a valid promotion
  photoMediaId: string // a real Media row for the certificate-photo soft-gate
}

let fx: Fixtures | null = null

beforeAll(async () => {
  // Real seeded BJJ rank ladder — pick three distinct belts from one discipline.
  const bjjRanks = await db.rank.findMany({
    where: { rankSystem: { discipline: { code: "bjj" } } },
    select: { id: true, sortOrder: true, rankSystem: { select: { disciplineId: true } } },
    orderBy: { sortOrder: "asc" },
  })
  const disciplineId = bjjRanks[0]?.rankSystem?.disciplineId ?? null
  const ladder = bjjRanks.filter(r => r.rankSystem?.disciplineId === disciplineId)
  if (ladder.length < 3) {
    throw new Error("Test requires >= 3 seeded BJJ ranks in one discipline")
  }
  const low = ladder[0]
  const mid = ladder[Math.floor(ladder.length / 2)]
  const high = ladder[ladder.length - 1]

  const member = await db.user.create({
    data: { id: tag("member"), name: tag("Member"), email: `${tag("member")}@test.local` },
  })
  const noPassport = await db.user.create({
    data: { id: tag("nopass"), name: tag("NoPass"), email: `${tag("nopass")}@test.local` },
  })

  // The member's OWN Passport (userId attached) + a VERIFIED award at the mid belt = ceiling.
  const passport = await db.passport.create({
    data: {
      id: tag("passport-member"),
      displayName: tag("Member Person"),
      userId: member.id,
      rankAwardsEarned: {
        create: { rankId: mid.id, source: "EARNED", verificationStatus: "VERIFIED" },
      },
    },
    select: { id: true },
  })

  // A real Media row for the certificate-photo soft-gate (the evidence `mediaId` FK is
  // SetNull → it must point at an existing Media to link).
  const photo = await db.media.create({
    data: {
      id: tag("photo"),
      brand: TEST_BRAND,
      type: "IMAGE",
      url: "https://example.com/cert-photo.jpg",
      uploadedById: member.id,
    },
    select: { id: true },
  })

  fx = {
    memberUserId: member.id,
    memberPassportId: passport.id,
    noPassportUserId: noPassport.id,
    lowRankId: low.id,
    midRankId: mid.id,
    highRankId: high.id,
    photoMediaId: photo.id,
  }
})

afterAll(async () => {
  if (!fx) return
  await db.passportClaimEvidence.deleteMany({
    where: { claimRequest: { passportId: fx.memberPassportId } },
  })
  await db.passportClaimRequest.deleteMany({ where: { passportId: fx.memberPassportId } })
  await db.rankAward.deleteMany({ where: { passportId: fx.memberPassportId } })
  await db.passport.deleteMany({ where: { id: fx.memberPassportId } })
  await db.media.deleteMany({ where: { id: fx.photoMediaId } })
  await db.user.deleteMany({ where: { id: { in: [fx.memberUserId, fx.noPassportUserId] } } })
})

describe("submitRankPromotionClaim core (petey-plan-0477 Slice V2)", () => {
  it("creates a PENDING RANK_PROMOTION above the ceiling, persisting url AND mediaId evidence", async () => {
    const { claimId } = await submitRankPromotionClaim(db, {
      claimantUserId: fx!.memberUserId,
      claimedRankId: fx!.highRankId,
      brand: TEST_BRAND,
      claimantNote: "Promoted at the June seminar",
      // One url-only link + one uploaded-photo row (the soft-gate cert photo).
      evidence: [
        { label: "Certificate", url: "https://example.com/cert.pdf" },
        { label: "certificate", mediaId: fx!.photoMediaId },
      ],
    })

    const claim = await db.passportClaimRequest.findUnique({
      where: { id: claimId },
      include: { evidence: true },
    })

    expect(claim).not.toBeNull()
    expect(claim!.type).toBe("RANK_PROMOTION")
    expect(claim!.status).toBe("PENDING")
    expect(claim!.passportId).toBe(fx!.memberPassportId)
    expect(claim!.claimedRankId).toBe(fx!.highRankId)
    expect(claim!.evidence).toHaveLength(2)

    const urlRow = claim!.evidence.find(e => e.url === "https://example.com/cert.pdf")
    expect(urlRow).toBeDefined()
    expect(urlRow!.mediaId).toBeNull()

    // The photo evidence persisted its mediaId FK → it can materialize onto the
    // RankMilestone on approval (Slice V3 → finalizeRankPromotion).
    const photoRow = claim!.evidence.find(e => e.mediaId === fx!.photoMediaId)
    expect(photoRow).toBeDefined()
    expect(photoRow!.label).toBe("certificate")
  })

  it("rejects a belt AT the ceiling (that's backfill, not a promotion)", async () => {
    await expect(
      submitRankPromotionClaim(db, {
        claimantUserId: fx!.memberUserId,
        claimedRankId: fx!.midRankId,
        brand: TEST_BRAND,
      }),
    ).rejects.toThrow(SUBMIT_RANK_PROMOTION_CLAIM_ERROR.NOT_A_PROMOTION)
  })

  it("rejects a belt BELOW the ceiling", async () => {
    await expect(
      submitRankPromotionClaim(db, {
        claimantUserId: fx!.memberUserId,
        claimedRankId: fx!.lowRankId,
        brand: TEST_BRAND,
      }),
    ).rejects.toThrow(SUBMIT_RANK_PROMOTION_CLAIM_ERROR.NOT_A_PROMOTION)
  })

  it("rejects a second open promotion while one is pending", async () => {
    await expect(
      submitRankPromotionClaim(db, {
        claimantUserId: fx!.memberUserId,
        claimedRankId: fx!.highRankId,
        brand: TEST_BRAND,
      }),
    ).rejects.toThrow(SUBMIT_RANK_PROMOTION_CLAIM_ERROR.DUPLICATE_OPEN_PROMOTION)
  })

  it("allows a fresh promotion (no photo — soft-gate) after the prior one is DENIED", async () => {
    await db.passportClaimRequest.updateMany({
      where: { passportId: fx!.memberPassportId, type: "RANK_PROMOTION", status: "PENDING" },
      data: { status: "DENIED", reviewerNote: "needs a certificate photo" },
    })

    const { claimId } = await submitRankPromotionClaim(db, {
      claimantUserId: fx!.memberUserId,
      claimedRankId: fx!.highRankId,
      brand: TEST_BRAND,
    })

    const claim = await db.passportClaimRequest.findUnique({
      where: { id: claimId },
      include: { evidence: true },
    })
    expect(claim!.status).toBe("PENDING")
    expect(claim!.evidence).toHaveLength(0)
  })

  it("rejects a member with no Passport", async () => {
    await expect(
      submitRankPromotionClaim(db, {
        claimantUserId: fx!.noPassportUserId,
        claimedRankId: fx!.highRankId,
        brand: TEST_BRAND,
      }),
    ).rejects.toThrow(SUBMIT_RANK_PROMOTION_CLAIM_ERROR.PASSPORT_NOT_FOUND)
  })
})
