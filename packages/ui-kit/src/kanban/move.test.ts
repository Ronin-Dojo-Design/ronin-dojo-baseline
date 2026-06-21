// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep.
import { describe, expect, it } from "bun:test"
import { moveCard } from "./move"
import type { BoardCard, BoardConfig } from "./types"

const config: BoardConfig = {
  id: "test",
  title: "Test",
  brand: "test",
  cardKind: "task",
  stages: [
    { id: "new", name: "New", intake: true },
    { id: "order", name: "Order", requires: "orderConfirmed" },
    { id: "closed", name: "Won / Lost", terminal: true, reasonOnLost: true },
  ],
  automations: ["order-guard", "lost-reason"],
}

const base: BoardCard = {
  id: "c1",
  stage: "new",
  title: "Flores job",
  createdAt: "2026-06-20T00:00:00Z",
  updatedAt: "2026-06-20T00:00:00Z",
}

describe("moveCard / order-guard (requires)", () => {
  it("blocks a move into a `requires` stage when the field is falsy", () => {
    const result = moveCard(base, "order", config)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe("requires")
      expect(result.field).toBe("orderConfirmed")
    }
  })

  it("allows the move once the required field is truthy", () => {
    const ready = { ...base, fields: { orderConfirmed: true } }
    const result = moveCard(ready, "order", config)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.card.stage).toBe("order")
    }
  })

  it("does NOT guard when order-guard is disabled", () => {
    const loose: BoardConfig = { ...config, automations: ["lost-reason"] }
    const result = moveCard(base, "order", loose)
    expect(result.ok).toBe(true)
  })
})

describe("moveCard / lost-reason", () => {
  it("blocks a terminal loss move without a reason", () => {
    const result = moveCard(base, "closed", config)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe("lost-reason")
    }
  })

  it("allows the loss move when a reason is supplied and stamps it", () => {
    const result = moveCard(base, "closed", config, { lostReason: "Went with a competitor" })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.card.lostReason).toBe("Went with a competitor")
    }
  })
})
