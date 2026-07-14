import type { Prisma } from "~/.generated/prisma/client"

/**
 * Community post read-model payloads (SESSION_0493, ADR 0042 Amendment 1).
 *
 * Author identity resolves through the Passport canon at the READ layer
 * (`passport.displayName ?? user.name`, `passport.avatarUrl ?? user.image`) and is flattened to
 * plain strings before crossing into client components — never ship Prisma shapes/clients to the
 * browser (the Prisma-in-browser gotcha).
 */

export const communityPostManyPayload = {
  id: true,
  type: true,
  title: true,
  slug: true,
  content: true,
  videoUrl: true,
  imageUrl: true,
  status: true,
  // @added SESSION_0537 (FI-028b) — the per-post freemium flag (gates the read) + the raw authorId
  // (the OWNER leg of `isCommunityPostViewerEntitled`). `authorId` is SERVER-ONLY: it rides
  // `CommunityPostRowForGate` to the page-layer gate and is DROPPED before any client payload.
  isPremium: true,
  authorId: true,
  createdAt: true,
  style: { select: { id: true, name: true } },
  author: {
    select: {
      name: true,
      image: true,
      passport: { select: { displayName: true, avatarUrl: true } },
    },
  },
} satisfies Prisma.CommunityPostSelect

type CommunityPostRow = Prisma.CommunityPostGetPayload<{ select: typeof communityPostManyPayload }>

/**
 * The flattened, client-safe community post shape (strings only — no relations, NO `authorId`).
 * `isPremium` IS client-safe (drives the "Premium" badge on an UNLOCKED post); `authorId` is not —
 * it never crosses to a client component (see `CommunityPostRowForGate`).
 */
export type CommunityPostMany = {
  id: string
  type: "TECHNIQUE" | "TIP" | "SEMINAR" | "QA"
  title: string
  slug: string
  content: string
  excerpt: string
  videoUrl: string | null
  imageUrl: string | null
  isPremium: boolean
  isHidden: boolean
  createdAt: Date
  style: { id: string; name: string } | null
  authorName: string
  authorImage: string | null
}

/**
 * The SERVER-ONLY row the read gate consumes — `CommunityPostMany` plus the raw `authorId` needed for
 * the owner-leg entitlement compare. `gateCommunityPost` drops `authorId` before returning a
 * client-facing view, so it never reaches the browser.
 */
export type CommunityPostRowForGate = CommunityPostMany & { authorId: string }

/**
 * Derive a plain-text excerpt from the markdown content, server-side. Strips fenced code, images,
 * link targets and markdown tokens, then collapses whitespace. Same lightweight approach as the
 * editorial `plainText` derivation in `server/admin/posts/actions.ts` — no markdown parser needed
 * for a card teaser.
 */
export const communityPostExcerpt = (content: string, maxLength = 200): string => {
  const text = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_~`>-]/g, "")
    .replace(/\s+/g, " ")
    .trim()

  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text
}

/**
 * Flatten a Prisma row into the SERVER-ONLY gate-input shape (author resolved via the Passport
 * canon). Carries `authorId` for the owner-leg entitlement check; `gateCommunityPost` strips it
 * before the row crosses to a client component.
 */
export const toCommunityPostRowForGate = (row: CommunityPostRow): CommunityPostRowForGate => ({
  id: row.id,
  type: row.type,
  title: row.title,
  slug: row.slug,
  content: row.content,
  excerpt: communityPostExcerpt(row.content),
  videoUrl: row.videoUrl,
  imageUrl: row.imageUrl,
  isPremium: row.isPremium,
  isHidden: row.status === "HIDDEN",
  createdAt: row.createdAt,
  style: row.style,
  authorName: row.author.passport?.displayName ?? row.author.name ?? "Member",
  authorImage: row.author.passport?.avatarUrl ?? row.author.image ?? null,
  authorId: row.authorId,
})
