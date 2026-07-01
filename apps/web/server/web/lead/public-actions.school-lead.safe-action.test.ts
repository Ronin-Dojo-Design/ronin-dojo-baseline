/**
 * SESSION_0478 — targeted Join-the-Legacy custom-school flywheel proof.
 *
 * This intentionally avoids the legacy lineage-claim fixtures in
 * `public-actions.safe-action.test.ts`; those currently hit a pre-existing local
 * DB/schema drift around `LineageTreeMember.rankAwardId`. The seam under test
 * here is narrower: no node selected, custom school typed, public action emits
 * exactly one school-outreach lead and bumps demand on repeat.
 *
 * Run: cd apps/web && bun test server/web/lead/public-actions.school-lead.safe-action.test.ts
 */

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

const safeActionEnv = installSafeActionMocks({ brand: "BBL", host: "blackbeltlegacy.com" })

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { mock } from "bun:test"

mock.module("~/lib/notifications", () => ({
  notifyUserOfBblJoinLegacy: async () => {},
  notifyAdminOfBblJoinLegacy: async () => {},
  notifyMemberOfBblClaimYourProfile: async () => {},
  notifyUserOfBblFreeSignup: async () => {},
  notifyFounderOfTheLongRoad: async () => {},
}))

mock.module("~/server/web/lineage/mint-claim-magic-link", () => ({
  claimAcceptNextPath: (nodeId: string) => `/lineage/claim/accept?node=${nodeId}`,
  FREE_SIGNUP_NEXT_PATH: "/me",
  mintClaimMagicLink: async () =>
    "https://blackbeltlegacy.com/api/auth/magic-link/verify?token=stub&callbackURL=stub",
}))

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test"

import { createJoinLegacyInterest } from "~/server/web/lead/public-actions"
import { SCHOOL_OUTREACH_KIND } from "~/server/web/school-lead/emit-school-lead"
import { db } from "~/services/db"

const TEST_BRAND = "BBL" as const
const TS = Date.now()
const PREFIX = `session-0478-jli-school-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`

beforeAll(async () => {
  await db.organization.create({
    data: {
      brand: TEST_BRAND,
      name: tag("org"),
      slug: tag("org"),
    },
  })
})

afterAll(async () => {
  setTestSession(null)

  await db.tool.deleteMany({ where: { submitterEmail: { contains: PREFIX } } })
  await db.lead.deleteMany({
    where: {
      OR: [
        { email: { contains: PREFIX } },
        { firstName: { startsWith: PREFIX } },
        { organization: { slug: { startsWith: PREFIX } } },
      ],
    },
  })
  await db.organization.deleteMany({ where: { slug: { startsWith: PREFIX } } })
})

let ipSeq = 0
beforeEach(() => {
  setTestSession(null)
  ipSeq += 1
  safeActionEnv.setIp(`jli-school-${TS}-${ipSeq}`)
})

describe("createJoinLegacyInterest — custom school flywheel", () => {
  it("emits one school-outreach lead and bumps demand on repeated custom school entries", async () => {
    const schoolName = tag("custom-school-flywheel")

    const first = await createJoinLegacyInterest({
      firstName: "Test",
      lastName: "custom-school-one",
      email: `${tag("custom-school-one")}@test.local`,
      role: "STUDENT",
      membershipPath: "FREE",
      schoolName,
    })
    const second = await createJoinLegacyInterest({
      firstName: "Test",
      lastName: "custom-school-two",
      email: `${tag("custom-school-two")}@test.local`,
      role: "STUDENT",
      membershipPath: "FREE",
      schoolName: `${schoolName}!!!`,
    })

    expect(first?.serverError).toBeUndefined()
    expect(second?.serverError).toBeUndefined()

    const outreachOrg = await db.organization.findFirst({
      where: { brand: TEST_BRAND, name: schoolName },
      select: { id: true, ownerId: true },
    })
    expect(outreachOrg).not.toBeNull()
    expect(outreachOrg?.ownerId).toBeNull()

    const outreachLeads = await db.lead.findMany({
      where: {
        organizationId: outreachOrg!.id,
        meta: { path: ["kind"], equals: SCHOOL_OUTREACH_KIND },
      },
      include: { followUps: true },
    })

    expect(outreachLeads).toHaveLength(1)
    expect(outreachLeads[0]?.followUps).toHaveLength(1)
    expect(outreachLeads[0]?.followUps[0]?.channel).toBe("email")
    expect(outreachLeads[0]?.followUps[0]?.completedAt).toBeNull()

    const meta = outreachLeads[0]?.meta as Record<string, unknown>
    expect(meta.demandCount).toBe(2)
    expect(meta.schoolName).toBe(`${schoolName}!!!`)
    expect(meta.memberEmails).toEqual([
      `${tag("custom-school-two")}@test.local`,
      `${tag("custom-school-one")}@test.local`,
    ])
  })
})
