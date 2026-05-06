/**
 * SESSION_0082 TASK_01-03 — Concurrency proof for tournament registration capacity.
 *
 * Tests that `createRegistrationCheckout` prevents oversubscription when multiple
 * users attempt to register for a capacity-constrained division simultaneously.
 * Uses Serializable transaction isolation to ensure fail-closed behavior.
 *
 * Key checks:
 *   - Entitlement guard (`checkEntitlement`) passes with active UserEntitlement
 *   - Brand membership guard (`isInSameBrand`) passes with active Membership
 *   - Capacity check prevents oversubscription via Serializable transaction
 *   - One caller succeeds, one fails with "at capacity" error
 *
 * Test-DB strategy mirrors `materialize.concurrency.test.ts`: real Postgres +
 * setup/teardown isolation with `registration-test-*` timestamp-tagged fixtures.
 * Two-phase `afterAll` (targeted deletes for this run + sweep of any zombie rows)
 * so reruns are idempotent.
 *
 * Run: cd apps/web && bun test server/web/tournaments/register.concurrency.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

// -----------------------------------------------------------------------------
// Mutable state captured by the mocks below.
// -----------------------------------------------------------------------------

const sessionUserState = { id: "" }
const rateLimitState = { limited: false }
const requestBrand = "BASELINE_MARTIAL_ARTS"

// -----------------------------------------------------------------------------
// Module mocks — must be installed before importing `actions.ts`.
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
    user: { id: sessionUserState.id, role: null, lastActiveBrandId: null },
    session: { id: "test-session" },
  }),
  auth: {},
}))

mock.module("~/lib/rate-limiter", () => ({
  isRateLimited: async () => rateLimitState.limited,
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

type Fixtures = {
  userId: string
  passportId: string
  membershipId: string
  organizationId: string
  disciplineId: string
  entitlementId: string
  userEntitlementId: string
  tournamentId: string
  tournamentDisciplineId: string
  tournamentRoleId: string
  divisionId: string
  createdRole: boolean
}

let fx: Fixtures

beforeAll(async () => {
  // 1. Create test user
  const user = await db.user.create({
    data: { name: tag("user"), email: `${tag("user")}@test.local` },
  })

  // 2. Create Passport (required by createRegistrationCheckout line 54)
  const passport = await db.passport.create({
    data: {
      userId: user.id,
      displayName: tag("fighter"),
    },
  })

  // 3. Create discipline (needed for organization and membership)
  const discipline = await db.discipline.create({
    data: { brand: requestBrand, name: tag("discipline"), slug: tag("discipline") },
  })

  // 4. Create organization (needed for membership)
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

  // 5. Create Membership (required by isInSameBrand)
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

  // 6. Create Entitlement (required by checkEntitlement)
  const entitlement = await db.entitlement.create({
    data: {
      brand: requestBrand,
      key: "tournament-registration",
      name: tag("Tournament Registration"),
    },
  })

  // 7. Grant UserEntitlement (required by checkEntitlement)
  const userEntitlement = await db.userEntitlement.create({
    data: {
      userId: user.id,
      entitlementId: entitlement.id,
      sourceType: "PURCHASE",
      sourceId: tag("test-grant"),
      status: "ACTIVE",
    },
  })

  // 8. Create Tournament
  const tournament = await db.tournament.create({
    data: {
      brand: requestBrand,
      name: tag("tournament"),
      slug: tag("tournament"),
      status: "PUBLISHED",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-02"),
    },
  })

  // 9. Create TournamentDiscipline
  const tournamentDiscipline = await db.tournamentDiscipline.create({
    data: {
      tournamentId: tournament.id,
      disciplineId: discipline.id,
    },
  })

  // 10. Find or create TournamentRole (COMPETITOR)
  const existingRole = await db.tournamentRole.findFirst({
    where: { code: "COMPETITOR", OR: [{ brand: requestBrand }, { brand: null, isSystem: true }] },
  })
  const tournamentRole =
    existingRole ??
    (await db.tournamentRole.create({
      data: { brand: requestBrand, code: "COMPETITOR", name: tag("COMPETITOR") },
    }))
  const createdRole = !existingRole

  // 11. Create Division with capacity: 1, feeCents: 0 (free registration)
  const division = await db.division.create({
    data: {
      tournamentDisciplineId: tournamentDiscipline.id,
      tournamentRoleId: tournamentRole.id,
      name: tag("division"),
      slug: tag("division"),
      capacity: 1,
      feeCents: 0,
      status: "PUBLISHED",
    },
  })

  fx = {
    userId: user.id,
    passportId: passport.id,
    membershipId: membership.id,
    organizationId: organization.id,
    disciplineId: discipline.id,
    entitlementId: entitlement.id,
    userEntitlementId: userEntitlement.id,
    tournamentId: tournament.id,
    tournamentDisciplineId: tournamentDiscipline.id,
    tournamentRoleId: tournamentRole.id,
    divisionId: division.id,
    createdRole,
  }

  sessionUserState.id = user.id
})

afterAll(async () => {
  // Two-phase teardown matching materialize.concurrency.test.ts: targeted + sweep.
  const TAG_PREFIX = "registration-test-"

  if (fx) {
    // Delete in reverse dependency order
    await db.auditLog.deleteMany({ where: { userId: fx.userId } })
    await db.registrationEntry.deleteMany({
      where: { registration: { tournamentId: fx.tournamentId } },
    })
    await db.registration.deleteMany({ where: { tournamentId: fx.tournamentId } })
    await db.division.deleteMany({ where: { id: fx.divisionId } })
    await db.tournamentDiscipline.deleteMany({ where: { id: fx.tournamentDisciplineId } })
    await db.tournament.deleteMany({ where: { id: fx.tournamentId } })
    await db.userEntitlement.deleteMany({ where: { id: fx.userEntitlementId } })
    await db.entitlement.deleteMany({ where: { id: fx.entitlementId } })
    await db.membershipRoleAssignment.deleteMany({
      where: { membership: { id: fx.membershipId } },
    })
    await db.membership.deleteMany({ where: { id: fx.membershipId } })
    await db.organizationDiscipline.deleteMany({
      where: { organizationId: fx.organizationId },
    })
    await db.organization.deleteMany({ where: { id: fx.organizationId } })
    await db.passport.deleteMany({ where: { id: fx.passportId } })
    await db.user.deleteMany({ where: { id: fx.userId } })
    await db.discipline.deleteMany({ where: { id: fx.disciplineId } })
    if (fx.createdRole) {
      await db.tournamentRole.deleteMany({ where: { id: fx.tournamentRoleId } })
    }
  }

  // Sweep zombie rows (matches materialize.concurrency.test.ts strategy).
  const zombieTournaments = await db.tournament.findMany({
    where: { name: { startsWith: TAG_PREFIX } },
    select: { id: true },
  })
  const zombieTournamentIds = zombieTournaments.map((t) => t.id)

  const zombieOrgs = await db.organization.findMany({
    where: { name: { startsWith: TAG_PREFIX } },
    select: { id: true },
  })
  const zombieOrgIds = zombieOrgs.map((o) => o.id)

  const zombieUsers = await db.user.findMany({
    where: { name: { startsWith: TAG_PREFIX } },
    select: { id: true },
  })
  const zombieUserIds = zombieUsers.map((u) => u.id)

  if (zombieUserIds.length > 0) {
    await db.auditLog.deleteMany({ where: { userId: { in: zombieUserIds } } })
  }
  if (zombieTournamentIds.length > 0) {
    await db.registrationEntry.deleteMany({
      where: { registration: { tournamentId: { in: zombieTournamentIds } } },
    })
    await db.registration.deleteMany({ where: { tournamentId: { in: zombieTournamentIds } } })
    await db.division.deleteMany({
      where: { tournamentDiscipline: { tournamentId: { in: zombieTournamentIds } } },
    })
    await db.tournamentDiscipline.deleteMany({
      where: { tournamentId: { in: zombieTournamentIds } },
    })
    await db.tournament.deleteMany({ where: { id: { in: zombieTournamentIds } } })
  }
  const zombieEntitlements = await db.entitlement.findMany({
    where: { name: { startsWith: TAG_PREFIX } },
    select: { id: true },
  })
  const zombieEntitlementIds = zombieEntitlements.map((e) => e.id)
  if (zombieEntitlementIds.length > 0) {
    await db.userEntitlement.deleteMany({ where: { entitlementId: { in: zombieEntitlementIds } } })
    await db.entitlement.deleteMany({ where: { id: { in: zombieEntitlementIds } } })
  }
  if (zombieOrgIds.length > 0) {
    await db.membershipRoleAssignment.deleteMany({
      where: { membership: { organizationId: { in: zombieOrgIds } } },
    })
    await db.membership.deleteMany({ where: { organizationId: { in: zombieOrgIds } } })
    await db.organizationDiscipline.deleteMany({
      where: { organizationId: { in: zombieOrgIds } },
    })
    await db.organization.deleteMany({ where: { id: { in: zombieOrgIds } } })
  }
  const zombiePassports = await db.passport.findMany({
    where: { displayName: { startsWith: TAG_PREFIX } },
    select: { id: true },
  })
  if (zombiePassports.length > 0) {
    await db.passport.deleteMany({ where: { id: { in: zombiePassports.map((p) => p.id) } } })
  }
  if (zombieUserIds.length > 0) {
    await db.user.deleteMany({ where: { id: { in: zombieUserIds } } })
  }
  await db.discipline.deleteMany({ where: { name: { startsWith: TAG_PREFIX } } })
  await db.tournamentRole.deleteMany({ where: { name: { startsWith: TAG_PREFIX } } })

  await db.$disconnect()
})

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("createRegistrationCheckout — concurrency", () => {
  it("two parallel registrations when division has 1 slot remaining", async () => {
    rateLimitState.limited = false

    // Fire two parallel registration attempts
    const [resultA, resultB] = await Promise.all([
      createRegistrationCheckout({
        tournamentId: fx.tournamentId,
        divisionIds: [fx.divisionId],
        roleCode: "COMPETITOR",
      }),
      createRegistrationCheckout({
        tournamentId: fx.tournamentId,
        divisionIds: [fx.divisionId],
        roleCode: "COMPETITOR",
      }),
    ])

    // One should succeed, one should fail
    const successes = [resultA, resultB].filter(r => r?.data?.type === "free")
    const failures = [resultA, resultB].filter(r => r?.serverError)

    expect(successes.length).toBe(1)
    expect(failures.length).toBe(1)

    // The failure should mention capacity
    const failureError = failures[0]?.serverError
    expect(failureError).toBeDefined()
    expect(failureError).toMatch(/capacity/i)

    // Total ACTIVE entries should equal division capacity (no oversubscription)
    const activeCount = await db.registrationEntry.count({
      where: {
        divisionId: fx.divisionId,
        status: "ACTIVE",
      },
    })
    expect(activeCount).toBe(1)

    // Cleanup registrations for next test
    await db.registrationEntry.deleteMany({
      where: { registration: { tournamentId: fx.tournamentId } },
    })
    await db.registration.deleteMany({ where: { tournamentId: fx.tournamentId } })
  })

  it("two parallel registrations when division is at capacity", async () => {
    rateLimitState.limited = false

    // First, fill the division to capacity
    const fillResult = await createRegistrationCheckout({
      tournamentId: fx.tournamentId,
      divisionIds: [fx.divisionId],
      roleCode: "COMPETITOR",
    })
    expect(fillResult?.data?.type).toBe("free")

    // Now attempt two more parallel registrations (both should fail)
    const [resultA, resultB] = await Promise.all([
      createRegistrationCheckout({
        tournamentId: fx.tournamentId,
        divisionIds: [fx.divisionId],
        roleCode: "COMPETITOR",
      }),
      createRegistrationCheckout({
        tournamentId: fx.tournamentId,
        divisionIds: [fx.divisionId],
        roleCode: "COMPETITOR",
      }),
    ])

    // Both should fail
    expect(resultA?.serverError).toBeDefined()
    expect(resultA?.serverError).toMatch(/capacity/i)
    expect(resultB?.serverError).toBeDefined()
    expect(resultB?.serverError).toMatch(/capacity/i)

    // Total ACTIVE entries should still equal division capacity
    const activeCount = await db.registrationEntry.count({
      where: {
        divisionId: fx.divisionId,
        status: "ACTIVE",
      },
    })
    expect(activeCount).toBe(1)

    // Cleanup for any subsequent tests
    await db.registrationEntry.deleteMany({
      where: { registration: { tournamentId: fx.tournamentId } },
    })
    await db.registration.deleteMany({ where: { tournamentId: fx.tournamentId } })
  })
})
