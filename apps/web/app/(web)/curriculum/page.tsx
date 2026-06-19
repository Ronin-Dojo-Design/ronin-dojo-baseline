import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "~/components/common/button"
import { BjjCurriculumBrowser } from "~/components/web/curriculum/bjj-curriculum-browser"
import { BrandTypography, bblHeadingScopeClass } from "~/components/web/ui/brand-typography"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { getBjjCurriculumLibrary } from "~/server/web/curriculum/queries"

const PAGE_URL = "/curriculum"
const PAGE_TITLE = "BJJ Curriculum"
const PAGE_DESCRIPTION =
  "Browse the Black Belt Legacy Brazilian Jiu-Jitsu curriculum by rank level and topic."

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: PAGE_URL,
    metadata: { title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  })
}

export default async function CurriculumPage() {
  const brand = await getRequestBrand()
  const levels = await getBjjCurriculumLibrary(brand)

  if (levels.length === 0) {
    notFound()
  }

  return (
    <BrandTypography brand={brand} className={bblHeadingScopeClass}>
      <Breadcrumbs items={[{ url: PAGE_URL, title: PAGE_TITLE }]} />

      <Intro>
        <IntroTitle>{PAGE_TITLE}</IntroTitle>
        <IntroDescription>{PAGE_DESCRIPTION}</IntroDescription>
        <Button variant="secondary" render={<Link href="/techniques/graph" />}>
          Technique Graph
        </Button>
      </Intro>

      <Section className="md:block">
        <Section.Content className="md:col-span-3">
          <BjjCurriculumBrowser levels={levels} />
        </Section.Content>
      </Section>
    </BrandTypography>
  )
}
