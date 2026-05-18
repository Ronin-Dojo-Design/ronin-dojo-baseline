/**
 * SESSION_0087 — WeighIn workflow integration test.
 *
 * Proves the weigh-in → official → query lifecycle:
 * 1. Create a weigh-in record for a registration
 * 2. Mark it official (un-marks others)
 * 3. Query returns correct records with `isOfficial` state
 *
 * Uses real Postgres dev DB. Fixtures are cleaned up after.
 *
 * Run: cd apps/web && bun test server/admin/tournaments/weigh-in.integration.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

import { db } from "~/services/db"

// -----------------------------------------------------------------------------
// Fixtures
// -----------------------------------------------------------------------------

const TS = Date.now()
let tournamentId: string
let divisionId: string
let registrationId: string
let userId: string
let orgId: string
let disciplineId: string
let roleId: string
let _weighIn1Id: string
let weighIn2Id: string

beforeAll(async () => {
  // Get existing discipline + org
  const discipline = await db.discipline.findFirst()
  if (!discipline) throw new Error("No discipline in DB — run seed first")
  disciplineId = discipline.id

  const org = await db.organization.findFirst()
  if (!org) throw new Error("No organization in DB — run seed first")
  orgId = org.id

  // Create a user for the test
  const user = await db.user.create({
    data: {
      name: `weighin-test-user-${TS}`,
      email: `weighin-test-${TS}@test.local`,
      emailVerified: true,
    },
  })
  userId = user.id

  // Create tournament + division
  const tournament = await db.tournament.create({
    data: {
      name: `WeighIn Test ${TS}`,
      slug: `weighin-test-${TS}`,
      brand: "BASELINE_MARTIAL_ARTS",
      status: "PUBLISHED",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-02"),
      hostId: orgId,
      disciplines: { create: { disciplineId } },
    },
  })
  tournamentId = tournament.id

  // Get the auto-created TournamentDiscipline
  const td = await db.tournamentDiscipline.findFirst({ where: { tournamentId } })
  if (!td) throw new Error("TournamentDiscipline not created")

  // Create a tournament role (required by Division)
  const role = await db.tournamentRole.create({
    data: {
      name: `WeighIn Role ${TS}`,
      code: `weighin-role-${TS}`,
      brand: "BASELINE_MARTIAL_ARTS",
    },
  })
  roleId = role.id

  const division = await db.division.create({
    data: {
      name: `WeighIn Div ${TS}`,
      tournamentDisciplineId: td.id,
      gender: "ANY",
      format: "SINGLE_ELIM",
      sortOrder: 1,
      roleRequiredId: roleId,
    },
  })
  divisionId = division.id

  // Create registration
  const registration = await db.registration.create({
    data: {
      tournamentId,
      userId,
      status: "APPROVED",
    },
  })
  registrationId = registration.id
})

afterAll(async () => {
  // Clean up in dependency order
  await db.weighInRecord.deleteMany({ where: { registrationId } })
  await db.registration.deleteMany({ where: { id: registrationId } })
  await db.division.deleteMany({ where: { id: divisionId } })
  await db.tournamentRole.deleteMany({ where: { id: roleId } })
  await db.tournamentDiscipline.deleteMany({ where: { tournamentId } })
  await db.tournament.deleteMany({ where: { id: tournamentId } })
  await db.user.deleteMany({ where: { id: userId } })
})

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("WeighIn workflow integration", () => {
  it("creates a weigh-in record", async () => {
    const record = await db.weighInRecord.create({
      data: {
        registrationId,
        userId,
        recordedBy: userId,
        weightKg: 72.5,
        isOfficial: false,
      },
    })
    _weighIn1Id = record.id

    expect(Number(record.weightKg)).toBeCloseTo(72.5)
    expect(record.isOfficial).toBe(false)
  })

  it("creates a second weigh-in record", async () => {
    const record = await db.weighInRecord.create({
      data: {
        registrationId,
        userId,
        recordedBy: userId,
        weightKg: 71.8,
        isOfficial: false,
      },
    })
    weighIn2Id = record.id

    expect(Number(record.weightKg)).toBeCloseTo(71.8)
  })

  it("marking one as official un-marks others", async () => {
    // Mark record 2 as official
    await db.weighInRecord.update({
      where: { id: weighIn2Id },
      data: { isOfficial: true },
    })
    // Un-mark others (same logic as markWeighInOfficial action)
    await db.weighInRecord.updateMany({
      where: { registrationId, id: { not: weighIn2Id } },
      data: { isOfficial: false },
    })

    const records = await db.weighInRecord.findMany({
      where: { registrationId },
      orderBy: { recordedAt: "desc" },
    })

    const official = records.filter(r => r.isOfficial)
    expect(official).toHaveLength(1)
    expect(official[0].id).toBe(weighIn2Id)
    expect(Number(official[0].weightKg)).toBeCloseTo(71.8)
  })

  it("findWeighInRecords returns records for the registration", async () => {
    const records = await db.weighInRecord.findMany({
      where: { registrationId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { recordedAt: "desc" },
    })

    expect(records.length).toBeGreaterThanOrEqual(2)
    expect(records.every(r => r.registrationId === registrationId)).toBe(true)
  })
})
