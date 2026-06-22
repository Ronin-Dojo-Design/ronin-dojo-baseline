// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, it } from "bun:test"
import { mapRankGroupToCard, type RankGroupProjection } from "~/lib/m-card/map-rank"

/**
 * Representative belt-group projection — already projected + already public. A `Rank` (name +
 * data-driven `colorHex` tint), its grouped member `count`, and public curriculum `items`.
 * Crucially this also carries an out-of-contract field (`memberEmails`) to prove the card mapper
 * never forwards anything beyond the canonical `rank` DTO slice.
 */
function rankGroupFixture(overrides: Partial<RankGroupProjection> = {}): RankGroupProjection {
  return {
    id: "rk_1",
    name: "Blue Belt",
    colorHex: "#2563eb",
    disciplineCode: "BJJ",
    count: 12,
    items: [
      { id: "t_1", label: "Scissor sweep", done: true },
      { id: "t_2", label: "Triangle choke", done: false },
      { id: "t_3", label: "Guard pass" },
    ],
    ...overrides,
  }
}

/** Fields a public rank card must NEVER carry — redaction lives upstream, not in the card. */
const FORBIDDEN_FIELDS = [
  "memberEmails",
  "members",
  "email",
  "phone",
  "userId",
  "passportId",
  "awardedById",
]

describe("mapRankGroupToCard", () => {
  it("maps the projected belt group onto the rank card shape", () => {
    // Pass an extra non-contract field to prove it is dropped.
    const card = mapRankGroupToCard({
      ...rankGroupFixture(),
      // @ts-expect-error - deliberately out-of-contract to prove the mapper drops it.
      memberEmails: ["leak@example.com"],
    })

    expect(card).toEqual({
      id: "rk_1",
      name: "Blue Belt",
      colorHex: "#2563eb",
      disciplineCode: "BJJ",
      count: 12,
      items: [
        { id: "t_1", label: "Scissor sweep", done: true },
        { id: "t_2", label: "Triangle choke", done: false },
        { id: "t_3", label: "Guard pass", done: undefined },
      ],
    })
  })

  it("carries the data-driven belt tint (Rank.colorHex) through to the card", () => {
    const card = mapRankGroupToCard(rankGroupFixture())
    expect(card.colorHex).toBe("#2563eb")
  })

  it("preserves the curriculum checklist with done state", () => {
    const card = mapRankGroupToCard(rankGroupFixture())
    expect(card.items).toHaveLength(3)
    expect(card.items?.[0]).toEqual({ id: "t_1", label: "Scissor sweep", done: true })
    expect(card.items?.[1].done).toBe(false)
  })

  it("falls back to null tint and omits items when the projection has none", () => {
    const card = mapRankGroupToCard(
      rankGroupFixture({ colorHex: null, disciplineCode: null, items: undefined, count: 0 }),
    )
    expect(card.colorHex).toBeNull()
    expect(card.disciplineCode).toBeNull()
    expect(card.items).toBeUndefined()
    expect(card.count).toBe(0)
  })

  it("does NOT leak any non-public field into the card", () => {
    const card = mapRankGroupToCard({
      ...rankGroupFixture(),
      // @ts-expect-error - deliberately out-of-contract.
      memberEmails: ["leak@example.com"],
    })
    const keys = Object.keys(card)
    for (const forbidden of FORBIDDEN_FIELDS) {
      expect(keys).not.toContain(forbidden)
    }
    expect(JSON.stringify(card)).not.toContain("leak@example.com")
    expect(JSON.stringify(card)).not.toContain("memberEmails")
  })
})
