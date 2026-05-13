import type { Brand } from "~/.generated/prisma/client"
import {
  courseEnrollmentPayload,
  curriculumItemCompletionPayload,
} from "~/server/web/course-enrollment/payloads"
import { db } from "~/services/db"

/**
 * Admin: list all enrollments for a course.
 * Brand-scoped through Course.brand.
 */
export const getCourseEnrollments = async ({
  brand,
  courseId,
}: {
  brand: Brand
  courseId: string
}) => {
  return db.courseEnrollment.findMany({
    where: {
      courseId,
      course: { brand },
    },
    select: courseEnrollmentPayload,
    orderBy: [{ enrolledAt: "asc" }],
  })
}

/**
 * Admin: get completion progress for a specific user's enrollment.
 * Returns all curriculum items with their completion status.
 */
export const getEnrollmentProgress = async ({
  brand,
  enrollmentId,
}: {
  brand: Brand
  enrollmentId: string
}) => {
  const enrollment = await db.courseEnrollment.findFirst({
    where: {
      id: enrollmentId,
      course: { brand },
    },
    select: {
      ...courseEnrollmentPayload,
      course: {
        select: {
          id: true,
          brand: true,
          title: true,
          slug: true,
          certificationType: true,
          organizationId: true,
          discipline: { select: { id: true, name: true, slug: true } },
          rank: { select: { id: true, name: true } },
          curriculumItems: {
            select: { id: true, title: true, order: true, notes: true },
            orderBy: { order: "asc" },
          },
        },
      },
      itemCompletions: {
        select: curriculumItemCompletionPayload,
        orderBy: { completedAt: "asc" },
      },
    },
  })

  return enrollment
}

/**
 * Admin: summary stats for a course's enrollments.
 */
export const getCourseEnrollmentStats = async ({
  brand,
  courseId,
}: {
  brand: Brand
  courseId: string
}) => {
  const [totalEnrolled, totalCompleted] = await db.$transaction([
    db.courseEnrollment.count({
      where: { courseId, course: { brand } },
    }),
    db.courseEnrollment.count({
      where: { courseId, course: { brand }, completedAt: { not: null } },
    }),
  ])

  return { totalEnrolled, totalCompleted }
}
