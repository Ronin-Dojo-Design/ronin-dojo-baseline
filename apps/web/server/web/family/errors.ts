/**
 * SESSION_0033 TASK_02: family-group action error catalog.
 */
export const FAMILY_ERROR = {
  ORG_NOT_FOUND: "Organization not found for the active brand",
  FAMILY_GROUP_NOT_FOUND: "Family group not found for this organization",
  FAMILY_MEMBER_NOT_FOUND: "Family member not found for this organization",
  USER_NOT_ELIGIBLE: "Selected user is not an active member for this organization",
  NOT_AUTHORIZED: "You are not authorized to manage family groups for this organization",
  RATE_LIMITED: "Too many family changes - try again shortly",
  UNEXPECTED_ERROR: "Something went wrong while saving family group",
} as const

export type FamilyErrorCode = (typeof FAMILY_ERROR)[keyof typeof FAMILY_ERROR]
