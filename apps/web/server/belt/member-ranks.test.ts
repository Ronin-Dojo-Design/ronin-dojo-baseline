/**
 * The canonical rank-read seam (#376) — behavior locked ONCE here (spec #372
 * Testing Decisions). Consumers repoint through `memberRanks` / `memberTopRank`
 * and are NOT re-tested for rank-read behavior.
 *
 * DB-free: a fake `rankEntry.findMany` feeds fixture rows in the exact shape
 * `rankEntryViewSelect` produces, so ordering, per-discipline ceiling, and the
 * status/provenance projection are exercised without Postgres.
 *
 * Run: cd apps/web && bun run test server/belt/member-ranks.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import type { RankEntryProvenance, RankEntryStatus } from "~/.generated/prisma/client"
import { memberRanks, memberTopRank, projectRankEntry } from "~/server/belt/member-ranks"

const BJJ = "disc-bjj"
const FMA = "disc-fma"

/** A selected RankEntry row in the shape `rankEntryViewSelect` yields. */
const row = (opts: {
  id: string
  sortOrder: number
  disciplineId: string
  status?: RankEntryStatus
  provenance?: RankEntryProvenance
  colorHex?: string | null
}) => ({
  id: opts.id,
  rankAwardId: `award-${opts.id}`,
  passportId: "p1",
  rankId: `rank-${opts.id}`,
  status: opts.status ?? ("VERIFIED" as RankEntryStatus),
  provenance: opts.provenance ?? ("EARNED" as RankEntryProvenance),
  rank: {
    name: `Rank ${opts.sortOrder}`,
    colorHex: opts.colorHex ?? null,
    sortOrder: opts.sortOrder,
    rankSystem: { disciplineId: opts.disciplineId },
  },
})

/**
 * Fake DB that returns `rows` verbatim. The seam's `orderBy` is Prisma's job, so
 * fixtures are supplied already ordered (highest sortOrder first) — the tests
 * assert the seam preserves and reads that order, not that it re-sorts.
 */
const fakeDb = (rows: ReturnType<typeof row>[]) =>
  ({ rankEntry: { findMany: async () => rows } }) as never

describe("projectRankEntry", () => {
  it("flattens the row and carries both axes (status + immutable provenance)", () => {
    const view = projectRankEntry(
      row({ id: "a", sortOrder: 9, disciplineId: BJJ, status: "VERIFIED", provenance: "IMPORTED" }),
    )
    expect(view).toEqual({
      rankEntryId: "a",
      rankAwardId: "award-a",
      passportId: "p1",
      rankId: "rank-a",
      rankName: "Rank 9",
      colorHex: null,
      sortOrder: 9,
      disciplineId: BJJ,
      status: "VERIFIED",
      provenance: "IMPORTED",
    })
  })

  it("carries the (required, non-null) rankSystem disciplineId through", () => {
    const view = projectRankEntry(row({ id: "a", sortOrder: 1, disciplineId: FMA }))
    expect(view.disciplineId).toBe(FMA)
  })
})

describe("memberRanks", () => {
  it("projects every entry, preserving the highest-first read order", async () => {
    const views = await memberRanks(
      "p1",
      fakeDb([
        row({ id: "black", sortOrder: 9, disciplineId: BJJ }),
        row({ id: "blue", sortOrder: 2, disciplineId: BJJ }),
      ]),
    )
    expect(views.map(v => v.sortOrder)).toEqual([9, 2])
    expect(views[0]?.rankEntryId).toBe("black")
  })

  it("carries status + provenance per entry", async () => {
    const views = await memberRanks(
      "p1",
      fakeDb([
        row({
          id: "a",
          sortOrder: 9,
          disciplineId: BJJ,
          status: "VERIFIED",
          provenance: "IMPORTED",
        }),
        row({
          id: "b",
          sortOrder: 2,
          disciplineId: BJJ,
          status: "UNVERIFIED",
          provenance: "EARNED",
        }),
      ]),
    )
    expect(views.map(v => [v.status, v.provenance])).toEqual([
      ["VERIFIED", "IMPORTED"],
      ["UNVERIFIED", "EARNED"],
    ])
  })
})

describe("memberTopRank", () => {
  const rows = [
    row({ id: "bjj-black", sortOrder: 9, disciplineId: BJJ }),
    row({ id: "fma-hi", sortOrder: 7, disciplineId: FMA }),
    row({ id: "bjj-blue", sortOrder: 2, disciplineId: BJJ }),
  ]

  it("returns the global ceiling (highest sortOrder) when no discipline is given", async () => {
    const top = await memberTopRank("p1", undefined, fakeDb(rows))
    expect(top?.rankEntryId).toBe("bjj-black")
  })

  it("scopes the ceiling to a discipline (ADR 0035 — highest awarded in-discipline)", async () => {
    const top = await memberTopRank("p1", FMA, fakeDb(rows))
    expect(top?.rankEntryId).toBe("fma-hi")
  })

  it("is status-agnostic — an unverified top belt still counts as the ceiling", async () => {
    const top = await memberTopRank(
      "p1",
      BJJ,
      fakeDb([
        row({ id: "top-unverified", sortOrder: 9, disciplineId: BJJ, status: "UNVERIFIED" }),
        row({ id: "lower-verified", sortOrder: 2, disciplineId: BJJ, status: "VERIFIED" }),
      ]),
    )
    expect(top?.rankEntryId).toBe("top-unverified")
  })

  it("returns null when the member holds no rank in the discipline", async () => {
    const top = await memberTopRank("p1", "disc-none", fakeDb(rows))
    expect(top).toBeNull()
  })
})
