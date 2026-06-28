// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, it } from "bun:test"
import type { BoardCard } from "@ronin-dojo/ui-kit"
import type { KanbanCard } from "~/.generated/prisma/client"
import {
  cardToManualCreate,
  cardToUpdate,
  ledgerCardToCreate,
  legacyTaskToCreate,
  rowToBoardCard,
} from "./map-card"

const row: KanbanCard = {
  id: "GL:G-003",
  configId: "ronin-loop-board",
  stage: "in-progress",
  order: 2,
  source: "ledger",
  sourceRef: "GL:G-003",
  title: "A goal",
  status: "active",
  lane: null,
  owner: null,
  due: null,
  nextStep: null,
  value: null,
  badges: [{ label: "GL:G-003", tone: "positive" }],
  fields: null,
  createdAt: new Date("2026-06-28T00:00:00.000Z"),
  updatedAt: new Date("2026-06-28T01:00:00.000Z"),
}

describe("rowToBoardCard", () => {
  it("maps a row to a BoardCard, JSON badges back to an array, nulls to undefined, dates to ISO", () => {
    const card = rowToBoardCard(row)
    expect(card.id).toBe("GL:G-003")
    expect(card.stage).toBe("in-progress")
    expect(card.title).toBe("A goal")
    expect(card.badges).toEqual([{ label: "GL:G-003", tone: "positive" }])
    expect(card.lane).toBeUndefined()
    expect(card.value).toBeUndefined()
    expect(card.createdAt).toBe("2026-06-28T00:00:00.000Z")
    expect(card.updatedAt).toBe("2026-06-28T01:00:00.000Z")
  })
})

const card: BoardCard = {
  id: "c_abc",
  stage: "backlog",
  title: "Manual card",
  status: "active",
  createdAt: "2026-06-28T00:00:00.000Z",
  updatedAt: "2026-06-28T00:00:00.000Z",
}

describe("cardToManualCreate", () => {
  it("a board-created card is always source=manual with a null sourceRef + the given order", () => {
    const data = cardToManualCreate(card, "ronin-loop-board", 3)
    expect(data.id).toBe("c_abc")
    expect(data.configId).toBe("ronin-loop-board")
    expect(data.source).toBe("manual")
    expect(data.sourceRef).toBeNull()
    expect(data.order).toBe(3)
    expect(data.title).toBe("Manual card")
  })
})

describe("cardToUpdate", () => {
  it("never carries the immutable origin (source / sourceRef / id)", () => {
    const data = cardToUpdate(card, 1)
    expect(data).not.toHaveProperty("source")
    expect(data).not.toHaveProperty("sourceRef")
    expect(data).not.toHaveProperty("id")
    expect(data.stage).toBe("backlog")
    expect(data.order).toBe(1)
  })
})

describe("ledgerCardToCreate", () => {
  it("stamps source=ledger, reuses the stable card id as the dedup sourceRef, and carries the rank order", () => {
    const c: BoardCard = { ...card, id: "RISK:#9", stage: "blocked", title: "A risk" }
    const data = ledgerCardToCreate(c, "ronin-loop-board", 4)
    expect(data.id).toBe("RISK:#9")
    expect(data.source).toBe("ledger")
    expect(data.sourceRef).toBe("RISK:#9")
    expect(data.stage).toBe("blocked")
    expect(data.order).toBe(4)
  })
})

describe("legacyTaskToCreate", () => {
  it("namespaces the id, stamps source=task, maps done→stage, keeps the project as a badge", () => {
    const open = legacyTaskToCreate(
      { id: "t1", title: "Open", done: false, project: "Inbox" },
      "cfg",
    )
    expect(open.id).toBe("task:t1")
    expect(open.source).toBe("task")
    expect(open.sourceRef).toBe("t1")
    expect(open.stage).toBe("backlog")
    expect(open.badges).toEqual([{ label: "Inbox" }])

    const done = legacyTaskToCreate({ id: "t2", title: "Done", done: true }, "cfg")
    expect(done.stage).toBe("done")
    expect(done.status).toBe("inactive")
  })
})
