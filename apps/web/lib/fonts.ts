import { Geist, Inter, Poppins } from "next/font/google"
import type { FontWeight } from "satori"
import type { Brand } from "~/.generated/prisma/client"
import { cx } from "~/lib/utils"

// Geist is the app's neutral sans fallback. It is exposed as `--font-geist` (NOT
// `--font-sans`) so the Tailwind `--font-sans` theme token can resolve to the BBL
// body font (Inter) with Geist as the fallback, without a self-referential cycle
// (`--font-sans: var(--font-bbl-body, var(--font-geist))` in app/styles.css).
export const fontSans = Geist({
  variable: "--font-geist",
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
  brand === "BBL" ? cx(bblHeadingFont.variable, bblBodyFont.variable) : undefined

/**
 * Full BBL type scope for a PORTALED surface (a drawer / popup) that renders
 * outside the page's `<BrandTypography>` wrapper and so loses its font vars.
 * Unlike `brandFontVariables` (which only DEFINES the vars), this also CONSUMES
 * them — Inter body + Poppins descendant headings — via the nested `var()`
 * fallback idiom, so the surface degrades to the app fonts off the BBL var and a
 * non-BBL caller renders unchanged. (Heading rule mirrors `bblHeadingScopeClass`.)
 * Pass to a portal content's `className` / `contentClassName`.
 */
export const bblPortalTypographyClass = cx(
  bblHeadingFont.variable,
  bblBodyFont.variable,
  "[font-family:var(--font-bbl-body,var(--font-sans))]",
  "[&_:is(h1,h2,h3,h4)]:[font-family:var(--font-bbl-heading,var(--font-display))]!",
)

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
