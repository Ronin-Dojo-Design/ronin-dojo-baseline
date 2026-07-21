// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, test } from "bun:test"
import {
  aggregateCostSeries,
  parseSessionCostFile,
  parseTelemetryBlock,
  summarizeByModel,
} from "./token-cost-parse"

const docWith = (telemetry: string) =>
  `---\ntitle: "SESSION 0608 — Test"\nstatus: closed\n${telemetry}sprint: S12\n---\n\n# body\n`

describe("parseTelemetryBlock", () => {
  test("parses a two-row structured block", () => {
    const doc = docWith(
      "telemetry:\n  - model: claude-sonnet-5\n    input: 310000\n    output: 42000\n    costUsd: 1.56\n  - model: claude-opus-4.8\n    input: 52000\n    output: 9000\n    costUsd: 1.45\n",
    )
    expect(parseTelemetryBlock(doc)).toEqual([
      { model: "claude-sonnet-5", input: 310000, output: 42000, costUsd: 1.56 },
      { model: "claude-opus-4.8", input: 52000, output: 9000, costUsd: 1.45 },
    ])
  })

  test("tolerates a leading comment line above the key", () => {
    const doc = docWith(
      "# seed example — not reconciled against a real usage banner\ntelemetry:\n  - model: claude-sonnet-5\n    input: 1000\n    output: 200\n    costUsd: 0.01\n",
    )
    expect(parseTelemetryBlock(doc)).toEqual([
      { model: "claude-sonnet-5", input: 1000, output: 200, costUsd: 0.01 },
    ])
  })

  test("returns [] for the legacy freeform scalar form (SESSION_0587 precedent)", () => {
    const doc = docWith('telemetry: "lanes=Sonnet 5 (4×, ~1.56M subagent tok)"\n')
    expect(parseTelemetryBlock(doc)).toEqual([])
  })

  test("returns [] with no telemetry key at all", () => {
    expect(parseTelemetryBlock(docWith(""))).toEqual([])
  })

  test("returns [] with no frontmatter block", () => {
    expect(parseTelemetryBlock("# just a doc\n")).toEqual([])
  })

  test("drops a row missing a required field, keeps the rest", () => {
    const doc = docWith(
      "telemetry:\n  - model: claude-sonnet-5\n    input: 1000\n    output: 200\n  - model: claude-opus-4.8\n    input: 52000\n    output: 9000\n    costUsd: 1.45\n",
    )
    expect(parseTelemetryBlock(doc)).toEqual([
      { model: "claude-opus-4.8", input: 52000, output: 9000, costUsd: 1.45 },
    ])
  })

  test("drops a row with a non-numeric field", () => {
    const doc = docWith(
      "telemetry:\n  - model: claude-sonnet-5\n    input: not-a-number\n    output: 200\n    costUsd: 0.01\n",
    )
    expect(parseTelemetryBlock(doc)).toEqual([])
  })
})

describe("parseSessionCostFile", () => {
  const path = "docs/sprints/SESSION_0608.md"

  test("returns null for a non-matching filename", () => {
    expect(
      parseSessionCostFile("docs/sprints/_template/SESSION_TEMPLATE.md", docWith("")),
    ).toBeNull()
  })

  test("returns null when the session has zero telemetry rows", () => {
    expect(parseSessionCostFile(path, docWith(""))).toBeNull()
  })

  test("aggregates rows into session totals + strips the title prefix", () => {
    const doc = docWith(
      "telemetry:\n  - model: claude-sonnet-5\n    input: 310000\n    output: 42000\n    costUsd: 1.56\n  - model: claude-opus-4.8\n    input: 52000\n    output: 9000\n    costUsd: 1.45\n",
    )
    const detail = parseSessionCostFile(path, doc)
    expect(detail).toEqual({
      number: "0608",
      title: "Test",
      rows: [
        { model: "claude-sonnet-5", input: 310000, output: 42000, costUsd: 1.56 },
        { model: "claude-opus-4.8", input: 52000, output: 9000, costUsd: 1.45 },
      ],
      totalInput: 362000,
      totalOutput: 51000,
      totalCostUsd: 3.01,
    })
  })
})

describe("aggregateCostSeries", () => {
  test("sorts sessions ascending by number into {number, costUsd} points", () => {
    const sessions = [
      parseSessionCostFile(
        "docs/sprints/SESSION_0608.md",
        docWith(
          "telemetry:\n  - model: claude-sonnet-5\n    input: 1\n    output: 1\n    costUsd: 2\n",
        ),
      ),
      parseSessionCostFile(
        "docs/sprints/SESSION_0587.md",
        docWith(
          "telemetry:\n  - model: claude-sonnet-5\n    input: 1\n    output: 1\n    costUsd: 1\n",
        ),
      ),
    ].filter((s): s is NonNullable<typeof s> => s !== null)

    expect(aggregateCostSeries(sessions)).toEqual([
      { number: "0587", costUsd: 1 },
      { number: "0608", costUsd: 2 },
    ])
  })
})

describe("summarizeByModel", () => {
  test("rolls rows across sessions up per model, sorted by cost descending", () => {
    const sessions = [
      parseSessionCostFile(
        "docs/sprints/SESSION_0608.md",
        docWith(
          "telemetry:\n  - model: claude-sonnet-5\n    input: 100\n    output: 10\n    costUsd: 1\n  - model: claude-opus-4.8\n    input: 50\n    output: 5\n    costUsd: 4\n",
        ),
      ),
      parseSessionCostFile(
        "docs/sprints/SESSION_0587.md",
        docWith(
          "telemetry:\n  - model: claude-sonnet-5\n    input: 200\n    output: 20\n    costUsd: 2\n",
        ),
      ),
    ].filter((s): s is NonNullable<typeof s> => s !== null)

    expect(summarizeByModel(sessions)).toEqual([
      { model: "claude-opus-4.8", input: 50, output: 5, costUsd: 4 },
      { model: "claude-sonnet-5", input: 300, output: 30, costUsd: 3 },
    ])
  })
})
