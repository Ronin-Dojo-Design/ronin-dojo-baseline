import { CalendarPlusIcon, ImagesIcon, PencilIcon } from "lucide-react"
import { redirect } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardFooter, CardHeader } from "~/components/common/card"
import { H6 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { findEditablePromotionEvents } from "~/server/web/promotion-events/editor-queries"

const formatEventDate = (date: Date) =>
  new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(date)

export async function DashboardEventsTab() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/auth/login?next=/app/profile")
  }

  const brand = await getRequestBrand()
  const events = await findEditablePromotionEvents({ brand, user: session.user })

  if (events.length === 0) {
    return (
      <Card hover={false}>
        <CardHeader direction="column" size="xs">
          <H6 render={props => <h2 {...props}>{props.children}</h2>}>No editable events</H6>
          <CardDescription>
            You do not have promotion event editor access for the current brand yet.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            size="sm"
            variant="secondary"
            prefix={<CalendarPlusIcon />}
            render={<Link href="/app/events/new" />}
          >
            New ceremony
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Stack direction="column" size="md" className="w-full">
      <Button
        size="sm"
        variant="secondary"
        prefix={<CalendarPlusIcon />}
        render={<Link href="/app/events/new" />}
      >
        New ceremony
      </Button>

      <div className="grid w-full gap-3 md:grid-cols-2">
        {events.map(event => (
          <Card key={event.id} hover={false}>
            <CardHeader direction="column" size="xs">
              <Stack size="xs" wrap>
                <Badge variant="outline" size="sm">
                  {formatEventDate(event.eventDate)}
                </Badge>
                {event.slug && (
                  <Badge variant="success" size="sm">
                    Published
                  </Badge>
                )}
              </Stack>
              <H6 render={props => <h2 {...props}>{props.children}</h2>}>{event.title}</H6>
              <CardDescription>
                {[event.hostOrganizationName, event.location].filter(Boolean).join(" · ") ||
                  "Promotion ceremony"}
              </CardDescription>
            </CardHeader>

            <Stack size="xs" wrap>
              <Note>{event.rankAwardCount} awards</Note>
              <Note>{event.photoCount} photos</Note>
            </Stack>

            <CardFooter className="mt-auto w-full justify-between">
              <Button
                size="sm"
                variant="secondary"
                prefix={<PencilIcon />}
                render={<Link href={`/app/events/${event.id}`} />}
              >
                Edit
              </Button>
              {event.slug && (
                <Button
                  size="sm"
                  variant="ghost"
                  prefix={<ImagesIcon />}
                  render={<Link href={`/events/${event.slug}`} />}
                >
                  Gallery
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </Stack>
  )
}
