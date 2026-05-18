/**
 * SESSION_0087 — Tournament results page smoke test.
 *
 * Proves `findTournamentResults` returns a well-shaped tournament with
 * disciplines, divisions, brackets, and completed matches for rendering
 * MedalStandings and BracketResults.
 *
 * Uses real Postgres dev DB. Creates a minimal tournament with one completed
 * match and verifies the query output shape.
 *
 * Run: cd apps/web && bun test server/web/tournaments/results.smoke.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
}))

import { Brand } from "~/.generated/prisma/client"
import { findTournamentResults } from "~/server/web/tournaments/queries"
import { db } from "~/services/db"

// -----------------------------------------------------------------------------
// Fixtures
// -----------------------------------------------------------------------------

const TS = Date.now()
const SLUG = `results-smoke-${TS}`
const BRAND = Brand.BASELINE_MARTIAL_ARTS

let tournamentId: string
let divisionId: string
let bracketId: string
let matchId: string
let reg1Id: string
let reg2Id: string
let entry1Id: string
let entry2Id: string
let user1Id: string
let user2Id: string
let orgId: string
let disciplineId: string
let roleId: string

beforeAll(async () => {
  const discipline = await db.discipline.findFirst()
  if (!discipline) throw new Error("No discipline — run seed")
  disciplineId = discipline.id

  const org = await db.organization.findFirst()
  if (!org) throw new Error("No org — run seed")
  orgId = org.id

  // Two users
  const u1 = await db.user.create({
    data: { name: `results-u1-${TS}`, email: `results-u1-${TS}@test.local`, emailVerified: true },
  })
  const u2 = await db.user.create({
    data: { name: `results-u2-${TS}`, email: `results-u2-${TS}@test.local`, emailVerified: true },
  })
  user1Id = u1.id
  user2Id = u2.id

  // Tournament
  const t = await db.tournament.create({
    data: {
      name: `Results Smoke ${TS}`,
      slug: SLUG,
      brand: BRAND,
      status: "PUBLISHED",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-02"),
      hostId: orgId,
      disciplines: { create: { disciplineId } },
    },
  })
  tournamentId = t.id

  // Get auto-created TournamentDiscipline
  const td = await db.tournamentDiscipline.findFirst({ where: { tournamentId } })
  if (!td) throw new Error("TournamentDiscipline not created")

  // Create tournament role (required by Division)
  const role = await db.tournamentRole.create({
    data: { name: `Smoke Role ${TS}`, code: `smoke-role-${TS}`, brand: "BASELINE_MARTIAL_ARTS" },
  })
  roleId = role.id

  // Division
  const div = await db.division.create({
    data: {
      name: `Smoke Div ${TS}`,
      tournamentDisciplineId: td.id,
      gender: "ANY",
      format: "SINGLE_ELIM",
      sortOrder: 1,
      roleRequiredId: roleId,
    },
  })
  divisionId = div.id

  // Registrations + entries
  const r1 = await db.registration.create({
    data: { tournamentId, userId: user1Id, status: "APPROVED" },
  })
  const r2 = await db.registration.create({
    data: { tournamentId, userId: user2Id, status: "APPROVED" },
  })
  reg1Id = r1.id
  reg2Id = r2.id

  const e1 = await db.registrationEntry.create({
    data: { registrationId: reg1Id, divisionId, tournamentRoleId: roleId },
  })
  const e2 = await db.registrationEntry.create({
    data: { registrationId: reg2Id, divisionId, tournamentRoleId: roleId },
  })
  entry1Id = e1.id
  entry2Id = e2.id

  // Bracket + match
  const bracket = await db.bracket.create({
    data: { name: `Bracket ${TS}`, divisionId },
  })
  bracketId = bracket.id

  const m = await db.match.create({
    data: {
      bracketId,
      roundNumber: 1,
      matchNumber: 1,
      status: "COMPLETED",
      result: "WIN_DECISION",
      winnerEntryId: entry1Id,
      competitors: {
        create: [
          { slot: 1, seed: 1, registrationEntryId: entry1Id },
          { slot: 2, seed: 2, registrationEntryId: entry2Id },
        ],
      },
    },
  })
  matchId = m.id
})

afterAll(async () => {
  await db.matchCompetitor.deleteMany({ where: { matchId } })
  await db.match.deleteMany({ where: { id: matchId } })
  await db.bracket.deleteMany({ where: { id: bracketId } })
  await db.registrationEntry.deleteMany({ where: { id: { in: [entry1Id, entry2Id] } } })
  await db.registration.deleteMany({ where: { id: { in: [reg1Id, reg2Id] } } })
  await db.division.deleteMany({ where: { id: divisionId } })
  await db.tournamentRole.deleteMany({ where: { id: roleId } })
  await db.tournamentDiscipline.deleteMany({ where: { tournamentId } })
  await db.tournament.deleteMany({ where: { id: tournamentId } })
  await db.user.deleteMany({ where: { id: { in: [user1Id, user2Id] } } })
})

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("Tournament results page smoke", () => {
  it("findTournamentResults returns tournament with nested bracket data", async () => {
    const result = await findTournamentResults(SLUG, BRAND)

    expect(result).not.toBeNull()
    expect(result!.name).toContain("Results Smoke")
    expect(result!.disciplines).toHaveLength(1)
  })

  it("disciplines contain divisions with brackets and completed matches", async () => {
    const result = await findTournamentResults(SLUG, BRAND)
    const divisions = result!.disciplines[0].divisions

    expect(divisions.length).toBeGreaterThanOrEqual(1)

    const div = divisions.find(d => d.id === divisionId)
    expect(div).toBeDefined()
    expect(div!.brackets).toHaveLength(1)
    expect(div!.brackets[0].matches).toHaveLength(1)
  })

  it("completed match has competitors with user info", async () => {
    const result = await findTournamentResults(SLUG, BRAND)
    const match = result!.disciplines[0].divisions.find(d => d.id === divisionId)!.brackets[0]
      .matches[0]

    expect(match.status).toBe("COMPLETED")
    expect(match.result).toBe("WIN_DECISION")
    expect(match.winnerEntryId).toBe(entry1Id)
    expect(match.competitors).toHaveLength(2)
    expect(match.competitors[0].registrationEntry.registration.user.name).toContain("results-u1")
  })

  it("returns null for wrong brand", async () => {
    const result = await findTournamentResults(SLUG, Brand.BBL)
    expect(result).toBeNull()
  })
})
