import type { LineageAncestryEntry } from "~/server/web/lineage/ancestry"

/**
 * Pure model for the Lineage Journey scroll scenes (Epic A2-v1, SESSION_0498).
 *
 * No React, no "use client" — the palette cycle and the story-mode gate are pure
 * functions so the server component (`AncestrySection`) and the unit tests consume
 * them without pulling the motion slice.
 *
 * Palette cycle (operator direction, SESSION_0498 grill — verbatim three-variant
 * cycle, NOT a binary toggle): **black** bg / white text / red underlines →
 * **red** bg / white text / black underlines → **white** bg / black text / red
 * underlines → repeat. Red is always the brand `primary` token (BrandSettings DB
 * → `--color-primary`, never a hardcoded hex); black/white are the fixed cinematic
 * mono poles (theme-independent by design, like the BBL landing sections).
 */

export type ScenePalette = "black" | "red" | "white"

export const SCENE_PALETTE_CYCLE = [
  "black",
  "red",
  "white",
] as const satisfies readonly ScenePalette[]

/**
 * Palette for the scene at `index` in the walk sequence — a deterministic cycle
 * over {@link SCENE_PALETTE_CYCLE}. Indexes every rendered scene (story-rich AND
 * minimal node scenes), so the wall of sections alternates coherently.
 */
export const scenePaletteAt = (index: number): ScenePalette => {
  const length = SCENE_PALETTE_CYCLE.length
  return SCENE_PALETTE_CYCLE[((index % length) + length) % length]
}

/**
 * Story-mode gate: the scroll-driven scene sequence renders only when the chain is
 * a real up-chain (≥ 2 entries — the `AncestrySection` contract) AND at least one
 * entry carries an enabled story scene. Everyone else keeps today's
 * `LineageAncestryTimeline` untouched (data-gated rollout).
 */
export const chainHasStoryScenes = (entries: readonly LineageAncestryEntry[]): boolean =>
  entries.length >= 2 && entries.some(entry => entry.story !== undefined)

/**
 * One primitive × three token sets. Every class here is a palette-scoped design
 * token bundle consumed by `SceneShell` and the scene layouts — do NOT branch on
 * palette inside components; add a field here instead.
 */
export type ScenePaletteTokens = {
  /** Section background + base text color. */
  section: string
  /** Accent underline (text-decoration color) on display type. */
  underline: string
  /** Secondary / muted copy on this background. */
  muted: string
  /** Legibility overlay over the full-bleed hero media. */
  overlay: string
  /** Monogram fallback panel (no hero image — avatars never go full-bleed). */
  monogram: string
  /** Ring color for the profile owner's avatar on this background. */
  ownerRing: string
  /**
   * Owner-chip overrides layered onto `<Badge variant="primary">`. On black/white
   * the primary chip stands (red on mono — only the theme-dependent
   * `text-background` is pinned to white; the poles are theme-independent). On
   * red, primary vanishes into the section (red-on-red) → a white outline chip.
   */
  badge: string
}

export const scenePaletteTokens: Record<ScenePalette, ScenePaletteTokens> = {
  black: {
    section: "bg-neutral-950 text-white",
    underline: "decoration-primary",
    muted: "text-white/70",
    overlay: "bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent",
    monogram: "bg-neutral-900 text-white/20",
    ownerRing: "ring-primary",
    badge: "text-white",
  },
  red: {
    section: "bg-primary text-white",
    underline: "decoration-neutral-950",
    // /90 not /75 — AA for small text on the brand red (Desi A2 P2).
    muted: "text-white/90",
    overlay: "bg-gradient-to-t from-black/60 via-black/15 to-transparent",
    monogram: "bg-white/10 text-white/25",
    ownerRing: "ring-white",
    badge: "bg-transparent border-white/70 text-white",
  },
  white: {
    section: "bg-white text-neutral-950",
    underline: "decoration-primary",
    muted: "text-neutral-950/60",
    overlay: "bg-gradient-to-t from-white/80 via-white/20 to-transparent",
    monogram: "bg-neutral-100 text-neutral-950/15",
    ownerRing: "ring-primary",
    badge: "text-white",
  },
}
