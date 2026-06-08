import "server-only"

import { getRequestBrand } from "~/lib/brand-context"
import { db } from "~/services/db"

/**
 * Admin queries for profile-claim review (SESSION_0354).
 * Mirrors `server/admin/lineage/claim-queries.ts`. Brand-scoped.
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
      user: {
        select: { name: true, isPlaceholder: true, passport: { select: { displayName: true } } },
      },
    },
  },
  claimant: { select: { id: true, name: true, email: true } },
} as const

export async function findPendingProfileClaims() {
  const brand = await getRequestBrand()

  return db.profileClaimRequest.findMany({
    where: { brand, status: { in: ["PENDING", "NEEDS_INFO"] } },
    orderBy: { createdAt: "desc" },
    select: profileClaimSelect,
  })
}

export type PendingProfileClaim = Awaited<ReturnType<typeof findPendingProfileClaims>>[number]

export async function findProfileClaimById(id: string) {
  const brand = await getRequestBrand()

  return db.profileClaimRequest.findFirst({
    where: { id, brand },
    select: profileClaimSelect,
  })
}

export type ProfileClaimDetail = NonNullable<Awaited<ReturnType<typeof findProfileClaimById>>>

/** Subject display label for a claim row (org name or person display name). */
export function profileClaimSubjectLabel(claim: {
  subjectType: "PERSON" | "ORGANIZATION"
  organization: { name: string } | null
  directoryProfile: {
    user: { name: string | null; passport: { displayName: string | null } | null }
  } | null
}): string {
  if (claim.subjectType === "ORGANIZATION")
    return claim.organization?.name ?? "Unknown organization"
  return (
    claim.directoryProfile?.user.passport?.displayName ??
    claim.directoryProfile?.user.name ??
    "Unknown profile"
  )
}
