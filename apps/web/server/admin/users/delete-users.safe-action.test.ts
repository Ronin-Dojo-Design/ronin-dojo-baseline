/**
 * `deleteUsers` identity-preservation regression. A referenced coach Passport cannot be cascaded
 * away with its account; deletion fails closed so active and review history remain unchanged.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dependency.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"
import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BBL" })
mock.module("~/lib/media", () => ({ removeS3Directories: async () => {} }))

import { deleteUsers } from "~/server/admin/users/actions"
import { db } from "~/services/db"

const PREFIX = `delete-users-promoter-history-${Date.now()}`
const tag = (name: string) => `${PREFIX}-${name}`

let adminUserId = ""
let adminPassportId = ""
let coachUserId = ""
let coachPassportId = ""
let subjectPassportId = ""
let awardId = ""
let entryId = ""
let pendingReviewId = ""
let terminalReviewId = ""

beforeAll(async () => {
  const [admin, coach, rank] = await Promise.all([
    db.user.create({
      data: { name: tag("admin"), email: `${tag("admin")}@test.local`, role: "admin" },
      select: { id: true },
    }),
    db.user.create({
      data: { name: tag("coach"), email: `${tag("coach")}@test.local`, role: "user" },
      select: { id: true },
    }),
    db.rank.findFirstOrThrow({ select: { id: true } }),
  ])
  adminUserId = admin.id
  coachUserId = coach.id

  const [adminPassport, coachPassport, subjectPassport] = await Promise.all([
    db.passport.create({ data: { displayName: tag("admin-passport"), userId: admin.id } }),
    db.passport.create({ data: { displayName: tag("coach-passport"), userId: coach.id } }),
    db.passport.create({ data: { displayName: tag("subject-passport") } }),
  ])
  adminPassportId = adminPassport.id
  coachPassportId = coachPassport.id
  subjectPassportId = subjectPassport.id

  const award = await db.rankAward.create({
    data: {
      passportId: subjectPassport.id,
      rankId: rank.id,
      source: "STATED",
      verificationStatus: "VERIFIED",
      awardedByPassportId: coachPassport.id,
    },
    select: { id: true },
  })
  awardId = award.id
  const entry = await db.rankEntry.create({
    data: {
      passportId: subjectPassport.id,
      rankId: rank.id,
      rankAwardId: award.id,
      status: "VERIFIED",
    },
    select: { id: true },
  })
  entryId = entry.id

  const [pending, terminal] = await Promise.all([
    db.rankEntryReview.create({
      data: {
        rankEntryId: entry.id,
        status: "PROPOSAL_PENDING",
        reason: "PROMOTER_CHANGED",
        proposalCapturedAt: new Date(),
        expectedPromoterPassportId: coachPassport.id,
        proposedPromoterPassportId: subjectPassport.id,
      },
      select: { id: true },
    }),
    db.rankEntryReview.create({
      data: {
        rankEntryId: entry.id,
        status: "APPROVED",
        reason: "PROMOTER_CHANGED",
        proposalCapturedAt: new Date(),
        expectedPromoterPassportId: subjectPassport.id,
        proposedPromoterPassportId: coachPassport.id,
      },
      select: { id: true },
    }),
  ])
  pendingReviewId = pending.id
  terminalReviewId = terminal.id
})

afterAll(async () => {
  if (entryId) await db.rankEntryReview.deleteMany({ where: { rankEntryId: entryId } })
  if (awardId) await db.rankAward.deleteMany({ where: { id: awardId } })
  await db.passport.deleteMany({
    where: { id: { in: [adminPassportId, coachPassportId, subjectPassportId].filter(Boolean) } },
  })
  await db.session.deleteMany({ where: { userId: { in: [adminUserId, coachUserId] } } })
  await db.user.deleteMany({ where: { id: { in: [adminUserId, coachUserId].filter(Boolean) } } })
})

describe("deleteUsers — referenced promoter identity", () => {
  it("fails closed when a non-admin coach Passport has active, pending, or terminal history", async () => {
    setTestSession({ id: adminUserId, role: "admin" })

    const result = await deleteUsers({ ids: [coachUserId, adminUserId] })

    expect(result?.serverError).toBe(
      "This account cannot be deleted because its person identity is referenced by belt promotion history.",
    )
    expect(await db.user.findUnique({ where: { id: coachUserId } })).not.toBeNull()
    expect(
      await db.passport.findUnique({
        where: { id: coachPassportId },
        select: { userId: true },
      }),
    ).toEqual({ userId: coachUserId })
    expect(
      await db.rankAward.findUnique({
        where: { id: awardId },
        select: { awardedByPassportId: true },
      }),
    ).toEqual({ awardedByPassportId: coachPassportId })
    expect(
      await db.rankEntryReview.findMany({
        where: { id: { in: [pendingReviewId, terminalReviewId] } },
        orderBy: { id: "asc" },
        select: {
          id: true,
          status: true,
          expectedPromoterPassportId: true,
          proposedPromoterPassportId: true,
        },
      }),
    ).toEqual(
      [
        {
          id: pendingReviewId,
          status: "PROPOSAL_PENDING",
          expectedPromoterPassportId: coachPassportId,
          proposedPromoterPassportId: subjectPassportId,
        },
        {
          id: terminalReviewId,
          status: "APPROVED",
          expectedPromoterPassportId: subjectPassportId,
          proposedPromoterPassportId: coachPassportId,
        },
      ].sort((a, b) => a.id.localeCompare(b.id)),
    )

    // The same bulk command still excludes the admin identity from deletion/preflight mutation.
    expect(await db.user.findUnique({ where: { id: adminUserId } })).not.toBeNull()
    expect(
      await db.passport.findUnique({
        where: { id: adminPassportId },
        select: { userId: true },
      }),
    ).toEqual({ userId: adminUserId })
  })

  it("preserves the existing cascade for an unreferenced non-admin while excluding admins", async () => {
    const user = await db.user.create({
      data: { name: tag("unreferenced"), email: `${tag("unreferenced")}@test.local`, role: "user" },
      select: { id: true },
    })
    const passport = await db.passport.create({
      data: { displayName: tag("unreferenced-passport"), userId: user.id },
      select: { id: true },
    })
    setTestSession({ id: adminUserId, role: "admin" })

    try {
      const result = await deleteUsers({ ids: [user.id, adminUserId] })

      expect(result?.serverError).toBeUndefined()
      expect(await db.user.findUnique({ where: { id: user.id } })).toBeNull()
      expect(await db.passport.findUnique({ where: { id: passport.id } })).toBeNull()
      expect(await db.user.findUnique({ where: { id: adminUserId } })).not.toBeNull()
      expect(
        await db.passport.findUnique({
          where: { id: adminPassportId },
          select: { userId: true },
        }),
      ).toEqual({ userId: adminUserId })
    } finally {
      await db.passport.deleteMany({ where: { id: passport.id } })
      await db.user.deleteMany({ where: { id: user.id } })
    }
  })
})
