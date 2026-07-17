/**
 * End-to-end safe-action test for `setPassportRank` (the member-facing belt-declaration
 * seam the profile-enhancement wizard writes through). B1 (petey-plan-0477 Slice V4): the
 * wizard now files a pending `RANK_PROMOTION` claim (no displaying `RankAward`). Drives the
 * export through the full `userActionClient` middleware chain (auth + db + revalidate) via
 * the shared harness, and stubs the email seam so the action never reaches Resend.
 *
 * Run: cd apps/web && bun run test server/web/onboarding/actions.safe-action.test.ts
 */

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

// Install mocks BEFORE any import that touches `~/server` / `~/lib/auth`.
installSafeActionMocks({ brand: "BBL" })

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

// Stub the email seam — onboarding must not send mail, and a stub keeps the
// suite hermetic if the action chain ever grows a notification.
mock.module("~/lib/email", () => ({ sendEmail: mock(async () => undefined) }))

import { SUBMIT_RANK_PROMOTION_CLAIM_ERROR } from "~/server/web/claims/submit-rank-promotion-claim"
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
  // Registered creatable-combobox targets (SESSION_0500 N1): an instructor LineageNode and a
  // school Organization the wizard's typed refs point at.
  instructorUserId: string
  instructorPassportId: string
  instructorNodeId: string
  schoolOrgId: string
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

  // A registered instructor (a LineageNode keyed off its own Passport) + a registered school
  // Organization — the two typed-ref targets the wizard's comboboxes persist.
  const instructorUser = await db.user.create({
    data: {
      id: tag("instructor-user"),
      name: tag("Instructor"),
      email: `${tag("instructor")}@test.local`,
    },
  })
  const instructorPassport = await db.passport.create({
    data: { userId: instructorUser.id, displayName: "Wizard Instructor" },
  })
  const instructorNode = await db.lineageNode.create({
    data: { id: tag("node"), passportId: instructorPassport.id, visibility: "PUBLIC" },
  })
  const school = await db.organization.create({
    data: {
      id: tag("org"),
      brand: TEST_BRAND,
      name: tag("Wizard Academy"),
      slug: tag("wizard-academy"),
    },
  })

  const discipline = await db.discipline.create({
    data: {
      id: tag("discipline"),
      brand: TEST_BRAND,
      name: tag("Discipline"),
      slug: tag("discipline"),
      // Keep the entropy-bearing end of the timestamp inside the 16-char DB limit. Truncating the
      // shared `onboarding-…` prefix made interrupted runs collide for months at a time.
      code: `OB-${TS.toString(36)}`,
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
    instructorUserId: instructorUser.id,
    instructorPassportId: instructorPassport.id,
    instructorNodeId: instructorNode.id,
    schoolOrgId: school.id,
  }
})

afterAll(async () => {
  if (!fx) return
  await db.passportClaimEvidence.deleteMany({
    where: { claimRequest: { passportId: fx.passportId } },
  })
  await db.passportClaimRequest.deleteMany({ where: { passportId: fx.passportId } })
  await db.rankAward.deleteMany({ where: { passportId: fx.passportId } })
  await db.rank.deleteMany({ where: { id: fx.rankId } })
  await db.rankSystem.deleteMany({ where: { id: fx.rankSystemId } })
  await db.discipline.deleteMany({ where: { id: fx.disciplineId } })
  await db.organization.deleteMany({ where: { id: fx.schoolOrgId } })
  await db.lineageNode.deleteMany({ where: { id: fx.instructorNodeId } })
  await db.passport.deleteMany({ where: { id: fx.instructorPassportId } })
  await db.passport.deleteMany({ where: { userId: fx.userId } })
  await db.user.deleteMany({ where: { id: { in: [fx.userId, fx.instructorUserId] } } })
})

describe("setPassportRank — safe-action wrapper", () => {
  it("rejects an unauthenticated caller", async () => {
    setTestSession(null)
    const result = await setPassportRank({ rankId: fx!.rankId })
    expect(result?.serverError).toBe("User not authenticated")
    expect(result?.data).toBeUndefined()
  })

  it("files a PENDING RANK_PROMOTION claim (and NO displaying award) for the caller", async () => {
    setTestSession({ id: fx!.userId, role: "user" })

    const result = await setPassportRank({
      rankId: fx!.rankId,
      awardedAt: new Date(Date.UTC(2021, 5, 1)),
      promotedBy: "Professor Example",
      // SESSION_0500 N1: a REGISTERED creatable-combobox pick persists a typed FK ref alongside
      // the free text — instructor = LineageNode id, school = Organization id.
      promotedByNodeId: fx!.instructorNodeId,
      schoolName: "Example Academy",
      schoolOrgId: fx!.schoolOrgId,
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.claimId).toBeTruthy()

    // B1 (ADR 0035 Amendment 1): a self-declared belt is NEVER minted as an award — it can't
    // surface as the member's awarded rank until an instructor approves it.
    const award = await db.rankAward.findFirst({
      where: { passportId: fx!.passportId, rankId: fx!.rankId },
    })
    expect(award).toBeNull()

    const claim = await db.passportClaimRequest.findFirst({
      where: { passportId: fx!.passportId, type: "RANK_PROMOTION" },
    })
    expect(claim?.status).toBe("PENDING")
    expect(claim?.claimedRankId).toBe(fx!.rankId)
    expect(claim?.claimantNote).toContain("Professor Example")
    expect(claim?.claimantNote).toContain("Example Academy")
    // The registered picks materialize as typed FK refs (steward-display for a promotion — they
    // render as resolved links in claim-review-detail.tsx). SESSION_0500 N1.
    expect(claim?.trainedUnderNodeId).toBe(fx!.instructorNodeId)
    expect(claim?.claimedSchoolId).toBe(fx!.schoolOrgId)
  })

  it("rejects a second declaration while a promotion is already pending (one open per member)", async () => {
    setTestSession({ id: fx!.userId, role: "user" })

    const result = await setPassportRank({ rankId: fx!.rankId, promotedBy: "Professor Updated" })
    expect(result?.serverError).toBe(SUBMIT_RANK_PROMOTION_CLAIM_ERROR.DUPLICATE_OPEN_PROMOTION)

    const claims = await db.passportClaimRequest.findMany({
      where: { passportId: fx!.passportId, type: "RANK_PROMOTION" },
    })
    expect(claims.length).toBe(1)
  })
})
