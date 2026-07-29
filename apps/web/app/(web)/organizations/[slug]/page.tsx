import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
import { getPageMetadata } from "~/lib/pages"
import { getOrganizationBySlug } from "~/server/web/organization/queries"
import { OrganizationDetail } from "./_components/organization-detail"
import { loadOrganizationDetail } from "./_components/organization-detail/organization-detail-data"

interface Props {
  params: Promise<{ slug: string }>
}

// Down-synced from rdd-monorepo SESSION_0718 (#14) — BBL live-prod P0. These public org
// lenses are auth-personalized (the claim CTA + owner/admin controls read the session), so
// they cannot be statically prerendered. With generateStaticParams + on-demand params, any
// org NOT in the last build's prerender set threw DYNAMIC_SERVER_USAGE (500) — breaking the
// claim front door for newly-created orgs until the next deploy. force-dynamic serves them
// per-request; still full SSR HTML, so SEO/crawlability is unaffected.
export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const org = await getOrganizationBySlug(Brand.BBL, slug)

  if (!org) return { title: "Organization Not Found" }

  return await getPageMetadata({
    url: `/organizations/${org.slug}`,
    metadata: {
      title: org.name,
      description: org.description ?? `${org.type} — ${org._count.memberships} members`,
    },
  })
}

export default async function OrganizationDetailPage({ params }: Props) {
  const { slug } = await params
  const view = await loadOrganizationDetail(slug)

  if (!view) notFound()

  return <OrganizationDetail {...view} />
}
