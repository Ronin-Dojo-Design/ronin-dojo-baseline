import "server-only"

import { getRequestBrand } from "~/lib/brand-context"
import { db } from "~/services/db"

/**
 * Admin queries for lineage claim review.
 *
 * Author: Cody / SESSION_0183 TASK_02.
 */

export async function findPendingClaims() {
  const brand = await getRequestBrand()

  return db.lineageClaimRequest.findMany({
    where: {
      tree: { brand },
      status: { in: ["PENDING", "NEEDS_INFO"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      claimantNote: true,
      tree: { select: { id: true, name: true, slug: true } },
      node: { select: { id: true, displayName: true } },
      claimant: { select: { id: true, name: true, email: true } },
    },
  })
}

export type PendingClaim = Awaited<ReturnType<typeof findPendingClaims>>[number]

export async function findClaimById(id: string) {
  const brand = await getRequestBrand()

  return db.lineageClaimRequest.findFirst({
    where: {
      id,
      tree: { brand },
    },
    select: {
      id: true,
      status: true,
      claimantNote: true,
      reviewerNote: true,
      reviewedAt: true,
      createdAt: true,
      updatedAt: true,
      tree: { select: { id: true, name: true, slug: true } },
      node: { select: { id: true, displayName: true } },
      claimant: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true, email: true } },
      evidence: {
        select: {
          id: true,
          label: true,
          url: true,
          text: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })
}

export type ClaimDetail = NonNullable<Awaited<ReturnType<typeof findClaimById>>>
