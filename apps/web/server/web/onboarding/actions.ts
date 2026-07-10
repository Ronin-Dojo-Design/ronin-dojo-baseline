"use server"

import { Brand } from "~/.generated/prisma/client"
import { userActionClient } from "~/lib/safe-actions"
import { submitRankPromotionClaim } from "~/server/web/claims/submit-rank-promotion-claim"
import { setPassportRankSchema } from "./schemas"

/**
 * Declare the signed-in member's belt from the profile-enhancement wizard.
 *
 * B1 (petey-plan-0477 Slice V4; ADR 0035 Amendment 1): a self-declared belt is NOT written as a
 * displaying `RankAward`. It files a pending `RANK_PROMOTION` `PassportClaimRequest` — the belt
 * stays unverified (it never renders as the member's awarded rank) until an instructor approves
 * it, which mints the VERIFIED award (`finalizeRankPromotion`, Slice V3). This closes the
 * pre-existing hole where the wizard minted an `UNVERIFIED` award that still surfaced as the
 * member's rank (the trust badge reads `node.isVerified`, not the award). See SESSION_0484.
 *
 * `Brand.BBL` per the single-brand collapse (ADR 0034; `userActionClient` carries no brand, unlike
 * `adminActionClient`). The wizard's promoter / school / date become the reviewer's context note.
 */
export const setPassportRank = userActionClient
  .inputSchema(setPassportRankSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const { rankId, awardedAt, promotedBy, promotedByNodeId, schoolName, schoolOrgId } = parsedInput
    const note =
      [
        promotedBy?.trim() ? `Promoted by ${promotedBy.trim()}` : null,
        schoolName?.trim() ? `at ${schoolName.trim()}` : null,
        awardedAt ? `on ${awardedAt.toISOString().slice(0, 10)}` : null,
      ]
        .filter(Boolean)
        .join(" ") || null

    // Registered creatable-combobox picks persist typed FK refs (SESSION_0441 shape) so the steward
    // sees resolved verifiable links, not free text. A custom (typed) entry leaves the ref empty
    // string here → null on the claim. Instructor = NODE id (join-options.instructors); school =
    // Organization id (join-options.schools) — never a passport id (SESSION_0497 P2003).
    const { claimId } = await submitRankPromotionClaim(db, {
      claimantUserId: user.id,
      claimedRankId: rankId,
      brand: Brand.BBL,
      claimantNote: note,
      trainedUnderNodeId: promotedByNodeId?.trim() || null,
      claimedSchoolId: schoolOrgId?.trim() || null,
    })

    revalidate({ paths: ["/app/profile"] })
    return { claimId, status: "pending" as const }
  })
