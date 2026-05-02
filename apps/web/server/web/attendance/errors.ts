/**
 * SESSION_0032 gate 8: every thrown attendance action error is one of these
 * literals. Raw Prisma errors are caught and converted to UNEXPECTED_ERROR.
 */
export const ATTENDANCE_ERROR = {
  SESSION_NOT_FOUND: "Class session not found for the active brand",
  SESSION_NOT_OPEN: "Class session is not open for attendance",
  SESSION_TOO_FAR_IN_FUTURE: "Class session is too far in the future for check-in",
  ATTENDANCE_NOT_FOUND: "Attendance record not found for the active brand",
  USER_NOT_ELIGIBLE: "Selected user is not an active member for this class",
  CHECK_IN_ALREADY_RECORDED: "A check-in already exists for this attendance record",
  NOT_AUTHORIZED: "You are not authorized to manage attendance for this organization",
  RATE_LIMITED: "Too many attendance changes - try again shortly",
  UNEXPECTED_ERROR: "Something went wrong while saving attendance",
} as const

export type AttendanceErrorCode = (typeof ATTENDANCE_ERROR)[keyof typeof ATTENDANCE_ERROR]
