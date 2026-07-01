// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import type { BeltCardOutput } from "~/server/belt/schemas"
import {
  beltDateLabel,
  type BeltRankViewModel,
  deriveBeltStatus,
  isFactEditableStatus,
  isRankLocked,
  isWhiteBelt,
} from "./belt-view-model"

function rankVm(sortOrder: number, card: BeltCardOutput | null): BeltRankViewModel {
  return {
    rank: { id: `rank_${sortOrder}`, name: `Belt ${sortOrder}`, colorHex: null, sortOrder },
    card,
    media: [],
  }
}

function card(over: Partial<BeltCardOutput> = {}): BeltCardOutput {
  return {
    rankAwardId: "ra_1",
    rankId: "rank_1",
    rankName: "Belt 1",
    rankSortOrder: 1,
    colorHex: null,
    verificationStatus: "UNVERIFIED",
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
          media: [{ attachmentId: "a", mediaId: "m", purpose: "belt" }],
        },
      }),
    )
    expect(deriveBeltStatus(vm, 3)).toBe("completed")
  })
})

describe("isFactEditableStatus (mirrors server isFactEditable)", () => {
  it("is editable ONLY when UNVERIFIED", () => {
    expect(isFactEditableStatus("UNVERIFIED")).toBe(true)
  })
  it("is read-only for verified/imported/disputed/absent", () => {
    expect(isFactEditableStatus("VERIFIED")).toBe(false)
    expect(isFactEditableStatus("IMPORTED")).toBe(false)
    expect(isFactEditableStatus("DISPUTED")).toBe(false)
    expect(isFactEditableStatus(null)).toBe(false)
    expect(isFactEditableStatus(undefined)).toBe(false)
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
