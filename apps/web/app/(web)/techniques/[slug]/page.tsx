import { notFound } from "next/navigation"
import { getRequestBrand } from "~/lib/brand-context"
import { findTechniqueBySlug } from "~/server/web/techniques/queries"
import { TechniqueDetail } from "./_components/technique-detail"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function TechniqueDetailPage({ params }: PageProps) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const technique = await findTechniqueBySlug(slug, brand)

  if (!technique) {
    notFound()
  }

  return <TechniqueDetail technique={technique} brand={brand} />
}
