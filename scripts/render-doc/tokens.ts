/**
 * tokens.ts — RDD brand styling for the rendered doc artifact.
 *
 * Reads (never edits) the kernel's token shape from `packages/ui-kit/src/tokens/tokens.ts`
 * (`BrandTokenBlock` + `brandTokenCss`) and supplies RDD's literal values as the default brand for
 * this renderer (G-030 pinned decision). Values are traced to `apps/rdd/app/globals.css`'s
 * `--mk-*` bridge (RDD is dark-mode-first; that file's `:root` IS the token source, no separate
 * light mode) — read-only, not imported at runtime (apps/** is out of scope for this script).
 */

import { brandTokenCss, type BrandTokenBlock } from "../../packages/ui-kit/src/tokens/tokens"

/** RDD's brand block, traced to apps/rdd/app/globals.css `--mk-*` bridge. */
export const RDD_BRAND: BrandTokenBlock = {
  accent: "#3B82F6",
  accentStrong: "#2563EB",
  onAccent: "#0D0F12",
  bg: "#15181D",
  page: "#0D0F12",
  surface: "#15181D",
  elevated: "#1D2127",
  fg: "#F3F5F7",
  muted: "#9AA3AD",
  line: "#2A2F37",
}

/** RDD's type pair — traced to apps/rdd/app/globals.css `--font-display` / `--font-sans`. */
export const RDD_FONTS = {
  display: '"Saira","Bahnschrift","Arial Narrow",system-ui,sans-serif',
  sans: '"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',
  mono: "ui-monospace,SFMono-Regular,Menlo,monospace",
} as const

/** Emits the `:root` custom-property block this doc's stylesheet references (`var(--mk-*)`). */
export function rddTokenCss(): string {
  return `:root{${brandTokenCss(RDD_BRAND)};--mk-font-head:${RDD_FONTS.display};--mk-font-body:${RDD_FONTS.sans};--mk-font-mono:${RDD_FONTS.mono}}`
}
