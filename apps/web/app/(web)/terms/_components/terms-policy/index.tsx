import { PolicyLayout, type PolicyPageProps } from "~/components/web/ui/policy-layout"
import { PolicyBody } from "./policy-body"

/**
 * Public orchestrator for the Terms of Service surface. Thin by design: it binds the
 * (brand-agnostic) legal copy to the shared policy chrome. All section content lives
 * in `PolicyBody`; all brand-font logic lives in `PolicyLayout` / `BrandTypography`.
 * The folder barrel is the only export.
 */
export const TermsPolicy = ({ brand, siteName, title, description }: PolicyPageProps) => {
  return (
    <PolicyLayout brand={brand} title={title} description={description}>
      <PolicyBody siteName={siteName} />
    </PolicyLayout>
  )
}
