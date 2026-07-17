// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dependency.
import { describe, expect, it } from "bun:test"
import { claimNodeForUser } from "./claim-node-for-user"

async function eventsUntilClaimWrite(write: "create" | "update"): Promise<string[]> {
  const events: string[] = []
  const stopAtClaimWrite = new Error("stop at claim write")
  let claimantPassportRead = 0

  const tx = {
    lineageTreeMember: {
      findFirst: async () => ({
        tree: { id: "tree-1" },
        node: {
          id: "node-1",
          passportId: "passport-claimed",
          passport: { userId: null },
        },
      }),
    },
    lineageNode: { findFirst: async () => null },
    passport: {
      findUnique: async (args: { where: { id?: string; userId?: string } }) => {
        if (args.where.userId) {
          claimantPassportRead += 1
          events.push(
            claimantPassportRead === 1 ? "resolve:claimant-passport" : "recheck:claimant-passport",
          )
          return { id: "passport-signup", userId: "user-1" }
        }
        events.push("recheck:claimed-passport")
        return { id: "passport-claimed", userId: null }
      },
    },
    rankAward: { findMany: async () => [] },
    rankEntryReview: { findMany: async () => [] },
    $queryRaw: async (_strings: TemplateStringsArray, ...values: unknown[]) => {
      events.push(`lock:Passport:${String(values[0])}`)
      return []
    },
    passportClaimRequest: {
      findFirst: async () =>
        write === "update"
          ? {
              id: "claim-1",
              claimedSchoolId: null,
              trainedUnderNodeId: null,
              representTreeId: null,
            }
          : null,
      create: async () => {
        events.push("claim:create")
        throw stopAtClaimWrite
      },
      update: async () => {
        events.push("claim:update")
        throw stopAtClaimWrite
      },
    },
  }

  await expect(
    claimNodeForUser(tx as never, {
      userId: "user-1",
      nodeId: "node-1",
      brand: "BBL" as never,
    }),
  ).rejects.toBe(stopAtClaimWrite)

  return events
}

describe("claimNodeForUser identity lock order", () => {
  for (const write of ["create", "update"] as const) {
    it(`locks the full Passport merge scope before the claim ${write}`, async () => {
      expect(await eventsUntilClaimWrite(write)).toEqual([
        "resolve:claimant-passport",
        "lock:Passport:passport-claimed",
        "lock:Passport:passport-signup",
        "recheck:claimant-passport",
        "recheck:claimed-passport",
        `claim:${write}`,
      ])
    })
  }
})
