import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
import { getPageMetadata } from "~/lib/pages"
import { findOrganizationSlugs, getOrganizationBySlug } from "~/server/web/organization/queries"
import { OrganizationDetail } from "./_components/organization-detail"
import { loadOrganizationDetail } from "./_components/organization-detail/organization-detail-data"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const orgs = await findOrganizationSlugs()
  return orgs.map(({ slug }) => ({ slug }))
}

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
