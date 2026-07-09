/**
 * petey-plan-0477 Slice V3 (ADR 0035 Amendment 1) — finalizeRankPromotion helper test (SOP §5d).
 *
 * `finalizeRankPromotion(tx, input)` is tx-shaped, so this calls it DIRECTLY inside a transaction
 * that is ALWAYS rolled back — zero persistence, zero teardown, no mock seams. Proves the B1
 * approval: a RANK_PROMOTION mints the asserted belt as a VERIFIED RankAward and verifies an
 * as-yet-unverified node, without any identity/comp side-effects.
 *
 * Run: cd apps/web && bun run test server/admin/lineage/finalize-rank-promotion.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"

import { db } from "~/services/db"
import { finalizeRankPromotion } from "~/server/admin/lineage/claim-finalize"

const TS = Date.now()
let seq = 0
const uid = (name: string) => `frp-${TS}-${seq++}-${name}`

// biome-ignore lint/suspicious/noExplicitAny: tx client surface.
type Tx = any

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

/** A member: an owned Passport + an unverified LineageNode (unless `verified`). */
async function makeMember(
  tx: Tx,
  opts: { verified?: boolean; withNode?: boolean } = {},
): Promise<{ userId: string; passportId: string; nodeId: string | null }> {
  const user = await tx.user.create({
    data: { id: uid("user"), name: uid("Member"), email: `${uid("member")}@test.local` },
  })
  const passport = await tx.passport.create({
    data: { displayName: uid("Person"), userId: user.id },
    select: { id: true },
  })
  let nodeId: string | null = null
  if (opts.withNode !== false) {
    const node = await tx.lineageNode.create({
      data: {
        passportId: passport.id,
        visibility: "PUBLIC",
        isVerified: opts.verified ?? false,
        verificationStatus: opts.verified ? "VERIFIED" : "PENDING",
      },
      select: { id: true },
    })
    nodeId = node.id
  }
  return { userId: user.id, passportId: passport.id, nodeId }
}

async function aBjjRankId(tx: Tx): Promise<string> {
  const rank = await tx.rank.findFirst({
    where: { rankSystem: { discipline: { code: "bjj" } } },
    select: { id: true },
  })
  if (!rank) throw new Error("Test requires a seeded BJJ rank")
  return rank.id
}

/** A Media row (owned by `uploaderId`) usable as evidence-photo / attachment media. */
async function makeMedia(tx: Tx, uploaderId: string): Promise<string> {
  const media = await tx.media.create({
    data: {
      id: uid("media"),
      brand: "BBL",
      type: "IMAGE",
      url: `https://example.com/${uid("photo")}.jpg`,
      uploadedById: uploaderId,
    },
    select: { id: true },
  })
  return media.id
}

/** A RANK_PROMOTION claim on `passportId` with the given evidence rows (label + optional mediaId). */
async function makePromotionClaim(
  tx: Tx,
  {
    passportId,
    claimantUserId,
    claimedRankId,
    evidence = [],
  }: {
    passportId: string
    claimantUserId: string
    claimedRankId: string
    evidence?: { label?: string | null; mediaId?: string | null; url?: string | null }[]
  },
): Promise<string> {
  const claim = await tx.passportClaimRequest.create({
    data: {
      id: uid("claim"),
      type: "RANK_PROMOTION",
      passportId,
      claimantUserId,
      brand: "BBL",
      claimedRankId,
      ...(evidence.length
        ? {
            evidence: {
              create: evidence.map(e => ({
                label: e.label ?? null,
                url: e.url ?? null,
                mediaId: e.mediaId ?? null,
              })),
            },
          }
        : {}),
    },
    select: { id: true },
  })
  return claim.id
}

describe("finalizeRankPromotion (petey-plan-0477 Slice V3)", () => {
  it("mints a VERIFIED RankAward for the claimed belt and verifies the member's node", async () => {
    await inRolledBackTx(async tx => {
      const actor = await tx.user.create({
        data: { id: uid("actor"), name: uid("Actor"), email: `${uid("actor")}@test.local` },
      })
      const member = await makeMember(tx)
      const rankId = await aBjjRankId(tx)

      const result = await finalizeRankPromotion(tx, {
        claim: { id: uid("claim"), passportId: member.passportId, claimedRankId: rankId },
        actorUserId: actor.id,
      })

      expect(result.rankAwardId).not.toBeNull()
      expect(result.nodeVerified).toBe(true)

      const award = await tx.rankAward.findUnique({
        where: { id: result.rankAwardId as string },
        select: { verificationStatus: true, source: true, passportId: true, rankId: true },
      })
      expect(award!.verificationStatus).toBe("VERIFIED")
      expect(award!.source).toBe("STATED")
      expect(award!.passportId).toBe(member.passportId)
      expect(award!.rankId).toBe(rankId)

      const entry = await tx.rankEntry.findUnique({
        where: { rankAwardId: result.rankAwardId as string },
        select: { passportId: true, rankId: true, status: true },
      })
      expect(entry).toEqual({ passportId: member.passportId, rankId, status: "VERIFIED" })

      const node = await tx.lineageNode.findUnique({
        where: { id: member.nodeId as string },
        select: { isVerified: true },
      })
      expect(node!.isVerified).toBe(true)
    })
  })

  it("does not re-flip an already-verified node, but still mints the award", async () => {
    await inRolledBackTx(async tx => {
      const actor = await tx.user.create({
        data: { id: uid("actor2"), name: uid("Actor2"), email: `${uid("actor2")}@test.local` },
      })
      const member = await makeMember(tx, { verified: true })
      const rankId = await aBjjRankId(tx)

      const result = await finalizeRankPromotion(tx, {
        claim: { id: uid("claim2"), passportId: member.passportId, claimedRankId: rankId },
        actorUserId: actor.id,
      })

      expect(result.rankAwardId).not.toBeNull()
      expect(result.nodeVerified).toBe(false)
    })
  })

  it("FIX 4 — approving a promotion whose award already exists (unverified) flips it to VERIFIED + stamps awardedById", async () => {
    await inRolledBackTx(async tx => {
      const actor = await tx.user.create({
        data: { id: uid("actor4b"), name: uid("Actor4b"), email: `${uid("actor4b")}@test.local` },
      })
      const member = await makeMember(tx)
      const rankId = await aBjjRankId(tx)

      // A pre-existing award for the SAME rank, minted between submit and approve
      // (e.g. admin add-person) — still UNVERIFIED and unstamped.
      const pre = await tx.rankAward.create({
        data: {
          passportId: member.passportId,
          rankId,
          source: "STATED",
          verificationStatus: "UNVERIFIED",
        },
        select: { id: true },
      })

      const result = await finalizeRankPromotion(tx, {
        claim: { id: uid("claim4b"), passportId: member.passportId, claimedRankId: rankId },
        actorUserId: actor.id,
      })

      // Same award row (no duplicate), now brought up to the approved state.
      expect(result.rankAwardId).toBe(pre.id)
      const after = await tx.rankAward.findUnique({
        where: { id: pre.id },
        select: { verificationStatus: true, awardedById: true },
      })
      expect(after!.verificationStatus).toBe("VERIFIED")
      expect(after!.awardedById).toBe(actor.id)

      const entry = await tx.rankEntry.findUnique({
        where: { rankAwardId: pre.id },
        select: { passportId: true, rankId: true, status: true },
      })
      expect(entry).toEqual({ passportId: member.passportId, rankId, status: "VERIFIED" })

      const count = await tx.rankAward.count({ where: { passportId: member.passportId, rankId } })
      expect(count).toBe(1)
    })
  })

  it("is idempotent — a second approval returns the same award, no duplicate", async () => {
    await inRolledBackTx(async tx => {
      const actor = await tx.user.create({
        data: { id: uid("actor3"), name: uid("Actor3"), email: `${uid("actor3")}@test.local` },
      })
      const member = await makeMember(tx)
      const rankId = await aBjjRankId(tx)
      const claim = { id: uid("claim3"), passportId: member.passportId, claimedRankId: rankId }

      const first = await finalizeRankPromotion(tx, { claim, actorUserId: actor.id })
      const second = await finalizeRankPromotion(tx, { claim, actorUserId: actor.id })

      expect(second.rankAwardId).toBe(first.rankAwardId)
      const count = await tx.rankAward.count({
        where: { passportId: member.passportId, rankId },
      })
      expect(count).toBe(1)
    })
  })

  it("mints the award even when the member has no node (nodeVerified false)", async () => {
    await inRolledBackTx(async tx => {
      const actor = await tx.user.create({
        data: { id: uid("actor4"), name: uid("Actor4"), email: `${uid("actor4")}@test.local` },
      })
      const member = await makeMember(tx, { withNode: false })
      const rankId = await aBjjRankId(tx)

      const result = await finalizeRankPromotion(tx, {
        claim: { id: uid("claim4"), passportId: member.passportId, claimedRankId: rankId },
        actorUserId: actor.id,
      })

      expect(result.rankAwardId).not.toBeNull()
      expect(result.nodeVerified).toBe(false)
    })
  })

  // --- TASK_04: PassportClaimEvidence → RankMilestone media materialization ------------------

  it("materializes photo evidence onto the minted award's RankMilestone, purpose from label", async () => {
    await inRolledBackTx(async tx => {
      const actor = await tx.user.create({
        data: { id: uid("actor5"), name: uid("Actor5"), email: `${uid("actor5")}@test.local` },
      })
      const member = await makeMember(tx)
      const rankId = await aBjjRankId(tx)
      const certMedia = await makeMedia(tx, member.userId)
      const instrMedia = await makeMedia(tx, member.userId)

      const claimId = await makePromotionClaim(tx, {
        passportId: member.passportId,
        claimantUserId: member.userId,
        claimedRankId: rankId,
        evidence: [
          { label: "Certificate photo", mediaId: certMedia },
          { label: "Instructor photo", mediaId: instrMedia },
          // A url-only row carries no photo → must NOT create a milestone attachment.
          { label: "Link", url: "https://example.com/proof" },
        ],
      })

      const result = await finalizeRankPromotion(tx, {
        claim: { id: claimId, passportId: member.passportId, claimedRankId: rankId },
        actorUserId: actor.id,
      })
      expect(result.rankAwardId).not.toBeNull()

      const milestone = await tx.rankMilestone.findUnique({
        where: { rankAwardId: result.rankAwardId as string },
        select: { id: true },
      })
      expect(milestone).not.toBeNull()

      const attachments = await tx.mediaAttachment.findMany({
        where: { rankMilestoneId: milestone!.id },
        select: { mediaId: true, purpose: true },
      })
      // Exactly the two photo rows materialized — the url-only row is skipped.
      expect(attachments).toHaveLength(2)
      const byMedia = new Map(
        attachments.map((a: { mediaId: string; purpose: string | null }) => [a.mediaId, a.purpose]),
      )
      expect(byMedia.get(certMedia)).toBe("certificate")
      expect(byMedia.get(instrMedia)).toBe("instructor")
    })
  })

  it("is idempotent — re-approving does not duplicate the milestone media", async () => {
    await inRolledBackTx(async tx => {
      const actor = await tx.user.create({
        data: { id: uid("actor6"), name: uid("Actor6"), email: `${uid("actor6")}@test.local` },
      })
      const member = await makeMember(tx)
      const rankId = await aBjjRankId(tx)
      const media = await makeMedia(tx, member.userId)

      const claimId = await makePromotionClaim(tx, {
        passportId: member.passportId,
        claimantUserId: member.userId,
        claimedRankId: rankId,
        evidence: [{ label: "cert", mediaId: media }],
      })
      const claim = { id: claimId, passportId: member.passportId, claimedRankId: rankId }

      await finalizeRankPromotion(tx, { claim, actorUserId: actor.id })
      await finalizeRankPromotion(tx, { claim, actorUserId: actor.id })

      const count = await tx.mediaAttachment.count({ where: { mediaId: media } })
      expect(count).toBe(1)
    })
  })

  it("mints the award with NO milestone media when the promotion has no photo evidence", async () => {
    await inRolledBackTx(async tx => {
      const actor = await tx.user.create({
        data: { id: uid("actor7"), name: uid("Actor7"), email: `${uid("actor7")}@test.local` },
      })
      const member = await makeMember(tx)
      const rankId = await aBjjRankId(tx)

      const claimId = await makePromotionClaim(tx, {
        passportId: member.passportId,
        claimantUserId: member.userId,
        claimedRankId: rankId,
        // Only a url-only row — no uploaded photo, so nothing to materialize.
        evidence: [{ label: "Link only", url: "https://example.com/proof" }],
      })

      const result = await finalizeRankPromotion(tx, {
        claim: { id: claimId, passportId: member.passportId, claimedRankId: rankId },
        actorUserId: actor.id,
      })
      expect(result.rankAwardId).not.toBeNull()

      // No photo evidence → no milestone is created (materialize returns early).
      const milestone = await tx.rankMilestone.findUnique({
        where: { rankAwardId: result.rankAwardId as string },
        select: { id: true },
      })
      expect(milestone).toBeNull()
    })
  })
})
