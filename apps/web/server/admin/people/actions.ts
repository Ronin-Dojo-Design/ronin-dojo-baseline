"use server"

import { adminActionClient } from "~/lib/safe-actions"
import {
  updateDirectoryProfileAsAdminSchema,
  updatePassportAsAdminSchema,
} from "~/server/admin/people/schemas"

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
    // profile on first admin edit, update it thereafter. `create` needs concrete
    // values, so undefined partial-update fields fall back to the model defaults.
    const profile = await db.directoryProfile.upsert({
      where: { passportId },
      update: data,
      create: {
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
      },
    })

    revalidate({ paths: ["/app/users", `/app/users/${passportId}`] })
    return profile
  })
