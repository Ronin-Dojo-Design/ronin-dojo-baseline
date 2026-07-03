"use server"

import { resolveBrand } from "~/lib/brand-context"
import { uploadToS3Storage } from "~/lib/media"
import { sniffUploadBuffer } from "~/lib/media-guard"
import { isRateLimited } from "~/lib/rate-limiter"
import { adminActionClient, userActionClient } from "~/lib/safe-actions"
import { generateUniqueSlug } from "~/lib/slug"
import { isAllowedCommunityImageUrl } from "~/server/web/community/media-url"
import {
  communityPostImageSchema,
  createCommunityPostSchema,
  setCommunityPostStatusSchema,
} from "~/server/web/community/schema"
import { getMediaConfig } from "~/services/s3"

// =============================================================================
// Community post actions (SESSION_0493, ADR 0042 Amendment 1) — the member write surface for the
// `/posts` feed. Authz via the established safe-action chain (NOT a 5th authz system):
//   - create + image upload → `userActionClient` (any signed-in member)
//   - hide/unhide           → `adminActionClient` (post-moderation; role === "admin")
// `authorId` derives from the session — never from client input.
// =============================================================================

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

/**
 * Member-safe post-image upload — the session-gated sibling of the join funnel's guest evidence
 * upload (`uploadJoinLegacyEvidence`): actor-keyed rate limit, hard server-side byte ceiling,
 * magic-byte sniff (SVG rejected — stored-XSS guard), isolated `community-posts/` prefix. The
 * entitlement-gated `mediaUploadActionClient` seam is deliberately NOT widened for this — that gate
 * protects org/admin media management, not member feed posts.
 */
export const uploadCommunityPostImage = userActionClient
  .inputSchema(communityPostImageSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    if (await isRateLimited(user.id, "community_image_upload")) {
      throw new Error("Too many image uploads. Please try again in a bit.")
    }

    const { buffer } = await sniffUploadBuffer(parsedInput.file, { maxBytes: MAX_IMAGE_BYTES })
    const url = await uploadToS3Storage(
      buffer,
      `community-posts/${crypto.randomUUID()}`,
      resolveBrand(),
    )

    return { url }
  })

/**
 * Create a community post. Signed-in members only; publishes immediately (post-moderation model —
 * `status` defaults to PUBLISHED in the schema). Slug is generated HERE explicitly:
 * `CommunityPost` is intentionally NOT covered by `uniqueSlugsExtension` (which re-slugs on
 * UPDATE — the SESSION_0485 Post seed trap), so the slug is stable for the row's lifetime.
 */
export const createCommunityPost = userActionClient
  .inputSchema(createCommunityPostSchema)
  .action(async ({ parsedInput, ctx: { db, user, revalidate } }) => {
    if (await isRateLimited(user.id, "community_post_write")) {
      throw new Error("You're posting too fast. Please try again in a minute.")
    }

    const brand = resolveBrand()
    const videoUrl = parsedInput.videoUrl?.trim() || null
    const imageUrl = parsedInput.imageUrl?.trim() || null
    const styleId = parsedInput.styleId?.trim() || null

    if (imageUrl && !isAllowedCommunityImageUrl(imageUrl, getMediaConfig(brand))) {
      throw new Error("Post images must be uploaded through the post form.")
    }

    if (styleId) {
      const style = await db.style.findFirst({
        where: { id: styleId, status: "APPROVED" },
        select: { id: true },
      })
      if (!style) {
        throw new Error("Unknown style.")
      }
    }

    const slug = await generateUniqueSlug({
      source: parsedInput.title,
      isSlugTaken: async candidate =>
        Boolean(
          await db.communityPost.findUnique({ where: { slug: candidate }, select: { slug: true } }),
        ),
    })

    const post = await db.communityPost.create({
      data: {
        type: parsedInput.type,
        title: parsedInput.title,
        slug,
        content: parsedInput.content,
        videoUrl,
        imageUrl,
        styleId,
        brand,
        // The GAINER invariant: authorship comes from the SESSION, never client input.
        authorId: user.id,
      },
      select: { id: true, slug: true },
    })

    revalidate({ paths: ["/posts"] })

    return post
  })

/**
 * Post-moderation hide/unhide — ADMIN ONLY (`adminActionClient`). Members — including the post's
 * own author — cannot toggle status: hiding is a moderation verdict, not an author control.
 * Hidden posts drop out of every public query and 404 on detail for non-admins.
 */
export const setCommunityPostStatus = adminActionClient
  .inputSchema(setCommunityPostStatusSchema)
  .action(async ({ parsedInput: { id, hidden }, ctx: { db, revalidate } }) => {
    const post = await db.communityPost.update({
      where: { id },
      data: { status: hidden ? "HIDDEN" : "PUBLISHED" },
      select: { id: true, slug: true, status: true },
    })

    revalidate({ paths: ["/posts", `/posts/${post.slug}`] })

    return post
  })
