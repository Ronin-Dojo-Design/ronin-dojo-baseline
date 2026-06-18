import type { ComponentProps } from "react"
import { Brand } from "~/.generated/prisma/client"
import { bblBodyFont, bblHeadingFont } from "~/lib/fonts"
import { cx } from "~/lib/utils"

/**
 * Brand-aware font scope.
 *
 * The root layout (`app/layout.tsx`) only ever attaches `fontSans.variable`, so the
 * BBL type tokens (`--font-bbl-heading` / `--font-bbl-body`) are undefined on a plain
 * content page — it renders the generic app font even under `data-brand="BBL"`. Wrap a
 * page body in `BrandTypography` to define those vars **only for `Brand.BBL`** (it
 * attaches `bblHeadingFont.variable` / `bblBodyFont.variable`); every other brand gets
 * no `.variable` class, so the body cleanly inherits the app font (zero regression).
 *
 * The scope element itself carries `flex flex-col gap-y-fluid-md` because it collapses
 * the page body to a single child of the `(web)`-layout `Wrapper` — without re-declaring
 * the token here the inter-section gap would be lost.
 *
 * Apply the fonts to descendants with the exported var()-**fallback** classes, never a
 * comma-list: an undefined `var()` with no fallback drops the whole `font-family`
 * declaration (silent system-font inherit off-BBL).
 */
type BrandTypographyProps = ComponentProps<"div"> & {
  brand: Brand
}

export const BrandTypography = ({ brand, className, ...props }: BrandTypographyProps) => {
  const isBbl = brand === Brand.BBL

  return (
    <div
      className={cx(
        "flex flex-col gap-y-fluid-md",
        // Brand body text inherits the BBL body var (falls back to the app sans token).
        bblBodyFontClass,
        isBbl && `${bblHeadingFont.variable} ${bblBodyFont.variable}`,
        className,
      )}
      {...props}
    />
  )
}

/**
 * Heading font class — overrides a heading primitive's baked-in `font-display`.
 * The `!` (Tailwind important) is load-bearing: `tailwind-merge` does NOT dedupe an
 * arbitrary `[font-family:…]` against the primitive's `font-display`, so without `!`
 * CSS source-order would decide and the primitive could win.
 */
export const bblHeadingFontClass = "[font-family:var(--font-bbl-heading,var(--font-display))]!"

/** Body font class — degrades to the app sans token when `--font-bbl-body` is undefined. */
const bblBodyFontClass = "[font-family:var(--font-bbl-body,var(--font-sans))]"

/**
 * Prose heading scope — re-points every heading inside a `Prose` block at the BBL
 * heading var. Targets `h1`–`h4` with `!` for the same source-order reason as above.
 */
export const bblProseHeadingFontClass =
  "[&_:is(h1,h2,h3,h4)]:[font-family:var(--font-bbl-heading,var(--font-display))]!"
