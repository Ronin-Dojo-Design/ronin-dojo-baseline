import type { Brand, ProfileClaimRelationship } from "~/.generated/prisma/client"

/**
 * Unified person-claim core (ADR 0036, SESSION_0437 P1).
 *
 * THE single submit path behind both person-claim doors. Each door resolves its
 * subject (a lineage node OR a directory profile) to the person's `passportId`
 * (Passport = identity SoT, ADR 0025) and calls this; the claimable guard and the
 * duplicate guard therefore key on **identity, not door**, so the same person can
 * no longer carry two open claims that neither guard could see as one. This
 * subsumes the SESSION_0436 interim already-claimed guard that was hand-patched
 * onto the lineage door and the PERSON branch's PERSON_NOT_CLAIMABLE check.
 *
 * Door context (`nodeId`/`treeId`/`directoryProfileId`) is recorded but optional —
 * `finalizePassportClaim` runs the node-specific branches only when a node is
 * present, which is what un-stubs the directory-only person approval.
 *
 * Org claims do NOT come through here — an owner-less Organization is not a
 * Passport; they stay in `ProfileClaimRequest` (ADR 0036 §5).
 */

export const SUBMIT_PASSPORT_CLAIM_ERROR = {
  PASSPORT_NOT_FOUND: "That profile no longer exists or is not in this brand.",
  ALREADY_CLAIMED: "This profile belongs to an active account and cannot be claimed.",
  DUPLICATE_CLAIM: "You already have a pending or approved claim on this profile.",
} as const

/** Prisma client / `$transaction` tx surface (callers pass `ctx.db` or `tx`). */
// biome-ignore lint/suspicious/noExplicitAny: Prisma client/tx surface, matching the claim-finalize convention.
type Db = any

export type SubmitPassportClaimInput = {
  /** Identity key — the Passport the subject resolved to. */
  passportId: string
  claimantUserId: string
  brand: Brand
  /** Captured by the directory-person door; the lineage door does not collect one. */
  relationship?: ProfileClaimRelationship | null
  claimantNote?: string | null
  /** Rank the claimant asserts at claim time (PENDING; ADR 0035 §4). */
  claimedRankId?: string | null
  /** Door context — present for the lineage door; null for a directory-only person. */
  nodeId?: string | null
  treeId?: string | null
  directoryProfileId?: string | null
  evidence?: { label?: string | null; url?: string | null; text?: string | null }[]
}

/**
 * Resolve-guard-create. Throws on a missing/already-claimed Passport or a duplicate
 * open claim by the same claimant. Returns the new claim id.
 */
export async function submitPassportClaim(
  db: Db,
  input: SubmitPassportClaimInput,
): Promise<{ claimId: string }> {
  // Claimable guard — identity-keyed. "Claimed" means the Passport has an attached
  // account (Passport.userId != null); this is the one check both doors share now.
  const passport = await db.passport.findUnique({
    where: { id: input.passportId },
    select: { userId: true },
  })

  if (!passport) {
    throw new Error(SUBMIT_PASSPORT_CLAIM_ERROR.PASSPORT_NOT_FOUND)
  }
  if (passport.userId != null) {
    throw new Error(SUBMIT_PASSPORT_CLAIM_ERROR.ALREADY_CLAIMED)
  }

  // Duplicate guard — one open/approved claim per claimant per identity (not per door).
  const existing = await db.passportClaimRequest.findFirst({
    where: {
      passportId: input.passportId,
      claimantUserId: input.claimantUserId,
      status: { in: ["PENDING", "APPROVED"] },
    },
    select: { id: true },
  })

  if (existing) {
    throw new Error(SUBMIT_PASSPORT_CLAIM_ERROR.DUPLICATE_CLAIM)
  }

  const claim = await db.passportClaimRequest.create({
    data: {
      passportId: input.passportId,
      claimantUserId: input.claimantUserId,
      brand: input.brand,
      relationship: input.relationship ?? null,
      claimantNote: input.claimantNote ?? null,
      claimedRankId: input.claimedRankId ?? null,
      nodeId: input.nodeId ?? null,
      treeId: input.treeId ?? null,
      directoryProfileId: input.directoryProfileId ?? null,
      ...(input.evidence?.length
        ? {
            evidence: {
              create: input.evidence.map(item => ({
                label: item.label ?? null,
                url: item.url ?? null,
                text: item.text ?? null,
              })),
            },
          }
        : {}),
    },
    select: { id: true },
  })

  return { claimId: claim.id }
}
