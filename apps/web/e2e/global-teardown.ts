/**
 * Playwright global teardown — cleans up the seeded tournament fixture.
 */

import { readFileSync, unlinkSync } from "node:fs"
import { join } from "node:path"
import { cleanupTournamentFixture, type TournamentFixture } from "./helpers/seed-tournament"

const FIXTURE_PATH = join(process.cwd(), "e2e", ".fixture.json")

async function globalTeardown() {
  try {
    const raw = readFileSync(FIXTURE_PATH, "utf-8")
    const fixture: TournamentFixture = JSON.parse(raw)
    await cleanupTournamentFixture(fixture)
    unlinkSync(FIXTURE_PATH)
  } catch {
    // If fixture file doesn't exist, nothing to clean up
  }
}

export default globalTeardown
