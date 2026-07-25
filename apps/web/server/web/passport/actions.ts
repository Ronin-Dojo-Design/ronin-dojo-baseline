"use server"

import { userActionClient } from "~/lib/safe-actions"
import {
  splitPassportAndProfileInput,
  updateDirectoryProfileSchema,
  updatePassportAndProfileSchema,
  updatePassportSchema,
} from "./schemas"

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

    revalidate({ paths: ["/app/profile"] })
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

    revalidate({ paths: ["/app/profile"] })
    return profile
  })

/**
 * Combined Passport + DirectoryProfile update (WL-P2-45, SESSION_0700) — the action
 * behind the PassportEditor's ONE Save. Both halves persist in a single interactive
 * transaction: partial failure (either update throwing) rolls the WHOLE write back,
 * so the owner never lands in a half-saved identity state. The granular
 * `updatePassport` / `updateDirectoryProfile` twins above remain for granular
 * consumers — this orchestrates, it does not replace them.
 */
export const updatePassportAndProfile = userActionClient
  .inputSchema(updatePassportAndProfileSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const { passport: passportData, directoryProfile: profileData } =
      splitPassportAndProfileInput(parsedInput)

    const result = await db.$transaction(async tx => {
      // Passport first — it resolves the DirectoryProfile key (Phase 3c: profile is
      // Passport-rooted), and identity is the SoT half (ADR 0025).
      const passport = await tx.passport.update({
        where: { userId: user.id },
        data: passportData,
      })
      const directoryProfile = await tx.directoryProfile.update({
        where: { passportId: passport.id },
        data: profileData,
      })
      return { passport, directoryProfile }
    })

    revalidate({ paths: ["/app/profile"] })
    return result
  })
