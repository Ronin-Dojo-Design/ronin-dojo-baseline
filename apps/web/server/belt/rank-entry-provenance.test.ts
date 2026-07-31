/**
 * `syncRankEntryFromAward` provenance derivation (#375 ratified mapping).
 *
 * The IMMUTABLE origin axis is written from the anchor award's verificationStatus:
 * IMPORTED → IMPORTED; VERIFIED | UNVERIFIED | DISPUTED → EARNED (`awardedById` is
 * NOT consulted). DB-free: a fake client captures the `upsert` args. BOTH branches
 * derive provenance: `verificationStatus` never crosses the IMPORTED boundary after
 * creation, so the update-branch re-derive is a no-op for correct rows and heals a
 * column-default row minted outside the seam (see rank-entry-compatibility.ts).
 *
 * Run: cd apps/web && bun run test server/belt/rank-entry-provenance.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import type { RankAwardVerificationStatus } from "~/.generated/prisma/client"
import { syncRankEntryFromAward } from "~/server/belt/rank-entry-compatibility"
import { rankAwardProvenance } from "~/server/belt/queries"

/** Captures the upsert payload so create-time derivation and update-time preservation are asserted. */
const captor = (verificationStatus: RankAwardVerificationStatus) => {
  const calls: { create: Record<string, unknown>; update: Record<string, unknown> }[] = []
  const dbClient = {
    rankAward: {
      findUniqueOrThrow: async () => ({
        passportId: "p1",
        rankId: "r1",
        verificationStatus,
      }),
    },
    rankEntry: {
      upsert: async (args: {
        create: Record<string, unknown>
        update: Record<string, unknown>
      }) => {
        calls.push({ create: args.create, update: args.update })
      },
    },
  } as never
  return { calls, dbClient }
}

describe("syncRankEntryFromAward — provenance", () => {
  it("maps IMPORTED award → IMPORTED entry (established lineage origin)", async () => {
    const { calls, dbClient } = captor("IMPORTED")
    await syncRankEntryFromAward(dbClient, "award-1")
    expect(calls[0]?.create.provenance).toBe("IMPORTED")
    // The update branch heals a column-default row toward award-derived truth.
    expect(calls[0]?.update.provenance).toBe("IMPORTED")
  })

  for (const status of ["VERIFIED", "UNVERIFIED", "DISPUTED"] as const) {
    it(`maps ${status} award → EARNED entry`, async () => {
      const { calls, dbClient } = captor(status)
      await syncRankEntryFromAward(dbClient, "award-1")
      expect(calls[0]?.create.provenance).toBe("EARNED")
      expect(calls[0]?.update.provenance).toBe("EARNED")
    })
  }
})

describe("rankAwardProvenance — belt-gate read", () => {
  it("prefers the linked RankEntry's immutable origin over any derive", () => {
    expect(
      rankAwardProvenance({ verificationStatus: "UNVERIFIED", rankEntry: { provenance: "IMPORTED" } }),
    ).toBe("IMPORTED")
    expect(
      rankAwardProvenance({ verificationStatus: "IMPORTED", rankEntry: { provenance: "EARNED" } }),
    ).toBe("EARNED")
  })

  it("bridges a missing RankEntry with the sync-identical derive (dies with the award table, #380)", () => {
    expect(rankAwardProvenance({ verificationStatus: "IMPORTED", rankEntry: null })).toBe("IMPORTED")
    expect(rankAwardProvenance({ verificationStatus: "UNVERIFIED", rankEntry: null })).toBe("EARNED")
  })
})
