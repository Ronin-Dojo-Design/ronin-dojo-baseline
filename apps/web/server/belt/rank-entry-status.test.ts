/**
 * `rankEntryStatusForAward` — the legacy-award → member-facing RankEntry status bridge.
 *
 * Pure mapping (no DB). Locks the SESSION_0522 operator decision that an IMPORTED award
 * surfaces as a VERIFIED member RankEntry while immutable origin stays separately on
 * `RankEntry.provenance`. Provenance is historical metadata and locks nothing; the imported
 * WP self-report remains member-editable after the SESSION_0730 ratification.
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
