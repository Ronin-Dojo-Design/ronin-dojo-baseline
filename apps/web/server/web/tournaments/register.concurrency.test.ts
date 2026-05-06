/**
 * SESSION_0083 — Concurrency proof for `createRegistrationCheckout`.
 *
 * Capacity oversubscription is prevented by a Serializable transaction in
 * `register.ts:78-144`. This test fires two parallel `createRegistrationCheckout`
 * calls against the real Postgres dev DB, with a Division whose `capacity = 1`
 * and `feeCents = 0` (free path is fully transactional, end-to-end).
 *
 * Fixtures use real rows for everything the action touches: user + passport,
 * organization + membership (so `isInSameBrand` passes), Entitlement +
 * UserEntitlement (so `checkEntitlement` passes), tournament + discipline +
 * role + division.
 *
 * Two-phase teardown matches `materialize.concurrency.test.ts`: targeted
 * deletes for this run + sweep of any zombie `registration-test-*` rows so
 * reruns are idempotent.
 *
 * Run: cd apps/web && bun test server/web/tournaments/register.concurrency.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test"
import { AsyncLocalStorage } from "node:async_hooks"

// -----------------------------------------------------------------------------
// Mutable state captured by the mocks below.
// -----------------------------------------------------------------------------

const sessionUserState = { id: "" }
const rateLimitState = { limited: false }
const requestBrand = "BASELINE_MARTIAL_ARTS"

// Per-call user identity, propagated through async context so two parallel
// `createRegistrationCheckout` invocations can authenticate as different users.
// Falls back to `sessionUserState.id` when no ALS context is set.
const userIdALS = new AsyncLocalStorage<string>()
const callAs = <T>(userId: string, fn: () => Promise<T>): Promise<T> =>
  userIdALS.run(userId, fn)

// -----------------------------------------------------------------------------
// Module mocks — must be installed before importing `register.ts`.
// -----------------------------------------------------------------------------

mock.module("next/headers", () => ({
  headers: async () => ({
    get: (key: string) => {
      const k = key.toLowerCase()
      if (k === "x-brand") return requestBrand
      if (k === "host") return "baseline.local"
      return null
    },
  }),
}))

mock.module("next/cache", () => ({
  revalidatePath: () => {},
  updateTag: () => {},
  revalidateTag: () => {},
}))

mock.module("~/lib/auth", () => ({
  getServerSession: async () => ({
    user: {
      id: userIdALS.getStore() ?? sessionUserState.id,
      role: null,
      lastActiveBrandId: null,
    },
    session: { id: "test-session" },
  }),
  auth: {},
}))

mock.module("~/lib/rate-limiter", () => ({
  isRateLimited: async () => rateLimitState.limited,
}))

// Stripe is imported by register.ts but never invoked on the free path.
// Mock it so test-time module load doesn't fail when STRIPE_SECRET_KEY is unset.
mock.module("~/services/stripe", () => ({
  stripe: {
    checkout: { sessions: { create: async () => ({ url: "https://stripe.test/never-called" }) } },
    refunds: { create: async () => ({}) },
  },
}))

// -----------------------------------------------------------------------------
// Real imports happen *after* the mocks are registered.
// -----------------------------------------------------------------------------

import { db } from "~/services/db"
import { createRegistrationCheckout } from "~/server/web/tournaments/register"

// -----------------------------------------------------------------------------
// Fixture set
// -----------------------------------------------------------------------------

const TS = Date.now()
const tag = (name: string) => `registration-test-${TS}-${name}`
const TAG_PREFIX = "registration-test-"

const utc = (iso: string) => new Date(`${iso}T00:00:00.000Z`)

type RacerFixture = {
  userId: string
  passportId: string
  membershipId: string
  userEntitlementId: string
}

type Fixtures = {
  userId: string
  passportId: string
  organizationId: string
  disciplineId: string
  membershipId: string
  userEntitlementId: string
  tournamentId: string
  tournamentDisciplineId: string
  roleId: string
  divisionId: string
  createdRole: boolean
  racerB: RacerFixture
  racerC: RacerFixture
}

let fx: Fixtures

beforeAll(async () => {
  // 1. User + Passport
  const user = await db.user.create({
    data: { name: tag("user"), email: `${tag("user")}@test.local` },
  })

  const passport = await db.passport.create({
    data: {
      userId: user.id,
      displayName: tag("passport"),
    },
  })

  // 2. Discipline (brand-scoped, tagged so we can sweep)
  const discipline = await db.discipline.create({
    data: { brand: requestBrand, name: tag("disc"), slug: tag("disc") },
  })

  // 3. Organization in same brand (host of tournament + user's membership)
  const organization = await db.organization.create({
    data: {
      brand: requestBrand,
      name: tag("org"),
      slug: tag("org"),
      type: "DOJO",
      ownerId: user.id,
    },
  })

  await db.organizationDiscipline.create({
    data: { organizationId: organization.id, disciplineId: discipline.id },
  })

  // 4. Membership — required so `isInSameBrand(user, brand)` returns true
  const membership = await db.membership.create({
    data: {
      brand: requestBrand,
      userId: user.id,
      organizationId: organization.id,
      disciplineId: discipline.id,
      status: "ACTIVE",
      joinedAt: new Date(),
    },
  })

  // 5. Entitlement + UserEntitlement — required so `checkEntitlement` returns true.
  // The action looks up by literal `key === "tournament-registration"`. Upsert
  // (don't tag) so this is idempotent across runs; teardown only removes the
  // per-run UserEntitlement, never the shared Entitlement row.
  const entitlement = await db.entitlement.upsert({
    where: { brand_key: { brand: requestBrand, key: "tournament-registration" } },
    create: {
      brand: requestBrand,
      key: "tournament-registration",
      name: "Tournament Registration",
    },
    update: {},
  })

  const userEntitlement = await db.userEntitlement.create({
    data: {
      userId: user.id,
      entitlementId: entitlement.id,
      status: "ACTIVE",
      sourceType: "MANUAL_GRANT",
    },
  })

  // 6. Tournament (PUBLISHED, BASELINE_MARTIAL_ARTS, hosted by org)
  const tournament = await db.tournament.create({
    data: {
      brand: requestBrand,
      name: tag("tournament"),
      slug: tag("tournament"),
      status: "PUBLISHED",
      startDate: utc("2026-06-01"),
      endDate: utc("2026-06-02"),
      hostId: organization.id,
    },
  })

  // 7. TournamentDiscipline
  const tournamentDiscipline = await db.tournamentDiscipline.create({
    data: { tournamentId: tournament.id, disciplineId: discipline.id },
  })

  // 8. TournamentRole — prefer existing system COMPETITOR; fall back to tagged
  const existingRole = await db.tournamentRole.findFirst({
    where: { code: "COMPETITOR", OR: [{ brand: requestBrand }, { brand: null, isSystem: true }] },
  })
  const role =
    existingRole ??
    (await db.tournamentRole.create({
      data: {
        brand: requestBrand,
        code: "COMPETITOR",
        name: tag("COMPETITOR"),
      },
    }))
  const createdRole = !existingRole

  // 9. Division — capacity=1, feeCents=0 (free path, fully transactional)
  const division = await db.division.create({
    data: {
      name: tag("division"),
      format: "SPARRING",
      gender: "ANY",
      capacity: 1,
      feeCents: 0,
      tournamentDisciplineId: tournamentDiscipline.id,
      roleRequiredId: role.id,
    },
  })

  // 10. Racer fixtures (users B and C) — used to exercise capacity races
  //     between *different* users. Each gets its own passport, membership in
  //     the same organization (for `isInSameBrand`), and active UserEntitlement.
  const buildRacer = async (label: string): Promise<RacerFixture> => {
    const racerUser = await db.user.create({
      data: { name: tag(`user-${label}`), email: `${tag(`user-${label}`)}@test.local` },
    })
    const racerPassport = await db.passport.create({
      data: { userId: racerUser.id, displayName: tag(`passport-${label}`) },
    })
    const racerMembership = await db.membership.create({
      data: {
        brand: requestBrand,
        userId: racerUser.id,
        organizationId: organization.id,
        disciplineId: discipline.id,
        status: "ACTIVE",
        joinedAt: new Date(),
      },
    })
    const racerUE = await db.userEntitlement.create({
      data: {
        userId: racerUser.id,
        entitlementId: entitlement.id,
        status: "ACTIVE",
        sourceType: "MANUAL_GRANT",
      },
    })
    return {
      userId: racerUser.id,
      passportId: racerPassport.id,
      membershipId: racerMembership.id,
      userEntitlementId: racerUE.id,
    }
  }

  const racerB = await buildRacer("B")
  const racerC = await buildRacer("C")

  fx = {
    userId: user.id,
    passportId: passport.id,
    organizationId: organization.id,
    disciplineId: discipline.id,
    membershipId: membership.id,
    userEntitlementId: userEntitlement.id,
    tournamentId: tournament.id,
    tournamentDisciplineId: tournamentDiscipline.id,
    roleId: role.id,
    divisionId: division.id,
    createdRole,
    racerB,
    racerC,
  }

  sessionUserState.id = user.id
})

// Each test starts from a clean registration state for the fixture user /
// tournament. Capacity-shaping per test is done inside the test itself.
beforeEach(async () => {
  if (!fx) return
  await db.registrationEntry.deleteMany({ where: { divisionId: fx.divisionId } })
  await db.registration.deleteMany({ where: { tournamentId: fx.tournamentId } })
})

afterAll(async () => {
  if (fx) {
    // Targeted deletes in reverse-dependency order.
    await db.registrationEntry.deleteMany({ where: { divisionId: fx.divisionId } })
    await db.registration.deleteMany({ where: { tournamentId: fx.tournamentId } })
    await db.division.deleteMany({ where: { id: fx.divisionId } })
    await db.tournamentDiscipline.deleteMany({ where: { id: fx.tournamentDisciplineId } })
    await db.tournament.deleteMany({ where: { id: fx.tournamentId } })
    const racerUserIds = [fx.racerB.userId, fx.racerC.userId]
    const racerUEIds = [fx.racerB.userEntitlementId, fx.racerC.userEntitlementId]
    const racerMembershipIds = [fx.racerB.membershipId, fx.racerC.membershipId]
    const racerPassportIds = [fx.racerB.passportId, fx.racerC.passportId]

    await db.userEntitlement.deleteMany({
      where: { id: { in: [fx.userEntitlementId, ...racerUEIds] } },
    })
    await db.membership.deleteMany({
      where: { id: { in: [fx.membershipId, ...racerMembershipIds] } },
    })
    await db.passport.deleteMany({ where: { id: { in: racerPassportIds } } })
    await db.user.deleteMany({ where: { id: { in: racerUserIds } } })
    await db.organizationDiscipline.deleteMany({
      where: { organizationId: fx.organizationId },
    })
    await db.organization.deleteMany({ where: { id: fx.organizationId } })
    await db.discipline.deleteMany({ where: { id: fx.disciplineId } })
    await db.passport.deleteMany({ where: { id: fx.passportId } })
    await db.user.deleteMany({ where: { id: fx.userId } })
    if (fx.createdRole) {
      await db.tournamentRole.deleteMany({ where: { id: fx.roleId } })
    }
  }

  // Sweep zombie rows from any prior failed runs.
  const zombieTournaments = await db.tournament.findMany({
    where: { name: { startsWith: TAG_PREFIX } },
    select: { id: true },
  })
  const zombieTournamentIds = zombieTournaments.map(t => t.id)

  if (zombieTournamentIds.length > 0) {
    const zombieDivisions = await db.division.findMany({
      where: { tournamentDiscipline: { tournamentId: { in: zombieTournamentIds } } },
      select: { id: true },
    })
    const zombieDivisionIds = zombieDivisions.map(d => d.id)

    if (zombieDivisionIds.length > 0) {
      await db.registrationEntry.deleteMany({
        where: { divisionId: { in: zombieDivisionIds } },
      })
    }
    await db.registration.deleteMany({
      where: { tournamentId: { in: zombieTournamentIds } },
    })
    if (zombieDivisionIds.length > 0) {
      await db.division.deleteMany({ where: { id: { in: zombieDivisionIds } } })
    }
    await db.tournamentDiscipline.deleteMany({
      where: { tournamentId: { in: zombieTournamentIds } },
    })
    await db.tournament.deleteMany({ where: { id: { in: zombieTournamentIds } } })
  }

  const zombieOrgs = await db.organization.findMany({
    where: { name: { startsWith: TAG_PREFIX } },
    select: { id: true },
  })
  const zombieOrgIds = zombieOrgs.map(o => o.id)

  if (zombieOrgIds.length > 0) {
    await db.membership.deleteMany({ where: { organizationId: { in: zombieOrgIds } } })
    await db.organizationDiscipline.deleteMany({
      where: { organizationId: { in: zombieOrgIds } },
    })
    await db.organization.deleteMany({ where: { id: { in: zombieOrgIds } } })
  }

  const zombieUsers = await db.user.findMany({
    where: { name: { startsWith: TAG_PREFIX } },
    select: { id: true },
  })
  const zombieUserIds = zombieUsers.map(u => u.id)
  if (zombieUserIds.length > 0) {
    await db.userEntitlement.deleteMany({ where: { userId: { in: zombieUserIds } } })
    await db.passport.deleteMany({ where: { userId: { in: zombieUserIds } } })
    await db.user.deleteMany({ where: { id: { in: zombieUserIds } } })
  }

  await db.discipline.deleteMany({ where: { name: { startsWith: TAG_PREFIX } } })
  await db.tournamentRole.deleteMany({ where: { name: { startsWith: TAG_PREFIX } } })

  await db.$disconnect()
})

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("createRegistrationCheckout — fixture lifecycle", () => {
  it("creates fixtures, runs a single free registration end-to-end, and cleans up", async () => {
    rateLimitState.limited = false

    const result = await createRegistrationCheckout({
      tournamentId: fx.tournamentId,
      divisionIds: [fx.divisionId],
      roleCode: "COMPETITOR",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.type).toBe("free")
    expect(result?.data?.registrationId).toBeTruthy()

    const entries = await db.registrationEntry.count({
      where: { divisionId: fx.divisionId, status: "ACTIVE" },
    })
    expect(entries).toBe(1)
  })
})

describe("createRegistrationCheckout — capacity race", () => {
  it("two parallel registrations for one open slot — exactly one succeeds, one fails 'at capacity'", async () => {
    rateLimitState.limited = false

    const input = {
      tournamentId: fx.tournamentId,
      divisionIds: [fx.divisionId],
      roleCode: "COMPETITOR",
    }

    const [resultB, resultC] = await Promise.all([
      callAs(fx.racerB.userId, () => createRegistrationCheckout(input)),
      callAs(fx.racerC.userId, () => createRegistrationCheckout(input)),
    ])

    const successes = [resultB, resultC].filter(r => r?.data?.type === "free")
    const failures = [resultB, resultC].filter(r => typeof r?.serverError === "string")

    expect(successes.length).toBe(1)
    expect(failures.length).toBe(1)
    // Capacity message is the only acceptable surface error here. A leaked
    // Prisma message would mean the catch in `register.ts` is missing a case.
    expect(failures[0]?.serverError).toMatch(/at capacity/)
    expect(failures[0]?.serverError).not.toMatch(/PrismaClient|Unique constraint/)

    const activeEntries = await db.registrationEntry.count({
      where: { divisionId: fx.divisionId, status: "ACTIVE" },
    })
    expect(activeEntries).toBe(1)
  })

  it("two parallel registrations against a full division — both fail 'at capacity', count unchanged", async () => {
    rateLimitState.limited = false

    // Pre-fill the single slot with a registration owned by user A. This is a
    // direct Prisma write (no race), giving us a deterministic at-capacity
    // starting state.
    await db.registration.create({
      data: {
        tournamentId: fx.tournamentId,
        userId: fx.userId,
        status: "SUBMITTED",
        paymentStatus: "PAID",
        totalFeeCents: 0,
        submittedAt: new Date(),
        entries: {
          create: [
            {
              divisionId: fx.divisionId,
              tournamentRoleId: fx.roleId,
            },
          ],
        },
      },
    })

    const input = {
      tournamentId: fx.tournamentId,
      divisionIds: [fx.divisionId],
      roleCode: "COMPETITOR",
    }

    const [resultB, resultC] = await Promise.all([
      callAs(fx.racerB.userId, () => createRegistrationCheckout(input)),
      callAs(fx.racerC.userId, () => createRegistrationCheckout(input)),
    ])

    expect(resultB?.serverError).toMatch(/at capacity/)
    expect(resultC?.serverError).toMatch(/at capacity/)
    expect(resultB?.data).toBeUndefined()
    expect(resultC?.data).toBeUndefined()

    const activeEntries = await db.registrationEntry.count({
      where: { divisionId: fx.divisionId, status: "ACTIVE" },
    })
    expect(activeEntries).toBe(1)
  })
})
