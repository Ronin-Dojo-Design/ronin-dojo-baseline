// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, it } from "bun:test"
import { computeHealth } from "~/lib/loop-board/health"
import type { Item } from "~/lib/loop-board/ledger-parse"

const item = (over: Partial<Item>): Item => ({
  id: "x",
  ledger: "WL",
  priority: "P2",
  status: "open",
  summary: "s",
  ...over,
})

describe("computeHealth", () => {
  const health = computeHealth([
    item({ ledger: "WL", priority: "P2" }),
    item({ ledger: "WL", priority: "P1" }),
    item({ ledger: "RISK", priority: "P0" }),
  ])

  it("totals all items", () => {
    expect(health.total).toBe(3)
  })

  it("counts by priority", () => {
    const byP = Object.fromEntries(health.byPriority.map(p => [p.priority, p.count]))
    expect(byP.P0).toBe(1)
    expect(byP.P1).toBe(1)
    expect(byP.P2).toBe(1)
  })

  it("counts by ledger in stable order", () => {
    const wl = health.byLedger.find(l => l.code === "WL")
    const risk = health.byLedger.find(l => l.code === "RISK")
    expect(wl?.count).toBe(2)
    expect(risk?.count).toBe(1)
  })
})
