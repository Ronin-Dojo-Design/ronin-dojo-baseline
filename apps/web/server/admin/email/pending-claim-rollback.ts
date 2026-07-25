import type { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * WL-P2-41(a) — compensating rollback for the invite composer's bind→send pair (SESSION_0701).
 *
 * `sendBblClaimInvite` binds the email→node pending claim BEFORE sending the invite email
 * (the durable SESSION_0513 pattern: the binding lives server-side, never in the URL). When the
 * send then FAILS, the binding this action just wrote must not linger — the recipient never got
 * an email that points at it (the SESSION_0515 deferral: orphaned-but-benign).
 *
 * The subtlety is the idempotent RE-send: `bindPendingClaim` is an upsert that re-arms an
 * existing row (extends the 90-day window, clears the consumption marker). On a re-send the row
 * PREDATES this action, and an earlier successfully-sent durable email still reconciles through
 * it — so rollback must RESTORE the prior row, never delete it. Hence the snapshot-first shape:
 *
 *   - no prior row (fresh invite)  → rollback DELETES the row the failed send created,
 *   - prior row existed (re-send)  → rollback RESTORES its exact prior fields
 *                                    (expiresAt / consumedAt / consumedByUserId / brand).
 *
 * Rollback is deliberately best-effort: a failed compensation write must surface the SEND error
 * to the admin (the toastable failure they can act on), not its own — a lingering binding is the
 * pre-fix status quo (benign), a masked send error is not.
 */

type PendingClaimClient = typeof db

/** Mirror `bindPendingClaim`'s key normalization (trim + lowercase) so we address the same row. */
export const normalizePendingClaimEmail = (email: string) => email.trim().toLowerCase()

/** The restorable fields of a pre-existing binding; `null` = no row existed before the bind. */
export type PendingClaimSnapshot = {
  brand: Brand
  expiresAt: Date | null // schema: `expiresAt DateTime?` — a legacy row may carry no expiry
  consumedAt: Date | null
  consumedByUserId: string | null
} | null

/**
 * Capture the pre-bind state of the `email_nodeId` pending-claim row (or `null` when absent).
 * Call BEFORE `bindPendingClaim`; hand the result to `rollbackPendingClaimBind` on send failure.
 */
export async function snapshotPendingClaim(
  email: string,
  nodeId: string,
  client: PendingClaimClient = db,
): Promise<PendingClaimSnapshot> {
  return client.lineagePendingClaim.findUnique({
    where: { email_nodeId: { email: normalizePendingClaimEmail(email), nodeId } },
    select: { brand: true, expiresAt: true, consumedAt: true, consumedByUserId: true },
  })
}

/**
 * Best-effort compensating write after a failed send: restore the snapshotted prior row, or
 * delete the row when no prior binding existed. Never throws — see the module note.
 */
export async function rollbackPendingClaimBind(
  email: string,
  nodeId: string,
  prior: PendingClaimSnapshot,
  client: PendingClaimClient = db,
): Promise<void> {
  const key = { email: normalizePendingClaimEmail(email), nodeId }
  try {
    if (prior) {
      await client.lineagePendingClaim.updateMany({ where: key, data: prior })
    } else {
      await client.lineagePendingClaim.deleteMany({ where: key })
    }
  } catch (error) {
    console.error(
      `[invite] pending-claim rollback failed for ${key.email} → ${nodeId} — binding left in place (benign; the send error is the actionable failure):`,
      error,
    )
  }
}
