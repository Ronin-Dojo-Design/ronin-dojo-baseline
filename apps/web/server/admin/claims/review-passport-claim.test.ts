/**
 * SESSION_0437 P2 (ADR 0036) — applyPassportClaimReview integration tests.
 *
 * Run: cd apps/web && bun test server/admin/claims/review-passport-claim.test.ts
 *
 * Focus: the directory-only person un-stub (approving a node-less PassportClaimRequest
 * performs a REAL account→Passport attach — the old ProfileClaimRequest PERSON stub did
 * not) and Gap-2 sibling auto-cancel. Uses a non-BBL brand so the BBL comp branch is
 * skipped (no entitlement seeding), isolating the identity-attach behaviour.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidatePath: () => {},
  revalidateTag: () => {},
  updateTag: () => {},
}))

import { db } from "~/services/db"
import { applyPassportClaimReview } from "./passport-claim-review-actions"

const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const
const TS = Date.now()
const tag = (name: string) => `s0437-rpc-${TS}-${name}`

type Fixtures = {
  placeholderPassportId: string
  directoryProfileId: string
  claimantUserId: string
  claimantSignupPassportId: string
  otherClaimantUserId: string
  adminUserId: string
}

let fx: Fixtures | null = null

beforeAll(async () => {
  const admin = await db.user.create({
    data: {
      id: tag("admin"),
      name: tag("Admin"),
      email: `${tag("admin")}@test.local`,
      role: "admin",
    },
  })
  // Claimant + their empty signup Passport (the merge supersedes it on attach).
  const claimant = await db.user.create({
    data: {
      id: tag("claimant"),
      name: tag("Claimant"),
      email: `${tag("claimant")}@test.local`,
      passport: { create: { id: tag("signup-passport"), displayName: tag("Signup Shell") } },
    },
    select: { id: true, passport: { select: { id: true } } },
  })
  const other = await db.user.create({
    data: { id: tag("other"), name: tag("Other"), email: `${tag("other")}@test.local` },
  })

  // A claimable directory-only placeholder Passport (no lineage node).
  const placeholder = await db.passport.create({
    data: {
      id: tag("placeholder"),
      displayName: tag("Placeholder Person"),
      directoryProfile: { create: { id: tag("dp"), slug: tag("dp-slug") } },
    },
    select: { id: true, directoryProfile: { select: { id: true } } },
  })

  fx = {
    placeholderPassportId: placeholder.id,
    directoryProfileId: placeholder.directoryProfile!.id,
    claimantUserId: claimant.id,
    claimantSignupPassportId: claimant.passport!.id,
    otherClaimantUserId: other.id,
    adminUserId: admin.id,
  }
})

afterAll(async () => {
  if (!fx) return
  await db.passportClaimRequest.deleteMany({ where: { passportId: fx.placeholderPassportId } })
  await db.auditLog.deleteMany({
    where: { entityType: "PassportClaimRequest", userId: fx.adminUserId },
  })
  await db.passport.deleteMany({
    where: { id: { in: [fx.placeholderPassportId, fx.claimantSignupPassportId] } },
  })
  await db.user.deleteMany({
    where: { id: { in: [fx.claimantUserId, fx.otherClaimantUserId, fx.adminUserId] } },
  })
})

describe("applyPassportClaimReview — directory-only person (ADR 0036 un-stub)", () => {
  it("APPROVE on a node-less claim attaches the account to the Passport (real merge, not a stub)", async () => {
    const claim = await db.passportClaimRequest.create({
      data: {
        passportId: fx!.placeholderPassportId,
        directoryProfileId: fx!.directoryProfileId,
        claimantUserId: fx!.claimantUserId,
        brand: TEST_BRAND,
        relationship: "SELF",
        status: "PENDING",
      },
      select: { id: true },
    })

    const result = await applyPassportClaimReview({
      db,
      brand: TEST_BRAND,
      reviewerUserId: fx!.adminUserId,
      input: { claimId: claim.id, decision: "APPROVED" },
    })

    expect(result.status).toBe("APPROVED")
    expect(result.passportAccountAttached).toBe(true)
    expect(result.ownershipTransferred).toBe(true)
    expect(result.nodeId).toBeNull()

    // The real identity attach happened: the claimed Passport now belongs to the claimant…
    const claimed = await db.passport.findUnique({ where: { id: fx!.placeholderPassportId } })
    expect(claimed?.userId).toBe(fx!.claimantUserId)
    // …and the claimant's empty signup Passport was superseded (deleted).
    const signup = await db.passport.findUnique({ where: { id: fx!.claimantSignupPassportId } })
    expect(signup).toBeNull()
  })

  it("Gap 2: approving a claim auto-cancels every other open claim on the same Passport", async () => {
    // Re-detach so this test is independent of the prior one's attach.
    await db.passport.update({
      where: { id: fx!.placeholderPassportId },
      data: { user: { disconnect: true } },
    })
    await db.passportClaimRequest.deleteMany({ where: { passportId: fx!.placeholderPassportId } })

    const winner = await db.passportClaimRequest.create({
      data: {
        passportId: fx!.placeholderPassportId,
        claimantUserId: fx!.claimantUserId,
        brand: TEST_BRAND,
        status: "PENDING",
      },
      select: { id: true },
    })
    const sibling = await db.passportClaimRequest.create({
      data: {
        passportId: fx!.placeholderPassportId,
        claimantUserId: fx!.otherClaimantUserId,
        brand: TEST_BRAND,
        status: "PENDING",
      },
      select: { id: true },
    })

    const result = await applyPassportClaimReview({
      db,
      brand: TEST_BRAND,
      reviewerUserId: fx!.adminUserId,
      input: { claimId: winner.id, decision: "APPROVED" },
    })

    expect(result.cancelledSiblingClaimIds).toContain(sibling.id)
    const siblingAfter = await db.passportClaimRequest.findUnique({ where: { id: sibling.id } })
    expect(siblingAfter?.status).toBe("CANCELLED")
  })

  it("rejects re-review of a terminal claim", async () => {
    const denied = await db.passportClaimRequest.create({
      data: {
        passportId: fx!.placeholderPassportId,
        claimantUserId: fx!.otherClaimantUserId,
        brand: TEST_BRAND,
        status: "DENIED",
      },
      select: { id: true },
    })

    await expect(
      applyPassportClaimReview({
        db,
        brand: TEST_BRAND,
        reviewerUserId: fx!.adminUserId,
        input: { claimId: denied.id, decision: "APPROVED" },
      }),
    ).rejects.toThrow()
  })
})
