/**
 * Playwright global setup — seeds a tournament fixture before all tests run.
 * The fixture data is written to a temp file so tests can read it.
 */

import { execFileSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import { join } from "node:path"

const FIXTURE_PATH = join(process.cwd(), "e2e", ".fixture.json")

async function globalSetup() {
  const rawFixture = execFileSync("bun", ["e2e/helpers/seed-tournament-cli.ts", "seed"], {
    cwd: process.cwd(),
    encoding: "utf-8",
  })
  const fixture = JSON.parse(rawFixture)
  writeFileSync(FIXTURE_PATH, JSON.stringify(fixture, null, 2))
}

export default globalSetup
