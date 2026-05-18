import { cache } from "react"
import { directoryProfileOnePayload, passportOnePayload } from "~/server/web/passport/payloads"
import { db } from "~/services/db"

/**
 * Fetch Passport + DirectoryProfile for a given user.
 * Returns null if the user has no passport yet (shouldn't happen post-S2).
 */
export const getPassportByUserId = cache(async (userId: string) => {
  return db.passport.findUnique({
    where: { userId },
    select: passportOnePayload,
  })
})

export const getDirectoryProfileByUserId = cache(async (userId: string) => {
  return db.directoryProfile.findUnique({
    where: { userId },
    select: directoryProfileOnePayload,
  })
})
