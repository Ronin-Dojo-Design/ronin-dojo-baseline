/**
 * The compact rank-read seam (#376) — behavior locked once here (spec #372
 * Testing Decisions). Rich nested consumers keep purpose-built selects while
 * reusing the same `rankEntryDisplayOrder` contract.
 *
 * DB-free: a fake `rankEntry.findMany` captures the Prisma query and feeds fixture
 * rows in the selected shape, so the display-order/no-brand contract,
 * per-discipline ceiling, and status/provenance projection are exercised without
 * Postgres.
 *
 * Run: cd apps/web && bun run test server/belt/member-ranks.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import type { RankEntryProvenance, RankEntryStatus } from "~/.generated/prisma/client"
import { rankEntryDisplayOrder } from "~/server/belt/rank-entry-display-order"
import { memberRanks, memberTopRank } from "~/server/belt/member-ranks"

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
 * Fake DB that returns `rows` verbatim and captures the query. Prisma performs
 * the sort, so fixtures stay pre-ordered while the query contract is asserted
 * independently.
 */
const fakeDb = (rows: ReturnType<typeof row>[]) => {
  const calls: unknown[] = []
  return {
    calls,
    dbClient: {
      rankEntry: {
        findMany: async (query: unknown) => {
          calls.push(query)
          return rows
        },
      },
    } as never,
  }
}

describe("memberRanks", () => {
  it("queries by passport with the canonical display order and no brand scope", async () => {
    const { calls, dbClient } = fakeDb([])
    await memberRanks("p1", dbClient)

    expect(calls[0]).toMatchObject({
      where: { passportId: "p1" },
      orderBy: rankEntryDisplayOrder,
    })
    expect(rankEntryDisplayOrder).toEqual([
      { rank: { sortOrder: "desc" } },
      { rankAward: { awardedAt: { sort: "desc", nulls: "last" } } },
    ])
    expect(JSON.stringify(calls[0])).not.toContain('"brand"')
  })

  it("projects the compact view and carries both status + immutable provenance axes", async () => {
    const { dbClient } = fakeDb([
      row({
        id: "a",
        sortOrder: 9,
        disciplineId: BJJ,
        status: "VERIFIED",
        provenance: "IMPORTED",
      }),
    ])
    const [view] = await memberRanks("p1", dbClient)

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

  it("projects every entry, preserving the highest-first read order", async () => {
    const { dbClient } = fakeDb([
      row({ id: "black", sortOrder: 9, disciplineId: BJJ }),
      row({ id: "blue", sortOrder: 2, disciplineId: BJJ }),
    ])
    const views = await memberRanks(
      "p1",
      dbClient,
    )
    expect(views.map(v => v.sortOrder)).toEqual([9, 2])
    expect(views[0]?.rankEntryId).toBe("black")
  })

  it("carries status + provenance per entry", async () => {
    const { dbClient } = fakeDb([
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
    ])
    const views = await memberRanks(
      "p1",
      dbClient,
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
    const top = await memberTopRank("p1", undefined, fakeDb(rows).dbClient)
    expect(top?.rankEntryId).toBe("bjj-black")
  })

  it("scopes the ceiling to a discipline (ADR 0035 — highest awarded in-discipline)", async () => {
    const top = await memberTopRank("p1", FMA, fakeDb(rows).dbClient)
    expect(top?.rankEntryId).toBe("fma-hi")
  })

  it("is status-agnostic — an unverified top belt still counts as the ceiling", async () => {
    const { dbClient } = fakeDb([
      row({ id: "top-unverified", sortOrder: 9, disciplineId: BJJ, status: "UNVERIFIED" }),
      row({ id: "lower-verified", sortOrder: 2, disciplineId: BJJ, status: "VERIFIED" }),
    ])
    const top = await memberTopRank(
      "p1",
      BJJ,
      dbClient,
    )
    expect(top?.rankEntryId).toBe("top-unverified")
  })

  it("returns null when the member holds no rank in the discipline", async () => {
    const top = await memberTopRank("p1", "disc-none", fakeDb(rows).dbClient)
    expect(top).toBeNull()
  })
})
