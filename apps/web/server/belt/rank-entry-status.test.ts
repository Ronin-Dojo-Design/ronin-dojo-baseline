/**
 * `rankEntryStatusForAward` — the legacy-award → member-facing RankEntry status bridge.
 *
 * Pure mapping (no DB). Locks the SESSION_0522 operator decision that an IMPORTED award
 * — BBL's established, authority-owned lineage — surfaces as a VERIFIED member RankEntry,
 * while its provenance stays on `RankAward.verificationStatus` so the belt-gate still
 * treats it as authority-owned / read-only.
 *
 * Run: cd apps/web && bun run test server/belt/rank-entry-status.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { rankEntryStatusForAward } from "~/server/belt/queries"

describe("rankEntryStatusForAward", () => {
  it("maps IMPORTED → VERIFIED (SESSION_0522 — established lineage is verified truth)", () => {
    expect(rankEntryStatusForAward("IMPORTED")).toBe("VERIFIED")
  })

  it("maps VERIFIED → VERIFIED", () => {
    expect(rankEntryStatusForAward("VERIFIED")).toBe("VERIFIED")
  })

  it("maps DISPUTED → DISPUTED", () => {
    expect(rankEntryStatusForAward("DISPUTED")).toBe("DISPUTED")
  })

  it("maps UNVERIFIED → UNVERIFIED (the deny-by-default self-submit state)", () => {
    expect(rankEntryStatusForAward("UNVERIFIED")).toBe("UNVERIFIED")
  })
})
