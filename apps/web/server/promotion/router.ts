import { z } from "zod"
import { authedProcedure } from "~/server/orpc/procedure"
import { db } from "~/services/db"
import { submitRankPromotionClaim } from "~/server/web/claims/submit-rank-promotion-claim"

/**
 * Flat oRPC router for belt promotions (petey-plan-0477 Slice V2; SOT-ADR D5 —
 * NEW oRPC routers live at `server/<entity>/router.ts`, ADR 0024 full-oRPC).
 *
 * The first authed mutation on the oRPC pipeline. A member requests a belt they
 * were promoted to; the request lands in the existing claim queue as a
 * `RANK_PROMOTION` `PassportClaimRequest` (Slice V1's `type`). Ownership is not an
 * input — the core derives the caller's own Passport from `context.user.id`, so a
 * promotion is structurally own-only. The above-ceiling / one-open / soft-gate
 * guards live in the core; the handler is a thin pass-through (no logic here).
 */

const submitInput = z.object({
  /** The belt being claimed — must sit above the member's verified ceiling (enforced server-side). */
  claimedRankId: z.string().min(1).max(191),
  claimantNote: z.string().max(2000).optional(),
  /** Soft-gate certificate/instructor evidence. Encouraged, not required. */
  evidence: z
    .array(
      z.object({
        label: z.string().max(200).nullish(),
        url: z.string().url().max(2000).nullish(),
        text: z.string().max(2000).nullish(),
        /**
         * An uploaded photo's `Media` id (the certificate/instructor-photo soft-gate).
         * On approval, an evidence row that carries a `mediaId` materializes onto the
         * minted award's `RankMilestone` as `MediaAttachment` media (Slice V3 →
         * `finalizeRankPromotion`); a row with only url/text carries no photo to attach.
         */
        mediaId: z.string().min(1).max(191).nullish(),
      }),
    )
    .max(8)
    .optional(),
})

const submitOutput = z.object({ claimId: z.string() })

/**
 * Authed member mutation — submit a belt-promotion request for the caller's own
 * Passport. No `meta.permission`: any signed-in member may request their own
 * promotion (the deny-by-default `authedProcedure` backstop is the gate), and the
 * core enforces own-Passport + above-ceiling. Rate-limited to blunt spam.
 */
const submit = authedProcedure
  .meta({ rateLimit: { points: 10, duration: 60 * 60 } })
  .input(submitInput)
  .output(submitOutput)
  .handler(async ({ input, context }) => {
    const result = await submitRankPromotionClaim(db, {
      claimantUserId: context.user.id,
      claimedRankId: input.claimedRankId,
      brand: context.brand,
      claimantNote: input.claimantNote ?? null,
      evidence: input.evidence,
    })
    context.revalidate({ paths: ["/app/profile"] })
    return result
  })

export const promotion = {
  submit,
}
