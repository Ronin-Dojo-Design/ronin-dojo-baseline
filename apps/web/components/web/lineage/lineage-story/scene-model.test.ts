// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import type { LineageAncestryEntry, LineageStorySceneView } from "~/server/web/lineage/ancestry"
import {
  SCENE_PALETTE_CYCLE,
  chainHasStoryScenes,
  scenePaletteAt,
  scenePaletteTokens,
} from "./scene-model"

/**
 * Epic A2-v1 (SESSION_0498) — pins the pure scene model: the operator-ratified
 * three-variant palette cycle (black → red → white → repeat, verbatim grill
 * clarification) and the story-mode gate that keeps every chain without a scene
 * on today's `LineageAncestryTimeline` (data-gated rollout).
 */

const storyView = (overrides: Partial<LineageStorySceneView> = {}): LineageStorySceneView => ({
  quote: "You either win or you learn.",
  storyBio: null,
  heroImageUrl: null,
  enabled: true,
  ...overrides,
})

const entry = (overrides: Partial<LineageAncestryEntry> = {}): LineageAncestryEntry => ({
  nodeId: `node-${Math.random().toString(36).slice(2, 10)}`,
  slug: null,
  displayName: "Test Member",
  avatarUrl: null,
  rank: null,
  disciplineLabel: null,
  narrative: null,
  ...overrides,
})

describe("scenePaletteAt — the three-variant cycle", () => {
  it("cycles black → red → white → repeat by chain position", () => {
    expect(scenePaletteAt(0)).toBe("black")
    expect(scenePaletteAt(1)).toBe("red")
    expect(scenePaletteAt(2)).toBe("white")
    expect(scenePaletteAt(3)).toBe("black")
    expect(scenePaletteAt(4)).toBe("red")
    expect(scenePaletteAt(5)).toBe("white")
  })

  it("maps a full walk deterministically (founder-first order)", () => {
    // The Cub Swanson local chain shape: Sr → Jr → Rigan → member.
    const walk = [entry(), entry(), entry(), entry()]
    expect(walk.map((_, index) => scenePaletteAt(index))).toEqual([
      "black",
      "red",
      "white",
      "black",
    ])
  })

  it("has a complete token set for every palette in the cycle", () => {
    for (const palette of SCENE_PALETTE_CYCLE) {
      const tokens = scenePaletteTokens[palette]
      expect(tokens).toBeDefined()
      for (const value of Object.values(tokens)) {
        expect(typeof value).toBe("string")
        expect(value.length).toBeGreaterThan(0)
      }
    }
  })

  it("gives the red palette a contrasting (non-primary-bg) owner chip", () => {
    // Badge variant="primary" is bg-primary — invisible on the red section.
    // The red badge token must knock the bg out and outline in white; the mono
    // poles keep the primary chip, pinning only the theme-dependent text color.
    expect(scenePaletteTokens.red.badge).toContain("bg-transparent")
    expect(scenePaletteTokens.red.badge).toContain("border-white/70")
    expect(scenePaletteTokens.red.badge).toContain("text-white")
    expect(scenePaletteTokens.black.badge).not.toContain("bg-")
    expect(scenePaletteTokens.white.badge).not.toContain("bg-")
  })

  it("keeps red-palette muted copy at AA small-text contrast", () => {
    expect(scenePaletteTokens.red.muted).toBe("text-white/90")
  })

  it("keeps red as the brand primary token, never a hardcoded hex", () => {
    // Brand color SoT is the BrandSettings DB → --color-primary (repo law).
    const allTokenClasses = SCENE_PALETTE_CYCLE.flatMap(palette =>
      Object.values(scenePaletteTokens[palette]),
    ).join(" ")
    expect(allTokenClasses).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(scenePaletteTokens.red.section).toContain("bg-primary")
    expect(scenePaletteTokens.black.underline).toContain("decoration-primary")
    expect(scenePaletteTokens.white.underline).toContain("decoration-primary")
  })
})

describe("chainHasStoryScenes — the story-mode gate", () => {
  it("is false for an empty chain", () => {
    expect(chainHasStoryScenes([])).toBe(false)
  })

  it("is false for a single entry even when it carries a scene", () => {
    // < 2 entries is not a real up-chain — the AncestrySection contract.
    expect(chainHasStoryScenes([entry({ story: storyView() })])).toBe(false)
  })

  it("is false when no entry carries a scene", () => {
    expect(chainHasStoryScenes([entry(), entry(), entry()])).toBe(false)
  })

  it("is true when any entry carries a scene, regardless of position", () => {
    expect(chainHasStoryScenes([entry({ story: storyView() }), entry()])).toBe(true)
    expect(chainHasStoryScenes([entry(), entry({ story: storyView() })])).toBe(true)
    expect(chainHasStoryScenes([entry(), entry({ story: storyView() }), entry()])).toBe(true)
  })
})
