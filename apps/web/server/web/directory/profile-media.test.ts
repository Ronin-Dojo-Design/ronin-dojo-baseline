/**
 * SESSION_0526 (Step B2) — pinning unit test for `buildProfileMedia` (SESSION_0525 profile
 * Highlights). Locks the CORRECT behavior of the pure DTO shaper so the Step C extraction
 * (`toMediaItem`) cannot silently change routing, and encodes the A2 security invariant
 * (a LOCKED premium reel must never leak its raw media url).
 *
 * Pure function — no DB, no React, no email/notify path — so this file needs ZERO mocks.
 *
 * Run: cd apps/web && bun test server/web/directory/profile-media.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module
import { describe, expect, it } from "bun:test"
import type { PublicPassportMedia } from "~/server/web/media/queries"
import { buildProfileMedia } from "./profile-media"

// Fixture factory — one attachment with sane defaults; each case overrides the axis it exercises.
let seq = 0
function media(partial: Partial<PublicPassportMedia>): PublicPassportMedia {
  seq += 1
  return {
    id: `media_${seq}`,
    type: "VIDEO",
    url: "https://r2.example.com/asset.mp4",
    thumbnailUrl: null,
    title: null,
    durationSec: null,
    purpose: null,
    techniqueSlug: null,
    techniqueIsPremium: null,
    sortOrder: seq,
    ...partial,
  }
}

const YT = "https://youtu.be/dQw4w9WgXcQ"
const YT_THUMB = "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"

describe("buildProfileMedia — rail routing", () => {
  it("routes a `match` purpose to featuredMatches (public, external, never locked)", () => {
    const result = buildProfileMedia({
      viewerEntitled: false,
      media: [
        media({
          id: "m1",
          type: "YOUTUBE",
          url: YT,
          purpose: "featured-match",
          title: "Title Fight",
        }),
      ],
    })

    expect(result.featuredMatches).toHaveLength(1)
    expect(result.techniqueVideos).toHaveLength(0)
    expect(result.podcasts).toHaveLength(0)
    const match = result.featuredMatches[0]
    expect(match.id).toBe("m1")
    expect(match.href).toBe(YT)
    expect(match.external).toBe(true)
    expect(match.subtitle).toBe("Match")
    expect(match.locked).toBe(false)
    // No stored poster → derived from the YouTube watch url.
    expect(match.thumbnailUrl).toBe(YT_THUMB)
  })

  it("routes a `podcast` purpose to podcasts (public, external, provider-labelled)", () => {
    const result = buildProfileMedia({
      viewerEntitled: false,
      media: [
        media({
          id: "p1",
          type: "YOUTUBE",
          url: "https://open.spotify.com/episode/abc123",
          purpose: "podcast-highlight",
          title: "Ep 12",
        }),
      ],
    })

    expect(result.podcasts).toHaveLength(1)
    expect(result.featuredMatches).toHaveLength(0)
    expect(result.techniqueVideos).toHaveLength(0)
    const podcast = result.podcasts[0]
    expect(podcast.href).toBe("https://open.spotify.com/episode/abc123")
    expect(podcast.external).toBe(true)
    expect(podcast.subtitle).toBe("Spotify")
    expect(podcast.locked).toBe(false)
  })

  it("routes a `technique` purpose (and any bare video) to techniqueVideos", () => {
    const result = buildProfileMedia({
      viewerEntitled: false,
      media: [
        media({ id: "t1", purpose: "technique-highlight" }),
        // No purpose but a VIDEO type still lands on the technique rail.
        media({ id: "t2", purpose: null, type: "VIDEO" }),
      ],
    })

    expect(result.techniqueVideos.map(i => i.id)).toEqual(["t1", "t2"])
  })
})

describe("buildProfileMedia — freemium locking + A2 raw-url invariant", () => {
  it("UNLOCKED free reel WITH a slug links internally to /techniques/[slug]", () => {
    const result = buildProfileMedia({
      viewerEntitled: false,
      media: [
        media({
          id: "free-slug",
          purpose: "technique-highlight",
          techniqueSlug: "armbar-from-guard",
          techniqueIsPremium: false,
          thumbnailUrl: "https://r2.example.com/armbar.jpg",
        }),
      ],
    })

    const item = result.techniqueVideos[0]
    expect(item.href).toBe("/techniques/armbar-from-guard")
    expect(item.external).toBe(false)
    expect(item.locked).toBe(false)
  })

  it("UNLOCKED free reel WITHOUT a slug exposes its raw media url (external)", () => {
    const result = buildProfileMedia({
      viewerEntitled: false,
      media: [
        media({
          id: "free-noslug",
          purpose: "technique-highlight",
          url: "https://r2.example.com/free-reel.mp4",
          techniqueSlug: null,
          techniqueIsPremium: false,
        }),
      ],
    })

    const item = result.techniqueVideos[0]
    expect(item.href).toBe("https://r2.example.com/free-reel.mp4")
    expect(item.external).toBe(true)
    expect(item.locked).toBe(false)
  })

  it("LOCKED premium reel WITH a slug withholds the raw url and links internally", () => {
    const result = buildProfileMedia({
      viewerEntitled: false,
      media: [
        media({
          id: "prem-slug",
          purpose: "technique-highlight",
          url: "https://r2.example.com/premium-reel.mp4",
          techniqueSlug: "berimbolo",
          techniqueIsPremium: true,
        }),
      ],
    })

    const item = result.techniqueVideos[0]
    expect(item.locked).toBe(true)
    expect(item.external).toBe(false)
    expect(item.href).toBe("/techniques/berimbolo")
    // The raw playable url NEVER reaches the client for a locked premium reel.
    expect(item.href).not.toContain("r2.example.com")
  })

  it("A2 invariant: a LOCKED premium reel WITHOUT a slug is DROPPED (no raw-url leak)", () => {
    const result = buildProfileMedia({
      viewerEntitled: false,
      media: [
        media({
          id: "prem-noslug-leak",
          purpose: "technique-highlight",
          url: "https://r2.example.com/leaky-premium.mp4",
          techniqueSlug: null,
          techniqueIsPremium: true,
        }),
      ],
    })

    // Dropped entirely — not surfaced on any rail.
    expect(result.techniqueVideos).toHaveLength(0)
    const allHrefs = [...result.featuredMatches, ...result.techniqueVideos, ...result.podcasts].map(
      i => i.href,
    )
    expect(allHrefs.some(href => href.includes("leaky-premium"))).toBe(false)
  })

  it("an ENTITLED viewer unlocks the premium reel (with slug → not locked)", () => {
    const result = buildProfileMedia({
      viewerEntitled: true,
      media: [
        media({
          id: "prem-slug",
          purpose: "technique-highlight",
          techniqueSlug: "berimbolo",
          techniqueIsPremium: true,
        }),
      ],
    })

    expect(result.techniqueVideos[0].locked).toBe(false)
  })

  it("an ENTITLED viewer keeps a slug-less premium reel (not locked → not dropped, exposes url)", () => {
    const result = buildProfileMedia({
      viewerEntitled: true,
      media: [
        media({
          id: "prem-noslug",
          purpose: "technique-highlight",
          url: "https://r2.example.com/entitled-premium.mp4",
          techniqueSlug: null,
          techniqueIsPremium: true,
        }),
      ],
    })

    const item = result.techniqueVideos[0]
    expect(item).toBeDefined()
    expect(item.locked).toBe(false)
    expect(item.href).toBe("https://r2.example.com/entitled-premium.mp4")
    expect(item.external).toBe(true)
  })
})
