import "server-only"

import { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * Admin queries for lineage claim review.
 *
 * Author: Cody / SESSION_0183 TASK_02.
 */

export async function findPendingClaims() {
  return db.lineageClaimRequest.findMany({
    where: {
      tree: { brand: Brand.BBL },
      status: { in: ["PENDING", "NEEDS_INFO"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      claimantNote: true,
      tree: { select: { id: true, name: true, slug: true } },
      node: {
        select: {
          id: true,
          passport: { select: { displayName: true } },
        },
      },
      claimant: { select: { id: true, name: true, email: true } },
    },
  })
}

export type PendingClaim = Awaited<ReturnType<typeof findPendingClaims>>[number]

export async function findClaimById(id: string) {
  return db.lineageClaimRequest.findFirst({
    where: {
      id,
      tree: { brand: Brand.BBL },
    },
    select: {
      id: true,
      status: true,
      claimantNote: true,
      reviewerNote: true,
      reviewedAt: true,
      createdAt: true,
      updatedAt: true,
      // FI-006: rank the claimant asserted at claim time.
      claimedRank: { select: { id: true, name: true, shortName: true, colorHex: true } },
      tree: { select: { id: true, name: true, slug: true } },
      node: {
        select: {
          id: true,
          passport: { select: { displayName: true } },
        },
      },
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
