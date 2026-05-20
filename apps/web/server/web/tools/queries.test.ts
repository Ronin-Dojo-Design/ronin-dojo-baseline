// @ts-expect-error — bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
}))

const defaultSearch = {
  q: "",
  category: "",
  sort: "",
  page: 1,
  perPage: 36,
}

describe("web tool queries", () => {
  let capturedFindManyArgs: unknown
  let capturedCountArgs: unknown

  beforeEach(() => {
    capturedFindManyArgs = undefined
    capturedCountArgs = undefined

    mock.module("~/services/db", () => ({
      db: {
        $transaction: async (queries: Promise<unknown>[]) => Promise.all(queries),
        tool: {
          findMany: (args: unknown) => {
            capturedFindManyArgs = args
            return Promise.resolve([])
          },
          count: (args: unknown) => {
            capturedCountArgs = args
            return Promise.resolve(0)
          },
        },
      },
    }))
  })

  it("defaults public search ordering to tier priority before publish recency", async () => {
    const { searchTools } = await import("./queries")

    await searchTools(defaultSearch as any)

    expect((capturedFindManyArgs as any).orderBy).toEqual([
      { tierPriority: "asc" },
      { publishedAt: "desc" },
    ])
  })

  it("counts submitted tools only in active review states", async () => {
    const { countSubmittedTools } = await import("./queries")

    await countSubmittedTools({})

    expect((capturedCountArgs as any).where.status).toEqual({
      in: ["Draft", "Pending", "Scheduled"],
    })
  })
})
