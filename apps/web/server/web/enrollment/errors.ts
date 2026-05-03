/**
 * SESSION_0033 TASK_01: enrollment/waitlist action error catalog.
 */
export const ENROLLMENT_ERROR = {
  PROGRAM_NOT_FOUND: "Program not found for the active brand",
  ENROLLMENT_NOT_FOUND: "Enrollment not found for the active brand",
  USER_NOT_ELIGIBLE: "Selected user is not an active member for this program",
  NOT_AUTHORIZED: "You are not authorized to manage enrollments for this organization",
  CAPACITY_FULL: "Program is at capacity and no waitlisted member can be promoted",
  WAITLIST_EMPTY: "No waitlisted enrollment is available for this program",
  RATE_LIMITED: "Too many enrollment changes - try again shortly",
  UNEXPECTED_ERROR: "Something went wrong while saving enrollment",
} as const

export type EnrollmentErrorCode = (typeof ENROLLMENT_ERROR)[keyof typeof ENROLLMENT_ERROR]
