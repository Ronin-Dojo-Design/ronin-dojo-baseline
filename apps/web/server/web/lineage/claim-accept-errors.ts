/**
 * Error messages for the BBL token-bound claim accept flow.
 *
 * Kept OUT of `claim-accept-actions.ts` because that file is `"use server"`, and a
 * `"use server"` module may only export async functions — exporting this object
 * from it fails `next build` ("a 'use server' file can only export async
 * functions, found object"). Same split as the admin path's `claim-review-errors.ts`.
 */
export const CLAIM_ACCEPT_ERROR = {
  NODE_NOT_CLAIMABLE: "This profile is not available to claim.",
  ALREADY_OWNED_BY_OTHER: "This profile has already been claimed by someone else.",
  CLAIMANT_HAS_NODE: "Your account already owns a different lineage profile.",
} as const
