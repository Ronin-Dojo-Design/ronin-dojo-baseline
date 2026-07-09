import "server-only"

import { Brand, type Prisma } from "~/.generated/prisma/client"
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

const pendingProfileClaimsWhere: Prisma.ProfileClaimRequestWhereInput = {
  brand: Brand.BBL,
  subjectType: "ORGANIZATION",
  status: { in: ["PENDING", "NEEDS_INFO"] },
}

export async function findPendingProfileClaims() {
  return db.profileClaimRequest.findMany({
    where: pendingProfileClaimsWhere,
    orderBy: { createdAt: "desc" },
    select: profileClaimSelect,
  })
}

export type ProfileClaimRow = Awaited<ReturnType<typeof findPendingProfileClaims>>[number]

/**
 * Paginated shape of the pending profile-claim queue for the `AdminCollection` frame
 * (ADR 0045), mirroring `findPeople` (`{ rows, total, pageCount }`). Same rows, same
 * filter (`ORGANIZATION` + `PENDING`/`NEEDS_INFO`), same `createdAt desc` order as
 * `findPendingProfileClaims`; only pagination is layered on so the frame's pager wires
 * correctly.
 */
export async function findPendingProfileClaimsPaginated(params: {
  page?: number
  perPage?: number
}) {
  const { page = 1, perPage = 50 } = params
  const skip = (page - 1) * perPage

  const [rows, total] = await db.$transaction([
    db.profileClaimRequest.findMany({
      where: pendingProfileClaimsWhere,
      orderBy: { createdAt: "desc" },
      select: profileClaimSelect,
      take: perPage,
      skip,
    }),
    db.profileClaimRequest.count({ where: pendingProfileClaimsWhere }),
  ])

  const pageCount = Math.max(1, Math.ceil(total / perPage))

  return { rows, total, pageCount }
}

export async function findProfileClaimById(id: string) {
  return db.profileClaimRequest.findFirst({
    where: { id, brand: Brand.BBL },
    select: profileClaimSelect,
  })
}

// `profileClaimSubjectLabel` moved to the client-safe `./claim-labels` (Prisma-in-client
// -chrome Turbopack trap). Re-exported here so existing server-component importers keep
// their `~/server/admin/claims/claim-queries` import path.
export { profileClaimSubjectLabel } from "./claim-labels"
