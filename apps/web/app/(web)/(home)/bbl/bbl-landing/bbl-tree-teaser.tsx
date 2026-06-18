import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { BBL_ROUTES, treeSection } from "../bbl-landing-content"
import { SectionHeading } from "./landing-chrome"

export const BblTreeTeaser = () => (
  <section className="w-full space-y-6 text-center">
    <SectionHeading
      eyebrow={treeSection.eyebrow}
      title={treeSection.title}
      description={treeSection.description}
    />
    <Button size="lg" variant="primary" render={<Link href={BBL_ROUTES.lineage} />}>
      {treeSection.ctaLabel}
    </Button>
  </section>
)
