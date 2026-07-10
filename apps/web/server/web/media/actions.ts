"use server"

import { Brand } from "~/.generated/prisma/client"
import { userActionClient } from "~/lib/safe-actions"
import {
  applyPassportAvatarPromotion,
  applyWebMediaRemoval,
  applyWebMediaUpload,
} from "~/server/web/media/apply-media"
import {
  promotePassportAvatarMediaSchema,
  removeWebMediaSchema,
  uploadWebMediaSchema,
} from "~/server/web/media/media-schemas"
import type { MediaAttachTarget } from "~/server/web/media/media-targets"

function revalidateForTarget(target: MediaAttachTarget) {
  const paths = ["/dashboard"]
  const tags = ["media"]

  switch (target.kind) {
    case "promotionEvent":
      paths.push("/events", `/dashboard/events/${target.id}`)
      tags.push("promotion-events")
      break
    case "technique":
      paths.push(`/dashboard/techniques/${target.id}`)
      break
    case "organization":
      tags.push("organization")
      break
    case "course":
      paths.push("/courses", `/app/courses/${target.id}`)
      tags.push("courses")
      break
    case "passport":
      paths.push("/app/profile")
      tags.push("passport")
      break
    case "rankMilestone":
      paths.push("/app/profile")
      break
    default:
      break
  }

  return { paths, tags }
}

export const uploadWebMedia = userActionClient
  .inputSchema(uploadWebMediaSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    // The general media library accepts video (technique/course/event media). The
    // dedicated avatar upload actions use the fail-closed `allowVideo: false` default,
    // and avatar *promotion* additionally rejects any non-IMAGE media.
    const result = await applyWebMediaUpload({
      db,
      brand: Brand.BBL,
      user,
      input: parsedInput,
      allowVideo: true,
    })

    revalidate(revalidateForTarget(parsedInput.target))

    return result
  })

export const promotePassportAvatarMedia = userActionClient
  .inputSchema(promotePassportAvatarMediaSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const result = await applyPassportAvatarPromotion({
      db,
      brand: Brand.BBL,
      user,
      input: parsedInput,
    })

    revalidate(revalidateForTarget(parsedInput.target))

    return result
  })

export const removeWebMedia = userActionClient
  .inputSchema(removeWebMediaSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const result = await applyWebMediaRemoval({ db, brand: Brand.BBL, user, input: parsedInput })

    revalidate(revalidateForTarget(parsedInput.target))

    return result
  })
