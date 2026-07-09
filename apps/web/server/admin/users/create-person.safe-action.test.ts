/**
 * SESSION_0519_TASK_03 — add-person RankEntry compatibility regression.
 *
 * Drives the existing admin action boundary so the proof includes its role gate,
 * transaction, accountless Passport creation, RankAward anchor, and canonical
 * RankEntry synchronization.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BASELINE_MARTIAL_ARTS" })

import { createPerson } from "~/server/admin/users/actions"
import { db } from "~/services/db"

const TS = Date.now()
const TAG_PREFIX = "session-0519-create-person-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`

let adminUserId = ""
let passportId = ""
let rankId = ""
let disciplineId = ""

beforeAll(async () => {
  const [admin, rank] = await Promise.all([
    db.user.create({
      data: { name: tag("admin"), email: `${tag("admin")}@test.local`, role: "admin" },
      select: { id: true },
    }),
    db.rank.findFirstOrThrow({
      select: { id: true, rankSystem: { select: { disciplineId: true } } },
    }),
  ])

  adminUserId = admin.id
  rankId = rank.id
  disciplineId = rank.rankSystem?.disciplineId as string
  setTestSession({ id: adminUserId, role: "admin" })
})

afterAll(async () => {
  if (adminUserId) {
    await db.auditLog.deleteMany({ where: { userId: adminUserId } })
  }
  if (passportId) {
    await db.rankAward.deleteMany({ where: { passportId } })
    await db.passport.deleteMany({ where: { id: passportId } })
  }
  if (adminUserId) {
    await db.user.deleteMany({ where: { id: adminUserId } })
  }
  await db.auditLog.deleteMany({ where: { user: { email: { startsWith: TAG_PREFIX } } } })
  await db.user.deleteMany({ where: { email: { startsWith: TAG_PREFIX } } })
})

describe("createPerson — RankEntry compatibility", () => {
  it("creates the UNVERIFIED RankAward and matching RankEntry in the add-person transaction", async () => {
    const result = await createPerson({
      name: tag("person"),
      displayName: tag("display"),
      disciplineId,
      rankId,
      affiliationRole: "TRAINS_AT",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.rankAwardId).toBeDefined()
    passportId = result?.data?.id as string

    const [award, entry] = await Promise.all([
      db.rankAward.findUnique({
        where: { id: result?.data?.rankAwardId as string },
        select: { passportId: true, rankId: true, verificationStatus: true },
      }),
      db.rankEntry.findUnique({
        where: { rankAwardId: result?.data?.rankAwardId as string },
        select: { passportId: true, rankId: true, status: true },
      }),
    ])

    expect(award).toEqual({ passportId, rankId, verificationStatus: "UNVERIFIED" })
    expect(entry).toEqual({ passportId, rankId, status: "UNVERIFIED" })
  })
})
