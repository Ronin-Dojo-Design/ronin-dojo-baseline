// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep.
import { describe, expect, it } from "bun:test"
import { evaluateBoard, evaluateCard, sortColumn } from "./automations"
import type { BoardCard, BoardConfig } from "./types"

const NOW = Date.parse("2026-06-21T12:00:00Z")
const daysAgo = (n: number) => new Date(NOW - n * 86_400_000).toISOString()

const config: BoardConfig = {
  id: "test",
  title: "Test",
  brand: "test",
  cardKind: "task",
  stages: [
    { id: "new", name: "New", intake: true },
    { id: "contacted", name: "Contacted", sla: 2 },
    { id: "closed", name: "Won / Lost", terminal: true, reasonOnLost: true },
  ],
  automations: ["rotting", "next-step-reminder", "stage-sla", "lost-reason", "order-guard"],
}

function card(over: Partial<BoardCard>): BoardCard {
  return {
    id: "c1",
    stage: "contacted",
    title: "T",
    nextStep: "call",
    createdAt: daysAgo(10),
    updatedAt: daysAgo(0),
    ...over,
  }
}

describe("automations / rotting + stage-sla", () => {
  it("flags a card past its stage SLA as at-risk", () => {
    const flags = evaluateCard(card({ updatedAt: daysAgo(5) }), config, NOW)
    expect(flags.atRisk).toBe(true)
    expect(flags.reasons).toContain("rotting")
    expect(flags.reasons).toContain("stage-sla")
  })

  it("does NOT flag a card within its SLA window", () => {
    const flags = evaluateCard(card({ updatedAt: daysAgo(1) }), config, NOW)
    expect(flags.atRisk).toBe(false)
  })

  it("never flags a terminal-stage card", () => {
    const flags = evaluateCard(
      card({ stage: "closed", updatedAt: daysAgo(99), nextStep: "" }),
      config,
      NOW,
    )
    expect(flags.atRisk).toBe(false)
  })

  it("ignores rotting when the rule is not enabled", () => {
    const noRot: BoardConfig = { ...config, automations: ["next-step-reminder"] }
    const flags = evaluateCard(card({ updatedAt: daysAgo(9) }), noRot, NOW)
    expect(flags.reasons).not.toContain("rotting")
  })
})

describe("automations / next-step-reminder", () => {
  it("flags an open card with an empty next step", () => {
    const flags = evaluateCard(card({ nextStep: "", updatedAt: daysAgo(0) }), config, NOW)
    expect(flags.atRisk).toBe(true)
    expect(flags.reasons).toContain("no-next-step")
  })
})

describe("sortColumn", () => {
  it("bumps at-risk cards to the top, then most-recent", () => {
    const a = card({ id: "a", nextStep: "x", updatedAt: daysAgo(1) })
    const b = card({ id: "b", nextStep: "", updatedAt: daysAgo(3) }) // at-risk (no next step)
    const flags = evaluateBoard([a, b], config, NOW)
    const sorted = sortColumn([a, b], flags)
    expect(sorted[0]?.id).toBe("b")
  })
})
