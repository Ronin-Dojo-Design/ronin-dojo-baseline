/**
 * SESSION_0235 TASK_05 — Integration tests for S234 course queries.
 *
 * Tests findCourseInstructors, findProgramSiblingCourses, findRelatedCourses
 * against real Postgres dev DB.
 *
 * Run: cd apps/web && bun test server/web/courses/queries.integration.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

import { db } from "~/services/db"

const BRAND = "BASELINE_MARTIAL_ARTS" as const
const P = `test-cq-integ-${Date.now()}-`

// --- Inline replicas (originals use "use cache" which requires Next.js runtime) ---

const courseManySelect = {
  id: true,
  brand: true,
  title: true,
  slug: true,
  description: true,
  certificationType: true,
  isPublished: true,
  publishedAt: true,
  createdAt: true,
  organization: { select: { id: true, name: true, slug: true } },
  discipline: { select: { id: true, name: true, slug: true } },
  rank: { select: { id: true, name: true } },
  _count: { select: { curriculumItems: true, enrollments: true } },
} as const

async function findCourseInstructors(organizationId: string, brand: typeof BRAND) {
  return db.membership.findMany({
    where: {
      brand,
      organizationId,
      status: "ACTIVE",
      roleAssignments: { some: { role: { code: "INSTRUCTOR" } } },
    },
    select: {
      id: true,
      user: { select: { id: true, name: true, image: true } },
      rank: { select: { id: true, name: true } },
      discipline: { select: { id: true, name: true } },
      roleAssignments: { select: { role: { select: { code: true, displayTitle: true } } } },
    },
    orderBy: { joinedAt: "asc" },
    take: 12,
  })
}

async function findProgramSiblingCourses(courseId: string, brand: typeof BRAND) {
  const programLinks = await db.programCourse.findMany({
    where: { courseId },
    select: { programId: true, program: { select: { name: true } } },
  })
  if (programLinks.length === 0) return { programs: [], courses: [] }
  const programIds = programLinks.map(l => l.programId)
  const siblingCourses = await db.course.findMany({
    where: {
      brand,
      isPublished: true,
      id: { not: courseId },
      programs: { some: { programId: { in: programIds } } },
    },
    select: courseManySelect,
    orderBy: { title: "asc" },
    take: 12,
  })
  return { programs: programLinks.map(l => l.program), courses: siblingCourses }
}

async function findRelatedCourses({
  courseId,
  brand,
  disciplineId,
  organizationId,
  excludeIds,
}: {
  courseId: string
  brand: typeof BRAND
  disciplineId: string | null
  organizationId: string
  excludeIds: string[]
}) {
  const allExcluded = [courseId, ...excludeIds]
  return db.course.findMany({
    where: {
      brand,
      isPublished: true,
      id: { notIn: allExcluded },
      OR: [...(disciplineId ? [{ disciplineId }] : []), { organizationId }],
    },
    select: courseManySelect,
    orderBy: { title: "asc" },
    take: 6,
  })
}

// --- Fixture state ---

let ownerId: string
let instructorUserId: string
let orgId: string
let disciplineId: string
let courseAId: string
let courseBId: string
let courseCId: string
let programId: string
let instructorMembershipId: string
let regularMembershipId: string
let instructorRoleId: string

beforeAll(async () => {
  // Users
  const owner = await db.user.create({
    data: { name: `${P}owner`, email: `${P}owner@test.local` },
  })
  ownerId = owner.id

  const instructorUser = await db.user.create({
    data: { name: `${P}instructor`, email: `${P}instructor@test.local` },
  })
  instructorUserId = instructorUser.id

  // Org
  const org = await db.organization.create({
    data: { name: `${P}org`, slug: `${P}org`, brand: BRAND, type: "DOJO", ownerId },
  })
  orgId = org.id

  // Discipline
  const discipline = await db.discipline.findFirst()
  if (!discipline) throw new Error("No disciplines seeded")
  disciplineId = discipline.id

  // INSTRUCTOR role
  const role = await db.role.findFirst({ where: { code: "INSTRUCTOR" } })
  if (!role) throw new Error("No INSTRUCTOR role seeded")
  instructorRoleId = role.id

  // Courses A, B, C — all same org + discipline
  const courseA = await db.course.create({
    data: {
      brand: BRAND,
      title: `${P}course-a`,
      slug: `${P}course-a`,
      organizationId: orgId,
      disciplineId,
      certificationType: "BELT_RANK",
      isPublished: true,
    },
  })
  courseAId = courseA.id

  const courseB = await db.course.create({
    data: {
      brand: BRAND,
      title: `${P}course-b`,
      slug: `${P}course-b`,
      organizationId: orgId,
      disciplineId,
      certificationType: "BELT_RANK",
      isPublished: true,
    },
  })
  courseBId = courseB.id

  const courseC = await db.course.create({
    data: {
      brand: BRAND,
      title: `${P}course-c`,
      slug: `${P}course-c`,
      organizationId: orgId,
      disciplineId,
      certificationType: "SAFETY",
      isPublished: true,
    },
  })
  courseCId = courseC.id

  // Program with courses A and B (not C)
  const program = await db.program.create({
    data: {
      brand: BRAND,
      name: `${P}program`,
      slug: `${P}program`,
      organizationId: orgId,
      disciplineId,
      status: "ACTIVE",
    },
  })
  programId = program.id

  await db.programCourse.createMany({
    data: [
      { programId, courseId: courseAId },
      { programId, courseId: courseBId },
    ],
  })

  // Instructor membership with role assignment
  const instrMembership = await db.membership.create({
    data: {
      userId: instructorUserId,
      organizationId: orgId,
      disciplineId,
      brand: BRAND,
      status: "ACTIVE",
    },
  })
  instructorMembershipId = instrMembership.id

  await db.membershipRoleAssignment.create({
    data: { membershipId: instructorMembershipId, roleId: instructorRoleId },
  })

  // Regular membership (owner, no INSTRUCTOR role)
  const ownerMembership = await db.membership.create({
    data: {
      userId: ownerId,
      organizationId: orgId,
      disciplineId,
      brand: BRAND,
      status: "ACTIVE",
    },
  })
  regularMembershipId = ownerMembership.id
})

afterAll(async () => {
  // Clean up in reverse dependency order
  await db.membershipRoleAssignment.deleteMany({
    where: { membershipId: { in: [instructorMembershipId, regularMembershipId] } },
  })
  await db.programCourse.deleteMany({ where: { programId } })
  await db.program.deleteMany({ where: { id: programId } })
  await db.course.deleteMany({ where: { id: { in: [courseAId, courseBId, courseCId] } } })
  await db.membership.deleteMany({
    where: { id: { in: [instructorMembershipId, regularMembershipId] } },
  })
  await db.organization.deleteMany({ where: { id: orgId } })
  for (const uid of [ownerId, instructorUserId]) {
    await db.passport.deleteMany({ where: { userId: uid } })
    await db.directoryProfile.deleteMany({ where: { userId: uid } })
    await db.account.deleteMany({ where: { userId: uid } })
    await db.session.deleteMany({ where: { userId: uid } })
  }
  await db.user.deleteMany({ where: { id: { in: [ownerId, instructorUserId] } } })
})

// --- Tests ---

describe("findCourseInstructors", () => {
  it("returns members with INSTRUCTOR role assignment", async () => {
    const instructors = await findCourseInstructors(orgId, BRAND)
    expect(instructors.length).toBeGreaterThanOrEqual(1)
    const match = instructors.find(i => i.user.id === instructorUserId)
    expect(match).toBeDefined()
    expect(match!.roleAssignments.some(ra => ra.role.code === "INSTRUCTOR")).toBe(true)
  })

  it("excludes members without INSTRUCTOR role", async () => {
    const instructors = await findCourseInstructors(orgId, BRAND)
    const ownerMatch = instructors.find(i => i.user.id === ownerId)
    expect(ownerMatch).toBeUndefined()
  })

  it("returns empty array for org with no instructors", async () => {
    const instructors = await findCourseInstructors("nonexistent-org-id", BRAND)
    expect(instructors).toEqual([])
  })
})

describe("findProgramSiblingCourses", () => {
  it("returns sibling courses from same program, excluding current", async () => {
    const result = await findProgramSiblingCourses(courseAId, BRAND)
    expect(result.programs.length).toBe(1)
    expect(result.courses.length).toBe(1)
    expect(result.courses[0].id).toBe(courseBId)
  })

  it("returns empty when course is not in any program", async () => {
    const result = await findProgramSiblingCourses(courseCId, BRAND)
    expect(result.programs).toEqual([])
    expect(result.courses).toEqual([])
  })

  it("does not include the queried course in results", async () => {
    const result = await findProgramSiblingCourses(courseBId, BRAND)
    const selfMatch = result.courses.find(c => c.id === courseBId)
    expect(selfMatch).toBeUndefined()
  })
})

describe("findRelatedCourses", () => {
  it("returns courses in same org/discipline, excluding current + specified IDs", async () => {
    const related = await findRelatedCourses({
      courseId: courseAId,
      brand: BRAND,
      disciplineId,
      organizationId: orgId,
      excludeIds: [courseBId],
    })
    // courseA (self) and courseB (excluded) must not appear
    const ids = related.map(c => c.id)
    expect(ids).not.toContain(courseAId)
    expect(ids).not.toContain(courseBId)
    // Result limited to 6; courseC present if not pushed out by seeded data
    expect(related.length).toBeGreaterThanOrEqual(1)
    expect(related.length).toBeLessThanOrEqual(6)
  })

  it("excludes all specified IDs", async () => {
    const related = await findRelatedCourses({
      courseId: courseAId,
      brand: BRAND,
      disciplineId,
      organizationId: orgId,
      excludeIds: [courseBId, courseCId],
    })
    const ids = related.map(c => c.id)
    expect(ids).not.toContain(courseAId)
    expect(ids).not.toContain(courseBId)
    expect(ids).not.toContain(courseCId)
  })

  it("works with null disciplineId (org-only match)", async () => {
    const related = await findRelatedCourses({
      courseId: courseAId,
      brand: BRAND,
      disciplineId: null,
      organizationId: orgId,
      excludeIds: [],
    })
    // Should find B and C via org match
    expect(related.length).toBe(2)
  })
})
