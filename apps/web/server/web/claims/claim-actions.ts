"use server"

import { getRequestBrand } from "~/lib/brand-context"
import { userActionClient } from "~/lib/safe-actions"
import { submitProfileClaimSchema } from "~/server/web/claims/claim-schemas"

/**
 * Generic member/org profile-claim server action (SESSION_0354).
 *
 * Mirrors `server/web/lineage/claim-actions.ts`: a logged-in user submits a
 * claim request that an admin reviews. Only legitimately-unclaimed subjects are
 * claimable — owner-less Organizations and placeholder-User DirectoryProfiles.
 */

const PROFILE_CLAIM_ERROR = {
  SUBJECT_NOT_FOUND: "That profile no longer exists or is not in this brand.",
  ORG_ALREADY_OWNED: "This organization already has an owner and cannot be claimed.",
  PERSON_NOT_CLAIMABLE: "This profile belongs to an active account and cannot be claimed.",
  DUPLICATE_CLAIM: "You already have a pending or approved claim on this profile.",
} as const

export const submitProfileClaimRequest = userActionClient
  .inputSchema(submitProfileClaimSchema)
  .action(async ({ parsedInput, ctx: { user, db } }) => {
    const brand = await getRequestBrand()
    const { subjectType, subjectId, relationship, claimantNote } = parsedInput

    if (subjectType === "ORGANIZATION") {
      const org = await db.organization.findFirst({
        where: { id: subjectId, brand },
        select: { id: true, ownerId: true },
      })

      if (!org) throw new Error(PROFILE_CLAIM_ERROR.SUBJECT_NOT_FOUND)
      if (org.ownerId) throw new Error(PROFILE_CLAIM_ERROR.ORG_ALREADY_OWNED)
    } else {
      // PERSON: a DirectoryProfile whose Passport has no attached account (accountless = claimable).
      const profile = await db.directoryProfile.findFirst({
        where: { id: subjectId },
        select: { id: true, passport: { select: { userId: true } } },
      })

      if (!profile) throw new Error(PROFILE_CLAIM_ERROR.SUBJECT_NOT_FOUND)
      if (profile.passport.userId != null) throw new Error(PROFILE_CLAIM_ERROR.PERSON_NOT_CLAIMABLE)
    }

    // Duplicate guard: one open/approved claim per claimant per subject.
    const existing = await db.profileClaimRequest.findFirst({
      where: {
        claimantUserId: user.id,
        status: { in: ["PENDING", "APPROVED"] },
        ...(subjectType === "ORGANIZATION"
          ? { organizationId: subjectId }
          : { directoryProfileId: subjectId }),
      },
      select: { id: true },
    })

    if (existing) throw new Error(PROFILE_CLAIM_ERROR.DUPLICATE_CLAIM)

    const claim = await db.profileClaimRequest.create({
      data: {
        brand,
        subjectType,
        relationship,
        claimantUserId: user.id,
        claimantNote: claimantNote ?? null,
        ...(subjectType === "ORGANIZATION"
          ? { organizationId: subjectId }
          : { directoryProfileId: subjectId }),
      },
      select: { id: true },
    })

    return { claimId: claim.id }
  })
