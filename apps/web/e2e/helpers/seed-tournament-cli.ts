import { assertLiteralLocalE2eUrls } from "../../scripts/e2e-db-env"
import type { TournamentFixture } from "./seed-tournament"

// The Playwright global setup validates before spawning this process, and the Bun bridge validates
// again so direct invocation cannot bypass the database boundary. Keep DB-module loading below it.
assertLiteralLocalE2eUrls(process.env.DATABASE_URL, process.env.DIRECT_URL, {
  isCi: process.env.CI === "true",
})

const { cleanupTournamentFixture, seedTournamentFixture } = await import("./seed-tournament")

const command = process.argv[2]

if (command === "seed") {
  const fixture = await seedTournamentFixture()
  process.stdout.write(JSON.stringify(fixture))
} else if (command === "cleanup") {
  const encodedFixture = process.argv[3]
  if (!encodedFixture) {
    throw new Error("Missing encoded tournament fixture")
  }
  const fixture = JSON.parse(
    Buffer.from(encodedFixture, "base64").toString("utf-8"),
  ) as TournamentFixture
  await cleanupTournamentFixture(fixture)
} else {
  throw new Error(`Unknown seed-tournament command: ${command ?? "<missing>"}`)
}
