"use server"

import type { Brand } from "~/.generated/prisma/client"
import { getRequestBrand } from "~/lib/brand-context"
import { isRateLimited } from "~/lib/rate-limiter"
import { userActionClient } from "~/lib/safe-actions"
import { COURSE_ENROLLMENT_ERROR } from "~/server/web/course-enrollment/errors"
import {
  enrollInCourseSchema,
  markItemCompleteSchema,
  markItemIncompleteSchema,
  unenrollFromCourseSchema,
} from "~/server/web/course-enrollment/schemas"
import { db } from "~/services/db"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const assertCourseExists = async (courseId: string, brand: Brand) => {
  const course = await db.course.findFirst({
    where: { id: courseId, brand, isPublished: true },
    select: { id: true, organizationId: true, disciplineId: true, slug: true },
  })

  if (!course) {
    throw new Error(COURSE_ENROLLMENT_ERROR.COURSE_NOT_FOUND)
  }

  return course
}

/**
 * Check that the user has access to enroll: either an active COURSE_ACCESS
 * entitlement for the brand OR an active membership in the course's org.
 */
const assertUserCanEnroll = async (userId: string, brand: Brand, organizationId: string) => {
  const [entitlement, membership] = await Promise.all([
    db.userEntitlement.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        entitlement: { key: "COURSE_ACCESS", brand },
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
      },
      select: { id: true },
    }),
    db.membership.findFirst({
      where: {
        brand,
        organizationId,
        userId,
        status: "ACTIVE",
      },
      select: { id: true },
    }),
  ])

  if (!entitlement && !membership) {
    throw new Error(COURSE_ENROLLMENT_ERROR.NO_ACTIVE_MEMBERSHIP)
  }
}

// ---------------------------------------------------------------------------
// Actions — CourseEnrollment
// ---------------------------------------------------------------------------

/**
 * Enroll the authenticated user in a published course.
 * Requires an active membership in the course's organization.
 */
export const enrollInCourse = userActionClient
  .schema(enrollInCourseSchema)
  .action(async ({ ctx, parsedInput: { courseId } }) => {
    const brand = await getRequestBrand()

    if (await isRateLimited(ctx.user.id, "enrollment_write")) {
      throw new Error(COURSE_ENROLLMENT_ERROR.RATE_LIMITED)
    }

    const course = await assertCourseExists(courseId, brand)
    await assertUserCanEnroll(ctx.user.id, brand, course.organizationId)

    // Check for existing enrollment
    const existing = await db.courseEnrollment.findUnique({
      where: { userId_courseId: { userId: ctx.user.id, courseId } },
      select: { id: true },
    })

    if (existing) {
      throw new Error(COURSE_ENROLLMENT_ERROR.ALREADY_ENROLLED)
    }

    const enrollment = await db.courseEnrollment.create({
      data: {
        userId: ctx.user.id,
        courseId,
      },
      select: { id: true, enrolledAt: true },
    })

    ctx.revalidate({
      paths: ["/courses", `/courses/${course.slug}`],
      tags: ["courses", `course-${course.slug}`],
    })

    return { enrollment }
  })

/**
 * Unenroll the authenticated user from a course.
 * Deletes the enrollment and all associated completions (cascade).
 */
export const unenrollFromCourse = userActionClient
  .schema(unenrollFromCourseSchema)
  .action(async ({ ctx, parsedInput: { enrollmentId } }) => {
    const brand = await getRequestBrand()

    if (await isRateLimited(ctx.user.id, "enrollment_write")) {
      throw new Error(COURSE_ENROLLMENT_ERROR.RATE_LIMITED)
    }

    const enrollment = await db.courseEnrollment.findFirst({
      where: { id: enrollmentId, userId: ctx.user.id, course: { brand } },
      select: { id: true, course: { select: { slug: true } } },
    })

    if (!enrollment) {
      throw new Error(COURSE_ENROLLMENT_ERROR.ENROLLMENT_NOT_FOUND)
    }

    await db.courseEnrollment.delete({ where: { id: enrollmentId } })

    ctx.revalidate({
      paths: ["/courses", `/courses/${enrollment.course.slug}`],
      tags: ["courses", `course-${enrollment.course.slug}`],
    })

    return { success: true }
  })

// ---------------------------------------------------------------------------
// Actions — CurriculumItemCompletion
// ---------------------------------------------------------------------------

/**
 * Mark a curriculum item as complete for the authenticated user's enrollment.
 */
export const markItemComplete = userActionClient
  .schema(markItemCompleteSchema)
  .action(async ({ ctx, parsedInput: { enrollmentId, curriculumItemId, notes } }) => {
    const brand = await getRequestBrand()

    if (await isRateLimited(ctx.user.id, "enrollment_write")) {
      throw new Error(COURSE_ENROLLMENT_ERROR.RATE_LIMITED)
    }

    // Verify the enrollment belongs to this user
    const enrollment = await db.courseEnrollment.findFirst({
      where: { id: enrollmentId, userId: ctx.user.id, course: { brand } },
      select: { id: true, courseId: true, course: { select: { slug: true } } },
    })

    if (!enrollment) {
      throw new Error(COURSE_ENROLLMENT_ERROR.ENROLLMENT_NOT_FOUND)
    }

    // Verify the curriculum item belongs to the enrolled course
    const item = await db.curriculumItem.findFirst({
      where: { id: curriculumItemId, courseId: enrollment.courseId },
      select: { id: true },
    })

    if (!item) {
      throw new Error(COURSE_ENROLLMENT_ERROR.CURRICULUM_ITEM_NOT_FOUND)
    }

    // Check for existing completion
    const existing = await db.curriculumItemCompletion.findUnique({
      where: {
        enrollmentId_curriculumItemId: { enrollmentId, curriculumItemId },
      },
      select: { id: true },
    })

    if (existing) {
      throw new Error(COURSE_ENROLLMENT_ERROR.ALREADY_COMPLETED)
    }

    const completion = await db.curriculumItemCompletion.create({
      data: {
        enrollmentId,
        curriculumItemId,
        notes,
      },
      select: { id: true, completedAt: true },
    })

    // Check if all items in the course are now complete — mark enrollment completed
    const courseItemCount = await db.curriculumItem.count({
      where: { courseId: enrollment.courseId },
    })
    const completionCount = await db.curriculumItemCompletion.count({
      where: { enrollmentId },
    })

    if (completionCount >= courseItemCount) {
      await db.courseEnrollment.update({
        where: { id: enrollmentId },
        data: { completedAt: new Date() },
      })
    }

    ctx.revalidate({
      paths: [`/courses/${enrollment.course.slug}`],
      tags: [`course-${enrollment.course.slug}`],
    })

    return { completion, courseCompleted: completionCount >= courseItemCount }
  })

/**
 * Remove a curriculum item completion (mark as incomplete).
 * Also clears course completedAt if it was set.
 */
export const markItemIncomplete = userActionClient
  .schema(markItemIncompleteSchema)
  .action(async ({ ctx, parsedInput: { completionId } }) => {
    const brand = await getRequestBrand()

    if (await isRateLimited(ctx.user.id, "enrollment_write")) {
      throw new Error(COURSE_ENROLLMENT_ERROR.RATE_LIMITED)
    }

    const completion = await db.curriculumItemCompletion.findFirst({
      where: {
        id: completionId,
        enrollment: { userId: ctx.user.id, course: { brand } },
      },
      select: {
        id: true,
        enrollmentId: true,
        enrollment: { select: { course: { select: { slug: true } } } },
      },
    })

    if (!completion) {
      throw new Error(COURSE_ENROLLMENT_ERROR.COMPLETION_NOT_FOUND)
    }

    await db.$transaction([
      db.curriculumItemCompletion.delete({ where: { id: completionId } }),
      // Clear course completion since at least one item is now incomplete
      db.courseEnrollment.update({
        where: { id: completion.enrollmentId },
        data: { completedAt: null },
      }),
    ])

    ctx.revalidate({
      paths: [`/courses/${completion.enrollment.course.slug}`],
      tags: [`course-${completion.enrollment.course.slug}`],
    })

    return { success: true }
  })
