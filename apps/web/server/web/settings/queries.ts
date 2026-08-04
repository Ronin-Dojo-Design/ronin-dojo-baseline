import { cache } from "react"
import { db } from "~/services/db"
import { type MemberSettings, normalizeMemberSettings } from "./member-settings"

/**
 * Read the authenticated member's persisted settings off their Passport, normalized to a
 * fully-populated {@link MemberSettings}. A missing Passport or null `memberPreferences`
 * resolves to defaults — the settings page always has a stable form to render.
 */
export const getOwnMemberSettings = cache(async (userId: string): Promise<MemberSettings> => {
  const passport = await db.passport.findUnique({
    where: { userId },
    select: { memberPreferences: true },
  })

  return normalizeMemberSettings(passport?.memberPreferences)
})
