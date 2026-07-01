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
})
