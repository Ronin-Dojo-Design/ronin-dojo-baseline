"use server"

import { userActionClient } from "~/lib/safe-actions"
import { memberSettingsSchema } from "./member-settings"

/**
 * Persist the member's settings blob to `Passport.memberPreferences`.
 *
 * Pure DB write — no email/Resend send happens here even when the security toggles
 * ("email me new login activity", "recovery alerts") change; those gate a future
 * notification seam, so saving settings stays side-effect-free and test-safe.
 */
export const updateMemberSettings = userActionClient
  .inputSchema(memberSettingsSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const passport = await db.passport.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!passport) {
      throw new Error("PASSPORT_NOT_FOUND")
    }

    await db.passport.update({
      where: { id: passport.id },
      data: { memberPreferences: parsedInput },
    })

    revalidate({ paths: ["/me/settings", "/me"] })
    return parsedInput
  })
