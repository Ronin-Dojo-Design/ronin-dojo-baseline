import type { Metadata } from "next"
import type { SearchParams } from "nuqs"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { TechniquesIndex } from "./_components/techniques-index"

const PAGE_URL = "/techniques"
const PAGE_TITLE = "Technique Library"
const PAGE_DESCRIPTION = "Browse techniques by category, position, and discipline."

type PageProps = {
  searchParams: Promise<SearchParams>
}

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: PAGE_URL,
    metadata: { title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  })
}

export default async function TechniquesPage({ searchParams }: PageProps) {
  const brand = await getRequestBrand()

  return (
    <TechniquesIndex
      searchParams={searchParams}
      brand={brand}
      url={PAGE_URL}
      title={PAGE_TITLE}
      description={PAGE_DESCRIPTION}
    />
  )
}
