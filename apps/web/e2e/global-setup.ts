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
  seedFixture: () => string
  writeFixture: (fixture: unknown) => void
}

/** Exported for a pure ordering proof; production dependencies are supplied by `globalSetup`. */
export function runPlaywrightGlobalSetup({
  databaseUrl,
  directUrl,
  isCi,
  seedFixture,
  writeFixture,
}: PlaywrightGlobalSetupDependencies): void {
  // This assertion deliberately precedes the Bun fixture bridge. A raw `playwright test` must
  // fail closed before `seed-tournament-cli.ts` can perform its first database write.
  assertLiteralLocalE2eUrls(databaseUrl, directUrl, { isCi })

  const rawFixture = seedFixture()
  writeFixture(JSON.parse(rawFixture))
}

async function globalSetup() {
  runPlaywrightGlobalSetup({
    databaseUrl: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
    isCi: process.env.CI === "true",
    seedFixture: () =>
      execFileSync("bun", ["e2e/helpers/seed-tournament-cli.ts", "seed"], {
        cwd: process.cwd(),
        encoding: "utf-8",
      }),
    writeFixture: fixture => writeFileSync(FIXTURE_PATH, JSON.stringify(fixture, null, 2)),
  })
}

export default globalSetup
