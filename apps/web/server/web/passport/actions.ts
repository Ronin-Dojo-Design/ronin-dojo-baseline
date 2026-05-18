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
    const profile = await db.directoryProfile.update({
      where: { userId: user.id },
      data: parsedInput,
    })

    revalidate({ paths: ["/me"] })
    return profile
  })
