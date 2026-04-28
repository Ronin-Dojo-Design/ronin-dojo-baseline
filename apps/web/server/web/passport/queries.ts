import { cache } from "react"
import { db } from "~/services/db"
import { passportOnePayload, directoryProfileOnePayload } from "~/server/web/passport/payloads"

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
