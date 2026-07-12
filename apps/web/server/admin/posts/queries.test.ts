/**
 * SESSION_0531 TASK_01 — Posts AdminCollection query contract.
 *
 * Run: cd apps/web && bun test server/admin/posts/queries.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"
import type { PostsTableSchema } from "~/server/admin/posts/schema"

let capturedFindManyArgs: any
let capturedCountArgs: any
let countResult = 0

mock.module("~/services/db", () => ({
  db: {
    $transaction: async (queries: Promise<unknown>[]) => Promise.all(queries),
    post: {
      findMany: (args: unknown) => {
        capturedFindManyArgs = args
        return Promise.resolve([])
      },
      count: (args: unknown) => {
        capturedCountArgs = args
        return Promise.resolve(countResult)
      },
    },
  },
}))

const defaultSearch: PostsTableSchema = {
  title: "",
  sort: [{ id: "updatedAt", desc: true }],
  page: 1,
  perPage: 25,
  from: "",
  to: "",
  operator: "and",
  status: ["Draft"],
}

describe("findPosts", () => {
  beforeEach(() => {
    capturedFindManyArgs = undefined
    capturedCountArgs = undefined
    countResult = 0
  })

  it("preserves extraWhere brand scope in both transaction queries", async () => {
    const { findPosts } = await import("./queries")

    await findPosts(defaultSearch, { brand: "BBL" })

    expect(capturedFindManyArgs.where.brand).toBe("BBL")
    expect(capturedCountArgs.where.brand).toBe("BBL")
    expect(capturedFindManyArgs.where.AND).toContainEqual({
      status: { in: ["Draft"] },
    })
  })

  it("composes search filters beneath extraWhere", async () => {
    const { findPosts } = await import("./queries")

    await findPosts({ ...defaultSearch, title: "Test Post" }, { brand: "BBL" })

    expect(capturedFindManyArgs.where).toMatchObject({ brand: "BBL" })
    expect(capturedFindManyArgs.where.AND).toContainEqual({
      title: { contains: "Test Post", mode: "insensitive" },
    })
  })

  it("returns the shared collection shape and selects only row fields", async () => {
    const { findPosts } = await import("./queries")
    countResult = 26

    const result = await findPosts(defaultSearch, { brand: "BBL" })

    expect(result).toEqual({ rows: [], total: 26, pageCount: 2 })
    expect(capturedFindManyArgs.select).toEqual({
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
      author: { select: { name: true } },
    })
    expect(capturedFindManyArgs.include).toBeUndefined()
  })

  it("clamps hostile paging and falls back from an unallowlisted sort", async () => {
    const { findPosts } = await import("./queries")

    await findPosts({
      ...defaultSearch,
      page: -4,
      perPage: 0,
      sort: [{ id: "content", desc: false } as any],
    })

    expect(capturedFindManyArgs.skip).toBe(0)
    expect(capturedFindManyArgs.take).toBe(1)
    expect(capturedFindManyArgs.orderBy).toEqual([{ updatedAt: "desc" }, { id: "asc" }])
  })

  it("threads only allowlisted collection sorts to Prisma", async () => {
    const { findPosts } = await import("./queries")

    await findPosts({
      ...defaultSearch,
      sort: [{ id: "title", desc: false }, { id: "author", desc: true } as any],
    })

    expect(capturedFindManyArgs.orderBy).toEqual([{ title: "asc" }, { id: "asc" }])
  })
})
