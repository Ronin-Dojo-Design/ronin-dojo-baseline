// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dependency.
import { describe, expect, it } from "bun:test"
import { runPlaywrightGlobalSetup } from "../e2e/global-setup"

const E2E_URL = "postgresql://local@localhost:5432/ronindojo_e2e"

describe("raw Playwright global setup database boundary", () => {
  it("fails before invoking either the fixture bridge or the fixture-file write", () => {
    let seedCalls = 0
    let writeCalls = 0

    expect(() =>
      runPlaywrightGlobalSetup({
        databaseUrl: "postgresql://user@db.example.test:5432/ronindojo_e2e",
        directUrl: E2E_URL,
        isCi: false,
        seedFixture: () => {
          seedCalls += 1
          return "{}"
        },
        writeFixture: () => {
          writeCalls += 1
        },
      }),
    ).toThrow("Refusing non-loopback DATABASE_URL host")

    expect(seedCalls).toBe(0)
    expect(writeCalls).toBe(0)
  })

  it("invokes the bridge and file write only after a matched local endpoint passes", () => {
    let writtenFixture: unknown

    runPlaywrightGlobalSetup({
      databaseUrl: E2E_URL,
      directUrl: E2E_URL,
      isCi: false,
      seedFixture: () => '{"tournamentId":"fixture-id"}',
      writeFixture: fixture => {
        writtenFixture = fixture
      },
    })

    expect(writtenFixture).toEqual({ tournamentId: "fixture-id" })
  })
})
