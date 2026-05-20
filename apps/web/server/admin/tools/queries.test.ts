// @ts-expect-error — bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"

const defaultSearch = {
  name: "",
  sort: [{ id: "createdAt", desc: true }],
  page: 1,
  perPage: 25,
  from: "",
  to: "",
  operator: "and",
  status: [],
  tier: [],
}

describe("admin tool queries", () => {
  let capturedFindManyArgs: unknown

  beforeEach(() => {
    capturedFindManyArgs = undefined

    mock.module("~/services/db", () => ({
      db: {
        $transaction: async (queries: Promise<unknown>[]) => Promise.all(queries),
        tool: {
          findMany: (args: unknown) => {
            capturedFindManyArgs = args
            return Promise.resolve([])
          },
          count: () => Promise.resolve(0),
        },
      },
    }))
  })

  it("filters admin listings by tier", async () => {
    const { findTools } = await import("./queries")

    await findTools({ ...defaultSearch, tier: ["Premium"] } as any)

    expect((capturedFindManyArgs as any).where.AND).toContainEqual({
      tier: { in: ["Premium"] },
    })
  })
})
