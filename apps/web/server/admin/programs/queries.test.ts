/**
 * SESSION_0140 TASK_05 — Integration test for findPrograms brand filtering.
 *
 * Proves that `findPrograms` inlines the single-brand `Brand.BBL` literal
 * into the Prisma `where` clause (post brand-harness de-thread, Stage 1).
 *
 * Run: cd apps/web && bun test server/admin/programs/queries.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"

const defaultSearch = {
  name: "",
  status: "",
  sort: [{ id: "createdAt", desc: true }],
  page: 1,
  perPage: 25,
  from: "",
  to: "",
  operator: "and",
}

describe("findPrograms", () => {
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
          program: {
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

    it("passes the single-brand BBL literal into Prisma where clause", async () => {
      const { findPrograms } = await import("./queries")

      await findPrograms(defaultSearch as any)

      expect(capturedFindManyArgs).toBeDefined()
      const findManyWhere = (capturedFindManyArgs as any).where
      expect(findManyWhere.brand).toBe("BBL")

      expect(capturedCountArgs).toBeDefined()
      const countWhere = (capturedCountArgs as any).where
      expect(countWhere.brand).toBe("BBL")
    })

    it("merges brand filter with name search filter", async () => {
      const { findPrograms } = await import("./queries")

      const searchWithName = { ...defaultSearch, name: "Kids Karate" }
      await findPrograms(searchWithName as any)

      const findManyWhere = (capturedFindManyArgs as any).where
      expect(findManyWhere.brand).toBe("BBL")
      expect(findManyWhere.AND).toBeDefined()
      expect(findManyWhere.AND.length).toBeGreaterThan(0)
    })

    it("merges brand filter with status filter", async () => {
      const { findPrograms } = await import("./queries")

      const searchWithStatus = { ...defaultSearch, status: "ACTIVE" }
      await findPrograms(searchWithStatus as any)

      const findManyWhere = (capturedFindManyArgs as any).where
      expect(findManyWhere.brand).toBe("BBL")
      expect(findManyWhere.AND).toBeDefined()
    })
  })
})
