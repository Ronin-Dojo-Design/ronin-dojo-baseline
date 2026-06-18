import type { PropsWithChildren } from "react"
import type { Brand } from "~/.generated/prisma/client"
import { Prose } from "~/components/common/prose"
import {
  bblHeadingFontClass,
  bblProseHeadingFontClass,
  BrandTypography,
} from "~/components/web/ui/brand-typography"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"

/**
 * Shared props for a policy-page orchestrator (privacy / cookies / terms). The route
 * resolves the brand + metadata and hands them down; the brand name is interpolated
 * into the legal copy by the page's body component.
 */
export type PolicyPageProps = {
  /** Resolved request brand — drives which font tokens the typography scope exposes. */
  brand: Brand
  /** Brand display name interpolated into the legal copy. */
  siteName: string
  /** Page title (from page metadata). */
  title: string
  /** Page description (from page metadata). */
  description: string
}

type PolicyLayoutProps = PropsWithChildren<Pick<PolicyPageProps, "brand" | "title" | "description">>

/**
 * Shared chrome for the content/legal pages: the brand typography scope + intro
 * header + prose body. Consolidating it here keeps privacy / cookies / terms on one
 * structural seam (they previously hand-rolled the same `BrandTypography` + `Intro` +
 * `Prose` stack). The page passes the resolved brand and metadata; the legal copy is
 * the children.
 */
export const PolicyLayout = ({ brand, title, description, children }: PolicyLayoutProps) => {
  return (
    <BrandTypography brand={brand}>
      <Intro>
        <IntroTitle className={bblHeadingFontClass}>{title}</IntroTitle>
        <IntroDescription>{description}</IntroDescription>
      </Intro>

      <Prose className={bblProseHeadingFontClass}>{children}</Prose>
    </BrandTypography>
  )
}
