// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  aggregateFromContents,
  parseLedger,
  parsePullRequests,
  type PullRequestJson,
} from "~/lib/loop-board/ledger-parse"

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

const GOALS = `
### G-001 — Land the first tester

- **Status:** in-progress — P0

### G-009 — Already achieved goal

- **Status:** done — P1
`

// Fixtures mirror the real ledgers' "### ID — title — status" convention (status inline in the
// heading, no separate `- **Status:**` body line) — PL/RLL/YLL/GPTLL/DBS (SESSION_0591 wiring).
const PLANNING = `
### PL-001 — Feature widgets for all sites (idea-intake surface) — planned (SESSION_0589 → lanes L2+L3)

- **Origin:** operator directive.

### PL-004 — Portfolio taxonomy — ✅ RATIFIED (ADR 0051, SESSION_0589)

- **Origin:** operator directive.
`

const REDDIT = `
### RLL-001 — BJJ competition-format thread — captured

- **Link:** https://reddit.com/r/bjj/example
`

const GPTLL = `
### GPTLL-001 — Review the 2026-07-19 brainstorm (incl. "Phase 14") — captured · content-pending

- **Origin:** operator directive.

### GPTLL-002 — Already-routed capture — done · routed to PL-010

- **Origin:** operator directive.
`

const DBS = `
### DBS-001 — clients-ci.yml runs \`bun run test\` per product → closes WL-P3-56 — fix-made · pending-merge

- **Fix:** something.

### DBS-002 — Already-merged finding — merged
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

  it("parses open/in-progress goals (GL) and excludes done ones", () => {
    const items = parseLedger("GL", GOALS)
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe("G-001")
    expect(items[0].priority).toBe("P0")
  })

  // SESSION_0591 — the 5 intake ledgers (PL/RLL/YLL/GPTLL/DBS) use inline "ID — title — status"
  // headings (no `- **Status:**` body line); assert each parses without error and drops closed rows.
  it("parses PL rows and excludes a ✅ RATIFIED (closed) one", () => {
    const items = parseLedger("PL", PLANNING)
    expect(items.map(i => i.id)).toEqual(["PL-001"])
    expect(items[0].ledger).toBe("PL")
    // status is `clean()`-truncated to 17 chars, same as every other sectioned ledger.
    expect(items[0].status).toBe("planned (SESSION…")
    expect(items[0].summary).toBe("Feature widgets for all sites (idea-intake surface)")
  })

  it("parses RLL rows (link-intake ledger)", () => {
    const items = parseLedger("RLL", REDDIT)
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe("RLL-001")
    expect(items[0].ledger).toBe("RLL")
    expect(items[0].status).toBe("captured")
  })

  it("returns an empty list for a seeded-empty YLL ledger (no rows yet) without crashing", () => {
    const items = parseLedger("YLL", "\n## Rows\n\n_None yet._\n")
    expect(items).toEqual([])
  })

  it("parses GPTLL rows and excludes a done/routed one", () => {
    const items = parseLedger("GPTLL", GPTLL)
    expect(items.map(i => i.id)).toEqual(["GPTLL-001"])
    expect(items[0].status).toBe("captured · conte…")
  })

  it("parses DBS rows (findings ledger) and excludes a merged one; a hyphenated status word survives the split", () => {
    const items = parseLedger("DBS", DBS)
    expect(items.map(i => i.id)).toEqual(["DBS-001"])
    expect(items[0].status).toBe("fix-made · pendi…")
    expect(items[0].summary).toBe("clients-ci.yml runs bun run test per product → closes WL-P3-56")
  })
})

const PRS: PullRequestJson[] = [
  {
    number: 174,
    title: "Clean draft PR",
    isDraft: true,
    reviewDecision: "",
    statusCheckRollup: [
      { __typename: "CheckRun", name: "Typecheck", conclusion: "SUCCESS", status: "COMPLETED" },
      { __typename: "StatusContext", context: "Vercel", state: "SUCCESS" },
    ],
  },
  {
    number: 173,
    title: "Red-CI PR",
    isDraft: true,
    reviewDecision: "",
    statusCheckRollup: [
      {
        __typename: "CheckRun",
        name: "Check (mammoth)",
        conclusion: "FAILURE",
        status: "COMPLETED",
      },
    ],
  },
  {
    number: 100,
    title: "Changes requested PR",
    isDraft: false,
    reviewDecision: "CHANGES_REQUESTED",
    statusCheckRollup: [{ __typename: "CheckRun", conclusion: "SUCCESS", status: "COMPLETED" }],
  },
]

describe("parsePullRequests", () => {
  it("ranks red-CI / changes-requested = P1, draft|clean = P2; ids are ledger-scoped #N", () => {
    const items = parsePullRequests(PRS)
    const by = Object.fromEntries(items.map(i => [i.id, i]))
    expect(by["#174"].priority).toBe("P2")
    expect(by["#174"].status).toBe("draft")
    expect(by["#173"].priority).toBe("P1") // a failed check is red
    expect(by["#173"].status).toBe("red-ci")
    expect(by["#100"].priority).toBe("P1") // changes-requested is red even with green checks
    expect(items.every(i => i.ledger === "PR")).toBe(true)
  })

  it("treats a pending/in-progress check as NOT red (only terminal failures are red)", () => {
    const [item] = parsePullRequests([
      {
        number: 5,
        title: "In-progress checks",
        isDraft: false,
        statusCheckRollup: [{ __typename: "CheckRun", status: "IN_PROGRESS", conclusion: "" }],
      },
    ])
    expect(item.priority).toBe("P2")
    expect(item.status).toBe("open")
  })
})

describe("aggregateFromContents", () => {
  it("merges the live PR source via extraItems and ranks PRs oldest-first within a priority", () => {
    const items = aggregateFromContents({ WL }, { extraItems: parsePullRequests(PRS) })
    const prIds = items.filter(i => i.ledger === "PR").map(i => i.id)
    // Both #100 and #173 are P1; oldest-first = ascending PR number → #100 before #173. #174 (P2) last.
    expect(prIds).toEqual(["#100", "#173", "#174"])
    // A PR P1 row outranks the lone WL P1 row by ledger order (PR sits right behind GL).
    expect(items[0].id).toBe("#100")
  })

  it("honors the single-ledger filter across BOTH channels (PR extraItems included)", () => {
    const items = aggregateFromContents(
      { WL },
      { ledger: "PR", extraItems: parsePullRequests(PRS) },
    )
    expect(items.every(i => i.ledger === "PR")).toBe(true)
    expect(items).toHaveLength(3)
  })

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
