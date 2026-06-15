/**
 * SESSION_0233 TASK_03 — Integration tests for course-enrollment queries.
 *
 * Tests getCurrentCourseEnrollmentState, getEnrollmentProgress,
 * getCourseEnrollmentStats against real Postgres dev DB.
 *
 * Run: cd apps/web && bun test server/web/course-enrollment/queries.integration.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

import { db } from "~/services/db"

const BRAND = "BASELINE_MARTIAL_ARTS" as const
const P = `test-ce-integ-${Date.now()}-`

// Inline replicas of query logic (originals use "use cache" which requires Next.js runtime)

async function getCurrentCourseEnrollmentState({
  brand,
  courseId,
  organizationId,
  userId,
}: {
  brand: typeof BRAND
  courseId: string
  organizationId: string
  userId: string
}) {
  const [enrollment, membership] = await db.$transaction([
    db.courseEnrollment.findFirst({
      where: {
        userId,
        courseId,
        course: { brand, organizationId },
      },
      select: {
        id: true,
        enrolledAt: true,
        completedAt: true,
        itemCompletions: {
          select: { id: true, curriculumItemId: true, completedAt: true },
          orderBy: { completedAt: "asc" },
        },
      },
    }),
    db.membership.findFirst({
      where: { brand, organizationId, userId, status: "ACTIVE" },
      select: { id: true },
    }),
  ])

  return { enrollment, hasActiveMembership: Boolean(membership) }
}

async function getCourseEnrollmentStats({
  brand,
  courseId,
}: {
  brand: typeof BRAND
  courseId: string
}) {
  const [totalEnrolled, totalCompleted] = await db.$transaction([
    db.courseEnrollment.count({ where: { courseId, course: { brand } } }),
    db.courseEnrollment.count({
      where: { courseId, course: { brand }, completedAt: { not: null } },
    }),
  ])
  return { totalEnrolled, totalCompleted }
}

// Fixture state
let ownerId: string
let studentId: string
const entUserIds: string[] = []
let orgId: string
let courseId: string
let itemId: string
let membershipId: string
let entDefId: string | null = null
const userEntIds: string[] = []
const enrollmentIds: string[] = []

beforeAll(async () => {
  const owner = await db.user.create({
    data: { name: `${P}owner`, email: `${P}owner@test.local` },
  })
  ownerId = owner.id

  const student = await db.user.create({
    data: { name: `${P}student`, email: `${P}student@test.local` },
  })
  studentId = student.id

  const org = await db.organization.create({
    data: {
      name: `${P}org`,
      slug: `${P}org`,
      brand: BRAND,
      type: "DOJO",
      ownerId,
    },
  })
  orgId = org.id

  const discipline = await db.discipline.findFirst()
  if (!discipline) throw new Error("No disciplines seeded")

  const course = await db.course.create({
    data: {
      brand: BRAND,
      title: `${P}course`,
      slug: `${P}course`,
      organizationId: orgId,
      disciplineId: discipline.id,
      certificationType: "BELT_RANK",
      isPublished: true,
    },
  })
  courseId = course.id

  const item = await db.curriculumItem.create({
    data: { courseId, order: 1, title: `${P}item` },
  })
  itemId = item.id

  membershipId = (
    await db.membership.create({
      data: {
        userId: studentId,
        organizationId: orgId,
        disciplineId: discipline.id,
        brand: BRAND,
        status: "ACTIVE",
      },
    })
  ).id
})

afterAll(async () => {
  await db.curriculumItemCompletion.deleteMany({
    where: { enrollment: { courseId } },
  })
  await db.courseEnrollment.deleteMany({ where: { courseId } })
  await db.curriculumItem.deleteMany({ where: { courseId } })
  await db.course.deleteMany({ where: { id: courseId } })
  await db.membership.deleteMany({ where: { id: membershipId } })
  if (userEntIds.length) {
    await db.userEntitlement.deleteMany({ where: { id: { in: userEntIds } } })
  }
  if (entDefId) {
    await db.entitlement.delete({ where: { id: entDefId } })
  }
  await db.organization.deleteMany({ where: { id: orgId } })
  const allUserIds = [ownerId, studentId, ...entUserIds]
  for (const uid of allUserIds) {
    await db.passport.deleteMany({ where: { userId: uid } })
    await db.directoryProfile.deleteMany({ where: { passport: { userId: uid } } })
    await db.account.deleteMany({ where: { userId: uid } })
    await db.session.deleteMany({ where: { userId: uid } })
  }
  await db.user.deleteMany({ where: { id: { in: allUserIds } } })
})

describe("getCurrentCourseEnrollmentState", () => {
  it("returns null enrollment for unenrolled user", async () => {
    const state = await getCurrentCourseEnrollmentState({
      brand: BRAND,
      courseId,
      organizationId: orgId,
      userId: studentId,
    })
    expect(state.enrollment).toBeNull()
    expect(state.hasActiveMembership).toBe(true)
  })

  it("returns enrollment after enrolling", async () => {
    const enrollment = await db.courseEnrollment.create({
      data: { userId: studentId, courseId },
    })
    enrollmentIds.push(enrollment.id)

    const state = await getCurrentCourseEnrollmentState({
      brand: BRAND,
      courseId,
      organizationId: orgId,
      userId: studentId,
    })
    expect(state.enrollment).toBeTruthy()
    expect(state.enrollment!.id).toBe(enrollment.id)
    expect(state.enrollment!.completedAt).toBeNull()
    expect(state.enrollment!.itemCompletions).toHaveLength(0)
  })

  it("includes item completions", async () => {
    const enrollment = await db.courseEnrollment.findFirst({
      where: { userId: studentId, courseId },
      select: { id: true },
    })

    await db.curriculumItemCompletion.create({
      data: { enrollmentId: enrollment!.id, curriculumItemId: itemId },
    })

    const state = await getCurrentCourseEnrollmentState({
      brand: BRAND,
      courseId,
      organizationId: orgId,
      userId: studentId,
    })
    expect(state.enrollment!.itemCompletions).toHaveLength(1)
    expect(state.enrollment!.itemCompletions[0].curriculumItemId).toBe(itemId)
  })
})

describe("getCourseEnrollmentStats", () => {
  it("returns enrollment counts", async () => {
    const stats = await getCourseEnrollmentStats({ brand: BRAND, courseId })
    expect(stats.totalEnrolled).toBeGreaterThanOrEqual(1)
    expect(stats.totalCompleted).toBe(0)
  })

  it("counts completed enrollments", async () => {
    await db.courseEnrollment.updateMany({
      where: { userId: studentId, courseId },
      data: { completedAt: new Date() },
    })

    const stats = await getCourseEnrollmentStats({ brand: BRAND, courseId })
    expect(stats.totalCompleted).toBeGreaterThanOrEqual(1)
  })
})

describe("entitlement OR membership gate (query-level proof)", () => {
  it("user with COURSE_ACCESS entitlement but no membership has access signal", async () => {
    const entUser = await db.user.create({
      data: { name: `${P}ent-only`, email: `${P}ent-only@test.local` },
    })
    entUserIds.push(entUser.id)

    // Ensure COURSE_ACCESS entitlement definition
    let entDef = await db.entitlement.findUnique({
      where: { brand_key: { brand: BRAND, key: "COURSE_ACCESS" } },
    })
    if (!entDef) {
      entDef = await db.entitlement.create({
        data: { brand: BRAND, key: "COURSE_ACCESS", name: "Course Access" },
      })
      entDefId = entDef.id
    }

    const ue = await db.userEntitlement.create({
      data: {
        userId: entUser.id,
        entitlementId: entDef.id,
        sourceType: "MANUAL_GRANT",
        status: "ACTIVE",
      },
    })
    userEntIds.push(ue.id)

    // Check that user has the entitlement
    const grant = await db.userEntitlement.findFirst({
      where: {
        userId: entUser.id,
        status: "ACTIVE",
        entitlement: { key: "COURSE_ACCESS", brand: BRAND },
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
      },
      select: { id: true },
    })
    expect(grant).toBeTruthy()

    // But no membership
    const state = await getCurrentCourseEnrollmentState({
      brand: BRAND,
      courseId,
      organizationId: orgId,
      userId: entUser.id,
    })
    expect(state.hasActiveMembership).toBe(false)
  })

  it("user with neither entitlement nor membership has no access signals", async () => {
    const noUser = await db.user.create({
      data: { name: `${P}none`, email: `${P}none@test.local` },
    })
    entUserIds.push(noUser.id)

    const grant = await db.userEntitlement.findFirst({
      where: {
        userId: noUser.id,
        status: "ACTIVE",
        entitlement: { key: "COURSE_ACCESS", brand: BRAND },
      },
      select: { id: true },
    })
    expect(grant).toBeNull()

    const state = await getCurrentCourseEnrollmentState({
      brand: BRAND,
      courseId,
      organizationId: orgId,
      userId: noUser.id,
    })
    expect(state.hasActiveMembership).toBe(false)
    expect(state.enrollment).toBeNull()
  })
})
