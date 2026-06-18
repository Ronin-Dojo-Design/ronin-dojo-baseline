import { Prose } from "~/components/common/prose"
import {
  bblHeadingFontClass,
  bblProseHeadingFontClass,
  BrandTypography,
} from "~/components/web/ui/brand-typography"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { PolicyBody } from "./policy-body"
import type { PrivacyPolicyProps } from "./privacy-policy.types"

export type { PrivacyPolicyProps } from "./privacy-policy.types"

/**
 * Public orchestrator for the Privacy Policy surface. Thin by design: it resolves
 * the brand typography scope, composes the intro + prose chrome, and renders the
 * (brand-agnostic) legal copy. All section content lives in `PolicyBody`; all
 * brand-font logic lives in `BrandTypography`. The folder barrel is the only export.
 */
export const PrivacyPolicy = ({ brand, siteName, title, description }: PrivacyPolicyProps) => {
  return (
    <BrandTypography brand={brand}>
      <Intro>
        <IntroTitle className={bblHeadingFontClass}>{title}</IntroTitle>
        <IntroDescription>{description}</IntroDescription>
      </Intro>

      <Prose className={bblProseHeadingFontClass}>
        <PolicyBody siteName={siteName} />
      </Prose>
    </BrandTypography>
  )
}
