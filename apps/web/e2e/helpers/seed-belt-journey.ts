import { execFileSync } from "node:child_process"
import type { BeltJourneyFixture } from "./seed-belt-journey-db"

/**
 * Node-side wrapper for the belt-journey Playwright fixture (Slice 5 — Petey Plan
 * 0477). Delegates every DB write to the Bun bridge (`seed-belt-journey-db.ts`),
 * mirroring `seed-lineage-lifecycle.ts`.
 */
export type { BeltJourneyFixture } from "./seed-belt-journey-db"

function runBeltJourneyCommand<T>(command: string, fixture?: BeltJourneyFixture): T {
  const args = ["e2e/helpers/seed-belt-journey-db.ts", command]
  if (fixture) {
    args.push(Buffer.from(JSON.stringify(fixture), "utf-8").toString("base64"))
  }
  const raw = execFileSync("bun", args, { cwd: process.cwd(), encoding: "utf-8" })
  return raw ? (JSON.parse(raw) as T) : (undefined as T)
}

export async function seedBeltJourneyFixture(): Promise<BeltJourneyFixture> {
  return runBeltJourneyCommand<BeltJourneyFixture>("seed")
}

export async function cleanupBeltJourneyFixture(fixture: BeltJourneyFixture): Promise<void> {
  runBeltJourneyCommand("cleanup", fixture)
}
