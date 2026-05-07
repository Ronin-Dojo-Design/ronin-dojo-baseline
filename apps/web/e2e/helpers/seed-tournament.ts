/**
 * E2E seed helper — creates a complete tournament fixture for Playwright tests.
 *
 * Creates: Organization, Discipline, TournamentRole, Tournament (PUBLISHED),
 * TournamentDiscipline, Division (free, feeCents=0), 4 registered users with entries,
 * Bracket with seeded matches + competitors.
 *
 * Uses the same standalone PrismaClient as auth.ts.
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../.generated/prisma/client"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const prisma = new PrismaClient({ adapter })

const TS = Date.now()

export interface TournamentFixture {
  tournamentId: string
  tournamentSlug: string
  divisionId: string
  bracketId: string
  organizationId: string
  disciplineId: string
  roleId: string
  userIds: string[]
  registrationIds: string[]
  entryIds: string[]
  matchIds: string[]
}

export async function seedTournamentFixture(): Promise<TournamentFixture> {
  const slug = `e2e-tournament-${TS}`

  // 1. Organization (host)
  const org = await prisma.organization.create({
    data: {
      name: `E2E Dojo ${TS}`,
      slug: `e2e-dojo-${TS}`,
      type: "DOJO",
      brand: "BASELINE_MARTIAL_ARTS",
    },
  })

  // 2. Discipline
  const discipline = await prisma.discipline.create({
    data: {
      name: `E2E Karate ${TS}`,
      slug: `e2e-karate-${TS}`,
      isSystem: true,
    },
  })

  // 3. TournamentRole (COMPETITOR)
  const role = await prisma.tournamentRole.create({
    data: {
      code: `COMPETITOR_${TS}`,
      name: "Competitor",
      isSystem: true,
      brand: "BASELINE_MARTIAL_ARTS",
    },
  })

  // 4. Tournament (PUBLISHED)
  const tournament = await prisma.tournament.create({
    data: {
      brand: "BASELINE_MARTIAL_ARTS",
      name: `E2E Championship ${TS}`,
      slug,
      description: "Seeded tournament for E2E testing",
      status: "PUBLISHED",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      hostId: org.id,
    },
  })

  // 5. TournamentDiscipline
  const td = await prisma.tournamentDiscipline.create({
    data: {
      tournamentId: tournament.id,
      disciplineId: discipline.id,
    },
  })

  // 6. Division (free entry)
  const division = await prisma.division.create({
    data: {
      name: "Open Weight",
      format: "SINGLE_ELIM",
      feeCents: 0,
      capacity: 16,
      tournamentDisciplineId: td.id,
      roleRequiredId: role.id,
    },
  })

  // 7. Create 4 users with passports + registrations + entries
  const userIds: string[] = []
  const registrationIds: string[] = []
  const entryIds: string[] = []

  for (let i = 1; i <= 4; i++) {
    const user = await prisma.user.create({
      data: {
        name: `E2E Fighter ${i} (${TS})`,
        email: `e2e-fighter-${TS}-${i}@test.local`,
        emailVerified: true,
        role: "user",
      },
    })
    userIds.push(user.id)

    await prisma.passport.create({ data: { userId: user.id, displayName: user.name! } })
    await prisma.directoryProfile.create({ data: { userId: user.id, slug: `e2e-fighter-${TS}-${i}` } })

    const registration = await prisma.registration.create({
      data: {
        tournamentId: tournament.id,
        userId: user.id,
        status: "SUBMITTED",
        paymentStatus: "PAID",
        totalFeeCents: 0,
        submittedAt: new Date(),
      },
    })
    registrationIds.push(registration.id)

    const entry = await prisma.registrationEntry.create({
      data: {
        registrationId: registration.id,
        divisionId: division.id,
        tournamentRoleId: role.id,
        snapshotRankName: "White Belt",
        snapshotOrgName: org.name,
      },
    })
    entryIds.push(entry.id)
  }

  // 8. Bracket with 3 matches (single-elimination for 4 competitors)
  const bracket = await prisma.bracket.create({
    data: {
      name: "Open Weight Bracket",
      divisionId: division.id,
    },
  })

  const matchIds: string[] = []

  // Semi-final 1
  const match1 = await prisma.match.create({
    data: {
      bracketId: bracket.id,
      roundNumber: 1,
      matchNumber: 1,
      status: "SCHEDULED",
    },
  })
  matchIds.push(match1.id)
  await prisma.matchCompetitor.createMany({
    data: [
      { matchId: match1.id, registrationEntryId: entryIds[0], slot: 1, seed: 1 },
      { matchId: match1.id, registrationEntryId: entryIds[1], slot: 2, seed: 4 },
    ],
  })

  // Semi-final 2
  const match2 = await prisma.match.create({
    data: {
      bracketId: bracket.id,
      roundNumber: 1,
      matchNumber: 2,
      status: "SCHEDULED",
    },
  })
  matchIds.push(match2.id)
  await prisma.matchCompetitor.createMany({
    data: [
      { matchId: match2.id, registrationEntryId: entryIds[2], slot: 1, seed: 2 },
      { matchId: match2.id, registrationEntryId: entryIds[3], slot: 2, seed: 3 },
    ],
  })

  // Final
  const match3 = await prisma.match.create({
    data: {
      bracketId: bracket.id,
      roundNumber: 2,
      matchNumber: 1,
      status: "SCHEDULED",
    },
  })
  matchIds.push(match3.id)

  return {
    tournamentId: tournament.id,
    tournamentSlug: slug,
    divisionId: division.id,
    bracketId: bracket.id,
    organizationId: org.id,
    disciplineId: discipline.id,
    roleId: role.id,
    userIds,
    registrationIds,
    entryIds,
    matchIds,
  }
}

export async function cleanupTournamentFixture(fixture: TournamentFixture) {
  // Delete in dependency order
  await prisma.matchCompetitor.deleteMany({ where: { matchId: { in: fixture.matchIds } } })
  await prisma.match.deleteMany({ where: { id: { in: fixture.matchIds } } })
  await prisma.bracket.deleteMany({ where: { id: fixture.bracketId } })
  await prisma.registrationEntry.deleteMany({ where: { id: { in: fixture.entryIds } } })
  await prisma.registration.deleteMany({ where: { id: { in: fixture.registrationIds } } })
  for (const userId of fixture.userIds) {
    await prisma.session.deleteMany({ where: { userId } })
    await prisma.directoryProfile.deleteMany({ where: { userId } })
    await prisma.passport.deleteMany({ where: { userId } })
  }
  await prisma.user.deleteMany({ where: { id: { in: fixture.userIds } } })
  await prisma.division.deleteMany({ where: { id: fixture.divisionId } })
  await prisma.tournamentDiscipline.deleteMany({ where: { tournamentId: fixture.tournamentId } })
  await prisma.tournament.deleteMany({ where: { id: fixture.tournamentId } })
  await prisma.tournamentRole.deleteMany({ where: { id: fixture.roleId } })
  await prisma.discipline.deleteMany({ where: { id: fixture.disciplineId } })
  await prisma.organization.deleteMany({ where: { id: fixture.organizationId } })
}
