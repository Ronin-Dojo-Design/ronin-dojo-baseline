/**
 * SESSION_0084 — Stripe webhook test harness for tournament registration fulfillment.
 *
 * Drives the real `POST` handler in `route.ts` against the dev Postgres DB,
 * with the Stripe SDK mocked so signature verification is bypassed and outbound
 * Stripe calls (`listLineItems`, `sessions.create`, etc.) are no-ops.
 *
 * Fixtures mirror `register.concurrency.test.ts` (real user/passport/membership/
 * entitlement/tournament/discipline/role/division), with one difference: the
 * division here has `feeCents > 0` so the paid path is exercised.
 *
 * TASK_01 — smoke: one synthesized `checkout.session.completed` event →
 * exactly one PAID Registration with one ACTIVE entry.
 *
 * TASK_02 (later commit) will race two synthesized events against the same
 * `capacity = 1` division and assert what the webhook actually does.
 *
 * Run: cd apps/web && bun test app/api/stripe/webhooks/route.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test"
import type Stripe from "stripe"

// -----------------------------------------------------------------------------
// Module mocks — must be installed before importing `route.ts`.
// -----------------------------------------------------------------------------

// `~/env` uses t3-env with `emptyStringAsUndefined: true`. The local `.env`
// has `STRIPE_SECRET_KEY=""` and `STRIPE_WEBHOOK_SECRET=""`, which t3-env
// resolves to `undefined` and caches on first access — so mutating
// `process.env` afterwards has no effect. Replace `env` with a Proxy that
// passes through to `process.env` and stubs the two empty Stripe keys.
mock.module("~/env", () => ({
  env: new Proxy({} as Record<string, string | undefined>, {
    get: (_target, key: string) => {
      if (key === "STRIPE_WEBHOOK_SECRET") return "whsec_test_signature_bypassed_by_mock"
      if (key === "STRIPE_SECRET_KEY") return "sk_test_unused_by_mocked_sdk"
      return process.env[key]
    },
  }),
  isProd: false,
  isDev: true,
}))

// Stripe SDK: bypass signature verification (constructEvent returns the parsed
// body verbatim) and no-op every outbound call the route makes during the
// `checkout.session.completed` path. `listLineItems` returns an empty array so
// `grantEntitlementsFromCheckout` is a no-op for tournament fixtures (no
// PricingPlan linkage).
mock.module("~/services/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: (body: string) => JSON.parse(body) as Stripe.Event,
    },
    checkout: {
      sessions: {
        listLineItems: async () => ({ data: [] }),
        create: async () => ({ id: "cs_test_unused", url: "https://stripe.test/unused" }),
      },
    },
    subscriptions: {
      retrieve: async () => ({ metadata: {} }),
    },
    refunds: {
      create: async () => ({}),
    },
  },
}))

// `next/cache.revalidateTag` is called inside the webhook after fulfillment;
// no-op in tests.
mock.module("next/cache", () => ({
  revalidateTag: () => {},
  revalidatePath: () => {},
  updateTag: () => {},
}))

// `next/server.after` schedules work after the response; run inline so the
// test can observe its effects (currently only used for premium-tool notifies,
// not the tournament path — but kept inline for safety).
mock.module("next/server", () => ({
  after: (fn: () => void | Promise<void>) => {
    void Promise.resolve().then(() => fn())
  },
}))

// Notifications are unused on the tournament path; no-op so a stray import
// can't reach the real Resend client.
mock.module("~/lib/notifications", () => ({
  notifyAdminOfPremiumTool: async () => {},
  notifySubmitterOfPremiumTool: async () => {},
}))

// -----------------------------------------------------------------------------
// Real imports happen *after* the mocks are registered.
// -----------------------------------------------------------------------------

import { db } from "~/services/db"
import { POST } from "~/app/api/stripe/webhooks/route"

// -----------------------------------------------------------------------------
// Fixture set
// -----------------------------------------------------------------------------

const TS = Date.now()
const tag = (name: string) => `webhook-test-${TS}-${name}`
const TAG_PREFIX = "webhook-test-"
const requestBrand = "BASELINE_MARTIAL_ARTS"
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
  divisionFeeCents: number
  createdRole: boolean
  racerB: RacerFixture
  racerC: RacerFixture
}

let fx: Fixtures

beforeAll(async () => {
  const user = await db.user.create({
    data: { name: tag("user"), email: `${tag("user")}@test.local` },
  })

  const passport = await db.passport.create({
    data: { userId: user.id, displayName: tag("passport") },
  })

  const discipline = await db.discipline.create({
    data: { brand: requestBrand, name: tag("disc"), slug: tag("disc") },
  })

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

  const tournamentDiscipline = await db.tournamentDiscipline.create({
    data: { tournamentId: tournament.id, disciplineId: discipline.id },
  })

  const existingRole = await db.tournamentRole.findFirst({
    where: { code: "COMPETITOR", OR: [{ brand: requestBrand }, { brand: null, isSystem: true }] },
  })
  const role =
    existingRole ??
    (await db.tournamentRole.create({
      data: { brand: requestBrand, code: "COMPETITOR", name: tag("COMPETITOR") },
    }))
  const createdRole = !existingRole

  // Paid division — capacity=1, feeCents=5000 ($50). The webhook is the only
  // place a paid Registration row is written.
  const DIVISION_FEE_CENTS = 5000
  const division = await db.division.create({
    data: {
      name: tag("division"),
      format: "SPARRING",
      gender: "ANY",
      capacity: 1,
      feeCents: DIVISION_FEE_CENTS,
      tournamentDisciplineId: tournamentDiscipline.id,
      roleRequiredId: role.id,
    },
  })

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
    divisionFeeCents: DIVISION_FEE_CENTS,
    createdRole,
    racerB,
    racerC,
  }
})

beforeEach(async () => {
  if (!fx) return
  await db.registrationEntry.deleteMany({ where: { divisionId: fx.divisionId } })
  await db.registration.deleteMany({ where: { tournamentId: fx.tournamentId } })
})

afterAll(async () => {
  if (fx) {
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

  // Sweep zombies from any prior failed runs.
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
// Helpers — synthesize the Stripe payloads the webhook expects.
// -----------------------------------------------------------------------------

type TournamentRegistrationMetadata = {
  tournamentId: string
  userId: string
  divisionIds: string[]
  roleId: string
  representingMembershipId?: string
  /** Override the Stripe checkout session id (defaults to a unique value). */
  sessionId?: string
  /** Override the linked PaymentIntent id (defaults to a unique value). */
  paymentIntentId?: string
  /** Override `amount_total` in cents (defaults to divisionFeeCents). */
  amountTotalCents?: number
}

const makeTournamentRegistrationCheckoutSession = (
  meta: TournamentRegistrationMetadata,
): Stripe.Checkout.Session => {
  const sessionId = meta.sessionId ?? `cs_test_${meta.userId}_${Date.now()}`
  const paymentIntentId = meta.paymentIntentId ?? `pi_test_${meta.userId}_${Date.now()}`

  // Cast through `unknown` — we only build the fields the webhook reads.
  return {
    id: sessionId,
    object: "checkout.session",
    mode: "payment",
    payment_status: "paid",
    payment_intent: paymentIntentId,
    amount_total: meta.amountTotalCents ?? 0,
    currency: "usd",
    metadata: {
      type: "tournament_registration",
      tournamentId: meta.tournamentId,
      userId: meta.userId,
      divisionIds: JSON.stringify(meta.divisionIds),
      roleId: meta.roleId,
      representingMembershipId: meta.representingMembershipId ?? "",
    },
  } as unknown as Stripe.Checkout.Session
}

const makeCheckoutSessionCompletedEvent = (
  session: Stripe.Checkout.Session,
): Stripe.Event => {
  return {
    id: `evt_test_${session.id}`,
    object: "event",
    type: "checkout.session.completed",
    api_version: "2025-08-27.basil",
    created: Math.floor(Date.now() / 1000),
    data: { object: session },
    livemode: false,
    pending_webhooks: 0,
    request: { id: null, idempotency_key: null },
  } as unknown as Stripe.Event
}

const postWebhook = async (event: Stripe.Event): Promise<Response> => {
  const req = new Request("http://localhost/api/stripe/webhooks", {
    method: "POST",
    body: JSON.stringify(event),
    headers: { "stripe-signature": "test-signature-bypassed-by-mock" },
  })
  return POST(req)
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("stripe webhook — tournament registration fulfillment (smoke)", () => {
  it("checkout.session.completed → one PAID Registration with one ACTIVE entry", async () => {
    const session = makeTournamentRegistrationCheckoutSession({
      tournamentId: fx.tournamentId,
      userId: fx.userId,
      divisionIds: [fx.divisionId],
      roleId: fx.roleId,
      amountTotalCents: fx.divisionFeeCents,
    })
    const event = makeCheckoutSessionCompletedEvent(session)

    const response = await postWebhook(event)

    expect(response.status).toBe(200)

    const registrations = await db.registration.findMany({
      where: { tournamentId: fx.tournamentId, userId: fx.userId },
      include: { entries: true },
    })
    expect(registrations).toHaveLength(1)

    const registration = registrations[0]!
    expect(registration.paymentStatus).toBe("PAID")
    expect(registration.status).toBe("SUBMITTED")
    expect(registration.totalFeeCents).toBe(fx.divisionFeeCents)
    expect(registration.stripePaymentIntentId).toMatch(/^pi_test_/)
    expect(registration.entries).toHaveLength(1)
    expect(registration.entries[0]!.divisionId).toBe(fx.divisionId)
    expect(registration.entries[0]!.status).toBe("ACTIVE")
  })
})

// SESSION_0084 TASK_02 — paid-path capacity oversubscription proof.
//
// Architectural finding flagged in SESSION_0083: `register.ts` checks division
// capacity inside a Serializable transaction at *checkout-create* time, but the
// Registration row is written later by `fulfillTournamentRegistration` in the
// webhook. The webhook checks for existing Registration uniqueness on
// `(tournamentId, userId)` only — it does NOT re-check division capacity.
//
// This test documents the current (broken) behavior: two paid checkouts for
// the same `capacity=1` division can both fulfill, leaving 2 ACTIVE entries.
//
// Sequential POSTs are sufficient to prove the defect; race timing is not
// required (each call sees no prior Registration for its own userId, so each
// independently writes). Adding a parallel race would prove the same fact.
//
// Once SESSION_0085 lands the fix (re-check capacity in the webhook, or move
// Registration creation into the checkout-create transaction), the final
// assertion must flip from 2 → 1, and one of the two POSTs should surface a
// failure (likely 409 + a non-OK response body, or a REJECTED Registration).
describe("stripe webhook — paid-path capacity oversubscription (P0; current behavior)", () => {
  it("two sequential webhooks for the same capacity=1 division → 2 ACTIVE entries (BUG)", async () => {
    const sessionB = makeTournamentRegistrationCheckoutSession({
      tournamentId: fx.tournamentId,
      userId: fx.racerB.userId,
      divisionIds: [fx.divisionId],
      roleId: fx.roleId,
      amountTotalCents: fx.divisionFeeCents,
      sessionId: "cs_test_oversub_B",
      paymentIntentId: "pi_test_oversub_B",
    })
    const sessionC = makeTournamentRegistrationCheckoutSession({
      tournamentId: fx.tournamentId,
      userId: fx.racerC.userId,
      divisionIds: [fx.divisionId],
      roleId: fx.roleId,
      amountTotalCents: fx.divisionFeeCents,
      sessionId: "cs_test_oversub_C",
      paymentIntentId: "pi_test_oversub_C",
    })

    const responseB = await postWebhook(makeCheckoutSessionCompletedEvent(sessionB))
    const responseC = await postWebhook(makeCheckoutSessionCompletedEvent(sessionC))

    // The webhook is currently fail-open: both POSTs return 200.
    expect(responseB.status).toBe(200)
    expect(responseC.status).toBe(200)

    const registrations = await db.registration.findMany({
      where: { tournamentId: fx.tournamentId },
      include: { entries: true },
      orderBy: { submittedAt: "asc" },
    })
    expect(registrations).toHaveLength(2)
    expect(registrations.every(r => r.paymentStatus === "PAID")).toBe(true)

    const activeEntries = await db.registrationEntry.count({
      where: { divisionId: fx.divisionId, status: "ACTIVE" },
    })

    // BUG: division has capacity=1 but 2 ACTIVE entries got written.
    // SESSION_0085 fix must flip this assertion to `toBe(1)` and assert that
    // exactly one of the two webhook responses surfaces the rejected
    // registration (or that one Registration ends up REJECTED/REFUNDED).
    expect(activeEntries).toBe(2)
  })
})
