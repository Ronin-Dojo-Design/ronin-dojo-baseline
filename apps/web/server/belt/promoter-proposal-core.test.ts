// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it, mock } from "bun:test"
import { Brand } from "~/.generated/prisma/client"

mock.module("server-only", () => ({}))

const {
  approveCapturedPromoterReview,
  denyCapturedPromoterReview,
  hasLockedRankEntryReviewHistory,
  lockPromoterWorkflowScope,
  lockUntilStableAuthorityAnchor,
} = await import("~/server/belt/promoter-proposal-core")

describe("promoter proposal transaction core", () => {
  it("locks the full promoter Passport union before member Awards and Reviews", async () => {
    const events: string[] = []
    const award = {
      id: "award-target",
      passportId: "member",
      awardedByPassportId: "coach-active",
    }
    const reviews = [
      {
        id: "review-z",
        expectedPromoterPassportId: "coach-expected",
        proposedPromoterPassportId: "coach-proposed",
      },
      {
        id: "review-a",
        expectedPromoterPassportId: "coach-active",
        proposedPromoterPassportId: "coach-proposed",
      },
    ]
    const tx = {
      $queryRaw: async (parts: TemplateStringsArray, ...values: unknown[]) => {
        const sql = parts.join("?")
        if (sql.includes('FROM "Passport"')) {
          events.push(`lock:Passport:${String(values[0])}`)
          return [{ id: values[0] }]
        }
        if (sql.includes('WHERE "passportId"')) {
          events.push(`lock:MemberAwards:${String(values[0])}`)
          return [{ id: award.id }]
        }
        events.push(`lock:Review:${String(values[0])}`)
        return [{ id: values[0] }]
      },
      rankAward: { findUnique: async () => award },
      rankEntryReview: { findMany: async () => reviews },
    }

    await lockPromoterWorkflowScope({
      tx: tx as never,
      rankAwardId: award.id,
      candidatePromoterPassportId: "coach-candidate",
      lockMemberAuthorityAwards: true,
    })

    expect(events).toEqual([
      "lock:Passport:coach-active",
      "lock:Passport:coach-candidate",
      "lock:Passport:coach-expected",
      "lock:Passport:coach-proposed",
      "lock:Passport:member",
      "lock:MemberAwards:member",
      "lock:Review:review-a",
      "lock:Review:review-z",
    ])
  })

  it("fails closed when merge repoints a promoter before the Passport tier is acquired", async () => {
    let awardRead = 0
    const tx = {
      $queryRaw: async (_parts: TemplateStringsArray, ...values: unknown[]) => [{ id: values[0] }],
      rankAward: {
        findUnique: async () => {
          awardRead += 1
          return {
            id: "award",
            passportId: "member",
            awardedByPassportId: awardRead === 1 ? "coach-old" : "coach-canonical",
          }
        },
      },
      rankEntryReview: { findMany: async () => [] },
    }

    await expect(
      lockPromoterWorkflowScope({
        tx: tx as never,
        rankAwardId: "award",
        lockMemberAuthorityAwards: false,
      }),
    ).rejects.toThrow("Promoter identity changed")
  })

  it("locks decision Passports before its Award and Review", async () => {
    const events: string[] = []
    const review = {
      id: "review",
      status: "PROPOSAL_PENDING",
      reason: "PROMOTER_CHANGED",
      rankEntryId: "entry",
      proposalCapturedAt: new Date("2026-07-16T00:00:00.000Z"),
      expectedPromoterPassportId: "coach-a",
      expectedPromoterName: "Coach A",
      proposedPromoterPassportId: "coach-b",
      rankEntry: {
        rankAwardId: "award",
        rank: { brand: Brand.BBL },
        rankAward: {
          id: "award",
          awardedByPassportId: "coach-a",
          notes: "Coach A",
        },
      },
    }
    const tx = {
      $queryRaw: async (parts: TemplateStringsArray, ...values: unknown[]) => {
        const sql = parts.join("?")
        let tier = "Review"
        if (sql.includes('FROM "Passport"')) tier = "Passport"
        else if (sql.includes('FROM "RankAward"')) tier = "Award"
        events.push(`lock:${tier}:${String(values[0])}`)
        return [{ id: values[0] }]
      },
      rankAward: {
        findUnique: async () => ({
          id: "award",
          passportId: "member",
          awardedByPassportId: "coach-a",
        }),
      },
      rankEntryReview: {
        findMany: async () => [
          {
            id: review.id,
            expectedPromoterPassportId: review.expectedPromoterPassportId,
            proposedPromoterPassportId: review.proposedPromoterPassportId,
          },
        ],
        findFirst: async () => ({ rankEntry: { rankAwardId: "award" } }),
        findUnique: async () => review,
        updateMany: async () => ({ count: 1 }),
      },
      auditLog: { create: async () => ({}) },
    }

    await denyCapturedPromoterReview(tx as never, review.id, {
      brand: Brand.BBL,
      userId: "admin",
    })

    expect(events).toEqual([
      "lock:Passport:coach-a",
      "lock:Passport:coach-b",
      "lock:Passport:member",
      "lock:Award:award",
      "lock:Review:review",
    ])
  })

  it("refuses a decision when the locked review no longer belongs to the actor brand", async () => {
    let initialWhere: unknown
    let mutationCount = 0
    const review = {
      id: "review",
      status: "PROPOSAL_PENDING",
      reason: "PROMOTER_CHANGED",
      rankEntryId: "entry",
      proposalCapturedAt: new Date("2026-07-16T00:00:00.000Z"),
      expectedPromoterPassportId: "coach-a",
      expectedPromoterName: null,
      proposedPromoterPassportId: "coach-b",
      rankEntry: {
        rank: { brand: Brand.BASELINE_MARTIAL_ARTS },
        rankAward: { id: "award", awardedByPassportId: "coach-a", notes: null },
      },
    }
    const tx = {
      $queryRaw: async (_parts: TemplateStringsArray, ...values: unknown[]) => [{ id: values[0] }],
      rankAward: {
        findUnique: async () => ({
          id: "award",
          passportId: "member",
          awardedByPassportId: "coach-a",
        }),
      },
      rankEntryReview: {
        findMany: async () => [
          {
            id: review.id,
            expectedPromoterPassportId: review.expectedPromoterPassportId,
            proposedPromoterPassportId: review.proposedPromoterPassportId,
          },
        ],
        findFirst: async (args: { where: unknown }) => {
          initialWhere = args.where
          return { rankEntry: { rankAwardId: "award" } }
        },
        findUnique: async () => review,
        updateMany: async () => {
          mutationCount += 1
          return { count: 1 }
        },
      },
      auditLog: {
        create: async () => {
          mutationCount += 1
          return {}
        },
      },
    }

    await expect(
      denyCapturedPromoterReview(tx as never, review.id, {
        brand: Brand.BBL,
        userId: "admin",
      }),
    ).rejects.toThrow("Review not found")
    expect(initialWhere).toEqual({
      id: review.id,
      rankEntry: { rank: { brand: Brand.BBL } },
    })
    expect(mutationCount).toBe(0)
  })

  it("locks the RankEntry before an empty history read so a legacy FK insert cannot slip through", async () => {
    const events: string[] = []
    const tx = {
      $queryRaw: async (parts: TemplateStringsArray, ...values: unknown[]) => {
        const sql = parts.join("?")
        if (sql.includes('FROM "RankEntry" WHERE')) {
          events.push(`lock:RankEntry:${String(values[0])}`)
          return [{ id: "entry" }]
        }
        throw new Error(`Unexpected lock query: ${sql}`)
      },
      rankEntryReview: {
        findMany: async () => {
          events.push("read:Reviews")
          return []
        },
      },
    }

    await expect(hasLockedRankEntryReviewHistory(tx as never, "award")).resolves.toBeFalse()
    expect(events).toEqual(["lock:RankEntry:award", "read:Reviews"])
  })

  it("locks each replacement authority anchor until the final resolved anchor is stable", async () => {
    const anchors = [{ id: "anchor-x" }, { id: "anchor-y" }, { id: "anchor-y" }]
    const locked: string[] = []

    const anchor = await lockUntilStableAuthorityAnchor({
      targetAwardId: "target",
      resolve: async () => anchors.shift() ?? null,
      lock: async rankAwardId => {
        locked.push(rankAwardId)
      },
    })

    expect(anchor).toEqual({ id: "anchor-y" })
    expect(locked).toEqual(["anchor-x", "anchor-y"])
    expect(anchors).toHaveLength(0)
  })

  it("fails closed before mutation when a captured proposal has no expected established A", async () => {
    let lookup = 0
    const tx = {
      $queryRaw: async () => [{ id: "locked" }],
      rankAward: {
        findUnique: async () => ({
          id: "award",
          passportId: "member",
          awardedByPassportId: null,
        }),
      },
      rankEntryReview: {
        findMany: async () => [
          {
            id: "review",
            expectedPromoterPassportId: null,
            proposedPromoterPassportId: "promoter-b",
          },
        ],
        findFirst: async () => {
          lookup += 1
          return { rankEntry: { rankAwardId: "award" } }
        },
        findUnique: async () => {
          lookup += 1
          return {
            id: "review",
            status: "PROPOSAL_PENDING",
            reason: "PROMOTER_CHANGED",
            rankEntryId: "entry",
            proposalCapturedAt: new Date("2026-07-16T00:00:00.000Z"),
            expectedPromoterPassportId: null,
            expectedPromoterName: null,
            proposedPromoterPassportId: "promoter-b",
            rankEntry: {
              rank: { brand: Brand.BBL },
              rankAward: {
                id: "award",
                awardedByPassportId: null,
                notes: null,
              },
            },
          }
        },
        updateMany: async () => {
          throw new Error("unexpected mutation")
        },
      },
    }

    await expect(
      approveCapturedPromoterReview(tx as never, "review", {
        brand: Brand.BBL,
        userId: "admin",
      }),
    ).rejects.toThrow("no captured proposal")
    expect(lookup).toBe(2)
  })
})
