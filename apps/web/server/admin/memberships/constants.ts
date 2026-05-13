/**
 * @added   SESSION_0148 (2026-05-12), extracted SESSION_0149
 * @why     Shared constants used by both server actions and client components
 */

/**
 * Valid membership status transitions (state machine).
 * Terminal states (CANCELLED, EXPIRED) have no outbound transitions.
 */
export const VALID_TRANSITIONS: Record<string, string[]> = {
  INVITED: ["PENDING", "CANCELLED"],
  PENDING: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["SUSPENDED", "CANCELLED", "EXPIRED"],
  SUSPENDED: ["ACTIVE", "CANCELLED"],
  CANCELLED: [],
  EXPIRED: [],
}
