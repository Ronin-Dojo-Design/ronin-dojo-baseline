import type { ReactNode } from "react"
import { bblHeadingFontClass } from "~/components/web/ui/brand-typography"
import { cx } from "~/lib/utils"

/**
 * MeSectionEmpty — the shared "inviting empty state" for the `/me` Passport.
 *
 * Replaces the bare one-line `Note` placeholders ("No bio yet", "No promotions
 * recorded yet") with a structured, on-brand prompt: an icon medallion, a headline,
 * a short explanation, and an optional next-action CTA — so a brand-new member reads
 * the page as a guided "complete your Passport" flow rather than a list of blanks.
 *
 * PRESENTATION-ONLY and brand-neutral (ADR 0022): it carries no data and hardcodes no
 * brand palette. The headline opts into the BBL heading token via `bblHeadingFontClass`
 * so it reads in Poppins under the page's `BrandTypography` scope and degrades to the
 * app display font off-BBL. Mobile-first: the panel is full-width and stacks centered.
 *
 * The icon is passed already-rendered (e.g. `<MedalIcon />`) so this stays decoupled
 * from any single icon set; the medallion provides sizing/colour via the wrapper.
 */
export function MeSectionEmpty({
  icon,
  title,
  description,
  action,
  className,
}: {
  /** Pre-rendered lucide icon — sized to the medallion (`size-6`) by the caller. */
  icon: ReactNode
  title: string
  description: ReactNode
  /** Optional next-action CTA (a `Button` rendering a `Link`). */
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cx(
        "flex w-full flex-col items-center gap-3 rounded-lg border border-dashed bg-card/40 px-6 py-10 text-center",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-6"
      >
        {icon}
      </span>

      <div className="flex max-w-sm flex-col gap-1">
        <p className={cx("font-medium text-foreground", bblHeadingFontClass)}>{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      {action}
    </div>
  )
}
