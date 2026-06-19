import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPageMetadata } from "~/lib/pages"
import { findSchoolBySlug, findSchoolSlugs } from "~/server/web/schools/queries"
import { SchoolDetail } from "./_components/school-detail"
import { loadSchoolDetail } from "./_components/school-detail/school-detail-data"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const schools = await findSchoolSlugs()
  return schools.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const school = await findSchoolBySlug({ slug })

  if (!school) return { title: "School Not Found" }

  const locality = [school.city, school.state].filter(Boolean).join(", ")
  const description =
    school.description ??
    `${school.name}${locality ? ` — ${locality}` : ""}. ${school._count.memberships} member${
      school._count.memberships !== 1 ? "s" : ""
    }, ${school._count.programs} program${school._count.programs !== 1 ? "s" : ""}.`

  return await getPageMetadata({
    url: `/schools/${school.slug}`,
    metadata: {
      title: school.name,
      description,
    },
  })
}

export default async function SchoolDetailPage({ params }: Props) {
  const { slug } = await params
  const view = await loadSchoolDetail(slug)

  if (!view) notFound()

  return <SchoolDetail {...view} />
}
