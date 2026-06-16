/**
 * Shared belt/brand color helpers for the cinematic lineage surfaces.
 *
 * Extracted from `lineage-view-a-island.tsx` (SESSION_0395) so the new
 * `LineageCohortTimeline` card and the island's focus panel read from one
 * source. Belt color is always `Rank.colorHex` data (never a brand-red literal);
 * `BBL.slate` is the neutral fallback for a null belt color, and `BBL.gold` is
 * confined to the secondary-link legend (Desi — gold is not a brand accent).
 */

export const BBL = {
  gold: "#f3c86a",
  slate: "#94a3b8",
} as const

export function hexToRgb(hex: string | null | undefined) {
  if (!hex) return null
  const normalized = hex.replace("#", "")
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null

  const value = Number.parseInt(normalized, 16)
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

export function rgba(hex: string | null | undefined, alpha: number, fallback: string = BBL.slate) {
  const rgb = hexToRgb(hex ?? fallback) ?? hexToRgb(fallback)!
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`
}

/**
 * WCAG relative luminance (sRGB). Used to clamp belt-glow bloom on bright belts
 * (white/yellow/coral) so they don't halo into an unreadable smear.
 */
export function relativeLuminance(hex: string | null | undefined): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const channel = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
}
