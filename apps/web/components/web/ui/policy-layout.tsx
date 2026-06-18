import type { ReactNode } from "react"
import type { Brand } from "~/.generated/prisma/client"
import { Prose } from "~/components/common/prose"
import {
  BrandTypography,
  bblHeadingFontClass,
  bblProseHeadingFontClass,
} from "~/components/web/ui/brand-typography"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { cx } from "~/lib/utils"

/**
 * Shared chrome for content / legal pages (about, terms, privacy, cookies): the
 * `BrandTypography` font scope + `Intro` header + `Prose` body, all brand-tokenized.
 *
 * The body prose is passed verbatim as `children` (each page owns its own copy — the
 * distinct legal/marketing prose is NEVER abstracted in here, only the chrome). Anything
 * non-visual that must live outside the prose (e.g. `<StructuredData>`) is passed as
 * `afterContent`, kept inside the brand scope.
 */
export type PolicyPageProps = {
  brand: Brand
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  afterContent?: ReactNode
}

export const PolicyLayout = ({
  brand,
  title,
  description,
  children,
  afterContent,
}: PolicyPageProps) => {
  return (
    <BrandTypography brand={brand}>
      <Intro>
        <IntroTitle className={cx(bblHeadingFontClass)}>{title}</IntroTitle>
        {description ? <IntroDescription>{description}</IntroDescription> : null}
      </Intro>

      <Prose className={cx(bblProseHeadingFontClass)}>{children}</Prose>

      {afterContent}
    </BrandTypography>
  )
}
