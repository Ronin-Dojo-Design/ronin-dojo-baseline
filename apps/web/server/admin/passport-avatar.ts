"use server"

import { z } from "zod"
import { adminActionClient } from "~/lib/safe-actions"
import { applyPassportAvatarPromotion, applyWebMediaUpload } from "~/server/web/media/apply-media"
import { webMediaFileSchema } from "~/server/web/media/media-schemas"

const setPassportAvatarAsAdminSchema = z.object({
  passportId: z.string().min(1),
  file: webMediaFileSchema.refine(
    f => f.type.startsWith("image/"),
    "Only image files are allowed for avatars.",
  ),
})

/**
 * Admin-gated sibling of `uploadAndPromotePassportAvatar` (SESSION_0437_TASK_0A).
 *
 * Many imported BBL member photos are full-body shots that a centered square crop
 * decapitates, and most members are *unclaimed placeholder* Passports (no owner
 * account) that the self-service flow can never reach. This action lets an admin
 * crop + set the avatar of ANY passport, including placeholders.
 *
 * Authorization is layered: the `adminActionClient` middleware enforces the
 * `role === "admin"` gate, and we pass the explicit `allowAdminOverride` flag down
 * to `authorizeMediaTarget` so the placeholder-passport bypass is reachable ONLY
 * from this path. The self-service action does NOT set the flag, so the non-admin
 * passport-ownership boundary is unchanged.
 */
export const setPassportAvatarAsAdmin = adminActionClient
  .inputSchema(setPassportAvatarAsAdminSchema)
  .action(async ({ parsedInput, ctx: { user, db, brand, revalidate } }) => {
    const passport = await db.passport.findFirst({
      where: { id: parsedInput.passportId },
      select: { id: true },
    })
    if (!passport) throw new Error("PASSPORT_NOT_FOUND")

    const target = { kind: "passport" as const, id: passport.id }

    const upload = await applyWebMediaUpload({
      db,
      brand,
      user,
      input: { file: parsedInput.file, target, isPublic: true, title: "Avatar" },
      allowAdminOverride: true,
    })

    const promotion = await applyPassportAvatarPromotion({
      db,
      brand,
      user,
      input: { target, attachmentId: upload.attachmentId },
      allowAdminOverride: true,
    })

    revalidate({ paths: ["/app/profile"], tags: ["passport", "lineage"] })
    return { avatarUrl: promotion.avatarUrl }
  })
