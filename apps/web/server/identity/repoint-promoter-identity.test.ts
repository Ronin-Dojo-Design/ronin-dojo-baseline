// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dependency.
import { describe, expect, it } from "bun:test"
import { repointPromoterIdentityForMerge } from "~/server/identity/repoint-promoter-identity"

describe("repointPromoterIdentityForMerge", () => {
  it("locks deterministic Passport → Award → Review tiers before repointing", async () => {
    const events: string[] = []
    const awards = [
      { id: "award-z", passportId: "member-z" },
      { id: "award-a", passportId: "member-a" },
    ]
    const reviews = [
      {
        id: "review-z",
        rankEntry: { rankAwardId: "award-r", passportId: "member-r" },
      },
      {
        id: "review-a",
        rankEntry: { rankAwardId: "award-a", passportId: "member-a" },
      },
    ]
    const raw = async (strings: TemplateStringsArray, ...values: unknown[]) => {
      const sql = strings.join("?")
      const table = sql.includes('FROM "Passport"')
        ? "Passport"
        : sql.includes('FROM "RankAward"')
          ? "Award"
          : "Review"
      events.push(`lock:${table}:${String(values[0])}`)
      return []
    }
    const execute = async (strings: TemplateStringsArray, ...values: unknown[]) => {
      const sql = strings.join("?")
      const field = sql.includes('SET "expectedPromoterPassportId"') ? "expected" : "proposed"
      events.push(`repoint:${field}:${String(values[1])}`)
      return 1
    }
    const tx = {
      $queryRaw: raw,
      $executeRaw: execute,
      rankAward: {
        findMany: async () => awards,
        updateMany: async () => {
          events.push("repoint:awards")
          return { count: awards.length }
        },
      },
      rankEntryReview: { findMany: async () => reviews },
    }

    await repointPromoterIdentityForMerge(tx as never, "coach-old", "coach-new")

    expect(events).toEqual([
      "lock:Passport:coach-new",
      "lock:Passport:coach-old",
      "lock:Passport:member-a",
      "lock:Passport:member-r",
      "lock:Passport:member-z",
      "lock:Award:award-a",
      "lock:Award:award-r",
      "lock:Award:award-z",
      "lock:Review:review-a",
      "lock:Review:review-z",
      "repoint:awards",
      "repoint:expected:review-a",
      "repoint:proposed:review-a",
      "repoint:expected:review-z",
      "repoint:proposed:review-z",
    ])
  })
})
