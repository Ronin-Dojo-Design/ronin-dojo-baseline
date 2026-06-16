import { Geist, Inter, Poppins } from "next/font/google"
import type { FontWeight } from "satori"

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
