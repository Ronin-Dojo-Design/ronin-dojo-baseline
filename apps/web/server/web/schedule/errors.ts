/**
 * Gate 8: action error catalog. Every thrown error in schedule actions is one
 * of these literals. Raw Prisma errors are caught and rethrown as
 * `SCHEDULE_UNEXPECTED_ERROR` so they never reach the client. Operator-friendly
 * messages are mapped at the form layer; clients see the literal.
 */
export const SCHEDULE_ERROR = {
  ORG_NOT_FOUND: "Organization not found for the active brand",
  PROGRAM_NOT_FOUND: "Program not found for this organization",
  SCHEDULE_NOT_FOUND: "Schedule not found for this organization",
  ASSIGNMENT_NOT_FOUND: "Instructor assignment not found",
  NOT_AUTHORIZED: "You are not authorized to manage schedules for this organization",
  DISCIPLINE_NOT_LINKED: "Selected discipline is not linked to this organization",
  INSTRUCTOR_NOT_ELIGIBLE: "Selected user is not an eligible instructor for this organization",
  RATE_LIMITED: "Too many schedule changes — try again shortly",
  UNEXPECTED_ERROR: "Something went wrong while saving the schedule",
} as const

export type ScheduleErrorCode = (typeof SCHEDULE_ERROR)[keyof typeof SCHEDULE_ERROR]
