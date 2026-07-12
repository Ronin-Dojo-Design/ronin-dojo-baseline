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
import { type AuthoredCurriculumTechnique, buildProfileMedia } from "./profile-media"

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
    isPremium: false,
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
          isPremium: false,
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
          isPremium: false,
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
          isPremium: true,
        }),
      ],
    })

    const item = result.techniqueVideos[0]
    expect(item.locked).toBe(true)
    expect(item.external).toBe(false)
    expect(item.href).toBe("/techniques/berimbolo")
    // The raw playable url NEVER reaches the client for a locked premium reel.
    expect(item.href).not.toContain("r2.example.com")
    // SESSION_0529 review fix (Doug P2-2): a LOCKED tile ships NO poster at all.
    expect(item.thumbnailUrl).toBeNull()
  })

  it("P2-2: a LOCKED YOUTUBE reel ships NO poster (the thumbnail embeds the video id = the watch URL)", () => {
    const result = buildProfileMedia({
      viewerEntitled: false,
      media: [
        media({
          id: "prem-yt",
          type: "YOUTUBE",
          url: YT,
          purpose: "technique-highlight",
          techniqueSlug: "berimbolo",
          isPremium: true,
        }),
      ],
    })

    const item = result.techniqueVideos[0]
    expect(item.locked).toBe(true)
    expect(item.thumbnailUrl).toBeNull()
    // Nothing in the shaped output carries the YouTube id (which reconstructs the watch URL).
    expect(JSON.stringify(result)).not.toContain("dQw4w9WgXcQ")
    // …while the SAME reel for an ENTITLED viewer keeps its derived poster.
    const entitled = buildProfileMedia({
      viewerEntitled: true,
      media: [
        media({
          id: "prem-yt",
          type: "YOUTUBE",
          url: YT,
          purpose: "technique-highlight",
          techniqueSlug: "berimbolo",
          isPremium: true,
        }),
      ],
    })
    expect(entitled.techniqueVideos[0].thumbnailUrl).toBe(YT_THUMB)
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
          isPremium: true,
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
          isPremium: true,
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
          isPremium: true,
        }),
      ],
    })

    const item = result.techniqueVideos[0]
    expect(item).toBeDefined()
    expect(item.locked).toBe(false)
    expect(item.href).toBe("https://r2.example.com/entitled-premium.mp4")
    expect(item.external).toBe(true)
  })

  it("curriculum defaults to an EMPTY rail when no curriculum input is provided (pre-3B callers)", () => {
    const result = buildProfileMedia({ viewerEntitled: false, media: [] })
    expect(result.curriculum).toEqual([])
  })

  it("MIXED per-video: a free reel + a premium reel for the same unauth viewer (free plays, premium locked)", () => {
    const result = buildProfileMedia({
      viewerEntitled: false,
      media: [
        media({
          id: "mix-free",
          purpose: "technique-highlight",
          techniqueSlug: "hip-escape",
          isPremium: false,
        }),
        media({
          id: "mix-prem",
          purpose: "technique-highlight",
          url: "https://r2.example.com/mixed-premium.mp4",
          techniqueSlug: "invisible-collar",
          isPremium: true,
        }),
      ],
    })

    const free = result.techniqueVideos.find(i => i.id === "mix-free")!
    const prem = result.techniqueVideos.find(i => i.id === "mix-prem")!
    // Per-video (SESSION_0527): the two reels on one profile gate INDEPENDENTLY — the technique-level
    // flag could not express this. Free plays; premium locks + withholds its raw url.
    expect(free.locked).toBe(false)
    expect(prem.locked).toBe(true)
    expect(prem.href).toBe("/techniques/invisible-collar")
    const allHrefs = [...result.featuredMatches, ...result.techniqueVideos, ...result.podcasts].map(
      i => i.href,
    )
    expect(allHrefs.some(href => href.includes("mixed-premium"))).toBe(false)
  })
})

describe("buildProfileMedia — curriculum rail (SESSION_0529 Slice 3B, ADR 0046)", () => {
  // Fixture factory — one authored technique; each case overrides the axis it exercises.
  let techSeq = 0
  function authoredTechnique(
    partial: Partial<AuthoredCurriculumTechnique>,
  ): AuthoredCurriculumTechnique {
    techSeq += 1
    return {
      id: `tech_${techSeq}`,
      name: "Armbar From Guard",
      slug: "armbar-from-guard",
      attachments: [],
      ...partial,
    }
  }

  const curriculumOf = (techniques: AuthoredCurriculumTechnique[], viewerEntitled = false) =>
    buildProfileMedia({
      viewerEntitled,
      media: [],
      curriculum: { profileSlug: "bob-bass", techniques },
    }).curriculum

  it("maps a technique to a profile-scoped INTERNAL watch link (no url field on the item)", () => {
    const items = curriculumOf([
      authoredTechnique({
        id: "t1",
        name: "Berimbolo",
        slug: "berimbolo",
        attachments: [
          {
            isPremium: false,
            url: "https://youtu.be/dQw4w9WgXcQ",
            thumbnailUrl: null,
          },
        ],
      }),
    ])

    expect(items).toHaveLength(1)
    const item = items[0]
    expect(item.title).toBe("Berimbolo")
    expect(item.href).toBe("/directory/bob-bass/techniques/berimbolo")
    expect(item.external).toBe(false)
    expect(item.subtitle).toBe("Technique")
    // Poster derives from the YouTube url when no stored thumbnail exists.
    expect(item.thumbnailUrl).toBe(YT_THUMB)
    // No-leak shape: ProfileMediaItem has no `url` field by design.
    expect("url" in item).toBe(false)
  })

  it("locks a technique whose clips are ALL premium for an unentitled viewer", () => {
    const items = curriculumOf([
      authoredTechnique({
        attachments: [
          { isPremium: true, url: "https://r2.example.com/prem-1.mp4", thumbnailUrl: null },
          { isPremium: true, url: "https://r2.example.com/prem-2.mp4", thumbnailUrl: null },
        ],
      }),
    ])

    expect(items[0].locked).toBe(true)
    // The raw playable url never reaches the shaped item (an R2 clip has no derivable poster →
    // the card falls back to its placeholder, NEVER the raw url).
    expect(JSON.stringify(items)).not.toContain("r2.example.com")
  })

  it("P2-2: a LOCKED curriculum card ships NO poster (YouTube thumb would leak the video id)", () => {
    const lockedItems = curriculumOf([
      authoredTechnique({
        attachments: [
          // First clip is a YouTube premium clip WITH a stored poster — both must be withheld.
          {
            isPremium: true,
            url: "https://youtu.be/dQw4w9WgXcQ",
            thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
          },
        ],
      }),
    ])
    expect(lockedItems[0].locked).toBe(true)
    expect(lockedItems[0].thumbnailUrl).toBeNull()
    expect(JSON.stringify(lockedItems)).not.toContain("dQw4w9WgXcQ")

    // The SAME technique for an entitled viewer is UNLOCKED but still poster-less: rail poster
    // candidates are FREE clips only (viewer-independent policy — a premium clip's id never
    // surfaces on a rail card for anyone; the entitled viewer plays it on the watch page).
    const entitledItems = curriculumOf(
      [
        authoredTechnique({
          attachments: [
            {
              isPremium: true,
              url: "https://youtu.be/dQw4w9WgXcQ",
              thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
            },
          ],
        }),
      ],
      true,
    )
    expect(entitledItems[0].locked).toBe(false)
    expect(entitledItems[0].thumbnailUrl).toBeNull()
  })

  it("does NOT lock when ANY clip is free (the viewer has something to watch)", () => {
    const items = curriculumOf([
      authoredTechnique({
        attachments: [
          { isPremium: true, url: "https://r2.example.com/prem.mp4", thumbnailUrl: null },
          { isPremium: false, url: "https://youtu.be/dQw4w9WgXcQ", thumbnailUrl: null },
        ],
      }),
    ])

    expect(items[0].locked).toBe(false)
  })

  it("does NOT lock a technique with zero clips (nothing to gate)", () => {
    const items = curriculumOf([authoredTechnique({ attachments: [] })])
    expect(items[0].locked).toBe(false)
    expect(items[0].thumbnailUrl).toBeNull()
  })

  it("an ENTITLED viewer sees an all-premium technique unlocked", () => {
    const items = curriculumOf(
      [
        authoredTechnique({
          attachments: [
            { isPremium: true, url: "https://r2.example.com/prem.mp4", thumbnailUrl: null },
          ],
        }),
      ],
      true,
    )
    expect(items[0].locked).toBe(false)
  })

  it("prefers the stored thumbnail over the derived YouTube poster", () => {
    const items = curriculumOf([
      authoredTechnique({
        attachments: [
          {
            isPremium: false,
            url: "https://youtu.be/dQw4w9WgXcQ",
            thumbnailUrl: "https://r2.example.com/custom-poster.jpg",
          },
        ],
      }),
    ])
    expect(items[0].thumbnailUrl).toBe("https://r2.example.com/custom-poster.jpg")
  })
})

describe("buildProfileMedia — curriculum poster comes from FREE clips only (P2-2 hardening)", () => {
  it("an UNLOCKED mixed technique derives its poster from the first FREE clip, never a premium one", () => {
    const items = buildProfileMedia({
      viewerEntitled: false,
      media: [],
      curriculum: {
        profileSlug: "bob-bass",
        techniques: [
          {
            id: "t-mixed",
            name: "Flying Armbar",
            slug: "flying-armbar",
            attachments: [
              // Premium clip FIRST in teaching order — its id must not surface on the card.
              {
                isPremium: true,
                url: "https://youtu.be/jNQXAC9IVRw",
                thumbnailUrl: "https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg",
              },
              { isPremium: false, url: YT, thumbnailUrl: null },
            ],
          },
        ],
      },
    }).curriculum

    expect(items[0].locked).toBe(false)
    // Poster derives from the FREE clip…
    expect(items[0].thumbnailUrl).toBe(YT_THUMB)
    // …and the premium clip's id never reaches the shaped rail.
    expect(JSON.stringify(items)).not.toContain("jNQXAC9IVRw")
  })
})
