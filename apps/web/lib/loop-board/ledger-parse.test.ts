// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, it } from "bun:test"
import { aggregateFromContents, parseLedger } from "~/lib/loop-board/ledger-parse"

const WL = `
| ID | Area | State | Finding |
| --- | --- | --- | --- |
| WL-P1-9 | nav | open | Open wiring item to fix |
| WL-P2-3 ✅ | nav | done | Resolved wiring (should be excluded) |
`

const DRIFT = `
### D-099 — Some drift title

- **Status:** open — needs fix

### D-100 — Resolved drift

- **Status:** resolved
`

const RISK = `
| Priority | Risk | Severity | Notes |
| --- | --- | --- | --- |
| 1 | Critical risk thing | Critical | live |
| 2 | Resolved risk | High | ✅ confirmed fixed |
`

const INC = `
| Date | Slug | Title | Detail | Sev | Resolved by |
| --- | --- | --- | --- | --- | --- |
| 2026-06-01 | inc-x | Boom | bad thing | high | |
| 2026-06-02 | inc-y | Fixed | ok | high | someone |
`

describe("parseLedger", () => {
  it("parses open wiring rows and excludes resolved (✅) ones", () => {
    const items = parseLedger("WL", WL)
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe("WL-P1-9")
    expect(items[0].priority).toBe("P1")
    expect(items[0].summary).toBe("Open wiring item to fix")
  })

  it("parses open sectioned drift and excludes resolved sections", () => {
    const items = parseLedger("D", DRIFT)
    expect(items.map(i => i.id)).toEqual(["D-099"])
  })

  it("maps RISK severity to priority and drops resolved rows", () => {
    const items = parseLedger("RISK", RISK)
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe("#1")
    expect(items[0].priority).toBe("P0")
  })

  it("treats an unresolved incident (empty resolved-by) as an open P0", () => {
    const items = parseLedger("INC", INC)
    expect(items).toHaveLength(1)
    expect(items[0].priority).toBe("P0")
    expect(items[0].summary).toBe("Boom: bad thing")
  })
})

describe("aggregateFromContents", () => {
  it("ranks by priority then ledger order, skipping absent ledgers", () => {
    const items = aggregateFromContents({ WL, D: DRIFT, RISK, INC })
    // P0s first (INC before RISK by ledger order), then P1 (WL), then "—" (D-099).
    expect(items.map(i => `${i.ledger}:${i.priority}`)).toEqual([
      "INC:P0",
      "RISK:P0",
      "WL:P1",
      "D:—",
    ])
  })

  it("honors the single-ledger filter", () => {
    const items = aggregateFromContents({ WL, D: DRIFT }, { ledger: "WL" })
    expect(items.every(i => i.ledger === "WL")).toBe(true)
  })
})
