"use server"

import { Brand } from "~/.generated/prisma/client"
import { userActionClient } from "~/lib/safe-actions"
import {
  applyPassportAvatarPromotion,
  applyWebMediaPremium,
  applyWebMediaRemoval,
  applyWebMediaReorder,
  applyWebMediaUpload,
  applyWebMediaUrlAttach,
} from "~/server/web/media/apply-media"
import {
  attachWebMediaUrlSchema,
  promotePassportAvatarMediaSchema,
  removeWebMediaSchema,
  reorderWebMediaSchema,
  setWebMediaPremiumSchema,
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
      // @added SESSION_0529 (Slice 3B) — the cached technique reads (`findTechniqueBySlug`,
      // `findAuthoredTechnique`, `findAuthoredCurriculum`) all ride the `techniques` tag; without it
      // an attach/remove/url-paste left the watch page + profile curriculum rail stale for the
      // cacheLife TTL. Mirrors the Doug SESSION_0528 P2 fix already applied to `setWebMediaPremium`.
      tags.push("techniques")
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

// SESSION_0529 Slice 3B — member URL-paste video attach (YouTube-only, validated in the apply
// helper). The authored-technique sheet's video path; no file, no R2 — see `applyWebMediaUrlAttach`.
export const attachWebMediaUrl = userActionClient
  .inputSchema(attachWebMediaUrlSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const result = await applyWebMediaUrlAttach({ db, brand: Brand.BBL, user, input: parsedInput })

    revalidate(revalidateForTarget(parsedInput.target))

    return result
  })

// SESSION_0529 Slice 3B — persist the dnd sequencing rail's order (`sortOrder` = index).
export const reorderWebMediaAttachments = userActionClient
  .inputSchema(reorderWebMediaSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const result = await applyWebMediaReorder({ db, brand: Brand.BBL, user, input: parsedInput })

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

export const setWebMediaPremium = userActionClient
  .inputSchema(setWebMediaPremiumSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const result = await applyWebMediaPremium({ db, brand: Brand.BBL, user, input: parsedInput })

    // Also bust the PUBLIC technique surfaces — the freemium gate keys off this flag on the browse
    // rail + watch page + profile reels, not just the dashboard.
    const rt = revalidateForTarget(parsedInput.target)
    revalidate({ paths: [...rt.paths, "/techniques"], tags: [...rt.tags, "techniques"] })

    return result
  })
