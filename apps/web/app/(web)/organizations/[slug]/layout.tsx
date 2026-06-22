import { notFound } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
import { brandThemeCss } from "~/lib/brand-theme"
import { getOrganizationBySlug } from "~/server/web/organization/queries"

interface Props {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

export default async function OrganizationLayout({ params, children }: Props) {
  const { slug } = await params
  const org = await getOrganizationBySlug(Brand.BBL, slug)

  if (!org) notFound()

  // Runtime --color-* override from OrgSettings (null = inherit from BrandSettings),
  // HSL-guarded via the shared helper — same path the root [data-brand] layout uses.
  const orgCss = brandThemeCss(`[data-org="${org.id}"]`, org.orgSettings)

  return (
    <>
      {orgCss && <style dangerouslySetInnerHTML={{ __html: orgCss }} />}
      <div data-org={org.id}>{children}</div>
    </>
  )
}
