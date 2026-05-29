import { notFound } from "next/navigation"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { OrgAccessDenied } from "~/components/web/organizations/org-access-denied"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { hasOrgAdminAccess } from "~/server/web/organization/org-admin-access"
import { getOrganizationBySlug } from "~/server/web/organization/queries"

interface Props {
  params: Promise<{ slug: string }>
}

const settingsSections = [
  {
    title: "General Info",
    description: "Edit your organization's name, description, and contact details.",
    href: "settings/general",
    icon: "🏷️",
  },
  {
    title: "Members",
    description: "Review pending join requests and view your organization's roster.",
    href: "settings/members",
    icon: "👥",
  },
  {
    title: "Invite Links",
    description: "Generate and manage shareable links for people to join your organization.",
    href: "settings/invites",
    icon: "🔗",
  },
  {
    title: "Theme & Branding",
    description: "Customize your dojo's colors, logo, and visual identity.",
    href: "settings/theme",
    icon: "🎨",
  },
]

export default async function OrgSettingsIndexPage({ params }: Props) {
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

  return (
    <>
      <Breadcrumbs
        items={[
          { url: "/organizations", title: "Organizations" },
          { url: `/organizations/${slug}`, title: org.name },
          { url: `/organizations/${slug}/settings`, title: "Settings" },
        ]}
      />

      <Intro>
        <IntroTitle>{org.name} — Settings</IntroTitle>
        <IntroDescription>Manage your organization's settings and customizations.</IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <Grid>
            {settingsSections.map(section => (
              <Card key={section.href} isRevealed>
                <CardHeader>
                  <Stack size="sm">
                    <span className="text-2xl">{section.icon}</span>
                    <H4>
                      <Link href={`/organizations/${slug}/${section.href}`}>
                        <span className="absolute inset-0 z-10" />
                        {section.title}
                      </Link>
                    </H4>
                  </Stack>
                </CardHeader>
                <CardDescription>{section.description}</CardDescription>
              </Card>
            ))}
          </Grid>
        </Section.Content>
      </Section>
    </>
  )
}
