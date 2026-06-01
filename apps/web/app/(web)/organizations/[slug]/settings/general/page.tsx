import { notFound } from "next/navigation"
import { MediaAttachmentManager } from "~/components/web/media/media-attachment-manager"
import { OrgAccessDenied } from "~/components/web/organizations/org-access-denied"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getDashboardMediaAttachments } from "~/server/web/media/queries"
import { hasOrgAdminAccess } from "~/server/web/organization/org-admin-access"
import { getOrganizationBySlug } from "~/server/web/organization/queries"
import { OrgGeneralInfoForm } from "./_components/org-general-info-form"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function OrgGeneralSettingsPage({ params }: Props) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const [org, session] = await Promise.all([getOrganizationBySlug(brand, slug), getServerSession()])

  if (!org) notFound()
  if (!session?.user) notFound()

  const canAccess = await hasOrgAdminAccess(session.user.id, org.id)

  if (!canAccess) {
    return (
      <Section>
        <OrgAccessDenied orgSlug={slug} />
      </Section>
    )
  }

  const mediaAttachments =
    (await getDashboardMediaAttachments({
      brand,
      user: session.user,
      target: { kind: "organization", id: org.id },
    })) ?? []

  return (
    <>
      <Breadcrumbs
        items={[
          { url: "/organizations", title: "Organizations" },
          { url: `/organizations/${slug}`, title: org.name },
          { url: `/organizations/${slug}/settings`, title: "Settings" },
          { url: `/organizations/${slug}/settings/general`, title: "General" },
        ]}
      />

      <Intro>
        <IntroTitle>{org.name} — General Info</IntroTitle>
        <IntroDescription>
          Edit your organization's name, description, and contact details.
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <OrgGeneralInfoForm organization={org} />
        </Section.Content>
      </Section>

      <Section>
        <Section.Content>
          <MediaAttachmentManager
            target={{ kind: "organization", id: org.id }}
            initialAttachments={mediaAttachments}
            title="Organization media"
            description="Logos, photos, or video for your organization. Public items appear on your public pages."
          />
        </Section.Content>
      </Section>
    </>
  )
}
