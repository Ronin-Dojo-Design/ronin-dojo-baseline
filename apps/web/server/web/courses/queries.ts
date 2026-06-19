import { cacheLife, cacheTag } from "next/cache"
import type { Brand, Prisma } from "~/.generated/prisma/client"
import { parseSort } from "~/server/web/_shared/sortable"
import { courseManyPayload, courseOnePayload } from "~/server/web/courses/payloads"
import { db } from "~/services/db"

const SORTABLE_COURSE_COLUMNS = ["title"] as const

export const searchCourses = async (
  params: {
    q?: string
    discipline?: string
    sort?: string
    page?: number
    perPage?: number
  },
  brand: Brand,
) => {
  "use cache"

  cacheTag("courses")
  cacheLife("minutes")

  const { q, discipline, sort, page = 1, perPage = 12 } = params
  const skip = (page - 1) * perPage

  const { sortBy, sortOrder } = parseSort(sort, SORTABLE_COURSE_COLUMNS)

  const where: Prisma.CourseWhereInput = {
    brand,
    isPublished: true,
    ...(discipline && { discipline: { slug: discipline } }),
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ]
  }

  const [courses, total] = await db.$transaction([
    db.course.findMany({
      where,
      select: courseManyPayload,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { title: "asc" },
      take: perPage,
      skip,
    }),
    db.course.count({ where }),
  ])

  return { courses, total, page, perPage }
}

export const findCourseBySlug = async (slug: string, brand: Brand) => {
  "use cache"

  cacheTag(`course-${slug}`)
  cacheLife("minutes")

  return db.course.findFirst({
    where: { slug, brand, isPublished: true },
    select: courseOnePayload,
  })
}

/**
 * Find instructors for a course's organization.
 * Instructors = active members with the INSTRUCTOR role assignment.
 */
export const findCourseInstructors = async (organizationId: string, brand: Brand) => {
  "use cache"

  cacheTag("course-instructors")
  cacheLife("minutes")

  const rows = await db.membership.findMany({
    where: {
      brand,
      organizationId,
      status: "ACTIVE",
      roleAssignments: {
        some: {
          role: { code: "INSTRUCTOR" },
        },
      },
    },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          // Public instructor list prefers the promoted Passport avatar (SESSION_0326).
          passport: { select: { avatarUrl: true } },
        },
      },
      rank: { select: { id: true, name: true, colorHex: true, shortName: true } },
      discipline: { select: { id: true, name: true } },
      roleAssignments: {
        select: {
          role: { select: { code: true, displayTitle: true } },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
    take: 12,
  })

  // Resolve `passport.avatarUrl ?? user.image` at the read model so the page needs no change.
  return rows.map(({ user, ...rest }) => ({
    ...rest,
    user: {
      id: user.id,
      name: user.name,
      image: user.passport?.avatarUrl ?? user.image,
    },
  }))
}

export type CourseInstructor = Awaited<ReturnType<typeof findCourseInstructors>>[number]

/**
 * Find sibling courses in the same program(s) as the given course.
 * Excludes the current course.
 */
export const findProgramSiblingCourses = async (courseId: string, brand: Brand) => {
  "use cache"

  cacheTag("program-courses")
  cacheLife("minutes")

  // Find program IDs this course belongs to
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
    select: courseManyPayload,
    orderBy: { title: "asc" },
    take: 12,
  })

  return {
    programs: programLinks.map(l => l.program),
    courses: siblingCourses,
  }
}

/**
 * Find related courses: same discipline or org, excluding the current course
 * and any already-shown program siblings.
 */
export const findRelatedCourses = async ({
  courseId,
  brand,
  disciplineId,
  organizationId,
  excludeIds,
}: {
  courseId: string
  brand: Brand
  disciplineId: string | null
  organizationId: string
  excludeIds: string[]
}) => {
  "use cache"

  cacheTag("related-courses")
  cacheLife("minutes")

  const allExcluded = [courseId, ...excludeIds]

  return db.course.findMany({
    where: {
      brand,
      isPublished: true,
      id: { notIn: allExcluded },
      OR: [...(disciplineId ? [{ disciplineId }] : []), { organizationId }],
    },
    select: courseManyPayload,
    orderBy: { title: "asc" },
    take: 6,
  })
}
