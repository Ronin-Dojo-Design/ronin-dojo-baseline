// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dependency.
import { beforeEach, describe, expect, it, mock } from "bun:test"
import { RankEntryReviewReason } from "~/.generated/prisma/client"

mock.module("server-only", () => ({}))

type QueryArgs = { where?: unknown; take?: number }
const findManyCalls: QueryArgs[] = []
const countCalls: QueryArgs[] = []
const findFirstCalls: QueryArgs[] = []

mock.module("~/services/db", () => ({
  db: {
    rankEntryReview: {
      findMany: async (args: QueryArgs) => {
        findManyCalls.push(args)
        return []
      },
      count: async (args: QueryArgs) => {
        countCalls.push(args)
        return 0
      },
      findFirst: async (args: QueryArgs) => {
        findFirstCalls.push(args)
        return null
      },
    },
  },
}))

const { findPendingPromoterReviews, findPromoterReviewById } =
  await import("~/server/admin/rank-reviews/queries")

beforeEach(() => {
  findManyCalls.length = 0
  countCalls.length = 0
  findFirstCalls.length = 0
})

describe("belt-review query scope + page cap", () => {
  // Scope is reason (PROMOTER_CHANGED) + open status, NOT rank brand: BBL ranks are brand-agnostic
  // (`Rank.brand` nullable; live BJJ ranks are null), so a `rank: { brand: BBL }` filter hid every
  // real review. Authorization is enforced by the belt.admin permission gate on the action, not here.
  it("scopes both queue reads to open PROMOTER_CHANGED proposals and caps a crafted page size", async () => {
    await findPendingPromoterReviews({ page: 1, perPage: 500, sort: [] })

    const expectedScope = { reason: RankEntryReviewReason.PROMOTER_CHANGED }
    expect(findManyCalls).toHaveLength(1)
    expect(findManyCalls[0]?.where).toMatchObject(expectedScope)
    expect(findManyCalls[0]?.take).toBe(50)
    expect(countCalls).toHaveLength(1)
    expect(countCalls[0]?.where).toMatchObject(expectedScope)
  })

  it("scopes guessed-id detail reads to a PROMOTER_CHANGED proposal", async () => {
    await findPromoterReviewById("aaaaaaaaaaaaaaaaaaaaaaaa")

    expect(findFirstCalls).toHaveLength(1)
    expect(findFirstCalls[0]?.where).toMatchObject({
      id: "aaaaaaaaaaaaaaaaaaaaaaaa",
      reason: RankEntryReviewReason.PROMOTER_CHANGED,
    })
  })
})
