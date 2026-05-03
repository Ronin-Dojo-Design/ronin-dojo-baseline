/**
 * SESSION_0033 TASK_03: lead/trial lifecycle action error catalog.
 */
export const LEAD_ERROR = {
  ORG_NOT_FOUND: "Organization not found for the active brand",
  PROGRAM_NOT_FOUND: "Program not found for the active brand",
  DISCIPLINE_NOT_LINKED: "Selected discipline is not linked to this organization",
  LEAD_NOT_FOUND: "Lead not found for the active brand",
  EMAIL_REQUIRED: "Lead email is required before conversion",
  INVALID_TRIAL_STATUS: "Lead is not in the required trial lifecycle state",
  NOT_AUTHORIZED: "You are not authorized to manage leads for this organization",
  WAIVER_NOT_FOUND: "One or more waivers are not active for this lead conversion",
  RATE_LIMITED: "Too many lead changes - try again shortly",
  TRIAL_RATE_LIMITED: "Too many trial booking changes - try again shortly",
  UNEXPECTED_ERROR: "Something went wrong while saving lead lifecycle",
} as const

export type LeadErrorCode = (typeof LEAD_ERROR)[keyof typeof LEAD_ERROR]
