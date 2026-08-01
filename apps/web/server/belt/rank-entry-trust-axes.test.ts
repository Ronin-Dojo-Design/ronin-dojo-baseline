/**
 * Pure trust-axis mapping: mutable status collapses IMPORTED to VERIFIED while immutable
 * provenance retains IMPORTED origin. No DB required.
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import type { RankAwardVerificationStatus } from "~/.generated/prisma/client"
import {
  deriveRankEntryTrustAxesFromAwardStatus,
  type RankEntryTrustAxes,
} from "~/server/belt/rank-entry-trust-axes"

describe("deriveRankEntryTrustAxesFromAwardStatus", () => {
  const cases: Array<
    [
      RankAwardVerificationStatus,
      ReturnType<typeof deriveRankEntryTrustAxesFromAwardStatus>,
    ]
  > = [
    ["IMPORTED", { status: "VERIFIED", provenance: "IMPORTED" }],
    ["VERIFIED", { status: "VERIFIED", provenance: "EARNED" }],
    ["DISPUTED", { status: "DISPUTED", provenance: "EARNED" }],
    ["UNVERIFIED", { status: "UNVERIFIED", provenance: "EARNED" }],
  ]

  for (const [awardStatus, axes] of cases) {
    it(`maps ${awardStatus} without conflating status and provenance`, () => {
      expect(deriveRankEntryTrustAxesFromAwardStatus(awardStatus)).toEqual(axes)
    })
  }

  it("keeps status writable on a trust-axis snapshot", () => {
    const axes: RankEntryTrustAxes = deriveRankEntryTrustAxesFromAwardStatus("UNVERIFIED")

    axes.status = "DISPUTED"

    expect(axes).toEqual({ status: "DISPUTED", provenance: "EARNED" })
  })
})
