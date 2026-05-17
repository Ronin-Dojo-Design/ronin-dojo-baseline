/**
 * SESSION_0188 TASK_01 — end-to-end safe-action test for `enrollInProgram`.
 *
 * Invokes the next-safe-action-wrapped export through the full `userActionClient`
 * middleware chain (auth + brand + rate-limit + revalidate) using the reusable
 * `installSafeActionMocks` harness. Proves three gates: unauthenticated short-circuit,
 * rate-limited short-circuit (with no DB write), and the authorized happy path.
 *
 * Run: cd apps/web && bun test --timeout 90000 \
 *        server/web/enrollment/actions.safe-action.test.ts
 *
 * Author: Cody / SESSION_0188 TASK_01.
 */

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

// Install mocks BEFORE any import that touches `~/server`, `~/lib/auth`, etc.
const env = installSafeActionMocks({ brand: "BASELINE_MARTIAL_ARTS" })

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test"

import { enrollInProgram } from "~/server/web/enrollment/actions"
import { ENROLLMENT_ERROR } from "~/server/web/enrollment/errors"
import { db } from "~/services/db"

const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const
const TS = Date.now()
const tag = (name: string) => `session-0188-${TS}-${name}`

type Fixtures = {
  ownerId: string
  organizationId: string
  disciplineId: string
  programId: string
}

let fx: Fixtures | null = null

const todayUtc = () => {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

beforeAll(async () => {
  const owner = await db.user.create({
    data: { name: tag("owner"), email: `${tag("owner")}@test.local` },
  })

  await db.passport.create({
    data: { userId: owner.id, displayName: tag("owner") },
  })

  const discipline = await db.discipline.create({
    data: { brand: TEST_BRAND, name: tag("disc"), slug: tag("disc") },
  })

  const organization = await db.organization.create({
    data: {
      brand: TEST_BRAND,
      name: tag("org"),
      slug: tag("org"),
      type: "DOJO",
      ownerId: owner.id,
    },
  })

  await db.organizationDiscipline.create({
    data: { organizationId: organization.id, disciplineId: discipline.id },
  })

  await db.membership.create({
    data: {
      brand: TEST_BRAND,
      userId: owner.id,
      organizationId: organization.id,
      disciplineId: discipline.id,
      status: "ACTIVE",
      joinedAt: todayUtc(),
    },
  })

  const program = await db.program.create({
    data: {
      brand: TEST_BRAND,
      organizationId: organization.id,
      disciplineId: discipline.id,
      name: tag("program"),
      slug: tag("program"),
      status: "ACTIVE",
      maxEnrollment: 1,
    },
  })

  fx = {
    ownerId: owner.id,
    organizationId: organization.id,
    disciplineId: discipline.id,
    programId: program.id,
  }
})

beforeEach(async () => {
  if (!fx) return
  env.setRateLimited(false)
  await db.auditLog.deleteMany({ where: { organizationId: fx.organizationId } })
  await db.programEnrollment.deleteMany({ where: { programId: fx.programId } })
})

afterAll(async () => {
  if (!fx) return

  await db.auditLog.deleteMany({ where: { organizationId: fx.organizationId } })
  await db.programEnrollment.deleteMany({ where: { programId: fx.programId } })
  await db.program.deleteMany({ where: { id: fx.programId } })
  await db.membership.deleteMany({ where: { organizationId: fx.organizationId } })
  await db.organizationDiscipline.deleteMany({ where: { organizationId: fx.organizationId } })
  await db.organization.deleteMany({ where: { id: fx.organizationId } })
  await db.passport.deleteMany({ where: { userId: fx.ownerId } })
  await db.user.deleteMany({ where: { id: fx.ownerId } })
  await db.discipline.deleteMany({ where: { id: fx.disciplineId } })
})

describe("enrollInProgram — safe-action wrapper", () => {
  it("returns serverError 'User not authenticated' when no session is present", async () => {
    setTestSession(null)

    const result = await enrollInProgram({
      programId: fx!.programId,
      userId: fx!.ownerId,
    })

    expect(result?.serverError).toBe("User not authenticated")
    expect(result?.data).toBeUndefined()
    expect(await db.programEnrollment.count({ where: { programId: fx!.programId } })).toBe(0)
  })

  it("returns serverError RATE_LIMITED and writes no enrollment when rate-limited", async () => {
    setTestSession({ id: fx!.ownerId })
    env.setRateLimited(true)

    const result = await enrollInProgram({
      programId: fx!.programId,
      userId: fx!.ownerId,
    })

    expect(result?.serverError).toBe(ENROLLMENT_ERROR.RATE_LIMITED)
    expect(result?.data).toBeUndefined()
    expect(await db.programEnrollment.count({ where: { programId: fx!.programId } })).toBe(0)
  })

  it("enrolls an authorized member and writes the audit row on the happy path", async () => {
    setTestSession({ id: fx!.ownerId })

    const result = await enrollInProgram({
      programId: fx!.programId,
      userId: fx!.ownerId,
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.status).toBe("ACTIVE")
    expect(result?.data?.userId).toBe(fx!.ownerId)
    expect(result?.data?.programId).toBe(fx!.programId)

    const audits = await db.auditLog.findMany({
      where: { organizationId: fx!.organizationId, entityType: "Enrollment" },
    })
    expect(audits.map(row => row.action)).toContain("enrollment.created")
  })
})
