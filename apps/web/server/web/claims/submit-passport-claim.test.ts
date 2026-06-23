/**
 * SESSION_0437 P1 (ADR 0036) — submitPassportClaim core integration tests.
 *
 * Run: cd apps/web && bun test server/web/claims/submit-passport-claim.test.ts
 *
 * The core executes its DB ops directly (no next-safe-action middleware), so we
 * call it for real against the dev DB with a seeded placeholder Passport.
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
import { SUBMIT_PASSPORT_CLAIM_ERROR, submitPassportClaim } from "./submit-passport-claim"

const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const
const TS = Date.now()
const tag = (name: string) => `s0437-pc-${TS}-${name}`

type Fixtures = {
  claimablePassportId: string // placeholder, userId == null
  claimedPassportId: string // already attached to an account
  directoryProfileId: string
  claimantUserId: string
  otherUserId: string
  ownerUserId: string
}

let fx: Fixtures | null = null

beforeAll(async () => {
  const claimant = await db.user.create({
    data: { id: tag("claimant"), name: tag("Claimant"), email: `${tag("claimant")}@test.local` },
  })
  const other = await db.user.create({
    data: { id: tag("other"), name: tag("Other"), email: `${tag("other")}@test.local` },
  })
  const owner = await db.user.create({
    data: { id: tag("owner"), name: tag("Owner"), email: `${tag("owner")}@test.local` },
  })

  // A claimable placeholder Passport (no attached account) + its directory profile.
  const claimable = await db.passport.create({
    data: {
      id: tag("passport-claimable"),
      displayName: tag("Placeholder Person"),
      directoryProfile: { create: { id: tag("dp"), slug: tag("dp-slug") } },
    },
    select: { id: true, directoryProfile: { select: { id: true } } },
  })

  // An already-claimed Passport (attached to owner).
  const claimed = await db.passport.create({
    data: { id: tag("passport-claimed"), displayName: tag("Owned Person"), userId: owner.id },
    select: { id: true },
  })

  fx = {
    claimablePassportId: claimable.id,
    claimedPassportId: claimed.id,
    directoryProfileId: claimable.directoryProfile!.id,
    claimantUserId: claimant.id,
    otherUserId: other.id,
    ownerUserId: owner.id,
  }
})

afterAll(async () => {
  if (!fx) return
  await db.passportClaimEvidence.deleteMany({
    where: { claimRequest: { passportId: { in: [fx.claimablePassportId, fx.claimedPassportId] } } },
  })
  await db.passportClaimRequest.deleteMany({
    where: { passportId: { in: [fx.claimablePassportId, fx.claimedPassportId] } },
  })
  await db.passport.deleteMany({
    where: { id: { in: [fx.claimablePassportId, fx.claimedPassportId] } },
  })
  await db.user.deleteMany({
    where: { id: { in: [fx.claimantUserId, fx.otherUserId, fx.ownerUserId] } },
  })
})

describe("submitPassportClaim core (ADR 0036)", () => {
  it("creates a PENDING claim for a claimable Passport, with directory + evidence", async () => {
    const { claimId } = await submitPassportClaim(db, {
      passportId: fx!.claimablePassportId,
      claimantUserId: fx!.claimantUserId,
      brand: TEST_BRAND,
      relationship: "SELF",
      claimantNote: "I am this person",
      directoryProfileId: fx!.directoryProfileId,
      evidence: [{ label: "Cert", url: "https://example.com/cert.pdf" }],
    })

    const claim = await db.passportClaimRequest.findUnique({
      where: { id: claimId },
      include: { evidence: true },
    })

    expect(claim).not.toBeNull()
    expect(claim!.status).toBe("PENDING")
    expect(claim!.passportId).toBe(fx!.claimablePassportId)
    expect(claim!.directoryProfileId).toBe(fx!.directoryProfileId)
    expect(claim!.relationship).toBe("SELF")
    expect(claim!.evidence).toHaveLength(1)
    expect(claim!.evidence[0].url).toBe("https://example.com/cert.pdf")
  })

  it("rejects a duplicate open claim by the same claimant (identity-keyed)", async () => {
    await expect(
      submitPassportClaim(db, {
        passportId: fx!.claimablePassportId,
        claimantUserId: fx!.claimantUserId,
        brand: TEST_BRAND,
      }),
    ).rejects.toThrow(SUBMIT_PASSPORT_CLAIM_ERROR.DUPLICATE_CLAIM)
  })

  it("rejects a claim on an already-claimed Passport (userId != null)", async () => {
    await expect(
      submitPassportClaim(db, {
        passportId: fx!.claimedPassportId,
        claimantUserId: fx!.otherUserId,
        brand: TEST_BRAND,
      }),
    ).rejects.toThrow(SUBMIT_PASSPORT_CLAIM_ERROR.ALREADY_CLAIMED)
  })

  it("rejects a claim on a non-existent Passport", async () => {
    await expect(
      submitPassportClaim(db, {
        passportId: "nonexistent-passport-id",
        claimantUserId: fx!.otherUserId,
        brand: TEST_BRAND,
      }),
    ).rejects.toThrow(SUBMIT_PASSPORT_CLAIM_ERROR.PASSPORT_NOT_FOUND)
  })

  it("allows a fresh claim after the prior one is DENIED", async () => {
    await db.passportClaimRequest.updateMany({
      where: {
        passportId: fx!.claimablePassportId,
        claimantUserId: fx!.claimantUserId,
        status: "PENDING",
      },
      data: { status: "DENIED", reviewerNote: "insufficient evidence" },
    })

    const { claimId } = await submitPassportClaim(db, {
      passportId: fx!.claimablePassportId,
      claimantUserId: fx!.claimantUserId,
      brand: TEST_BRAND,
      claimantNote: "second attempt",
    })

    const claim = await db.passportClaimRequest.findUnique({ where: { id: claimId } })
    expect(claim!.status).toBe("PENDING")
  })
})
