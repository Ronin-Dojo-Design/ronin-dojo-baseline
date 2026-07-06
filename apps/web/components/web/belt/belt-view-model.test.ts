// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import type { BeltCardOutput } from "~/server/belt/schemas"
import {
  beltDateLabel,
  type BeltRankViewModel,
  canRequestPromotion,
  cardFactEditability,
  deriveBeltStatus,
  isRankLocked,
  isWhiteBelt,
} from "./belt-view-model"

function rankVm(sortOrder: number, card: BeltCardOutput | null): BeltRankViewModel {
  return {
    rank: { id: `rank_${sortOrder}`, name: `Belt ${sortOrder}`, colorHex: null, sortOrder },
    card,
  }
}

function card(over: Partial<BeltCardOutput> = {}): BeltCardOutput {
  return {
    rankAwardId: "ra_1",
    rankId: "rank_1",
    rankName: "Belt 1",
    rankSortOrder: 1,
    colorHex: null,
    verificationStatus: "VERIFIED",
    isFactEditable: true,
    factEditability: { awardedAt: true, promoter: true, school: true },
    editabilityReason: "SELF_BACKFILL",
    awardedAt: null,
    promoterName: null,
    awardedByPassportId: null,
    schoolName: null,
    organizationId: null,
    milestone: null,
    ...over,
  }
}

describe("isRankLocked (self-promotion invariant, Locked #5)", () => {
  it("locks a rank ABOVE the ceiling", () => {
    expect(isRankLocked(5, 3)).toBe(true)
  })
  it("unlocks a rank AT or BELOW the ceiling", () => {
    expect(isRankLocked(3, 3)).toBe(false)
    expect(isRankLocked(1, 3)).toBe(false)
  })
  it("locks EVERY rank when the member holds no discipline award (null ceiling)", () => {
    expect(isRankLocked(1, null)).toBe(true)
  })
})

describe("canRequestPromotion (B1 above-ceiling promotion CTA, Amendment 1)", () => {
  it("is true ABOVE the ceiling (a belt the member has not been awarded → route to a claim)", () => {
    expect(canRequestPromotion(5, 3)).toBe(true)
  })
  it("is false AT or BELOW the ceiling (enrichable, not requestable — no self-promotion)", () => {
    expect(canRequestPromotion(3, 3)).toBe(false)
    expect(canRequestPromotion(1, 3)).toBe(false)
  })
  it("is true for EVERY belt when the member holds no discipline award (null ceiling → first-belt request)", () => {
    expect(canRequestPromotion(1, null)).toBe(true)
  })
})

describe("deriveBeltStatus", () => {
  it("is `locked` above the ceiling regardless of enrichment", () => {
    const vm = rankVm(5, card({ milestone: { id: "m1", story: "x", media: [] } }))
    expect(deriveBeltStatus(vm, 3)).toBe("locked")
  })
  it("is `add` when unlocked but empty (no card)", () => {
    expect(deriveBeltStatus(rankVm(2, null), 3)).toBe("add")
  })
  it("is `add` when a card exists but has no story or media", () => {
    const vm = rankVm(2, card({ milestone: { id: "m1", story: "   ", media: [] } }))
    expect(deriveBeltStatus(vm, 3)).toBe("add")
  })
  it("is `completed` when unlocked and a story is present", () => {
    const vm = rankVm(2, card({ milestone: { id: "m1", story: "My blue belt", media: [] } }))
    expect(deriveBeltStatus(vm, 3)).toBe("completed")
  })
  it("is `completed` when unlocked and media is present", () => {
    const vm = rankVm(
      2,
      card({
        milestone: {
          id: "m1",
          story: null,
          media: [
            {
              attachmentId: "a",
              mediaId: "m",
              purpose: "belt",
              url: "https://cdn.example/m.jpg",
              type: "IMAGE",
            },
          ],
        },
      }),
    )
    expect(deriveBeltStatus(vm, 3)).toBe("completed")
  })
})

describe("cardFactEditability (reflects the server's per-fact matrix, SESSION_0501)", () => {
  it("passes the server-computed matrix through untouched", () => {
    const facts = { awardedAt: false, promoter: true, school: false }
    expect(cardFactEditability(card({ factEditability: facts }))).toEqual(facts)
  })
  it("locks every fact for an absent card (no award to edit)", () => {
    const locked = { awardedAt: false, promoter: false, school: false }
    expect(cardFactEditability(null)).toEqual(locked)
    expect(cardFactEditability(undefined)).toEqual(locked)
  })
})

describe("isWhiteBelt / beltDateLabel (white-belt special-case)", () => {
  it("identifies the ladder minimum as the white belt", () => {
    expect(isWhiteBelt(0, 0)).toBe(true)
    expect(isWhiteBelt(1, 0)).toBe(false)
  })
  it("asks about training start for white belt, promotion otherwise", () => {
    expect(beltDateLabel(true)).toBe("When did you start training in BJJ?")
    expect(beltDateLabel(false)).toBe("Promotion date")
  })
})
