"use server"

import { Brand } from "~/.generated/prisma/client"
import { userActionClient } from "~/lib/safe-actions"
import { submitProfileClaimSchema } from "~/server/web/claims/claim-schemas"
import { submitPassportClaim } from "~/server/web/claims/submit-passport-claim"

/**
 * Generic member/org profile-claim server action (SESSION_0354).
 *
 * The ORGANIZATION branch is unchanged — an owner-less Organization is not a
 * Passport, so it stays in `ProfileClaimRequest` (approval sets `ownerId`).
 *
 * The PERSON branch is now a thin DOOR ADAPTER over the unified
 * `submitPassportClaim` core (ADR 0036, SESSION_0437 P1): it resolves the
 * directory profile's `passportId`, back-fills lineage node/tree context when the
 * Passport owns a node (so one finalize runs the node branches too), and delegates.
 * The claimable + duplicate guards live in the core, keyed on identity.
 */

const PROFILE_CLAIM_ERROR = {
  SUBJECT_NOT_FOUND: "That profile no longer exists or is not in this brand.",
  ORG_ALREADY_OWNED: "This organization already has an owner and cannot be claimed.",
  DUPLICATE_CLAIM: "You already have a pending or approved claim on this profile.",
} as const

export const submitProfileClaimRequest = userActionClient
  .inputSchema(submitProfileClaimSchema)
  .action(async ({ parsedInput, ctx: { user, db } }) => {
    const { subjectType, subjectId, relationship, claimantNote } = parsedInput

    if (subjectType === "ORGANIZATION") {
      const org = await db.organization.findFirst({
        where: { id: subjectId, brand: Brand.BBL },
        select: { id: true, ownerId: true },
      })

      if (!org) throw new Error(PROFILE_CLAIM_ERROR.SUBJECT_NOT_FOUND)
      if (org.ownerId) throw new Error(PROFILE_CLAIM_ERROR.ORG_ALREADY_OWNED)

      // Org duplicate guard (org claims stay in ProfileClaimRequest, ADR 0036 §5).
      const existing = await db.profileClaimRequest.findFirst({
        where: {
          claimantUserId: user.id,
          status: { in: ["PENDING", "APPROVED"] },
          organizationId: subjectId,
        },
        select: { id: true },
      })

      if (existing) throw new Error(PROFILE_CLAIM_ERROR.DUPLICATE_CLAIM)

      const claim = await db.profileClaimRequest.create({
        data: {
          brand: Brand.BBL,
          subjectType,
          relationship,
          claimantUserId: user.id,
          claimantNote: claimantNote ?? null,
          organizationId: subjectId,
        },
        select: { id: true },
      })

      return { claimId: claim.id }
    }

    // PERSON: resolve the directory profile's Passport (identity SoT), back-fill any
    // lineage node/tree context, and delegate to the unified core.
    const profile = await db.directoryProfile.findFirst({
      where: { id: subjectId },
      select: {
        id: true,
        passportId: true,
        passport: {
          select: {
            lineageNode: {
              select: {
                id: true,
                treeMembers: { select: { treeId: true }, take: 1 },
              },
            },
          },
        },
      },
    })

    if (!profile) throw new Error(PROFILE_CLAIM_ERROR.SUBJECT_NOT_FOUND)

    const node = profile.passport.lineageNode
    return submitPassportClaim(db, {
      passportId: profile.passportId,
      claimantUserId: user.id,
      brand: Brand.BBL,
      relationship,
      claimantNote: claimantNote ?? null,
      directoryProfileId: profile.id,
      nodeId: node?.id ?? null,
      treeId: node?.treeMembers[0]?.treeId ?? null,
    })
  })
