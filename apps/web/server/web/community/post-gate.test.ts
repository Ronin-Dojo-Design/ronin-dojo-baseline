/**
 * SESSION_0537 (FI-028b) — adversarial no-leak test for the per-post community read gate. Proves the
 * PAYLOAD-LAYER invariant: a locked premium post's `content`/`videoUrl`/`imageUrl` (and the
 * server-only `authorId`) NEVER reach an unentitled viewer's view — they are stripped, and the strip
 * is TYPE-ENCODED so no key exists to leak. The bounded `excerpt` teaser is KEPT (the conversion
 * hook, operator grill Q2).
 *
 * `gateCommunityPost` is a pure function (no DB, no React, no session) → ZERO mocks.
 * `isCommunityPostViewerEntitled` is likewise pure/synchronous.
 *
 * Run: cd apps/web && bun test server/web/community/post-gate.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module
import { describe, expect, it } from "bun:test"
import { isCommunityPostViewerEntitled } from "./post-access"
import type { CommunityViewerContext } from "./post-access"
import { gateCommunityPost } from "./post-gate"
import type { CommunityPostRowForGate } from "./payloads"

const PREMIUM_CONTENT = "SECRET premium body — the paywalled written tip."
const PREMIUM_VIDEO = "https://youtube.com/watch?v=PREMIUMVIDEOID"
const PREMIUM_IMAGE = "https://r2.example.com/community-posts/premium-image.jpg"

function row(overrides: Partial<CommunityPostRowForGate> = {}): CommunityPostRowForGate {
  return {
    id: "post-1",
    type: "TIP",
    title: "Premium Tip",
    slug: "premium-tip",
    content: PREMIUM_CONTENT,
    excerpt: "Premium body teaser…",
    videoUrl: PREMIUM_VIDEO,
    imageUrl: PREMIUM_IMAGE,
    isPremium: true,
    isHidden: false,
    createdAt: new Date("2026-07-01T00:00:00Z"),
    style: { id: "style-1", name: "Brazilian Jiu-Jitsu" },
    authorName: "Passport Name",
    authorImage: "https://media.test/passport.jpg",
    authorId: "user-author",
    ...overrides,
  }
}

// Collect every string reachable in the gated view — the leak assertion greps this.
function allStrings(value: unknown): string[] {
  if (typeof value === "string") return [value]
  if (Array.isArray(value)) return value.flatMap(allStrings)
  if (value && typeof value === "object") return Object.values(value).flatMap(allStrings)
  return []
}

const ANON: CommunityViewerContext = { userId: null, isAdmin: false, hasPaidTier: false }

describe("gateCommunityPost — per-post payload-layer no-leak", () => {
  it("premium post + NOT entitled → locked, and content/video/image keys DO NOT EXIST on the view", () => {
    const view = gateCommunityPost(row(), false)

    expect(view.locked).toBe(true)
    // Type-encoded strip — the keys are ABSENT, not merely undefined.
    expect("content" in view.post).toBe(false)
    expect("videoUrl" in view.post).toBe(false)
    expect("imageUrl" in view.post).toBe(false)
    // authorId (server-only owner-leg field) never crosses either.
    expect("authorId" in view.post).toBe(false)
    // The excerpt hook + identity ARE kept.
    expect(view.post.excerpt).toBe("Premium body teaser…")
    expect(view.post.title).toBe("Premium Tip")
    expect(view.post.isPremium).toBe(true)
  })

  it("no gated bytes anywhere in the locked payload (adversarial deep-string grep)", () => {
    const view = gateCommunityPost(row(), false)
    const strings = allStrings(view)

    expect(strings.some(s => s.includes("SECRET premium body"))).toBe(false)
    expect(strings.some(s => s.includes("PREMIUMVIDEOID"))).toBe(false)
    expect(strings.some(s => s.includes("premium-image"))).toBe(false)
    // authorId not leaked as a string either.
    expect(strings.some(s => s.includes("user-author"))).toBe(false)
    // The excerpt IS present (the intentional teaser hook).
    expect(strings.some(s => s.includes("Premium body teaser"))).toBe(true)
  })

  it("entitled → full post with content/video/image PRESENT, authorId stripped", () => {
    const view = gateCommunityPost(row(), true)

    expect(view.locked).toBe(false)
    expect(view.locked === false && view.post.content).toBe(PREMIUM_CONTENT)
    expect(view.locked === false && view.post.videoUrl).toBe(PREMIUM_VIDEO)
    expect(view.locked === false && view.post.imageUrl).toBe(PREMIUM_IMAGE)
    // authorId is dropped even on the unlocked branch (server-only).
    expect("authorId" in view.post).toBe(false)
  })

  it("a NON-premium post gated with entitled=true keeps its isPremium=false flag", () => {
    const view = gateCommunityPost(row({ isPremium: false }), true)

    expect(view.locked).toBe(false)
    expect(view.locked === false && view.post.isPremium).toBe(false)
  })
})

describe("isCommunityPostViewerEntitled — the VIEWER-keyed read resolver", () => {
  const premium = { isPremium: true, authorId: "user-author" }
  const free = { isPremium: false, authorId: "user-author" }

  it("free post → entitled for EVERYONE (incl. anon)", () => {
    expect(isCommunityPostViewerEntitled(free, ANON)).toBe(true)
    expect(isCommunityPostViewerEntitled(free, { userId: "u", isAdmin: false, hasPaidTier: false })).toBe(
      true,
    )
  })

  it("premium post + anon → NOT entitled (locked)", () => {
    expect(isCommunityPostViewerEntitled(premium, ANON)).toBe(false)
  })

  it("premium post + free signed-in viewer (other user, no tier) → NOT entitled", () => {
    expect(
      isCommunityPostViewerEntitled(premium, {
        userId: "user-other",
        isAdmin: false,
        hasPaidTier: false,
      }),
    ).toBe(false)
  })

  it("premium post + admin → entitled", () => {
    expect(
      isCommunityPostViewerEntitled(premium, { userId: "user-admin", isAdmin: true, hasPaidTier: false }),
    ).toBe(true)
  })

  it("premium post + author (authorId === userId) → entitled", () => {
    expect(
      isCommunityPostViewerEntitled(premium, {
        userId: "user-author",
        isAdmin: false,
        hasPaidTier: false,
      }),
    ).toBe(true)
  })

  it("premium post + paid tier → entitled", () => {
    expect(
      isCommunityPostViewerEntitled(premium, {
        userId: "user-paid",
        isAdmin: false,
        hasPaidTier: true,
      }),
    ).toBe(true)
  })
})
