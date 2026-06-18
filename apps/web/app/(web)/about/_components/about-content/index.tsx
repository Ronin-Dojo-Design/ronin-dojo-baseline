import { PolicyLayout, type PolicyPageProps } from "~/components/web/ui/policy-layout"
import { AboutBody } from "./body"

/**
 * Public orchestrator for the /about surface. Thin by design: it binds the body
 * copy to the shared policy chrome (same Intro + Prose shape as the privacy /
 * cookies / terms cluster). All section content lives in `AboutBody`; all
 * brand-font logic lives in `PolicyLayout` / `BrandTypography`. The folder barrel
 * is the only export. The route keeps the JSON-LD `StructuredData` as a sibling
 * after this layout.
 */
export const AboutContent = ({ brand, siteName, title, description }: PolicyPageProps) => {
  return (
    <PolicyLayout brand={brand} title={title} description={description}>
      <AboutBody siteName={siteName} />
    </PolicyLayout>
  )
}
