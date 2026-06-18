import { Geist, Inter, Poppins } from "next/font/google"
import type { FontWeight } from "satori"
import { Brand } from "~/.generated/prisma/client"
import { cx } from "~/lib/utils"

export const fontSans = Geist({
  variable: "--font-sans",
  display: "swap",
  subsets: ["latin"],
  weight: "variable",
})

/**
 * Black Belt Legacy brand type system (from the legacy `BlackBeltLegacyLanding.jsx`):
 * Poppins italic extrabold uppercase headings + Inter body.
 *
 * Shared so every brand surface (the BBL landing page and the cinematic lineage
 * explorer) loads ONE font instance and speaks the same visual language — never a
 * per-component `Poppins()` call (DRY; SESSION_0394 Desi HIGH). Apply via the
 * `.variable` className on a wrapper, then target headings with
 * `[font-family:var(--font-bbl-heading)]`.
 */
export const bblHeadingFont = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-bbl-heading",
})

export const bblBodyFont = Inter({ subsets: ["latin"], variable: "--font-bbl-body" })

/**
 * The brand type seam (component-launch-sweep recipe step 2). Returns the
 * `.variable` classes that DEFINE `--font-bbl-heading` / `--font-bbl-body` for
 * the BBL brand, and `undefined` for every other brand (which keep the app
 * `--font-display` / `--font-sans`). Apply to a wrapper so descendants that read
 * `var(--font-bbl-heading, var(--font-display))` inherit Poppins on BBL and
 * degrade to the app font elsewhere — the consumer provides the tokens, the
 * shared component only consumes them (never re-couples to one brand).
 *
 * Pair with a `display: contents` wrapper so the vars cascade without adding a
 * layout box (the page's section rhythm is unaffected).
 */
export const brandFontVariables = (brand: Brand): string | undefined =>
  brand === Brand.BBL ? cx(bblHeadingFont.variable, bblBodyFont.variable) : undefined

export const loadGoogleFont = async (font: string, weight: FontWeight) => {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}`
  const css = await (await fetch(url)).text()
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)

  if (resource) {
    const response = await fetch(resource[1])
    if (response.status === 200) {
      return await response.arrayBuffer()
    }
  }

  throw new Error("failed to load font data")
}
