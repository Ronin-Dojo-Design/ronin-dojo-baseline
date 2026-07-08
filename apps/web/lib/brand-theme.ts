/**
 * Shared brand/org theme-token injection.
 *
 * Builds a scoped CSS rule that overrides the design-system `--color-*` tokens
 * from DB-driven settings (`BrandSettings` for the root `[data-brand]` shell,
 * `OrgSettings` for an `[data-org]` subtree). One definition for both call sites
 * (`app/layout.tsx` + `app/(web)/organizations/[slug]/layout.tsx`).
 *
 * SECURITY: every value is validated HSL-safe before interpolation. These strings
 * are emitted via `dangerouslySetInnerHTML` into a `<style>`, so an unguarded DB
 * value would be a CSS-injection seam (closed in SESSION_0416 — the brand path
 * previously injected raw).
 *
 * Pure string builder — no Prisma/runtime import; edge- and browser-safe.
 */

/** Only allow HSL-component characters (digits, spaces, dots, commas, %, /). */
export const isHslSafe = (value: string): boolean => /^[\d.\s,/%]+$/.test(value)

/**
 * HSL color as separate components — the shape `react-colorful`'s `HslColorPicker`
 * consumes/emits (`{ h, s, l }`, hue 0–360, saturation/lightness 0–100).
 */
export interface HslColor {
  h: number
  s: number
  l: number
}

/** Matches the stored triplet form `"234 98% 61%"` (hue, S%, L% — no `hsl()` wrapper). */
const HSL_TRIPLET_RE = /^\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s*$/

/**
 * Parse a stored HSL triplet (`"234 98% 61%"`) into components, or `null` when the
 * value is empty/malformed. Total (never throws) — callers treat `null` as "no color".
 */
export const parseHslTriplet = (value: string): HslColor | null => {
  const match = HSL_TRIPLET_RE.exec(value)
  if (!match) return null
  return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) }
}

/**
 * Format HSL components back into the stored triplet form. Components are rounded to
 * integers; the output is always `isHslSafe` (digits, spaces, `%` only).
 */
export const formatHslTriplet = (c: HslColor): string =>
  `${Math.round(c.h)} ${Math.round(c.s)}% ${Math.round(c.l)}%`

export interface ThemeColorSettings {
  primaryColor?: string | null
  primaryFgColor?: string | null
  accentColor?: string | null
  accentFgColor?: string | null
}

/** DB color field → CSS custom property. */
const TOKEN_MAP: ReadonlyArray<readonly [field: keyof ThemeColorSettings, token: string]> = [
  ["primaryColor", "--color-primary"],
  ["primaryFgColor", "--color-primary-foreground"],
  ["accentColor", "--color-accent"],
  ["accentFgColor", "--color-accent-foreground"],
]

/**
 * Build a scoped theme-override CSS rule from settings, or `""` if there is
 * nothing safe to override. `scopeSelector` is author-controlled (e.g.
 * `[data-brand="BBL"]` or `[data-org="<id>"]`); every settings value is HSL-guarded.
 */
export const brandThemeCss = (
  scopeSelector: string,
  settings: ThemeColorSettings | null | undefined,
): string => {
  if (!settings) return ""

  const overrides: string[] = []
  for (const [field, token] of TOKEN_MAP) {
    const value = settings[field]
    if (value && isHslSafe(value)) overrides.push(`${token}: hsl(${value});`)
  }

  return overrides.length ? `${scopeSelector} { ${overrides.join(" ")} }` : ""
}
