/**
 * SESSION_0527 Slice 0 — adversarial no-leak test for the per-video freemium gate
 * (`gateTechniqueMedia`). Proves the PAYLOAD-LAYER invariant (amended into memory
 * `profile-media-freemium-model-0525`): a locked premium attachment's playable url NEVER reaches an
 * unentitled viewer's payload — it is stripped server-side. Encodes the mixed free/premium capability
 * that whole-technique `Technique.isPremium` could not express.
 *
 * Pure function — no DB, no React, no session — so this file needs ZERO mocks.
 *
 * Run: cd apps/web && bun test server/web/techniques/technique-media-gate.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module
import { describe, expect, it } from "bun:test"
import {
  type GateInputAttachment,
  gateTechniqueMedia,
  hasPremiumTechniqueMedia,
} from "./technique-media-gate"

const PREMIUM_URL = "https://r2.example.com/premium-clip.mp4"
const FREE_URL = "https://r2.example.com/free-clip.mp4"

let seq = 0
function attachment(opts: { id: string; isPremium?: boolean; url?: string }): GateInputAttachment {
  seq += 1
  return {
    id: opts.id,
    isPremium: opts.isPremium ?? false,
    media: {
      type: "VIDEO",
      url: opts.url ?? `https://r2.example.com/asset-${seq}.mp4`,
      thumbnailUrl: null,
      title: null,
      mimeType: "video/mp4",
      altText: null,
    },
  }
}

// Collect every string value reachable in the gated payload — the leak assertion greps this.
function allStrings(value: unknown): string[] {
  if (typeof value === "string") return [value]
  if (Array.isArray(value)) return value.flatMap(allStrings)
  if (value && typeof value === "object") return Object.values(value).flatMap(allStrings)
  return []
}

describe("gateTechniqueMedia — per-video payload-layer no-leak", () => {
  it("unauth viewer + PREMIUM attachment → locked, and the raw url is STRIPPED from the payload", () => {
    const result = gateTechniqueMedia(
      [attachment({ id: "prem", isPremium: true, url: PREMIUM_URL })],
      false,
    )

    const tile = result.tiles[0]
    expect(tile.locked).toBe(true)
    // The type narrows a locked tile's media to poster-only — assert no url leaks at runtime too.
    expect("url" in tile.media).toBe(false)
    expect(allStrings(result).some(s => s.includes("premium-clip"))).toBe(false)
    expect(result.allLocked).toBe(true)
  })

  it("unauth viewer + FREE attachment → not locked, url present (plays)", () => {
    const result = gateTechniqueMedia(
      [attachment({ id: "free", isPremium: false, url: FREE_URL })],
      false,
    )

    const tile = result.tiles[0]
    expect(tile.locked).toBe(false)
    expect(tile.locked === false && tile.media.url).toBe(FREE_URL)
    expect(result.allLocked).toBe(false)
  })

  it("MIXED technique (one free + one premium) for an unauth viewer → free plays, premium url stripped", () => {
    const result = gateTechniqueMedia(
      [
        attachment({ id: "free", isPremium: false, url: FREE_URL }),
        attachment({ id: "prem", isPremium: true, url: PREMIUM_URL }),
      ],
      false,
    )

    const free = result.tiles.find(t => t.id === "free")!
    const prem = result.tiles.find(t => t.id === "prem")!
    expect(free.locked).toBe(false)
    expect(free.locked === false && free.media.url).toBe(FREE_URL)
    expect(prem.locked).toBe(true)
    // The whole payload contains the free url but NEVER the premium url.
    const strings = allStrings(result)
    expect(strings.some(s => s.includes("free-clip"))).toBe(true)
    expect(strings.some(s => s.includes("premium-clip"))).toBe(false)
    // Mixed → not all locked, so the watch page renders per-tile (not the single upgrade panel).
    expect(result.allLocked).toBe(false)
  })

  it("ENTITLED viewer + premium attachment → not locked, url present (unlocked)", () => {
    const result = gateTechniqueMedia(
      [attachment({ id: "prem", isPremium: true, url: PREMIUM_URL })],
      true,
    )

    const tile = result.tiles[0]
    expect(tile.locked).toBe(false)
    expect(tile.locked === false && tile.media.url).toBe(PREMIUM_URL)
  })

  it("allLocked is true ONLY when every tile is locked", () => {
    const allPremiumUnauth = gateTechniqueMedia(
      [attachment({ id: "a", isPremium: true }), attachment({ id: "b", isPremium: true })],
      false,
    )
    expect(allPremiumUnauth.allLocked).toBe(true)

    const empty = gateTechniqueMedia([], false)
    expect(empty.allLocked).toBe(false)
  })
})

describe("hasPremiumTechniqueMedia", () => {
  it("is true when any attachment is premium, false otherwise", () => {
    expect(hasPremiumTechniqueMedia([{ isPremium: false }, { isPremium: true }])).toBe(true)
    expect(hasPremiumTechniqueMedia([{ isPremium: false }, { isPremium: false }])).toBe(false)
    expect(hasPremiumTechniqueMedia([])).toBe(false)
  })
})
