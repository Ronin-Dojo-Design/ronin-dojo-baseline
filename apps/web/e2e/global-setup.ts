/**
 * Playwright global setup — seeds a tournament fixture before all tests run.
 * The fixture data is written to a temp file so tests can read it.
 */
import { seedTournamentFixture, type TournamentFixture } from "./helpers/seed-tournament"
import { writeFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"

const FIXTURE_PATH = join(process.cwd(), "e2e", ".fixture.json")

async function globalSetup() {
  const fixture = await seedTournamentFixture()
  writeFileSync(FIXTURE_PATH, JSON.stringify(fixture, null, 2))
}

export default globalSetup
