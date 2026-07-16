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

// Avatar-projection fixtures (SESSION_0326): prefer Passport.avatarUrl over User.image.
const INSTRUCTOR_USER_IMG = "https://example.test/instructor-user.png"
const INSTRUCTOR_PASSPORT_AVATAR = "https://example.test/instructor-passport.png"
const INSTRUCTOR2_IMG = "https://example.test/instructor2-user.png"

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
  const rows = await db.membership.findMany({
    where: {
      brand,
      organizationId,
      status: "ACTIVE",
      roleAssignments: { some: { role: { code: "INSTRUCTOR" } } },
    },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          passport: { select: { avatarUrl: true } },
        },
      },
      rank: { select: { id: true, name: true } },
      discipline: { select: { id: true, name: true } },
      roleAssignments: { select: { role: { select: { code: true, displayTitle: true } } } },
    },
    orderBy: { joinedAt: "asc" },
    take: 12,
  })
  return rows.map(({ user, ...rest }) => ({
    ...rest,
    user: { id: user.id, name: user.name, image: user.passport?.avatarUrl ?? user.image },
  }))
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
let instructor2UserId: string
let instructor2MembershipId: string
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
    data: {
      name: `${P}instructor`,
      email: `${P}instructor@test.local`,
      image: INSTRUCTOR_USER_IMG,
    },
  })
  instructorUserId = instructorUser.id

  // Promote a Passport avatar for instructor 1 (prefer case).
  await db.passport.create({
    data: { userId: instructorUserId, avatarUrl: INSTRUCTOR_PASSPORT_AVATAR },
  })

  // Instructor 2 has only User.image, no promoted Passport avatar (fallback case).
  const instructor2User = await db.user.create({
    data: {
      name: `${P}instructor2`,
      email: `${P}instructor2@test.local`,
      image: INSTRUCTOR2_IMG,
    },
  })
  instructor2UserId = instructor2User.id

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

  // Instructor 2 membership + role assignment (fallback-avatar case)
  const instr2Membership = await db.membership.create({
    data: {
      userId: instructor2UserId,
      organizationId: orgId,
      disciplineId,
      brand: BRAND,
      status: "ACTIVE",
    },
  })
  instructor2MembershipId = instr2Membership.id

  await db.membershipRoleAssignment.create({
    data: { membershipId: instructor2MembershipId, roleId: instructorRoleId },
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
    where: {
      membershipId: { in: [instructorMembershipId, instructor2MembershipId, regularMembershipId] },
    },
  })
  await db.programCourse.deleteMany({ where: { programId } })
  await db.program.deleteMany({ where: { id: programId } })
  await db.course.deleteMany({ where: { id: { in: [courseAId, courseBId, courseCId] } } })
  await db.membership.deleteMany({
    where: { id: { in: [instructorMembershipId, instructor2MembershipId, regularMembershipId] } },
  })
  await db.organization.deleteMany({ where: { id: orgId } })
  for (const uid of [ownerId, instructorUserId, instructor2UserId]) {
    await db.passport.deleteMany({ where: { userId: uid } })
    await db.directoryProfile.deleteMany({ where: { passport: { userId: uid } } })
    await db.account.deleteMany({ where: { userId: uid } })
    await db.session.deleteMany({ where: { userId: uid } })
  }
  await db.user.deleteMany({
    where: { id: { in: [ownerId, instructorUserId, instructor2UserId] } },
  })
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

  it("prefers Passport.avatarUrl over User.image for the instructor avatar", async () => {
    const instructors = await findCourseInstructors(orgId, BRAND)
    const match = instructors.find(i => i.user.id === instructorUserId)
    expect(match).toBeDefined()
    expect(match!.user.image).toBe(INSTRUCTOR_PASSPORT_AVATAR)
  })

  it("falls back to User.image when the instructor has no promoted Passport avatar", async () => {
    const instructors = await findCourseInstructors(orgId, BRAND)
    const match = instructors.find(i => i.user.id === instructor2UserId)
    expect(match).toBeDefined()
    expect(match!.user.image).toBe(INSTRUCTOR2_IMG)
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
