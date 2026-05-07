/**
 * Reads the seeded tournament fixture created by global-setup.
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"
import type { TournamentFixture } from "./seed-tournament"

const FIXTURE_PATH = join(process.cwd(), "e2e", ".fixture.json")

export function getFixture(): TournamentFixture {
  const raw = readFileSync(FIXTURE_PATH, "utf-8")
  return JSON.parse(raw)
}
