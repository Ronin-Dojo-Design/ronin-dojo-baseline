import { z } from "zod"

/**
 * Zod schemas for the generic member/org profile-claim flow (SESSION_0354).
 *
 * A claim applies to one of two "unclaimed" subjects:
 * - PERSON: a DirectoryProfile whose User is a legacy placeholder
 *   (`User.isPlaceholder = true`, no real login account).
 * - ORGANIZATION: an owner-less Organization (`ownerId = null`).
 *
 * Mirrors `server/web/lineage/claim-schemas.ts`.
 */

const profileClaimSubjectType = z.enum(["PERSON", "ORGANIZATION"])

const profileClaimRelationship = z.enum([
  "SELF",
  "STAFF",
  "OWNER",
  "REPRESENTATIVE",
  "FAMILY",
  "OTHER",
])

export const submitProfileClaimSchema = z.object({
  subjectType: profileClaimSubjectType,
  /** DirectoryProfile id (PERSON) or Organization id (ORGANIZATION). */
  subjectId: z.string().cuid(),
  relationship: profileClaimRelationship,
  claimantNote: z.string().max(2000).optional(),
})
