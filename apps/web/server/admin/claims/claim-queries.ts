import "server-only"

import { Brand, type Prisma } from "~/.generated/prisma/client"
import { runAdminListTransaction } from "~/server/admin/list-query"
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

/** Columns the queue can actually be ordered by in Prisma (computed columns like the
 * subject label / relationship badge have no scalar to sort on). Anything else falls back
 * to the schema default `createdAt desc`. */
const CLAIM_ORDERABLE = new Set<keyof Prisma.ProfileClaimRequestOrderByWithRelationInput>([
  "createdAt",
  "status",
])

const defaultClaimOrderBy: Prisma.ProfileClaimRequestOrderByWithRelationInput = {
  createdAt: "desc",
}

const resolveClaimOrderBy = (
  sort: Array<{ id: string; desc: boolean }>,
): Prisma.ProfileClaimRequestOrderByWithRelationInput => {
  const primary = sort[0]
  if (primary && CLAIM_ORDERABLE.has(primary.id as keyof typeof defaultClaimOrderBy)) {
    return { [primary.id]: primary.desc ? "desc" : "asc" }
  }
  return defaultClaimOrderBy
}

/**
 * Paginated shape of the pending profile-claim queue for the `AdminCollection` frame
 * (ADR 0045), routed through `runAdminListTransaction` (like the exemplar `findPeople`) so
 * it returns the shared `{ rows, total, pageCount }` and shares the pager math. Same rows,
 * same filter (`ORGANIZATION` + `PENDING`/`NEEDS_INFO`); the header sort is threaded through
 * (`resolveClaimOrderBy`) and defaults to the queue's `createdAt desc`.
 */
export async function findPendingProfileClaimsPaginated(params: {
  page?: number
  perPage?: number
  sort?: Array<{ id: string; desc: boolean }>
}) {
  const { page = 1, perPage = 50, sort = [] } = params
  const orderBy = resolveClaimOrderBy(sort)

  return runAdminListTransaction({
    perPage,
    findMany: () =>
      db.profileClaimRequest.findMany({
        where: pendingProfileClaimsWhere,
        orderBy,
        select: profileClaimSelect,
        take: perPage,
        skip: (page - 1) * perPage,
      }),
    count: () => db.profileClaimRequest.count({ where: pendingProfileClaimsWhere }),
  })
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
