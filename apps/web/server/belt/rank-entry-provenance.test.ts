/**
 * `syncRankEntryFromAward` provenance derivation (#375 ratified mapping).
 *
 * The IMMUTABLE origin axis is written from the anchor award's verificationStatus:
 * IMPORTED → IMPORTED; VERIFIED | UNVERIFIED | DISPUTED → EARNED (`awardedById` is
 * NOT consulted). DB-free: a fake client captures the `upsert` args so both the
 * `create` and `update` branches are asserted to carry the same provenance.
 *
 * Run: cd apps/web && bun run test server/belt/rank-entry-provenance.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import type { RankAwardVerificationStatus } from "~/.generated/prisma/client"
import { syncRankEntryFromAward } from "~/server/belt/rank-entry-compatibility"

/** Captures the upsert payload so both create + update provenance can be asserted. */
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
