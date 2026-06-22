import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "~/components/common/button"
import { TechniqueGraph } from "~/components/web/techniques/technique-graph"
import { BrandTypography, bblHeadingScopeClass } from "~/components/web/ui/brand-typography"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { Brand } from "~/.generated/prisma/client"
import { getPageMetadata } from "~/lib/pages"
import { getBjjTechniqueGraph } from "~/server/web/techniques/graph-query"

const PAGE_URL = "/techniques/graph"
const PAGE_TITLE = "BJJ Technique Graph"
const PAGE_DESCRIPTION =
  "Explore Brazilian Jiu-Jitsu positions, submissions, transitions, counters, and their curriculum links."

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: PAGE_URL,
    metadata: { title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  })
}

export default async function TechniqueGraphPage() {
  const graph = await getBjjTechniqueGraph(Brand.BBL)

  if (graph.nodes.length === 0) {
    notFound()
  }

  return (
    <BrandTypography brand={Brand.BBL} className={bblHeadingScopeClass}>
      <Breadcrumbs
        items={[
          { url: "/techniques", title: "Techniques" },
          { url: PAGE_URL, title: PAGE_TITLE },
        ]}
      />

      <Intro>
        <IntroTitle>{PAGE_TITLE}</IntroTitle>
        <IntroDescription>{PAGE_DESCRIPTION}</IntroDescription>
        <Button variant="secondary" render={<Link href="/techniques" />}>
          Technique Library
        </Button>
      </Intro>

      <Section className="md:block">
        <Section.Content className="md:col-span-3">
          <TechniqueGraph graph={graph} />
        </Section.Content>
      </Section>
    </BrandTypography>
  )
}
