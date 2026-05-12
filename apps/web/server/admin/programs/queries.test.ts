/**
 * SESSION_0140 TASK_05 — Integration test for findPrograms brand filtering.
 *
 * Proves that `findPrograms` calls `getRequestBrand()` and forwards
 * the brand into the Prisma `where` clause.
 *
 * Run: cd apps/web && bun test server/admin/programs/queries.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { describe, expect, it, mock, beforeEach } from "bun:test"

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

      mock.module("~/lib/brand-context", () => ({
        getRequestBrand: () => Promise.resolve("BASELINE_MARTIAL_ARTS"),
      }))

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

    it("passes brand from getRequestBrand into Prisma where clause", async () => {
      const { findPrograms } = await import("./queries")

      await findPrograms(defaultSearch as any)

      expect(capturedFindManyArgs).toBeDefined()
      const findManyWhere = (capturedFindManyArgs as any).where
      expect(findManyWhere.brand).toBe("BASELINE_MARTIAL_ARTS")

      expect(capturedCountArgs).toBeDefined()
      const countWhere = (capturedCountArgs as any).where
      expect(countWhere.brand).toBe("BASELINE_MARTIAL_ARTS")
    })

    it("merges brand filter with name search filter", async () => {
      const { findPrograms } = await import("./queries")

      const searchWithName = { ...defaultSearch, name: "Kids Karate" }
      await findPrograms(searchWithName as any)

      const findManyWhere = (capturedFindManyArgs as any).where
      expect(findManyWhere.brand).toBe("BASELINE_MARTIAL_ARTS")
      expect(findManyWhere.AND).toBeDefined()
      expect(findManyWhere.AND.length).toBeGreaterThan(0)
    })

    it("merges brand filter with status filter", async () => {
      const { findPrograms } = await import("./queries")

      const searchWithStatus = { ...defaultSearch, status: "ACTIVE" }
      await findPrograms(searchWithStatus as any)

      const findManyWhere = (capturedFindManyArgs as any).where
      expect(findManyWhere.brand).toBe("BASELINE_MARTIAL_ARTS")
      expect(findManyWhere.AND).toBeDefined()
    })
  })
})
