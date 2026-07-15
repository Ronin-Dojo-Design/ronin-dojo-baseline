/**
 * Pure belt-gate invariant tests (Slice 3 — Petey Plan 0477 Locked #5).
 *
 * DB-free: exercises every self-promotion / verified-fact / top-award predicate
 * in isolation. The router integration test proves the SAME rules end-to-end
 * against real Postgres; this file locks the logic exhaustively and cheaply.
 *
 * Run: cd apps/web && bun run test server/belt/belt-gate.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import type { RankAwardVerificationStatus } from "~/.generated/prisma/client"
import {
  ceilingSortOrder,
  decideBackfillTrust,
  type FactValueAward,
  type GateAward,
  isFactEditable,
  isTopAward,
  isWithinCeiling,
  memberFactEditability,
} from "~/server/belt/belt-gate"

const BJJ = "disc-bjj"
const OTHER = "disc-fma"

const award = (
  id: string,
  sortOrder: number,
  disciplineId: string | null = BJJ,
  status: RankAwardVerificationStatus = "UNVERIFIED",
): GateAward => ({
  id,
  verificationStatus: status,
  rank: { sortOrder, rankSystem: disciplineId ? { disciplineId } : null },
})

// Pre-ordered by rank.sortOrder DESC — the Prisma read order the gate relies on.
const purpleThenBlueThenWhite: GateAward[] = [
  award("a-purple", 30),
  award("a-blue", 20),
  award("a-white", 10),
]

describe("ceilingSortOrder", () => {
  it("is the highest awarded belt IN the discipline", () => {
    expect(ceilingSortOrder(purpleThenBlueThenWhite, BJJ)).toBe(30)
  })

  it("ignores awards in OTHER disciplines when scoping the ceiling", () => {
    const mixed = [award("x", 99, OTHER), award("a-blue", 20, BJJ)]
    expect(ceilingSortOrder(mixed, BJJ)).toBe(20)
  })

  it("is null when the member holds no award in the discipline", () => {
    expect(ceilingSortOrder([award("x", 99, OTHER)], BJJ)).toBeNull()
    expect(ceilingSortOrder([], BJJ)).toBeNull()
  })
})

describe("isWithinCeiling — a member CANNOT create/edit a rank above their ceiling", () => {
  const ceiling = ceilingSortOrder(purpleThenBlueThenWhite, BJJ) // 30 (purple)

  it("allows the ceiling rank itself and everything below", () => {
    expect(isWithinCeiling(30, ceiling)).toBe(true) // purple (own top)
    expect(isWithinCeiling(20, ceiling)).toBe(true) // blue
    expect(isWithinCeiling(10, ceiling)).toBe(true) // white
  })

  it("DENIES any rank above the ceiling (no self-promotion)", () => {
    expect(isWithinCeiling(40, ceiling)).toBe(false) // brown
    expect(isWithinCeiling(50, ceiling)).toBe(false) // black
    expect(isWithinCeiling(31, ceiling)).toBe(false) // one notch above
  })

  it("DENIES everything when the member has no ceiling (cannot bootstrap a belt)", () => {
    expect(isWithinCeiling(10, null)).toBe(false)
    expect(isWithinCeiling(0, null)).toBe(false)
  })
})

describe("isFactEditable (loosened SESSION_0540) — self-added OR unverified is editable", () => {
  it("ALLOWS editing a self-added backfill award (STATED, VERIFIED-by-implication, no approver)", () => {
    expect(
      isFactEditable({ source: "STATED", verificationStatus: "VERIFIED", awardedById: null }),
    ).toBe(true)
  })

  it("ALLOWS editing a STATED UNVERIFIED self-report (no approver)", () => {
    expect(
      isFactEditable({ source: "STATED", verificationStatus: "UNVERIFIED", awardedById: null }),
    ).toBe(true)
  })

  it("ALLOWS editing ANY UNVERIFIED award the owner holds — even EARNED (SESSION_0540)", () => {
    expect(
      isFactEditable({ source: "EARNED", verificationStatus: "UNVERIFIED", awardedById: null }),
    ).toBe(true)
  })

  it("DENIES editing a promotion-minted award (VERIFIED but stamped with an approver)", () => {
    expect(
      isFactEditable({
        source: "STATED",
        verificationStatus: "VERIFIED",
        awardedById: "u-approver",
      }),
    ).toBe(false)
  })

  it("DENIES editing an IMPORTED or DISPUTED award (authority/legacy records, deny-by-default)", () => {
    expect(
      isFactEditable({ source: "STATED", verificationStatus: "IMPORTED", awardedById: null }),
    ).toBe(false)
    expect(
      isFactEditable({ source: "STATED", verificationStatus: "DISPUTED", awardedById: null }),
    ).toBe(false)
  })

  it("DENIES editing an EARNED award that is already VERIFIED without an approver (not a backfill)", () => {
    expect(
      isFactEditable({ source: "EARNED", verificationStatus: "VERIFIED", awardedById: null }),
    ).toBe(false)
  })
})

describe("decideBackfillTrust (SESSION_0540 — placeholder-promoter decision tree)", () => {
  it("VERIFIES a promoter Passport equal to the anchor's promoter (same coach)", () => {
    expect(
      decideBackfillTrust({
        backfillPromoterPassportId: "pp-anchor",
        promoterIsClaimablePlaceholder: false,
        backfillFreetextPromoter: null,
        anchorPromoterPassportId: "pp-anchor",
        isBackfillAnchor: false,
      }),
    ).toBe("verify")
  })

  it("VERIFIES even when the matching anchor promoter is itself a placeholder (same-coach wins)", () => {
    expect(
      decideBackfillTrust({
        backfillPromoterPassportId: "pp-anchor",
        promoterIsClaimablePlaceholder: true,
        backfillFreetextPromoter: null,
        anchorPromoterPassportId: "pp-anchor",
        isBackfillAnchor: false,
      }),
    ).toBe("verify")
  })

  it("RECRUITS a freshly free-typed placeholder coach — keep unverified, NO review (even with an anchor)", () => {
    expect(
      decideBackfillTrust({
        backfillPromoterPassportId: "pp-new-coach",
        promoterIsClaimablePlaceholder: true,
        backfillFreetextPromoter: "Coach Dave Willis",
        anchorPromoterPassportId: "pp-anchor",
        isBackfillAnchor: false,
      }),
    ).toBe("keep_unverified")
  })

  it("FLAGS an established (on-tree / registered) person that DIFFERS from the anchor's promoter", () => {
    expect(
      decideBackfillTrust({
        backfillPromoterPassportId: "pp-other",
        promoterIsClaimablePlaceholder: false,
        backfillFreetextPromoter: null,
        anchorPromoterPassportId: "pp-anchor",
        isBackfillAnchor: false,
      }),
    ).toBe("flag_promoter_changed")
  })

  it("KEEPS a registered promoter unverified when the anchor has no comparable promoter", () => {
    expect(
      decideBackfillTrust({
        backfillPromoterPassportId: "pp-other",
        promoterIsClaimablePlaceholder: false,
        backfillFreetextPromoter: null,
        anchorPromoterPassportId: null,
        isBackfillAnchor: false,
      }),
    ).toBe("keep_unverified")
  })

  it("KEEPS a legacy freetext-only promoter unverified (no FK yet — pre-rework rows)", () => {
    expect(
      decideBackfillTrust({
        backfillPromoterPassportId: null,
        promoterIsClaimablePlaceholder: false,
        backfillFreetextPromoter: "Coach Dave Willis",
        anchorPromoterPassportId: "pp-anchor",
        isBackfillAnchor: false,
      }),
    ).toBe("keep_unverified")
  })

  it("SKIPS when no promoter is expressed", () => {
    expect(
      decideBackfillTrust({
        backfillPromoterPassportId: null,
        promoterIsClaimablePlaceholder: false,
        backfillFreetextPromoter: "   ",
        anchorPromoterPassportId: "pp-anchor",
        isBackfillAnchor: false,
      }),
    ).toBe("skip")
  })

  it("SKIPS the anchor itself (never auto-verifies the reference belt)", () => {
    expect(
      decideBackfillTrust({
        backfillPromoterPassportId: "pp-anchor",
        promoterIsClaimablePlaceholder: false,
        backfillFreetextPromoter: null,
        anchorPromoterPassportId: "pp-anchor",
        isBackfillAnchor: true,
      }),
    ).toBe("skip")
  })
})

describe("memberFactEditability (SESSION_0501) — per-fact fill-blanks for the owner", () => {
  /** An authority-owned (IMPORTED) award with every fact empty, overridable per test. */
  const imported = (overrides: Partial<FactValueAward> = {}): FactValueAward => ({
    source: "STATED",
    verificationStatus: "IMPORTED",
    awardedById: null,
    awardedAt: null,
    awardedByPassportId: null,
    notes: null,
    organizationId: null,
    location: null,
    ...overrides,
  })

  it("a self-added backfill keeps FULL editability (unchanged B1)", () => {
    const result = memberFactEditability(
      imported({
        verificationStatus: "VERIFIED",
        // even with every fact FILLED — the member authored it, so overwrite is fine
        awardedAt: new Date("2020-01-01"),
        notes: "Prof. Freetext",
        location: "Some Academy",
      }),
    )
    expect(result.reason).toBe("SELF_BACKFILL")
    expect(result.facts).toEqual({ awardedAt: true, promoter: true, school: true })
  })

  it("an authority award with EVERY fact empty is fully fillable (AUTHORITY_PARTIAL)", () => {
    const result = memberFactEditability(imported())
    expect(result.reason).toBe("AUTHORITY_PARTIAL")
    expect(result.facts).toEqual({ awardedAt: true, promoter: true, school: true })
  })

  it("a FILLED fact locks — per fact, not per card (date filled, others still fillable)", () => {
    const result = memberFactEditability(imported({ awardedAt: new Date("2019-06-01") }))
    expect(result.reason).toBe("AUTHORITY_PARTIAL")
    expect(result.facts).toEqual({ awardedAt: false, promoter: true, school: true })
  })

  it("promoter counts as filled via EITHER the Passport FK or freetext notes", () => {
    expect(memberFactEditability(imported({ awardedByPassportId: "pp-1" })).facts.promoter).toBe(
      false,
    )
    expect(memberFactEditability(imported({ notes: "Prof. Freetext" })).facts.promoter).toBe(false)
    // whitespace-only freetext is NOT a value
    expect(memberFactEditability(imported({ notes: "   " })).facts.promoter).toBe(true)
  })

  it("school counts as filled via EITHER the Organization FK or freetext location", () => {
    expect(memberFactEditability(imported({ organizationId: "org-1" })).facts.school).toBe(false)
    expect(memberFactEditability(imported({ location: "Some Academy" })).facts.school).toBe(false)
  })

  it("every fact filled → AUTHORITY_LOCKED (nothing left for the owner)", () => {
    const result = memberFactEditability(
      imported({
        awardedAt: new Date("2019-06-01"),
        awardedByPassportId: "pp-1",
        organizationId: "org-1",
      }),
    )
    expect(result.reason).toBe("AUTHORITY_LOCKED")
    expect(result.facts).toEqual({ awardedAt: false, promoter: false, school: false })
  })

  it("a promotion-minted award (awardedById stamped) gets the same fill-blanks treatment", () => {
    const result = memberFactEditability(
      imported({ verificationStatus: "VERIFIED", awardedById: "u-approver" }),
    )
    expect(result.reason).toBe("AUTHORITY_PARTIAL")
    expect(result.facts).toEqual({ awardedAt: true, promoter: true, school: true })
  })

  it("DISPUTED is fully locked for the owner even with empty facts (deny-by-default)", () => {
    const result = memberFactEditability(imported({ verificationStatus: "DISPUTED" }))
    expect(result.reason).toBe("AUTHORITY_LOCKED")
    expect(result.facts).toEqual({ awardedAt: false, promoter: false, school: false })
  })
})

describe("isTopAward — a member CANNOT delete their top award", () => {
  it("flags the highest awarded belt in the discipline as the top", () => {
    expect(isTopAward("a-purple", purpleThenBlueThenWhite, BJJ)).toBe(true)
  })

  it("does NOT flag lower belts as the top (they are deletable)", () => {
    expect(isTopAward("a-blue", purpleThenBlueThenWhite, BJJ)).toBe(false)
    expect(isTopAward("a-white", purpleThenBlueThenWhite, BJJ)).toBe(false)
  })

  it("scopes 'top' to the discipline, not the global highest", () => {
    const mixed = [award("fma-top", 99, OTHER), award("bjj-blue", 20, BJJ)]
    expect(isTopAward("fma-top", mixed, BJJ)).toBe(false)
    expect(isTopAward("bjj-blue", mixed, BJJ)).toBe(true)
  })
})
