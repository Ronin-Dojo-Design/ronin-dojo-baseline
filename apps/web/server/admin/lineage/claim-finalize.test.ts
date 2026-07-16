/**
 * SESSION_0443 — `finalizePassportClaim` helper-level integration test (SOP §5d lean pattern).
 *
 * Canonical finalize coverage:
 *   - Asserted RankAward materialization (FI-006, ADR 0035) — ported from the retired
 *     `claim-rank-lifecycle.test.ts`, which drove the legacy `applyLineageClaimReview` through the full
 *     mock chain. The decision-gating + audit halves of that file (DENIED / NEEDS_INFO never grant; audit
 *     written) stay on the review layer in `claim-review-actions.test.ts`.
 *   - Branch-head visual placement (ADR 0037) — seeds `primaryVisualParentMemberId` from the
 *     `trainedUnderNodeId` (INSTRUCTOR_STUDENT edge), with the instructor-not-in-tree → root, no-clobber,
 *     and self-reference guards.
 *
 * Pattern (SOP §5d): `finalizePassportClaim` takes `(tx, input)`, so this calls it DIRECTLY — NO mock
 * seams (no next/headers, next/cache, ~/lib/auth, x-brand) and NO teardown: fixtures live inside a
 * transaction that is always rolled back. Brand is a plain string (non-BBL → comp grant skipped, so no
 * entitlement fixtures); it drops out once `LineageTree.brand` is removed.
 *
 * Run: cd apps/web && bun test server/admin/lineage/claim-finalize.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"

import { db } from "~/services/db"
import { finalizePassportClaim } from "~/server/admin/lineage/claim-finalize"

// Non-BBL → grantClaimComp is a no-op without an override (no entitlement fixtures needed).
const BRAND = "BASELINE_MARTIAL_ARTS" as const

const TS = Date.now()
let seq = 0
const uid = (name: string) => `cf-${TS}-${seq++}-${name}`

// biome-ignore lint/suspicious/noExplicitAny: tx client surface.
type Tx = any
type PromoterReviewHistoryRow = {
  id: string
  status: string
  proposalCapturedAt: Date | null
  createdAt: Date
  updatedAt: Date
  expectedPromoterPassportId: string | null
  proposedPromoterPassportId: string | null
}

class Rollback extends Error {}

/** Run `body` inside a transaction that is ALWAYS rolled back — zero persistence, zero teardown. */
async function inRolledBackTx(body: (tx: Tx) => Promise<void>): Promise<void> {
  try {
    await db.$transaction(async (tx: Tx) => {
      await body(tx)
      throw new Rollback()
    })
  } catch (error) {
    if (!(error instanceof Rollback)) throw error
  }
}

/** Create a person (Passport + LineageNode) and, when `treeId` is given, a member placed under `parentMemberId`. */
async function makePerson(
  tx: Tx,
  name: string,
  opts: { treeId?: string; parentMemberId?: string | null } = {},
): Promise<{ passportId: string; nodeId: string; memberId: string | null }> {
  const passport = await tx.passport.create({
    data: { displayName: uid(name) },
    select: { id: true },
  })
  const node = await tx.lineageNode.create({
    data: { passportId: passport.id, visibility: "PUBLIC", verificationStatus: "PENDING" },
    select: { id: true },
  })
  let memberId: string | null = null
  if (opts.treeId) {
    const member = await tx.lineageTreeMember.create({
      data: {
        treeId: opts.treeId,
        nodeId: node.id,
        primaryVisualParentMemberId: opts.parentMemberId ?? null,
      },
      select: { id: true },
    })
    memberId = member.id
  }
  return { passportId: passport.id, nodeId: node.id, memberId }
}

async function makeTree(tx: Tx): Promise<string> {
  const tree = await tx.lineageTree.create({
    data: { brand: BRAND, slug: uid("tree"), name: uid("tree"), visibility: "PUBLIC" },
    select: { id: true },
  })
  return tree.id
}

/** Minimal node-claim input: claimant (no node) claims `student`, with optional asserted selections. */
function claimInput(args: {
  studentPassportId: string
  studentNodeId: string
  treeId: string
  claimantUserId: string
  trainedUnderNodeId?: string | null
  claimedRankId?: string | null
}) {
  return {
    id: uid("claim"),
    claimantUserId: args.claimantUserId,
    passportId: args.studentPassportId,
    passportUserId: null, // placeholder student node → triggers the real account attach
    treeId: args.treeId,
    nodeId: args.studentNodeId,
    trainedUnderNodeId: args.trainedUnderNodeId ?? null,
    claimedRankId: args.claimedRankId ?? null,
  }
}

/** Borrow any existing Rank (the local DB has the seeded rank taxonomy). */
async function anyRankId(tx: Tx): Promise<string> {
  const rank = await tx.rank.findFirst({ select: { id: true } })
  if (!rank) throw new Error("no Rank rows in the test DB")
  return rank.id
}

async function makeClaimant(tx: Tx): Promise<string> {
  const user = await tx.user.create({
    data: { id: uid("claimant"), name: uid("claimant"), email: `${uid("claimant")}@test.local` },
    select: { id: true },
  })
  return user.id
}

describe("finalizePassportClaim — branch-head visual placement (ADR 0037)", () => {
  it("files the student under their instructor's branch-head member", async () => {
    await inRolledBackTx(async tx => {
      const treeId = await makeTree(tx)
      const root = await makePerson(tx, "rigan", { treeId })
      const instructor = await makePerson(tx, "bob-bass", { treeId, parentMemberId: root.memberId })
      const student = await makePerson(tx, "student", { treeId, parentMemberId: null })
      const claimantUserId = await makeClaimant(tx)

      const result = await finalizePassportClaim(tx, {
        claim: claimInput({
          studentPassportId: student.passportId,
          studentNodeId: student.nodeId,
          treeId,
          claimantUserId,
          trainedUnderNodeId: instructor.nodeId,
        }),
        brand: BRAND,
        actorUserId: claimantUserId,
      })

      expect(result.visualParentMemberId).toBe(instructor.memberId)
      const placed = await tx.lineageTreeMember.findUnique({
        where: { id: student.memberId as string },
        select: { primaryVisualParentMemberId: true },
      })
      expect(placed?.primaryVisualParentMemberId).toBe(instructor.memberId)
    })
  })

  it("leaves the student at root when the instructor is not a member of the tree", async () => {
    await inRolledBackTx(async tx => {
      const treeId = await makeTree(tx)
      await makePerson(tx, "rigan", { treeId })
      const offTreeInstructor = await makePerson(tx, "off-tree") // node exists, NOT a member
      const student = await makePerson(tx, "student", { treeId, parentMemberId: null })
      const claimantUserId = await makeClaimant(tx)

      const result = await finalizePassportClaim(tx, {
        claim: claimInput({
          studentPassportId: student.passportId,
          studentNodeId: student.nodeId,
          treeId,
          claimantUserId,
          trainedUnderNodeId: offTreeInstructor.nodeId,
        }),
        brand: BRAND,
        actorUserId: claimantUserId,
      })

      expect(result.visualParentMemberId).toBeNull()
      const placed = await tx.lineageTreeMember.findUnique({
        where: { id: student.memberId as string },
        select: { primaryVisualParentMemberId: true },
      })
      expect(placed?.primaryVisualParentMemberId).toBeNull()
    })
  })

  it("does not clobber an existing steward placement", async () => {
    await inRolledBackTx(async tx => {
      const treeId = await makeTree(tx)
      const root = await makePerson(tx, "rigan", { treeId })
      const instructor = await makePerson(tx, "bob-bass", { treeId, parentMemberId: root.memberId })
      // Student already placed under root by a steward.
      const student = await makePerson(tx, "student", { treeId, parentMemberId: root.memberId })
      const claimantUserId = await makeClaimant(tx)

      const result = await finalizePassportClaim(tx, {
        claim: claimInput({
          studentPassportId: student.passportId,
          studentNodeId: student.nodeId,
          treeId,
          claimantUserId,
          trainedUnderNodeId: instructor.nodeId,
        }),
        brand: BRAND,
        actorUserId: claimantUserId,
      })

      // Returns the existing parent (root), and the row is unchanged — not re-pointed to the instructor.
      expect(result.visualParentMemberId).toBe(root.memberId)
      const placed = await tx.lineageTreeMember.findUnique({
        where: { id: student.memberId as string },
        select: { primaryVisualParentMemberId: true },
      })
      expect(placed?.primaryVisualParentMemberId).toBe(root.memberId)
    })
  })

  it("no-ops when the claim carries no instructor", async () => {
    await inRolledBackTx(async tx => {
      const treeId = await makeTree(tx)
      await makePerson(tx, "rigan", { treeId })
      const student = await makePerson(tx, "student", { treeId, parentMemberId: null })
      const claimantUserId = await makeClaimant(tx)

      const result = await finalizePassportClaim(tx, {
        claim: claimInput({
          studentPassportId: student.passportId,
          studentNodeId: student.nodeId,
          treeId,
          claimantUserId,
          trainedUnderNodeId: null,
        }),
        brand: BRAND,
        actorUserId: claimantUserId,
      })

      expect(result.visualParentMemberId).toBeNull()
      expect(result.trainedUnderRelationshipId).toBeNull()
    })
  })
})

describe("finalizePassportClaim — asserted RankAward (FI-006, ADR 0035)", () => {
  it("approval with claimedRankId creates a VERIFIED RankAward on the claimed Passport", async () => {
    await inRolledBackTx(async tx => {
      const treeId = await makeTree(tx)
      const student = await makePerson(tx, "student", { treeId })
      const claimantUserId = await makeClaimant(tx)
      const rankId = await anyRankId(tx)

      const result = await finalizePassportClaim(tx, {
        claim: claimInput({
          studentPassportId: student.passportId,
          studentNodeId: student.nodeId,
          treeId,
          claimantUserId,
          claimedRankId: rankId,
        }),
        brand: BRAND,
        actorUserId: claimantUserId,
      })

      expect(result.rankAwardId).not.toBeNull()
      const [award, entry] = await Promise.all([
        tx.rankAward.findUnique({
          where: { id: result.rankAwardId as string },
          select: { passportId: true, rankId: true, verificationStatus: true },
        }),
        tx.rankEntry.findUnique({
          where: { rankAwardId: result.rankAwardId as string },
          select: { passportId: true, rankId: true, status: true },
        }),
      ])
      expect(award?.passportId).toBe(student.passportId)
      expect(award?.rankId).toBe(rankId)
      expect(award?.verificationStatus).toBe("VERIFIED")
      expect(entry).toEqual({
        passportId: student.passportId,
        rankId,
        status: "VERIFIED",
      })
    })
  })

  it("approval without claimedRankId creates no RankAward", async () => {
    await inRolledBackTx(async tx => {
      const treeId = await makeTree(tx)
      const student = await makePerson(tx, "student", { treeId })
      const claimantUserId = await makeClaimant(tx)

      const result = await finalizePassportClaim(tx, {
        claim: claimInput({
          studentPassportId: student.passportId,
          studentNodeId: student.nodeId,
          treeId,
          claimantUserId,
          claimedRankId: null,
        }),
        brand: BRAND,
        actorUserId: claimantUserId,
      })

      expect(result.rankAwardId).toBeNull()
      const count = await tx.rankAward.count({ where: { passportId: student.passportId } })
      expect(count).toBe(0)
    })
  })

  it("is idempotent when the rank is already awarded — keeps the existing RankAward", async () => {
    await inRolledBackTx(async tx => {
      const treeId = await makeTree(tx)
      const student = await makePerson(tx, "student", { treeId })
      const claimantUserId = await makeClaimant(tx)
      const rankId = await anyRankId(tx)

      const pre = await tx.rankAward.create({
        data: {
          passportId: student.passportId,
          rankId,
          source: "STATED",
          verificationStatus: "UNVERIFIED",
        },
        select: { id: true },
      })

      const result = await finalizePassportClaim(tx, {
        claim: claimInput({
          studentPassportId: student.passportId,
          studentNodeId: student.nodeId,
          treeId,
          claimantUserId,
          claimedRankId: rankId,
        }),
        brand: BRAND,
        actorUserId: claimantUserId,
      })

      expect(result.rankAwardId).toBe(pre.id)
      const count = await tx.rankAward.count({ where: { passportId: student.passportId, rankId } })
      expect(count).toBe(1)
      const [award, entry] = await Promise.all([
        tx.rankAward.findUnique({
          where: { id: pre.id },
          select: { verificationStatus: true, awardedById: true },
        }),
        tx.rankEntry.findUnique({
          where: { rankAwardId: pre.id },
          select: { passportId: true, rankId: true, status: true },
        }),
      ])
      expect(award).toEqual({ verificationStatus: "VERIFIED", awardedById: claimantUserId })
      expect(entry).toEqual({
        passportId: student.passportId,
        rankId,
        status: "VERIFIED",
      })
    })
  })
})

describe("finalizePassportClaim — signup Passport merge", () => {
  it("repoints pending and terminal promoter-review history before deleting the signup Passport", async () => {
    await inRolledBackTx(async tx => {
      const treeId = await makeTree(tx)
      const claimedPerson = await makePerson(tx, "claimed-person", { treeId })
      const claimantUserId = await makeClaimant(tx)
      const signupPassport = await tx.passport.create({
        data: { displayName: uid("signup-passport"), userId: claimantUserId },
        select: { id: true },
      })
      const reviewSubject = await tx.passport.create({
        data: { displayName: uid("review-subject") },
        select: { id: true },
      })
      const rankId = await anyRankId(tx)
      const award = await tx.rankAward.create({
        data: {
          passportId: reviewSubject.id,
          rankId,
          source: "STATED",
          verificationStatus: "VERIFIED",
          awardedByPassportId: signupPassport.id,
        },
        select: { id: true },
      })
      const entry = await tx.rankEntry.create({
        data: {
          passportId: reviewSubject.id,
          rankId,
          rankAwardId: award.id,
          status: "VERIFIED",
        },
        select: { id: true },
      })
      const pending = await tx.rankEntryReview.create({
        data: {
          rankEntryId: entry.id,
          status: "PROPOSAL_PENDING",
          reason: "PROMOTER_CHANGED",
          proposalCapturedAt: new Date(),
          expectedPromoterPassportId: signupPassport.id,
          proposedPromoterPassportId: claimedPerson.passportId,
        },
        select: { id: true },
      })
      const terminal = await tx.rankEntryReview.create({
        data: {
          rankEntryId: entry.id,
          status: "DENIED",
          reason: "PROMOTER_CHANGED",
          proposalCapturedAt: new Date(),
          expectedPromoterPassportId: claimedPerson.passportId,
          proposedPromoterPassportId: signupPassport.id,
        },
        select: { id: true },
      })
      const historyBefore: PromoterReviewHistoryRow[] = await tx.rankEntryReview.findMany({
        where: { id: { in: [pending.id, terminal.id] } },
        orderBy: { id: "asc" },
        select: {
          id: true,
          status: true,
          proposalCapturedAt: true,
          createdAt: true,
          updatedAt: true,
          expectedPromoterPassportId: true,
          proposedPromoterPassportId: true,
        },
      })

      await finalizePassportClaim(tx, {
        claim: claimInput({
          studentPassportId: claimedPerson.passportId,
          studentNodeId: claimedPerson.nodeId,
          treeId,
          claimantUserId,
        }),
        brand: BRAND,
        actorUserId: claimantUserId,
      })

      expect(await tx.passport.findUnique({ where: { id: signupPassport.id } })).toBeNull()
      expect(
        await tx.rankAward.findUnique({
          where: { id: award.id },
          select: { awardedByPassportId: true },
        }),
      ).toEqual({ awardedByPassportId: claimedPerson.passportId })
      expect(
        await tx.rankEntryReview.findMany({
          where: { id: { in: [pending.id, terminal.id] } },
          orderBy: { id: "asc" },
          select: {
            id: true,
            status: true,
            proposalCapturedAt: true,
            createdAt: true,
            updatedAt: true,
            expectedPromoterPassportId: true,
            proposedPromoterPassportId: true,
          },
        }),
      ).toEqual(
        historyBefore.map(review => ({
          ...review,
          expectedPromoterPassportId: claimedPerson.passportId,
          proposedPromoterPassportId: claimedPerson.passportId,
        })),
      )
    })
  })
})
