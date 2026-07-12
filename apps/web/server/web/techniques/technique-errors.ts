/**
 * Canonical error strings for the technique authoring pipeline (ADR 0046). Thrown by the
 * apply-helpers (`apply-technique.ts`) and surfaced verbatim through the safe-action handler.
 */
export const TECHNIQUE_ERROR = {
  CREATE_ACCESS_REQUIRED: "You are not authorized to author techniques.",
  EDIT_ACCESS_REQUIRED: "You are not authorized to edit this technique.",
  ORGANIZATION_REQUIRED: "An organization is required to create an org-library technique.",
  ORG_AUTHOR_REQUIRED: "You are not authorized to create techniques for this organization.",
  PASSPORT_REQUIRED: "An identity Passport is required to author a technique.",
  // SESSION_0529 Slice 3B — the friendly face of a P2002 on the authored partial unique index
  // (`Technique_authored_slug_key`: one (brand, authorPassportId, slug) per author). Caught LOCALLY
  // in the authored create path; the generic `lib/safe-actions.ts` P2002 mapping stays untouched.
  AUTHORED_SLUG_TAKEN: "You already have a technique with this name — pick a different one.",
} as const
