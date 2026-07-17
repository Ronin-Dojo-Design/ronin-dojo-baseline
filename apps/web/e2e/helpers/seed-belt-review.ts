import { execFileSync } from "node:child_process"
import type { BeltReviewFixture, BeltReviewFixtureState } from "./seed-belt-review-db"

export type { BeltReviewFixture, BeltReviewFixtureState } from "./seed-belt-review-db"

function runBeltReviewCommand<T>(command: string, fixture?: BeltReviewFixture): T {
  const args = ["e2e/helpers/seed-belt-review-db.ts", command]
  if (fixture) {
    args.push(Buffer.from(JSON.stringify(fixture), "utf-8").toString("base64"))
  }
  const raw = execFileSync("bun", args, {
    cwd: process.cwd(),
    encoding: "utf-8",
  })
  return raw ? (JSON.parse(raw) as T) : (undefined as T)
}

export function seedBeltReviewFixture(): BeltReviewFixture {
  return runBeltReviewCommand<BeltReviewFixture>("seed")
}

export function readBeltReviewFixtureState(fixture: BeltReviewFixture): BeltReviewFixtureState {
  return runBeltReviewCommand<BeltReviewFixtureState>("read-state", fixture)
}

export function cleanupBeltReviewFixture(fixture: BeltReviewFixture): void {
  runBeltReviewCommand<void>("cleanup", fixture)
}
