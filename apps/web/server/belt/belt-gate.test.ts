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
  type GateAward,
  isFactEditable,
  isTopAward,
  isWithinCeiling,
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

describe("isFactEditable (B1) — only a self-added STATED backfill is editable", () => {
  it("ALLOWS editing a self-added backfill award (STATED, VERIFIED-by-implication, no approver)", () => {
    expect(
      isFactEditable({ source: "STATED", verificationStatus: "VERIFIED", awardedById: null }),
    ).toBe(true)
  })

  it("ALLOWS editing a legacy UNVERIFIED self-report (STATED, no approver) for back-compat", () => {
    expect(
      isFactEditable({ source: "STATED", verificationStatus: "UNVERIFIED", awardedById: null }),
    ).toBe(true)
  })

  it("DENIES editing a promotion-minted award (STATED + VERIFIED but stamped with an approver)", () => {
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

  it("DENIES editing an EARNED award (not a self-added STATED backfill)", () => {
    expect(
      isFactEditable({ source: "EARNED", verificationStatus: "VERIFIED", awardedById: null }),
    ).toBe(false)
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
