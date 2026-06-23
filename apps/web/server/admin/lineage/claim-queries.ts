import "server-only"

import { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * Admin queries for the unified person-claim review queue.
 *
 * Author: Cody / SESSION_0183 TASK_02; repointed SESSION_0438 P5 (ADR 0036).
 *
 * Reads `PassportClaimRequest` — THE single record both person-claim doors now
 * write. Three consequences of the repoint:
 *   - the subject's display name comes straight off the **Passport** (identity SoT),
 *     not `node.passport`;
 *   - node/tree context is **optional** — a directory-only person claim has neither,
 *     and now surfaces here (the old `tree.brand` scope silently dropped it);
 *   - brand is filtered directly off the claim (`brand` column), so node-less claims
 *     are still brand-scoped.
 */

export async function findPendingClaims() {
  return db.passportClaimRequest.findMany({
    where: {
      brand: Brand.BBL,
      status: { in: ["PENDING", "NEEDS_INFO"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      claimantNote: true,
      passport: { select: { displayName: true } },
      tree: { select: { id: true, name: true, slug: true } },
      node: { select: { id: true } },
      claimant: { select: { id: true, name: true, email: true } },
    },
  })
}

export async function findClaimById(id: string) {
  return db.passportClaimRequest.findFirst({
    where: {
      id,
      brand: Brand.BBL,
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
      passport: { select: { displayName: true } },
      tree: { select: { id: true, name: true, slug: true } },
      node: { select: { id: true } },
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
