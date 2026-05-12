/**
 * SESSION_0033 action-level proof for enrollment, family, waiver, and lead gates.
 *
 * Run: cd apps/web && bun test server/web/enrollment server/web/family server/web/waiver server/web/lead
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test"

const sessionUserState = { id: "", role: null as string | null }
const rateLimitState = { limited: false }
const requestBrand = "BASELINE_MARTIAL_ARTS"

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
    session: { id: "session-0033-actions-test-session" },
  }),
  auth: {},
}))

mock.module("~/lib/rate-limiter", () => ({
  isRateLimited: async () => rateLimitState.limited,
}))

import {
  enrollInProgram,
  promoteFromWaitlist,
  withdrawEnrollment,
} from "~/server/web/enrollment/actions"
import { ENROLLMENT_ERROR } from "~/server/web/enrollment/errors"
import { addFamilyMember, createFamilyGroup } from "~/server/web/family/actions"
import { bookTrial, completeTrial, convertLead, createLead } from "~/server/web/lead/actions"
import { LEAD_ERROR } from "~/server/web/lead/errors"
import { revokeWaiverSignature, signWaiver } from "~/server/web/waiver/actions"
import { WAIVER_ERROR } from "~/server/web/waiver/errors"
import { db } from "~/services/db"

const TS = Date.now()
const TAG_PREFIX = "session-0033-actions-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`

type Fixtures = {
  ownerId: string
  studentId: string
  guardianId: string
  childId: string
  outsiderId: string
  organizationId: string
  otherOrganizationId: string
  disciplineId: string
  programId: string
  waiverId: string
}

let fx: Fixtures

const todayUtc = () => {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

const minorDob = () => {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear() - 10, 0, 1))
}

beforeAll(async () => {
  const owner = await db.user.create({
    data: { name: tag("owner"), email: `${tag("owner")}@test.local` },
  })
  const student = await db.user.create({
    data: { name: tag("student"), email: `${tag("student")}@test.local` },
  })
  const guardian = await db.user.create({
    data: { name: tag("guardian"), email: `${tag("guardian")}@test.local` },
  })
  const child = await db.user.create({
    data: { name: tag("child"), email: `${tag("child")}@test.local` },
  })
  const outsider = await db.user.create({
    data: { name: tag("outsider"), email: `${tag("outsider")}@test.local` },
  })

  await db.passport.createMany({
    data: [
      { userId: owner.id, displayName: tag("owner") },
      { userId: student.id, displayName: tag("student") },
      { userId: guardian.id, displayName: tag("guardian") },
      { userId: child.id, displayName: tag("child"), dob: minorDob() },
      { userId: outsider.id, displayName: tag("outsider") },
    ],
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
      ownerId: owner.id,
    },
  })
  const otherOrganization = await db.organization.create({
    data: {
      brand: requestBrand,
      name: tag("other-org"),
      slug: tag("other-org"),
      type: "DOJO",
      ownerId: outsider.id,
    },
  })

  await db.organizationDiscipline.createMany({
    data: [
      { organizationId: organization.id, disciplineId: discipline.id },
      { organizationId: otherOrganization.id, disciplineId: discipline.id },
    ],
  })

  await db.membership.createMany({
    data: [
      {
        brand: requestBrand,
        userId: owner.id,
        organizationId: organization.id,
        disciplineId: discipline.id,
        status: "ACTIVE",
        joinedAt: todayUtc(),
      },
      {
        brand: requestBrand,
        userId: student.id,
        organizationId: organization.id,
        disciplineId: discipline.id,
        status: "ACTIVE",
        joinedAt: todayUtc(),
      },
      {
        brand: requestBrand,
        userId: guardian.id,
        organizationId: organization.id,
        disciplineId: discipline.id,
        status: "ACTIVE",
        joinedAt: todayUtc(),
      },
      {
        brand: requestBrand,
        userId: child.id,
        organizationId: organization.id,
        disciplineId: discipline.id,
        status: "ACTIVE",
        joinedAt: todayUtc(),
      },
      {
        brand: requestBrand,
        userId: outsider.id,
        organizationId: otherOrganization.id,
        disciplineId: discipline.id,
        status: "ACTIVE",
        joinedAt: todayUtc(),
      },
    ],
  })

  const program = await db.program.create({
    data: {
      brand: requestBrand,
      organizationId: organization.id,
      disciplineId: discipline.id,
      name: tag("program"),
      slug: tag("program"),
      status: "ACTIVE",
      maxEnrollment: 1,
    },
  })

  const waiver = await db.waiver.create({
    data: {
      brand: requestBrand,
      organizationId: organization.id,
      type: "LIABILITY",
      title: tag("waiver"),
      content: "Test waiver",
      programs: {
        create: {
          programId: program.id,
          required: true,
        },
      },
    },
  })

  fx = {
    ownerId: owner.id,
    studentId: student.id,
    guardianId: guardian.id,
    childId: child.id,
    outsiderId: outsider.id,
    organizationId: organization.id,
    otherOrganizationId: otherOrganization.id,
    disciplineId: discipline.id,
    programId: program.id,
    waiverId: waiver.id,
  }

  sessionUserState.id = owner.id
})

beforeEach(async () => {
  rateLimitState.limited = false
  sessionUserState.id = fx.ownerId
  sessionUserState.role = null

  await db.auditLog.deleteMany({ where: { organizationId: fx.organizationId } })
  await db.waiverSignature.deleteMany({ where: { waiverId: fx.waiverId } })
  await db.programEnrollment.deleteMany({ where: { programId: fx.programId } })
  await db.lead.deleteMany({ where: { organizationId: fx.organizationId } })
  await db.familyMember.deleteMany({
    where: { userId: { in: [fx.guardianId, fx.childId, fx.studentId] } },
  })
  await db.familyGroup.deleteMany({ where: { name: { startsWith: TAG_PREFIX } } })
})

afterAll(async () => {
  await db.auditLog.deleteMany({
    where: { organizationId: { in: [fx.organizationId, fx.otherOrganizationId] } },
  })
  await db.waiverSignature.deleteMany({ where: { waiverId: fx.waiverId } })
  await db.programEnrollment.deleteMany({ where: { programId: fx.programId } })
  await db.lead.deleteMany({ where: { organizationId: fx.organizationId } })
  await db.programWaiver.deleteMany({ where: { programId: fx.programId } })
  await db.waiver.deleteMany({ where: { id: fx.waiverId } })
  await db.familyMember.deleteMany({
    where: { userId: { in: [fx.guardianId, fx.childId, fx.studentId] } },
  })
  await db.familyGroup.deleteMany({ where: { name: { startsWith: TAG_PREFIX } } })
  await db.program.deleteMany({ where: { id: fx.programId } })
  await db.membership.deleteMany({
    where: { organizationId: { in: [fx.organizationId, fx.otherOrganizationId] } },
  })
  await db.organizationDiscipline.deleteMany({
    where: { organizationId: { in: [fx.organizationId, fx.otherOrganizationId] } },
  })
  await db.organization.deleteMany({
    where: { id: { in: [fx.organizationId, fx.otherOrganizationId] } },
  })
  await db.user.deleteMany({ where: { email: { startsWith: TAG_PREFIX } } })
  await db.discipline.deleteMany({ where: { id: fx.disciplineId } })

  await db.$disconnect()
})

describe("SESSION_0033 school-ops actions", () => {
  it("enrolls, waitlists, withdraws, and promotes with audit rows", async () => {
    const active = await enrollInProgram({ programId: fx.programId, userId: fx.studentId })
    expect(active?.serverError).toBeUndefined()
    expect(active?.data?.status).toBe("ACTIVE")

    const duplicateActive = await enrollInProgram({
      programId: fx.programId,
      userId: fx.studentId,
    })
    expect(duplicateActive?.serverError).toBeUndefined()
    expect(duplicateActive?.data?.id).toBe(active?.data?.id)
    expect(duplicateActive?.data?.status).toBe("ACTIVE")

    const waitlisted = await enrollInProgram({ programId: fx.programId, userId: fx.childId })
    expect(waitlisted?.serverError).toBeUndefined()
    expect(waitlisted?.data?.status).toBe("WAITLISTED")
    expect(waitlisted?.data?.waitlistPosition).toBe(1)

    const blockedPromote = await promoteFromWaitlist({ programId: fx.programId })
    expect(blockedPromote?.serverError).toBe(ENROLLMENT_ERROR.CAPACITY_FULL)

    const withdrawn = await withdrawEnrollment({ enrollmentId: active?.data?.id as string })
    expect(withdrawn?.serverError).toBeUndefined()
    expect(withdrawn?.data?.status).toBe("WITHDRAWN")

    const promoted = await promoteFromWaitlist({ programId: fx.programId })
    expect(promoted?.serverError).toBeUndefined()
    expect(promoted?.data?.userId).toBe(fx.childId)
    expect(promoted?.data?.status).toBe("ACTIVE")

    const audits = await db.auditLog.findMany({
      where: { organizationId: fx.organizationId, entityType: "Enrollment" },
    })
    expect(audits.map(row => row.action)).toContain("enrollment.promoted")
  })

  it("rejects enrollment when the actor cannot edit the scoped organization", async () => {
    sessionUserState.id = fx.outsiderId

    const result = await enrollInProgram({ programId: fx.programId, userId: fx.studentId })

    expect(result?.serverError).toBe(ENROLLMENT_ERROR.NOT_AUTHORIZED)
    expect(await db.programEnrollment.count({ where: { programId: fx.programId } })).toBe(0)
  })

  it("creates family links and allows a guardian to sign for a minor", async () => {
    const family = await createFamilyGroup({
      organizationId: fx.organizationId,
      primaryUserId: fx.guardianId,
      name: tag("family"),
    })
    expect(family?.serverError).toBeUndefined()
    const child = await addFamilyMember({
      organizationId: fx.organizationId,
      familyGroupId: family?.data?.id as string,
      userId: fx.childId,
      role: "CHILD",
    })
    expect(child?.serverError).toBeUndefined()

    sessionUserState.id = fx.guardianId
    const signature = await signWaiver({
      organizationId: fx.organizationId,
      programId: fx.programId,
      waiverId: fx.waiverId,
      signedOnBehalfId: fx.childId,
    })
    expect(signature?.serverError).toBeUndefined()
    expect(signature?.data?.signedOnBehalfId).toBe(fx.childId)

    sessionUserState.id = fx.ownerId
    const revoked = await revokeWaiverSignature({
      organizationId: fx.organizationId,
      signatureId: signature?.data?.id as string,
    })
    expect(revoked?.serverError).toBeUndefined()
    expect(await db.waiverSignature.count({ where: { waiverId: fx.waiverId } })).toBe(0)
  })

  it("fails closed when a non-guardian attempts a minor signature", async () => {
    sessionUserState.id = fx.studentId

    const signature = await signWaiver({
      organizationId: fx.organizationId,
      programId: fx.programId,
      waiverId: fx.waiverId,
      signedOnBehalfId: fx.childId,
    })

    expect(signature?.serverError).toBe(WAIVER_ERROR.GUARDIAN_NOT_AUTHORIZED)
  })

  it("runs Lead -> TrialBooked -> TrialCompleted -> Converted transactionally", async () => {
    const lead = await createLead({
      organizationId: fx.organizationId,
      programId: fx.programId,
      source: "WALK_IN",
      firstName: "Casey",
      lastName: "Trial",
      email: `${tag("converted")}@test.local`,
    })
    expect(lead?.serverError).toBeUndefined()

    const booked = await bookTrial({ leadId: lead?.data?.id as string })
    expect(booked?.serverError).toBeUndefined()
    expect(booked?.data?.status).toBe("TRIAL_BOOKED")

    const completed = await completeTrial({ leadId: lead?.data?.id as string })
    expect(completed?.serverError).toBeUndefined()
    expect(completed?.data?.status).toBe("TRIAL_COMPLETED")

    await db.programEnrollment.create({
      data: {
        userId: fx.studentId,
        programId: fx.programId,
        status: "ACTIVE",
      },
    })

    const converted = await convertLead({
      leadId: lead?.data?.id as string,
      waiverIds: [fx.waiverId],
    })
    expect(converted?.serverError).toBeUndefined()
    expect(converted?.data?.lead.status).toBe("CONVERTED")
    expect(converted?.data?.membershipId).toBeDefined()
    expect(converted?.data?.enrollmentId).toBeDefined()
    expect(converted?.data?.waiverSignatureIds).toHaveLength(1)
    const convertedEnrollment = await db.programEnrollment.findUnique({
      where: {
        userId_programId: {
          userId: converted?.data?.userId as string,
          programId: fx.programId,
        },
      },
    })
    expect(convertedEnrollment?.status).toBe("WAITLISTED")

    const audits = await db.auditLog.findMany({
      where: { organizationId: fx.organizationId, entityType: "Lead" },
    })
    expect(audits.map(row => row.action)).toContain("lead.converted")

    const rewound = await bookTrial({ leadId: lead?.data?.id as string })
    expect(rewound?.serverError).toBe(LEAD_ERROR.INVALID_TRIAL_STATUS)
  })

  it("does not overwrite an existing user's identity during lead conversion", async () => {
    const email = `${tag("existing-user")}@test.local`
    const existing = await db.user.create({
      data: { name: "Existing Identity", email },
    })
    await db.passport.create({
      data: {
        userId: existing.id,
        displayName: "Existing Passport",
        legalFirstName: "Existing",
      },
    })
    await db.directoryProfile.create({ data: { userId: existing.id } })

    const lead = await createLead({
      organizationId: fx.organizationId,
      programId: fx.programId,
      source: "WALK_IN",
      firstName: "Changed",
      lastName: "Lead",
      email,
    })
    await bookTrial({ leadId: lead?.data?.id as string })
    await completeTrial({ leadId: lead?.data?.id as string })
    const converted = await convertLead({ leadId: lead?.data?.id as string })

    expect(converted?.serverError).toBeUndefined()
    expect(converted?.data?.userId).toBe(existing.id)

    const unchanged = await db.user.findUnique({
      where: { id: existing.id },
      include: { passport: true },
    })
    expect(unchanged?.name).toBe("Existing Identity")
    expect(unchanged?.passport?.displayName).toBe("Existing Passport")
  })

  it("rate-limits lead creation before DB writes", async () => {
    rateLimitState.limited = true

    const result = await createLead({
      organizationId: fx.organizationId,
      firstName: "Limited",
      email: `${tag("limited")}@test.local`,
    })

    expect(result?.serverError).toBe(LEAD_ERROR.RATE_LIMITED)
    expect(await db.lead.count({ where: { email: `${tag("limited")}@test.local` } })).toBe(0)
  })
})
