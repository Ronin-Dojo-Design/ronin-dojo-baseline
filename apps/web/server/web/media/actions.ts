"use server"

import { getRequestBrand } from "~/lib/brand-context"
import { userActionClient } from "~/lib/safe-actions"
import { applyWebMediaRemoval, applyWebMediaUpload } from "~/server/web/media/apply-media"
import { removeWebMediaSchema, uploadWebMediaSchema } from "~/server/web/media/media-schemas"
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
    default:
      break
  }

  return { paths, tags }
}

export const uploadWebMedia = userActionClient
  .inputSchema(uploadWebMediaSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const brand = await getRequestBrand()
    const result = await applyWebMediaUpload({ db, brand, user, input: parsedInput })

    revalidate(revalidateForTarget(parsedInput.target))

    return result
  })

export const removeWebMedia = userActionClient
  .inputSchema(removeWebMediaSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const brand = await getRequestBrand()
    const result = await applyWebMediaRemoval({ db, brand, user, input: parsedInput })

    revalidate(revalidateForTarget(parsedInput.target))

    return result
  })
