/**
 * Playwright global setup — seeds a tournament fixture before all tests run.
 * The fixture data is written to a temp file so tests can read it.
 */

import { execFileSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { assertLiteralLocalE2eUrls } from "../scripts/e2e-db-env"

const FIXTURE_PATH = join(process.cwd(), "e2e", ".fixture.json")

interface PlaywrightGlobalSetupDependencies {
  databaseUrl: string | undefined
  directUrl: string | undefined
  isCi: boolean
  seedBaseReference: () => void
  seedFixture: () => string
  writeFixture: (fixture: unknown) => void
}

/** Exported for a pure ordering proof; production dependencies are supplied by `globalSetup`. */
export function runPlaywrightGlobalSetup({
  databaseUrl,
  directUrl,
  isCi,
  seedBaseReference,
  seedFixture,
  writeFixture,
}: PlaywrightGlobalSetupDependencies): void {
  // This assertion deliberately precedes every Bun DB bridge. A raw `playwright test` must
  // fail closed before any seed can perform its first database write.
  assertLiteralLocalE2eUrls(databaseUrl, directUrl, { isCi })

  // Static reference data (BJJ discipline + belt ladder) the migrate-only e2e DB never had.
  // Must precede any spec: getBjjDisciplineId() / threeAscendingBjjRanks() throw without it
  // (SESSION_0717). Idempotent — no-op when a ≥3-rank BJJ ladder already exists.
  seedBaseReference()

  const rawFixture = seedFixture()
  writeFixture(JSON.parse(rawFixture))
}

async function globalSetup() {
  runPlaywrightGlobalSetup({
    databaseUrl: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
    isCi: process.env.CI === "true",
    seedBaseReference: () =>
      execFileSync("bun", ["e2e/helpers/seed-base-reference-db.ts", "seed"], {
        cwd: process.cwd(),
        encoding: "utf-8",
      }),
    seedFixture: () =>
      execFileSync("bun", ["e2e/helpers/seed-tournament-cli.ts", "seed"], {
        cwd: process.cwd(),
        encoding: "utf-8",
      }),
    writeFixture: fixture => writeFileSync(FIXTURE_PATH, JSON.stringify(fixture, null, 2)),
  })
}

export default globalSetup
