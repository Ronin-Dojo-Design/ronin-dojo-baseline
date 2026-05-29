import { notFound } from "next/navigation"
import { OrgAccessDenied } from "~/components/web/organizations/org-access-denied"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { findOrgSettings } from "~/server/admin/org-settings/queries"
import { getOrganizationBySlug } from "~/server/web/organization/queries"
import { db } from "~/services/db"
import { SelfServiceThemeForm } from "./_components/self-service-theme-form"

interface Props {
  params: Promise<{ slug: string }>
}

/** Check if user is org owner or has ORG_ADMIN role in the org */
async function hasOrgThemeAccess(userId: string, organizationId: string, ownerId: string) {
  if (userId === ownerId) return true

  const adminMembership = await db.membership.findFirst({
    where: {
      userId,
      organizationId,
      roleAssignments: {
        some: { role: { code: "ORG_ADMIN" } },
      },
    },
  })

  return !!adminMembership
}

export default async function OrgThemeSettingsPage({ params }: Props) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const [org, session] = await Promise.all([getOrganizationBySlug(brand, slug), getServerSession()])

  if (!org) notFound()
  if (!session?.user) notFound()

  const canEdit = await hasOrgThemeAccess(session.user.id, org.id, org.ownerId ?? "")

  if (!canEdit) {
    return (
      <Section>
        <OrgAccessDenied orgSlug={slug} />
      </Section>
    )
  }

  const settings = await findOrgSettings(org.id)

  return (
    <Section>
      <Breadcrumbs
        items={[
          { url: "/organizations", title: "Organizations" },
          { url: `/organizations/${slug}`, title: org.name },
          { url: `/organizations/${slug}/settings/theme`, title: "Theme Settings" },
        ]}
      />

      <Intro>
        <IntroTitle size="h2">{org.name} — Theme</IntroTitle>
        <IntroDescription>
          Customize your dojo&apos;s colors and branding. Empty fields inherit from the brand-level
          defaults.
        </IntroDescription>
      </Intro>

      <SelfServiceThemeForm
        organizationId={org.id}
        organizationName={org.name}
        settings={settings}
        className="max-w-2xl"
      />
    </Section>
  )
}
