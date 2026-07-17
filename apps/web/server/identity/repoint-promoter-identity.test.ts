// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dependency.
import { describe, expect, it } from "bun:test"
import {
  assertPromoterIdentityMergeManifestMatches,
  repointPromoterIdentityForMerge,
  restorePromoterIdentityFromMergeManifest,
  type PromoterIdentityMergeManifest,
} from "~/server/identity/repoint-promoter-identity"

describe("promoter identity merge recovery", () => {
  it("locks deterministic tiers and records independent review-field before-images", async () => {
    const events: string[] = []
    const awards = [
      { id: "award-z", passportId: "member-z" },
      { id: "award-a", passportId: "member-a" },
    ]
    const reviews = [
      {
        id: "review-z",
        expectedPromoterPassportId: "coach-other",
        proposedPromoterPassportId: "coach-old",
        rankEntry: { rankAwardId: "award-r", passportId: "member-r" },
      },
      {
        id: "review-a",
        expectedPromoterPassportId: "coach-old",
        proposedPromoterPassportId: "coach-new",
        rankEntry: { rankAwardId: "award-a", passportId: "member-a" },
      },
    ]
    const raw = async (strings: TemplateStringsArray, ...values: unknown[]) => {
      const sql = strings.join("?")
      let table = "Review"
      if (sql.includes('FROM "Passport"')) table = "Passport"
      else if (sql.includes('FROM "RankAward"')) table = "Award"
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

    const manifest = await repointPromoterIdentityForMerge(tx as never, "coach-old", "coach-new")

    expect(manifest).toEqual({
      fromPassportId: "coach-old",
      toPassportId: "coach-new",
      awardIds: ["award-a", "award-z"],
      reviews: [
        {
          id: "review-a",
          expectedPromoterReferencedFrom: true,
          proposedPromoterReferencedFrom: false,
        },
        {
          id: "review-z",
          expectedPromoterReferencedFrom: false,
          proposedPromoterReferencedFrom: true,
        },
      ],
    })
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
      "repoint:proposed:review-z",
    ])
  })

  it("compares manifests by exact ids and flags, independent of serialized order", () => {
    const manifest: PromoterIdentityMergeManifest = {
      fromPassportId: "old",
      toPassportId: "new",
      awardIds: ["award-b", "award-a"],
      reviews: [
        {
          id: "review-b",
          expectedPromoterReferencedFrom: false,
          proposedPromoterReferencedFrom: true,
        },
        {
          id: "review-a",
          expectedPromoterReferencedFrom: true,
          proposedPromoterReferencedFrom: false,
        },
      ],
    }

    expect(() =>
      assertPromoterIdentityMergeManifestMatches(manifest, {
        ...manifest,
        awardIds: [...manifest.awardIds].reverse(),
        reviews: [...manifest.reviews].reverse(),
      }),
    ).not.toThrow()
    expect(() =>
      assertPromoterIdentityMergeManifestMatches(manifest, {
        ...manifest,
        reviews: [
          {
            ...manifest.reviews[0],
            expectedPromoterReferencedFrom: true,
          },
          manifest.reviews[1],
        ],
      }),
    ).toThrow("no longer matches locked database state")
  })

  it("restores only artifact ids and captured review fields", async () => {
    const updates: Array<{ kind: string; ids?: string[]; reviewId?: string }> = []
    const awards = [
      { id: "captured-award", passportId: "member-a" },
      { id: "newer-award", passportId: "member-b" },
    ]
    const reviews = [
      {
        id: "captured-review",
        expectedPromoterPassportId: "canonical",
        proposedPromoterPassportId: "different",
        rankEntry: { rankAwardId: "captured-award", passportId: "member-a" },
      },
      {
        id: "newer-review",
        expectedPromoterPassportId: "canonical",
        proposedPromoterPassportId: "canonical",
        rankEntry: { rankAwardId: "newer-award", passportId: "member-b" },
      },
    ]
    const tx = {
      $queryRaw: async () => [],
      $executeRaw: async (strings: TemplateStringsArray, ...values: unknown[]) => {
        updates.push({
          kind: strings.join("?").includes('SET "expectedPromoterPassportId"')
            ? "expected"
            : "proposed",
          reviewId: String(values[1]),
        })
        return 1
      },
      rankAward: {
        findMany: async () => awards,
        updateMany: async (args: { where: { id: { in: string[] } } }) => {
          updates.push({ kind: "awards", ids: args.where.id.in })
          return { count: args.where.id.in.length }
        },
      },
      rankEntryReview: { findMany: async () => reviews },
    }

    await restorePromoterIdentityFromMergeManifest(tx as never, {
      fromPassportId: "superseded",
      toPassportId: "canonical",
      awardIds: ["captured-award"],
      reviews: [
        {
          id: "captured-review",
          expectedPromoterReferencedFrom: true,
          proposedPromoterReferencedFrom: false,
        },
      ],
    })

    expect(updates).toEqual([
      { kind: "awards", ids: ["captured-award"] },
      { kind: "expected", reviewId: "captured-review" },
    ])
  })
})
