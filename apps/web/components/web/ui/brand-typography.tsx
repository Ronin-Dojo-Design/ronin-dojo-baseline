import type { ComponentProps } from "react"
import { Brand } from "~/.generated/prisma/client"
import { bblBodyFont, bblHeadingFont } from "~/lib/fonts"
import { cx } from "~/lib/utils"

/**
 * Brand-aware typography scope for content / legal surfaces (privacy policy, the
 * DSR request form, cookies, terms). The CONSUMER passes the already-resolved
 * `brand`; the scope decides which font tokens to expose. A shared component must
 * never hardcode a single brand's font (ADR 0022 / component-launch-sweep step 2) —
 * it only consumes the tokens the consumer authorises.
 *
 * Under BBL it applies the `bblHeadingFont` / `bblBodyFont` `.variable` classes so
 * `--font-bbl-heading` / `--font-bbl-body` resolve inside the scope, then sets the
 * body font via the nested `var()` FALLBACK idiom (component-launch-sweep gotcha):
 * an undefined brand var degrades to the app token instead of dropping the whole
 * declaration and silently inheriting. Headings opt in explicitly with the exported
 * class constants below.
 *
 * Layout note: the `(web)` layout's `Wrapper` applies `gap-y-fluid-md` to its direct
 * children. Wrapping a page body in this scope collapses it to ONE Wrapper child, so
 * the scope reproduces that vertical rhythm internally (`flex flex-col gap-y-fluid-md`,
 * a spacing token — not a magic number).
 */

/**
 * Apply to a single heading element (e.g. `IntroTitle`). The trailing `!` beats the
 * heading primitive's baked-in `font-display` (tailwind-merge does not dedupe a custom
 * font-family group against an arbitrary `[font-family:…]`).
 */
export const bblHeadingFontClass = "[font-family:var(--font-bbl-heading,var(--font-display))]!"

/**
 * Apply to a container whose descendant headings should use the BBL heading font
 * (e.g. `Prose`, which sets no explicit heading font and would otherwise inherit the
 * scope's body font).
 */
export const bblProseHeadingFontClass =
  "[&_:is(h2,h3,h4)]:[font-family:var(--font-bbl-heading,var(--font-display))]!"

/**
 * Apply to a CONTAINER whose descendant headings (`h1`–`h4`) should use the BBL
 * heading font — for structured surfaces (an `Intro` title plus `Section` / `Card`
 * headings) that do NOT route through `Prose`. Same nested `var()` fallback + `!`
 * idiom as `bblHeadingFontClass`, but scoped to every descendant heading at once
 * instead of one element. Degrades to `--font-display` (the app heading token)
 * off-BBL, so a non-BBL brand renders identically to before the scope was added.
 */
export const bblHeadingScopeClass =
  "[&_:is(h1,h2,h3,h4)]:[font-family:var(--font-bbl-heading,var(--font-display))]!"

type BrandTypographyProps = ComponentProps<"div"> & { brand: Brand }

export const BrandTypography = ({ brand, className, ...props }: BrandTypographyProps) => {
  const isBbl = brand === Brand.BBL

  return (
    <div
      className={cx(
        "flex w-full flex-col gap-y-fluid-md",
        "[font-family:var(--font-bbl-body,var(--font-sans))]",
        isBbl && cx(bblHeadingFont.variable, bblBodyFont.variable),
        className,
      )}
      {...props}
    />
  )
}
