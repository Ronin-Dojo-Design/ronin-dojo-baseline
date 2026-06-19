"use server"

import { z } from "zod"
import { getRequestBrand } from "~/lib/brand-context"
import { userActionClient } from "~/lib/safe-actions"
import { applyPassportAvatarPromotion, applyWebMediaUpload } from "~/server/web/media/apply-media"
import { webMediaFileSchema } from "~/server/web/media/media-schemas"

const uploadPassportAvatarSchema = z.object({
  file: webMediaFileSchema.refine(
    f => f.type.startsWith("image/"),
    "Only image files are allowed for avatars.",
  ),
})

/**
 * Upload a file to R2, create a `MediaAttachment` on the caller's Passport,
 * then promote it to `Passport.avatarUrl` — all in a single client call.
 * Uses `userActionClient` (not the entitlement-gated `mediaUploadActionClient`)
 * because avatar upload is a basic self-service action: `authorizeMediaTarget`
 * enforces the passport-ownership check inside `applyWebMediaUpload`.
 */
export const uploadAndPromotePassportAvatar = userActionClient
  .inputSchema(uploadPassportAvatarSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const brand = await getRequestBrand()

    const passport = await db.passport.findFirst({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!passport) throw new Error("PASSPORT_NOT_FOUND")

    const target = { kind: "passport" as const, id: passport.id }

    const upload = await applyWebMediaUpload({
      db,
      brand,
      user,
      input: { file: parsedInput.file, target, isPublic: true, title: "Avatar" },
    })

    const promotion = await applyPassportAvatarPromotion({
      db,
      brand,
      user,
      input: { target, attachmentId: upload.attachmentId },
    })

    revalidate({ paths: ["/me", "/app/profile"] })
    return { avatarUrl: promotion.avatarUrl }
  })
