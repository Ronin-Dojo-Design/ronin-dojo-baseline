// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { beforeEach, describe, expect, it, mock } from "bun:test"
import { Brand } from "~/.generated/prisma/client"
import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

installSafeActionMocks({ brand: "BBL" })
mock.module("server-only", () => ({}))

type ReviewDecisionCall = {
  reviewId: string
  actor: { brand: Brand; userId: string }
}

const approveCalls: ReviewDecisionCall[] = []
const denyCalls: ReviewDecisionCall[] = []
const APPROVE_REVIEW_ID = "aaaaaaaaaaaaaaaaaaaaaaaa"
const DENY_REVIEW_ID = "bbbbbbbbbbbbbbbbbbbbbbbb"
const transactionClient = { marker: "rank-review-authorization-test" }
let transactionCalls = 0

mock.module("~/services/db", () => ({
  db: {
    $transaction: async (operation: (tx: typeof transactionClient) => Promise<unknown>) => {
      transactionCalls += 1
      return operation(transactionClient)
    },
  },
}))

mock.module("~/server/belt/promoter-proposal-core", () => ({
  approveCapturedPromoterReview: async (
    _tx: typeof transactionClient,
    reviewId: string,
    actor: ReviewDecisionCall["actor"],
  ) => {
    approveCalls.push({ reviewId, actor })
    return { reviewId, status: "APPROVED" as const }
  },
  denyCapturedPromoterReview: async (
    _tx: typeof transactionClient,
    reviewId: string,
    actor: ReviewDecisionCall["actor"],
  ) => {
    denyCalls.push({ reviewId, actor })
    return { reviewId, status: "DENIED" as const }
  },
}))

const { approveRankEntryReview, denyRankEntryReview } =
  await import("~/server/admin/rank-reviews/actions")

beforeEach(() => {
  approveCalls.length = 0
  denyCalls.length = 0
  transactionCalls = 0
})

describe("belt-review safe-action authorization", () => {
  it("denies both mutations to an ordinary user before opening a transaction", async () => {
    setTestSession({ id: "ordinary-user", role: "user" })

    const [approve, deny] = await Promise.all([
      approveRankEntryReview({ reviewId: APPROVE_REVIEW_ID }),
      denyRankEntryReview({ reviewId: DENY_REVIEW_ID }),
    ])

    expect(approve?.serverError).toBe("User not authorized")
    expect(deny?.serverError).toBe("User not authorized")
    expect(transactionCalls).toBe(0)
    expect(approveCalls).toHaveLength(0)
    expect(denyCalls).toHaveLength(0)
  })

  it("allows both mutations to a non-admin holding the queue's exact permission", async () => {
    setTestSession({
      id: "belt-reviewer",
      role: "user",
      extraGrants: [APP_AREA_PERMISSIONS.beltReviews],
    })

    const approve = await approveRankEntryReview({ reviewId: APPROVE_REVIEW_ID })
    const deny = await denyRankEntryReview({ reviewId: DENY_REVIEW_ID })

    expect(approve?.serverError).toBeUndefined()
    expect(deny?.serverError).toBeUndefined()
    expect(transactionCalls).toBe(2)
    expect(approveCalls).toEqual([
      { reviewId: APPROVE_REVIEW_ID, actor: { brand: Brand.BBL, userId: "belt-reviewer" } },
    ])
    expect(denyCalls).toEqual([
      { reviewId: DENY_REVIEW_ID, actor: { brand: Brand.BBL, userId: "belt-reviewer" } },
    ])
  })
})
