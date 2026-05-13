/**
 * SESSION_0156 TASK_02: course enrollment + curriculum completion error catalog.
 */
export const COURSE_ENROLLMENT_ERROR = {
  COURSE_NOT_FOUND: "Course not found for the active brand",
  ALREADY_ENROLLED: "User is already enrolled in this course",
  ENROLLMENT_NOT_FOUND: "Course enrollment not found",
  NOT_PUBLISHED: "Course is not published",
  NOT_AUTHORIZED: "You are not authorized to manage this enrollment",
  NO_ACTIVE_MEMBERSHIP: "User must have an active membership to enroll",
  CURRICULUM_ITEM_NOT_FOUND: "Curriculum item not found in this course",
  ALREADY_COMPLETED: "Curriculum item is already marked complete",
  COMPLETION_NOT_FOUND: "Curriculum item completion record not found",
  RATE_LIMITED: "Too many changes — try again shortly",
  UNEXPECTED_ERROR: "Something went wrong while saving",
} as const

export type CourseEnrollmentErrorCode =
  (typeof COURSE_ENROLLMENT_ERROR)[keyof typeof COURSE_ENROLLMENT_ERROR]
