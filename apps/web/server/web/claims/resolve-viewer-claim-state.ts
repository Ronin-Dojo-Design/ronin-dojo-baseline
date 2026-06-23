/**
 * Viewer-aware claim state — the read-model counterpart to `submitPassportClaim`
 * (ADR 0036, SESSION_0440 "Full A").
 *
 * THE single source of truth both person-claim surfaces read to decide which CTA
 * to render: the lineage-node drawer AND the directory profile. Keeping the 5-state
 * machine in one resolver is what stops the two surfaces from drifting (the ghost
 * "Claim" button on an already-claimed node was the drawer computing its own,
 * `passport.userId`-blind, gate).
 *
 * It mirrors the writer's guards exactly so the UI can never offer an action the
 * core would reject:
 *   - "claimed" == the Passport has an attached account (`passport.userId != null`),
 *     the same check `submitPassportClaim` makes (identity, not door).
 *   - "an open claim by me" == a non-terminal claim by the viewer on that identity
 *     ({@link OPEN_CLAIM_STATUSES}), the union of the submit-core dedup set
 *     (PENDING/APPROVED) and the `claimNodeForUser` reuse set (PENDING/NEEDS_INFO).
 *
 * Deliberately one-sided: it only ever looks at the VIEWER's own claims. Someone
 * ELSE's pending claim is invisible by construction — an unclaimed Passport with no
 * claim of mine resolves to `UNCLAIMED` and shows a normal "Claim" CTA, never
 * exposing that another person is mid-claim.
 */

/** The 4 distinct CTA outcomes (the grilled 5-row machine collapses two rows to UNCLAIMED). */
export const CLAIM_VIEWER_STATE = {
  /** Unclaimed Passport, viewer has no open claim (signed in or out) → show "Claim". */
  UNCLAIMED: "UNCLAIMED",
  /** Unclaimed Passport, viewer has an open claim → "Claim pending review" (disabled/info). */
  PENDING_MINE: "PENDING_MINE",
  /** Passport attached to the viewer's account → "This profile is yours →" (manage). */
  CLAIMED_MINE: "CLAIMED_MINE",
  /** Passport attached to someone else → no CTA (normal claimed public profile). */
  CLAIMED_OTHER: "CLAIMED_OTHER",
} as const

export type ClaimViewerState = (typeof CLAIM_VIEWER_STATE)[keyof typeof CLAIM_VIEWER_STATE]

/**
 * Statuses that count as "an open claim by me" while the Passport is still
 * accountless. Union of the submit-core dedup guard (PENDING/APPROVED) and the
 * email-token reuse set (PENDING/NEEDS_INFO) — terminal DENIED/CANCELLED do not
 * block a fresh claim and so do not gate the CTA.
 */
export const OPEN_CLAIM_STATUSES = ["PENDING", "NEEDS_INFO", "APPROVED"] as const

/** Prisma client / `$transaction` tx surface (callers pass `ctx.db` or `db`). */
// biome-ignore lint/suspicious/noExplicitAny: Prisma client/tx surface, matching the claim-core convention.
type Db = any

/**
 * Pure decision function — the whole state machine, no I/O. Heavy unit coverage
 * lives here (the DB resolvers below just feed it the two facts it needs).
 */
export function deriveClaimViewerState({
  passportUserId,
  viewerUserId,
  viewerHasOpenClaim,
}: {
  /** The account attached to the Passport, or null if it is still a placeholder. */
  passportUserId: string | null
  /** The signed-in viewer, or null when signed out. */
  viewerUserId: string | null
  /** Whether the viewer holds a non-terminal claim on this Passport. */
  viewerHasOpenClaim: boolean
}): ClaimViewerState {
  // Claimed axis wins: an attached account is terminal regardless of any claim row.
  if (passportUserId != null) {
    return viewerUserId != null && passportUserId === viewerUserId
      ? CLAIM_VIEWER_STATE.CLAIMED_MINE
      : CLAIM_VIEWER_STATE.CLAIMED_OTHER
  }
  // Unclaimed Passport: only the viewer's own open claim changes the CTA.
  if (viewerUserId != null && viewerHasOpenClaim) {
    return CLAIM_VIEWER_STATE.PENDING_MINE
  }
  return CLAIM_VIEWER_STATE.UNCLAIMED
}

/**
 * Resolve the viewer's claim state for a SET of Passports in two indexed queries
 * (`passport.userId`, then the viewer's open claims) — no N+1. Used by the lineage
 * tree loader, which needs a state per visible node.
 */
export async function resolveViewerClaimStates(
  db: Db,
  { passportIds, viewerUserId }: { passportIds: readonly string[]; viewerUserId: string | null },
): Promise<Map<string, ClaimViewerState>> {
  const uniqueIds = Array.from(new Set(passportIds))
  const result = new Map<string, ClaimViewerState>()
  if (uniqueIds.length === 0) {
    return result
  }

  // Claimed/unclaimed axis (well-indexed primary-key lookup).
  const passports: { id: string; userId: string | null }[] = await db.passport.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, userId: true },
  })
  const userIdByPassport = new Map(passports.map(p => [p.id, p.userId]))

  // The viewer's own open claims across the set (skip entirely when signed out).
  // Indexed by `[claimantUserId, status]` / `[passportId, status]`.
  const myOpenClaimPassportIds = new Set<string>()
  if (viewerUserId != null) {
    const claims: { passportId: string }[] = await db.passportClaimRequest.findMany({
      where: {
        passportId: { in: uniqueIds },
        claimantUserId: viewerUserId,
        status: { in: [...OPEN_CLAIM_STATUSES] },
      },
      select: { passportId: true },
    })
    for (const claim of claims) {
      myOpenClaimPassportIds.add(claim.passportId)
    }
  }

  for (const id of uniqueIds) {
    result.set(
      id,
      deriveClaimViewerState({
        passportUserId: userIdByPassport.get(id) ?? null,
        viewerUserId,
        viewerHasOpenClaim: myOpenClaimPassportIds.has(id),
      }),
    )
  }
  return result
}

/**
 * Resolve the viewer's claim state for a single Passport. Thin wrapper over the
 * batch resolver so both surfaces share one code path. Used by the directory loader.
 */
export async function resolveViewerClaimState(
  db: Db,
  { passportId, viewerUserId }: { passportId: string; viewerUserId: string | null },
): Promise<ClaimViewerState> {
  const states = await resolveViewerClaimStates(db, { passportIds: [passportId], viewerUserId })
  return states.get(passportId) ?? CLAIM_VIEWER_STATE.UNCLAIMED
}
