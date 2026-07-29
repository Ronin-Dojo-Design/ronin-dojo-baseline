import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPageMetadata } from "~/lib/pages"
import { findSchoolBySlug } from "~/server/web/schools/queries"
import { SchoolDetail } from "./_components/school-detail"
import { loadSchoolDetail } from "./_components/school-detail/school-detail-data"

interface Props {
  params: Promise<{ slug: string }>
}

// Down-synced from rdd-monorepo SESSION_0718 (#14) — BBL live-prod P0. The school lens is
// auth-personalized (claim CTA + owner controls read the session), so it cannot be
// statically prerendered. With generateStaticParams + on-demand params, any school NOT in
// the last build's prerender set threw DYNAMIC_SERVER_USAGE (500) — breaking the claim front
// door for newly-created schools until the next deploy. force-dynamic serves them
// per-request; still full SSR HTML, so SEO/crawlability is unaffected.
export const dynamic = "force-dynamic"

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
