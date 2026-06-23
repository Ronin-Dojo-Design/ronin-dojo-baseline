import "server-only"

import { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * Admin queries for profile-claim review (SESSION_0354).
 * Mirrors `server/admin/lineage/claim-queries.ts`. Brand-scoped.
 *
 * SESSION_0438 P5 (ADR 0036): this queue is now **organization-only**. Person
 * claims unified onto `PassportClaimRequest` and review there via the lineage
 * claim queue (`findPendingClaims` → `reviewPassportClaim`) — the single
 * person-review surface. An owner-less Organization is not a Passport, so org
 * claims stay in `ProfileClaimRequest` and remain here. The list query filters to
 * `ORGANIZATION` so no legacy/straggler PERSON row leaks a second person surface;
 * `findProfileClaimById` is left subject-agnostic so a straggler PERSON row can
 * still be opened directly if an admin needs to resolve one.
 */

const profileClaimSelect = {
  id: true,
  status: true,
  subjectType: true,
  relationship: true,
  createdAt: true,
  claimantNote: true,
  reviewerNote: true,
  reviewedAt: true,
  organization: { select: { id: true, name: true, slug: true, type: true, ownerId: true } },
  directoryProfile: {
    select: {
      id: true,
      slug: true,
      // Phase 3c (SESSION_0392) dropped DirectoryProfile.user — Passport is the identity
      // root now. This select was stale (selected the removed `user` relation) and 500'd
      // findPendingProfileClaims; read displayName straight off the Passport.
      passport: { select: { displayName: true } },
    },
  },
  claimant: { select: { id: true, name: true, email: true } },
} as const

export async function findPendingProfileClaims() {
  return db.profileClaimRequest.findMany({
    where: {
      brand: Brand.BBL,
      subjectType: "ORGANIZATION",
      status: { in: ["PENDING", "NEEDS_INFO"] },
    },
    orderBy: { createdAt: "desc" },
    select: profileClaimSelect,
  })
}

export async function findProfileClaimById(id: string) {
  return db.profileClaimRequest.findFirst({
    where: { id, brand: Brand.BBL },
    select: profileClaimSelect,
  })
}

/** Subject display label for a claim row (org name or person display name). */
export function profileClaimSubjectLabel(claim: {
  subjectType: "PERSON" | "ORGANIZATION"
  organization: { name: string } | null
  directoryProfile: {
    passport: { displayName: string | null } | null
  } | null
}): string {
  if (claim.subjectType === "ORGANIZATION")
    return claim.organization?.name ?? "Unknown organization"
  return claim.directoryProfile?.passport?.displayName ?? "Unknown profile"
}
