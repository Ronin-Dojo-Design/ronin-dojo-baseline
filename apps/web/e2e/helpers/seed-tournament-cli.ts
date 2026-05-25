import {
  cleanupTournamentFixture,
  seedTournamentFixture,
  type TournamentFixture,
} from "./seed-tournament"

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
