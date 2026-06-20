import { after } from "next/server"
import type { Brand } from "~/.generated/prisma/client"
import { notifyUserOfLifecycleEvent } from "~/lib/notifications"
import { db } from "~/services/db"

const BBL_PROFILE_URL = "https://blackbeltlegacy.com/me"

/**
 * Fire the existing `profile-claim-approved` lifecycle email after a successful claim
 * (SESSION_0419 — wiring the claim flow into the email lifecycle library).
 *
 * Call this from EVERY claim-success path AFTER its transaction has committed (rollback-safe —
 * never schedule from inside the tx, or a later rollback would still send the email) and ONLY on
 * a fresh claim (not an idempotent replay). Wired into: the magic-link accept route, the
 * any-sign-in reconciler, and the admin approve path.
 *
 * Uses Next `after()` so the send is non-blocking (post-response) yet the serverless function
 * stays alive until it finishes. Idempotent: the lifecycle rate-limit key dedupes to one email
 * per (node, user). Never throws — a mail failure must not affect the claim.
 *
 * NOTE: lifecycle emails honor the global `EMAIL_LIFECYCLE_DRYRUN` gate (default "1" = dry-run);
 * they only actually send when that env is set to "0".
 */
export function scheduleClaimApprovedEmail({
  userId,
  brand,
  nodeId,
}: {
  userId: string
  brand: Brand
  nodeId: string
}): void {
  const send = async () => {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      })
      if (!user?.email) return
      await notifyUserOfLifecycleEvent({
        brand,
        kind: "profile-claim-approved",
        to: user.email,
        firstName: user.name?.split(" ")[0] ?? null,
        subject: "Your Black Belt Legacy profile is claimed",
        heading: "Your Profile Is Claimed",
        intro:
          "It's official — your profile on Black Belt Legacy is yours: claimed, verified, and live. Welcome to the lineage.",
        tier: "elite",
        ctaLabel: "View My Profile",
        ctaUrl: BBL_PROFILE_URL,
        rateLimitKey: `claim:${nodeId}:${userId}`,
        secondaryNote: "Didn't expect this? Just reply and let us know.",
      })
    } catch (error) {
      console.error("[scheduleClaimApprovedEmail]", error instanceof Error ? error.message : error)
    }
  }

  // `after()` throws when called outside a request scope (background jobs, scripts, tests).
  // The claim must NEVER fail because its confirmation email couldn't be scheduled, so guard the
  // registration itself (SESSION_0420). In a real request path `after()` is always available, so
  // this try/catch is a no-op there; outside one, the email is simply skipped instead of throwing.
  try {
    after(send)
  } catch (error) {
    console.error(
      "[scheduleClaimApprovedEmail] after() unavailable, skipping email:",
      error instanceof Error ? error.message : error,
    )
  }
}
