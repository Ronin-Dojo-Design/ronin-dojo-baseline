"use server"

import type { z } from "zod"
import { adminActionClient } from "~/lib/safe-actions"
import {
  updateDirectoryProfileAsAdminSchema,
  updatePassportAndProfileAsAdminSchema,
  updatePassportAsAdminSchema,
} from "~/server/admin/people/schemas"
import { splitPassportAndProfileInput } from "~/server/web/passport/schemas"

// ---------------------------------------------------------------------------
// Admin Passport / DirectoryProfile editors (WL-P2-35, ADR 0045 D3, ADR 0025)
// ---------------------------------------------------------------------------
//
// The self-serve twins (`server/web/passport/actions.ts` — `updatePassport` /
// `updateDirectoryProfile`) are `userActionClient` keyed `where: { userId: user.id }`
// (SELF-edit). These are the admin-mode siblings: same field schemas (from
// `./schemas`), but keyed by an explicit `passportId` and gated by `adminActionClient`
// so an admin can edit ANOTHER person's Passport — including accountless placeholders
// (`passport.userId == null`) that have no self-serve door. Do NOT merge with the
// self-serve actions: different authz (admin vs owner) and different key (passportId vs
// session userId). The ONE `PassportEditor` is reused for both by injecting the action
// + schema as props.

/**
 * The upsert `create` payload for a DirectoryProfile born on first admin edit.
 * `create` needs concrete values, so undefined partial-update fields fall back to
 * the model defaults. Shared by the granular and combined admin actions below.
 */
const directoryProfileCreateData = (
  passportId: string,
  data: Omit<z.infer<typeof updateDirectoryProfileAsAdminSchema>, "passportId">,
) => ({
  passportId,
  slug: data.slug ?? undefined,
  visibility: data.visibility ?? undefined,
  locationCity: data.locationCity ?? undefined,
  locationRegion: data.locationRegion ?? undefined,
  locationCountry: data.locationCountry ?? undefined,
  showEmail: data.showEmail ?? undefined,
  showPhone: data.showPhone ?? undefined,
  showOrgs: data.showOrgs ?? undefined,
  showRanks: data.showRanks ?? undefined,
  coverPhotoUrl: data.coverPhotoUrl ?? undefined,
  videoIntroUrl: data.videoIntroUrl ?? undefined,
})

export const updatePassportAsAdmin = adminActionClient
  .inputSchema(updatePassportAsAdminSchema)
  .action(async ({ parsedInput: { passportId, ...data }, ctx: { db, revalidate } }) => {
    const passport = await db.passport.update({
      where: { id: passportId },
      data,
    })

    revalidate({ paths: ["/app/users", `/app/users/${passportId}`] })
    return passport
  })

export const updateDirectoryProfileAsAdmin = adminActionClient
  .inputSchema(updateDirectoryProfileAsAdminSchema)
  .action(async ({ parsedInput: { passportId, ...data }, ctx: { db, revalidate } }) => {
    // Accountless roster placeholders never got a DirectoryProfile (only the sign-up
    // hook / add-person-with-account paths create one), so upsert: create a default
    // profile on first admin edit, update it thereafter.
    const profile = await db.directoryProfile.upsert({
      where: { passportId },
      update: data,
      create: directoryProfileCreateData(passportId, data),
    })

    revalidate({ paths: ["/app/users", `/app/users/${passportId}`] })
    return profile
  })

/**
 * Combined admin twin (WL-P2-45, SESSION_0700) — one submit from the admin-mode
 * PassportEditor persists both halves atomically ($transaction: partial failure
 * rolls back the whole write). Keyed by the explicit `passportId` like the granular
 * admin actions above; keeps their upsert semantics for accountless placeholders
 * that never got a DirectoryProfile.
 */
export const updatePassportAndProfileAsAdmin = adminActionClient
  .inputSchema(updatePassportAndProfileAsAdminSchema)
  .action(async ({ parsedInput: { passportId, ...data }, ctx: { db, revalidate } }) => {
    const { passport: passportData, directoryProfile: profileData } =
      splitPassportAndProfileInput(data)

    const result = await db.$transaction(async tx => {
      const passport = await tx.passport.update({
        where: { id: passportId },
        data: passportData,
      })
      const directoryProfile = await tx.directoryProfile.upsert({
        where: { passportId },
        update: profileData,
        create: directoryProfileCreateData(passportId, profileData),
      })
      return { passport, directoryProfile }
    })

    revalidate({ paths: ["/app/users", `/app/users/${passportId}`] })
    return result
  })
