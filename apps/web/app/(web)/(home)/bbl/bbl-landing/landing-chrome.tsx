import { CheckIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { Button } from "~/components/common/button"
import { H2 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Prose } from "~/components/common/prose"
import { cx } from "~/lib/utils"
import { BBL_ROUTES } from "../bbl-landing-content"

/**
 * Shared chrome for the BBL landing module — the small presentational pieces every
 * section composes (heading block, the register CTA pair, a checklist row) plus the
 * two reused surface-class recipes. Module-private: only the section files in this
 * folder import it.
 */

/** Card-panel + float-on-hover surface recipes (token-only: `primary`, `card`). */
export const BBL_SECTION_CLASSES =
  "relative w-full rounded-xl md:rounded-[2rem] border border-primary/10 bg-gradient-to-br from-card via-card to-primary/5 p-5 shadow-sm md:p-8"
export const BBL_FLOAT_CLASSES =
  "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:transform-none"

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow: string
  title: string
  description?: string
  align?: "center" | "left"
  className?: string
}) => (
  <div className={cx("w-full space-y-3", align === "center" && "text-center", className)}>
    <p className="text-xs uppercase tracking-[0.24em] text-primary font-semibold">{eyebrow}</p>
    <H2>{title}</H2>
    {description && (
      <Prose className={cx("max-w-3xl text-muted-foreground", align === "center" && "mx-auto")}>
        {description}
      </Prose>
    )}
  </div>
)

export const RegisterButtons = ({
  size = "lg",
}: {
  size?: ComponentProps<typeof Button>["size"]
}) => (
  <div className="flex flex-col sm:flex-row gap-3 justify-center">
    <Button size={size} variant="primary" render={<Link href={BBL_ROUTES.register} />}>
      Register Now
    </Button>
    <Button size={size} variant="secondary" render={<Link href={BBL_ROUTES.moreInfo} />}>
      More Info
    </Button>
  </div>
)

export const CheckRow = ({ title, children }: { title?: string; children: ReactNode }) => (
  <div className="flex gap-3 rounded-xl border bg-card p-4">
    <CheckIcon className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
    <div className="space-y-0.5">
      {title && <p className="font-medium">{title}</p>}
      <p className={cx("text-sm", title ? "text-muted-foreground" : "")}>{children}</p>
    </div>
  </div>
)

/**
 * Brand logo over the cinematic media panels: `BrandSettings.logoUrl` (DB) with a
 * null-safe fallback to a styled brand wordmark — the recipe's logo rule (never a
 * hardcoded logo asset path). Sits on a dark scrim, so the wordmark uses the on-media
 * token + the BBL heading font.
 */
export const MediaBrandmark = ({
  logoUrl,
  brandName,
}: {
  logoUrl: string | null
  brandName: string
}) =>
  logoUrl ? (
    <img src={logoUrl} alt={brandName} className="h-14 md:h-20 mx-auto object-contain" />
  ) : (
    <p className="mx-auto text-2xl md:text-3xl font-extrabold italic uppercase tracking-[0.02em] text-on-media [font-family:var(--font-bbl-heading)]">
      {brandName}
    </p>
  )
