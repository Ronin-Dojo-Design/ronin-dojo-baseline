import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { SearchParams } from "nuqs"
import { Suspense } from "react"
import { StructuredData } from "~/components/web/structured-data"
import { TechniqueListingSkeleton } from "~/components/web/techniques/technique-listing"
import { TechniqueQuery } from "~/components/web/techniques/technique-query"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Brand } from "~/.generated/prisma/client"
import { getPageMetadata } from "~/lib/pages"
import { createGraph, generateCollectionPage } from "~/lib/structured-data"
import { findTag } from "~/server/web/tags/queries"

// SESSION_0396 — Tool→Listing parity: technique tag page mirrors app/(web)/tags/[slug]/page.tsx,
// swapping ToolQuery → TechniqueQuery. Shared Tag relates to Technique (migration add_listing_taxonomy).

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<SearchParams>
}

const buildCopy = (name: string) => ({
  title: `${name} Techniques`,
  description: `Techniques tagged "${name}" across the library.`,
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tag = await findTag({ where: { slug } })

  if (!tag) {
    return {}
  }

  const { title, description } = buildCopy(tag.name)
  return await getPageMetadata({
    url: `/techniques/tags/${slug}`,
    metadata: { title, description },
  })
}

export default async function ({ params, searchParams }: Props) {
  const { slug } = await params
  const tag = await findTag({ where: { slug } })

  if (!tag) {
    notFound()
  }

  const url = `/techniques/tags/${slug}`
  const { title, description } = buildCopy(tag.name)
  const placeholder = `Search ${title.toLowerCase()}…`

  return (
    <>
      <StructuredData data={createGraph([generateCollectionPage(url, title, description)])} />

      <Breadcrumbs
        items={[
          { url: "/techniques", title: "Technique Library" },
          { url, title: tag.name },
        ]}
      />

      <Intro>
        <IntroTitle>{title}</IntroTitle>
        <IntroDescription className="max-w-3xl">{description}</IntroDescription>
      </Intro>

      <Suspense fallback={<TechniqueListingSkeleton />}>
        <TechniqueQuery
          searchParams={searchParams}
          brand={Brand.BBL}
          where={{ tags: { some: { slug: tag.slug } } }}
          search={{ placeholder }}
          options={{ enableFilters: true, enableSort: true }}
        />
      </Suspense>
    </>
  )
}
