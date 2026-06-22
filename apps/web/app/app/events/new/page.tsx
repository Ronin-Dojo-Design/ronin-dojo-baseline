import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H6 } from "~/components/common/heading"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { Brand } from "~/.generated/prisma/client"
import { getPageMetadata } from "~/lib/pages"
import { getPromotionEventEditorData } from "~/server/web/promotion-events/editor-queries"
import { PromotionEventEditorForm } from "~/app/(web)/dashboard/events/promotion-event-editor-form"

const url = "/app/events/new"

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url,
    metadata: {
      title: "New Promotion Event",
      robots: { index: false, follow: false },
    },
  })
}

export default async function NewPromotionEventPage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect(`/auth/login?next=${url}`)
  }

  const data = await getPromotionEventEditorData({ brand: Brand.BBL, user: session.user })

  if (!data?.canCreate) {
    notFound()
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { url: "/app/profile", title: "Dashboard" },
          { url, title: "New Promotion Event" },
        ]}
      />

      <Intro>
        <IntroTitle>New Promotion Event</IntroTitle>
        <IntroDescription>Create a ceremony record for the current brand.</IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <PromotionEventEditorForm
            event={null}
            hostOrganizations={data.hostOrganizations}
            rankAwards={data.rankAwards}
          />
        </Section.Content>
        <Section.Sidebar>
          <Card hover={false}>
            <CardHeader direction="column" size="xs">
              <H6 render={props => <h2 {...props}>{props.children}</h2>}>Scope</H6>
              <CardDescription>
                Write access is resolved from admin, organization, and lineage editor grants.
              </CardDescription>
            </CardHeader>
          </Card>
        </Section.Sidebar>
      </Section>
    </>
  )
}
