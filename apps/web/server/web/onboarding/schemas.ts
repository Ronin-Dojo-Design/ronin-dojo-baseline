import { z } from "zod"

/**
 * Member-facing "set my current belt" payload for the profile-enhancement
 * wizard. Mirrors the monorepo wizard's belt step (rank + promotion date +
 * promoter + school), but writes a baseline `RankAward` rather than the WP
 * `/me/profile` endpoint.
 */
export const setPassportRankSchema = z.object({
  rankId: z.string().min(1).max(191),
  awardedAt: z.coerce.date().nullish(),
  promotedBy: z.string().max(200).optional(),
  schoolName: z.string().max(200).optional(),
})

export type SetPassportRankInput = z.infer<typeof setPassportRankSchema>
