// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dependency.
import { describe, expect, it } from "bun:test"
import { runPlaywrightGlobalSetup } from "../e2e/global-setup"

const E2E_URL = "postgresql://local@localhost:5432/ronindojo_e2e"

describe("raw Playwright global setup database boundary", () => {
  it("fails before invoking the base-reference seed, the fixture bridge, or the fixture-file write", () => {
    let baseCalls = 0
    let seedCalls = 0
    let writeCalls = 0

    expect(() =>
      runPlaywrightGlobalSetup({
        databaseUrl: "postgresql://user@db.example.test:5432/ronindojo_e2e",
        directUrl: E2E_URL,
        isCi: false,
        seedBaseReference: () => {
          baseCalls += 1
        },
        seedFixture: () => {
          seedCalls += 1
          return "{}"
        },
        writeFixture: () => {
          writeCalls += 1
        },
      }),
    ).toThrow("Refusing non-loopback DATABASE_URL host")

    // The base-reference seed writes to the DB, so it MUST stay behind the fail-closed
    // URL assertion — a bad host must reach zero DB writes (SESSION_0717).
    expect(baseCalls).toBe(0)
    expect(seedCalls).toBe(0)
    expect(writeCalls).toBe(0)
  })

  it("seeds base reference, then the fixture, then the file — only after a matched local endpoint passes", () => {
    const order: string[] = []
    let writtenFixture: unknown

    runPlaywrightGlobalSetup({
      databaseUrl: E2E_URL,
      directUrl: E2E_URL,
      isCi: false,
      seedBaseReference: () => {
        order.push("base")
      },
      seedFixture: () => {
        order.push("fixture")
        return '{"tournamentId":"fixture-id"}'
      },
      writeFixture: fixture => {
        order.push("write")
        writtenFixture = fixture
      },
    })

    // Base reference (BJJ ladder) must precede the tournament fixture + the file write.
    expect(order).toEqual(["base", "fixture", "write"])
    expect(writtenFixture).toEqual({ tournamentId: "fixture-id" })
  })
})
