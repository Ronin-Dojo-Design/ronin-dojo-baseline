import { after } from "next/server"
import type { Brand } from "~/.generated/prisma/client"
import { notifyUserOfLifecycleEvent } from "~/lib/notifications"
import { db } from "~/services/db"

const BBL_LINEAGE_URL = "https://blackbeltlegacy.com/lineage"

/**
 * Fire the `profile-claim-rejected` lifecycle email after an admin DENIES a lineage claim
 * (SESSION_0420 — closing the "email on every decision" gap; approve already mailed via
 * `scheduleClaimApprovedEmail`, deny was silent).
 *
 * Call this from the admin review path AFTER its transaction has committed (rollback-safe — never
 * schedule from inside the tx, or a later rollback would still send the email) and ONLY on a fresh
 * DENIED decision. Deny is admin-only; there is no token/reconciler deny path, so this is the single
 * call site.
 *
 * Uses Next `after()` so the send is non-blocking (post-response) yet the serverless function stays
 * alive until it finishes. Idempotent: the lifecycle rate-limit key dedupes to one email per
 * (node, user). Never throws — a mail failure must not affect the review.
 *
 * NOTE: lifecycle emails honor the global `EMAIL_LIFECYCLE_DRYRUN` gate (default "1" = dry-run);
 * they only actually send when that env is set to "0".
 */
export function scheduleClaimRejectedEmail({
  userId,
  brand,
  nodeId,
  reviewerNote,
}: {
  userId: string
  brand: Brand
  nodeId: string
  reviewerNote?: string | null
}): void {
  after(async () => {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      })
      if (!user?.email) return
      await notifyUserOfLifecycleEvent({
        brand,
        kind: "profile-claim-rejected",
        to: user.email,
        firstName: user.name?.split(" ")[0] ?? null,
        subject: "An update on your Black Belt Legacy profile claim",
        heading: "About Your Profile Claim",
        intro:
          "Thanks for submitting a claim on Black Belt Legacy. After review, we weren't able to approve this claim right now. If you believe this is a mistake, just reply to this email and we'll take another look.",
        details: reviewerNote ? [{ label: "Reviewer note", value: reviewerNote }] : undefined,
        ctaLabel: "Back to Lineage",
        ctaUrl: BBL_LINEAGE_URL,
        rateLimitKey: `claim-rejected:${nodeId}:${userId}`,
        secondaryNote: "Questions? Reply to this email and a human will help.",
      })
    } catch (error) {
      console.error("[scheduleClaimRejectedEmail]", error instanceof Error ? error.message : error)
    }
  })
}
