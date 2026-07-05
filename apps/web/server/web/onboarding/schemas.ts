import { z } from "zod"

/**
 * Member-facing "set my current belt" payload for the profile-enhancement
 * wizard. Mirrors the monorepo wizard's belt step (rank + promotion date +
 * promoter + school), filing a pending `RANK_PROMOTION` claim (B1, ADR 0035
 * Amdt 1) rather than a displaying `RankAward`.
 *
 * The promoter/school pickers are the verified creatable-combobox (SESSION_0441,
 * ADR 0036): a REGISTERED pick persists a typed FK ref alongside the free text —
 * `promotedByNodeId` (→ `PassportClaimRequest.trainedUnderNodeId`, a LineageNode)
 * and `schoolOrgId` (→ `PassportClaimRequest.claimedSchoolId`, an Organization).
 * A custom (typed) entry leaves the ref empty; only the text label survives (in
 * `claimantNote`, as before). Same id-spaces as the Join-the-Legacy wizard — do
 * NOT feed the passport-keyed belt-promoter picker here (SESSION_0497 P2003).
 */
export const setPassportRankSchema = z.object({
  rankId: z.string().min(1).max(191),
  awardedAt: z.coerce.date().nullish(),
  promotedBy: z.string().max(200).optional(),
  promotedByNodeId: z.string().max(64).optional(),
  schoolName: z.string().max(200).optional(),
  schoolOrgId: z.string().max(64).optional(),
})

export type SetPassportRankInput = z.infer<typeof setPassportRankSchema>
