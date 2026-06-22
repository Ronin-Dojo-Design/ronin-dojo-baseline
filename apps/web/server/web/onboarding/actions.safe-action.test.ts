/**
 * End-to-end safe-action test for `setPassportRank` (the member-facing rank-award
 * seam the profile-enhancement wizard writes through). Drives the export through
 * the full `userActionClient` middleware chain (auth + db + revalidate) via the
 * shared harness, and stubs the email seam so the action never reaches Resend.
 *
 * Run: cd apps/web && bun test --timeout 90000 \
 *        server/web/onboarding/actions.safe-action.test.ts
 */

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

// Install mocks BEFORE any import that touches `~/server` / `~/lib/auth`.
installSafeActionMocks({ brand: "BBL" })

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

// Stub the email seam — onboarding must not send mail, and a stub keeps the
// suite hermetic if the action chain ever grows a notification.
mock.module("~/lib/email", () => ({ sendEmail: mock(async () => undefined) }))

import { setPassportRank } from "~/server/web/onboarding/actions"
import { db } from "~/services/db"

// Single-brand collapse (brand-prune Stage 1): seed under BBL (seed == filter).
const TEST_BRAND = "BBL" as const
const TS = Date.now()
const tag = (name: string) => `onboarding-${TS}-${name}`

type Fixtures = {
  userId: string
  passportId: string
  rankId: string
  rankSystemId: string
  disciplineId: string
}

let fx: Fixtures | null = null

beforeAll(async () => {
  const user = await db.user.create({
    data: {
      id: tag("user"),
      name: tag("Member"),
      email: `${tag("member")}@test.local`,
    },
  })

  const passport = await db.passport.create({
    data: { userId: user.id, displayName: "Wizard Member" },
  })

  const discipline = await db.discipline.create({
    data: {
      id: tag("discipline"),
      brand: TEST_BRAND,
      name: tag("Discipline"),
      slug: tag("discipline"),
      code: tag("DISC").slice(0, 16),
    },
  })

  const rankSystem = await db.rankSystem.create({
    data: {
      id: tag("rank-system"),
      brand: TEST_BRAND,
      name: tag("Rank System"),
      kind: "BELT",
      disciplineId: discipline.id,
    },
  })

  const rank = await db.rank.create({
    data: {
      id: tag("rank"),
      brand: TEST_BRAND,
      rankSystemId: rankSystem.id,
      sortOrder: 1,
      name: tag("Blue Belt"),
      shortName: "BL",
      colorHex: "#1d4ed8",
    },
  })

  fx = {
    userId: user.id,
    passportId: passport.id,
    rankId: rank.id,
    rankSystemId: rankSystem.id,
    disciplineId: discipline.id,
  }
})

afterAll(async () => {
  if (!fx) return
  await db.rankAward.deleteMany({ where: { passportId: fx.passportId } })
  await db.rank.deleteMany({ where: { id: fx.rankId } })
  await db.rankSystem.deleteMany({ where: { id: fx.rankSystemId } })
  await db.discipline.deleteMany({ where: { id: fx.disciplineId } })
  await db.passport.deleteMany({ where: { userId: fx.userId } })
  await db.user.deleteMany({ where: { id: fx.userId } })
})

describe("setPassportRank — safe-action wrapper", () => {
  it("rejects an unauthenticated caller", async () => {
    setTestSession(null)
    const result = await setPassportRank({ rankId: fx!.rankId })
    expect(result?.serverError).toBe("User not authenticated")
    expect(result?.data).toBeUndefined()
  })

  it("creates a self-reported (STATED/UNVERIFIED) RankAward for the caller's Passport", async () => {
    setTestSession({ id: fx!.userId, role: "user" })

    const result = await setPassportRank({
      rankId: fx!.rankId,
      awardedAt: new Date(Date.UTC(2021, 5, 1)),
      promotedBy: "Professor Example",
      schoolName: "Example Academy",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.id).toBeTruthy()

    const award = await db.rankAward.findFirst({
      where: { passportId: fx!.passportId, rankId: fx!.rankId },
    })
    expect(award?.source).toBe("STATED")
    expect(award?.verificationStatus).toBe("UNVERIFIED")
    expect(award?.notes).toBe("Professor Example")
    expect(award?.location).toBe("Example Academy")
  })

  it("upserts on re-run (one award per passport+rank) rather than throwing", async () => {
    setTestSession({ id: fx!.userId, role: "user" })

    const result = await setPassportRank({ rankId: fx!.rankId, promotedBy: "Professor Updated" })
    expect(result?.serverError).toBeUndefined()

    const awards = await db.rankAward.findMany({
      where: { passportId: fx!.passportId, rankId: fx!.rankId },
    })
    expect(awards.length).toBe(1)
    expect(awards[0]?.notes).toBe("Professor Updated")
  })
})
