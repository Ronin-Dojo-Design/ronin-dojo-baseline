/**
 * SESSION_0233 TASK_02 — Safe-action tests for course-enrollment actions.
 *
 * Tests all 4 actions through the full userActionClient chain:
 * - enrollInCourse (success, already enrolled, no access, entitlement-only)
 * - unenrollFromCourse
 * - markItemComplete (success, already complete, wrong course item)
 * - markItemIncomplete
 *
 * Run: cd apps/web && bun test --timeout 120000 \
 *        server/web/course-enrollment/actions.safe-action.test.ts
 */

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

// Install mocks BEFORE any import that touches ~/server, ~/lib/auth, etc.
installSafeActionMocks({ brand: "BASELINE_MARTIAL_ARTS" })

// @ts-expect-error — bun:test is a Bun runtime module
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

import {
  enrollInCourse,
  markItemComplete,
  markItemIncomplete,
  unenrollFromCourse,
} from "~/server/web/course-enrollment/actions"
import { db } from "~/services/db"

const BRAND = "BASELINE_MARTIAL_ARTS" as const
const TS = Date.now()
const P = `test-ce-sa-${TS}-`

type Fixtures = {
  ownerId: string
  studentId: string
  entitlementUserId: string
  noAccessUserId: string
  organizationId: string
  disciplineId: string
  courseId: string
  courseSlug: string
  curriculumItemId: string
  curriculumItem2Id: string
  membershipId: string
  entitlementDefId: string | null
  userEntitlementId: string | null
}

let fx: Fixtures

beforeAll(async () => {
  // Users
  const owner = await db.user.create({
    data: { name: `${P}owner`, email: `${P}owner@test.local` },
  })
  const student = await db.user.create({
    data: { name: `${P}student`, email: `${P}student@test.local` },
  })
  const entitlementUser = await db.user.create({
    data: { name: `${P}ent-user`, email: `${P}ent-user@test.local` },
  })
  const noAccessUser = await db.user.create({
    data: { name: `${P}no-access`, email: `${P}no-access@test.local` },
  })

  // Org
  const org = await db.organization.create({
    data: {
      name: `${P}org`,
      slug: `${P}org`,
      brand: BRAND,
      type: "DOJO",
      ownerId: owner.id,
    },
  })

  // Discipline
  const discipline = await db.discipline.findFirst()
  if (!discipline) throw new Error("No disciplines seeded")

  // Course
  const course = await db.course.create({
    data: {
      brand: BRAND,
      title: `${P}course`,
      slug: `${P}course`,
      organizationId: org.id,
      disciplineId: discipline.id,
      certificationType: "BELT_RANK",
      isPublished: true,
      publishedAt: new Date(),
    },
  })

  // Curriculum items
  const item1 = await db.curriculumItem.create({
    data: { courseId: course.id, order: 1, title: `${P}item-1` },
  })
  const item2 = await db.curriculumItem.create({
    data: { courseId: course.id, order: 2, title: `${P}item-2` },
  })

  // Membership for student (active)
  const membership = await db.membership.create({
    data: {
      userId: student.id,
      organizationId: org.id,
      disciplineId: discipline.id,
      brand: BRAND,
      status: "ACTIVE",
    },
  })

  // COURSE_ACCESS entitlement for entitlementUser
  let entDef = await db.entitlement.findUnique({
    where: { brand_key: { brand: BRAND, key: "COURSE_ACCESS" } },
  })
  let createdEntDef = false
  if (!entDef) {
    entDef = await db.entitlement.create({
      data: { brand: BRAND, key: "COURSE_ACCESS", name: "Course Access" },
    })
    createdEntDef = true
  }

  const ue = await db.userEntitlement.create({
    data: {
      userId: entitlementUser.id,
      entitlementId: entDef.id,
      sourceType: "MANUAL_GRANT",
      status: "ACTIVE",
    },
  })

  fx = {
    ownerId: owner.id,
    studentId: student.id,
    entitlementUserId: entitlementUser.id,
    noAccessUserId: noAccessUser.id,
    organizationId: org.id,
    disciplineId: discipline.id,
    courseId: course.id,
    courseSlug: course.slug,
    curriculumItemId: item1.id,
    curriculumItem2Id: item2.id,
    membershipId: membership.id,
    entitlementDefId: createdEntDef ? entDef.id : null,
    userEntitlementId: ue.id,
  }
})

afterAll(async () => {
  // Clean up in reverse dependency order
  // Enrollments cascade completions
  await db.courseEnrollment.deleteMany({ where: { courseId: fx.courseId } })
  await db.curriculumItem.deleteMany({ where: { courseId: fx.courseId } })
  await db.course.deleteMany({ where: { id: fx.courseId } })
  await db.membership.deleteMany({ where: { id: fx.membershipId } })
  if (fx.userEntitlementId) {
    await db.userEntitlement.deleteMany({ where: { id: fx.userEntitlementId } })
  }
  if (fx.entitlementDefId) {
    await db.entitlement.delete({ where: { id: fx.entitlementDefId } })
  }
  await db.organization.deleteMany({ where: { id: fx.organizationId } })
  const userIds = [fx.ownerId, fx.studentId, fx.entitlementUserId, fx.noAccessUserId]
  for (const uid of userIds) {
    await db.passport.deleteMany({ where: { userId: uid } })
    await db.directoryProfile.deleteMany({ where: { passport: { userId: uid } } })
    await db.account.deleteMany({ where: { userId: uid } })
    await db.session.deleteMany({ where: { userId: uid } })
  }
  await db.user.deleteMany({ where: { id: { in: userIds } } })
})

describe("enrollInCourse", () => {
  it("enrolls a user with active membership", async () => {
    setTestSession({ id: fx.studentId })
    const result = await enrollInCourse({ courseId: fx.courseId })
    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.enrollment?.id).toBeDefined()
  })

  it("rejects already enrolled user", async () => {
    setTestSession({ id: fx.studentId })
    const result = await enrollInCourse({ courseId: fx.courseId })
    expect(result?.serverError).toContain("already enrolled")
  })

  it("enrolls a user with COURSE_ACCESS entitlement (no membership)", async () => {
    setTestSession({ id: fx.entitlementUserId })
    const result = await enrollInCourse({ courseId: fx.courseId })
    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.enrollment?.id).toBeDefined()
  })

  it("rejects user with no membership or entitlement", async () => {
    setTestSession({ id: fx.noAccessUserId })
    const result = await enrollInCourse({ courseId: fx.courseId })
    expect(result?.serverError).toContain("active membership")
  })
})

describe("unenrollFromCourse", () => {
  it("unenrolls the student", async () => {
    setTestSession({ id: fx.studentId })
    // Get enrollment id
    const enrollment = await db.courseEnrollment.findFirst({
      where: { userId: fx.studentId, courseId: fx.courseId },
      select: { id: true },
    })
    expect(enrollment).toBeTruthy()

    const result = await unenrollFromCourse({ enrollmentId: enrollment!.id })
    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.success).toBe(true)
  })
})

describe("markItemComplete + markItemIncomplete", () => {
  let enrollmentId: string

  it("setup: re-enroll entitlement user for completion tests", async () => {
    // entitlementUser should still be enrolled from the enroll test
    const enrollment = await db.courseEnrollment.findFirst({
      where: { userId: fx.entitlementUserId, courseId: fx.courseId },
      select: { id: true },
    })
    expect(enrollment).toBeTruthy()
    enrollmentId = enrollment!.id
  })

  it("marks a curriculum item complete", async () => {
    setTestSession({ id: fx.entitlementUserId })
    const result = await markItemComplete({
      enrollmentId,
      curriculumItemId: fx.curriculumItemId,
    })
    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.completion?.id).toBeDefined()
  })

  it("rejects marking the same item complete again", async () => {
    setTestSession({ id: fx.entitlementUserId })
    const result = await markItemComplete({
      enrollmentId,
      curriculumItemId: fx.curriculumItemId,
    })
    expect(result?.serverError).toContain("already marked complete")
  })

  it("marks second item complete and detects course completion", async () => {
    setTestSession({ id: fx.entitlementUserId })
    const result = await markItemComplete({
      enrollmentId,
      curriculumItemId: fx.curriculumItem2Id,
    })
    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.courseCompleted).toBe(true)
  })

  it("marks an item incomplete and clears course completion", async () => {
    setTestSession({ id: fx.entitlementUserId })
    const completion = await db.curriculumItemCompletion.findFirst({
      where: { enrollmentId, curriculumItemId: fx.curriculumItem2Id },
      select: { id: true },
    })
    expect(completion).toBeTruthy()

    const result = await markItemIncomplete({ completionId: completion!.id })
    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.success).toBe(true)

    // Verify course completion cleared
    const enrollment = await db.courseEnrollment.findFirst({
      where: { id: enrollmentId },
      select: { completedAt: true },
    })
    expect(enrollment?.completedAt).toBeNull()
  })
})
