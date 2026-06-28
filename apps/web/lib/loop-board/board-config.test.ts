// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, it } from "bun:test"
import { itemToBoardCard, itemsToBoardCards } from "~/lib/loop-board/board-config"
import type { Item } from "~/lib/loop-board/ledger-parse"

const item = (over: Partial<Item> = {}): Item => ({
  id: "WL-P2-21",
  ledger: "WL",
  priority: "P2",
  status: "open",
  summary: "Some open wiring item",
  ...over,
})

describe("itemToBoardCard", () => {
  it("routes an unresolved incident to the Blocked stage", () => {
    expect(itemToBoardCard(item({ ledger: "INC", id: "2026-06-01/x" })).stage).toBe("blocked")
  })

  it("routes an in-progress item to the In Progress stage", () => {
    expect(itemToBoardCard(item({ status: "in-progress" })).stage).toBe("in-progress")
  })

  it("routes everything else to Backlog", () => {
    expect(itemToBoardCard(item()).stage).toBe("backlog")
  })

  it("scopes the card id by ledger so ids stay unique across ledgers", () => {
    expect(itemToBoardCard(item({ ledger: "RISK", id: "#9" })).id).toBe("RISK:#9")
  })

  it("gives RISK a self-describing ledger badge", () => {
    const card = itemToBoardCard(item({ ledger: "RISK", id: "#9", priority: "P0" }))
    expect(card.badges?.[0]).toEqual({ label: "RISK #9", tone: "warning" })
  })

  it("adds a toned priority badge for P0/P1/P2 and omits it for —", () => {
    const p0 = itemToBoardCard(item({ priority: "P0" }))
    expect(p0.badges).toContainEqual({ label: "P0", tone: "critical" })

    const none = itemToBoardCard(item({ priority: "—" }))
    expect(none.badges).toHaveLength(1) // ledger badge only
  })
})

describe("itemsToBoardCards", () => {
  it("preserves order and maps every item", () => {
    const cards = itemsToBoardCards([item({ id: "A" }), item({ id: "B" })])
    expect(cards.map(c => c.id)).toEqual(["WL:A", "WL:B"])
  })
})
