/**
 * Playwright global teardown — cleans up the seeded tournament fixture.
 */

import { execFileSync } from "node:child_process"
import { readFileSync, unlinkSync } from "node:fs"
import { join } from "node:path"

const FIXTURE_PATH = join(process.cwd(), "e2e", ".fixture.json")

async function globalTeardown() {
  try {
    const raw = readFileSync(FIXTURE_PATH, "utf-8")
    const encodedFixture = Buffer.from(raw, "utf-8").toString("base64")
    execFileSync("bun", ["e2e/helpers/seed-tournament-cli.ts", "cleanup", encodedFixture], {
      cwd: process.cwd(),
      encoding: "utf-8",
    })
    unlinkSync(FIXTURE_PATH)
  } catch {
    // If fixture file doesn't exist, nothing to clean up
  }
}

export default globalTeardown
