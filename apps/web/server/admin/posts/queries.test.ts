/**
 * SESSION_0138 TASK_01 — Integration test for findPosts brand filtering.
 *
 * Proves that `findPosts` forwards the `where` parameter (including `{ brand }`)
 * into the Prisma query, closing the Kaizen aggregate gap from SESSION_0137.
 *
 * Run: cd apps/web && bun test server/admin/posts/queries.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"

// ---------------------------------------------------------------------------
// Default search params matching PostsTableSchema defaults
// ---------------------------------------------------------------------------
const defaultSearch = {
  title: "",
  sort: [{ id: "createdAt", desc: true }],
  page: 1,
  perPage: 25,
  from: "",
  to: "",
  operator: "and",
  status: [],
}

describe("findPosts", () => {
  describe("brand filtering", () => {
    let capturedFindManyArgs: unknown
    let capturedCountArgs: unknown

    beforeEach(() => {
      capturedFindManyArgs = undefined
      capturedCountArgs = undefined

      mock.module("~/services/db", () => ({
        db: {
          $transaction: async (queries: Promise<unknown>[]) => {
            return Promise.all(queries)
          },
          post: {
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

    it("passes brand filter into Prisma where clause", async () => {
      const { findPosts } = await import("./queries")

      await findPosts(defaultSearch as any, { brand: "BASELINE_MARTIAL_ARTS" })

      // Verify findMany received the brand filter
      expect(capturedFindManyArgs).toBeDefined()
      const findManyWhere = (capturedFindManyArgs as any).where
      expect(findManyWhere.brand).toBe("BASELINE_MARTIAL_ARTS")

      // Verify count also received the brand filter
      expect(capturedCountArgs).toBeDefined()
      const countWhere = (capturedCountArgs as any).where
      expect(countWhere.brand).toBe("BASELINE_MARTIAL_ARTS")
    })

    it("does not include brand filter when where is omitted", async () => {
      const { findPosts } = await import("./queries")

      await findPosts(defaultSearch as any)

      const findManyWhere = (capturedFindManyArgs as any).where
      expect(findManyWhere.brand).toBeUndefined()
    })

    it("merges brand filter with other search filters", async () => {
      const { findPosts } = await import("./queries")

      const searchWithTitle = { ...defaultSearch, title: "Test Post" }
      await findPosts(searchWithTitle as any, { brand: "RONIN_DOJO_DESIGN" })

      const findManyWhere = (capturedFindManyArgs as any).where
      expect(findManyWhere.brand).toBe("RONIN_DOJO_DESIGN")
      // The AND clause should contain the title filter
      expect(findManyWhere.AND).toBeDefined()
      expect(findManyWhere.AND.length).toBeGreaterThan(0)
    })
  })
})
