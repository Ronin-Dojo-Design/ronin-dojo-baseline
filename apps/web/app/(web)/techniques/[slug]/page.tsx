import { notFound } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
import { findTechniqueBySlug } from "~/server/web/techniques/queries"
import { TechniqueDetail } from "./_components/technique-detail"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function TechniqueDetailPage({ params }: PageProps) {
  const { slug } = await params
  const technique = await findTechniqueBySlug(slug, Brand.BBL)

  if (!technique) {
    notFound()
  }

  return <TechniqueDetail technique={technique} brand={Brand.BBL} />
}
