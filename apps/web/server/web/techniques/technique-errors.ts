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
} as const
