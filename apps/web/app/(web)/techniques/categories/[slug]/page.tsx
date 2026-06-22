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
import { findCategory } from "~/server/web/categories/queries"

// SESSION_0396 — Tool→Listing parity: the technique category page mirrors
// app/(web)/categories/[slug]/page.tsx, swapping ToolQuery → TechniqueQuery. The shared
// Category model (slug-based directory taxonomy) now relates to Technique (see migration
// 20260616163546_add_listing_taxonomy), so the same page shape works for techniques.

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<SearchParams>
}

const buildCopy = (name: string, description?: string | null) => ({
  title: `${name} Techniques`,
  description:
    description ?? `A curated collection of ${name.toLowerCase()} techniques across the library.`,
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await findCategory({ where: { slug } })

  if (!category) {
    return {}
  }

  const { title, description } = buildCopy(category.name, category.description)
  return await getPageMetadata({
    url: `/techniques/categories/${slug}`,
    metadata: { title, description },
  })
}

export default async function ({ params, searchParams }: Props) {
  const { slug } = await params
  const category = await findCategory({ where: { slug } })

  if (!category) {
    notFound()
  }

  const url = `/techniques/categories/${slug}`
  const { title, description } = buildCopy(category.name, category.description)
  const placeholder = `Search ${title.toLowerCase()}…`

  return (
    <>
      <StructuredData data={createGraph([generateCollectionPage(url, title, description)])} />

      <Breadcrumbs
        items={[
          { url: "/techniques", title: "Technique Library" },
          { url, title: category.name },
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
          where={{ categories: { some: { slug: category.slug } } }}
          search={{ placeholder }}
          options={{ enableFilters: true, enableSort: true }}
        />
      </Suspense>
    </>
  )
}
