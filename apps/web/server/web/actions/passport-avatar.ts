"use server"

import { z } from "zod"
import { Brand } from "~/.generated/prisma/client"
import { getIP, isRateLimited } from "~/lib/rate-limiter"
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
 *
 * @changed SESSION_0474 (S2, D472-8) — IP-keyed `avatar_upload` rate-limit. Avatar
 * upload is granted to the free tier, so it is a storage-abuse surface (one network
 * minting many free accounts to flood R2). Mirrors the public `evidence_upload`
 * limiter (IP-keyed, fail-closed); see `lib/rate-limiter.ts`.
 */
export const uploadAndPromotePassportAvatar = userActionClient
  .inputSchema(uploadPassportAvatarSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    if (await isRateLimited(await getIP(), "avatar_upload")) {
      throw new Error("Too many avatar uploads. Please try again in a bit.")
    }

    const passport = await db.passport.findFirst({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!passport) throw new Error("PASSPORT_NOT_FOUND")

    const target = { kind: "passport" as const, id: passport.id }

    const upload = await applyWebMediaUpload({
      db,
      brand: Brand.BBL,
      user,
      input: { file: parsedInput.file, target, isPublic: true, title: "Avatar" },
    })

    const promotion = await applyPassportAvatarPromotion({
      db,
      brand: Brand.BBL,
      user,
      input: { target, attachmentId: upload.attachmentId },
    })

    revalidate({ paths: ["/app/profile"] })
    return { avatarUrl: promotion.avatarUrl }
  })
