import { db } from "~/services/db"
import { claimNodeForUser } from "./claim-node-for-user"

/**
 * Reconcile email-bound pending lineage claims on ANY successful authentication (SESSION_0419).
 *
 * Called from `lib/auth.ts` `hooks.after` (AFTER `ensureIdentityShell`, so the user's identity
 * shell already exists) for every sign-in path — Google OAuth callback, magic-link verify, and
 * email sign-up. This is what makes the founder claim work regardless of HOW they sign in: the
 * emailed claim recommends "Continue with Google", but Google OAuth never carries the node in a
 * callbackURL, so before this the node simply never got claimed. The persisted
 * `LineagePendingClaim { email → node }` binding (written at mint time) is the proof, and the
 * verified email is what authorizes consuming it.
 *
 * Contract: this MUST NOT throw — a claim failure can never block authentication. Each binding
 * is processed in its own transaction; failures are logged and left UNCONSUMED so a later
 * sign-in retries. Benign failures include ALREADY_OWNED_BY_OTHER (someone else claimed the
 * node) and CLAIMANT_HAS_NODE (this user already owns a different node).
 */
export async function reconcilePendingLineageClaims({
  userId,
  email,
  emailVerified,
}: {
  userId: string
  email: string | null | undefined
  emailVerified: boolean
}): Promise<void> {
  // A verified email is the proof the signer controls the invited address. Social providers
  // (Google) return verified emails; magic-link verification sets emailVerified too.
  if (!emailVerified || !email) return
  const normalized = email.trim().toLowerCase()
  if (!normalized) return

  const now = new Date()
  const pending = await db.lineagePendingClaim.findMany({
    where: {
      email: normalized,
      consumedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: { id: true, nodeId: true, brand: true },
  })
  if (pending.length === 0) return

  for (const binding of pending) {
    try {
      await db.$transaction(
        // biome-ignore lint/suspicious/noExplicitAny: Prisma `$transaction` tx client.
        async (tx: any) => {
          await claimNodeForUser(tx, {
            userId,
            nodeId: binding.nodeId,
            brand: binding.brand,
            now: new Date(),
          })
          await tx.lineagePendingClaim.update({
            where: { id: binding.id },
            data: { consumedAt: new Date(), consumedByUserId: userId },
          })
        },
        { isolationLevel: "Serializable", maxWait: 30000, timeout: 30000 },
      )
    } catch (error) {
      // Never block auth. Leave the binding unconsumed for a future retry.
      console.error(
        `[reconcilePendingLineageClaims] node ${binding.nodeId} / user ${userId}:`,
        error instanceof Error ? error.message : error,
      )
    }
  }
}
