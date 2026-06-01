import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H6 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { getPromotionEventEditorData } from "~/server/web/promotion-events/editor-queries"
import { PromotionEventEditorForm } from "../promotion-event-editor-form"

type Props = {
  params: Promise<{ eventId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params

  return await getPageMetadata({
    url: `/dashboard/events/${eventId}`,
    metadata: {
      title: "Edit Promotion Event",
      robots: { index: false, follow: false },
    },
  })
}

export default async function EditPromotionEventPage({ params }: Props) {
  const { eventId } = await params
  const url = `/dashboard/events/${eventId}`
  const session = await getServerSession()

  if (!session?.user) {
    redirect(`/auth/login?next=${url}`)
  }

  const brand = await getRequestBrand()
  const data = await getPromotionEventEditorData({ brand, user: session.user, eventId })

  if (!data?.event) {
    notFound()
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { url: "/dashboard", title: "Dashboard" },
          { url, title: data.event.title },
        ]}
      />

      <Intro>
        <IntroTitle>{data.event.title}</IntroTitle>
        <IntroDescription>Edit promotion ceremony metadata and award links.</IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <PromotionEventEditorForm
            event={data.event}
            hostOrganizations={data.hostOrganizations}
            rankAwards={data.rankAwards}
          />
        </Section.Content>
        <Section.Sidebar>
          <Card hover={false}>
            <CardHeader direction="column" size="xs">
              <H6 render={props => <h2 {...props}>{props.children}</h2>}>Public gallery</H6>
              <CardDescription>
                The public event page remains read-only; saved dashboard changes update its source data.
              </CardDescription>
            </CardHeader>
            <Stack direction="column" size="xs" className="w-full">
              {data.event.slug && (
                <Button variant="secondary" size="sm" render={<Link href={`/events/${data.event.slug}`} />}>
                  Open gallery
                </Button>
              )}
              <Button variant="ghost" size="sm" render={<Link href="/dashboard" />}>
                Back to dashboard
              </Button>
            </Stack>
          </Card>
        </Section.Sidebar>
      </Section>
    </>
  )
}
