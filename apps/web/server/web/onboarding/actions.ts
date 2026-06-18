"use server"

import { userActionClient } from "~/lib/safe-actions"
import { setPassportRankSchema } from "./schemas"

/**
 * Set the signed-in member's current belt from the profile-enhancement wizard.
 *
 * Reuses the existing `RankAward` model (no migration): the earner is the
 * account's Passport, `source: STATED` + `verificationStatus: UNVERIFIED` mark
 * it as a self-reported rank awaiting verification — the same shape the admin
 * add-person flow writes (`server/admin/users/actions.ts`). `RankAward` is
 * `@@unique([passportId, rankId])`, so we upsert: re-running the wizard for the
 * same belt updates the promotion date/promoter/school rather than throwing.
 *
 * NOTE (flagged in PR): baseline had no member-facing rank-award seam — only the
 * admin one — so this thin action is the new seam. It introduces no schema change.
 */
export const setPassportRank = userActionClient
  .inputSchema(setPassportRankSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const passport = await db.passport.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!passport) throw new Error("PASSPORT_NOT_FOUND")

    const { rankId, awardedAt, promotedBy, schoolName } = parsedInput
    const data = {
      awardedAt: awardedAt ?? null,
      notes: promotedBy?.trim() ? promotedBy.trim() : null,
      location: schoolName?.trim() ? schoolName.trim() : null,
    }

    const award = await db.rankAward.upsert({
      where: { passportId_rankId: { passportId: passport.id, rankId } },
      create: {
        passportId: passport.id,
        rankId,
        source: "STATED",
        verificationStatus: "UNVERIFIED",
        ...data,
      },
      update: data,
      select: { id: true },
    })

    revalidate({ paths: ["/me", "/app/profile"] })
    return award
  })
