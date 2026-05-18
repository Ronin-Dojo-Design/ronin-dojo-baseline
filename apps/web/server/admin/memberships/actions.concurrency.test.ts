/**
 * SESSION_0151 TASK_01 → SESSION_0152 TASK_03 — Concurrency test for membership transitions.
 *
 * Proves (with optimistic locking via `version` column):
 *   - Multiple parallel transitionMembershipStatus calls on the same membership
 *     result in exactly ONE winner. Losers receive a `serverError` containing
 *     "Conflict" (next-safe-action catches thrown errors as `{ serverError }`).
 *   - Exactly 1 AuditLog entry is created (no duplicates).
 *   - No uncaught exceptions surface to callers.
 *
 * Pattern: sop-test-writing.md §8 (concurrency test)
 * Run: cd apps/web && bun test server/admin/memberships/actions.concurrency.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

// ---------------------------------------------------------------------------
// Mutable state
// ---------------------------------------------------------------------------

const sessionUserState = { id: "", role: "admin" as string | null }
const requestBrand = "BASELINE_MARTIAL_ARTS"

// ---------------------------------------------------------------------------
// Module mocks — before imports
// ---------------------------------------------------------------------------

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
      id: sessionUserState.id,
      role: sessionUserState.role,
      lastActiveBrandId: null,
    },
    session: { id: "concurrency-test-session" },
  }),
  auth: {},
}))

mock.module("next/server", () => ({
  after: (fn: () => void | Promise<void>) => {
    void Promise.resolve().then(() => fn())
  },
}))

// ---------------------------------------------------------------------------
// Real imports
// ---------------------------------------------------------------------------

import { transitionMembershipStatus } from "~/server/admin/memberships/actions"
import { db } from "~/services/db"

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const TS = Date.now()
const TAG_PREFIX = "membership-concurrency-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`

type Fixtures = {
  userId: string
  organizationId: string
  disciplineId: string
  membershipId: string
}

let fx: Fixtures

beforeAll(async () => {
  const user = await db.user.create({
    data: {
      name: tag("admin"),
      email: `${tag("admin")}@test.local`,
      emailVerified: true,
    },
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
      status: "PENDING",
    },
  })

  sessionUserState.id = user.id

  fx = {
    userId: user.id,
    organizationId: organization.id,
    disciplineId: discipline.id,
    membershipId: membership.id,
  }
})

afterAll(async () => {
  if (!fx) return

  // Phase 1: targeted deletes
  await db.auditLog.deleteMany({ where: { userId: fx.userId } })
  await db.membership.deleteMany({ where: { id: fx.membershipId } })
  await db.organizationDiscipline.deleteMany({
    where: { organizationId: fx.organizationId },
  })
  await db.organization.deleteMany({ where: { id: fx.organizationId } })
  await db.user.deleteMany({ where: { id: fx.userId } })
  await db.discipline.deleteMany({ where: { id: fx.disciplineId } })

  // Phase 2: zombie sweep
  await db.auditLog.deleteMany({
    where: {
      userId: {
        in: (
          await db.user.findMany({
            where: { email: { startsWith: TAG_PREFIX } },
            select: { id: true },
          })
        ).map(u => u.id),
      },
    },
  })
  await db.membership.deleteMany({
    where: { user: { email: { startsWith: TAG_PREFIX } } },
  })
  await db.organization.deleteMany({
    where: { slug: { startsWith: TAG_PREFIX } },
  })
  await db.discipline.deleteMany({
    where: { slug: { startsWith: TAG_PREFIX } },
  })
  await db.user.deleteMany({
    where: { email: { startsWith: TAG_PREFIX } },
  })
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("transitionMembershipStatus — concurrency", () => {
  it("parallel PENDING→ACTIVE calls: exactly one wins via optimistic locking", async () => {
    const PARALLEL_COUNT = 5

    // Fire N parallel transition calls
    const results = await Promise.allSettled(
      Array.from({ length: PARALLEL_COUNT }, () =>
        transitionMembershipStatus({ id: fx.membershipId, toStatus: "ACTIVE" }),
      ),
    )

    // Allow after() callbacks to settle
    await new Promise(r => setTimeout(r, 200))

    // All promises settle as "fulfilled" because next-safe-action catches errors
    // and returns them as { serverError } in the result object.
    const fulfilled = results.filter(r => r.status === "fulfilled")
    expect(fulfilled.length).toBe(PARALLEL_COUNT)

    // Among the fulfilled results, exactly one should be a success (no serverError)
    const successes = fulfilled.filter(
      r => r.status === "fulfilled" && r.value && !("serverError" in r.value),
    )
    const conflicts = fulfilled.filter(
      r => r.status === "fulfilled" && r.value && "serverError" in r.value,
    )
    expect(successes.length).toBe(1)
    expect(conflicts.length).toBe(PARALLEL_COUNT - 1)

    // Conflict errors should contain "Conflict" message
    for (const r of conflicts) {
      if (r.status === "fulfilled" && r.value && "serverError" in r.value) {
        expect(String(r.value.serverError)).toContain("Conflict")
      }
    }

    // Final membership state: ACTIVE, version incremented exactly once
    const membership = await db.membership.findUnique({
      where: { id: fx.membershipId },
      select: { status: true, version: true },
    })
    expect(membership?.status).toBe("ACTIVE")
    expect(membership?.version).toBe(1)

    // Exactly 1 AuditLog entry — no duplicates
    const auditLogs = await db.auditLog.findMany({
      where: {
        entityType: "Membership",
        entityId: fx.membershipId,
        action: "STATUS_TRANSITION",
      },
      orderBy: { createdAt: "asc" },
    })
    expect(auditLogs.length).toBe(1)

    // The single entry should be PENDING → ACTIVE
    const entry = auditLogs[0]
    expect((entry.before as Record<string, string>)?.status).toBe("PENDING")
    expect((entry.after as Record<string, string>)?.status).toBe("ACTIVE")
  })
})
