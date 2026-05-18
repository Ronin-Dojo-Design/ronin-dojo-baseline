/**
 * SESSION_0087 — Cross-brand isolation proof for tournament queries.
 *
 * Proves that `searchTournaments`, `findTournamentBySlug`, and
 * `findTournamentResults` never return data from a different brand.
 *
 * Uses real Postgres dev DB rows. Two tournaments are created — one per brand —
 * with the same slug pattern. Each query is called with Brand A and must never
 * return the Brand B tournament.
 *
 * Run: cd apps/web && bun test server/web/tournaments/queries.brand-isolation.test.ts
 */

// Must mock next/cache before importing queries
// @ts-expect-error — bun:test is a Bun runtime module
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidateTag: () => {},
}))

import { Brand } from "~/.generated/prisma/client"
import {
  findTournamentBySlug,
  findTournamentResults,
  searchTournaments,
} from "~/server/web/tournaments/queries"
import { db } from "~/services/db"

// -----------------------------------------------------------------------------
// Fixtures
// -----------------------------------------------------------------------------

const TS = Date.now()
const SLUG_A = `brand-iso-test-${TS}-a`
const SLUG_B = `brand-iso-test-${TS}-b`
const BRAND_A = Brand.BASELINE_MARTIAL_ARTS
const BRAND_B = Brand.BBL

let tournamentAId: string
let tournamentBId: string
let orgId: string
let disciplineId: string

beforeAll(async () => {
  // Get or create a discipline for the tournament
  const discipline = await db.discipline.findFirst()
  if (!discipline) throw new Error("No discipline in DB — run seed first")
  disciplineId = discipline.id

  // Get or create an org to host
  const org = await db.organization.findFirst()
  if (!org) throw new Error("No organization in DB — run seed first")
  orgId = org.id

  // Create tournament for brand A
  const tA = await db.tournament.create({
    data: {
      name: `Brand Isolation Test A ${TS}`,
      slug: SLUG_A,
      brand: BRAND_A,
      status: "PUBLISHED",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-02"),
      hostId: orgId,
      disciplines: {
        create: { disciplineId },
      },
    },
  })
  tournamentAId = tA.id

  // Create tournament for brand B with similar slug
  const tB = await db.tournament.create({
    data: {
      name: `Brand Isolation Test B ${TS}`,
      slug: SLUG_B,
      brand: BRAND_B,
      status: "PUBLISHED",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-02"),
      hostId: orgId,
      disciplines: {
        create: { disciplineId },
      },
    },
  })
  tournamentBId = tB.id
})

afterAll(async () => {
  // Clean up test fixtures
  await db.tournamentDiscipline.deleteMany({
    where: { tournamentId: { in: [tournamentAId, tournamentBId].filter(Boolean) } },
  })
  await db.tournament.deleteMany({
    where: { id: { in: [tournamentAId, tournamentBId].filter(Boolean) } },
  })
})

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("Tournament query brand isolation", () => {
  it("searchTournaments for brand A does not return brand B tournament", async () => {
    const result = await searchTournaments(
      { q: "", discipline: "", sort: "startDate", page: 1, perPage: 100 },
      BRAND_A,
    )

    const ids = result.tournaments.map((t: { id: string }) => t.id)
    expect(ids).toContain(tournamentAId)
    expect(ids).not.toContain(tournamentBId)
  })

  it("searchTournaments for brand B does not return brand A tournament", async () => {
    const result = await searchTournaments(
      { q: "", discipline: "", sort: "startDate", page: 1, perPage: 100 },
      BRAND_B,
    )

    const ids = result.tournaments.map((t: { id: string }) => t.id)
    expect(ids).toContain(tournamentBId)
    expect(ids).not.toContain(tournamentAId)
  })

  it("findTournamentBySlug returns null for wrong brand", async () => {
    // Slug A exists for brand A — querying with brand B should return null
    const result = await findTournamentBySlug(SLUG_A, BRAND_B)
    expect(result).toBeNull()
  })

  it("findTournamentBySlug returns tournament for correct brand", async () => {
    const result = await findTournamentBySlug(SLUG_A, BRAND_A)
    expect(result).not.toBeNull()
    expect(result!.id).toBe(tournamentAId)
  })

  it("findTournamentResults returns null for wrong brand", async () => {
    const result = await findTournamentResults(SLUG_B, BRAND_A)
    expect(result).toBeNull()
  })

  it("findTournamentResults returns tournament for correct brand", async () => {
    const result = await findTournamentResults(SLUG_A, BRAND_A)
    expect(result).not.toBeNull()
  })
})
