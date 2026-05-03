/**
 * SESSION_0033 TASK_02: waiver signature action error catalog.
 */
export const WAIVER_ERROR = {
  ORG_NOT_FOUND: "Organization not found for the active brand",
  PROGRAM_NOT_FOUND: "Program not found for the active brand",
  WAIVER_NOT_FOUND: "Waiver not found for the active brand or program",
  SIGNATURE_NOT_FOUND: "Waiver signature not found for this organization",
  USER_NOT_ELIGIBLE: "Selected user is not an active member for this organization",
  NOT_AUTHORIZED: "You are not authorized to manage waiver signatures for this organization",
  GUARDIAN_NOT_AUTHORIZED: "Guardian authority was not found for this minor waiver signature",
  TARGET_NOT_MINOR: "Guardian signatures require a minor target with a recorded date of birth",
  RATE_LIMITED: "Too many waiver changes - try again shortly",
  UNEXPECTED_ERROR: "Something went wrong while saving waiver signature",
} as const

export type WaiverErrorCode = (typeof WAIVER_ERROR)[keyof typeof WAIVER_ERROR]
