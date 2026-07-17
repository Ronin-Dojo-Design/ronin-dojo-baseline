import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
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
        <Stack direction="row" size="sm" className="items-center">
          <IntroTitle>{PAGE_TITLE}</IntroTitle>
          <Badge variant="caution" size="md">
            Beta
          </Badge>
        </Stack>
        <IntroDescription>{PAGE_DESCRIPTION}</IntroDescription>
        <Note>Beta preview — the graph is usable now while we refine its interactions.</Note>
        <Stack direction="row" size="xs">
          <Button variant="secondary" render={<Link href="/techniques" />}>
            Technique Library
          </Button>
          <Button variant="secondary" render={<Link href="/curriculum" />}>
            BJJ Curriculum
          </Button>
        </Stack>
      </Intro>

      <Section className="md:block">
        <Section.Content className="md:col-span-3">
          <TechniqueGraph graph={graph} />
        </Section.Content>
      </Section>
    </BrandTypography>
  )
}
