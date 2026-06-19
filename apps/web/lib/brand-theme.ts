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
