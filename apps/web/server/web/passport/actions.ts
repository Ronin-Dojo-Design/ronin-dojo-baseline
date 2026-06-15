"use server"

import { userActionClient } from "~/lib/safe-actions"
import { updateDirectoryProfileSchema, updatePassportSchema } from "./schemas"

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export const updatePassport = userActionClient
  .inputSchema(updatePassportSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const passport = await db.passport.update({
      where: { userId: user.id },
      data: parsedInput,
    })

    revalidate({ paths: ["/me"] })
    return passport
  })

export const updateDirectoryProfile = userActionClient
  .inputSchema(updateDirectoryProfileSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    // Phase 3c: DirectoryProfile is Passport-rooted; resolve the account's Passport, then update by it.
    const passport = await db.passport.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!passport) throw new Error("PASSPORT_NOT_FOUND")
    const profile = await db.directoryProfile.update({
      where: { passportId: passport.id },
      data: parsedInput,
    })

    revalidate({ paths: ["/me"] })
    return profile
  })
