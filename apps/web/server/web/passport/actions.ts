"use server"

import { z } from "zod"
import { DirectoryVisibility, Gender } from "~/.generated/prisma/client"
import { userActionClient } from "~/lib/safe-actions"

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const updatePassportSchema = z.object({
  displayName: z.string().max(100).optional(),
  legalFirstName: z.string().max(100).optional(),
  legalLastName: z.string().max(100).optional(),
  dob: z.coerce.date().nullish(),
  gender: z.nativeEnum(Gender).nullish(),
  phoneE164: z.string().max(20).optional(),
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactPhoneE164: z.string().max(20).optional(),
  avatarUrl: z.string().url().max(2048).optional(),
  bio: z.string().max(2000).optional(),
  socialLinks: z.record(z.string(), z.string().url()).optional(),
})

export const updateDirectoryProfileSchema = z.object({
  visibility: z.nativeEnum(DirectoryVisibility).optional(),
  locationCity: z.string().max(100).optional(),
  locationRegion: z.string().max(100).optional(),
  locationCountry: z.string().length(2).optional(),
  showEmail: z.boolean().optional(),
  showPhone: z.boolean().optional(),
  showOrgs: z.boolean().optional(),
  showRanks: z.boolean().optional(),
})

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
